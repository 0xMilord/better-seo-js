# N6 — `generateMetadata` and async data

**Goal:** Fill SEO from CMS, DB, or `fetch` while keeping **`better-seo.js`** usable from synchronous `createSEO` / `mergeSEO` after async work completes.

`createSEO` is **synchronous**: run it **after** you `await` your data inside `generateMetadata`.

## Pattern

```ts
import type { Metadata } from "next"
import { createSEO, webPage } from "better-seo.js"
import { toNextMetadata } from "@better-seo/next"

const site = process.env.NEXT_PUBLIC_SITE_URL!

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await props.params
  const post = await fetch(`${site}/api/posts/${slug}`).then((r) => r.json())

  const doc = createSEO(
    {
      title: post.title,
      description: post.summary,
      canonical: `/blog/${slug}`,
      openGraph: { type: "article" },
      schema: [
        webPage({
          name: post.title,
          description: post.summary,
          url: `${site}/blog/${slug}`,
        }),
      ],
    },
    { baseUrl: site, titleTemplate: "%s | Blog" },
  )

  return toNextMetadata(doc)
}
```

## JSON-LD in the page component

`generateMetadata` cannot render JSX. For **`NextJsonLd`**, either:

1. Call **`prepareNextSeo`** (or `createSEO` again with the **same** input) in the server component using the same data you fetched, or
2. Lift shared resolution into a small `getPost(slug)` helper used by both `generateMetadata` and the page.

Keep inputs identical so metadata and JSON-LD never drift.

## Caching

Use Next **`fetch` cache / `unstable_cache`** (per your app policy) so metadata generation stays fast (**PRD** time-to-first-SEO budget).

## See also

- **`prepareNextSeo`** — `packages/next/src/surface.ts`
- Roadmap **Wave 1**, **FEATURES N6**
