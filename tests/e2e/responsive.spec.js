const { test, expect } = require('@playwright/test');
const { attachPageDiagnostics } = require('./helpers');

// This spec only runs under the `mobile-chromium` project (see playwright.config.js),
// so the device viewport and user-agent are already set to Pixel 5.
test.describe('mobile layout', () => {
  test('home page renders on a small viewport without console errors', async ({ page }) => {
    const diag = attachPageDiagnostics(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /Brian Setz/i })).toBeVisible();
    diag.check();
  });

  test('desktop menu is hidden on mobile', async ({ page }) => {
    await page.goto('/');
    // Tailwind's `hidden md:flex` keeps the desktop list out of flow below md.
    await expect(page.locator('#nav-menu')).toBeHidden();
    await expect(page.getByRole('button', { name: /toggle menu/i })).toBeVisible();
  });

  test('mobile nav toggle opens and closes the menu, and closes on link click', async ({ page }) => {
    await page.goto('/');

    const toggle = page.getByRole('button', { name: /toggle menu/i });
    const menu = page.locator('#nav-mobile');

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();

    // Clicking an item closes the menu (per nav.js behaviour).
    await menu.getByRole('link', { name: 'Publications' }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page).toHaveURL(/#publications$/);
  });

  test('Escape closes the mobile menu and restores focus to the toggle', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: /toggle menu/i });
    const menu = page.locator('#nav-mobile');

    await toggle.click();
    await expect(menu).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('hero image still renders at mobile widths', async ({ page }) => {
    await page.goto('/');
    const hero = page.getByRole('img', { name: /profile photo of brian setz/i });
    await expect(hero).toBeVisible();
    const naturalWidth = await hero.evaluate((img) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('publications section (a content-heavy page region) is reachable from the mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /toggle menu/i }).click();
    await page.locator('#nav-mobile').getByRole('link', { name: 'Publications' }).click();
    const section = page.locator('#publications');
    await expect(section).toBeInViewport();
    // Content-heavy on mobile — at least one publication item should render.
    await expect(section.locator('ul[role="list"] > li').first()).toBeVisible();
  });
});
