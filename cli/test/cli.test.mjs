import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walk } from '../lib/lint.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.resolve(here, '..');
const bin = path.join(cliRoot, 'index.mjs');
const fixtures = path.join(here, 'fixtures');
const run = (args, opts = {}) => spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8', ...opts });
const tmp = () => fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'ks-')));
const canSymlink = (dir, target, link) => {
  try { fs.symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir'); return true; }
  catch (error) { if (['EPERM', 'EACCES', 'ENOSYS', 'ENOTSUP'].includes(error.code)) return false; throw error; }
};

 test('default heuristic findings are advisory; strict or explicit error severity can enforce', () => {
  const advisory = run(['lint', 'slop.html'], { cwd: fixtures });
  assert.equal(advisory.status, 0, advisory.stderr);
  assert.match(advisory.stdout, /0 errors, \d+ warnings/);
  assert.equal(run(['lint', 'slop.html', '--strict'], { cwd: fixtures }).status, 1);
  assert.equal(run(['lint', 'slop.html', '--max-warnings', '0'], { cwd: fixtures }).status, 1);

  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'a.css'), 'body { font-family: Inter }');
  fs.writeFileSync(path.join(dir, '.killslop.json'), JSON.stringify({ rules: { 'font-default': 'error' } }));
  const enforced = run(['lint', 'a.css', '--format', 'json'], { cwd: dir });
  assert.equal(enforced.status, 1);
  assert.equal(JSON.parse(enforced.stdout).summary.errors, 1);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('lint JSON and GitHub output retain advisory severity and useful locations', () => {
  const json = run(['lint', 'slop.html', '--format', 'json'], { cwd: fixtures });
  const data = JSON.parse(json.stdout);
  assert.equal(json.status, 0);
  assert.equal(data.summary.errors, 0);
  assert.ok(data.summary.warnings > 0);
  assert.equal(data.findings[0].file, 'slop.html');
  assert.ok(data.findings.every((finding) => finding.severity === 'warn' && finding.line > 0 && finding.col > 0 && finding.rule && finding.message));

  const github = run(['lint', 'slop.html', '--format', 'github'], { cwd: fixtures });
  assert.equal(github.status, 0);
  assert.match(github.stdout, /^::warning file=slop\.html,line=\d+,col=\d+,title=font-default::/m);
  assert.doesNotMatch(github.stdout, /^::error/m);
});

test('warnings, strict mode, and max-warning thresholds behave consistently', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'a.css'), '.a { padding: 13px }');
  assert.equal(run(['lint'], { cwd: dir }).status, 0);
  assert.equal(run(['lint', '--strict'], { cwd: dir }).status, 1);
  assert.equal(run(['lint', '--max-warnings', '0'], { cwd: dir }).status, 1);
  assert.equal(run(['lint', '--max-warnings', '1'], { cwd: dir }).status, 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('config file supports severity and ignores; invalid config exits 2', () => {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'vendor-ui'));
  fs.writeFileSync(path.join(dir, 'a.css'), 'body { font-family: Inter }');
  fs.writeFileSync(path.join(dir, 'vendor-ui', 'b.css'), 'body { font-family: Inter }');
  fs.writeFileSync(path.join(dir, '.killslop.json'), JSON.stringify({ ignore: ['vendor-ui/**'] }));
  const result = run(['lint', '--format', 'json'], { cwd: dir });
  assert.deepEqual(JSON.parse(result.stdout).findings.map((finding) => finding.file), ['a.css']);

  const explicit = run(['lint', 'vendor-ui/b.css', '--format', 'json'], { cwd: dir });
  assert.deepEqual(JSON.parse(explicit.stdout).findings.map((finding) => finding.file), ['vendor-ui/b.css']);

  fs.writeFileSync(path.join(dir, '.killslop.json'), JSON.stringify({ rules: { 'font-default': 'off' } }));
  assert.equal(run(['lint'], { cwd: dir }).status, 0);

  for (const invalid of [
    JSON.stringify({ rules: { nope: 'off' } }),
    JSON.stringify({ ignore: [3] }),
    JSON.stringify({ spacingScale: [-1] }),
    '[]',
    '{ not json',
  ]) {
    fs.writeFileSync(path.join(dir, '.killslop.json'), invalid);
    const bad = run(['lint'], { cwd: dir });
    assert.equal(bad.status, 2, bad.stderr);
  }
  const missingConfig = run(['lint', '--config', 'missing.json'], { cwd: dir });
  assert.equal(missingConfig.status, 2);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('lint skips common dependency directories, reports missing files, and refuses symlinks', () => {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'node_modules'));
  fs.writeFileSync(path.join(dir, 'node_modules', 'x.css'), 'body { font-family: Inter }');
  assert.equal(run(['lint'], { cwd: dir }).status, 0);
  const missing = run(['lint', 'nope.css'], { cwd: dir });
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /no such file/);

  const external = tmp();
  fs.writeFileSync(path.join(external, 'secret.css'), 'body { font-family: Inter }');
  const link = path.join(dir, 'linked.css');
  if (canSymlink(dir, external, link)) {
    const linked = run(['lint', 'linked.css'], { cwd: dir });
    assert.equal(linked.status, 2);
    assert.match(linked.stderr, /symbolic link/i);
  }
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(external, { recursive: true, force: true });
});

