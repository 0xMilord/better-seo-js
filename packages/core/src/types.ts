/** Strict JSON-LD values (no `any` on public surface). */
export type JSONLDValue =
  | string
  | number
  | boolean
  | null
  | JSONLDValue[]
  | { readonly [k: string]: JSONLDValue }

/**
 * JSON-LD node. Helpers must ensure `@context` and `@type` before serialization when required by consumers.
 */
export type JSONLD = {
  readonly "@context"?: string | Record<string, unknown>
  readonly "@type": string
  readonly "@id"?: string
} & { readonly [k: string]: JSONLDValue | Record<string, unknown> | undefined }

export interface SEOPlugin {
  readonly id: string
  readonly beforeMerge?: (draft: SEOInput, ctx: { readonly config?: SEOConfig }) => SEOInput
  readonly afterMerge?: (seo: SEO, ctx: { readonly config?: SEOConfig }) => SEO
}

export interface SEOConfig {
  readonly titleTemplate?: string
  readonly baseUrl?: string
  readonly defaultRobots?: string
  readonly schemaMerge?: "concat" | { readonly dedupeByIdAndType?: boolean }
  readonly features?: Partial<{
    readonly jsonLd: boolean
    readonly openGraphMerge: boolean
  }>
  /** Hooks run in order; prefer `createSEOContext` for request-scoped registration (future hardening). */
  readonly plugins?: readonly SEOPlugin[]
}

/** hreflang → absolute or path URL (adapter maps to framework expectations). */
export interface SEOAlternates {
  readonly languages?: Readonly<Record<string, string>>
}

export interface SEOMeta {
  readonly title: string
  readonly description?: string
  readonly canonical?: string
  readonly robots?: string
  readonly alternates?: SEOAlternates
}

export interface SEOImage {
  readonly url: string
  readonly width?: number
  readonly height?: number
  readonly alt?: string
}

export interface SEO {
  readonly meta: SEOMeta
  readonly openGraph?: {
    readonly title?: string
    readonly description?: string
    readonly url?: string
    readonly type?: string
    readonly images?: readonly SEOImage[]
  }
  readonly twitter?: {
    readonly card?: "summary" | "summary_large_image"
    readonly title?: string
    readonly description?: string
    readonly image?: string
  }
  readonly schema: readonly JSONLD[]
}

export type SEOAdapter<TOutput = unknown> = {
  readonly id: string
  toFramework(seo: SEO): TOutput
}

/** Loosely-accepted shape for `createSEO` / voilà entrypoints. */
export type SEOInput = Omit<Partial<SEO>, "meta" | "schema" | "openGraph" | "twitter"> & {
  readonly meta?: Partial<SEOMeta>
  readonly title?: string
  readonly description?: string
  readonly canonical?: string
  readonly robots?: string
  readonly openGraph?: SEO["openGraph"]
  readonly twitter?: SEO["twitter"]
  readonly schema?: readonly JSONLD[]
}

/** Rule output merges into `Partial<SEOInput>` before `createSEO`. */
export interface SEORule {
  readonly match: string
  readonly priority?: number
  readonly seo: Partial<SEOInput>
}

export type TagDescriptor =
  | {
      readonly kind: "meta"
      readonly name?: string
      readonly property?: string
      readonly content: string
    }
  | {
      readonly kind: "link"
      readonly rel: string
      readonly href: string
      readonly hreflang?: string
    }
  | { readonly kind: "script-jsonld"; readonly json: string }
