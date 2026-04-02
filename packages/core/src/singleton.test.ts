import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getGlobalSEOConfig, initSEO, resetSEOConfigForTests } from "./singleton.js"

describe("initSEO / getGlobalSEOConfig", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    resetSEOConfigForTests()
  })

  it("stores and returns global config", () => {
    const cfg = { baseUrl: "https://g.test", titleTemplate: "%s | G" }
    initSEO(cfg)
    expect(getGlobalSEOConfig()).toEqual(cfg)
  })

  it("reset clears config", () => {
    initSEO({ baseUrl: "https://x.test" })
    resetSEOConfigForTests()
    expect(getGlobalSEOConfig()).toBeUndefined()
  })
})
