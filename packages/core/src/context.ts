import { createSEO, mergeSEO } from "./core.js"
import { createSEOForRoute } from "./rules.js"
import type { SEO, SEOConfig, SEOInput } from "./types.js"

export interface SEOContext {
  readonly config: SEOConfig
  /** Request-scoped `createSEO` with bound config + plugins. */
  readonly createSEO: (input: SEOInput) => SEO
  /** Merges `config.rules` for `route`, then `createSEO` (N9 / Wave 6). */
  readonly createSEOForRoute: (route: string, input: SEOInput) => SEO
  readonly mergeSEO: (parent: SEO, child: SEOInput) => SEO
}

/**
 * Preferred production pattern for multi-tenant / Edge — explicit config, no filesystem inference (ARCHITECTURE §13).
 */
export function createSEOContext(config: SEOConfig): SEOContext {
  const rules = config.rules ?? []
  return {
    config,
    createSEO: (input: SEOInput) => createSEO(input, config),
    createSEOForRoute: (route: string, input: SEOInput) =>
      createSEOForRoute(route, input, rules, config),
    mergeSEO: (parent: SEO, child: SEOInput) => mergeSEO(parent, child, config),
  }
}
