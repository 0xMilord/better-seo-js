import { describe, expect, it } from "vitest"
import { isSEOError, SEOError } from "./errors.js"

describe("SEOError", () => {
  it("sets code and message prefix", () => {
    const e = new SEOError("VALIDATION", "bad")
    expect(e.code).toBe("VALIDATION")
    expect(e.message).toMatch(/\[@better-seo\/core\] \[VALIDATION\]/)
    expect(e.message).toContain("bad")
  })

  it("isSEOError narrows unknown", () => {
    expect(isSEOError(new SEOError("ADAPTER_NOT_FOUND"))).toBe(true)
    expect(isSEOError(new Error("x"))).toBe(false)
  })
})
