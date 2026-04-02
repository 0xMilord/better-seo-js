import { describe, expect, it } from "vitest"
import { prepareReactSeo, helmetFromInput } from "./surface.js"

describe("prepareReactSeo / helmetFromInput", () => {
  it("prepareReactSeo returns matching seo and helmet", () => {
    const { seo, helmet } = prepareReactSeo({ title: "A", description: "B" })
    expect(seo.meta.title).toBe("A")
    expect(helmet.title).toBe("A")
    expect(helmet.meta?.some((m) => m.name === "description" && m.content === "B")).toBe(true)
  })

  it("helmetFromInput matches prepareReactSeo helmet shape", () => {
    const h = helmetFromInput({ title: "X" })
    expect(h.title).toBe("X")
  })
})
