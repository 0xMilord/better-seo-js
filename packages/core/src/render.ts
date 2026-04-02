import type { SEO, TagDescriptor } from "./types.js"
import { serializeJSONLD } from "./serialize.js"

/** Vanilla tag list for snapshots and non-framework hosts (ARCHITECTURE §8). */
export function renderTags(seo: SEO): TagDescriptor[] {
  const tags: TagDescriptor[] = []
  tags.push({ kind: "meta", name: "title", content: seo.meta.title })
  if (seo.meta.description) {
    tags.push({ kind: "meta", name: "description", content: seo.meta.description })
  }
  if (seo.meta.canonical) {
    tags.push({ kind: "link", rel: "canonical", href: seo.meta.canonical })
  }
  if (seo.meta.robots) {
    tags.push({ kind: "meta", name: "robots", content: seo.meta.robots })
  }
  const langs = seo.meta.alternates?.languages
  if (langs) {
    for (const [hreflang, href] of Object.entries(langs)) {
      tags.push({ kind: "link", rel: "alternate", hreflang, href })
    }
  }
  if (seo.openGraph?.title) {
    tags.push({ kind: "meta", property: "og:title", content: seo.openGraph.title })
  }
  if (seo.openGraph?.description) {
    tags.push({ kind: "meta", property: "og:description", content: seo.openGraph.description })
  }
  if (seo.openGraph?.url) {
    tags.push({ kind: "meta", property: "og:url", content: seo.openGraph.url })
  }
  if (seo.openGraph?.type) {
    tags.push({ kind: "meta", property: "og:type", content: seo.openGraph.type })
  }
  const ogImages = seo.openGraph?.images
  if (ogImages?.length) {
    for (const img of ogImages) {
      if (img?.url) tags.push({ kind: "meta", property: "og:image", content: img.url })
      if (img?.width !== undefined) {
        tags.push({ kind: "meta", property: "og:image:width", content: String(img.width) })
      }
      if (img?.height !== undefined) {
        tags.push({ kind: "meta", property: "og:image:height", content: String(img.height) })
      }
      if (img?.alt) tags.push({ kind: "meta", property: "og:image:alt", content: img.alt })
    }
  }
  if (seo.twitter?.card) {
    tags.push({ kind: "meta", name: "twitter:card", content: seo.twitter.card })
  }
  if (seo.twitter?.title) {
    tags.push({ kind: "meta", name: "twitter:title", content: seo.twitter.title })
  }
  if (seo.twitter?.description) {
    tags.push({ kind: "meta", name: "twitter:description", content: seo.twitter.description })
  }
  if (seo.twitter?.image) {
    tags.push({ kind: "meta", name: "twitter:image", content: seo.twitter.image })
  }
  for (const node of seo.schema) {
    tags.push({ kind: "script-jsonld", json: serializeJSONLD(node) })
  }
  return tags
}
