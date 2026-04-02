import { SEOError } from "./errors.js"
import type { SEOImage, SEOInput } from "./types.js"

function isObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v)
}

function pickStr(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined
}

function mapOgImages(raw: unknown): readonly SEOImage[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const out: SEOImage[] = []
  for (const item of raw) {
    if (typeof item === "string") {
      out.push({ url: item })
      continue
    }
    if (!isObj(item)) continue
    const url = pickStr(item.url)
    if (!url) continue
    out.push({
      url,
      ...(typeof item.width === "number" ? { width: item.width } : {}),
      ...(typeof item.height === "number" ? { height: item.height } : {}),
      ...(pickStr(item.alt) !== undefined ? { alt: pickStr(item.alt) } : {}),
    })
  }
  return out.length > 0 ? out : undefined
}

/**
 * Map next-seo **`DefaultSeo`** / **`NextSeo`**-style props → {@link SEOInput}.
 * Covers common `title`, `description`, `canonical`, `openGraph`, `twitter`, `noindex`, `nofollow`.
 * Use `createSEO(fromNextSeo(props), config)` — `titleTemplate` from next-seo is not applied; set `SEOConfig.titleTemplate` yourself.
 */
export function fromNextSeo(nextSeoExport: unknown): SEOInput {
  if (!isObj(nextSeoExport)) {
    throw new SEOError("VALIDATION", "fromNextSeo expects a plain object (e.g. next-seo props).")
  }
  const o = nextSeoExport
  const og = isObj(o.openGraph) ? o.openGraph : undefined
  const tw = isObj(o.twitter) ? o.twitter : undefined

  const title =
    pickStr(o.title) ??
    pickStr(o.defaultTitle) ??
    (og ? pickStr(og.title) : undefined) ??
    (tw ? pickStr(tw.title) : undefined)

  const description =
    pickStr(o.description) ??
    (og ? pickStr(og.description) : undefined) ??
    (tw ? pickStr(tw.description) : undefined)

  if (!title) {
    throw new SEOError(
      "VALIDATION",
      "fromNextSeo could not infer a title. Set title, defaultTitle, or openGraph.title.",
    )
  }

  const canonical = pickStr(o.canonical) ?? (og ? pickStr(og.url) : undefined)

  const noindex = o.noindex === true
  const nofollow = o.nofollow === true
  const robots =
    noindex || nofollow
      ? `${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}`
      : undefined

  let openGraph: SEOInput["openGraph"]
  if (og) {
    const images = mapOgImages(og.images)
    openGraph = {
      ...(pickStr(og.title) !== undefined ? { title: pickStr(og.title) } : {}),
      ...(pickStr(og.description) !== undefined ? { description: pickStr(og.description) } : {}),
      ...(pickStr(og.url) !== undefined ? { url: pickStr(og.url) } : {}),
      ...(pickStr(og.type) !== undefined ? { type: pickStr(og.type) } : {}),
      ...(images !== undefined ? { images } : {}),
    }
    if (Object.keys(openGraph).length === 0) openGraph = undefined
  }

  let twitter: SEOInput["twitter"]
  if (tw) {
    const cardRaw = pickStr(tw.card)
    const card = cardRaw === "summary" || cardRaw === "summary_large_image" ? cardRaw : undefined
    const twImage = pickStr(tw.image) ?? pickStr((tw as { imageSrc?: unknown }).imageSrc)
    twitter = {
      ...(card !== undefined ? { card } : {}),
      ...(pickStr(tw.title) !== undefined ? { title: pickStr(tw.title) } : {}),
      ...(pickStr(tw.description) !== undefined ? { description: pickStr(tw.description) } : {}),
      ...(twImage !== undefined ? { image: twImage } : {}),
    }
    if (Object.keys(twitter).length === 0) twitter = undefined
  }

  return {
    title,
    ...(description !== undefined ? { description } : {}),
    ...(canonical !== undefined ? { canonical } : {}),
    ...(robots !== undefined ? { robots } : {}),
    ...(openGraph !== undefined ? { openGraph } : {}),
    ...(twitter !== undefined ? { twitter } : {}),
  }
}
