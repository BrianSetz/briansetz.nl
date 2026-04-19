const { test, expect } = require('@playwright/test');

// Static non-HTML outputs of the generator. These aren't visited in any other
// spec — broken headers or missing files would ship silently otherwise.

test.describe('static assets', () => {
  test('sitemap.xml serves XML listing homepage and privacy', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/xml/);
    const body = await res.text();
    expect(body).toMatch(/<loc>https:\/\/briansetz\.nl\/<\/loc>/);
    expect(body).toMatch(/<loc>https:\/\/briansetz\.nl\/privacy\/<\/loc>/);
  });

  test('robots.txt is served', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/text\/plain/);
  });

  test('llms.txt references publications and the privacy page', async ({ request }) => {
    const res = await request.get('/llms.txt');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/text\/plain/);
    const body = await res.text();
    expect(body).toContain('# Brian Setz');
    expect(body).toContain('## Publications');
    expect(body).toContain('## Projects');
    expect(body).toMatch(/Privacy Policy/);
    // Internal PDF publication must be absolutized in llms.txt.
    expect(body).toMatch(/https:\/\/briansetz\.nl\/docs\/setz2014sleepy\.pdf/);
  });

  test('favicon.svg is served with an SVG content type', async ({ request }) => {
    const res = await request.get('/favicon.svg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/svg/);
  });

  test('profile publication PDF is served as application/pdf', async ({ request }) => {
    const res = await request.get('/docs/setz2014sleepy.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/application\/pdf/);
    const body = await res.body();
    // PDF magic header.
    expect(body.slice(0, 4).toString()).toBe('%PDF');
  });

  test('hero webp and jpg variants both resolve', async ({ request }) => {
    for (const path of ['/img/profile-192.jpg', '/img/profile.jpg', '/img/profile-192.webp', '/img/profile.webp', '/img/og.jpg']) {
      const res = await request.get(path);
      expect(res.status(), `status for ${path}`).toBe(200);
      expect(res.headers()['content-type'], `content-type for ${path}`).toMatch(/image\//);
    }
  });

  test('stylesheet and JS bundles are served', async ({ request }) => {
    for (const path of ['/css/main.css', '/css/noscript.css', '/js/theme.js', '/js/nav.js', '/js/reveal.js']) {
      const res = await request.get(path);
      expect(res.status(), `status for ${path}`).toBe(200);
    }
  });
});
