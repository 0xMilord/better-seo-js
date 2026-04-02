import { expect, test } from "@playwright/test"

test.describe("golden app (N10)", () => {
  test("emits title, description, OG, and parseable JSON-LD", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/better-seo\.js example/)

    const desc = page.locator('meta[name="description"]')
    await expect(desc).toHaveAttribute("content", /Golden-path/)

    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toHaveAttribute("content", /better-seo\.js example/)

    const ld = page.locator('script[type="application/ld+json"]')
    await expect(ld).toHaveCount(1)
    const raw = await ld.textContent()
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw as string) as { "@type"?: string }
    expect(parsed["@type"]).toBe("WebPage")
  })
})
