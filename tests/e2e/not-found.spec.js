const { test, expect } = require('@playwright/test');

test.describe('404 page', () => {
  // Note: we intentionally don't use attachPageDiagnostics here — Chromium
  // logs every 404 response as a console error, which is expected for this
  // page. The status-code assertion below is the authoritative signal.
  test('unknown path returns the 404 page with status 404', async ({ page }) => {
    const response = await page.goto('/this-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(/Page not found/i);
    await expect(page.getByRole('heading', { level: 1, name: /page not found/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /go back home/i })).toBeVisible();
  });

  test('uses the simplified nav (no menu, no mobile toggle)', async ({ page }) => {
    await page.goto('/nope');
    // The full nav has a <ul id="nav-menu"> and a #nav-toggle button.
    await expect(page.locator('#nav-menu')).toHaveCount(0);
    await expect(page.locator('#nav-toggle')).toHaveCount(0);
    await expect(page.locator('#nav-mobile')).toHaveCount(0);
    // But there IS a "← Home" shortcut and a working theme toggle.
    await expect(page.getByRole('navigation', { name: /main navigation/i }).getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.locator('#theme-toggle')).toBeVisible();
  });

  test('skip-to-content link is present on the 404 page', async ({ page }) => {
    await page.goto('/also-missing');
    const skip = page.getByRole('link', { name: /skip to content/i });
    await expect(skip).toHaveAttribute('href', '#main-content');
    await expect(page.locator('#main-content')).toBeAttached();
  });

  test('"go back home" link returns to root', async ({ page }) => {
    await page.goto('/nope');
    await page.getByRole('link', { name: /go back home/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1, name: /Brian Setz/i })).toBeVisible();
  });
});
