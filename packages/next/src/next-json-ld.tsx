import { serializeJSONLD } from "better-seo.js"
import type { SEO } from "better-seo.js"

/** Renders JSON-LD using core `serializeJSONLD` only (FEATURES N4, ARCHITECTURE §7). */
export function NextJsonLd(props: { readonly seo: SEO }): React.JSX.Element | null {
  const { seo } = props
  if (!seo.schema.length) return null
  const [first] = seo.schema
  if (!first) return null
  const payload = seo.schema.length === 1 ? first : [...seo.schema]
  const json = serializeJSONLD(payload)
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
