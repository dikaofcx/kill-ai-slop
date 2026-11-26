import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

function isWithin(child, parent) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function exists(filePath) {
  try { return await fs.lstat(filePath); }
  catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null; throw error; }
}

async function assertNoSymlinkComponents(target) {
  const absolute = path.resolve(target);
  const root = path.parse(absolute).root;
  let current = root;
  for (const part of absolute.slice(root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const stat = await exists(current);
    if (stat?.isSymbolicLink()) throw new Error(`Symlink di jalur target tidak diikuti: ${current}`);
  }
}

async function assertNoSymlinkPath(targetRoot, destination) {
  const root = path.resolve(targetRoot);
  const target = path.resolve(destination);
  if (!isWithin(target, root)) throw new Error(`Target keluar dari direktori instalasi: ${target}`);
  await assertNoSymlinkComponents(root);
  let current = root;
  for (const part of path.relative(root, target).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const stat = await exists(current);
    if (stat?.isSymbolicLink()) throw new Error(`Symlink di jalur target tidak diikuti: ${current}`);
  }
}

async function collectFiles(root, relative = '') {
  const current = path.join(root, relative);
  const currentStat = await fs.lstat(current);
  if (currentStat.isSymbolicLink() || !currentStat.isDirectory()) throw new Error(`Sumber skill bukan direktori biasa: ${current}`);
  const entries = await fs.readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const childRelative = path.join(relative, entry.name);
    const fullPath = path.join(root, childRelative);
    const stat = await fs.lstat(fullPath);
    if (stat.isSymbolicLink()) throw new Error(`Symlink tidak diikuti saat pemasangan: ${fullPath}`);
    if (stat.isDirectory()) files.push(...await collectFiles(root, childRelative));
    else if (stat.isFile()) files.push(childRelative);
  }
  return files;
}

function readDescription(skillText) {
  const frontmatter = skillText.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return frontmatter?.[1].match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? 'Deskripsi tidak tersedia.';
}

export async function listSkills(sourceRoot) {
  const source = path.resolve(sourceRoot);
  const sourceStat = await fs.lstat(source);
  if (sourceStat.isSymbolicLink() || !sourceStat.isDirectory()) throw new Error(`Direktori sumber skill bukan direktori biasa: ${source}`);
  const entries = await fs.readdir(source, { withFileTypes: true });
  const skills = [];
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const skillFile = path.join(source, entry.name, 'SKILL.md');
    const stat = await exists(skillFile);
    if (!stat?.isFile() || stat.isSymbolicLink()) continue;
    const text = await fs.readFile(skillFile, 'utf8');
    skills.push({ name: entry.name, description: readDescription(text) });
  }
  return skills;
}

