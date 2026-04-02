# `@better-seo/react`

[![npm](https://img.shields.io/npm/v/@better-seo/react?style=flat-square)](https://www.npmjs.com/package/@better-seo/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](../../LICENSE)

**React + Vite / CRA-style SPAs:** map **`SEO`** to **[react-helmet-async](https://github.com/staylor/react-helmet-async)** (`toHelmetProps`, `<BetterSEOHelmet />`), optional **`SEOProvider`** / **`useSEO`**, and register adapter **`react`** for **`seoForFramework`**.

**Peers:** `react` **≥ 18.2**, `react-dom`, `react-helmet-async` **≥ 2** (v **3** tested).

**Docs:** [Recipe](../../docs/recipes/react-wave5.md) · [Usage — React](../../internal-docs/USAGE.md#react-spa--vite) · [Monorepo README](../../README.md)

---

## Install

```bash
npm install @better-seo/core @better-seo/react react-helmet-async
```

Wrap your app with **`HelmetProvider`** (from `react-helmet-async`), then either:

```tsx
import { createSEO } from "@better-seo/core"
import { BetterSEOHelmet } from "@better-seo/react"

const seo = createSEO({ title: "Page", description: "…" })
;<BetterSEOHelmet seo={seo} />
```

or build props yourself:

```tsx
import { toHelmetProps } from "@better-seo/react"
;<Helmet {...toHelmetProps(seo)} />
```

---

## `useSEO` and `SEOProvider`

For client subtrees that need the same **`SEO`** document (e.g. JSON-LD components):

```tsx
import { SEOProvider, useSEO } from "@better-seo/react"
;<SEOProvider seo={seo}>
  <MyPage />
</SEOProvider>
```

`useSEO()` throws **`SEOError` (`USE_SEO_NO_PROVIDER`)** outside **`SEOProvider`**.  
**`useSEO()` in `@better-seo/core`** remains a stub — import the hook from **`@better-seo/react`**.

---

## Adapter id `react`

```ts
import "@better-seo/react"
import { seoForFramework } from "@better-seo/core"

const helmetProps = seoForFramework("react", { title: "Hi" })
```

---

## Scripts (monorepo)

```bash
npm run build
npm run test
npm run test:coverage
npm run lint
npm run typecheck
```

---

## License

MIT — see [**LICENSE**](../../LICENSE).
