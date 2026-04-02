import { describe, expect, it } from "vitest"
import { SEOError } from "./errors.js"
import { registerAdapter } from "./adapters/registry.js"
import { seoForFramework, seoRoute, useSEO } from "./voila.js"

describe("seoForFramework", () => {
  it("throws ADAPTER_NOT_FOUND when adapter missing", () => {
    expect(() => seoForFramework("nonexistent", { title: "t" })).toThrow(SEOError)
    expect(() => seoForFramework("nonexistent", { title: "t" })).toThrow(/ADAPTER_NOT_FOUND/)
  })

  it("uses registered adapter", () => {
    registerAdapter({
      id: "test-adapter",
      toFramework: () => ({ ok: true }),
    })
    const out = seoForFramework<{ ok: boolean }>("test-adapter", { title: "Hi" })
    expect(out).toEqual({ ok: true })
  })
})

describe("useSEO", () => {
  it("throws USE_SEO_NOT_AVAILABLE", () => {
    expect(() => useSEO()).toThrow(SEOError)
    expect(() => useSEO()).toThrow(/USE_SEO_NOT_AVAILABLE/)
  })
})

describe("seoRoute", () => {
  it("applies config.rules then page input", () => {
    const cfg = {
      baseUrl: "https://app.test",
      titleTemplate: "%s | App",
      rules: [{ match: "/docs/*", seo: { description: "Docs section" } }],
    } as const
    const doc = seoRoute("/docs/api", { title: "API" }, cfg)
    expect(doc.meta.title).toBe("API | App")
    expect(doc.meta.description).toBe("Docs section")
  })
})
