import type { SEO } from "./types.js"

export type ValidationSeverity = "warning" | "error"

/** Stable machine-readable codes (PRD §3.5 / observability). */
export type ValidationIssueCode =
  | "TITLE_EMPTY"
  | "TITLE_TOO_LONG"
  | "DESCRIPTION_MISSING"
  | "DESCRIPTION_REQUIRED"
  | "DESCRIPTION_TOO_LONG"
  | "OG_IMAGE_NARROW"
  | "ARTICLE_PUBLISHED_TIME_RECOMMENDED"
  | "SCHEMA_MISSING_TYPE"

export interface ValidationIssue {
  readonly code: ValidationIssueCode
  readonly field: string
  readonly message: string
  readonly severity: ValidationSeverity
}

export interface ValidateSEOOptions {
  /** When false, validation is a no-op (production / Edge bundles). */
  readonly enabled?: boolean
  /** When true, missing description is `error` instead of `warning`. */
  readonly requireDescription?: boolean
  /** In non-production only: when not false, log each issue to console.warn (default: true). */
  readonly log?: boolean
  readonly titleMaxLength?: number
  readonly descriptionMaxLength?: number
}

function shouldRun(options?: ValidateSEOOptions): boolean {
  if (options?.enabled === false) return false

  // Safe environment check - handles Edge, browser, and bundler polyfills
  const isProduction =
    typeof process !== "undefined" &&
    typeof process.env === "object" &&
    process.env !== null &&
    process.env.NODE_ENV === "production"

  if (isProduction) return false
  return true
}

/**
 * Development-oriented checks — no heavy deps (ARCHITECTURE §12).
 * Returns structured issues; set `log: false` to consume programmatically without console noise.
 */
export function validateSEO(seo: SEO, options?: ValidateSEOOptions): readonly ValidationIssue[] {
  if (!shouldRun(options)) return []

  const titleMax = options?.titleMaxLength ?? 60
  const descMax = options?.descriptionMaxLength ?? 165
  const log = options?.log !== false
  const requireDesc = options?.requireDescription === true
  const issues: ValidationIssue[] = []

  if (!seo.meta.title?.trim()) {
    issues.push({
      code: "TITLE_EMPTY",
      field: "meta.title",
      message: "empty title",
      severity: "error",
    })
  } else if (seo.meta.title.length > titleMax) {
    issues.push({
      code: "TITLE_TOO_LONG",
      field: "meta.title",
      message: `length ${seo.meta.title.length} exceeds recommended ${titleMax}`,
      severity: "warning",
    })
  }

  if (!seo.meta.description?.trim()) {
    issues.push({
      code: requireDesc ? "DESCRIPTION_REQUIRED" : "DESCRIPTION_MISSING",
      field: "meta.description",
      message: requireDesc ? "description is required" : "missing description",
      severity: requireDesc ? "error" : "warning",
    })
  } else if (seo.meta.description.length > descMax) {
    issues.push({
      code: "DESCRIPTION_TOO_LONG",
      field: "meta.description",
      message: `length ${seo.meta.description.length} exceeds recommended ${descMax}`,
      severity: "warning",
    })
  }

  const firstOg = seo.openGraph?.images?.[0]
  if (firstOg?.width !== undefined && firstOg.width < 1200) {
    issues.push({
      code: "OG_IMAGE_NARROW",
      field: "openGraph.images[0].width",
      message: "OG image width under 1200px",
      severity: "warning",
    })
  }

  const ogType = seo.openGraph?.type
  if (
    ogType === "article" &&
    !(seo.openGraph?.publishedTime && String(seo.openGraph.publishedTime).trim())
  ) {
    issues.push({
      code: "ARTICLE_PUBLISHED_TIME_RECOMMENDED",
      field: "openGraph.publishedTime",
      message: "openGraph.type is article; set publishedTime (ISO-8601) for richer crawlers",
      severity: "warning",
    })
  }

  for (let i = 0; i < seo.schema.length; i++) {
    const node = seo.schema[i]
    if (!node?.["@type"]) {
      issues.push({
        code: "SCHEMA_MISSING_TYPE",
        field: `schema[${i}]`,
        message: "missing @type",
        severity: "error",
      })
    }
  }

  if (log) {
    for (const i of issues) {
      console.warn(
        `[@better-seo/core] validateSEO [${i.severity}] ${i.code} ${i.field}: ${i.message}`,
      )
    }
  }

  return issues
}
