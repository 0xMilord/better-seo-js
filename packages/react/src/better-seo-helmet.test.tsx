import { createSEO } from "@better-seo/core"
import { render, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HelmetProvider } from "react-helmet-async"
import { BetterSEOHelmet } from "./better-seo-helmet.js"

describe("BetterSEOHelmet", () => {
  it("applies title and meta to the document via Helmet", async () => {
    const seo = createSEO({ title: "Helmet page", description: "Desc" })
    render(
      <HelmetProvider>
        <BetterSEOHelmet seo={seo} />
      </HelmetProvider>,
    )
    await waitFor(() => {
      expect(document.title).toContain("Helmet page")
    })
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe("Desc")
  })
})
