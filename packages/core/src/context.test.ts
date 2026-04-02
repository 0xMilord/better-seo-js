import { describe, expect, it } from "vitest"
import { createSEOContext } from "./context.js"

describe("createSEOContext", () => {
  it("binds config for createSEO and mergeSEO", () => {
    const ctx = createSEOContext({
      baseUrl: "https://site.test",
      titleTemplate: "%s | App",
    })
    const a = ctx.createSEO({ title: "One", canonical: "/a" })
    expect(a.meta.title).toBe("One | App")
    expect(a.meta.canonical).toBe("https://site.test/a")

    const b = ctx.mergeSEO(a, { title: "Two" })
    expect(b.meta.title).toBe("Two | App")
  })

  it("exposes the same config reference", () => {
    const cfg = { baseUrl: "https://x.test" }
    const ctx = createSEOContext(cfg)
    expect(ctx.config).toBe(cfg)
  })
})
