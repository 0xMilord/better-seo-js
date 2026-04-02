---
title: Icons & web manifest
description: generateIcons and CLI icons — Wave 3 assets.
---

# Icons & web manifest

**What it does:** Generates **favicon.ico**, PNG sizes, **apple-touch**, **maskable**, optional **`manifest.json`** from a source logo.

**When to use:** New projects; PWA requirements; consistency with OG branding.

## Example

```bash
npx @better-seo/cli icons ./logo.svg -o ./public
```

## Output

- Static assets under **`public/`** (or your **`--output`** path).

## Notes

- Full recipe: [Icons (Wave 3)](../recipes/icons-wave3.md).
