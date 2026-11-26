// Safely copies ../skills and ../rules into cli/ for packaging; never deletes a destination tree.
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const cli = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.dirname(cli);
const options = new Set(process.argv.slice(2));
for (const option of options) {
  if (!['--replace', '--dry-run'].includes(option)) throw new Error(`Unknown option: ${option}`);
}
const replace = options.has('--replace');
const dryRun = options.has('--dry-run');
const exists = async (file) => {
  try { return await fs.lstat(file); }
  catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null; throw error; }
};

async function assertNoSymlink(target) {
  const absolute = path.resolve(target);
  const root = path.parse(absolute).root;
  let current = root;
  for (const part of absolute.slice(root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if ((await exists(current))?.isSymbolicLink()) throw new Error(`Refusing symlink path: ${current}`);
  }
}

async function filesUnder(source, relative = '') {
  const current = path.join(source, relative);
  const stat = await fs.lstat(current);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`Source is not a normal directory: ${current}`);
  const out = [];
  for (const entry of (await fs.readdir(current, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const next = path.join(relative, entry.name);
    const full = path.join(source, next);
    const child = await fs.lstat(full);
    if (child.isSymbolicLink()) throw new Error(`Refusing symlink source: ${full}`);
    if (child.isDirectory()) out.push(...await filesUnder(source, next));
    else if (child.isFile()) out.push(next);
  }
  return out;
}

const plan = [];
const conflicts = [];
for (const name of ['skills', 'rules']) {
  const source = path.join(repo, name);
  const destination = path.join(cli, name);
  for (const relative of await filesUnder(source)) {
    const from = path.join(source, relative);
    const to = path.join(destination, relative);
    await assertNoSymlink(to);
    const stat = await exists(to);
    if (!stat) plan.push({ name, relative, from, to, action: 'write' });
    else if (!stat.isFile() || stat.isSymbolicLink()) conflicts.push(`${name}/${relative}: destination is not a regular file`);
    else if ((await fs.readFile(from)).equals(await fs.readFile(to))) plan.push({ name, relative, from, to, action: 'unchanged' });
    else if (replace) plan.push({ name, relative, from, to, action: 'replace' });
    else conflicts.push(`${name}/${relative}: different content; use --replace to back up before replacing`);
  }
}
if (conflicts.length) throw new Error(`Preflight failed; no files written:\n- ${conflicts.join('\n- ')}`);
if (dryRun) {
  console.log(`Dry run: ${plan.filter((item) => item.action !== 'unchanged').length} files planned; no files written.`);
  process.exit(0);
}

const backupRoot = path.join(cli, '.kill-ai-slop-backups', `asset-sync-${randomUUID()}`);
for (const item of plan) {
  if (item.action === 'unchanged') continue;
  await assertNoSymlink(item.to);
  await fs.mkdir(path.dirname(item.to), { recursive: true });
  await assertNoSymlink(item.to);
  let backup;
  if (item.action === 'replace') {
    backup = path.join(backupRoot, item.name, item.relative);
    await assertNoSymlink(backup);
    await fs.mkdir(path.dirname(backup), { recursive: true });
    await fs.copyFile(item.to, backup, fs.constants.COPYFILE_EXCL);
  }
  const temporary = `${item.to}.tmp-${randomUUID()}`;
  try {
    await fs.copyFile(item.from, temporary, fs.constants.COPYFILE_EXCL);
    await assertNoSymlink(item.to);
    if (item.action === 'write' && await exists(item.to)) throw new Error(`Destination appeared after preflight: ${item.to}`);
    await fs.rename(temporary, item.to);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}
if (plan.some((item) => item.action === 'replace')) console.log(`Backups: ${backupRoot}`);
console.log(`Synchronized ${plan.filter((item) => item.action !== 'unchanged').length} files; no destination tree was deleted.`);
