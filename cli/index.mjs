#!/usr/bin/env node
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { installSkills, listSkills } from './lib/install.mjs';
import { writeAuditTemplate } from './lib/audit-template.mjs';

const cliDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.basename(cliDir) === 'cli' ? path.dirname(cliDir) : cliDir;
const skillsRoot = path.join(root, 'skills');
const [command, ...args] = process.argv.slice(2);
const advancedCommands = new Set(['lint', 'hook', 'init', 'rules', 'contrast', '--version', '-v']);
class UsageError extends Error {}

function parseArgs(tokens) {
  const values = {};
  const flags = new Set();
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token.startsWith('--')) throw new UsageError(`Argumen tidak dikenal: ${token}`);
    const key = token.slice(2);
    if (['dry-run', 'replace'].includes(key)) {
      flags.add(key);
      continue;
    }
    const value = tokens[i + 1];
    if (!value || value.startsWith('--')) throw new UsageError(`Nilai untuk --${key} belum diberikan.`);
    values[key] = value;
    i += 1;
  }
  return { values, flags };
}

function printHelp() {
  console.log(`Kill AI Slop CLI

Perintah:
  list
      Tampilkan skill yang tersedia.
  install --target <dir> [--skills a,b] [--dry-run] [--replace]
      Pasang skill ke direktori pilihan; konflik berhenti sebelum menulis.
  audit --title <judul> --output <file> [--surface <area>] [--stack <stack>] [--viewport <ukuran>]
      Buat template audit berbasis bukti; file yang sudah ada tidak ditimpa.
  lint [paths...] [--format text|json|github] [--strict] [--max-warnings N] [--config file]
      Cari sinyal pola melalui heuristik teks; default hanya memberi peringatan.
  contrast <fg> <bg> | rules | hook
      Periksa rasio warna, daftar aturan, atau jalankan hook Claude Code advisory.
  init --agent <name|all> [--global] [--dry-run] [--replace]
      Alias pemasangan berdasarkan agent. --force juga diterima sebagai alias --replace dan membuat backup.
  --version | help

Contoh:
  node cli/index.mjs list
  node cli/index.mjs install --target ./.agents/skills --dry-run
  node cli/index.mjs lint src --format github --max-warnings 10
  node cli/index.mjs audit --title "Checkout" --surface "mobile web" --output ./checkout-audit.md

Linter bersifat heuristik, bukan hakim visual. Gunakan --strict hanya bila tim memilih kebijakan itu.`);
}

function runAdvanced(command, commandArgs) {
  const runner = path.join(cliDir, 'linter.mjs');
  const result = spawnSync(process.execPath, [runner, command, ...commandArgs], { stdio: 'inherit' });
  if (result.error) throw new Error(`CLI linter tidak dapat dijalankan: ${result.error.message}`);
  return result.status ?? 1;
}

try {
  if (!command) {
    printHelp();
    process.exitCode = 2;
  } else if (command === 'help' || command === '--help' || command === '-h') {
    printHelp();
  } else if (advancedCommands.has(command)) {
    process.exitCode = runAdvanced(command, args);
  } else if (command === 'list') {
    const skills = await listSkills(skillsRoot);
    for (const skill of skills) console.log(`${skill.name}\n  ${skill.description}`);
  } else if (command === 'install') {
    const { values, flags } = parseArgs(args);
    if (!values.target) throw new UsageError('Gunakan --target <direktori>. Jalankan help untuk contoh.');
    const skillNames = values.skills ? values.skills.split(',').map((name) => name.trim()).filter(Boolean) : undefined;
    const result = await installSkills({
      sourceRoot: skillsRoot,
      target: values.target,
      skillNames,
      dryRun: flags.has('dry-run'),
      replace: flags.has('replace'),
    });
    const counts = { write: 0, replace: 0, unchanged: 0 };
    for (const item of result.plan) counts[item.action] += 1;
    const verb = result.dryRun ? 'Rencana' : 'Hasil';
    console.log(`${verb}: ${counts.write} file baru, ${counts.replace} file diganti, ${counts.unchanged} tidak berubah.`);
    if (result.backupRoot) console.log(`Backup konflik: ${result.backupRoot}`);
    if (result.dryRun) console.log('Dry-run: tidak ada file yang ditulis.');
  } else if (command === 'audit') {
    const { values } = parseArgs(args);
    if (!values.title) throw new UsageError('Gunakan --title <judul>.');
    const output = await writeAuditTemplate({
      title: values.title,
      surface: values.surface,
      stack: values.stack,
      viewport: values.viewport,
      output: values.output,
    });
    console.log(`Template audit dibuat: ${output}`);
  } else {
    throw new UsageError(`Perintah tidak dikenal: ${command}. Jalankan help.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = error instanceof UsageError ? 2 : 1;
}
