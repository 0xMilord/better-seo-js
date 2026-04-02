import { describe, expect, it } from "vitest"
import { SEOError } from "./errors.js"
import { fromNextSeo } from "./migrate.js"

describe("fromNextSeo", () => {
  it("throws MIGRATE_NOT_IMPLEMENTED", () => {
    expect(() => fromNextSeo({})).toThrow(SEOError)
    expect(() => fromNextSeo({})).toThrow(/MIGRATE_NOT_IMPLEMENTED/)
  })
})
