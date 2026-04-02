# N9 — Pathname rules (`SEOConfig.rules`, `seoRoute`)

**Goal:** Apply shared **route → partial SEO** layers (blog vs docs vs marketing) without duplicating `if (pathname.startsWith(...))` in every `page.tsx`.

## Mental model

1. Put globs and defaults on **`SEOConfig.rules`** (same config you pass to `createSEO` / Next helpers).
2. Pass the **real pathname** into **`seoRoute`** (from the App Router segment, `generateMetadata` args, or middleware-injected headers).
3. Page **`SEOInput`** still wins for overlapping keys (rule partials apply first, then your input).

**V6 / `seo.auto`:** There is no reliable, framework-agnostic way to infer “current path” inside every server entrypoint (Edge, RSC, static export). Enterprise setups should keep pathname **explicit** (this recipe) rather than relying on best-effort inference.

## Example — static segment

```ts
import { seoRoute } from "@better-seo/next"

const site = process.env.NEXT_PUBLIC_SITE_URL!
const baseConfig = {
  baseUrl: site,
  titleTemplate: "%s | My App",
  rules: [
    { match: "/blog/**", priority: 1, seo: { description: "Articles and updates" } },
    { match: "/docs/**", priority: 1, seo: { description: "Product documentation" } },
  ],
} as const

// app/blog/[slug]/page.tsx — derive pathname from params or pass segment
export const metadata = seoRoute("/blog/my-post", { title: "My post" }, baseConfig)
```

## Example — `createSEOContext` (multi-tenant / Edge)

```ts
import { createSEOContext } from "@better-seo/core"

const ctx = createSEOContext({
  baseUrl: "https://tenant.example",
  titleTemplate: "%s | Tenant",
  rules: [{ match: "/app/**", seo: { robots: "noindex, nofollow" } }],
})

const doc = ctx.createSEOForRoute("/app/preview", { title: "Preview" })
// … then adapt to your framework or serialize JSON-LD
```

## `prepareNextSeoForRoute`

When you need both **Next `metadata`** and the full **`SEO`** document (e.g. for `NextJsonLd`):

```ts
import { prepareNextSeoForRoute } from "@better-seo/next"

const { metadata, seo } = prepareNextSeoForRoute("/pricing", { title: "Pricing" }, baseConfig)
```

## Layout vs page (V4)

- **`seoLayout`** — same as `createSEO`: build the parent `SEO` once (site defaults).
- **`seoPage`** — same as `withSEO`: merge page input, return `Metadata`.

See also **[N5 — layout vs page](./n5-layout-page-merge.md)** for the full merge story.

## Glob reference

Rule `match` strings follow **`rules.ts`** semantics (trailing `path/*`, per-segment `*`, and `**` segments). Tests live in **`packages/core/src/rules.test.ts`**.

## See also

- **FEATURES** N9, C11, V4–V6 (contributor docs)
- **`applyRules` / `createSEOForRoute`** — `@better-seo/core`
