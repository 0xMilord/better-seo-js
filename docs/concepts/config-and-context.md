---
title: Config & context
description: initSEO vs createSEOContext, @better-seo/core/node inference, Edge and multi-tenant.
---

# Config & context

**What it does:** **`SEOConfig`** carries **`baseUrl`**, **`defaultTitle`**, **`titleTemplate`**, **`plugins`**, **`rules`**, **`schemaMerge`**, **`features`**, and more. You can rely on a **process-wide** default on Node, or a **request-scoped** **`SEOContext`** — same **`SEO`** shape either way.

**When to use**

| Approach                                            | Good for                                                                                       | Avoid when                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **`initSEO()`** + **`seo` from `@better-seo/next`** | Local dev, simple Node SSR where one global config is fine                                     | Edge middleware, **multi-tenant** (per-request config), tests that need isolation |
| **`createSEOContext(config)`**                      | **Edge**, **Workers**, **multi-tenant**, integration tests — explicit config, no `fs`          | —                                                                                 |
| **`@better-seo/core/node`**                         | Scripts, CLI, **server-only** bootstrap: read **`package.json`**, infer **`baseUrl`** from env | **Edge**, browser, or any bundle that must not include **`readFileSync`**         |

Maintainer depth (errors, **`validateSEO`**, OG): [**internal-docs/USAGE.md**](https://github.com/0xMilord/better-seo-js/blob/main/internal-docs/USAGE.md) — keep it in sync when you edit this page.

## Example (explicit context + Next `Metadata`)

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

**Context surface:** **`ctx.createSEO`**, **`ctx.mergeSEO`**, **`ctx.createSEOForRoute`** (applies **`config.rules`** for a pathname). Mirror of **`createSEO` / `mergeSEO` / `createSEOForRoute`** with config bound.

## Example (Node inference — server only)

```ts
import { initSEOFromPackageJson } from "@better-seo/core/node"

// Call once at startup on Node — still global; prefer createSEOContext for tenants
initSEOFromPackageJson()
```

Or build config without mutating globals:

```ts
import { inferSEOConfigFromEnvAndPackageJson } from "@better-seo/core/node"
import { createSEOContext } from "@better-seo/core"

const ctx = createSEOContext(inferSEOConfigFromEnvAndPackageJson())
```

## Output

- Same **`SEO`** / **`Metadata`** pipeline; only **where config lives** (global vs context vs inline) changes.

## Notes

- **`@better-seo/next`** registers the adapter; **`seo()`** / **`prepareNextSeo`** read the same global config as **`initSEO`** when you use the voilà path.
- For day-to-day App Router pages, **`seo`** and **`prepareNextSeo`** are enough; reach for **`createSEOContext`** when isolation or Edge constraints matter.

Next: [JSON-LD & safety](./json-ld-and-safety.md)
