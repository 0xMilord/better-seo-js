---
title: "@better-seo/core"
description: createSEO, mergeSEO, schema helpers, serializeJSONLD, validateSEO, renderTags.
---

# `@better-seo/core`

**What it does:** Pure, **zero runtime dependency** transforms: **`SEOInput` + `SEOConfig` → `SEO`**, plus merge, serialization, validation, and vanilla tag descriptors.

**When to use:** Every stack; adapters only map **`SEO`** out — they don’t redefine the model.

## Example

```ts
import { createSEO, mergeSEO, webPage, serializeJSONLD } from "@better-seo/core"

const parent = createSEO({ title: "App" }, { baseUrl: "https://x.com", titleTemplate: "%s | App" })
const child = mergeSEO(parent, { title: "Settings" })
const jsonLd = serializeJSONLD(webPage({ name: "Settings", url: "https://x.com/settings" }))
```

## Output

- **`child.meta.title`** follows template and overrides.
- **`jsonLd`** is safe to embed in a script tag.

## Notes

- **`@better-seo/core/node`** — optional inference (`readPackageJsonForSEO`, …); Node only.
- Package README: [`packages/core/README.md`](../../packages/core/README.md).
