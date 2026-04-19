const { test, expect } = require('@playwright/test');

// Dedicated coverage for the theme toggle: class flip, icon swap, localStorage
// persistence across reloads, and the no-FOUC script applying the stored
// theme before paint.

async function clearTheme(page) {
  // Can't use addInitScript for this — it runs on every navigation (including
  // reload), which would defeat the persistence test. Do it once via an empty
  // document instead, so we start each test with no stored preference.
  await page.goto('/');
  await page.evaluate(() => { try { localStorage.removeItem('theme'); } catch {} });
}

test.describe('theme toggle', () => {
  test('toggle flips the dark class, swaps the icon, and updates aria-label', async ({ page }) => {
    await clearTheme(page);
    await page.reload();
    const html = page.locator('html');
    const sun = page.locator('#theme-icon-sun');
    const moon = page.locator('#theme-icon-moon');
    const toggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });

    const initiallyDark = await html.evaluate((el) => el.classList.contains('dark'));
    // Exactly one icon must be visible before toggling.
    if (initiallyDark) {
      await expect(sun).toBeVisible();
      await expect(moon).toBeHidden();
    } else {
      await expect(moon).toBeVisible();
      await expect(sun).toBeHidden();
    }

    await toggle.click();

    const nowDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(nowDark).toBe(!initiallyDark);
    if (nowDark) {
      await expect(sun).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-label', /switch to light mode/i);
    } else {
      await expect(moon).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-label', /switch to dark mode/i);
    }
  });

  test('theme choice persists across a full reload', async ({ page }) => {
    await clearTheme(page);
    // Force the target state deterministically so we're not dependent on
    // whatever the user's default preference would have produced.
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.reload();

    const dark = await page.locator('html').evaluate((el) => el.classList.contains('dark'));
    expect(dark).toBe(true);

    await page.evaluate(() => localStorage.setItem('theme', 'light'));
    await page.reload();
    const stillDark = await page.locator('html').evaluate((el) => el.classList.contains('dark'));
    expect(stillDark).toBe(false);
  });

  test('toggle also works on the simplified nav of the privacy page', async ({ page }) => {
    await clearTheme(page);
    await page.goto('/privacy/');
    const html = page.locator('html');
    const initiallyDark = await html.evaluate((el) => el.classList.contains('dark'));
    await page.getByRole('button', { name: /switch to (dark|light) mode/i }).click();
    const nowDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(nowDark).toBe(!initiallyDark);
  });

  test('theme-ready class is added after first paint', async ({ page }) => {
    await clearTheme(page);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-ready/);
  });
});
