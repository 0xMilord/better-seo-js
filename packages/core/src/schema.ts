import type { JSONLD } from "./types.js"

/** WebPage helper — ensures `@context` + `@type`. */
export function webPage(parts: {
  readonly name: string
  readonly description?: string
  readonly url: string
}): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: parts.name,
    ...(parts.description !== undefined ? { description: parts.description } : {}),
    url: parts.url,
  }
}

export function article(parts: {
  readonly headline: string
  readonly description?: string
  readonly datePublished?: string
  readonly url: string
}): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: parts.headline,
    ...(parts.description !== undefined ? { description: parts.description } : {}),
    ...(parts.datePublished !== undefined ? { datePublished: parts.datePublished } : {}),
    url: parts.url,
  }
}

export function organization(parts: {
  readonly name: string
  readonly url?: string
  readonly logo?: string
}): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: parts.name,
    ...(parts.url !== undefined ? { url: parts.url } : {}),
    ...(parts.logo !== undefined ? { logo: parts.logo } : {}),
  }
}

export function person(parts: { readonly name: string; readonly url?: string }): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: parts.name,
    ...(parts.url !== undefined ? { url: parts.url } : {}),
  }
}

export function product(parts: {
  readonly name: string
  readonly description?: string
  readonly sku?: string
  readonly image?: string
  readonly url: string
}): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: parts.name,
    url: parts.url,
    ...(parts.description !== undefined ? { description: parts.description } : {}),
    ...(parts.sku !== undefined ? { sku: parts.sku } : {}),
    ...(parts.image !== undefined ? { image: parts.image } : {}),
  }
}

export function breadcrumbList(parts: {
  readonly items: ReadonlyArray<{ readonly name: string; readonly url: string }>
}): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: parts.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function faqPage(parts: {
  readonly questions: ReadonlyArray<{ readonly question: string; readonly answer: string }>
}): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: parts.questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  }
}

/** Technical / how-to article (docs templates, PRD §2.5). */
export function techArticle(parts: {
  readonly headline: string
  readonly description?: string
  readonly datePublished?: string
  readonly url: string
}): JSONLD {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: parts.headline,
    ...(parts.description !== undefined ? { description: parts.description } : {}),
    ...(parts.datePublished !== undefined ? { datePublished: parts.datePublished } : {}),
    url: parts.url,
  }
}

/** Escape hatch for custom `@type` graphs (caller owns validity). */
export function customSchema(node: JSONLD): JSONLD {
  return node
}
