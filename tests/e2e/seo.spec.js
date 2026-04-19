const { test, expect } = require('@playwright/test');

// Assert that each page emits the SEO/meta contract the site-generator is
// responsible for: canonical URL, meta description, Open Graph, JSON-LD
// schema.org Person, CSP meta, and (on the home) an obfuscated email.

const PAGES = [
  { url: '/', label: 'home', canonical: /https:\/\/briansetz\.nl\/?$/ },
  { url: '/privacy/', label: 'privacy', canonical: /https:\/\/briansetz\.nl\/privacy\/?$/ },
  { url: '/this-does-not-exist', label: '404', canonical: /https:\/\/briansetz\.nl\/404\.html$/ },
];

for (const { url, label, canonical } of PAGES) {
  test.describe(`SEO meta — ${label}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(url);
    });

    test('title, description and canonical are present', async ({ page }) => {
      await expect(page).toHaveTitle(/.+/);
      const desc = page.locator('meta[name="description"]');
      await expect(desc).toHaveCount(1);
      const descContent = await desc.getAttribute('content');
      expect(descContent?.length || 0).toBeGreaterThan(20);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    });

    test('Open Graph + Twitter meta exist with an image', async ({ page }) => {
      for (const prop of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image']) {
        const content = await page.locator(`meta[property="${prop}"]`).getAttribute('content');
        expect(content, `missing ${prop}`).toBeTruthy();
      }
      for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
        await expect(page.locator(`meta[name="${name}"]`)).toHaveCount(1);
      }
    });

    test('JSON-LD Person schema is valid JSON with the expected shape', async ({ page }) => {
      const raw = await page.locator('script[type="application/ld+json"]').textContent();
      expect(raw).toBeTruthy();
      const data = JSON.parse(raw);
      expect(data['@type']).toBe('Person');
      expect(data.name).toBe('Brian Setz');
      expect(data.url).toBe('https://briansetz.nl/');
      expect(Array.isArray(data.alumniOf)).toBe(true);
      expect(data.alumniOf.length).toBeGreaterThan(0);
      expect(Array.isArray(data.sameAs)).toBe(true);
      expect(data.sameAs.length).toBeGreaterThan(0);
    });

    test('Content-Security-Policy meta is emitted', async ({ page }) => {
      const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
    });
  });
}

test.describe('email obfuscation', () => {
  test('raw HTML contains no plain-text rug.nl email literal', async ({ request }) => {
    // Check the raw bytes served to the network — page.content() would
    // serialize the live DOM with entities already decoded and mask the bug.
    const res = await request.get('/');
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).not.toContain('b.setz@rug.nl');
    // But the obfuscated form must be present (sanity-check the filter ran).
    expect(html).toMatch(/&#98;&#46;&#115;&#101;&#116;&#122;&#64;/);
  });
});
