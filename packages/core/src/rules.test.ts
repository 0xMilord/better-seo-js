import { describe, expect, it } from "vitest"
import { createSEO } from "./core.js"
import {
  applyRules,
  applyRulesToSEO,
  createSEOForRoute,
  matchRoute,
  normalizeRoutePath,
} from "./rules.js"

describe("matchRoute", () => {
  it("legacy prefix* matches path prefix", () => {
    expect(matchRoute("/blog/*", "/blog/post")).toBe(true)
    expect(matchRoute("/blog/*", "/other")).toBe(false)
  })

  it("** glob matches nested segments", () => {
    expect(matchRoute("**/blog/**", "/en/blog")).toBe(true)
    expect(matchRoute("**/blog/**", "/en/blog/my-post")).toBe(true)
    expect(matchRoute("**/blog/**", "/en/news")).toBe(false)
  })

  it("per-segment * matches one segment", () => {
    expect(matchRoute("/users/*/profile", "/users/42/profile")).toBe(true)
    expect(matchRoute("/users/*/profile", "/users/42/settings")).toBe(false)
  })

  it("normalizes paths", () => {
    expect(normalizeRoutePath("foo//bar")).toBe("/foo/bar")
    expect(normalizeRoutePath("/")).toBe("/")
  })

  it("empty route matches root-style patterns", () => {
    expect(matchRoute("*", "")).toBe(true)
    expect(applyRules("", [{ match: "*", seo: { description: "root" } }]).description).toBe("root")
  })
})

describe("applyRules + createSEOForRoute", () => {
  it("merges rule partials for matching routes", () => {
    const seo = createSEOForRoute("/blog/post", { title: "Post" }, [
      { match: "/blog/*", priority: 1, seo: { description: "Blog" } },
      { match: "/other/*", seo: { description: "Other" } },
    ])
    expect(seo.meta.title).toBe("Post")
    expect(seo.meta.description).toBe("Blog")
  })

  it("higher priority overwrites lower for same key", () => {
    const seo = createSEOForRoute("/blog/x", { title: "T" }, [
      { match: "/blog/*", priority: 0, seo: { description: "Low" } },
      { match: "/blog/*", priority: 10, seo: { description: "High" } },
    ])
    expect(seo.meta.description).toBe("High")
  })
})

describe("applyRulesToSEO", () => {
  it("merges matched rules onto an existing document", () => {
    const base = createSEO({ title: "B", description: "orig" })
    const next = applyRulesToSEO("/docs/x", base, [
      { match: "/docs/*", seo: { description: "Docs layer" } },
    ])
    expect(next.meta.description).toBe("Docs layer")
  })
})
