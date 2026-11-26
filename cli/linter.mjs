#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { installSkills } from './lib/install.mjs';
import { RULES, SUPPORTED_EXTS } from './lib/rules.mjs';
import { lintFiles, lintText, loadConfig, readTextFile, summarize, toPosix, walk } from './lib/lint.mjs';
import { contrastRatio, parseColor } from './lib/color.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.basename(here) === 'cli' ? path.dirname(here) : here;
const pkg = JSON.parse(fs.readFileSync(path.join(here, 'package.json'), 'utf8'));
const MAX_HOOK_INPUT = 65_536;
const MAX_HOOK_FILE = 1_000_000;

const HELP = `Kill AI Slop linter ${pkg.version}

Usage:
  node cli/index.mjs lint [paths...] [--format text|json|github] [--strict]
                           [--max-warnings N] [--config file]
  node cli/index.mjs hook                 Claude Code PostToolUse advisory
  node cli/index.mjs init --agent <name|all> [--global] [--force] [--dry-run]
  node cli/index.mjs rules                List heuristic rules
  node cli/index.mjs contrast <fg> <bg>   WCAG contrast ratio
  node cli/index.mjs --version

Agents for init: claude, codex, cursor, cline, qoder, opencode, gemini, antigravity
--force is a compatibility alias for --replace; conflicts are backed up, never deleted.

Exit codes: 0 no blocking findings, 1 threshold exceeded, 2 usage or input error.
Findings are heuristics, not design verdicts. Suppress a justified signal with
killslop-disable-line, killslop-disable-next-line, or killslop-disable-file,
optionally followed by rule ids.
`;

class UsageError extends Error {}

function parseArgs(argv, spec) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const [name, inline] = arg.slice(2).split('=', 2);
    const kind = spec[name];
    if (!kind) throw new UsageError(`unknown option --${name}`);
    if (kind === 'bool') flags[name] = true;
    else {
      const value = inline ?? argv[++i];
      if (value === undefined || value.startsWith('--')) throw new UsageError(`--${name} needs a value`);
      flags[name] = value;
    }
  }
  return { flags, positional };
}

function formatText(findings, fileCount) {
  const lines = findings.map((finding) =>
    `${finding.file}:${finding.line}:${finding.col}  ${finding.severity.padEnd(5)}  ${finding.rule}  ${finding.message}`,
  );
  const { errors, warnings } = summarize(findings);
  lines.push('', `${fileCount} file${fileCount === 1 ? '' : 's'} checked: ${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}.`);
  return lines.join('\n');
}

const ghEscape = (value) => value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const ghProp = (value) => ghEscape(value).replace(/:/g, '%3A').replace(/,/g, '%2C');

function formatGithub(findings) {
  return findings.map((finding) =>
    `::${finding.severity === 'error' ? 'error' : 'warning'} file=${ghProp(finding.file)},line=${finding.line},col=${finding.col},title=${ghProp(finding.rule)}::${ghEscape(finding.message)}`,
  ).join('\n');
}

function cmdLint(argv) {
  const { flags, positional } = parseArgs(argv, { format: 'value', strict: 'bool', 'max-warnings': 'value', config: 'value' });
  const format = flags.format ?? 'text';
  if (!['text', 'json', 'github'].includes(format)) throw new UsageError('--format must be text, json or github');
  let maxWarnings = Infinity;
  if (flags['max-warnings'] !== undefined) {
    maxWarnings = Number(flags['max-warnings']);
    if (!Number.isInteger(maxWarnings) || maxWarnings < 0) throw new UsageError('--max-warnings must be a non-negative integer');
  }
  const cwd = process.cwd();
  let files;
  let findings;
  try {
    const config = loadConfig(cwd, flags.config ? path.resolve(cwd, flags.config) : undefined);
    files = walk(positional.length ? positional : ['.'], cwd, config.ignore);
    findings = lintFiles(files, config, cwd);
  } catch (error) {
    throw new UsageError(error.message);
  }
  const { errors, warnings } = summarize(findings);

  if (format === 'json') {
    console.log(JSON.stringify({ version: pkg.version, files: files.length, summary: { errors, warnings }, findings }, null, 2));
  } else if (format === 'github') {
    if (findings.length) console.log(formatGithub(findings));
  } else {
    console.log(formatText(findings, files.length));
  }
  return errors > 0 || (flags.strict && warnings > 0) || warnings > maxWarnings ? 1 : 0;
}

