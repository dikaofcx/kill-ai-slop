import fs from 'node:fs';
import path from 'node:path';
import { DEFAULTS, RULES, RULE_IDS, SUPPORTED_EXTS, iconImports } from './rules.mjs';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt', '.svelte-kit', 'coverage', 'vendor', '.cache']);
const MAX_BYTES = 1_000_000;
const MAX_CONFIG_BYTES = 65_536;
const SEVERITIES = new Set(['off', 'warn', 'error']);

export const toPosix = (p) => p.split(path.sep).join('/');

export function loadConfig(dir, explicitPath) {
  const file = explicitPath ?? path.join(dir, '.killslop.json');
  let user = {};
  if (fs.existsSync(file)) {
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`${file}: config must be a regular file`);
    if (stat.size > MAX_CONFIG_BYTES) throw new Error(`${file}: config exceeds ${MAX_CONFIG_BYTES} bytes`);
    try {
      user = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      throw new Error(`${file}: invalid JSON (${err.message})`);
    }
  } else if (explicitPath) {
    throw new Error(`${explicitPath}: config file not found`);
  }
  if (!user || typeof user !== 'object' || Array.isArray(user)) throw new Error(`${file}: config must be a JSON object`);
  const userRules = user.rules ?? {};
  if (!userRules || typeof userRules !== 'object' || Array.isArray(userRules)) throw new Error(`${file}: "rules" must be an object`);
  const config = { ...DEFAULTS, ...user, rules: { ...userRules } };
  for (const [id, sev] of Object.entries(config.rules)) {
    if (!RULE_IDS.includes(id)) throw new Error(`${file}: unknown rule "${id}"`);
    if (!SEVERITIES.has(sev)) throw new Error(`${file}: rule "${id}" must be "off", "warn" or "error"`);
  }
  if (!Array.isArray(config.ignore) || !config.ignore.every((glob) => typeof glob === 'string')) {
    throw new Error(`${file}: "ignore" must be an array of glob strings`);
  }
  if (!Array.isArray(config.spacingScale) || !config.spacingScale.every((value) => Number.isFinite(value) && value >= 0)) {
    throw new Error(`${file}: "spacingScale" must be an array of finite non-negative numbers`);
  }
  const numericBounds = [['shadowBlurMax', 0], ['radiusMinPx', 0], ['motionMinMs', 0], ['motionMaxMs', 0]];
  for (const [key, minimum] of numericBounds) {
    if (!Number.isFinite(config[key]) || config[key] < minimum) throw new Error(`${file}: "${key}" must be a finite number >= ${minimum}`);
  }
  for (const key of ['radiusRepeat', 'centerRepeat']) {
    if (!Number.isInteger(config[key]) || config[key] < 1) throw new Error(`${file}: "${key}" must be a positive integer`);
  }
  if (config.motionMaxMs < config.motionMinMs) throw new Error(`${file}: "motionMaxMs" must be >= "motionMinMs"`);
  return config;
}

function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        i++;
        if (glob[i + 1] === '/') { i++; re += '(?:.*/)?'; } else re += '.*';
      } else re += '[^/]*';
    } else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

export function walk(targets, cwd, ignoreGlobs) {
  const ignore = ignoreGlobs.map(globToRegExp);
  const isIgnored = (rel) => ignore.some((re) => re.test(rel));
  const files = [];
  const isWithin = (child, parent) => {
    const relative = path.relative(parent, child);
    return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
  };
  // A file named on the command line is always linted; ignore globs only
  // filter what a directory walk discovers.
  const visit = (abs, explicit = false) => {
    const rel = toPosix(path.relative(cwd, abs)) || '.';
    const stat = fs.lstatSync(abs);
    if (stat.isSymbolicLink()) {
      if (explicit) throw new Error(`${rel}: refusing to follow a symbolic link`);
      return;
    }
    if (!(explicit && stat.isFile()) && rel !== '.' && isIgnored(rel)) return;
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(path.basename(abs))) return;
      for (const name of fs.readdirSync(abs).sort()) visit(path.join(abs, name));
    } else if (stat.isFile()) {
      const ext = path.extname(abs).slice(1).toLowerCase();
      if (SUPPORTED_EXTS.has(ext) && stat.size <= MAX_BYTES) files.push(abs);
    }
  };
  for (const t of targets) {
    const abs = path.resolve(cwd, t);
    if (!fs.existsSync(abs)) throw new Error(`${t}: no such file or directory`);
    if (isWithin(abs, cwd)) {
      const rootStat = fs.lstatSync(cwd);
      if (rootStat.isSymbolicLink()) throw new Error(`${toPosix(path.relative(cwd, abs) || '.')}: refusing a symbolic project directory`);
      let current = cwd;
      for (const part of path.relative(cwd, abs).split(path.sep).filter(Boolean)) {
        current = path.join(current, part);
        if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`${toPosix(path.relative(cwd, current))}: refusing to follow a symbolic link`);
      }
    }
    visit(abs, true);
  }
  return [...new Set(files)];
}

