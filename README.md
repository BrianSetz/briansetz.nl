# briansetz.nl

Personal academic CV and portfolio site for [Brian Setz](https://briansetz.nl), Lead of the Digital Lab at the University of Groningen.

**Live site:** [briansetz.nl](https://briansetz.nl) · [briansetz.github.io/briansetz.nl](https://briansetz.github.io/briansetz.nl/)

---

## Tech stack

- [Eleventy](https://www.11ty.dev/) (v3) — static site generator with Nunjucks templates
- [Tailwind CSS](https://tailwindcss.com/) (v4) — utility-first CSS
- [Sharp](https://sharp.pixelplumbing.com/) — image processing (resizing, WebP conversion, OG card generation)
- [GitHub Pages](https://pages.github.com/) — hosting and deployment via GitHub Actions

## Getting started

**Prerequisites:** Node.js 18+

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
| `npm run lint:html` | Validate HTML in `_site/` with html-validate |

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

## CI / CD

The [GitHub Actions workflow](.github/workflows/deploy.yml) runs on every push to `main` and on pull requests. It has three jobs:

| Job | What it does |
|---|---|
| `build` | Runs `npm run build`, uploads `_site/` as a Pages artifact |
| `qa` | Validates HTML (`html-validate`), checks internal links (lychee), runs Lighthouse CI |
| `deploy` | Deploys to GitHub Pages — only runs on `main` after both `build` and `qa` pass |

Lighthouse score thresholds are configured in [.lighthouserc.json](.lighthouserc.json). HTML validation rules are in [.htmlvalidate.json](.htmlvalidate.json).

To host at a subpath (e.g. `username.github.io/repo-name`), set the `ELEVENTY_PATH_PREFIX` environment variable in the workflow to `/repo-name/`.

## License

The **source code and templates** in this repository are licensed under the [MIT License](LICENSE).

> **Note:** The personal content in `src/_data/`, `src/docs/`, and `src/img/` — including publications, CV data, and profile images — is © Brian Setz, all rights reserved, and is **not** covered by the MIT License.
