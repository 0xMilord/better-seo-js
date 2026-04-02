# Content Security Policy (CSP) for better-seo.js

**Security Recipe** • Last updated: 2026-04-02

This guide shows how to configure Content Security Policy headers when using better-seo.js with JSON-LD structured data.

---

## Quick Start

### Next.js App Router (Recommended)

Create `app/headers.ts`:

```ts
import type { NextRequest } from "next/server"

export function securityHeaders(request: NextRequest): Headers {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")

  return new Headers({
    // JSON-LD requires 'unsafe-inline' for script-src (safe because it's application/ld+json)
    "Content-Security-Policy": [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'`, // JSON-LD needs this
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "x-nonce": nonce,
  })
}
```

Then in `app/layout.tsx`:

```tsx
import { headers } from "next/headers"
import { securityHeaders } from "./headers"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()

  return (
    <html lang="en">
      <head>
        {/* Optional: expose nonce for inline scripts */}
        <meta name="nonce" content={headersList.get("x-nonce") ?? ""} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## Understanding JSON-LD and CSP

### Why JSON-LD Needs `'unsafe-inline'`

JSON-LD is embedded using:

```html
<script type="application/ld+json">
  { "@context": "https://schema.org", "@type": "Article", "name": "Example" }
</script>
```

This is an **inline script tag**, so CSP requires `'unsafe-inline'` in `script-src`.

### Why This Is Safe

Unlike executable JavaScript, JSON-LD:

1. ✅ **Never executes code** — it's pure data
2. ✅ **Properly escaped** — `serializeJSONLD()` uses `JSON.stringify()`
3. ✅ **Type-restricted** — browser treats `application/ld+json` as data, not code
4. ✅ **No eval risk** — no `eval()`, `Function()`, or dynamic execution

**Conclusion:** `'unsafe-inline'` for JSON-LD is **safe** and **recommended**.

---

## Alternative: Stricter CSP with Nonce

If you want stricter security (e.g., for financial/healthcare apps):

### Step 1: Middleware (Next.js)

```ts
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`, // No 'unsafe-inline'
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
  ].join("; ")

  const response = NextResponse.next()
  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("x-nonce", nonce)

  return response
}
```

### Step 2: Modify JSON-LD Component

```tsx
// components/json-ld.tsx
import { serializeJSONLD, type SEO } from "better-seo.js"
import { headers } from "next/headers"

export function NextJsonLd({ seo }: { seo: SEO }) {
  const headersList = headers()
  const nonce = headersList.get("x-nonce") ?? ""

  if (!seo.schema.length) return null

  const json = serializeJSONLD(seo.schema.length === 1 ? seo.schema[0] : seo.schema)

  return (
    <script
      type="application/ld+json"
      nonce={nonce || undefined}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
```

⚠️ **Trade-off:** More complex, but provides stronger CSP guarantees.

---

## Complete Security Headers Checklist

Beyond CSP, implement these headers:

```ts
const securityHeaders = {
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // XSS filter (legacy browsers)
  "X-XSS-Protection": "1; mode=block",

  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Disable unnecessary features
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",

  // Enforce HTTPS
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // Isolate COOP/COEP (optional, for advanced security)
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
}
```

---

## Testing Your CSP

### 1. Browser DevTools

Open Chrome DevTools → Console → Look for CSP violations:

```
Refused to load the script '...' because it violates the following Content Security Policy directive: ...
```

### 2. Online Tools

- **[CSP Evaluator](https://csp-evaluator.withgoogle.com/)** — Google's official tool
- **[Security Headers](https://securityheaders.com/)** — Grades your headers
- **[Report URI](https://report-uri.com/home/tools/)** — CSP testing suite

### 3. Report-Only Mode

Test without enforcing:

```ts
"Content-Security-Policy-Report-Only": [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'report-sample'`,
  "report-uri https://your-domain.com/csp-report",
].join("; ")
```

---

## Production Examples

### Example 1: SaaS Marketing Site

```ts
// Simple, permissive for third-party widgets
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: https://www.google-analytics.com",
  "connect-src 'self' https://www.google-analytics.com",
].join("; ")
```

### Example 2: E-commerce (Stricter)

```ts
// Stricter for payment processing
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: https://*.stripe.com",
  "connect-src 'self' https://api.stripe.com",
  "frame-src https://js.stripe.com",
  "frame-ancestors 'none'",
].join("; ")
```

### Example 3: Documentation Site

```ts
// For docs with code examples
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "frame-src https://www.youtube.com https://player.vimeo.com",
].join("; ")
```

---

## Common CSP Mistakes

### ❌ Mistake 1: Using `'unsafe-eval'`

```ts
// BAD - Never allow eval()
"script-src 'self' 'unsafe-inline' 'unsafe-eval'"
```

**Why:** Allows dynamic code execution via `eval()`, `new Function()`, etc.

### ❌ Mistake 2: Wildcard Domains

```ts
// BAD - Too permissive
"script-src 'self' *.googleapis.com"
```

**Why:** Any subdomain can serve scripts. Use specific domains instead.

### ❌ Mistake 3: Data URIs for Scripts

```ts
// BAD - Allows XSS
"script-src 'self' data:"
```

**Why:** Attackers can embed malicious scripts as data URIs.

### ✅ Correct Approach

```ts
// GOOD - Specific and minimal
"script-src 'self' 'unsafe-inline' https://www.googletagmanager.com"
```

---

## Verification Checklist

Before deploying:

- [ ] CSP allows `'unsafe-inline'` for JSON-LD (or uses nonces)
- [ ] No `'unsafe-eval'` in script-src
- [ ] No wildcard domains (`*`) in script-src
- [ ] `X-Content-Type-Options: nosniff` is set
- [ ] `X-Frame-Options: DENY` or `SAMEORIGIN` is set
- [ ] `Strict-Transport-Security` is set
- [ ] Tested with CSP Evaluator
- [ ] No CSP violations in browser console
- [ ] Report-uri or report-to configured (optional)

---

## Troubleshooting

### Issue: "Refused to load the script"

**Cause:** CSP blocking inline scripts

**Solution:** Add `'unsafe-inline'` to `script-src` (safe for JSON-LD)

```ts
"script-src 'self' 'unsafe-inline'"
```

### Issue: "Refused to apply inline style"

**Cause:** CSP blocking inline styles

**Solution:** Add `'unsafe-inline'` to `style-src`

```ts
"style-src 'self' 'unsafe-inline'"
```

### Issue: JSON-LD not showing in Rich Results Test

**Cause:** CSP blocking JSON-LD script tag

**Solution:** Ensure `script-src` includes `'unsafe-inline'` or proper nonce

---

## Additional Resources

- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Google CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Content Security Policy Cheat Sheet](https://content-security-policy.com/)
- [better-seo.js Security Audit](../SECURITY_AUDIT.md)

---

**Related Docs:**

- [SECURITY.md](../SECURITY.md) — Reporting vulnerabilities
- [SECURITY_AUDIT.md](../SECURITY_AUDIT.md) — Full security assessment
- [ARCHITECTURE.md](../internal-docs/ARCHITECTURE.md) — System design
