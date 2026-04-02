---
title: Input → SEO → adapter → output
description: How partial input and SEOConfig become framework-native head output.
---

# Pipeline

**What it does:** **Partial input + `SEOConfig` (+ optional rules/plugins)** → **`createSEO` / `mergeSEO`** → canonical **`SEO`** → **adapter** → Next **`Metadata`**, Helmet props, or tag descriptors.

**When to use:** Debugging “why is my title wrong?” — walk the pipeline in order.

## Example (conceptual)

```txt
SEOInput + SEOConfig
  → applyRules (optional; needs route string)
  → createSEO (normalize + fallbacks)
  → plugin hooks (beforeMerge / afterMerge)
  → SEO
  → toNextMetadata(seo)   // @better-seo/next
```

## Output

- Framework-specific objects only at the **last** step — everything before that is shared across stacks.

## Notes

- **`registerAdapter`** / explicit imports beat “magic” auto-detection in production monorepos. See maintainer **ARCHITECTURE.md** in `internal-docs/`.

Next: [Layout & page](./layout-and-page.md)
