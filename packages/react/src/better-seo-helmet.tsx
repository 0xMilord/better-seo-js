import type { SEO } from "@better-seo/core"
import { Helmet } from "react-helmet-async"
import { toHelmetProps } from "./to-helmet-props.js"

/** Renders document head tags for a merged `SEO` via react-helmet-async. */
export function BetterSEOHelmet({ seo }: { readonly seo: SEO }) {
  const props = toHelmetProps(seo)
  return <Helmet {...props} />
}
