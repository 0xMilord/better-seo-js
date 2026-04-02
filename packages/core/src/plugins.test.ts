import { describe, expect, it } from "vitest"
import { createSEO } from "./core.js"
import { defineSEOPlugin } from "./plugins.js"
import { webPage } from "./schema.js"

describe("plugin hook order", () => {
  it("runs beforeMerge plugins in config order", () => {
    const order: string[] = []
    const a = defineSEOPlugin({
      id: "a",
      beforeMerge: (input) => {
        order.push("a")
        return { ...input, description: "A" }
      },
    })
    const b = defineSEOPlugin({
      id: "b",
      beforeMerge: (input) => {
        order.push("b")
        return { ...input, description: `${input.description ?? ""}B` }
      },
    })
    const seo = createSEO({ title: "T" }, { plugins: [a, b] })
    expect(order).toEqual(["a", "b"])
    expect(seo.meta.description).toBe("AB")
  })

  it("runs afterMerge plugins in config order", () => {
    const order: string[] = []
    const seo = createSEO(
      { title: "T" },
      {
        plugins: [
          defineSEOPlugin({
            id: "a",
            afterMerge: (doc) => {
              order.push("a")
              return { ...doc, meta: { ...doc.meta, description: "a" } }
            },
          }),
          defineSEOPlugin({
            id: "b",
            afterMerge: (doc) => {
              order.push("b")
              return { ...doc, meta: { ...doc.meta, description: `${doc.meta.description}b` } }
            },
          }),
        ],
      },
    )
    expect(order).toEqual(["a", "b"])
    expect(seo.meta.description).toBe("ab")
  })

  it("features.jsonLd false strips schema after afterMerge adds some", () => {
    const seo = createSEO(
      { title: "T" },
      {
        features: { jsonLd: false },
        plugins: [
          defineSEOPlugin({
            id: "schema",
            afterMerge: (d) => ({
              ...d,
              schema: [webPage({ name: "x", url: "https://x.test/" })],
            }),
          }),
        ],
      },
    )
    expect(seo.schema).toHaveLength(0)
  })
})
