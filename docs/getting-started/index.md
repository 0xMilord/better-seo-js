---
title: Get started
description: From install to working SEO in under a minute on Next.js App Router.
---

# Get started (~60 seconds)

**What it does:** Gets **better-seo.js** emitting real **`Metadata`** on a Next.js page with minimal code.

**When to use:** First time setup; evaluating the library; teaching a teammate the golden path.

## Example

```bash
npm install @better-seo/core @better-seo/next
```

```tsx
// app/page.tsx
import { seo } from "@better-seo/next"

export const metadata = seo({ title: "Home", description: "Voilà." })
```

## Output

- Next.js serves a `<title>`, meta description, and Open Graph defaults derived from the unified model.
- For JSON-LD in the document, use **`prepareNextSeo`** + **`NextJsonLd`** — see [First metadata](./first-metadata.md).

## Notes

- **`@better-seo/next`** registers the Next adapter. Optional **`@better-seo/core/node`** adds **`readPackageJsonForSEO`**, **`inferSEOConfigFromEnvAndPackageJson`**, and **`initSEOFromPackageJson`** — **server / CLI only**, never in Edge or the browser. Production Edge and multi-tenant setups should use **`createSEOContext`**. See [Config & context](../concepts/config-and-context.md).

Next: [Install (Next.js)](./install-next.md) · [First metadata](./first-metadata.md)
