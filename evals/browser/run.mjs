import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../..');
const require = createRequire(import.meta.url);
const playwrightCli = require.resolve('@playwright/test/cli');
const config = path.join(directory, 'playwright.config.mjs');
const usage = `Usage: npm run test:browser:target -- <url> [options] [-- <playwright options>]

Options:
  --url <url>                 Target URL (also accepted as the first argument)
  --path <path>               Route to test; defaults to the path in the URL or /
  --menu-toggle <selector>    Selector for the menu button
  --menu-panel <selector>     Selector for the controlled menu panel
  --visual-only               Skip the menu interaction check
  -h, --help                  Show this help

The target must be an HTTP(S) URL you control. EVAL_BASE_URL can be used instead
of <url>; EVAL_PATH and EVAL_MENU_* environment variables remain supported.`;

function fail(message) {
  console.error(`${message}\n\n${usage}`);
  process.exit(2);
}

const options = { playwrightArgs: [] };
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--') {
    options.playwrightArgs.push(...args.slice(i + 1));
    break;
  }
  if (arg === '-h' || arg === '--help') {
    console.log(usage);
    process.exit(0);
  }
  if (arg === '--visual-only') {
    options.visualOnly = true;
    continue;
  }
  if (['--url', '--base-url', '--path', '--menu-toggle', '--menu-panel'].includes(arg)) {
    const value = args[i + 1];
    if (!value || value.startsWith('--')) fail(`Missing value for ${arg}.`);
    i += 1;
    if (arg === '--url' || arg === '--base-url') options.url = value;
    if (arg === '--path') options.route = value;
    if (arg === '--menu-toggle') options.menuToggle = value;
    if (arg === '--menu-panel') options.menuPanel = value;
    continue;
  }
  if (arg.startsWith('-')) fail(`Unknown runner option: ${arg}. Put Playwright options after --.`);
  if (!options.url) {
    options.url = arg;
    continue;
  }
  fail(`Unexpected argument: ${arg}.`);
}

const targetInput = options.url || process.env.EVAL_BASE_URL;
if (!targetInput) fail('Provide a target URL, or set EVAL_BASE_URL.');

let target;
try {
  target = new URL(targetInput);
} catch {
  fail(`Invalid target URL: ${targetInput}`);
}
if (!['http:', 'https:'].includes(target.protocol) || !target.hostname || target.username || target.password) {
  fail('The target must be an HTTP(S) URL without embedded credentials.');
}

const env = { ...process.env };
if (options.url) {
  env.EVAL_BASE_URL = target.origin;
  if (options.route !== undefined) {
    if (!options.route.startsWith('/') || options.route.startsWith('//')) {
      fail('--path must be a same-origin path beginning with a single /.');
    }
    env.EVAL_PATH = options.route;
  } else if (process.env.EVAL_PATH) {
    env.EVAL_PATH = process.env.EVAL_PATH;
  } else {
    env.EVAL_PATH = `${target.pathname}${target.search}${target.hash}` || '/';
  }
} else if (options.route !== undefined) {
  if (!options.route.startsWith('/') || options.route.startsWith('//')) {
    fail('--path must be a same-origin path beginning with a single /.');
  }
  env.EVAL_PATH = options.route;
}
if (options.menuToggle) env.EVAL_MENU_TOGGLE = options.menuToggle;
if (options.menuPanel) env.EVAL_MENU_PANEL = options.menuPanel;
if (options.visualOnly) env.EVAL_SKIP_INTERACTIONS = '1';

const result = spawnSync(process.execPath, [
  playwrightCli,
  'test',
  '-c', config,
  ...options.playwrightArgs,
], {
  cwd: root,
  env,
  stdio: 'inherit',
});

if (result.error) {
  console.error(`Could not start Playwright: ${result.error.message}`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
