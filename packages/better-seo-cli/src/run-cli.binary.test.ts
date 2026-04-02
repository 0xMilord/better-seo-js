import { execFileSync } from "node:child_process"
import { readFileSync, unlinkSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { imageSize } from "image-size"
import { OG_IMAGE_SIZE } from "better-seo-assets"

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
    unlinkSync(out)
  })
})
