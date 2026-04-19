const { test, expect } = require('@playwright/test');
const { attachPageDiagnostics, expectExternalLinkSafe } = require('./helpers');

test.describe('privacy page', () => {
  test('loads successfully with no console errors', async ({ page }) => {
    const diag = attachPageDiagnostics(page);
    const response = await page.goto('/privacy/');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Privacy Policy/i);
    await expect(page.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeVisible();

    // Core section headings the page is known to contain.
    for (const name of ['Data Controller', 'Data Collection', 'Local Storage', 'Hosting', 'External Links', 'Your Rights', 'Changes']) {
      await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
    }
    diag.check();
  });

  test('uses the simplified "← Home" nav (no menu or mobile toggle)', async ({ page }) => {
    await page.goto('/privacy/');
    await expect(page.locator('#nav-menu')).toHaveCount(0);
    await expect(page.locator('#nav-toggle')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: /main navigation/i }).getByRole('link', { name: /home/i })).toBeVisible();
  });

  test('external GitHub Privacy Statement link opens in new tab with safe rel', async ({ page }) => {
    await page.goto('/privacy/');
    await expectExternalLinkSafe(page.getByRole('link', { name: /github's privacy statement/i }));
  });

  test('"Last updated" line is present', async ({ page }) => {
    await page.goto('/privacy/');
    await expect(page.getByText(/last updated:/i)).toBeVisible();
  });

  test('back-to-home link returns to the home page', async ({ page }) => {
    await page.goto('/privacy/');
    await page.getByRole('link', { name: /back to home/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1, name: /Brian Setz/i })).toBeVisible();
  });
});
