import { readFileSync } from "node:fs"
import { Resvg } from "@resvg/resvg-js"
import { createElement } from "react"
import satori from "satori"
import type { OGColors, OGConfig, OGTheme } from "../types.js"
import { OG_IMAGE_SIZE } from "../types.js"
import { loadOgFonts } from "./load-fonts.js"
import { OgCard } from "./templates/og-card.js"

function resolveTheme(theme: OGTheme | undefined): "light" | "dark" {
  if (theme === "dark") return "dark"
  if (theme === "light") return "light"
  /** `auto` in Node has no `prefers-color-scheme`; default to light (override with `theme` or `colors`). */
  return "light"
}

function resolvePalette(
  mode: "light" | "dark",
  colors: OGColors | undefined,
): {
  bg: string
  fg: string
  muted: string
  accent: string
} {
  if (mode === "dark") {
    return {
      bg: colors?.background ?? "#0f172a",
      fg: "#f8fafc",
      muted: "#94a3b8",
      accent: colors?.primary ?? "#38bdf8",
    }
  }
  return {
    bg: colors?.background ?? "#f8fafc",
    fg: "#0f172a",
    muted: "#64748b",
    accent: colors?.primary ?? "#2563eb",
  }
}

function mimeForLogoPath(path: string): string {
  const lower = path.toLowerCase()
  if (lower.endsWith(".svg")) return "image/svg+xml"
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".webp")) return "image/webp"
  return "application/octet-stream"
}

/**
 * Resolve `logo` to a data URL for Satori, or `undefined`.
 * Supports `http(s)://` (uses global `fetch`) and local filesystem paths.
 */
export async function resolveLogoDataUrl(logo: string | undefined): Promise<string | undefined> {
  if (!logo?.trim()) return undefined
  const t = logo.trim()
  if (t.startsWith("http://") || t.startsWith("https://")) {
    const res = await fetch(t)
    if (!res.ok) {
      throw new Error(`[@better-seo/assets] failed to fetch logo (${res.status} ${res.statusText})`)
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const ct = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "image/png"
    return `data:${ct};base64,${buf.toString("base64")}`
  }
  const mime = mimeForLogoPath(t)
  const buf = readFileSync(t)
  return `data:${mime};base64,${buf.toString("base64")}`
}

/**
 * Renders a 1200×630 PNG Open Graph image using Satori + Resvg.
 *
 * @throws If `title` or `siteName` is empty, or `template` is set (not yet supported).
 */
export async function generateOG(config: OGConfig): Promise<Buffer> {
  if (config.template != null && String(config.template).trim() !== "") {
    throw new Error(
      "[@better-seo/assets] custom `template` paths are not supported yet. Use `theme`: light | dark | auto.",
    )
  }

  const title = config.title.trim()
  if (!title) {
    throw new Error("[@better-seo/assets] `title` is required.")
  }
  const siteName = config.siteName.trim()
  if (!siteName) {
    throw new Error("[@better-seo/assets] `siteName` is required.")
  }

  const mode = resolveTheme(config.theme)
  const palette = resolvePalette(mode, config.colors)
  const logoDataUrl = await resolveLogoDataUrl(config.logo)
  const description = config.description?.trim() || undefined

  const fonts = await loadOgFonts()
  const element = createElement(OgCard, {
    title,
    description,
    siteName,
    logoDataUrl,
    palette,
    width: OG_IMAGE_SIZE.width,
    height: OG_IMAGE_SIZE.height,
  })

  const svg = await satori(element, {
    width: OG_IMAGE_SIZE.width,
    height: OG_IMAGE_SIZE.height,
    fonts: [...fonts],
  })

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: OG_IMAGE_SIZE.width,
    },
  })
  const pngData = resvg.render()
  const png = pngData.asPng()
  return Buffer.from(png)
}
