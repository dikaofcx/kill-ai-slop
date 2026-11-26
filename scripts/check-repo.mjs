// Repository guardrails. Run: node scripts/check-repo.mjs
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildSkillIndex } from './skill-index.mjs';
import { RULES } from '../cli/lib/rules.mjs';
import { loadConfig } from '../cli/lib/lint.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const checks = [];
const check = (name, fn) => checks.push({ name, fn });
const required = [
  'SKILL.md', 'skills.md', 'soul.md', 'agents.md', 'AGENTS.md', 'GUIDE.md', 'README.md', 'ROADMAP.md',
  'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md', 'LICENSE', 'antislop.md', 'killslop.md',
  'package.json', 'package-lock.json', 'plugin.json', '.gitignore', '.killslop.json',
  '.github/workflows/ci.yml', '.github/PULL_REQUEST_TEMPLATE.md',
  '.agents/plugins/marketplace.json', '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json',
  '.cline-plugin/plugin.js', '.codex-plugin/plugin.json', '.cursor-plugin/plugin.json', '.cursor-plugin/marketplace.json',
  '.kimi-plugin/plugin.json', '.omp-plugin/marketplace.json', '.qoder-plugin/plugin.json',
  'assets/logo.png', 'assets/banner.png', 'assets/README.md', 'hooks/hooks.json', 'commands/kill-ai-slop.md',
  'cli/package.json', 'cli/index.mjs', 'cli/linter.mjs', 'cli/linter-uploaded.mjs',
  'cli/lib/audit-template.mjs', 'cli/lib/color.mjs', 'cli/lib/install.mjs', 'cli/lib/lint.mjs', 'cli/lib/rules.mjs',
  'cli/scripts/sync-assets.mjs', 'cli/test/cli.test.mjs', 'cli/test/lint.test.mjs',
  'cli/test/fixtures/clean.html', 'cli/test/fixtures/slop.html',
  'rules/kill-ai-slop.md', 'rules/kill-ai-slop.mdc', 'rules/killslop.md', 'rules/killslop.mdc', 'rules/soul.md',
  'scripts/check-repo.mjs', 'scripts/skill-index.mjs', 'scripts/sync-skills.mjs', 'scripts/sync-version.mjs',
  'evals/README.md', 'evals/cases.json', 'tests/smoke.test.mjs', 'skills/index.json',
  'skills/kill-ai-slop/SKILL.md', 'skills/kill-ai-slop/references/skills.md',
  'skills/kill-ai-slop/references/soul.md', 'skills/kill-ai-slop/references/agents.md',
  'skills/kill-ai-slop-ui/references/sources.md', 'skills/kill-ai-slop-ui/references/tokens-template.css',
];

