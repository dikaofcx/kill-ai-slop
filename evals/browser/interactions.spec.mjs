import { expect, test } from '@playwright/test';

const route = process.env.EVAL_PATH || '/';
const toggleSelector = process.env.EVAL_MENU_TOGGLE || '[data-eval-menu-toggle]';
const panelSelector = process.env.EVAL_MENU_PANEL || '[data-eval-menu-panel]';

test('configured menu opens by keyboard and pointer, then closes with Escape', async ({ page }) => {
  test.skip(process.env.EVAL_SKIP_INTERACTIONS === '1', 'Menu interaction check disabled by --visual-only.');
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), `Expected ${route} to return a successful response`).toBeTruthy();

  const toggle = page.locator(toggleSelector);
  const panel = page.locator(panelSelector);
  await expect(toggle).toBeVisible();
  await expect(panel).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  const panelId = await panel.getAttribute('id');
  expect(panelId, 'The controlled menu panel must have an id').toBeTruthy();
  await expect(toggle).toHaveAttribute('aria-controls', String(panelId));

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
});
