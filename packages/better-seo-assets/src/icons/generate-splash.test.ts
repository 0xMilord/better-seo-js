import { readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { SPLASH_SIZES, generateSplash, isLightColor } from "./generate-splash.js"

const FIXTURE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#2d6cdf"/>
  <circle cx="32" cy="32" r="18" fill="#ffffff"/>
</svg>`

describe("generateSplash", () => {
  const srcFiles: string[] = []
  const outDirs: string[] = []

  beforeEach(async () => {
    const src = join(tmpdir(), `splash-src-${Date.now()}.svg`)
    await writeFile(src, FIXTURE_SVG, "utf8")
    srcFiles.push(src)
  })

  afterEach(async () => {
    for (const f of srcFiles) {
      try {
        await rm(f, { force: true })
      } catch {
        /* ignore */
      }
    }
    srcFiles.length = 0
    for (const d of outDirs) {
      try {
        await rm(d, { recursive: true, force: true })
      } catch {
        /* ignore */
      }
    }
    outDirs.length = 0
  })

  it("produces PNG files for all splash sizes", async () => {
    const out = join(tmpdir(), `splash-out-${Date.now()}`)
    outDirs.push(out)
    const result = await generateSplash({ icon: srcFiles[0]!, outputDir: out })

    expect(result.length).toBe(SPLASH_SIZES.length)
    for (const filePath of result) {
      const data = await readFile(filePath)
      // PNG magic bytes: \x89PNG\r\n\x1a\n
      expect(data[0]).toBe(0x89)
      expect(data[1]).toBe(0x50) // P
      expect(data[2]).toBe(0x4e) // N
      expect(data[3]).toBe(0x47) // G
      expect(data[4]).toBe(0x0d) // \r
      expect(data[5]).toBe(0x0a) // \n
      expect(data[6]).toBe(0x1a)
      expect(data[7]).toBe(0x0a) // \n
    }
  })

  it("returns correct dimensions for each splash size", async () => {
    const out = join(tmpdir(), `splash-out-${Date.now()}`)
    outDirs.push(out)
    const result = await generateSplash({ icon: srcFiles[0]!, outputDir: out })

    for (let i = 0; i < SPLASH_SIZES.length; i++) {
      const data = await readFile(result[i]!)
      // IHDR chunk starts at byte 16; width at 16, height at 20 (4 bytes each, big-endian)
      const width = (data[16]! << 24) | (data[17]! << 16) | (data[18]! << 8) | data[19]!
      const height = (data[20]! << 24) | (data[21]! << 16) | (data[22]! << 8) | data[23]!
      expect(width).toBe(SPLASH_SIZES[i]!.width)
      expect(height).toBe(SPLASH_SIZES[i]!.height)
    }
  })

  it("throws when source icon does not exist", async () => {
    const out = join(tmpdir(), `splash-out-${Date.now()}`)
    outDirs.push(out)
    await expect(
      generateSplash({ icon: join(tmpdir(), "nonexistent-icon.svg"), outputDir: out }),
    ).rejects.toThrow()
  })

  it("creates the output directory if it does not exist", async () => {
    const out = join(tmpdir(), `splash-nested-${Date.now()}`, "a", "b")
    outDirs.push(out)
    const result = await generateSplash({ icon: srcFiles[0]!, outputDir: out })

    expect(result.length).toBe(SPLASH_SIZES.length)
    for (const filePath of result) {
      expect(filePath.startsWith(out)).toBe(true)
    }
  })

  it("returns array of generated file paths", async () => {
    const out = join(tmpdir(), `splash-out-${Date.now()}`)
    outDirs.push(out)
    const result = await generateSplash({ icon: srcFiles[0]!, outputDir: out })

    expect(Array.isArray(result)).toBe(true)
    for (const filePath of result) {
      expect(typeof filePath).toBe("string")
      expect(filePath).toMatch(/splash-\d+x\d+\.png$/)
    }
  })

  it("places output files in the correct directory", async () => {
    const out = join(tmpdir(), `splash-out-${Date.now()}`)
    outDirs.push(out)
    const result = await generateSplash({ icon: srcFiles[0]!, outputDir: out })

    for (const filePath of result) {
      const { dirname } = await import("node:path")
      expect(dirname(filePath)).toBe(out)
    }
  })
})

describe("isLightColor", () => {
  it("returns true for white (#ffffff)", () => {
    expect(isLightColor("#ffffff")).toBe(true)
  })

  it("returns false for black (#000000)", () => {
    expect(isLightColor("#000000")).toBe(false)
  })

  it("returns true for 3-digit white (#fff)", () => {
    expect(isLightColor("#fff")).toBe(true)
  })

  it("returns false for 3-digit black (#000)", () => {
    expect(isLightColor("#000")).toBe(false)
  })

  it("handles hex without leading hash", () => {
    expect(isLightColor("ffffff")).toBe(true)
    expect(isLightColor("000000")).toBe(false)
  })

  it("returns true for borderline gray (128,128,128)", () => {
    // (128*299 + 128*587 + 128*114) / 1000 = 128, which is NOT > 128
    expect(isLightColor("#808080")).toBe(false)
  })

  it("returns true for just-above-gray (129,129,129)", () => {
    // (129*299 + 129*587 + 129*114) / 1000 = 129, which IS > 128
    expect(isLightColor("#818181")).toBe(true)
  })
})
