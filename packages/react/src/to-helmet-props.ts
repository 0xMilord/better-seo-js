import { renderTags } from "@better-seo/core"
import type { SEO, TagDescriptor } from "@better-seo/core"

/**
 * Subset of react-helmet-async `Helmet` props produced from `SEO`.
 * Keeps parity with {@link renderTags} — always map through that pipeline.
 */
/** Props compatible with react-helmet-async `<Helmet />` (mutable arrays for Helmet typings). */
export type HelmetSEOProps = {
  title?: string
  meta?: Array<{ name?: string; property?: string; content: string }>
  link?: Array<{ rel: string; href: string; hreflang?: string }>
  script?: Array<{ type: string; innerHTML: string }>
}

function fromDescriptors(tags: readonly TagDescriptor[]): HelmetSEOProps {
  let title: string | undefined
  const meta: Array<{ name?: string; property?: string; content: string }> = []
  const link: Array<{ rel: string; href: string; hreflang?: string }> = []
  const script: Array<{ type: string; innerHTML: string }> = []

  for (const t of tags) {
    if (t.kind === "meta") {
      if (t.name === "title") {
        title = t.content
        continue
      }
      meta.push({ name: t.name, property: t.property, content: t.content })
      continue
    }
    if (t.kind === "link") {
      link.push({ rel: t.rel, href: t.href, hreflang: t.hreflang })
      continue
    }
    script.push({ type: "application/ld+json", innerHTML: t.json })
  }

  const out: HelmetSEOProps = {}
  if (title !== undefined) out.title = title
  if (meta.length > 0) out.meta = meta
  if (link.length > 0) out.link = link
  if (script.length > 0) out.script = script
  return out
}

/** Map canonical `SEO` → props for `<Helmet {...props} />` (react-helmet-async). */
export function toHelmetProps(seo: SEO): HelmetSEOProps {
  return fromDescriptors(renderTags(seo))
}
