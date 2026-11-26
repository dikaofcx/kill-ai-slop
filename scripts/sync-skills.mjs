import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSkillIndex } from './skill-index.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const sourceNames = ['SKILL.md', 'skills.md', 'soul.md', 'agents.md'];
const sourceText = Object.fromEntries(sourceNames.map((name) => [name, fs.readFileSync(path.join(root, name), 'utf8')]));

function stripFrontmatter(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
}

const bundledSkill = sourceText['SKILL.md']
  .replaceAll('](agents.md)', '](references/agents.md)')
  .replaceAll('](skills.md)', '](references/skills.md)')
  .replaceAll('](soul.md)', '](references/soul.md)');
const coreOverrides = new Map([['skills/kill-ai-slop/SKILL.md', bundledSkill]]);

const generated = new Map([
  ['skills/kill-ai-slop/SKILL.md', bundledSkill],
  ['skills/kill-ai-slop/references/skills.md', sourceText['skills.md']],
  ['skills/kill-ai-slop/references/soul.md', sourceText['soul.md']],
  ['skills/kill-ai-slop/references/agents.md', sourceText['agents.md']],
  ['skills/index.json', renderSkillIndex(root, coreOverrides)],
]);

generated.set('antislop.md', [
  '# Kill AI Slop — Prompt Satu File',
  '',
  '> Berkas ini dihasilkan dari `SKILL.md`, `skills.md`, `soul.md`, dan `agents.md`. Ubah sumbernya, lalu jalankan `npm run sync-skills`.',
  '',
  '## Instruksi inti',
  '',
  stripFrontmatter(sourceText['SKILL.md']),
  '',
  '## Panduan praktis',
  '',
  sourceText['skills.md'].trim(),
  '',
  '## Prinsip visual',
  '',
  sourceText['soul.md'].trim(),
  '',
  '## Playbook agent',
  '',
  sourceText['agents.md'].trim(),
  '',
].join('\n'));

const differences = [];
for (const [relativePath, content] of generated) {
  const absolutePath = path.join(root, relativePath);
  const current = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : null;
  if (current === content) continue;
  differences.push(relativePath);
  if (!checkOnly) {
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content, 'utf8');
  }
}

if (checkOnly && differences.length) {
  console.error(`Berkas generated berbeda: ${differences.join(', ')}. Jalankan npm run sync-skills.`);
  process.exitCode = 1;
} else if (checkOnly) {
  console.log('Sumber dan bundel skill sinkron.');
} else {
  console.log(`Sinkronisasi selesai (${generated.size} berkas generated diperiksa).`);
}
