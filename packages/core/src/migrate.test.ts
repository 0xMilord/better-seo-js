import { describe, expect, it } from "vitest"
import { SEOError } from "./errors.js"
import { createSEO } from "./core.js"
import { fromNextSeo } from "./migrate.js"

describe("fromNextSeo", () => {
  it("rejects non-objects", () => {
    expect(() => fromNextSeo(null)).toThrow(SEOError)
    expect(() => fromNextSeo(null)).toThrow(/VALIDATION/)
  })

  it("requires a title from title, defaultTitle, or openGraph.title", () => {
    expect(() => fromNextSeo({ description: "only" })).toThrow(/title/)
    const input = fromNextSeo({ defaultTitle: "Home", description: "D" })
    expect(input.title).toBe("Home")
    expect(createSEO(input).meta.title).toBe("Home")
  })

  it("maps canonical, openGraph, twitter, and noindex", () => {
    const input = fromNextSeo({
      title: "Post",
      canonical: "https://ex.test/p/1",
      noindex: true,
      openGraph: {
        type: "article",
        url: "https://ex.test/p/1",
        images: [{ url: "https://ex.test/og.png", width: 1200, height: 630 }],
      },
      twitter: { card: "summary", title: "Tw", image: "https://ex.test/tw.jpg" },
    })
    const seo = createSEO(input)
    expect(seo.meta.canonical).toBe("https://ex.test/p/1")
    expect(seo.meta.robots).toContain("noindex")
    expect(seo.openGraph?.type).toBe("article")
    expect(seo.openGraph?.images?.[0]?.url).toBe("https://ex.test/og.png")
    expect(seo.twitter?.card).toBe("summary")
    expect(seo.twitter?.image).toBe("https://ex.test/tw.jpg")
  })
})
