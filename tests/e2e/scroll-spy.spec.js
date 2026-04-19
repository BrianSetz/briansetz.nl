const { test, expect } = require('@playwright/test');

// Scroll-spy in src/js/nav.js highlights the active section's nav link via
// an IntersectionObserver. Exercised by clicking a later nav link and
// asserting its anchor gets the `.active` class once the section scrolls in.

test.describe('scroll-spy', () => {
  test('clicking a later section assigns .active to its nav link', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('#nav-menu').getByRole('link', { name: 'Supervision', exact: true });
    await link.click();
    await expect(page.locator('#supervision')).toBeInViewport();
    // The observer's rootMargin (-20% / -70%) makes the active class stabilise
    // a moment after the scroll — Playwright's web-first assertion will retry.
    await expect(link).toHaveClass(/active/);
  });

  test('only one nav link carries .active at a time', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-menu').getByRole('link', { name: 'Publications', exact: true }).click();
    await expect(page.locator('#publications')).toBeInViewport();
    await expect(page.locator('#nav-menu a.active')).toHaveCount(1);
  });
});
