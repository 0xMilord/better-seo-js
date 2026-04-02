# Comparison stub: next-seo → better-seo (D6)

**Status:** early **Wave 4** positioning page — expand before launch (tables, migration snippets, FAQs).

| Topic           | next-seo (typical) | @better-seo / monorepo                                                    |
| --------------- | ------------------ | ------------------------------------------------------------------------- |
| Model           | Component + props  | Single **`SEO`** document + **`createSEO` / `mergeSEO`**                  |
| JSON-LD         | Add-on / manual    | **`serializeJSONLD`** as the only script path                             |
| Next App Router | Patterns vary      | **`@better-seo/next`**: **`seo`**, **`prepareNextSeo`**, **`NextJsonLd`** |
| OG / icons      | External tooling   | **`@better-seo/assets`** + **`@better-seo/cli`** (`og`, `icons`)          |
| Zero-dep core   | N/A                | **`@better-seo/core`** has **no runtime `dependencies`**                  |

**Migration:** **`fromNextSeo`** in **`@better-seo/core`** and **`npx better-seo migrate from-next-seo`** (hints today; codemods may expand later). Until then, map title/description/canonical/OG manually using **[`packages/core/README.md`](../../packages/core/README.md)**, **[`packages/next/README.md`](../../packages/next/README.md)**, and **[`docs/recipes/`](../recipes/README.md)**.