function readJson(relative) {
  try { return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8')); }
  catch (error) { errors.push(`JSON tidak valid (${relative}): ${error.message}`); return null; }
}

function isWithin(child, parent) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function assertProjectPath(reference, label, expectedType) {
  if (typeof reference !== 'string' || !reference.trim()) throw new Error(`${label}: path kosong atau bukan string`);
  const absolute = path.resolve(root, reference);
  if (!isWithin(absolute, root)) throw new Error(`${label}: path keluar dari repository (${reference})`);
  let current = root;
  const parts = path.relative(root, absolute).split(path.sep).filter(Boolean);
  let stat = fs.lstatSync(root);
  if (stat.isSymbolicLink()) throw new Error('root repository tidak boleh symlink');
  for (const part of parts) {
    current = path.join(current, part);
    stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error(`${label}: symlink tidak diikuti (${reference})`);
  }
  if (expectedType === 'file' && !stat.isFile()) throw new Error(`${label}: bukan file biasa (${reference})`);
  if (expectedType === 'directory' && !stat.isDirectory()) throw new Error(`${label}: bukan direktori (${reference})`);
  return absolute;
}

function collectVersions(value, location, output = []) {
  if (!value || typeof value !== 'object') return output;
  if (typeof value.version === 'string') output.push({ location, version: value.version });
  for (const [key, child] of Object.entries(value)) collectVersions(child, `${location}.${key}`, output);
  return output;
}

const packageJson = readJson('package.json');
const packageLock = readJson('package-lock.json');
const cliPackage = readJson('cli/package.json');
const manifestPaths = [
  '.agents/plugins/marketplace.json', '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json',
  '.codex-plugin/plugin.json', '.cursor-plugin/plugin.json', '.cursor-plugin/marketplace.json',
  '.kimi-plugin/plugin.json', '.omp-plugin/marketplace.json', '.qoder-plugin/plugin.json', 'plugin.json',
];

check('required repository files exist', () => {
  const missing = required.filter((relative) => !fs.existsSync(path.join(root, relative)));
  if (missing.length) throw new Error(`berkas wajib tidak ada: ${missing.join(', ')}`);
});

check('root package, lockfile, and CLI metadata agree', () => {
  if (!packageJson || !packageLock || !cliPackage) throw new Error('package metadata tidak dapat dibaca');
  if (packageJson.private !== true) throw new Error('package.json harus private: true');
  if (!packageJson.engines?.node || packageJson.engines.node !== cliPackage.engines?.node) throw new Error('batas Node root dan CLI harus sama');
  if (packageLock.version !== packageJson.version || packageLock.packages?.['']?.version !== packageJson.version) throw new Error('versi package-lock tidak sama dengan root package.json');
  if (cliPackage.version !== packageJson.version) throw new Error('versi cli/package.json tidak sama dengan root');
  if (cliPackage.private !== true) throw new Error('cli/package.json harus private: true');
  if (Object.keys(cliPackage.dependencies ?? {}).length) throw new Error('CLI harus tetap tanpa dependency runtime');
  for (const script of ['check', 'test', 'test:cli', 'sync-skills', 'sync-skills:check', 'sync-version', 'ci']) {
    if (!packageJson.scripts?.[script]) throw new Error(`npm script wajib tidak ada: ${script}`);
  }
  for (const script of ['test', 'sync-assets']) if (!cliPackage.scripts?.[script]) throw new Error(`script CLI wajib tidak ada: ${script}`);
  if (packageJson.bin?.['kill-ai-slop'] !== './cli/index.mjs') throw new Error('bin kill-ai-slop harus menunjuk ke cli/index.mjs');
  for (const relative of packageJson.files ?? []) assertProjectPath(relative, 'package.json files');
  if (!packageJson.pi?.skills?.includes('./skills')) throw new Error('integrasi Pi harus menunjuk ke ./skills');
  const cline = packageJson.cline?.plugins?.find((plugin) => plugin.capabilities?.includes('skills'));
  if (!cline?.paths?.includes('./.cline-plugin/plugin.js')) throw new Error('integrasi Cline harus menunjuk ke plugin skills');
});

check('all plugin manifests parse, share names and versions, and resolve local paths', () => {
  const manifests = new Map();
  for (const relative of [...manifestPaths, 'hooks/hooks.json']) {
    const manifest = readJson(relative);
    if (!manifest) throw new Error(`manifest tidak dapat dibaca: ${relative}`);
    manifests.set(relative, manifest);
  }
  if (!packageJson) throw new Error('package.json tidak tersedia');
  const names = new Set([packageJson.name, ...[...manifests.entries()].filter(([name]) => name !== 'hooks/hooks.json').map(([, value]) => value.name)]);
  for (const relative of ['.claude-plugin/marketplace.json', '.cursor-plugin/marketplace.json', '.omp-plugin/marketplace.json']) {
    for (const plugin of manifests.get(relative)?.plugins ?? []) names.add(plugin.name);
  }
  for (const plugin of manifests.get('.agents/plugins/marketplace.json')?.plugins ?? []) names.add(plugin.name);
  if (names.size !== 1 || !names.has('kill-ai-slop')) throw new Error(`nama plugin tidak konsisten: ${[...names].join(', ')}`);

  for (const relative of manifestPaths) {
    const manifest = manifests.get(relative);
    for (const entry of collectVersions(manifest, relative)) {
      if (entry.version !== packageJson.version) throw new Error(`versi ${entry.location} (${entry.version}) tidak sama dengan root (${packageJson.version})`);
    }
  }
  const codex = manifests.get('.codex-plugin/plugin.json');
  assertProjectPath(codex.skills, 'Codex skills', 'directory');
  assertProjectPath(codex.rules, 'Codex rules', 'directory');
  assertProjectPath(codex.interface.logo, 'Codex logo', 'file');
  assertProjectPath(codex.interface.composerIcon, 'Codex composerIcon', 'file');
  if (!Array.isArray(codex.interface.screenshots) || !codex.interface.screenshots.length) throw new Error('Codex membutuhkan screenshot/preview asset');
  for (const reference of codex.interface.screenshots) assertProjectPath(reference, 'Codex screenshot', 'file');
  const cursor = manifests.get('.cursor-plugin/plugin.json');
  assertProjectPath(cursor.skills, 'Cursor skills', 'directory');
  assertProjectPath(cursor.rules, 'Cursor rules', 'directory');
  assertProjectPath(cursor.logo, 'Cursor logo', 'file');
  const qoder = manifests.get('.qoder-plugin/plugin.json');
  assertProjectPath(qoder.skills, 'Qoder skills', 'directory');
  assertProjectPath(qoder.logo, 'Qoder logo', 'file');
  const kimi = manifests.get('.kimi-plugin/plugin.json');
  assertProjectPath(kimi.skills, 'Kimi skills', 'directory');
  assertProjectPath(kimi.systemPromptPath, 'Kimi systemPromptPath', 'file');
  for (const reference of manifests.get('.claude-plugin/plugin.json').skills ?? []) assertProjectPath(reference, 'Claude skills', 'directory');
  for (const relative of ['.claude-plugin/marketplace.json', '.cursor-plugin/marketplace.json', '.omp-plugin/marketplace.json']) {
    for (const plugin of manifests.get(relative).plugins ?? []) assertProjectPath(plugin.source, `${relative} plugin source`, 'directory');
  }
  for (const plugin of manifests.get('.agents/plugins/marketplace.json').plugins ?? []) assertProjectPath(plugin.source?.path, 'Agents marketplace source', 'directory');
  for (const reference of packageJson.pi.skills) assertProjectPath(reference, 'Pi skills', 'directory');
  for (const plugin of packageJson.cline.plugins) for (const reference of plugin.paths ?? []) assertProjectPath(reference, 'Cline plugin', 'file');
});

check('skill metadata, generated index, and evaluation cases are complete', () => {
  if (!packageJson) throw new Error('root package metadata tidak tersedia');
  const expectedSkills = ['kill-ai-slop', 'kill-ai-slop-ui', 'kill-ai-slop-copy', 'kill-ai-slop-mobile', 'kill-ai-slop-a11y', 'kill-ai-slop-code'];
  const skillDirs = fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true }).filter((entry) => entry.isDirectory());
  for (const name of expectedSkills) if (!skillDirs.some((entry) => entry.name === name)) throw new Error(`skill wajib tidak ada: ${name}`);
  for (const directory of skillDirs) {
    const relative = `skills/${directory.name}/SKILL.md`;
    const text = fs.readFileSync(path.join(root, relative), 'utf8');
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) throw new Error(`frontmatter tidak ada: ${relative}`);
    const name = match[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const description = match[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
    if (name !== directory.name) throw new Error(`frontmatter name harus sama dengan folder: ${relative}`);
    if (!description || description.length < 80 || description.length > 1024) throw new Error(`description harus 80–1024 karakter: ${relative}`);
    if (text.split('\n').length > 500) throw new Error(`${relative} melebihi 500 baris`);
  }
  const expectedIndex = buildSkillIndex(root);
  const actualIndex = readJson('skills/index.json');
  if (!actualIndex || JSON.stringify(actualIndex) !== JSON.stringify(expectedIndex)) throw new Error('skills/index.json belum sinkron; jalankan npm run sync-skills');
  const cases = readJson('evals/cases.json');
  if (!Array.isArray(cases?.cases) || cases.cases.length < 6) throw new Error('evals/cases.json harus berisi minimal enam kasus');
  const ids = new Set();
  for (const item of cases.cases) {
    if (!item.id || !item.prompt || !Array.isArray(item.must) || !item.must.length || !Array.isArray(item.mustNot) || !item.mustNot.length) throw new Error(`kasus eval tidak lengkap: ${item.id ?? '(tanpa id)'}`);
    if (ids.has(item.id)) throw new Error(`ID eval duplikat: ${item.id}`);
    ids.add(item.id);
  }
});

