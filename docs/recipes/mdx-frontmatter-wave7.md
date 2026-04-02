---
title: MDX / Markdown → SEO (Wave 7)
description: fromMdx with gray-matter plus core fromContent; CLI content from-mdx.
---

# MDX / Markdown → SEO (Wave 7 — **C16** / **C17**)

**What it does:** Turns a **file string** (YAML frontmatter + body) into **`SEOInput`**, then you run your normal **`createSEO`** / **`prepareNextSeo`** path.

**When to use:** Blog or docs routes where SEO lives next to content; you already use **MDX** or Markdown sources in **`generateMetadata`** or a loader.

## Example (library)

```ts
import { fromMdx } from "@better-seo/compiler"
import { prepareNextSeo } from "@better-seo/next"

const raw = await import("./post.md?raw") // bundler-specific; or readFile

const { metadata } = prepareNextSeo(fromMdx(raw, { maxDescriptionLength: 160 }), {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
})
export { metadata }
```

Frontmatter fields **`title`**, **`description`**, **`canonical`**, **`openGraph`**, **`twitter`**, **`schema`**, optional **`seo:`** / **`meta:`** blocks — see [**`@better-seo/compiler`**](../api/compiler.md).

## Example (CLI)

```bash
npx @better-seo/cli content from-mdx --input ./content/post.mdx --out ./seo-input.json
```

Pipe the JSON into **`snapshot`**, **`preview`**, or **`analyze`** as needed ([CLI commands](../commands.md)).

## Output

- **`SEOInput`** aligned with core inference rules; explicit frontmatter overrides body-derived title/description.

## Notes

- **No MDX AST:** JSX is not executed; inference is text-based (**`fromContent`**). For simple strings only, **`fromMdxString`** on **`@better-seo/core`** may be enough.
- **Roadmap:** deeper MDX compile / AST — **`internal-docs/PROGRESS.md`** wave **7**.

See also: [API — compiler](../api/compiler.md) · [API — core](../api/core.md)
