import type { Metadata } from "next"
import type { SEO } from "@better-seo/core"

/**
 * Google / Next support comma-separated robots directives; values often use `:` (`max-snippet:20`).
 * When `:` is present, parsing is ambiguous (`unavailable_after` dates, etc.) — pass the string through
 * so Next emits the same rules as `meta name="robots"`.
 */
function robotsHasValueDirectives(robots: string): boolean {
  return robots.includes(":")
}

const SIMPLE_ROBOTS_TOKENS = new Set([
  "all",
  "index",
  "follow",
  "noindex",
  "nofollow",
  "none",
  "noarchive",
  "nosnippet",
  "noimageindex",
  "notranslate",
  "nocache",
  "indexifembedded",
  "nositelinkssearchbox",
])

/**
 * Maps simple comma-separated tokens (no `:`) onto Next `Metadata.robots` object.
 * Unknown tokens fall back to raw string for safety.
 */
function robotsFromSimpleTokenList(robots: string): Metadata["robots"] {
  const tokens = robots
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
  const lower = tokens.map((t) => t.toLowerCase())

  for (const t of lower) {
    if (!SIMPLE_ROBOTS_TOKENS.has(t)) {
      return robots.trim()
    }
  }

  let index = true
  let follow = true
  const out: {
    index?: boolean
    follow?: boolean
    noarchive?: boolean
    nosnippet?: boolean
    noimageindex?: boolean
    notranslate?: boolean
    nocache?: boolean
    indexifembedded?: boolean
    nositelinkssearchbox?: boolean
  } = {}

  for (const t of lower) {
    switch (t) {
      case "noindex":
        index = false
        break
      case "nofollow":
        follow = false
        break
      case "none":
        index = false
        follow = false
        break
      case "noarchive":
        out.noarchive = true
        break
      case "nosnippet":
        out.nosnippet = true
        break
      case "noimageindex":
        out.noimageindex = true
        break
      case "notranslate":
        out.notranslate = true
        break
      case "nocache":
        out.nocache = true
        break
      case "indexifembedded":
        out.indexifembedded = true
        break
      case "nositelinkssearchbox":
        out.nositelinkssearchbox = true
        break
      case "all":
      case "index":
      case "follow":
        break
      default:
        break
    }
  }

  out.index = index
  out.follow = follow
  return out as Metadata["robots"]
}

function metadataRobotsFromSeoString(robots: string): Metadata["robots"] {
  const trimmed = robots.trim()
  if (!trimmed) return undefined

  if (robotsHasValueDirectives(trimmed)) {
    return trimmed
  }

  return robotsFromSimpleTokenList(trimmed)
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
    m.robots = metadataRobotsFromSeoString(seo.meta.robots)
  }

  if (seo.meta.verification) {
    const v = seo.meta.verification
    const ver = omitUndefined({
      google: v.google,
      yahoo: v.yahoo,
      yandex: v.yandex,
      me: v.me,
      ...(v.other && Object.keys(v.other).length > 0 ? { other: { ...v.other } } : {}),
    })
    if (Object.keys(ver).length > 0) {
      m.verification = ver as Metadata["verification"]
    }
  }

  if (seo.meta.pagination) {
    const pg = omitUndefined({
      previous: seo.meta.pagination.previous,
      next: seo.meta.pagination.next,
    })
    if (Object.keys(pg).length > 0) {
      m.pagination = pg as Metadata["pagination"]
    }
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
