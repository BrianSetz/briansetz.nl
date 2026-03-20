# Security Policy

## Supported versions

Only the latest version on the `main` branch is actively maintained.

## Scope

This is a fully static website with no server-side logic, no database, and no user authentication. The relevant attack surface is limited to:

- **Supply-chain vulnerabilities** in npm dependencies (monitored by Dependabot)
- **GitHub Actions workflow** security issues (e.g., script injection, compromised actions)
- **Content Security Policy** misconfiguration

Reports about the deployed website's content (typos, broken links, factual errors) are welcome as regular [issues](https://github.com/briansetz/briansetz.nl/issues) — they are not security vulnerabilities.

## Reporting a vulnerability

**Do not report security vulnerabilities as public GitHub issues.**

Please use GitHub's private [Security Advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) feature:

1. Go to the **Security** tab of this repository
2. Click **Report a vulnerability**
3. Fill in the details

You can also contact the maintainer directly at **b.setz@rug.nl** with `[SECURITY]` in the subject line.

## Response

I aim to acknowledge security reports within **72 hours** and provide an initial assessment within **7 days**.
