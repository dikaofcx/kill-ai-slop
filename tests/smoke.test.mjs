import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { installSkills, listSkills } from '../cli/lib/install.mjs';
import { writeAuditTemplate } from '../cli/lib/audit-template.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'skills');

async function withTempDir(callback) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'kill-ai-slop-test-'));
  try { await callback(dir); }
  finally { await fs.rm(dir, { recursive: true, force: true }); }
}

test('list returns core plus focused skills with metadata', async () => {
  const skills = await listSkills(sourceRoot);
  assert.equal(skills.length, 6);
  assert.ok(skills.some((skill) => skill.name === 'kill-ai-slop'));
  assert.ok(skills.every((skill) => skill.description.length >= 40));
});

test('install is idempotent and copies every skill', async () => {
  await withTempDir(async (dir) => {
    const target = path.join(dir, 'project', '.agents', 'skills');
    const first = await installSkills({ sourceRoot, target });
    assert.ok(first.plan.some((item) => item.action === 'write'));
    const second = await installSkills({ sourceRoot, target });
    assert.ok(second.plan.every((item) => item.action === 'unchanged'));
    assert.ok(await fs.stat(path.join(target, 'kill-ai-slop', 'SKILL.md')));
  });
});

test('dry-run does not create its target', async () => {
  await withTempDir(async (dir) => {
    const target = path.join(dir, 'not-created');
    const result = await installSkills({ sourceRoot, target, dryRun: true });
    assert.equal(result.dryRun, true);
    await assert.rejects(fs.stat(target), { code: 'ENOENT' });
  });
});

test('conflicting files abort before writing other skills', async () => {
  await withTempDir(async (dir) => {
    const target = path.join(dir, 'target');
    const conflict = path.join(target, 'kill-ai-slop', 'SKILL.md');
    await fs.mkdir(path.dirname(conflict), { recursive: true });
    await fs.writeFile(conflict, 'local edits\n');
    await assert.rejects(
      installSkills({ sourceRoot, target }),
      (error) => error.message.includes('tidak ada file yang ditulis') && error.message.includes('SKILL.md'),
    );
    await assert.rejects(fs.stat(path.join(target, 'kill-ai-slop-ui')), { code: 'ENOENT' });
  });
});

test('replace saves conflicting content before updating', async () => {
  await withTempDir(async (dir) => {
    const target = path.join(dir, 'target');
    const conflict = path.join(target, 'kill-ai-slop', 'SKILL.md');
    await fs.mkdir(path.dirname(conflict), { recursive: true });
    await fs.writeFile(conflict, 'local edits\n');
    const result = await installSkills({ sourceRoot, target, skillNames: ['kill-ai-slop'], replace: true });
    assert.ok(result.backupRoot);
    assert.notEqual(await fs.readFile(conflict, 'utf8'), 'local edits\n');
    assert.equal(await fs.readFile(path.join(result.backupRoot, 'kill-ai-slop', 'SKILL.md'), 'utf8'), 'local edits\n');
  });
});

test('installer refuses a target inside the source tree', async () => {
  await assert.rejects(
    installSkills({ sourceRoot, target: path.join(sourceRoot, 'nested') }),
    /tidak boleh sama dengan atau berada di dalam/,
  );
});

test('audit template records context and refuses to overwrite', async () => {
  await withTempDir(async (dir) => {
    const output = path.join(dir, 'audit.md');
    await writeAuditTemplate({ title: 'Beranda', surface: 'mobile web', output });
    const text = await fs.readFile(output, 'utf8');
    assert.match(text, /Bukti dan lokasi/);
    assert.match(text, /Verifikasi/);
    await assert.rejects(writeAuditTemplate({ title: 'Baru', output }), /File sudah ada/);
  });
});

test('CLI list works without external dependencies', () => {
  const result = spawnSync(process.execPath, [path.join(root, 'cli', 'index.mjs'), 'list'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /kill-ai-slop-a11y/);
});
