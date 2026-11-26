import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../..');
const fixtureUrl = 'http://127.0.0.1:4173';
const targetUrl = process.env.EVAL_BASE_URL;

export default defineConfig({
  testDir: directory,
  testMatch: '*.spec.mjs',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: 'list',
  outputDir: path.join(root, 'test-results/browser'),
  use: {
    baseURL: targetUrl || fixtureUrl,
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  ...(targetUrl ? {} : {
    webServer: {
      command: 'node evals/browser/fixture-server.mjs',
      cwd: root,
      url: `${fixtureUrl}/healthz`,
      reuseExistingServer: !process.env.CI,
      timeout: 10_000,
    },
  }),
});