check('rule defaults are advisory and user config is valid', () => {
  if (RULES.length !== 13 || new Set(RULES.map((rule) => rule.id)).size !== RULES.length) throw new Error('harus ada 13 rule dengan ID unik');
  if (RULES.some((rule) => rule.severity !== 'warn')) throw new Error('semua severity bawaan harus warning advisory');
  loadConfig(root);
});

check('Claude hook is PostToolUse advisory and compatibility helpers are non-destructive', () => {
  const hooks = readJson('hooks/hooks.json');
  const postToolUse = hooks?.hooks?.PostToolUse;
  if (!Array.isArray(postToolUse) || !postToolUse.length) throw new Error('hook PostToolUse tidak terdaftar');
  const command = postToolUse.flatMap((matcher) => matcher.hooks ?? []).find((hook) => hook.type === 'command')?.command;
  if (!command?.includes('${CLAUDE_PLUGIN_ROOT}/cli/index.mjs') || !command.endsWith(' hook')) throw new Error(`command hook tidak menunjuk ke CLI utama: ${command}`);
  const cline = fs.readFileSync(path.join(root, '.cline-plugin/plugin.js'), 'utf8');
  if (!/export default\s*\{/.test(cline)) throw new Error('entrypoint Cline tidak memiliki default export');
  const legacy = fs.readFileSync(path.join(root, 'cli/linter-uploaded.mjs'), 'utf8');
  if (!legacy.includes("import './index.mjs'") || /rmSync\s*\([^\n]*recursive\s*:\s*true/.test(legacy)) throw new Error('linter-uploaded harus shim ke CLI utama dan tidak boleh menghapus rekursif');
  const syncAssets = fs.readFileSync(path.join(root, 'cli/scripts/sync-assets.mjs'), 'utf8');
  if (/rmSync\s*\([^\n]*recursive\s*:\s*true/.test(syncAssets)) throw new Error('sync-assets tidak boleh menghapus direktori target rekursif');
});

check('Cursor rule metadata and UI source URLs are valid', () => {
  const rule = fs.readFileSync(path.join(root, 'rules/killslop.mdc'), 'utf8');
  const frontmatter = rule.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) throw new Error('frontmatter Cursor rule tidak ada');
  for (const key of ['description', 'globs', 'alwaysApply']) if (!new RegExp(`^${key}:\\s*.+$`, 'm').test(frontmatter[1])) throw new Error(`Cursor rule tidak memiliki ${key}`);
  const sourceList = fs.readFileSync(path.join(root, 'skills/kill-ai-slop-ui/references/sources.md'), 'utf8');
  const urls = sourceList.match(/https?:\/\/[^\s)|]+/g) ?? [];
  if (urls.length < 50) throw new Error(`daftar sumber UI terlalu pendek (${urls.length} URL)`);
  const seen = new Set();
  for (const value of urls) {
    let parsed;
    try { parsed = new URL(value); } catch { throw new Error(`URL sumber tidak valid: ${value}`); }
    if (parsed.protocol !== 'https:') throw new Error(`URL sumber harus HTTPS: ${value}`);
    if (seen.has(value)) throw new Error(`URL sumber duplikat: ${value}`);
    seen.add(value);
  }
});

function listFiles(directory, relative = '') {
  const output = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.cache'].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const rel = path.join(relative, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`symlink repository tidak dipindai: ${rel}`);
    if (entry.isDirectory()) output.push(...listFiles(absolute, rel));
    else if (entry.isFile()) output.push({ absolute, relative: rel.split(path.sep).join('/') });
  }
  return output;
}

