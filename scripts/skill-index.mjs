import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function readFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error('SKILL.md tidak memiliki frontmatter YAML di awal file.');
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([a-z][a-z0-9_-]*):\s*(.*?)\s*$/i);
    if (!field) continue;
    fields[field[1]] = field[2].replace(/^['"]|['"]$/g, '');
  }
  return fields;
}

export function buildSkillIndex(root, overrides = new Map()) {
  const skillsDir = path.join(root, 'skills');
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const skillPath = path.join(skillsDir, entry.name, 'SKILL.md');
      const relativePath = path.relative(root, skillPath).split(path.sep).join('/');
      const content = overrides.get(relativePath) ?? (fs.existsSync(skillPath) ? fs.readFileSync(skillPath, 'utf8') : null);
      if (!content) throw new Error(`Skill ${entry.name} tidak memiliki SKILL.md.`);
      const fields = readFrontmatter(content);
      if (!fields.name || !fields.description) throw new Error(`Skill ${entry.name} wajib memiliki name dan description.`);
      return {
        name: fields.name,
        description: fields.description,
        path: `./${entry.name}/SKILL.md`,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const names = new Set();
  for (const entry of entries) {
    if (names.has(entry.name)) throw new Error(`Nama skill duplikat: ${entry.name}`);
    names.add(entry.name);
  }
  return { version: 1, skills: entries };
}

export function renderSkillIndex(root, overrides = new Map()) {
  return `${JSON.stringify(buildSkillIndex(root, overrides), null, 2)}\n`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const output = path.join(root, 'skills', 'index.json');
  const rendered = renderSkillIndex(root);
  fs.writeFileSync(output, rendered, 'utf8');
  console.log(`Indeks skill ditulis: ${path.relative(root, output)}`);
}
