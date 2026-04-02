import type { Metadata } from "next"
import {
  createSEO,
  createSEOForRoute,
  mergeSEO,
  type SEO,
  type SEOConfig,
  type SEOInput,
  withSEO as withSeoCore,
} from "@better-seo/core"
import { toNextMetadata } from "./to-next-metadata.js"

/** Voilà: `export const metadata = seo({ title: "..." })` (FEATURES N1). */
export function seo(input: SEOInput, config?: SEOConfig): Metadata {
  return toNextMetadata(createSEO(input, config))
}

/**
 * Layer child metadata on a parent `SEO` document (layout → page), then emit Next `Metadata`.
 */
export function withSEO(parent: SEO, child: SEOInput, config?: SEOConfig): Metadata {
  return toNextMetadata(withSeoCore(parent, child, config))
}

/** Explicit merge without `withSEO` naming (FEATURES N2). */
export function mergeNextMetadataSource(
  parent: SEO,
  child: SEOInput,
  config?: SEOConfig,
): Metadata {
  return toNextMetadata(mergeSEO(parent, child, config))
}

/** One call → Next metadata + full `SEO` (for `NextJsonLd` in the same route). */
export function prepareNextSeo(
  input: SEOInput,
  config?: SEOConfig,
): { readonly metadata: Metadata; readonly seo: SEO } {
  const doc = createSEO(input, config)
  return { metadata: toNextMetadata(doc), seo: doc }
}

/** V5 — Next `Metadata` with {@link SEOConfig.rules} applied for an explicit pathname (N9). */
export function seoRoute(route: string, input: SEOInput, config?: SEOConfig): Metadata {
  const rules = config?.rules ?? []
  return toNextMetadata(createSEOForRoute(route, input, rules, config))
}

/** Like {@link prepareNextSeo}, but merges route rules from `config.rules` first. */
export function prepareNextSeoForRoute(
  route: string,
  input: SEOInput,
  config?: SEOConfig,
): { readonly metadata: Metadata; readonly seo: SEO } {
  const rules = config?.rules ?? []
  const seo = createSEOForRoute(route, input, rules, config)
  return { metadata: toNextMetadata(seo), seo }
}

/** V4 — layout defaults as canonical parent `SEO` (alias of `createSEO` for voilà naming). */
export function seoLayout(input: SEOInput, config?: SEOConfig): SEO {
  return createSEO(input, config)
}

/** V4 — page `Metadata` layered on layout `SEO` (same as {@link withSEO}). */
export function seoPage(parent: SEO, input: SEOInput, config?: SEOConfig): Metadata {
  return withSEO(parent, input, config)
}
