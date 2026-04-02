import { describe, expect, it } from "vitest"
import { dedupeSchemaByIdAndType } from "./schema-dedupe.js"
import { customSchema } from "./schema.js"

describe("dedupeSchemaByIdAndType", () => {
  it("keeps last duplicate for same @id and @type", () => {
    const a = customSchema({
      "@context": "https://schema.org",
      "@type": "Thing",
      "@id": "https://ex.test/i",
      value: 1,
    })
    const b = customSchema({
      "@context": "https://schema.org",
      "@type": "Thing",
      "@id": "https://ex.test/i",
      value: 2,
    })
    expect(dedupeSchemaByIdAndType([a, b])).toEqual([b])
  })

  it("preserves nodes missing @id or @type", () => {
    const plain = customSchema({ "@context": "https://schema.org", "@type": "Thing", value: 0 })
    const full = customSchema({
      "@context": "https://schema.org",
      "@type": "Thing",
      "@id": "https://ex.test/j",
      value: 1,
    })
    expect(dedupeSchemaByIdAndType([plain, full])).toEqual([plain, full])
  })
})
