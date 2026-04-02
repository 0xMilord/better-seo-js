---
title: The SEO document
description: meta, openGraph, twitter, and schema after createSEO.
---

# The SEO document

**What it does:** After **`createSEO`**, you hold one **canonical `SEO` object**: three channels (search meta, social, structured data) with predictable fallbacks.

**When to use:** Whenever you explain the library to your team or decide where a new field belongs.

## Shape (mental model)

- **`meta`** — title (required after normalize), description, canonical, robots, alternates, pagination, verification.
- **`openGraph`** / **`twitter`** — social previews; many fields fall back from **`meta`** when omitted.
- **`schema`** — `JSONLD[]` with strict **`JSONLDValue`** typing (no `any` in public API).

## Example

```ts
import { createSEO } from "@better-seo/core"

const seo = createSEO(
  {
    title: "Pricing",
    description: "Plans and billing.",
    canonical: "/pricing",
  },
  { baseUrl: "https://example.com", titleTemplate: "%s · Acme" },
)
// seo.meta.title, seo.openGraph?, seo.schema
```

## Output

- A normalized object adapters can map to **`Metadata`**, Helmet props, or **`renderTags`** output.

## Notes

- **better-seo.js is a programmable SEO engine for Next.js and modern apps** — the document model is the product; adapters are transport.

Next: [Pipeline](./pipeline.md)
