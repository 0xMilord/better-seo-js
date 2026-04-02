# N5 — Layout vs page metadata (`mergeSEO` / `withSEO`)

**Goal:** One coherent `Metadata` object per route without duplicating site defaults or fighting Next’s static `layout` + `page` exports.

## Mental model

1. **Layout** holds durable defaults: `metadataBase`, sometimes a **parent** `SEO` built with `createSEO` (site title template, default OG type, shared `Organization` JSON-LD).
2. **Page** (or nested layouts) **merge** child-specific fields: title, description, canonical, route-level schema.
3. Use **`mergeSEO` / `withSEO`** so defaults and overrides follow one code path (see **FEATURES N2, N5, V2**).

## App Router patterns

### A. Static `export const metadata`

Build a parent document once (e.g. in `lib/site-seo.ts` or next to the layout), then in a leaf page:

```ts
import { createSEO, mergeSEO, webPage } from "@better-seo/core"
import { withSEO } from "@better-seo/next"
import { NextJsonLd } from "@better-seo/next/json-ld"

const site = process.env.NEXT_PUBLIC_SITE_URL!
const base = { baseUrl: site, titleTemplate: "%s | My App" } as const

const layoutSeo = createSEO(
  {
    title: "Home",
    description: "Default description",
    schema: [/* shared nodes */],
  },
  base,
)

// In page.tsx — child wins for overlapping fields
export const metadata = withSEO(layoutSeo, {
  title: "Pricing",
  description: "Plans and billing",
})

const merged = mergeSEO(layoutSeo, { title: "Pricing", description: "Plans and billing" }, base)

export default function Page() {
  return (
    <>
      <NextJsonLd seo={merged} />
      …
    </>
  )
}
```

Use the **same** `SEOInput` + `SEOConfig` for `withSEO` and `mergeSEO` so `<head>` tags and JSON-LD stay aligned.

### B. Interaction with `metadata` in `layout.tsx`

Keep **`metadataBase`** (and other non-SEO globals) in the root layout. Prefer **not** duplicating title/description at both layout and page unless you intend layering; when in doubt, defaults in layout-as-parent `SEO`, specifics in page merge.

## Edge / Workers

Do not rely on Node-only inference in Edge bundles. Pass **`baseUrl`** and other resolution explicitly (**ARCHITECTURE §10–§13**, **FEATURES N8**).

## See also

- Example: `examples/nextjs-app/app/with-seo/page.tsx`
- Roadmap **Wave 1**, **FEATURES N5**
