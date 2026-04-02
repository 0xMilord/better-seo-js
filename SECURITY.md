# Security policy

## Supported versions

Security fixes are applied to the **latest minor** of the current **major** release line, and selectively backported to older majors when practical. Check the repo **Releases** page for what is actively maintained.

## Reporting a vulnerability

**Please do not** open a public GitHub issue for security reports.

1. Open a **[GitHub Security Advisory](https://github.com/OWNER/better-seo-js/security/advisories/new)** (replace `OWNER` with the organization or user that owns the repository), **or**
2. Email maintainers at a dedicated security contact once published (update this file with the address when available).

Include:

- Description of the issue and impact
- Steps to reproduce (proof-of-concept if possible)
- Affected packages/versions if known

We aim to acknowledge within **5 business days** and coordinate a fix and disclosure timeline.

## Supply chain

- The **`better-seo.js` core** is designed with **zero runtime npm dependencies** (see [`internal-docs/ARCHITECTURE.md`](./internal-docs/ARCHITECTURE.md)).
- Optional packages (`better-seo-assets`, CLI, etc.) have their own dependency graphs; we run automated checks in CI where configured.

## JSON-LD and HTML embedding

Consumers must use the library’s **documented serialization** for structured data (e.g. `serializeJSONLD`) and avoid concatenating untrusted strings into `<script>` tags. See **ARCHITECTURE** for the threat model.
