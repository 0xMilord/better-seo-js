---
title: Layout & page
description: mergeSEO, withSEO, seoLayout, and seoPage for nested App Router routes.
---

# Layout & page

**What it does:** Lets a **parent** route define defaults (site name, OG locale, shared schema) while **child** routes override title, description, or images — without duplicating config.

**When to use:** App Router **`layout.tsx`** + **`page.tsx`** (or parallel route segments).

## Example

Use **`withSEO`** or **`mergeSEO`** + **`toNextMetadata`**, or the voilà helpers **`seoLayout`** / **`seoPage`** from **`@better-seo/next`**. Full walkthrough:

- [Layout vs page recipe](../recipes/n5-layout-page-merge.md)

## Output

- Child **`meta.title`** overrides parent; **`meta.alternates.languages`** deep-merges; **`openGraph.images`** replaces by array policy; **`schema`** concatenates (or dedupes if configured).

## Notes

- Apply the **same `SEOConfig`** (especially **`titleTemplate`**) when merging so templates stay consistent.

Next: [Config & context](./config-and-context.md)
