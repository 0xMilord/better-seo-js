import { describe, expect, it } from "vitest"
import { createSEO } from "@better-seo/core"
import { prepareNextSeoForRoute, seoLayout, seoPage, seoRoute, withSEO } from "./surface.js"

describe("withSEO (Next)", () => {
  it("returns Metadata merged from parent SEO + child input", () => {
    const site = "https://demo.test"
    const cfg = { baseUrl: site, titleTemplate: "%s | Demo" } as const
    const parent = createSEO({ title: "Site", description: "Root description" }, cfg)
    const meta = withSEO(parent, { title: "Article", description: "Page wins" }, cfg)
    expect(meta.title).toBe("Article | Demo")
    expect(meta.description).toBe("Page wins")
  })
})

describe("seoRoute (Next)", () => {
  it("applies rules and maps to Metadata", () => {
    const cfg = {
      baseUrl: "https://demo.test",
      titleTemplate: "%s | Demo",
      rules: [{ match: "/pricing", seo: { description: "Plans" } }],
    } as const
    const meta = seoRoute("/pricing", { title: "Pricing" }, cfg)
    expect(meta.title).toBe("Pricing | Demo")
    expect(meta.description).toBe("Plans")
  })

  it("prepareNextSeoForRoute returns metadata + seo document", () => {
    const cfg = {
      baseUrl: "https://demo.test",
      rules: [{ match: "/x", seo: { description: "X" } }],
    } as const
    const { metadata, seo } = prepareNextSeoForRoute("/x", { title: "T" }, cfg)
    expect(metadata.description).toBe("X")
    expect(seo.meta.description).toBe("X")
  })
})

describe("seoLayout / seoPage (V4)", () => {
  it("matches createSEO + withSEO behavior", () => {
    const cfg = { baseUrl: "https://demo.test", titleTemplate: "%s | X" } as const
    const layout = seoLayout({ title: "Root", description: "default" }, cfg)
    const page = seoPage(layout, { title: "About", description: "about us" }, cfg)
    expect(page.title).toBe("About | X")
    expect(page.description).toBe("about us")
  })
})