export function readTextFile(abs) {
  const before = fs.lstatSync(abs);
  if (!before.isFile() || before.isSymbolicLink()) throw new Error(`${abs}: refusing to read a non-regular file`);
  if (before.size > MAX_BYTES) throw new Error(`${abs}: file exceeds ${MAX_BYTES} bytes`);
  const noFollow = fs.constants.O_NOFOLLOW ?? 0;
  const descriptor = fs.openSync(abs, fs.constants.O_RDONLY | noFollow);
  try {
    const opened = fs.fstatSync(descriptor);
    if (!opened.isFile() || opened.size > MAX_BYTES || opened.dev !== before.dev || opened.ino !== before.ino) {
      throw new Error(`${abs}: file changed during lint; refusing to read`);
    }
    return fs.readFileSync(descriptor, 'utf8');
  } finally {
    fs.closeSync(descriptor);
  }
}

function suppressions(text) {
  const file = { all: false, ids: new Set() };
  const byLine = new Map(); // line -> { all, ids }
  const add = (line, ids) => {
    const cur = byLine.get(line) ?? { all: false, ids: new Set() };
    if (ids.length) ids.forEach((i) => cur.ids.add(i)); else cur.all = true;
    byLine.set(line, cur);
  };
  text.split('\n').forEach((line, i) => {
    const m = /killslop-disable-(file|next-line|line)\b/.exec(line);
    if (!m) return;
    const tail = line.slice(m.index + m[0].length).split(/-->|\*\//)[0];
    const ids = (tail.match(/[a-z][a-z0-9]*(?:-[a-z0-9]+)*/g) ?? []).filter((t) => RULE_IDS.includes(t));
    if (m[1] === 'file') { if (ids.length) ids.forEach((x) => file.ids.add(x)); else file.all = true; }
    else add(m[1] === 'line' ? i + 1 : i + 2, ids);
  });
  return { file, byLine };
}

const isSuppressed = (sup, rule, line) => {
  if (sup.file.all || sup.file.ids.has(rule)) return true;
  const l = sup.byLine.get(line);
  return Boolean(l && (l.all || l.ids.has(rule)));
};

function posFn(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return (idx) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= idx) lo = mid; else hi = mid - 1;
    }
    return { line: lo + 1, col: idx - starts[lo] + 1 };
  };
}

export function lintText(text, ext, config, file = '<input>') {
  const sup = suppressions(text);
  if (sup.file.all) return { findings: [], icons: [] };
  const pos = posFn(text);
  const ctx = { text, ext, config, pos };
  const findings = [];
  for (const rule of RULES) {
    const severity = config.rules[rule.id] ?? rule.severity;
    if (severity === 'off' || rule.scope === 'project' || !rule.exts.includes(ext)) continue;
    for (const f of rule.check(ctx)) {
      if (isSuppressed(sup, rule.id, f.line)) continue;
      findings.push({ file, rule: rule.id, severity, line: f.line, col: f.col, message: f.message });
    }
  }
  const iconRule = RULES.find((r) => r.id === 'icon-mix');
  const iconSeverity = config.rules['icon-mix'] ?? iconRule.severity;
  const icons = iconSeverity === 'off' || !iconRule.exts.includes(ext)
    ? []
    : iconImports(text)
        .map((i) => ({ file, ...pos(i.idx), family: i.family }))
        .filter((i) => !isSuppressed(sup, 'icon-mix', i.line));
  return { findings, icons };
}

export function lintFiles(files, config, cwd) {
  const findings = [];
  const icons = [];
  for (const abs of files) {
    const rel = toPosix(path.relative(cwd, abs));
    const ext = path.extname(abs).slice(1).toLowerCase();
    const result = lintText(readTextFile(abs), ext, config, rel);
    findings.push(...result.findings);
    icons.push(...result.icons);
  }
  const families = [...new Set(icons.map((i) => i.family))];
  if (families.length > 1) {
    const second = icons.find((i) => i.family !== icons[0].family);
    const severity = config.rules['icon-mix'] ?? 'warn';
    findings.push({
      file: second.file, rule: 'icon-mix', severity, line: second.line, col: second.col,
      message: `Mixed icon sets: ${families.join(', ')}. Review consistency, semantics, and accessibility; multiple sets can be intentional when they serve distinct needs.`,
    });
  }
  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.col - b.col || a.rule.localeCompare(b.rule));
  return findings;
}

export const summarize = (findings) => ({
  errors: findings.filter((f) => f.severity === 'error').length,
  warnings: findings.filter((f) => f.severity === 'warn').length,
});
