import { createSEO, renderTags, webPage } from "@better-seo/core"
import { describe, expect, it } from "vitest"
import { toHelmetProps } from "./to-helmet-props.js"

describe("toHelmetProps", () => {
  it("maps title to Helmet title (not a <meta name=title>)", () => {
    const seo = createSEO({ title: "Page" })
    const h = toHelmetProps(seo)
    expect(h.title).toBe("Page")
    expect(h.meta?.some((m) => m.name === "title")).toBeFalsy()
  })

  it("includes description, canonical, OG, twitter, and JSON-LD scripts", () => {
    const seo = createSEO({
      title: "T",
      description: "D",
      canonical: "https://ex.test/c",
      openGraph: {
        url: "https://ex.test/c",
        type: "website",
        images: [{ url: "https://ex.test/o.png" }],
      },
      twitter: { card: "summary_large_image", title: "Tw" },
      schema: [webPage({ name: "T", url: "https://ex.test/c" })],
    })
    const h = toHelmetProps(seo)
    expect(h.link?.some((l) => l.rel === "canonical" && l.href === "https://ex.test/c")).toBe(true)
    expect(h.meta?.some((m) => m.property === "og:url")).toBe(true)
    expect(h.meta?.some((m) => m.name === "twitter:card")).toBe(true)
    expect(h.script?.length).toBe(1)
    expect(h.script?.[0]?.type).toBe("application/ld+json")
    expect(h.script?.[0]?.innerHTML).toContain("WebPage")
  })

  it("stays in sync with renderTags meta+link+script count (parity guard)", () => {
    const seo = createSEO({
      title: "Parity",
      description: "P",
      meta: { robots: "noindex", alternates: { languages: { en: "https://ex.test/en" } } },
      openGraph: {
        images: [
          { url: "https://a.test/1.png", width: 1 },
          { url: "https://a.test/2.png", width: 2 },
        ],
      },
      schema: [{ "@context": "https://schema.org", "@type": "Thing", name: "x" }],
    })
    const tags = renderTags(seo)
    const h = toHelmetProps(seo)
    const metaTags = tags.filter(
      (t) => t.kind === "meta" && !(t.kind === "meta" && t.name === "title"),
    )
    const linkTags = tags.filter((t) => t.kind === "link")
    const scripts = tags.filter((t) => t.kind === "script-jsonld")
    expect(h.meta?.length ?? 0).toBe(metaTags.length)
    expect(h.link?.length ?? 0).toBe(linkTags.length)
    expect(h.script?.length ?? 0).toBe(scripts.length)
  })
})
