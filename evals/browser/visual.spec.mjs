import { expect, test } from '@playwright/test';

const route = process.env.EVAL_PATH || '/';
const viewports = [
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`${viewport.name}: loads without horizontal page overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `Expected ${route} to return a successful response`).toBeTruthy();
    await page.evaluate(async () => {
      await document.fonts.ready;
      return true;
    });
    await expect(page.locator('body')).toBeVisible();

    const widths = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    }));
    expect(widths.content, `Document width ${widths.content}px exceeds viewport ${widths.viewport}px`).toBeLessThanOrEqual(widths.viewport + 1);

    await page.screenshot({
      path: test.info().outputPath(`${viewport.name}.png`),
      fullPage: true,
      animations: 'disabled',
    });
  });
}
