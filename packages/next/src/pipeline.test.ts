import { describe, expect, it } from "vitest"
import { createSEO, defineSEOPlugin, SEOError } from "@better-seo/core"
import { toNextMetadata } from "./to-next-metadata.js"

describe("core → adapter pipeline", () => {
  it("createSEO + afterMerge + toNextMetadata", () => {
    const seo = createSEO(
      { title: "Page" },
      {
        plugins: [
          defineSEOPlugin({
            id: "desc",
            afterMerge: (doc) => ({
              ...doc,
              meta: { ...doc.meta, description: "from plugin" },
            }),
          }),
        ],
      },
    )
    const m = toNextMetadata(seo)
    expect(m.title).toBe("Page")
    expect(m.description).toBe("from plugin")
  })

  it("surfacing SEOError from core", () => {
    expect(() => createSEO({})).toThrow(SEOError)
  })
})
