import { describe, expect, it } from "vitest"
import { createSEO } from "./core.js"
import { renderTags } from "./render.js"

describe("renderTags", () => {
  it("emits openGraph image meta when present", () => {
    const seo = createSEO({
      title: "T",
      openGraph: {
        images: [{ url: "https://cdn.test/og.png", width: 1200, height: 630, alt: "A" }],
      },
    })
    const tags = renderTags(seo)
    expect(tags.some((t) => t.kind === "meta" && t.property === "og:image")).toBe(true)
  })

  it("emits twitter:image when core bridged OG image", () => {
    const seo = createSEO({
      title: "T",
      openGraph: { images: [{ url: "https://cdn.test/og.png" }] },
    })
    const tags = renderTags(seo)
    expect(tags.some((t) => t.kind === "meta" && t.name === "twitter:image")).toBe(true)
  })

  it("emits robots and hreflang alternates", () => {
    const seo = createSEO({
      title: "T",
      meta: {
        robots: "noindex, nofollow",
        alternates: { languages: { en: "https://ex.test/en", de: "https://ex.test/de" } },
      },
    })
    const tags = renderTags(seo)
    expect(
      tags.some((t) => t.kind === "meta" && t.name === "robots" && t.content.includes("noindex")),
    ).toBe(true)
    const alts = tags.filter((t) => t.kind === "link" && t.hreflang)
    expect(alts).toHaveLength(2)
  })

  it("emits canonical, og title/description, and twitter fields when set", () => {
    const seo = createSEO({
      title: "T",
      description: "D",
      meta: { canonical: "https://ex.test/p" },
      openGraph: { title: "OGT", description: "OGD" },
      twitter: {
        card: "summary",
        title: "TwT",
        description: "TwD",
        image: "https://ex.test/tw.png",
      },
    })
    const tags = renderTags(seo)
    expect(tags.some((t) => t.kind === "link" && t.rel === "canonical")).toBe(true)
    expect(tags.some((t) => t.kind === "meta" && t.property === "og:title")).toBe(true)
    expect(tags.some((t) => t.kind === "meta" && t.property === "og:description")).toBe(true)
    expect(tags.some((t) => t.kind === "meta" && t.name === "twitter:description")).toBe(true)
  })

  it("does not emit og:image when images array is empty", () => {
    const seo = createSEO({
      title: "T",
      openGraph: { images: [] },
    })
    const tags = renderTags(seo)
    expect(tags.some((t) => t.kind === "meta" && t.property === "og:image")).toBe(false)
  })

  it("emits og:url and og:type when set", () => {
    const seo = createSEO({
      title: "T",
      openGraph: { url: "https://ex.test/page", type: "article" },
    })
    const tags = renderTags(seo)
    expect(
      tags.some(
        (t) => t.kind === "meta" && t.property === "og:url" && t.content === "https://ex.test/page",
      ),
    ).toBe(true)
    expect(
      tags.some((t) => t.kind === "meta" && t.property === "og:type" && t.content === "article"),
    ).toBe(true)
  })

  it("emits verification and pagination link tags", () => {
    const seo = createSEO({
      title: "T",
      meta: {
        verification: { google: "abc", other: { "custom-verify": "x" } },
        pagination: { previous: "https://ex.test/p/1", next: "https://ex.test/p/3" },
      },
    })
    const tags = renderTags(seo)
    expect(
      tags.some(
        (t) => t.kind === "meta" && t.name === "google-site-verification" && t.content === "abc",
      ),
    ).toBe(true)
    expect(tags.some((t) => t.kind === "link" && t.rel === "prev")).toBe(true)
    expect(tags.some((t) => t.kind === "link" && t.rel === "next")).toBe(true)
  })

  it("emits multiple og:image groups for multiple images", () => {
    const seo = createSEO({
      title: "T",
      openGraph: {
        images: [
          { url: "https://ex.test/a.png", width: 100, height: 100 },
          { url: "https://ex.test/b.png", width: 200, height: 200 },
        ],
      },
    })
    const ogImages = renderTags(seo).filter((t) => t.kind === "meta" && t.property === "og:image")
    expect(ogImages).toHaveLength(2)
    expect(ogImages.map((t) => (t as { kind: "meta"; content: string }).content)).toEqual([
      "https://ex.test/a.png",
      "https://ex.test/b.png",
    ])
  })
})
