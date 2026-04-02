/** Default Open Graph image size (platform baseline). */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const

export type OGTheme = "light" | "dark" | "auto"

export interface OGColors {
  readonly primary: string
  readonly background: string
}

/**
 * Configuration for {@link generateOG}.
 * Aligns with PRD §3.7 baseline; optional fields extend over time.
 */
export interface OGConfig {
  readonly title: string
  readonly description?: string
  readonly siteName: string
  readonly logo?: string
  readonly theme?: OGTheme
  /**
   * Absolute or cwd-relative path to a **compiled** ESM `.js` / `.mjs` module that default-exports
   * a React function component — same props shape as the built-in card (see **`OgCardProps`** on **`@better-seo/assets`**).
   */
  readonly template?: string
  /** Optional typeface hint; Wave 2 always embeds Inter from `@fontsource/inter`. */
  readonly font?: string
  readonly colors?: OGColors
}
