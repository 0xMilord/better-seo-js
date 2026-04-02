import { NextJsonLd } from "@better-seo/next/json-ld"
import { prepareNextSeo } from "@better-seo/next"
import { webPage } from "@better-seo/core"

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000"

const { metadata, seo } = prepareNextSeo(
  {
    title: "better-seo.js example",
    description: "Golden-path Next app for Wave 1 / P0 (FEATURES N10).",
    canonical: "/",
    meta: {
      alternates: {
        languages: {
          "en-US": `${site.replace(/\/$/, "")}/en`,
          "x-default": site.replace(/\/$/, ""),
        },
      },
    },
    openGraph: {
      type: "website",
      images: [
        {
          url: `${site.replace(/\/$/, "")}/og-example.png`,
          width: 1200,
          height: 630,
          alt: "better-seo.js",
        },
      ],
    },
    schema: [
      webPage({
        name: "better-seo.js example",
        description: "Demonstrates metadata + JSON-LD via serializeJSONLD.",
        url: site,
      }),
    ],
  },
  { baseUrl: site },
)

export { metadata }

export default function HomePage() {
  return (
    <main>
      <NextJsonLd seo={seo} />
      <h1>better-seo.js</h1>
      <p>Golden path (App Router + Playwright).</p>
    </main>
  )
}
