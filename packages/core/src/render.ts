import type { SEO, SEOConfig, TagDescriptor } from "./types.js"
import { serializeJSONLD } from "./serialize.js"
import { runOnRenderTagPlugins } from "./plugins.js"

/** Meta `name` for verification keys — aligned with Next.js output (see `metadata.generate/basic`). */
function verificationMetaName(key: string): string {
  if (key === "google") return "google-site-verification"
  if (key === "yahoo") return "y_key"
  if (key === "yandex") return "yandex-verification"
  if (key === "me") return "me"
  return key
}

function pushVerificationMeta(
  tags: TagDescriptor[],
  v: NonNullable<SEO["meta"]["verification"]>,
): void {
  const add = (name: string, content: string) => {
    tags.push({ kind: "meta", name, content })
  }
  if (v.google) add(verificationMetaName("google"), v.google)
  if (v.yahoo) add(verificationMetaName("yahoo"), v.yahoo)
  if (v.yandex) add(verificationMetaName("yandex"), v.yandex)
  if (v.me) add(verificationMetaName("me"), v.me)
  if (v.other) {
    for (const [k, val] of Object.entries(v.other)) {
      add(verificationMetaName(k), val)
    }
  }
}

/** Vanilla tag list for snapshots and non-framework hosts (ARCHITECTURE §8). */
export function renderTags(seo: SEO, config?: SEOConfig): TagDescriptor[] {
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
  if (seo.meta.verification) {
    pushVerificationMeta(tags, seo.meta.verification)
  }
  const pag = seo.meta.pagination
  if (pag?.previous) {
    tags.push({ kind: "link", rel: "prev", href: pag.previous })
  }
  if (pag?.next) {
    tags.push({ kind: "link", rel: "next", href: pag.next })
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
  return runOnRenderTagPlugins(tags, seo, config)
}
