/** Stable codes for programmatic handling (enterprise / observability). */
export type SEOErrorCode =
  | "VALIDATION"
  | "ADAPTER_NOT_FOUND"
  | "MIGRATE_NOT_IMPLEMENTED"
  | "USE_SEO_NOT_AVAILABLE"

const messages: Record<SEOErrorCode, string> = {
  VALIDATION: "Invalid or incomplete SEO input.",
  ADAPTER_NOT_FOUND:
    "No adapter registered for this framework. Import the adapter package (e.g. @better-seo/next) before calling seoForFramework.",
  MIGRATE_NOT_IMPLEMENTED:
    "Migration helpers are not implemented yet. Track Roadmap Wave 12 / FEATURES C15.",
  USE_SEO_NOT_AVAILABLE:
    "useSEO is provided by @better-seo/react (Roadmap Wave 5 / FEATURES V3). App Router metadata should use seo() / prepareNextSeo from @better-seo/next.",
}

export class SEOError extends Error {
  readonly code: SEOErrorCode
  override readonly cause?: unknown

  constructor(code: SEOErrorCode, message?: string, options?: { cause?: unknown }) {
    const base = message ?? messages[code]
    super(`[@better-seo/core] [${code}]: ${base}`)
    this.name = "SEOError"
    this.code = code
    this.cause = options?.cause
  }
}

export function isSEOError(e: unknown): e is SEOError {
  return e instanceof SEOError
}
