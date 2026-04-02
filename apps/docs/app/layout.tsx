import "./globals.css"

import { customSchema, organization } from "@better-seo/core"
import { prepareNextSeo } from "@better-seo/next"
import { NextJsonLd } from "@better-seo/next/json-ld"
import { Footer, Layout, Navbar } from "nextra-theme-docs"
import { Head } from "nextra/components"
import { getPageMap } from "nextra/page-map"
import type { Metadata } from "next"
import "nextra-theme-docs/style.css"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3004"

const { metadata: rootSeoMetadata, seo: rootSeo } = prepareNextSeo(
  {
    title: "Documentation",
    description:
      "better-seo.js is a programmable SEO engine for Next.js and modern apps — metadata, Open Graph, Twitter, and JSON-LD in one model.",
    canonical: "/",
    openGraph: {
      siteName: "better-seo.js",
    },
    schema: [
      organization({
        name: "better-seo.js",
        url: siteUrl,
      }),
      customSchema({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "better-seo.js docs",
        url: siteUrl,
      }),
    ],
  },
  {
    baseUrl: siteUrl,
    titleTemplate: "%s · better-seo.js docs",
  },
)

export const metadata: Metadata = {
  ...rootSeoMetadata,
  metadataBase: new URL(siteUrl),
}

const navbar = (
  <Navbar logo={<b>better-seo.js</b>} projectLink="https://github.com/0xMilord/better-seo-js" />
)

const footer = <Footer>MIT {new Date().getFullYear()} © better-seo.js contributors.</Footer>

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pageMap = await getPageMap()

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <NextJsonLd seo={rootSeo} />
        <Layout
          navbar={navbar}
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/0xMilord/better-seo-js/tree/main/docs"
          editLink="Edit this page on GitHub"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
