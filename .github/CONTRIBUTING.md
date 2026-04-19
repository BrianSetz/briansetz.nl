# Contributing

Thank you for your interest in contributing! This is a personal academic CV site, so the scope of contributions is intentionally narrow.

## What contributions are welcome

- **Bug fixes** — layout issues, broken links, accessibility problems, build errors
- **Template improvements** — making the Eleventy/Nunjucks/Tailwind templates more reusable or maintainable
- **Documentation** — improving the README or setup instructions
- **Typo/factual corrections** — errors in publicly visible content

## What is out of scope

- Unsolicited redesigns or visual style changes
- Changes to personal content (`src/_data/`, `src/docs/`, `src/img/`) — this data belongs to the site owner
- New features that are not generally useful as part of a reusable CV template

If you are unsure whether your contribution is in scope, open an issue first.

## Getting started

1. Fork the repository and clone your fork
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev` (available at `http://localhost:8080`)
4. Make your changes
5. Run a production build to verify nothing is broken: `npm run build`
6. Run the end-to-end tests: `npm run test:e2e:install` (one-time), then `npm run test:e2e`
7. Open a pull request against the `main` branch

## Pull requests

- Keep pull requests focused — one fix or feature per PR
- Fill in the pull request template fully
- Link to any related issue(s)
- Ensure the site builds without errors before submitting

## Code style

- Nunjucks templates in `src/_includes/` — keep consistent indentation (2 spaces)
- Tailwind utility classes — prefer existing patterns in the codebase
- YAML data files — maintain consistent structure with existing files

## Reporting issues

Use the [bug report](.github/ISSUE_TEMPLATE/bug_report.yml) or [feature request](.github/ISSUE_TEMPLATE/feature_request.yml) issue templates.

For security issues, see [SECURITY.md](SECURITY.md).
