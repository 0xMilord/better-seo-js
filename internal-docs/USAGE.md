# Usage & errors — better-seo.js

**Scope:** **`@better-seo/core`**, **`@better-seo/next`**, **`@better-seo/react`** (Wave 5), and optional **Wave 2** packages **`@better-seo/assets`** / **`@better-seo/cli`**. Authoritative lists: **`FEATURES.md`**, **`ARCHITECTURE.md`**.

## Install (monorepo / local)

```bash
npm install @better-seo/core
npm install @better-seo/next
npm install @better-seo/react react-helmet-async
```

`@better-seo/next` declares `next` and `react` as peers. **`@better-seo/react`** declares **`react`**, **`react-dom`**, and **`react-helmet-async`** as peers.

## React SPA / Vite

Use **`@better-seo/react`** when you do **not** have the App Router **`metadata`** API (e.g. Vite SPA). Wrap the tree with **`HelmetProvider`** from **`react-helmet-async`**, then:

- **`BetterSEOHelmet`** with a merged **`SEO`** from **`createSEO`**, or
- **`toHelmetProps(seo)`** to pass into **`<Helmet {...} />`**.

**`useSEO()`** comes from **`@better-seo/react`** inside **`SEOProvider`**. The **`useSEO`** export on **`@better-seo/core`** is still a **stub** that throws **`USE_SEO_NOT_AVAILABLE`** — import the hook from **`@better-seo/react`** instead.

Recipe: [`docs/recipes/react-wave5.md`](../docs/recipes/react-wave5.md).

## Edge, Workers, and multi-tenant

- **`initSEO()`** only sets an in-memory global. Treat it as **Node / local** convenience, not something to rely on in **Edge** or **multi-tenant** servers where requests must stay isolated.
- In production Edge (middleware, Vercel Edge, Cloudflare Workers), use **`createSEOContext(explicitConfig)`** per request (or per tenant) and call **`ctx.createSEO`** / **`ctx.mergeSEO`**. Pass **`baseUrl`**, **`titleTemplate`**, and **`plugins`** explicitly—no filesystem or `package.json` reads.
- The default **`@better-seo/core`** import path stays **Edge-safe** (no `fs`). A future **`@better-seo/core/node`** export (ARCHITECTURE §10) would carry Node-only inference; until then, keep inference out of hot paths.

## Next.js App Router — quick start

```ts
// app/page.tsx
import { NextJsonLd } from "@better-seo/next/json-ld"
import { prepareNextSeo } from "@better-seo/next"
import { webPage } from "@better-seo/core"

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

const { metadata, seo } = prepareNextSeo(
  {
    title: "Hello",
    description: "World",
    canonical: "/",
    schema: [webPage({ name: "Hello", description: "World", url: site })],
  },
  { baseUrl: site },
)

export { metadata }

export default function Page() {
  return (
    <main>
      <NextJsonLd seo={seo} />
      …
    </main>
  )
}
```

### Voilà shorthand

```ts
import { seo } from "@better-seo/next"

export const metadata = seo({ title: "Hi", description: "There" })
```

### Layered metadata (`withSEO`)

```ts
import { createSEO, mergeSEO } from "@better-seo/core"
import { withSEO } from "@better-seo/next"

const seoConfig = { baseUrl: site, titleTemplate: "%s | App" } as const
const parent = createSEO({ title: "Site" }, seoConfig)
export const metadata = withSEO(parent, { title: "Docs" }, seoConfig)
const merged = mergeSEO(parent, { title: "Docs" }, seoConfig)
```

Use **`mergeSEO`** for the `SEO` object you pass to **`NextJsonLd`**.

## JSON-LD

Always embed via **`serializeJSONLD`** (used inside **`NextJsonLd`**). Do not hand-roll `<script>` strings.

## Optional: `schemaMerge.dedupeByIdAndType`

When multiple nodes share the same **`@id`** and **`@type`**, the last one wins:

