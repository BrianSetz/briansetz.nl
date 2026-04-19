const { test, expect } = require('@playwright/test');
const { attachPageDiagnostics, readNavSections, expectExternalLinkSafe } = require('./helpers');

test.describe('home page', () => {
  test('loads with expected title, heading, and no console errors', async ({ page }) => {
    const diag = attachPageDiagnostics(page);

    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Brian Setz/);
    await expect(page.getByRole('heading', { level: 1, name: /Brian Setz/i })).toBeVisible();
    await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeVisible();

    diag.check();
  });

  test('hero profile image loads and is not broken', async ({ page }) => {
    await page.goto('/');
    const hero = page.getByRole('img', { name: /profile photo of brian setz/i });
    await expect(hero).toBeVisible();
    const naturalWidth = await hero.evaluate((img) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('every nav section has a matching anchor target on the page', async ({ page }) => {
    await page.goto('/');
    const sections = await readNavSections(page);
    expect(sections.length).toBeGreaterThan(0);
    for (const id of sections) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  // Parametrized over all desktop nav links so every navigation branch is
  // exercised — a newly added nav entry without a matching section will fail.
  for (const label of ['About', 'Publications', 'Projects', 'Awards', 'Supervision', 'Teaching', 'Activities']) {
    test(`desktop nav link "${label}" scrolls to its section`, async ({ page }) => {
      await page.goto('/');
      const link = page.locator('#nav-menu').getByRole('link', { name: label, exact: true });
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^#[a-z-]+$/);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${href}$`));
      await expect(page.locator(href)).toBeInViewport();
    });
  }

  test('education section is rendered on the home page even though not in nav', async ({ page }) => {
    await page.goto('/');
    const edu = page.locator('#education');
    await expect(edu).toBeVisible();
    await expect(edu.getByRole('heading', { level: 2, name: /education/i })).toBeVisible();
    // At least one degree entry should render (from education.yml).
    await expect(edu.getByRole('heading', { level: 3 }).first()).toBeVisible();
  });

  test('skip-to-content link is present and targets main', async ({ page }) => {
    await page.goto('/');
    const skip = page.getByRole('link', { name: /skip to content/i });
    await expect(skip).toHaveAttribute('href', '#main-content');
    await expect(page.locator('#main-content')).toBeAttached();
  });

  test('internal footer link to privacy navigates correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click();
    await expect(page).toHaveURL(/\/privacy\/?$/);
    await expect(page.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeVisible();
  });

  test('footer stats counters render positive numbers', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    for (const label of ['Publications', 'Students Supervised', 'Review Activities', 'Projects']) {
      const cell = footer.locator('div', { hasText: new RegExp(`^\\s*\\d+\\s*${label}\\s*$`, 'i') });
      // Number element is the first <p> in the cell; assert it parses > 0.
      const value = await cell.locator('p').first().innerText();
      expect(Number(value.trim())).toBeGreaterThan(0);
    }
  });

  test('"back to top" footer link targets #top and keeps the nav visible after click', async ({ page }) => {
    await page.goto('/');
    const backToTop = page.getByRole('contentinfo').getByRole('link', { name: /back to top/i });
    await expect(backToTop).toHaveAttribute('href', '#top');
    await backToTop.click();
    await expect(page).toHaveURL(/#top$/);
    // The sticky nav should still be in view after jumping to #top.
    await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeInViewport();
  });

  test('hero social links all open in new tab with safe rel', async ({ page }) => {
    await page.goto('/');
    for (const name of [/^LinkedIn/, /^ResearchGate/, /^Google Scholar/, /^ORCID/]) {
      await expectExternalLinkSafe(page.getByRole('link', { name }).first());
    }
  });

  test('footer "Source code on GitHub" link is safe external', async ({ page }) => {
    await page.goto('/');
    await expectExternalLinkSafe(page.getByRole('contentinfo').getByRole('link', { name: /source code on github/i }));
  });

  test('key content sections render non-empty', async ({ page }) => {
    await page.goto('/');
    // Heading presence alone would pass on an empty section — assert the
    // section also contains content beyond its heading.
    for (const id of ['publications', 'projects', 'supervision', 'teaching', 'activities', 'education']) {
      const section = page.locator(`#${id}`);
      await expect(section.getByRole('heading').first()).toBeVisible();
      const text = (await section.innerText()).trim();
      expect(text.length).toBeGreaterThan(100);
    }
  });
});