test('walk handles explicit absolute targets outside cwd without a containment runtime error', () => {
  const cwd = tmp();
  const external = tmp();
  const file = path.join(external, 'outside.css');
  fs.writeFileSync(file, 'body { font-family: Inter }');
  assert.deepEqual(walk([file], cwd, []), [file]);
  fs.rmSync(cwd, { recursive: true, force: true });
  fs.rmSync(external, { recursive: true, force: true });
});

test('files larger than one megabyte are skipped', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'large.css'), `body { font-family: Inter }\n${' '.repeat(1_000_001)}`);
  const result = run(['lint', '--format', 'json'], { cwd: dir });
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).files, 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('usage and input errors exit 2', () => {
  assert.equal(run(['bogus']).status, 2);
  assert.equal(run(['lint', '--format', 'xml']).status, 2);
  assert.equal(run(['lint', '--nope']).status, 2);
  assert.equal(run(['init']).status, 2);
  assert.equal(run([]).status, 2);
  assert.equal(run(['--help']).status, 0);
  assert.equal(run(['--version']).status, 0);
});

test('hook returns PostToolUse advisory context and never blocks on findings or bad input', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'bad.css'), 'body { font-family: Inter }');
  fs.writeFileSync(path.join(dir, 'ok.css'), 'body { font-family: Satoshi, system-ui }');
  fs.writeFileSync(path.join(dir, 'notes.bin'), 'Inter');
  const hook = (payload) => run(['hook'], { input: typeof payload === 'string' ? payload : JSON.stringify(payload) });

  const bad = hook({ cwd: dir, tool_input: { file_path: 'bad.css' } });
  assert.equal(bad.status, 0, bad.stderr);
  const output = JSON.parse(bad.stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, 'PostToolUse');
  assert.match(output.hookSpecificOutput.additionalContext, /font-default/);
  assert.match(output.hookSpecificOutput.additionalContext, /advisory/i);

  for (const result of [
    hook({ cwd: dir, tool_input: { file_path: 'ok.css' } }),
    hook({ cwd: dir, tool_input: { file_path: 'notes.bin' } }),
    hook({ cwd: dir, tool_input: { file_path: 'missing.css' } }),
    hook({ cwd: dir, tool_input: { file_path: path.join(dir, '..', 'outside.css') } }),
    hook('not json'),
    hook(`${JSON.stringify({ cwd: dir, tool_input: {} })}${' '.repeat(70_000)}`),
  ]) {
    assert.equal(result.status, 0, result.stderr);
  }

  fs.writeFileSync(path.join(dir, '.killslop.json'), '{ invalid');
  const invalidConfig = hook({ cwd: dir, tool_input: { file_path: 'bad.css' } });
  assert.equal(invalidConfig.status, 0);
  assert.match(invalidConfig.stderr, /hook skipped/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('hook skips oversized and symlinked targets without blocking', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'large.css'), `body { font-family: Inter }\n${' '.repeat(1_000_001)}`);
  const oversized = run(['hook'], { input: JSON.stringify({ cwd: dir, tool_input: { file_path: 'large.css' } }) });
  assert.equal(oversized.status, 0);
  assert.equal(oversized.stdout, '');

  const external = tmp();
  fs.writeFileSync(path.join(external, 'bad.css'), 'body { font-family: Inter }');
  const link = path.join(dir, 'linked.css');
  if (canSymlink(dir, path.join(external, 'bad.css'), link)) {
    const result = run(['hook'], { input: JSON.stringify({ cwd: dir, tool_input: { file_path: 'linked.css' } }) });
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
  }
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(external, { recursive: true, force: true });
});

