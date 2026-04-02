import { describe, expect, it } from "vitest"
import { createSEO } from "@better-seo/core"
import { withSEO } from "./surface.js"

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
