import { NextJsonLd } from "@better-seo/next/json-ld"
import { withSEO } from "@better-seo/next"
import { createSEO, mergeSEO, webPage } from "better-seo.js"

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000"
const baseConfig = { baseUrl: site, titleTemplate: "%s | merge demo" } as const

const parentSeo = createSEO(
  {
    title: "Layout base",
    description: "Parent description (overridden on this route).",
    canonical: "/with-seo",
    schema: [
      webPage({
        name: "Layout base",
        description: "Parent WebPage node.",
        url: `${site.replace(/\/$/, "")}/with-seo`,
      }),
    ],
  },
  baseConfig,
)

const pageInput = {
  title: "Layered page",
  description: "Child route wins for description.",
  schema: [
    webPage({
      name: "Layered page",
      description: "Child WebPage for JSON-LD on this route.",
      url: `${site.replace(/\/$/, "")}/with-seo`,
    }),
  ],
}

const mergedSeo = mergeSEO(parentSeo, pageInput, baseConfig)

export const metadata = withSEO(parentSeo, pageInput, baseConfig)

export default function WithSeoDemoPage() {
  return (
    <main>
      <NextJsonLd seo={mergedSeo} />
      <h1>withSEO demo</h1>
      <p>layout → page metadata merge (FEATURES N5 / V2).</p>
    </main>
  )
}
