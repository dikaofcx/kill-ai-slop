// Usage: node scripts/sync-version.mjs [x.y.z]
// package.json at the repository root is the single source of truth.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const write = (relative, data) => fs.writeFileSync(path.join(root, relative), `${JSON.stringify(data, null, 2)}\n`);
const VERSIONED_FILES = [
  'cli/package.json', 'plugin.json', '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json',
  '.agents/plugins/marketplace.json', '.codex-plugin/plugin.json', '.cursor-plugin/plugin.json',
  '.cursor-plugin/marketplace.json', '.kimi-plugin/plugin.json', '.omp-plugin/marketplace.json',
  '.qoder-plugin/plugin.json',
];

function setVersions(value, version) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (key === 'version' && typeof child === 'string') value[key] = version;
    else setVersions(child, version);
  }
}

const arg = process.argv[2];
if (arg && !/^\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(arg)) {
  console.error(`"${arg}" is not a semver version`);
  process.exit(2);
}

const rootPackage = read('package.json');
if (arg) rootPackage.version = arg;
const version = rootPackage.version;
for (const relative of VERSIONED_FILES) {
  const manifest = read(relative);
  setVersions(manifest, version);
  write(relative, manifest);
}
write('package.json', rootPackage);
const lock = read('package-lock.json');
lock.version = version;
if (lock.packages?.['']) lock.packages[''].version = version;
write('package-lock.json', lock);
console.log(`All package and plugin manifests set to ${version} from root package.json.`);
