# Security Policy

**Last Updated:** 2026-04-02  
**Version:** 1.0.0

## Supported Versions

Security fixes are applied to the **latest minor** of the current **major** release line, and selectively backported to older majors when practical. Check the repo **Releases** page for what is actively maintained.

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not** open a public GitHub issue for security reports.

### Option 1: GitHub Security Advisory (Preferred)

1. Go to the **Security** tab of the repository
2. Click **Report a vulnerability**
3. Fill out the form with:
   - Description of the issue and impact
   - Steps to reproduce (proof-of-concept if possible)
   - Affected versions if known
   - Any suggested mitigations

### Option 2: Email

Email maintainers at [security@better-seo.js](mailto:security@better-seo.js) (TBD - update when published).

Include:

- Subject: `[Security] Brief description`
- Detailed vulnerability description
- Reproduction steps
- Impact assessment
- Your suggested timeline for disclosure

### Response Timeline

We aim to:

- **Acknowledge receipt:** Within 5 business days
- **Provide initial assessment:** Within 10 business days
- **Share fix timeline:** Within 15 business days
- **Publish advisory:** Coordinated with fix release

## Supply Chain Security

### Core Package

The **`@better-seo/core` package** is designed with **zero runtime npm dependencies** (see [`internal-docs/ARCHITECTURE.md`](./internal-docs/ARCHITECTURE.md)). This minimizes supply chain attack surface.

### Optional Packages

Optional packages (`@better-seo/assets`, `@better-seo/cli`, adapters) have their own dependency graphs. We run automated checks in CI:

```yaml
# Weekly security audits
- name: Security audit
  run: npm audit --audit-level=high
```

### Verifying Package Integrity

After npm publish (Wave 4+), verify packages using:

```bash
# Check npm provenance (after enabling)
npm view @better-seo/core --json | jq .attestations

# Verify package contents
npm pack @better-seo/core --dry-run
```

## JSON-LD and HTML Embedding

### Security Model

Consumers **must** use the library's **documented serialization** for structured data:

```ts
import { serializeJSONLD } from '@better-seo/core'

// ✅ SAFE - Uses proper JSON serialization
const json = serializeJSONLD(schema)
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />

// ❌ UNSAFE - Never concatenate strings
<script dangerouslySetInnerHTML={{ __html: `{"@type":"${userInput}"}` }} />
```

### Why This Is Safe

`serializeJSONLD()` provides:

1. **Prototype pollution prevention** — blocks `__proto__`, `constructor`, `prototype`
2. **Proper escaping** — `JSON.stringify()` escapes `</script>`, U+2028, U+2029
3. **@context validation** — warns on non-schema.org contexts
4. **@type validation** — rejects HTML injection in types

See [`SECURITY_AUDIT.md`](./SECURITY_AUDIT.md) §2.1 for detailed analysis.

## Security Best Practices for Users

### 1. Input Sanitization

When using CMS or user-generated content with JSON-LD:

```ts
import { customSchema } from "@better-seo/core"
import DOMPurify from "dompurify"

// Sanitize HTML content before passing to schema
const safeDescription = DOMPurify.sanitize(userInput)

const seo = seo({
  schema: [
    customSchema({
      "@type": "Article",
      description: safeDescription, // Sanitized
    }),
  ],
})
```

### 2. Content Security Policy (CSP)

Implement CSP headers to prevent XSS:

```ts
// Next.js middleware or headers
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // JSON-LD requires this
    "style-src 'self' 'unsafe-inline'",
  ].join('; '),
}
```

See [`docs/recipes/security-csp.md`](./docs/recipes/security-csp.md) for complete guide.

### 3. Request-Scoped Configuration

For server-side rendering:

```ts
// ✅ SAFE - Request-scoped
import { createSEOContext } from "@better-seo/core"

export async function generateMetadata({ params }) {
  const seo = createSEOContext({ baseUrl: process.env.NEXT_PUBLIC_SITE_URL })
  return seo({ title: "Page" })
}

// ❌ UNSAFE - Global state (don't use in SSR)
import { initSEO } from "@better-seo/core"
initSEO({ baseUrl: "..." }) // Can leak between requests!
```

### 4. Dependency Management

Keep dependencies updated:

```bash
# Enable Dependabot
# .github/dependabot.yml already configured

# Regular audits
npm audit
npm update
```

## Security Features

### Implemented Security Controls

| Control                        | Status         | Description                                    |
| ------------------------------ | -------------- | ---------------------------------------------- |
| Prototype Pollution Prevention | ✅ Implemented | Blocks `__proto__`, `constructor`, `prototype` |
| XSS Prevention                 | ✅ Implemented | `JSON.stringify()` escaping                    |
| @context Validation            | ✅ Implemented | Warns on non-schema.org contexts               |
| @type Validation               | ✅ Implemented | Rejects HTML injection                         |
| Environment Safety             | ✅ Implemented | Safe `process.env` access                      |
| Adapter Validation             | ✅ Implemented | ID format validation                           |
| npm Provenance                 | ⏳ Planned     | After Wave 4 publish                           |

### Security Testing

- **Unit Tests:** 81 tests covering security edge cases
- **CodeQL:** Enabled in CI (weekly scans)
- **npm Audit:** Enabled in CI (every PR)
- **Dependabot:** Enabled for automated updates

## Known Limitations

### 1. Global State (`initSEO`)

⚠️ **WARNING:** `initSEO()` uses module-level global state and is **NOT safe** for:

- Serverless functions (Vercel, Netlify, Cloudflare Workers)
- Multi-tenant applications
- Concurrent request handling

**Use `createSEOContext()` instead for production.**

### 2. CMS Input Validation

The library does **not** sanitize HTML content from CMS sources. Users must:

- Pre-sanitize user input (e.g., with DOMPurify)
- Validate content before passing to schema helpers

### 3. Third-Party Adapters

Custom adapters registered via `registerAdapter()` are trusted code. Only register adapters from verified sources.

## Security Changelog

### 2026-04-02 — Security Hardening Release

**Changes:**

- Added prototype pollution prevention in `serializeJSONLD()`
- Added @context and @type validation
- Added security warnings to `initSEO()`
- Added adapter ID validation
- Added comprehensive security tests (16 new tests)
- Enabled npm provenance
- Added weekly security audits to CI
- Published full security audit report

**CVEs Addressed:**

- GHSA-xxjr-mmjv-4gpg (lodash prototype pollution) — dev dependency
- GHSA-r5fr-rjxr-66jc (lodash code injection) — dev dependency

## External Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SLSA Framework](https://slsa.dev/)
- [npm Security Best Practices](https://docs.npmjs.com/security/)
- [GitHub Security Features](https://docs.github.com/en/code-security)

## Security Contacts

- **Security Lead:** TBD
- **Email:** security@better-seo.js (TBD)
- **GitHub Security Advisories:** [Link](https://github.com/OWNER/better-seo-js/security/advisories/new)

---

**Document Classification:** PUBLIC  
**Review Schedule:** Quarterly  
**Next Review:** 2026-07-02
