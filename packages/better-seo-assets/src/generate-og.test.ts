import { mkdirSync, unlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { imageSize } from "image-size"
import { generateOG } from "./og/generate-og.js"
import { OG_IMAGE_SIZE } from "./types.js"

describe("generateOG", () => {
  const tmpFiles: string[] = []
  afterEach(() => {
    for (const f of tmpFiles) {
      try {
        unlinkSync(f)
      } catch {
        /* ignore */
      }
    }
    tmpFiles.length = 0
  })

  it("returns a 1200×630 PNG with expected magic bytes", async () => {
    const buf = await generateOG({
      title: "Hello World",
      siteName: "Demo",
      description: "Optional subtitle for social previews.",
    })
    expect(
      buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ).toBe(true)
    const dims = imageSize(buf)
    expect(dims.width).toBe(OG_IMAGE_SIZE.width)
    expect(dims.height).toBe(OG_IMAGE_SIZE.height)
    expect(buf.byteLength).toBeGreaterThan(8000)
  })

  it("supports dark theme and custom colors", async () => {
    const buf = await generateOG({
      title: "Dark card",
      siteName: "Night",
      theme: "dark",
      colors: { primary: "#f472b6", background: "#1e1b4b" },
    })
    const dims = imageSize(buf)
    expect(dims.width).toBe(OG_IMAGE_SIZE.width)
    expect(buf.byteLength).toBeGreaterThan(4000)
  })

  it("rejects empty title", async () => {
    await expect(generateOG({ title: "   ", siteName: "X" })).rejects.toThrow(/title/)
  })

  it("rejects non-js template extension", async () => {
    await expect(
      generateOG({
        title: "T",
        siteName: "S",
        template: "./custom.tsx",
      }),
    ).rejects.toThrow(/\.js or \.mjs/)
  })

  it("renders with a custom .mjs template module", async () => {
    const dir = join(tmpdir(), `bsa-tpl-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
    const tplPath = join(dir, "custom-og.mjs")
    writeFileSync(
      tplPath,
      `import { createElement } from "react";
export default function CustomOg(p) {
  return createElement(
    "div",
    {
      style: {
        width: p.width,
        height: p.height,
        background: p.palette.bg,
        color: p.palette.fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 56,
        fontFamily: "Inter",
      },
    },
    p.title + " — " + p.siteName,
  );
}
`,
      "utf8",
    )
    tmpFiles.push(tplPath)

    const buf = await generateOG({
      title: "Custom tmpl",
      siteName: "CI",
      template: tplPath,
    })
    expect(imageSize(buf).width).toBe(OG_IMAGE_SIZE.width)
  })

  it("embeds a local PNG logo when provided", async () => {
    const dir = join(tmpdir(), `bsa-og-${Date.now()}`)
    mkdirSync(dir, { recursive: true })
    const logoPath = join(dir, "logo.png")
    const miniPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    )
    writeFileSync(logoPath, miniPng)
    tmpFiles.push(logoPath)

    const buf = await generateOG({
      title: "With logo",
      siteName: "Brand",
      logo: logoPath,
    })
    expect(imageSize(buf).width).toBe(OG_IMAGE_SIZE.width)
  })
})
