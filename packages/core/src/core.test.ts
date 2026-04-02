import { describe, expect, it } from "vitest"
import { createSEO, mergeSEO, withSEO } from "./core.js"
import { SEOError } from "./errors.js"
import { defineSEOPlugin } from "./plugins.js"
import { customSchema, webPage } from "./schema.js"

describe("createSEO", () => {
  it("requires a title", () => {
    expect(() => createSEO({})).toThrow(SEOError)
    expect(() => createSEO({})).toThrow(/VALIDATION/)
  })

  it("normalizes title and OG fallbacks", () => {
    const seo = createSEO({ title: "Hello", description: "World" })
    expect(seo.meta.title).toBe("Hello")
    expect(seo.meta.description).toBe("World")
    expect(seo.openGraph?.title).toBe("Hello")
    expect(seo.openGraph?.description).toBe("World")
  })

  it("applies titleTemplate with %s", () => {
    const seo = createSEO({ title: "About" }, { titleTemplate: "%s | Site" })
    expect(seo.meta.title).toBe("About | Site")
  })

  it("runs afterMerge plugins", () => {
    const plugin = defineSEOPlugin({
      id: "t",
      afterMerge: (doc) => ({
        ...doc,
        meta: { ...doc.meta, description: doc.meta.description ?? "filled" },
      }),
    })
    const seo = createSEO({ title: "T" }, { plugins: [plugin] })
    expect(seo.meta.description).toBe("filled")
  })
})

describe("mergeSEO", () => {
  it("child title wins", () => {
    const parent = createSEO({ title: "P", description: "old" })
    const next = mergeSEO(parent, { title: "C" })
    expect(next.meta.title).toBe("C")
  })

  it("deep-merges hreflang alternates (child overrides keys)", () => {
    const parent = createSEO({
      title: "P",
      meta: { alternates: { languages: { en: "https://x.test/en", fr: "https://x.test/fr" } } },
    })
    const next = mergeSEO(parent, {
      meta: { alternates: { languages: { en: "https://x.test/en-gb" } } },
    })
    expect(next.meta.alternates?.languages).toEqual({
      en: "https://x.test/en-gb",
      fr: "https://x.test/fr",
    })
  })

  it("deep-merges meta.verification.other", () => {
    const parent = createSEO({
      title: "P",
      meta: { verification: { google: "g1", other: { aa: "1" } } },
    })
    const next = mergeSEO(parent, {
      meta: { verification: { yandex: "y1", other: { bb: "2" } } },
    })
    expect(next.meta.verification).toEqual({
      google: "g1",
      yandex: "y1",
      other: { aa: "1", bb: "2" },
    })
  })

  it("concatenates schema", () => {
    const parent = createSEO({
      title: "P",
      schema: [webPage({ name: "a", url: "https://x.test/a" })],
    })
    const next = mergeSEO(parent, {
      schema: [webPage({ name: "b", url: "https://x.test/b" })],
    })
    expect(next.schema).toHaveLength(2)
  })

  it("schemaMerge concat keeps duplicate @id nodes (default)", () => {
    const a = customSchema({
      "@context": "https://schema.org",
      "@type": "Thing",
      "@id": "https://x.test/#id",
      name: "one",
    })
    const b = customSchema({
      "@context": "https://schema.org",
      "@type": "Thing",
      "@id": "https://x.test/#id",
      name: "two",
    })
    const seo = createSEO({ title: "t", schema: [a, b] }, { schemaMerge: "concat" })
    expect(seo.schema).toHaveLength(2)
  })

  it("dedupes @id+@type when schemaMerge.dedupeByIdAndType", () => {
    const older = customSchema({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://x.test/#acme",
      name: "Old",
    })
    const newer = customSchema({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://x.test/#acme",
      name: "New",
    })
    const seo = createSEO(
      { title: "t", schema: [older, newer] },
      { schemaMerge: { dedupeByIdAndType: true } },
    )
    expect(seo.schema).toHaveLength(1)
    expect((seo.schema[0] as { name?: string }).name).toBe("New")
  })
})

describe("withSEO", () => {
  it("aliases mergeSEO semantics", () => {
    const parent = createSEO({ title: "P", description: "base" })
    const layered = withSEO(parent, { title: "C" })
    expect(layered.meta.title).toBe("C")
  })
})

describe("SEOConfig.features (P5)", () => {
  it("jsonLd false strips schema after merge", () => {
    const seo = createSEO(
      { title: "t", schema: [webPage({ name: "p", url: "https://x.test/" })] },
      { features: { jsonLd: false } },
    )
    expect(seo.schema).toHaveLength(0)
  })

  it("jsonLd false wins over afterMerge-injected schema", () => {
    const plugin = defineSEOPlugin({
      id: "inject",
      afterMerge: (doc) => ({
        ...doc,
        schema: [webPage({ name: "x", url: "https://x.test/a" })],
      }),
    })
    const seo = createSEO({ title: "t" }, { plugins: [plugin], features: { jsonLd: false } })
    expect(seo.schema).toHaveLength(0)
  })

  it("openGraphMerge false omits openGraph when only title/description would be inferred", () => {
    const seo = createSEO(
      { title: "Hello", description: "World" },
      { features: { openGraphMerge: false } },
    )
    expect(seo.openGraph).toBeUndefined()
  })

  it("openGraphMerge false keeps explicit OG without meta title injection", () => {
    const seo = createSEO(
      { title: "Hello", openGraph: { type: "website", url: "https://x.test/" } },
      { features: { openGraphMerge: false } },
    )
    expect(seo.openGraph?.type).toBe("website")
    expect(seo.openGraph?.title).toBeUndefined()
  })

  it("fills twitter.image from first openGraph image by default", () => {
    const seo = createSEO({
      title: "t",
      openGraph: { images: [{ url: "https://cdn.test/card.png" }] },
    })
    expect(seo.twitter?.image).toBe("https://cdn.test/card.png")
  })

  it("does not bridge twitter image when openGraphMerge false", () => {
    const seo = createSEO(
      {
        title: "t",
        openGraph: { images: [{ url: "https://cdn.test/card.png" }] },
      },
      { features: { openGraphMerge: false } },
    )
    expect(seo.twitter?.image).toBeUndefined()
  })
})
