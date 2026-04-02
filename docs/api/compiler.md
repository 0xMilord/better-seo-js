---
title: "@better-seo/compiler"
description: fromMdx — gray-matter frontmatter + Markdown/MDX body → SEOInput (Wave 7 C17).
---

# `@better-seo/compiler`

**What it does:** Parses **YAML (or JSON) frontmatter** with [**gray-matter**](https://github.com/jonschlinkert/gray-matter), then runs the body through **`fromContent`** in **`@better-seo/core`** to infer title/description when missing. Returns a **`SEOInput`** you pass to **`createSEO`**, **`prepareNextSeo`**, or **`seo`**.

**When to use:** Content sites (blog, docs) where each **`.md` / `.mdx`** file owns SEO in frontmatter; you want **one pipeline** with core’s **`fromContent`** rules without pulling **gray-matter** into every app.

**When not to use:** This is **not** a full MDX compiler — JSX and `import` lines are treated as text for inference only. For hand-authored partials without frontmatter, use **`fromContent`** or **`fromMdxString`** from **`@better-seo/core`** directly.

## Install

```bash
npm install @better-seo/compiler @better-seo/core
```

Depends on **`@better-seo/core`** and **`gray-matter`** (the compiler is the only published package that adds that dependency; core stays zero-dep).

## Example

```ts
import { fromMdx } from "@better-seo/compiler"
import { prepareNextSeo } from "@better-seo/next"

const source = `---
title: "Launch week"
description: "What we shipped"
canonical: "/blog/launch"
---

# Launch week

We launched **better-seo** for App Router.
`

const input = fromMdx(source, { maxDescriptionLength: 160 })

const site = process.env.NEXT_PUBLIC_SITE_URL!
const { metadata, seo } = prepareNextSeo(input, { baseUrl: site })
```

### Frontmatter shape

- Top-level **`title`**, **`description`**, **`canonical`**, **`robots`**, **`openGraph`**, **`twitter`**, **`schema`** map into **`SEOInput`**.
- Optional nested **`seo:`** block in frontmatter is **flattened** and merged on top of root keys (child wins on conflict).
- Optional nested **`meta:`** with **`title` / `description` / `canonical` / `robots`** fills **`SEOInput.meta`**.
- Explicit frontmatter **wins** over values inferred from the body.

## CLI

```bash
npx @better-seo/cli content from-mdx --input ./post.mdx --out ./seo-input.json
```

Uses the same **`fromMdx`** implementation. See [CLI commands](../commands.md).

## Output

- **`SEOInput`** — pass through your usual **`SEOConfig`** when calling **`createSEO`** / **`prepareNextSeo`**.

## Notes

- **Feature IDs:** **C17** (compiler), **C16** (`fromContent` / `fromMdxString` on core) — see **`internal-docs/FEATURES.md`**.
- Source: [`packages/better-seo-compiler/`](../../packages/better-seo-compiler/)
