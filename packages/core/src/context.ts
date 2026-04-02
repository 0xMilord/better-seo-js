import { createSEO, mergeSEO } from "./core.js"
import type { SEO, SEOConfig, SEOInput } from "./types.js"

export interface SEOContext {
  readonly config: SEOConfig
  /** Request-scoped `createSEO` with bound config + plugins. */
  readonly createSEO: (input: SEOInput) => SEO
  readonly mergeSEO: (parent: SEO, child: SEOInput) => SEO
}

/**
 * Preferred production pattern for multi-tenant / Edge — explicit config, no filesystem inference (ARCHITECTURE §13).
 */
export function createSEOContext(config: SEOConfig): SEOContext {
  return {
    config,
    createSEO: (input: SEOInput) => createSEO(input, config),
    mergeSEO: (parent: SEO, child: SEOInput) => mergeSEO(parent, child, config),
  }
}