check('local Markdown links resolve and repository has no secret placeholders', () => {
  const files = listFiles(root);
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;
  for (const { absolute, relative } of files) {
    if (!/\.(md|mdc|mjs|js|json|yml|yaml|txt)$/.test(relative)) continue;
    const content = fs.readFileSync(absolute, 'utf8');
    if (/(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})/.test(content)) throw new Error(`pola token GitHub terdeteksi: ${relative}`);
    if (relative !== 'scripts/check-repo.mjs' && /github\.com\/dikaglorya(?:\/|$)/.test(content)) throw new Error(`tautan repository memakai owner lama: ${relative}`);
    if (relative !== 'scripts/check-repo.mjs' && /\b(?:TODO_REPLACE|REPLACE_ME|INSERT_VALUE_HERE)\b/.test(content)) throw new Error(`placeholder belum diisi: ${relative}`);
    if (!relative.endsWith('.md') && !relative.endsWith('.mdc')) continue;
    for (const match of content.matchAll(linkPattern)) {
      const target = match[1].trim().replace(/^<|>$/g, '');
      if (/^(?:https?:|mailto:|#|data:)/i.test(target)) continue;
      let pathPart;
      try { pathPart = decodeURIComponent(target.split(/[?#]/, 1)[0]); }
      catch { throw new Error(`tautan lokal tidak dapat di-decode: ${relative} -> ${target}`); }
      if (!pathPart) continue;
      const resolved = path.resolve(path.dirname(absolute), pathPart);
      if (!isWithin(resolved, root) || !fs.existsSync(resolved)) throw new Error(`tautan lokal rusak: ${relative} -> ${target}`);
    }
  }
  const ignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
  for (const value of ['node_modules/', '.env', 'cli/skills/', 'cli/rules/', '*.tgz']) if (!ignore.includes(value)) throw new Error(`.gitignore tidak mencakup ${value}`);
});

check('repository passes its own advisory linter', () => {
  const result = spawnSync(process.execPath, [path.join(root, 'cli/index.mjs'), 'lint', '.', '--format', 'github'], { cwd: root, encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`self-lint gagal (exit ${result.status}):\n${result.stdout}${result.stderr}`);
});

let failed = 0;
for (const { name, fn } of checks) {
  try {
    fn();
    console.log(`ok    ${name}`);
  } catch (error) {
    failed += 1;
    const message = error?.message ?? String(error);
    console.log(`FAIL  ${name}\n      ${message.replace(/\n/g, '\n      ')}`);
  }
}
for (const error of errors) {
  failed += 1;
  console.log(`FAIL  ${error}`);
}
const totalChecks = checks.length + errors.length;
console.log(`\n${totalChecks - failed}/${totalChecks} checks passed.`);
process.exit(failed ? 1 : 0);
