import { expect, test } from "@playwright/test"

test("withSEO route merges title template and child description", async ({ page }) => {
  await page.goto("/with-seo")
  await expect(page).toHaveTitle(/Layered page \| merge demo/)

  const desc = page.locator('meta[name="description"]')
  await expect(desc).toHaveAttribute("content", /Child route wins/)

  const ld = page.locator('script[type="application/ld+json"]')
  await expect(ld).toHaveCount(1)
  const raw = await ld.textContent()
  expect(raw).toBeTruthy()
  const parsed = JSON.parse(raw as string) as unknown
  const lastNode = Array.isArray(parsed) ? parsed[parsed.length - 1] : parsed
  expect((lastNode as { name?: string }).name).toBe("Layered page")
})
