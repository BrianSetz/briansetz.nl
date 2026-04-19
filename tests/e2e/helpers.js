// Shared helpers for e2e tests.

const { expect } = require('@playwright/test');

// Attach listeners that collect browser console errors and failed requests
// for the current page. Returns a `check()` function that asserts none
// occurred since attachment — call it after navigation/interaction.
function attachPageDiagnostics(page) {
  const consoleErrors = [];
  const failedRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`pageerror: ${err.message}`);
  });
  page.on('requestfailed', (req) => {
    // Ignore favicon probes and fonts blocked by offline CI occasionally;
    // keep everything else so regressions surface.
    const url = req.url();
    if (url.endsWith('/favicon.ico')) return;
    failedRequests.push(`${req.method()} ${url} — ${req.failure()?.errorText}`);
  });

  return {
    check() {
      if (consoleErrors.length || failedRequests.length) {
        const lines = [
          consoleErrors.length ? `Console errors:\n  - ${consoleErrors.join('\n  - ')}` : '',
          failedRequests.length ? `Failed requests:\n  - ${failedRequests.join('\n  - ')}` : '',
        ].filter(Boolean).join('\n');
        throw new Error(`Page diagnostics failed:\n${lines}`);
      }
    },
  };
}

// Section IDs linked from the main desktop nav (derived from the DOM so the
// suite tracks template changes without touching this file).
async function readNavSections(page) {
  return page.$$eval('#nav-menu .nav-link', (links) =>
    links
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && h.startsWith('#'))
      .map((h) => h.slice(1))
  );
}

// Assert an external link has target=_blank and a rel that blocks the
// tabnabbing/referrer leak vector. Accepts a Playwright Locator.
async function expectExternalLinkSafe(linkLocator) {
  await expect(linkLocator).toHaveAttribute('target', '_blank');
  await expect(linkLocator).toHaveAttribute('rel', /noopener/);
  await expect(linkLocator).toHaveAttribute('rel', /noreferrer/);
}

module.exports = { attachPageDiagnostics, readNavSections, expectExternalLinkSafe };
