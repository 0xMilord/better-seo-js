import { describe, expect, it } from "vitest"
import { createSEO, webPage } from "better-seo.js"
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

  it("maps restrictive robots", () => {
    const doc = createSEO({ title: "R", meta: { robots: "noindex, nofollow" } })
    const m = toNextMetadata(doc)
    expect(m.robots).toEqual({ index: false, follow: false })
  })

  it("maps twitter images from OG-derived twitter.image", () => {
    const doc = createSEO({
      title: "T",
      openGraph: { images: [{ url: "https://ex.test/og.jpg" }] },
    })
    const m = toNextMetadata(doc)
    expect(m.twitter?.images).toEqual(["https://ex.test/og.jpg"])
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
