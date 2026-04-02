import { createSEO } from "@better-seo/core"
import { SEOError } from "@better-seo/core"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SEOProvider, useSEO } from "./provider.js"

function TitleReadout() {
  const seo = useSEO()
  return <span data-testid="title">{seo.meta.title}</span>
}

describe("SEOProvider / useSEO", () => {
  it("exposes SEO from context", () => {
    const seo = createSEO({ title: "From provider" })
    const { getByTestId } = render(
      <SEOProvider seo={seo}>
        <TitleReadout />
      </SEOProvider>,
    )
    expect(getByTestId("title").textContent).toBe("From provider")
  })

  it("throws USE_SEO_NO_PROVIDER without SEOProvider", () => {
    expect(() => {
      render(<TitleReadout />)
    }).toThrow(SEOError)
    expect(() => {
      render(<TitleReadout />)
    }).toThrow(/USE_SEO_NO_PROVIDER/)
  })
})
