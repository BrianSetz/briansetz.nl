# briansetz.nl

Personal academic CV and portfolio site for [Brian Setz](https://briansetz.nl), Lead of the Digital Lab at the University of Groningen.

**Live site:** [briansetz.nl](https://briansetz.nl) · [briansetz.github.io/briansetz.nl](https://briansetz.github.io/briansetz.nl/)

---

## Tech stack

- [Eleventy](https://www.11ty.dev/) (v3) — static site generator with Nunjucks templates
- [Tailwind CSS](https://tailwindcss.com/) (v4) — utility-first CSS
- [Sharp](https://sharp.pixelplumbing.com/) — image processing (resizing, WebP conversion, OG card generation)
- [Playwright](https://playwright.dev/) — end-to-end browser tests
- [html-validate](https://html-validate.org/), [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci), [lychee](https://github.com/lycheeverse/lychee) — QA linters
- [GitHub Pages](https://pages.github.com/) — hosting and deployment via GitHub Actions

## Getting started

**Prerequisites:** Node.js 18+ (CI runs on Node 24)

```bash
npm install
npm run dev
```

The site is served at `http://localhost:8080` with live reload.

| Command | Description |
|---|---|
| `npm run dev` | Start Eleventy + Tailwind in watch mode (runs image pipeline once first) |
| `npm run build` | Production build (output to `_site/`) |
| `npm run build:11ty` | Eleventy only |
| `npm run build:img` | Image pipeline only (Sharp) |
| `npm run build:css` | Tailwind CSS only |
| `npm run serve:static` | Serve `_site/` on `http://localhost:4173` (static, no watch — mimics GitHub Pages) |
| `npm run lint:html` | Validate HTML in `_site/` with html-validate |
| `npm run lint:links` | Check internal links with lychee (offline, fragments) |
| `npm run lint:lighthouse` | Run Lighthouse CI against the built site |
| `npm run test:e2e` | Run Playwright end-to-end tests against `_site/` |
| `npm run test:e2e:ui` | Open Playwright's interactive UI mode |
| `npm run test:e2e:install` | Install the Chromium browser Playwright needs (one-time) |

## Image pipeline

Place a high-resolution square portrait at `src/img/profile-full.jpg` (JPEG, ≥ 384 px). Running `npm run build` (or `npm run build:img`) will automatically generate all required variants in `_site/img/`:

| Output file | Dimensions | Use |
|---|---|---|
| `profile.jpg` / `profile.webp` | 384 × 384 | Hero photo (2× retina) |
| `profile-192.jpg` / `profile-192.webp` | 192 × 192 | Hero photo (1×) + apple-touch-icon |
| `og.jpg` | 1200 × 630 | Open Graph / Twitter Card social preview |

The source file (`profile-full.jpg`) is never served publicly — the build step removes it from the output directory along with any other legacy image files.

## Customising the content

All site content lives in `src/_data/`. Edit the YAML files to update your own information:

| File | Contents |
|---|---|
| `site.yml` | Name, title, bio, email, social links, SEO metadata, OG image config |
| `education.yml` | Degrees and institutions |
| `publications.yml` | Journal and conference papers |
| `projects.yml` | Research and teaching projects |
| `teaching.yml` | Courses taught |
| `supervision.yml` | PhD / MSc / BSc students supervised |
| `awards.yml` | Prizes and honours |
| `activities.yml` | Community service, committees, reviewing |

Templates are in `src/_includes/sections/`. The base layout is `src/_includes/base.njk`.

## Testing

End-to-end tests live in [tests/e2e/](tests/e2e/) and run against the **generated** `_site/` — a tiny [static server](tests/e2e/serve.mjs) emulates GitHub Pages (directory URLs → `index.html`, unknown paths → `404.html` with status 404) so tests exercise production-shaped URLs.

The suite is split across two Playwright projects configured in [playwright.config.js](playwright.config.js):

| Project | Runs | Notes |
|---|---|---|
| `chromium` | desktop specs | Skips `responsive.spec.js` |
| `mobile-chromium` | `responsive.spec.js` only | Pixel 5 viewport |

It covers every meaningful code path in the generator's output:

- All three page types — home, privacy, 404 — and both nav layouts (`fullNav` true/false)
- Every nav link → section navigation (parametrized), including the `#education` section that's rendered but not in nav
- Conditional template branches in `publications`, `projects`, and `awards` (linked vs. unlinked variants, plus the internal `/docs/*.pdf` publication link)
- Theme toggle: class flip, icon swap, `aria-label`, `theme-ready`, persistence across reload, simplified-nav pages
- Mobile nav: open/close, Escape-to-close + focus return, link-click closes, desktop menu hidden on mobile
- Scroll-spy `.active` class moves with the viewed section
- External-link safety (`target="_blank"` + `rel="noopener noreferrer"`) across hero, footer, publications, projects, awards, privacy
- SEO/meta: title, description, canonical, Open Graph, Twitter, JSON-LD `Person` (parsed + shape), CSP `meta`, email obfuscation
- Non-HTML outputs: `sitemap.xml`, `robots.txt`, `llms.txt`, `favicon.svg`, the publication PDF, image variants, CSS and JS bundles

Run the suite locally with:

```bash
npm run build
npm run test:e2e:install   # one-time — downloads Chromium
npm run test:e2e
```

The Playwright config auto-spawns `npm run serve:static` and waits for it on `http://localhost:4173`. Use `npm run test:e2e:ui` for an interactive debugger.

## CI / CD

The [GitHub Actions workflow](.github/workflows/deploy.yml) runs on every push to `main` and on pull requests. It has four jobs:

| Job | What it does |
|---|---|
| `build` | Runs `npm run build`, uploads `_site/` as a Pages artifact |
| `qa` | Validates HTML (`html-validate`), checks internal links (lychee), runs Lighthouse CI |
| `e2e` | Installs Chromium and runs the Playwright suite; uploads `playwright-report/` (and traces on failure) as workflow artifacts |
| `deploy` | Deploys to GitHub Pages — only runs on `main` after `build`, `qa`, and `e2e` pass |

`qa` and `e2e` run in parallel after `build`. Lighthouse score thresholds are configured in [.lighthouserc.json](.lighthouserc.json). HTML validation rules are in [.htmlvalidate.json](.htmlvalidate.json).

To host at a subpath (e.g. `username.github.io/repo-name`), set the `ELEVENTY_PATH_PREFIX` environment variable in the workflow to `/repo-name/`.

## License

The **source code and templates** in this repository are licensed under the [MIT License](LICENSE).

> **Note:** The personal content in `src/_data/`, `src/docs/`, and `src/img/` — including publications, CV data, and profile images — is © Brian Setz, all rights reserved, and is **not** covered by the MIT License.