export async function installSkills({ sourceRoot, target, skillNames, dryRun = false, replace = false }) {
  if (!target) throw new Error('Tentukan direktori tujuan dengan --target <path>.');
  const source = path.resolve(sourceRoot);
  const destinationRoot = path.resolve(target);
  if (destinationRoot === source || isWithin(destinationRoot, source)) {
    throw new Error('Target tidak boleh sama dengan atau berada di dalam direktori sumber skills.');
  }
  await assertNoSymlinkComponents(destinationRoot);

  const available = await listSkills(source);
  const requested = skillNames?.length ? skillNames : available.map((skill) => skill.name);
  const byName = new Map(available.map((skill) => [skill.name, skill]));
  const unknown = requested.filter((name) => !byName.has(name));
  if (unknown.length) throw new Error(`Skill tidak dikenal: ${unknown.join(', ')}. Jalankan perintah list.`);
  const selected = [...new Set(requested)];
  const plan = [];
  const conflicts = [];

  for (const name of selected) {
    const sourceSkill = path.join(source, name);
    const destinationSkill = path.join(destinationRoot, name);
    const destinationStat = await exists(destinationSkill);
    if (destinationStat?.isSymbolicLink()) throw new Error(`Target skill tidak boleh berupa symlink: ${destinationSkill}`);
    if (destinationStat && !destinationStat.isDirectory()) {
      conflicts.push(`${name}: target sudah ada dan bukan direktori`);
      continue;
    }
    const files = await collectFiles(sourceSkill);
    for (const relative of files) {
      const sourceFile = path.join(sourceSkill, relative);
      const destinationFile = path.join(destinationSkill, relative);
      await assertNoSymlinkPath(destinationRoot, destinationFile);
      const targetStat = await exists(destinationFile);
      if (!targetStat) {
        plan.push({ name, relative, sourceFile, destinationFile, action: 'write' });
      } else if (!targetStat.isFile() || targetStat.isSymbolicLink()) {
        conflicts.push(`${name}/${relative}: target bukan file biasa`);
      } else {
        const [sourceBytes, targetBytes] = await Promise.all([fs.readFile(sourceFile), fs.readFile(destinationFile)]);
        if (sourceBytes.equals(targetBytes)) plan.push({ name, relative, sourceFile, destinationFile, action: 'unchanged' });
        else if (replace) plan.push({ name, relative, sourceFile, destinationFile, action: 'replace' });
        else conflicts.push(`${name}/${relative}: file berbeda; tinjau dulu atau gunakan --replace untuk membuat backup`);
      }
    }
  }

  if (conflicts.length) {
    throw new Error(`Konflik ditemukan; tidak ada file yang ditulis:\n- ${conflicts.join('\n- ')}`);
  }
  if (dryRun) return { plan, backupRoot: null, dryRun: true };

  const replaced = plan.filter((item) => item.action === 'replace');
  const backupRoot = path.join(destinationRoot, '.kill-ai-slop-backups', `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`);
  const applied = [];
  try {
    for (const item of plan) {
      if (item.action === 'unchanged') continue;
      await assertNoSymlinkPath(destinationRoot, item.destinationFile);
      await fs.mkdir(path.dirname(item.destinationFile), { recursive: true });
      await assertNoSymlinkPath(destinationRoot, item.destinationFile);

      const current = await exists(item.destinationFile);
      if (item.action === 'write' && current) throw new Error(`Target muncul setelah preflight; tidak ditimpa: ${item.destinationFile}`);
      if (item.action === 'replace' && (!current?.isFile() || current.isSymbolicLink())) {
        throw new Error(`Target berubah setelah preflight; tidak diganti: ${item.destinationFile}`);
      }

      let backupPath = null;
      let originalBytes = null;
      if (item.action === 'replace') {
        originalBytes = await fs.readFile(item.destinationFile);
        backupPath = path.join(backupRoot, item.name, item.relative);
        await assertNoSymlinkPath(destinationRoot, backupPath);
        await fs.mkdir(path.dirname(backupPath), { recursive: true });
        await assertNoSymlinkPath(destinationRoot, backupPath);
        await fs.copyFile(item.destinationFile, backupPath, fs.constants.COPYFILE_EXCL);
        if (!originalBytes.equals(await fs.readFile(backupPath))) throw new Error(`Backup berubah saat dibuat: ${backupPath}`);
      }

      const temporaryPath = `${item.destinationFile}.tmp-${randomUUID()}`;
      try {
        const sourceStat = await fs.lstat(item.sourceFile);
        if (!sourceStat.isFile() || sourceStat.isSymbolicLink()) throw new Error(`Sumber bukan file biasa: ${item.sourceFile}`);
        await fs.copyFile(item.sourceFile, temporaryPath, fs.constants.COPYFILE_EXCL);
        await assertNoSymlinkPath(destinationRoot, item.destinationFile);
        if (item.action === 'write' && await exists(item.destinationFile)) {
          throw new Error(`Target muncul selama pemasangan; tidak ditimpa: ${item.destinationFile}`);
        }
        if (item.action === 'replace') {
          const latest = await fs.readFile(item.destinationFile);
          if (!originalBytes.equals(latest)) throw new Error(`Target berubah selama pemasangan; tidak ditimpa: ${item.destinationFile}`);
        }
        await fs.rename(temporaryPath, item.destinationFile);
      } finally {
        await fs.rm(temporaryPath, { force: true });
      }
      applied.push({ ...item, backupPath });
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const item of applied.reverse()) {
      try {
        await assertNoSymlinkPath(destinationRoot, item.destinationFile);
        if (item.action === 'replace') {
          const temporaryPath = `${item.destinationFile}.rollback-${randomUUID()}`;
          try {
            await fs.copyFile(item.backupPath, temporaryPath, fs.constants.COPYFILE_EXCL);
            await fs.rename(temporaryPath, item.destinationFile);
          } finally {
            await fs.rm(temporaryPath, { force: true });
          }
        } else {
          await fs.rm(item.destinationFile, { force: true });
        }
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError.message);
      }
    }
    if (rollbackErrors.length) {
      throw new Error(`${error.message}; pemulihan sebagian gagal (${rollbackErrors.join('; ')}). Backup tersedia di ${backupRoot}`);
    }
    throw error;
  }
  return { plan, backupRoot: replaced.length ? backupRoot : null, dryRun: false };
}
