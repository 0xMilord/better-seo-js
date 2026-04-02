---
title: First metadata + JSON-LD
description: prepareNextSeo and NextJsonLd so head tags and structured data share one SEO document.
---

# First metadata + JSON-LD

**What it does:** Produces **`Metadata`** and a canonical **`SEO`** object, then renders JSON-LD through **`serializeJSONLD`** (never hand-built `<script>` strings).

**When to use:** Any page that needs structured data (Article, WebPage, Organization, …) aligned with `<title>` and OG tags.

## Example

```tsx
// app/page.tsx
import { webPage } from "@better-seo/core"
import { NextJsonLd } from "@better-seo/next/json-ld"
import { prepareNextSeo } from "@better-seo/next"

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

const { metadata, seo } = prepareNextSeo(
  {
    title: "Example",
    description: "One pipeline for head tags and JSON-LD.",
    canonical: "/",
    schema: [
      webPage({
        name: "Example",
        description: "Demo.",
        url: site,
      }),
    ],
  },
  { baseUrl: site },
)

export { metadata }

export default function Page() {
  return (
    <main>
      <NextJsonLd seo={seo} />
      <h1>Example</h1>
    </main>
  )
}
```

## Output

- HTML head: title, description, canonical, OG/Twitter fields mapped by **`toNextMetadata`**.
- Body: one or more JSON-LD graphs inside `<script type="application/ld+json">` via **`NextJsonLd`**.

## Notes

- Shorthand **`export const metadata = seo({ title: "Hello" })`** omits JSON-LD; use **`prepareNextSeo`** when you need **`schema`**.
- **`prepareNextSeo`** / **`toNextMetadata`** use the same merge and feature flags as **`createSEO`**; for **layout + page** `SEO` objects, use **`mergeSEO`** from **`@better-seo/core`** for the document you pass to **`NextJsonLd`** (see [Layout & page](../concepts/layout-and-page.md)).
- **Edge or per-request config:** prefer **`createSEOContext`** + **`toNextMetadata(ctx.createSEO(…))`** instead of globals — [Config & context](../concepts/config-and-context.md).
- Runnable demo: monorepo **`examples/nextjs-app`**.

Next: [Verify in the browser](./verify-in-browser.md)
