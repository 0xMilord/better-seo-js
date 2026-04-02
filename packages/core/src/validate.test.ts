import { afterEach, describe, expect, it, vi } from "vitest"
import { createSEO } from "./core.js"
import { validateSEO } from "./validate.js"
import type { JSONLD, SEO } from "./types.js"

describe("validateSEO", () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it("returns [] when enabled is false (no run)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const issues = validateSEO(createSEO({ title: "x" }), { enabled: false })
    expect(issues).toEqual([])
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it("returns [] in production (strip) without logging", () => {
    process.env.NODE_ENV = "production"
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const issues = validateSEO(createSEO({ title: "only title" }))
    expect(issues).toEqual([])
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it("warns on missing description in development with code DESCRIPTION_MISSING", () => {
    process.env.NODE_ENV = "development"
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const issues = validateSEO(createSEO({ title: "only title" }))
    expect(issues.some((i) => i.code === "DESCRIPTION_MISSING")).toBe(true)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it("requireDescription upgrades missing description to error", () => {
    process.env.NODE_ENV = "development"
    const issues = validateSEO(createSEO({ title: "t" }), {
      requireDescription: true,
      log: false,
    })
    const d = issues.find((i) => i.field === "meta.description")
    expect(d?.severity).toBe("error")
    expect(d?.code).toBe("DESCRIPTION_REQUIRED")
  })

  it("flags long title when over titleMaxLength", () => {
    process.env.NODE_ENV = "development"
    const long = "a".repeat(70)
    const issues = validateSEO(createSEO({ title: long, description: "ok" }), {
      log: false,
      titleMaxLength: 60,
    })
    expect(issues.some((i) => i.code === "TITLE_TOO_LONG")).toBe(true)
  })

  it("flags narrow OG image", () => {
    process.env.NODE_ENV = "development"
    const issues = validateSEO(
      createSEO({
        title: "t",
        description: "d",
        openGraph: { images: [{ url: "https://x.test/i.png", width: 400 }] },
      }),
      { log: false },
    )
    expect(issues.some((i) => i.code === "OG_IMAGE_NARROW")).toBe(true)
  })

  it("flags empty title", () => {
    process.env.NODE_ENV = "development"
    const seo: SEO = {
      meta: { title: "" },
      twitter: { card: "summary", title: "" },
      schema: [],
    }
    const issues = validateSEO(seo, { log: false })
    expect(issues.some((i) => i.code === "TITLE_EMPTY")).toBe(true)
  })

  it("flags description over descriptionMaxLength", () => {
    process.env.NODE_ENV = "development"
    const d = "b".repeat(200)
    const issues = validateSEO(createSEO({ title: "t", description: d }), {
      log: false,
      descriptionMaxLength: 165,
    })
    expect(issues.some((i) => i.code === "DESCRIPTION_TOO_LONG")).toBe(true)
  })

  it("flags schema nodes missing @type", () => {
    process.env.NODE_ENV = "development"
    const issues = validateSEO(
      {
        meta: { title: "t", description: "d" },
        twitter: { card: "summary", title: "t", description: "d" },
        schema: [{} as JSONLD],
      },
      { log: false },
    )
    expect(issues.some((i) => i.code === "SCHEMA_MISSING_TYPE")).toBe(true)
  })
})