async function readStdin(limit = MAX_HOOK_INPUT) {
  const chunks = [];
  let length = 0;
  for await (const chunk of process.stdin) {
    length += chunk.length;
    if (length > limit) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function hookContext(message) {
  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: message,
    },
  })}\n`);
}

function isWithin(child, parent) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function cmdHook() {
  try {
    const raw = await readStdin();
    if (!raw) return 0;
    let input;
    try { input = JSON.parse(raw); } catch { return 0; }
    const toolInput = input?.tool_input ?? {};
    const target = toolInput.file_path ?? toolInput.path;
    if (typeof target !== 'string') return 0;

    const cwd = path.resolve(typeof input.cwd === 'string' ? input.cwd : process.cwd());
    const abs = path.resolve(cwd, target);
    if (!isWithin(abs, cwd) || !SUPPORTED_EXTS.has(path.extname(abs).slice(1).toLowerCase())) return 0;
    const cwdReal = fs.realpathSync(cwd);
    const stat = fs.lstatSync(abs);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_HOOK_FILE) return 0;
    const real = fs.realpathSync(abs);
    if (!isWithin(real, cwdReal)) return 0;
    const config = loadConfig(cwd);
    const ext = path.extname(abs).slice(1).toLowerCase();
    const rel = toPosix(path.relative(cwdReal, real));
    const { findings } = lintText(readTextFile(real), ext, config, rel);
    if (findings.length) {
      hookContext(
        `Kill AI Slop lint advisory for ${rel}: these are static pattern signals, not design verdicts. Review each against product, brand, accessibility, and user intent; only change findings that represent a real issue.\n` +
        findings.map((finding) => `- ${finding.line}:${finding.col} ${finding.rule}: ${finding.message}`).join('\n'),
      );
    }
  } catch (error) {
    // Hooks must not block edits when input, path, permissions, config, or output are unavailable.
    try { console.error(`kill-ai-slop hook skipped: ${error.message}`); } catch { /* stay non-blocking */ }
  }
  return 0;
}

const home = os.homedir();
const AGENTS = {
  claude: { project: '.claude/skills', global: path.join(home, '.claude', 'skills') },
  codex: { project: '.codex/skills', global: path.join(home, '.codex', 'skills') },
  cursor: { project: '.cursor/skills', global: path.join(home, '.cursor', 'skills'), rules: '.cursor/rules/killslop.mdc' },
  cline: { project: '.cline/skills', global: path.join(home, '.cline', 'skills') },
  qoder: { project: '.qoder/skills', global: path.join(home, '.qoder', 'skills') },
  opencode: { project: '.opencode/skills', global: path.join(home, '.config', 'opencode', 'skills') },
  gemini: { project: '.gemini/skills', global: path.join(home, '.gemini', 'skills') },
  antigravity: { project: '.agents/skills', global: null },
};

function assertNoSymlinkComponents(rootDir, target) {
  const rootAbs = path.resolve(rootDir);
  const targetAbs = path.resolve(target);
  if (!isWithin(targetAbs, rootAbs)) throw new Error(`Target keluar dari direktori proyek: ${targetAbs}`);
  let current = rootAbs;
  const rootStat = fs.existsSync(current) ? fs.lstatSync(current) : null;
  if (rootStat?.isSymbolicLink()) throw new Error(`Direktori proyek tidak boleh symlink: ${rootAbs}`);
  for (const part of path.relative(rootAbs, targetAbs).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (!fs.existsSync(current)) continue;
    if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Symlink tidak diikuti: ${current}`);
  }
}

