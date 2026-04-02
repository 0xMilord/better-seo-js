---
title: Open Graph images
description: generateOG and CLI og — Wave 2 assets.
---

# Open Graph images

**What it does:** Renders **1200×630** PNG cards (Satori) from title/description — **`@better-seo/assets`** or **`npx @better-seo/cli og`**.

**When to use:** Social preview cards; marketing pages; docs hero images.

## Example

```bash
npx @better-seo/cli og "Hello World" -o ./public/og.png --site-name "My site"
```

## Output

- PNG on disk; reference from **`openGraph.images`** in your **`SEO`** input.

## Notes

- Full recipe: [OG (Wave 2)](../recipes/og-wave2.md).
- Custom templates: **`--template`** (compiled ESM module).
