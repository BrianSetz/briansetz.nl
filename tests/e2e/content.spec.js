const { test, expect } = require('@playwright/test');
const { expectExternalLinkSafe } = require('./helpers');

// Exercises both branches of the conditional rendering in
// publications/projects/awards templates: items that DO have an external URL
// render as <a target=_blank>, items that DO NOT render as plain text.

test.describe('home content templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('every publication renders a title, authors, venue, and a year', async ({ page }) => {
    const items = page.locator('#publications ul[role="list"] > li');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    // Sample first and last to keep the test fast but still catch template drift.
    for (const i of [0, count - 1]) {
      const li = items.nth(i);
      // Either a linked title (a) or a plain span — both render the title text.
      const title = li.locator('a, span').first();
      await expect(title).toBeVisible();
      await expect(await title.innerText()).not.toEqual('');
      // Authors + venue lines.
      await expect(li.locator('p').first()).not.toHaveText('');
      await expect(li.locator('em')).toBeVisible();
      // Year <time> badge.
      await expect(li.locator('time')).toBeVisible();
    }
  });

  test('publications with an external URL open in a new tab with safe rel', async ({ page }) => {
    const externalPubLinks = page.locator('#publications a[target="_blank"]');
    const count = await externalPubLinks.count();
    expect(count).toBeGreaterThan(0);
    // Spot-check the first — the rel contract must hold for all.
    await expectExternalLinkSafe(externalPubLinks.first());
    // Assert every external pub link has a noopener rel (no individual hot spots).
    const rels = await externalPubLinks.evaluateAll((els) => els.map((e) => e.getAttribute('rel') || ''));
    for (const rel of rels) {
      expect(rel).toMatch(/noopener/);
      expect(rel).toMatch(/noreferrer/);
    }
  });

  test('internal PDF publication link resolves with 200 + PDF content type', async ({ page, request }) => {
    // Publication list contains one internal asset: /docs/setz2014sleepy.pdf.
    const pdfLink = page.locator('#publications a[href$=".pdf"]');
    await expect(pdfLink).toHaveCount(1);
    const href = await pdfLink.getAttribute('href');
    expect(href).toMatch(/^\/docs\/.+\.pdf$/);
    // It still opens in a new tab like other external references.
    await expectExternalLinkSafe(pdfLink);

    const res = await request.get(href);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/application\/pdf/);
  });

  test('projects render both linked and unlinked cards', async ({ page }) => {
    const section = page.locator('#projects');
    const linkedCards = section.locator('a[target="_blank"]');
    const unlinkedCards = section.locator(':scope .grid > div');

    const linkedCount = await linkedCards.count();
    const unlinkedCount = await unlinkedCards.count();
    // Data currently has both — if this changes the template branch isn't exercised.
    expect(linkedCount).toBeGreaterThan(0);
    expect(unlinkedCount).toBeGreaterThan(0);

    // Linked card safety and structure.
    for (let i = 0; i < linkedCount; i++) {
      await expectExternalLinkSafe(linkedCards.nth(i));
      await expect(linkedCards.nth(i).getByRole('heading', { level: 3 })).toBeVisible();
    }
    // Unlinked card structure — heading + description.
    for (let i = 0; i < unlinkedCount; i++) {
      await expect(unlinkedCards.nth(i).getByRole('heading', { level: 3 })).toBeVisible();
    }
  });

  test('awards render both linked and unlinked entries, year badge when present', async ({ page }) => {
    const items = page.locator('#awards ul[role="list"] > li');
    const total = await items.count();
    expect(total).toBeGreaterThan(0);

    const linked = items.locator('a[target="_blank"]');
    const linkedCount = await linked.count();
    expect(linkedCount).toBeGreaterThan(0); // at least one award has a URL
    expect(linkedCount).toBeLessThan(total); // at least one does not

    // Every linked award is a safe external anchor.
    for (let i = 0; i < linkedCount; i++) {
      await expectExternalLinkSafe(linked.nth(i));
    }

    // Year badge is optional per-template but all current data has it; assert
    // that at least the first item renders a <time datetime=…> badge.
    await expect(items.first().locator('time')).toBeVisible();
  });

  test('about section renders bio, interests, office, address, and a mailto link', async ({ page }) => {
    const about = page.locator('#about');
    await expect(about.getByRole('heading', { level: 2, name: /background/i })).toBeVisible();
    // At least one interest chip.
    await expect(about.locator('span.rounded-full').first()).toBeVisible();
    await expect(about.getByText(/^Office$/i)).toBeVisible();
    await expect(about.getByText(/^Address$/i)).toBeVisible();
    // Exactly one mailto link in the about section.
    await expect(about.locator('a[href^="mailto:"]')).toHaveCount(1);
    // (Obfuscation of the email literal in raw HTML is covered in seo.spec.js.)
  });

  test('activities section lists at least one venue chip', async ({ page }) => {
    const activities = page.locator('#activities');
    await expect(activities.getByRole('heading', { level: 2, name: /academic activities/i })).toBeVisible();
    const venues = activities.locator('ul[role="list"] > li');
    expect(await venues.count()).toBeGreaterThan(0);
  });

  test('teaching section renders each university with at least one course', async ({ page }) => {
    const teaching = page.locator('#teaching');
    const universities = teaching.getByRole('heading', { level: 3 });
    expect(await universities.count()).toBeGreaterThan(0);
    // Each university block contains a bordered list of courses — pick the
    // first and make sure at least one course row is rendered.
    const firstBlock = teaching.locator('h3 + div');
    await expect(firstBlock.locator('p.font-medium').first()).toBeVisible();
  });

  test('supervision section renders titles, authors and a type badge', async ({ page }) => {
    const items = page.locator('#supervision ul[role="list"] > li');
    expect(await items.count()).toBeGreaterThan(0);
    const first = items.first();
    await expect(first.locator('cite')).toBeVisible();
    await expect(first.locator('time')).toBeVisible();
    // Type badge (e.g. "Master Thesis").
    await expect(first.locator('span.rounded').first()).toBeVisible();
  });

  test('education section renders at least two entries with timeline connector logic', async ({ page }) => {
    const edu = page.locator('#education');
    const items = edu.locator('ul[role="list"] > li');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(2);
    // Connector line (aria-hidden div) appears on every item except the last.
    const connectors = edu.locator('div[aria-hidden="true"].bg-indigo-200, div[aria-hidden="true"].dark\\:bg-indigo-800');
    // There is a dot (aria-hidden span) per item plus a connector per non-last
    // item — the count of connector bars should equal count - 1.
    const connectorBars = await edu.locator('div.bg-indigo-200[aria-hidden="true"]').count();
    expect(connectorBars).toBe(count - 1);
  });
});
