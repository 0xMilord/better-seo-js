---
title: Config & context
description: initSEO vs createSEOContext, Node inference, Edge and multi-tenant.
---

# Config & context

**What it does:** **`SEOConfig`** carries **`baseUrl`**, **`titleTemplate`**, **`plugins`**, **`rules`**, **`schemaMerge`**, and feature flags. You can use a **process-wide** default (Node) or a **request-scoped** context.

**When to use**

- **`initSEO` / implicit defaults:** quick local dev and simple Node servers (know the SSR footguns).
- **`createSEOContext`:** SSR, multi-tenant, tests, **Edge** — explicit config, no reading **`package.json`** in the bundle.

## Example (explicit context)

```ts
import { createSEOContext } from "@better-seo/core"
import { toNextMetadata } from "@better-seo/next"

const ctx = createSEOContext({
  defaultTitle: "My App",
  baseUrl: "https://example.com",
  titleTemplate: "%s | My App",
})

export const metadata = toNextMetadata(ctx.createSEO({ title: "Dashboard" }))
```

For day-to-day Next usage, **`seo`** / **`prepareNextSeo`** from **`@better-seo/next`** are usually enough; **`createSEOContext`** shines for multi-tenant and Edge (explicit config, no `fs`).

## Output

- Same **`SEO`** shape either way; only **where config lives** changes.

## Notes

- Inference from **`package.json`** / env is exposed via **`@better-seo/core/node`** — **do not** import that entry from Edge middleware or browser bundles. See **internal-docs/USAGE.md**.

Next: [JSON-LD & safety](./json-ld-and-safety.md)
