# `@better-seo/compiler`

Optional **Wave 7 / C17** package: **`fromMdx`** parses frontmatter with **gray-matter**, then uses **`fromContent`** from **`@better-seo/core`** for body inference. Adds **`gray-matter`** only here — core stays zero runtime dependencies.

- **Docs:** [`docs/api/compiler.md`](../../docs/api/compiler.md)
- **Recipe:** [`docs/recipes/mdx-frontmatter-wave7.md`](../../docs/recipes/mdx-frontmatter-wave7.md)

```bash
npm install @better-seo/compiler @better-seo/core
```

```ts
import { fromMdx } from "@better-seo/compiler"

const input = fromMdx(`---
title: Hello
---
# Hello

Body text.`)
```

CLI: **`npx @better-seo/cli content from-mdx --input ./post.mdx --out ./out.json`**