```ts
createSEO(
  { title: "t", schema: [olderOrg, newerOrg] },
  { schemaMerge: { dedupeByIdAndType: true } },
)
```

## Capability flags (**FEATURES P5**)

`SEOConfig.features` controls staged rollout:

- **`jsonLd: false`** — drops **`schema`** on the final `SEO` (after plugins). **`NextJsonLd`** renders nothing; head tags from **`renderTags`** omit JSON-LD scripts.
- **`openGraphMerge: false`** — does not copy **`meta.title` / `meta.description`** into **`openGraph`**, and does **not** set **`twitter.image`** from the first **`openGraph.images[]`** entry. Explicit **`openGraph`** / **`twitter`** fields still apply.

Default is both **on** (merge + bridge), matching the PRD “lazy defaults” path.

## Structured errors (`SEOError`)

Enterprise callers can branch on **`code`** (stable) and log **`message`** (human-readable).

| Code                      | When                                               |
| ------------------------- | -------------------------------------------------- |
| `VALIDATION`              | Invalid input (e.g. missing `title`)               |
| `ADAPTER_NOT_FOUND`       | `seoForFramework(id)` with no `registerAdapter`    |
| `MIGRATE_NOT_IMPLEMENTED` | `fromNextSeo` until Wave 12                        |
| `USE_SEO_NOT_AVAILABLE`   | `useSEO()` stub until `@better-seo/react` (Wave 5) |

```ts
import { isSEOError, SEOError } from "@better-seo/core"

try {
  createSEO({})
} catch (e) {
  if (isSEOError(e) && e.code === "VALIDATION") {
    // handle
  }
}
```

## `useSEO` (stub)

**`useSEO`** in core **throws** `USE_SEO_NOT_AVAILABLE`. For React SPAs, wait for **`@better-seo/react`** (Roadmap Wave 5 / **FEATURES V3**). App Router should use **`seo` / `prepareNextSeo` / `generateMetadata`**.

## `validateSEO` (dev)

Returns **`ValidationIssue[]`** with **`code`** (`TITLE_EMPTY`, `DESCRIPTION_MISSING`, `DESCRIPTION_REQUIRED`, …), **`field`**, **`message`**, **`severity`**. In non-production it **`console.warn`s** by default; pass **`log: false`** for assertions. Options: **`requireDescription`** (missing description → **`error`**), **`titleMaxLength`** / **`descriptionMaxLength`** (defaults 60 / 165). In **`NODE_ENV === "production"`** (or **`enabled: false`**) returns **`[]`** without logging.

## Open Graph images (Wave 2 — optional)

**Packages:** **`@better-seo/assets`** (library) and **`@better-seo/cli`** (CLI). These depend on **Satori**, **Resvg**, **React** (for JSX elements only), and embed **Inter** from **`@fontsource/inter`** (WOFF, not WOFF2 — Satori’s parser requirement).

**API:**

```ts
import { generateOG } from "@better-seo/assets"
import { writeFile } from "node:fs/promises"

const png = await generateOG({
  title: "Hello World",
  siteName: "My Site",
  description: "Optional subtitle",
  theme: "light", // or "dark" | "auto" (auto → light in Node)
  // logo: "./public/logo.png" or "https://…" (fetched at build time)
})
await writeFile("og.png", png)
```

**CLI** (install the workspace package or publish later; global/binary name **`better-seo`**):

```bash
npx @better-seo/cli og "Hello World" -o ./public/og.png --site-name "Brand"
```

Custom `template` paths are reserved (throws until a later release). Output is always **1200×630** PNG.

## Examples & recipes

- **`examples/nextjs-app`** — Playwright E2E (**N10**)
- **`docs/recipes/`** — **N5** / **N6** / **OG** (`og-wave2.md`)

## Progress across waves

See **[`PROGRESS.md`](./PROGRESS.md)** (done vs partial vs not started).
