import { mkdir, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { generateIcons, generateOG } from "@better-seo/assets"
import type { IconManifestConfig, OGTheme, PwaDisplay } from "@better-seo/assets"

/** Shared OG options after argv / TUI validation (Wave 2). */
export type OgExecuteInput = {
  readonly title: string
  readonly out?: string
  readonly siteName?: string
  readonly description?: string
  readonly theme?: OGTheme
  readonly logo?: string
  readonly template?: string
}

/** Shared icons options after argv / TUI validation (Wave 3). */
export type IconsExecuteInput = {
  readonly source: string
  readonly outputDir?: string
  readonly backgroundColor?: string
  /** When false, do not write manifest.json (same as CLI `--no-manifest`). */
  readonly omitManifest?: boolean
  readonly manifest?: IconManifestConfig
}

export function parseThemeString(s: string | undefined): OGTheme | undefined {
  if (s === undefined) return undefined
  if (s === "light" || s === "dark" || s === "auto") return s
  throw new Error(`Invalid theme "${s}". Use light, dark, or auto.`)
}

export function parseDisplayString(s: string | undefined): PwaDisplay {
  if (s === undefined) return "standalone"
  if (s === "standalone" || s === "minimal-ui" || s === "browser") return s
  throw new Error(`Invalid display "${s}". Use standalone, minimal-ui, or browser.`)
}

/**
 * Runs OG generation and file write; logs timing. Used by argv and TUI paths.
 */
export async function executeOg(input: OgExecuteInput): Promise<number> {
  const out = input.out ?? "og.png"
  const siteName = input.siteName ?? "@better-seo"
  try {
    const started = performance.now()
    const png = await generateOG({
      title: input.title,
      siteName,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.theme !== undefined ? { theme: input.theme } : {}),
      ...(input.logo !== undefined ? { logo: input.logo } : {}),
      ...(input.template !== undefined ? { template: input.template } : {}),
    })
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, png)
    const ms = Math.round(performance.now() - started)
    console.log(`Wrote ${out} (${png.byteLength} bytes) in ${ms}ms`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}

/**
 * Runs icon generation; logs each file. Used by argv and TUI paths.
 */
export async function executeIcons(input: IconsExecuteInput): Promise<number> {
  const outputDir = input.outputDir ?? "public"
  try {
    const started = performance.now()
    const written = await generateIcons({
      source: input.source,
      outputDir,
      ...(input.backgroundColor !== undefined ? { backgroundColor: input.backgroundColor } : {}),
      ...(!input.omitManifest && input.manifest !== undefined ? { manifest: input.manifest } : {}),
    })
    const ms = Math.round(performance.now() - started)
    for (const f of written) {
      console.log(`Wrote ${outputDir}/${f.fileName} (${f.bytesWritten} bytes)`)
    }
    console.log(`Done in ${ms}ms`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}