test('init preflights all targets, backs up conflicts, and keeps existing work by default', () => {
  const dir = tmp();
  const dry = run(['init', '--agent', 'claude', '--dry-run'], { cwd: dir });
  assert.equal(dry.status, 0, dry.stderr);
  assert.ok(!fs.existsSync(path.join(dir, '.claude')));

  const first = run(['init', '--agent', 'claude,cursor'], { cwd: dir });
  assert.equal(first.status, 0, first.stderr);
  for (const skill of ['kill-ai-slop', 'kill-ai-slop-ui', 'kill-ai-slop-copy', 'kill-ai-slop-mobile', 'kill-ai-slop-a11y', 'kill-ai-slop-code']) {
    assert.ok(fs.existsSync(path.join(dir, '.claude', 'skills', skill, 'SKILL.md')), skill);
    assert.ok(fs.existsSync(path.join(dir, '.cursor', 'skills', skill, 'SKILL.md')), skill);
  }
  assert.ok(fs.existsSync(path.join(dir, '.cursor', 'rules', 'killslop.mdc')));

  const installed = path.join(dir, '.claude', 'skills', 'kill-ai-slop', 'SKILL.md');
  fs.writeFileSync(installed, 'edited by user');
  const conflict = run(['init', '--agent', 'claude'], { cwd: dir });
  assert.equal(conflict.status, 1);
  assert.match(conflict.stderr, /Konflik ditemukan/);
  assert.equal(fs.readFileSync(installed, 'utf8'), 'edited by user');

  const replace = run(['init', '--agent', 'claude', '--force'], { cwd: dir });
  assert.equal(replace.status, 0, replace.stderr);
  assert.notEqual(fs.readFileSync(installed, 'utf8'), 'edited by user');
  const backupRoot = path.join(dir, '.claude', 'skills', '.kill-ai-slop-backups');
  const backups = fs.readdirSync(backupRoot);
  assert.ok(backups.length >= 1);
  const backup = path.join(backupRoot, backups[0], 'kill-ai-slop', 'SKILL.md');
  assert.equal(fs.readFileSync(backup, 'utf8'), 'edited by user');
  assert.equal(run(['init', '--agent', 'nope'], { cwd: dir }).status, 2);
  assert.equal(run(['init', '--agent', 'antigravity', '--global'], { cwd: dir }).status, 2);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('init rejects a symlinked destination before writing outside the project', () => {
  const dir = tmp();
  const external = tmp();
  const outsideFile = path.join(external, 'keep.txt');
  fs.writeFileSync(outsideFile, 'do not change');
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
  const target = path.join(dir, '.claude', 'skills');
  if (canSymlink(dir, external, target)) {
    const result = run(['init', '--agent', 'claude', '--force'], { cwd: dir });
    assert.equal(result.status, 1);
    assert.equal(fs.readFileSync(outsideFile, 'utf8'), 'do not change');
  }
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(external, { recursive: true, force: true });
});

test('legacy uploaded CLI entry point delegates to the combined safe CLI', () => {
  const legacy = path.join(cliRoot, 'linter-uploaded.mjs');
  const result = spawnSync(process.execPath, [legacy, '--version'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout.trim(), /^\d+\.\d+\.\d+/);
  assert.doesNotMatch(fs.readFileSync(legacy, 'utf8'), /rmSync\s*\([^\n]*recursive\s*:\s*true/);
});

test('asset sync preflights conflicts and preserves stale or replaced files', () => {
  const dir = tmp();
  const cli = path.join(dir, 'cli');
  const scriptDir = path.join(cli, 'scripts');
  fs.mkdirSync(scriptDir, { recursive: true });
  fs.copyFileSync(path.join(cliRoot, 'scripts', 'sync-assets.mjs'), path.join(scriptDir, 'sync-assets.mjs'));
  fs.mkdirSync(path.join(dir, 'skills', 'demo'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'rules'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'skills', 'demo', 'SKILL.md'), 'new skill');
  fs.writeFileSync(path.join(dir, 'rules', 'demo.md'), 'new rule');
  fs.mkdirSync(path.join(cli, 'skills', 'demo'), { recursive: true });
  fs.writeFileSync(path.join(cli, 'skills', 'demo', 'SKILL.md'), 'local edit');
  fs.writeFileSync(path.join(cli, 'skills', 'stale.txt'), 'keep stale file');

  const script = path.join(scriptDir, 'sync-assets.mjs');
  const conflict = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.equal(conflict.status, 1);
  assert.equal(fs.readFileSync(path.join(cli, 'skills', 'demo', 'SKILL.md'), 'utf8'), 'local edit');
  assert.ok(!fs.existsSync(path.join(cli, 'rules', 'demo.md')));

  const replaced = spawnSync(process.execPath, [script, '--replace'], { encoding: 'utf8' });
  assert.equal(replaced.status, 0, replaced.stderr);
  assert.equal(fs.readFileSync(path.join(cli, 'skills', 'demo', 'SKILL.md'), 'utf8'), 'new skill');
  assert.equal(fs.readFileSync(path.join(cli, 'skills', 'stale.txt'), 'utf8'), 'keep stale file');
  const backupBase = path.join(cli, '.kill-ai-slop-backups');
  const backupRun = fs.readdirSync(backupBase)[0];
  assert.equal(fs.readFileSync(path.join(backupBase, backupRun, 'skills', 'demo', 'SKILL.md'), 'utf8'), 'local edit');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('contrast command rejects invalid and translucent colors', () => {
  assert.equal(run(['contrast', '#0b0b0f', '#f7f6f3']).status, 0);
  assert.equal(run(['contrast', '#777', '#fff']).status, 1);
  assert.equal(run(['contrast', 'zzz', '#fff']).status, 2);
  const translucent = run(['contrast', 'rgba(0,0,0,.5)', '#fff']);
  assert.equal(translucent.status, 2);
  assert.match(translucent.stderr, /translucent/i);
});
