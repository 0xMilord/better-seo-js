import type { Metadata } from "next"
import {
  createSEO,
  mergeSEO,
  type SEO,
  type SEOConfig,
  type SEOInput,
  withSEO as withSeoCore,
} from "better-seo.js"
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
