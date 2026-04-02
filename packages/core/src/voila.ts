import { createSEO } from "./core.js"
import { getAdapter } from "./adapters/registry.js"
import { SEOError } from "./errors.js"
import type { SEOConfig, SEOInput } from "./types.js"

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