function assessCursorRule(source, destination, replace, cwd) {
  assertNoSymlinkComponents(cwd, destination);
  if (!fs.existsSync(destination)) return { source, destination, action: 'write' };
  const stat = fs.lstatSync(destination);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Target rule bukan file biasa: ${destination}`);
  if (fs.readFileSync(source).equals(fs.readFileSync(destination))) return { source, destination, action: 'unchanged' };
  if (!replace) throw new Error(`Konflik pada ${destination}; tinjau dulu atau gunakan --replace untuk membuat backup.`);
  return { source, destination, action: 'replace' };
}

function applyCursorRule(item, cwd) {
  if (item.action === 'unchanged') return;
  assertNoSymlinkComponents(cwd, item.destination);
  fs.mkdirSync(path.dirname(item.destination), { recursive: true });
  if (item.action === 'replace') {
    const backupRoot = path.join(cwd, '.kill-ai-slop-backups', `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`);
    const backup = path.join(backupRoot, 'cursor-rules', 'killslop.mdc');
    assertNoSymlinkComponents(cwd, backup);
    fs.mkdirSync(path.dirname(backup), { recursive: true });
    fs.copyFileSync(item.destination, backup, fs.constants.COPYFILE_EXCL);
    console.log(`backup ${backup}`);
  }
  const temporary = `${item.destination}.tmp-${randomUUID()}`;
  try {
    fs.copyFileSync(item.source, temporary, fs.constants.COPYFILE_EXCL);
    fs.renameSync(temporary, item.destination);
  } finally {
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
  }
}

async function cmdInit(argv) {
  const { flags } = parseArgs(argv, { agent: 'value', global: 'bool', force: 'bool', replace: 'bool', 'dry-run': 'bool' });
  if (!flags.agent) throw new UsageError(`--agent is required (${Object.keys(AGENTS).join(', ')}, all)`);
  const names = flags.agent === 'all' ? Object.keys(AGENTS) : flags.agent.split(',').map((name) => name.trim()).filter(Boolean);
  for (const name of names) if (!AGENTS[name]) throw new UsageError(`unknown agent "${name}"`);

  const replace = Boolean(flags.force || flags.replace);
  const cwd = process.cwd();
  const sourceRoot = path.join(root, 'skills');
  const targets = [];
  const cursorRules = [];
  for (const name of [...new Set(names)]) {
    const agent = AGENTS[name];
    if (flags.global && !agent.global) {
      if (flags.agent === 'all') {
        console.log(`skip   ${name} (no global skills folder known)`);
        continue;
      }
      throw new UsageError(`${name} has no known global skills folder; run without --global`);
    }
    const target = flags.global ? agent.global : path.resolve(cwd, agent.project);
    targets.push({ name, target });
    if (name === 'cursor' && !flags.global) {
      const ruleSource = path.join(root, 'rules', 'killslop.mdc');
      const ruleTarget = path.resolve(cwd, agent.rules);
      cursorRules.push(assessCursorRule(ruleSource, ruleTarget, replace, cwd));
    }
  }

  // Preflight every destination before writing anything.
  const preflights = [];
  for (const item of targets) {
    const result = await installSkills({ sourceRoot, target: item.target, dryRun: true, replace });
    preflights.push({ ...item, result });
  }
  let skillFiles = 0;
  for (const { name, result } of preflights) {
    const count = result.plan.filter((item) => item.action !== 'unchanged').length;
    skillFiles += count;
    console.log(`${flags['dry-run'] ? 'would install' : 'install'} ${name}: ${count} file${count === 1 ? '' : 's'} to ${result.plan[0]?.destinationFile ? path.dirname(path.dirname(result.plan[0].destinationFile)) : 'skill target'}`);
  }
  for (const item of cursorRules) {
    console.log(`${flags['dry-run'] ? 'would copy' : 'copy'} ${item.destination} (${item.action})`);
  }
  if (flags['dry-run']) {
    console.log(`Dry run: ${skillFiles} skill file${skillFiles === 1 ? '' : 's'} planned; no files written.`);
    return 0;
  }
  for (const item of preflights) {
    const result = await installSkills({ sourceRoot, target: item.target, replace });
    if (result.backupRoot) console.log(`backup ${result.backupRoot}`);
  }
  for (const item of cursorRules) applyCursorRule(item, cwd);
  console.log('Installation complete. Existing conflicts are backed up when --replace/--force is used.');
  return 0;
}

function cmdRules() {
  const width = Math.max(...RULES.map((rule) => rule.id.length));
  for (const rule of RULES) console.log(`${rule.id.padEnd(width)}  ${rule.severity.padEnd(5)}  ${rule.summary}`);
  console.log('\nAll defaults are advisory. Use --strict or a project config to enforce a chosen threshold.');
  return 0;
}

function cmdContrast(argv) {
  if (argv.length !== 2) throw new UsageError('usage: contrast <foreground> <background>');
  const [foreground, background] = argv.map((color) => parseColor(color));
  if (!foreground || !background) throw new UsageError('colors must be valid hex, rgb(), hsl() or a supported basic color name');
  if (foreground.a !== 1 || background.a !== 1) throw new UsageError('translucent colors must be composited before calculating contrast');
  const ratio = contrastRatio(foreground, background);
  const shown = Math.floor(ratio * 100) / 100;
  console.log(`${shown.toFixed(2)}:1  normal text AA (4.5) ${ratio >= 4.5 ? 'pass' : 'FAIL'}  large text AA (3) ${ratio >= 3 ? 'pass' : 'FAIL'}  AAA (7) ${ratio >= 7 ? 'pass' : 'FAIL'}`);
  console.log('Contrast is only one check; inspect every relevant state and WCAG exception as applicable.');
  return ratio >= 4.5 ? 0 : 1;
}

async function main(argv) {
  const [command, ...rest] = argv;
  switch (command) {
    case 'lint': return cmdLint(rest);
    case 'hook': return cmdHook();
    case 'init': return cmdInit(rest);
    case 'rules': return cmdRules();
    case 'contrast': return cmdContrast(rest);
    case '--version':
    case '-v':
      console.log(pkg.version);
      return 0;
    case '--help':
    case '-h':
    case 'help':
      console.log(HELP);
      return 0;
    case undefined:
      console.log(HELP);
      return 2;
    default:
      throw new UsageError(`unknown command "${command}"`);
  }
}

main(process.argv.slice(2)).then(
  (code) => { process.exitCode = code; },
  (error) => {
    console.error(`kill-ai-slop: ${error.message}`);
    if (error instanceof UsageError) console.error('Run "node cli/index.mjs --help" for usage.');
    process.exitCode = error instanceof UsageError ? 2 : 1;
  },
);
