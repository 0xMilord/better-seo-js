import { describe, expect, it } from "vitest"
import { createSEO, webPage } from "@better-seo/core"
import { toNextMetadata } from "./to-next-metadata.js"

describe("toNextMetadata", () => {
  it("maps title, canonical, and openGraph", () => {
    const doc = createSEO({
      title: "Hello",
      description: "World",
      canonical: "https://ex.test/hi",
      openGraph: { type: "website", url: "https://ex.test/hi" },
      schema: [webPage({ name: "Hello", url: "https://ex.test/hi" })],
    })
    const m = toNextMetadata(doc)
    expect(m.title).toBe("Hello")
    expect(m.description).toBe("World")
    expect(m.alternates?.canonical).toBe("https://ex.test/hi")
    expect(m.openGraph).toBeDefined()
    expect(String((m.openGraph as Record<string, unknown>)["type"])).toBe("website")
  })

  it("maps hreflang alternates alongside canonical", () => {
    const doc = createSEO({
      title: "Hi",
      canonical: "https://ex.test/en/hi",
      meta: {
        alternates: {
          languages: { de: "https://ex.test/de/hi" },
        },
      },
    })
    const m = toNextMetadata(doc)
    expect(m.alternates?.canonical).toBe("https://ex.test/en/hi")
    expect(m.alternates?.languages?.de).toBe("https://ex.test/de/hi")
  })

  it("maps openGraph siteName, locale, article times, twitter site/creator", () => {
    const doc = createSEO({
      title: "A",
      description: "B",
      openGraph: {
        type: "article",
        url: "https://ex.test/p",
        siteName: "Ex News",
        locale: "fr_FR",
        publishedTime: "2026-02-01T08:00:00.000Z",
        authors: ["Jane"],
        section: "Tech",
        tags: ["js"],
      },
      twitter: { site: "@exnews", creator: "@jane" },
    })
    const m = toNextMetadata(doc)
    expect(m.openGraph).toMatchObject({
      siteName: "Ex News",
      locale: "fr_FR",
      publishedTime: "2026-02-01T08:00:00.000Z",
      authors: ["Jane"],
      section: "Tech",
      tags: ["js"],
    })
    expect(m.twitter).toMatchObject({ site: "@exnews", creator: "@jane" })
  })

  it("maps restrictive robots", () => {
    const doc = createSEO({ title: "R", meta: { robots: "noindex, nofollow" } })
    const m = toNextMetadata(doc)
    expect(m.robots).toEqual({ index: false, follow: false })
  })

  it("preserves robots as raw string when value directives use colons (Google parity)", () => {
    const raw = "max-snippet:20, max-image-preview:large"
    const doc = createSEO({ title: "S", meta: { robots: raw } })
    const m = toNextMetadata(doc)
    expect(m.robots).toBe(raw)
  })

  it("maps simple extra flags (nosnippet) onto structured robots", () => {
    const doc = createSEO({ title: "N", meta: { robots: "nosnippet, nofollow" } })
    const m = toNextMetadata(doc)
    expect(m.robots).toEqual({ index: true, follow: false, nosnippet: true })
  })

  it("maps robots none and extended simple flags", () => {
    const none = createSEO({ title: "N", meta: { robots: "none" } })
    expect(toNextMetadata(none).robots).toEqual({ index: false, follow: false })

    const doc = createSEO({
      title: "R",
      meta: {
        robots:
          "noindex, noarchive, nosnippet, noimageindex, notranslate, nocache, indexifembedded, nositelinkssearchbox",
      },
    })
    expect(toNextMetadata(doc).robots).toMatchObject({
      index: false,
      follow: true,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      notranslate: true,
      nocache: true,
      indexifembedded: true,
      nositelinkssearchbox: true,
    })
  })

  it("accepts all,index,follow as no-ops in structured robots", () => {
    const doc = createSEO({ title: "A", meta: { robots: "all, index, follow, noarchive" } })
    const m = toNextMetadata(doc)
    expect(m.robots).toMatchObject({ index: true, follow: true, noarchive: true })
  })

  it("falls back to raw string for unknown simple tokens", () => {
    const raw = "noindex, totally-made-up"
    const doc = createSEO({ title: "U", meta: { robots: raw } })
    const m = toNextMetadata(doc)
    expect(m.robots).toBe(raw)
  })

  it("maps verification and pagination", () => {
    const doc = createSEO({
      title: "V",
      meta: {
        verification: { google: "g-token", other: { "other-verify": "x" } },
        pagination: { previous: "https://ex.test/p/1", next: "https://ex.test/p/3" },
      },
    })
    const m = toNextMetadata(doc)
    expect(m.verification).toMatchObject({ google: "g-token", other: { "other-verify": "x" } })
    expect(m.pagination).toEqual({
      previous: "https://ex.test/p/1",
      next: "https://ex.test/p/3",
    })
  })

  it("maps twitter images from OG-derived twitter.image", () => {
    const doc = createSEO({
      title: "T",
      openGraph: { images: [{ url: "https://ex.test/og.jpg" }] },
    })
    const m = toNextMetadata(doc)
    expect(m.twitter?.images).toEqual(["https://ex.test/og.jpg"])
  })

  it("maps twitter metadata without images array", () => {
    const doc = createSEO({
      title: "T",
      twitter: { card: "summary", title: "Tw title", description: "Tw desc" },
    })
    const m = toNextMetadata(doc)
    expect(m.twitter).toMatchObject({
      card: "summary",
      title: "Tw title",
      description: "Tw desc",
    })
    expect(m.twitter?.images).toBeUndefined()
  })

  it("omits verification when only empty other", () => {
    const doc = createSEO({
      title: "O",
      meta: { verification: { google: "x", other: {} } },
    })
    const m = toNextMetadata(doc)
    expect(m.verification).toEqual({ google: "x" })
  })

  it("maps openGraph image fields and omits undefined image props", () => {
    const doc = createSEO({
      title: "OG",
      openGraph: {
        images: [{ url: "https://ex.test/i.png", width: 1200, height: 630, alt: "A" }],
      },
    })
    const m = toNextMetadata(doc)
    const imgs = m.openGraph?.images
    const first = Array.isArray(imgs) ? imgs[0] : imgs
    expect(first).toEqual({
      url: "https://ex.test/i.png",
      width: 1200,
      height: 630,
      alt: "A",
    })
  })

  it("golden: static metadata shape omits undefined nested fields", () => {
    const doc = createSEO({ title: "Simple" })
    const m = toNextMetadata(doc)
    expect(JSON.parse(JSON.stringify(m))).toEqual(
      expect.objectContaining({
        title: "Simple",
        openGraph: expect.objectContaining({ title: "Simple" }),
      }),
    )
  })
})
