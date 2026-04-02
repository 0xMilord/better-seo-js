import { expect, test } from "@playwright/test"

test.describe("head tags (home)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("canonical link and hreflang alternates", async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]')
    await expect(canonical).toHaveCount(1)

    const en = page.locator('link[rel="alternate"][hreflang="en-US"]')
    await expect(en).toHaveAttribute("href", /\/en$/)

    const xDefault = page.locator('link[rel="alternate"][hreflang="x-default"]')
    await expect(xDefault).toHaveCount(1)
  })

  test("Open Graph and Twitter card meta", async ({ page }) => {
    const ogDesc = page.locator('meta[property="og:description"]')
    await expect(ogDesc).toHaveAttribute("content", /Golden-path/)

    const ogImage = page.locator('meta[property="og:image"]')
    await expect(ogImage).toHaveAttribute("content", /og-example\.png/)

    const twCard = page.locator('meta[name="twitter:card"]')
    await expect(twCard).toHaveAttribute("content", /summary/)

    const twImage = page.locator('meta[name="twitter:image"]')
    await expect(twImage).toHaveAttribute("content", /og-example\.png/)
  })

  test("JSON-LD is parseable with expected @type", async ({ page }) => {
    const ld = page.locator('script[type="application/ld+json"]')
    const raw = await ld.textContent()
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw as string) as { "@type"?: string }
    expect(parsed["@type"]).toBe("WebPage")
  })

  test("serves OG PNG and favicon from public (Wave 4 asset pipeline)", async ({ request }) => {
    const og = await request.get("/og-example.png")
    expect(og.status()).toBe(200)
    expect(og.headers()["content-type"] ?? "").toMatch(/png/i)
    const ico = await request.get("/favicon.ico")
    expect(ico.status()).toBe(200)
  })
})

test("dynamic generateMetadata blog route", async ({ page }) => {
  await page.goto("/blog/hello-world")
  await expect(page).toHaveTitle(/Post: hello-world/)

  const desc = page.locator('meta[name="description"]')
  await expect(desc).toHaveAttribute("content", /generateMetadata/)

  const ogType = page.locator('meta[property="og:type"]')
  await expect(ogType).toHaveAttribute("content", "article")
})
