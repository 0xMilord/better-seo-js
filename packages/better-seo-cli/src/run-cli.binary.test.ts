import { execFileSync } from "node:child_process"
import { readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { imageSize } from "image-size"
import { OG_IMAGE_SIZE } from "@better-seo/assets"

/** Production-style check: built `dist/cli.cjs` (requires `npm run build` first). */
const cliCjs = fileURLToPath(new URL("../dist/cli.cjs", import.meta.url))

describe("built better-seo CLI (CJS bin)", () => {
  it("runs `og` and writes a 1200×630 PNG", () => {
    const out = join(tmpdir(), `better-seo-bin-${Date.now()}.png`)
    execFileSync(
      process.execPath,
      [cliCjs, "og", "Binary smoke", "--out", out, "--site-name", "CI"],
      {
        stdio: "pipe",
      },
    )
    const buf = readFileSync(out)
    expect(imageSize(buf).width).toBe(OG_IMAGE_SIZE.width)
    expect(imageSize(buf).height).toBe(OG_IMAGE_SIZE.height)
    rmSync(out, { force: true })
  })

  it("runs `icons` and writes favicon.ico", () => {
    const src = join(tmpdir(), `better-seo-icon-src-${Date.now()}.svg`)
    const outDir = join(tmpdir(), `better-seo-icons-${Date.now()}`)
    writeFileSync(
      src,
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="blue"/></svg>`,
      "utf8",
    )
    execFileSync(process.execPath, [cliCjs, "icons", src, "--output", outDir, "--no-manifest"], {
      stdio: "pipe",
    })
    const ico = readFileSync(join(outDir, "favicon.ico"))
    expect(ico[0]).toBe(0)
    expect(ico[2]).toBe(1)
    rmSync(outDir, { recursive: true, force: true })
    rmSync(src, { force: true })
  })

  it("runs `crawl robots` and writes robots.txt", () => {
    const out = join(tmpdir(), `better-seo-robots-${Date.now()}.txt`)
    execFileSync(
      process.execPath,
      [cliCjs, "crawl", "robots", "--out", out, "--sitemap", "https://example.com/sitemap.xml"],
      { stdio: "pipe" },
    )
    const text = readFileSync(out, "utf8")
    expect(text).toContain("Sitemap: https://example.com/sitemap.xml")
    rmSync(out, { force: true })
  })

  it("runs `crawl sitemap` and writes sitemap.xml", () => {
    const out = join(tmpdir(), `better-seo-sitemap-${Date.now()}.xml`)
    execFileSync(
      process.execPath,
      [cliCjs, "crawl", "sitemap", "--out", out, "--loc", "https://a.test/"],
      {
        stdio: "pipe",
      },
    )
    const xml = readFileSync(out, "utf8")
    expect(xml).toContain("<urlset")
    expect(xml).toContain("https://a.test/</loc>")
    rmSync(out, { force: true })
  })
})
