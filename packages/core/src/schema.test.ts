import { describe, expect, it } from "vitest"
import { serializeJSONLD } from "./serialize.js"
import {
  article,
  breadcrumbList,
  faqPage,
  organization,
  person,
  product,
  techArticle,
} from "./schema.js"

describe("schema helpers", () => {
  it("breadcrumbList emits ListItem graph", () => {
    const j = breadcrumbList({
      items: [
        { name: "Home", url: "https://s.test/" },
        { name: "Cat", url: "https://s.test/c" },
      ],
    })
    const raw = serializeJSONLD(j)
    expect(raw).toContain("BreadcrumbList")
    expect(raw).toContain("ListItem")
  })

  it("FAQPage shapes mainEntity", () => {
    const j = faqPage({ questions: [{ question: "Q?", answer: "A." }] })
    expect(serializeJSONLD(j)).toContain("FAQPage")
  })

  it("Organization and Product include @type", () => {
    expect(serializeJSONLD(organization({ name: "Acme" }))).toContain("Organization")
    expect(serializeJSONLD(product({ name: "SKU", url: "https://s.test/p/1" }))).toContain(
      "Product",
    )
  })

  it("Article helper serializes", () => {
    const node = article({
      headline: "H",
      url: "https://s.test/a",
      datePublished: "2024-01-01",
    })
    expect(serializeJSONLD(node)).toContain("Article")
  })

  it("TechArticle helper serializes", () => {
    expect(
      serializeJSONLD(
        techArticle({ headline: "How-to", url: "https://s.test/docs/1", description: "Steps" }),
      ),
    ).toContain("TechArticle")
  })

  it("Person helper serializes", () => {
    expect(serializeJSONLD(person({ name: "Ada", url: "https://s.test/ada" }))).toContain("Person")
  })
})
