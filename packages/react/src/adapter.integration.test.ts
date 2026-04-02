import { createSEO, seoForFramework } from "@better-seo/core"
import { describe, expect, it } from "vitest"
import type { HelmetSEOProps } from "./to-helmet-props.js"
import "./index.js"

describe("@better-seo/react adapter registration", () => {
  it("registers react adapter for seoForFramework", () => {
    const out = seoForFramework<HelmetSEOProps>("react", { title: "Hello SPA" })
    expect(out).toMatchObject({ title: "Hello SPA" })
    expect(out.meta?.some((m) => m.property === "og:title")).toBe(true)
  })

  it("createSEO + adapter matches voilà input shape", () => {
    const doc = createSEO({ title: "Same", description: "D" })
    const viaVoila = seoForFramework<HelmetSEOProps>("react", { title: "Same", description: "D" })
    expect(viaVoila.title).toBe(doc.meta.title)
  })
})
