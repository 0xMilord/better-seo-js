/**
 * Node-only entry: filesystem-backed helpers for **`SEOConfig`** inference.
 * Import `@better-seo/core/node` only in Node (CLI, scripts, local dev); use `@better-seo/core` in Edge/browser bundles.
 */
export * from "./index.js"

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import type { SEOConfig } from "./types.js"
import { initSEO } from "./singleton.js"

export interface PackageJsonSEOHints {
  readonly name?: string
  readonly homepage?: string
  readonly description?: string
}

/** Read **name**, **homepage**, **description** from **package.json** (Node builtins only). */
export function readPackageJsonForSEO(cwd = process.cwd()): PackageJsonSEOHints {
  const path = join(cwd, "package.json")
  if (!existsSync(path)) {
    throw new Error(`[@better-seo/core/node] package.json not found: ${path}`)
  }
  const p = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>
  return {
    ...(typeof p.name === "string" ? { name: p.name } : {}),
    ...(typeof p.homepage === "string" ? { homepage: p.homepage } : {}),
    ...(typeof p.description === "string" ? { description: p.description } : {}),
  }
}

/** Build **`SEOConfig`** from **`NEXT_PUBLIC_SITE_URL`**, **`SITE_URL`**, **`VERCEL_URL`**, and **package.json** `homepage` / `name`. */
export function inferSEOConfigFromEnvAndPackageJson(cwd = process.cwd()): SEOConfig {
  const pkg = readPackageJsonForSEO(cwd)
  const fromEnv =
    (typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL) ||
    (typeof process.env.SITE_URL === "string" && process.env.SITE_URL) ||
    (typeof process.env.VERCEL_URL === "string" && `https://${process.env.VERCEL_URL}`) ||
    undefined
  let baseUrl = fromEnv
  if (!baseUrl && pkg.homepage?.match(/^https?:\/\//)) {
    try {
      baseUrl = new URL(pkg.homepage).origin
    } catch {
      baseUrl = undefined
    }
  }
  return {
    ...(baseUrl !== undefined ? { baseUrl } : {}),
    ...(pkg.name !== undefined ? { titleTemplate: `%s | ${pkg.name}` } : {}),
  }
}

/** Store merged **`inferSEOConfigFromEnvAndPackageJson`** via **`initSEO`** (⚠️ global — prefer **`createSEOContext`** for SSR). */
export function initSEOFromPackageJson(cwd = process.cwd()): void {
  initSEO(inferSEOConfigFromEnvAndPackageJson(cwd))
}
