import type { Metadata } from "next"
import type { SEO } from "@better-seo/core"

function robotsFromString(robots: string): Metadata["robots"] {
  const lower = robots.toLowerCase()
  const noindex = lower.includes("noindex")
  const nofollow = lower.includes("nofollow")
  if (!noindex && !nofollow) {
    return { index: true, follow: true }
  }
  return {
    index: !noindex,
    follow: !nofollow,
  }
}

function omitUndefined<T extends Record<string, unknown>>(o: T): Partial<T> {
  return Object.fromEntries(
    (Object.entries(o) as [string, unknown][]).filter(([, v]) => v !== undefined),
  ) as Partial<T>
}

/** Map normalized `SEO` → Next.js `Metadata` (App Router). JSON-LD is not included — use `@better-seo/next/json-ld`. */
export function toNextMetadata(seo: SEO): Metadata {
  const m: Metadata = {
    title: seo.meta.title,
  }
  if (seo.meta.description !== undefined) {
    m.description = seo.meta.description
  }
  const langs = seo.meta.alternates?.languages
  const hasLang = langs !== undefined && Object.keys(langs).length > 0
  if (seo.meta.canonical || hasLang) {
    const alt: NonNullable<Metadata["alternates"]> = {}
    if (seo.meta.canonical) alt.canonical = seo.meta.canonical
    if (hasLang && langs) alt.languages = { ...langs }
    m.alternates = alt
  }
  if (seo.meta.robots) {
    m.robots = robotsFromString(seo.meta.robots)
  }

  if (seo.openGraph) {
    const og = omitUndefined({
      title: seo.openGraph.title,
      description: seo.openGraph.description,
      url: seo.openGraph.url,
      type: seo.openGraph.type,
      images: seo.openGraph.images?.map((img) =>
        omitUndefined({
          url: img.url,
          width: img.width,
          height: img.height,
          alt: img.alt,
        }),
      ),
    })
    if (Object.keys(og).length > 0) {
      m.openGraph = og as Metadata["openGraph"]
    }
  }

  if (seo.twitter) {
    const tw = omitUndefined({
      card: seo.twitter.card,
      title: seo.twitter.title,
      description: seo.twitter.description,
      images: seo.twitter.image ? [seo.twitter.image] : undefined,
    })
    if (Object.keys(tw).length > 0) {
      m.twitter = tw as Metadata["twitter"]
    }
  }

  return m
}
