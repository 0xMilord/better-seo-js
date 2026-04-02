import { createSEO, type SEO, type SEOConfig, type SEOInput } from "@better-seo/core"
import { toHelmetProps } from "./to-helmet-props.js"

/** One call → Helmet props + full `SEO` (e.g. tie JSON-LD scripts to the same document). */
export function prepareReactSeo(
  input: SEOInput,
  config?: SEOConfig,
): { readonly helmet: ReturnType<typeof toHelmetProps>; readonly seo: SEO } {
  const seo = createSEO(input, config)
  return { helmet: toHelmetProps(seo), seo }
}

/** Voilà-style shortcut: `SEOInput` → Helmet props only. */
export function helmetFromInput(
  input: SEOInput,
  config?: SEOConfig,
): ReturnType<typeof toHelmetProps> {
  return toHelmetProps(createSEO(input, config))
}
