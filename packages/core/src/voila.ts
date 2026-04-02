import { createSEO } from "./core.js"
import { getAdapter } from "./adapters/registry.js"
import { SEOError } from "./errors.js"
import { createSEOForRoute } from "./rules.js"
import type { SEO, SEOConfig, SEOInput } from "./types.js"

/**
 * Resolve via registered adapter — prefer `@better-seo/next`’s `seo()` for the Next voilà path.
 * @throws {SEOError} ADAPTER_NOT_FOUND when the adapter id was never registered
 */
export function seoForFramework<T>(adapterId: string, input: SEOInput, config?: SEOConfig): T {
  const adapter = getAdapter(adapterId)
  if (!adapter) {
    throw new SEOError(
      "ADAPTER_NOT_FOUND",
      `no adapter "${adapterId}" registered (import your framework package, e.g. @better-seo/next).`,
    )
  }
  const doc = createSEO(input, config)
  return adapter.toFramework(doc) as T
}

/**
 * Stub until `@better-seo/react` (Wave 5 / V3). Calling this makes missing peer support obvious in dev.
 * @throws {SEOError} USE_SEO_NOT_AVAILABLE
 */
export function useSEO(): never {
  throw new SEOError("USE_SEO_NOT_AVAILABLE")
}

/**
 * V5 — explicit pathname for rules: merges {@link SEOConfig.rules} (via `applyRules`) then {@link createSEO}.
 * Prefer this over “magic” route detection at runtime (FEATURES **V6** — document limits; no stable `seo.auto` in core).
 */
export function seoRoute(route: string, input: SEOInput, config?: SEOConfig): SEO {
  return createSEOForRoute(route, input, config?.rules ?? [], config)
}
