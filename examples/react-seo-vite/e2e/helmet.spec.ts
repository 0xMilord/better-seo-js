import { expect, test } from "@playwright/test"

test("document reflects BetterSEOHelmet title and description", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Vite React SEO Demo/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /E2E fixture for @better-seo\/react/,
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://example.test/",
  )
})
