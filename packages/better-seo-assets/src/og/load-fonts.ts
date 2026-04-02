import { readFileSync } from "node:fs"
import { createRequire } from "node:module"

export interface OgFont {
  readonly name: string
  readonly data: ArrayBuffer
  readonly weight: 400 | 700
  readonly style: "normal"
}

let cached: Promise<readonly OgFont[]> | undefined

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const u8 = new Uint8Array(buf.byteLength)
  u8.set(buf)
  return u8.buffer
}

/**
 * Loads Inter (latin 400/700) from `@fontsource/inter`.
 * Cached after first call.
 */
export async function loadOgFonts(): Promise<readonly OgFont[]> {
  if (cached) return cached
  cached = Promise.resolve().then(() => {
    const require = createRequire(import.meta.url)
    /** `.woff` only — Satori's font parser does not accept WOFF2 (`wOF2`) in all environments. */
    const path400 = require.resolve("@fontsource/inter/files/inter-latin-400-normal.woff")
    const path700 = require.resolve("@fontsource/inter/files/inter-latin-700-normal.woff")
    const data400 = toArrayBuffer(readFileSync(path400))
    const data700 = toArrayBuffer(readFileSync(path700))
    const fonts: OgFont[] = [
      { name: "Inter", data: data400, weight: 400, style: "normal" },
      { name: "Inter", data: data700, weight: 700, style: "normal" },
    ]
    return fonts
  })
  return cached
}
