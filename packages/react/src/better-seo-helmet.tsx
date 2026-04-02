import type { SEO, SEOConfig } from "@better-seo/core"
import { Helmet } from "react-helmet-async"
import { toHelmetProps } from "./to-helmet-props.js"

/** Renders document head tags for a merged `SEO` via react-helmet-async. */
export function BetterSEOHelmet({
  seo,
  config,
}: {
  readonly seo: SEO
  readonly config?: SEOConfig
}) {
  const props = toHelmetProps(seo, config)
  return <Helmet {...props} />
}
