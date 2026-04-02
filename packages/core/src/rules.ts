import { createSEO, mergeSEO } from "./core.js"
import type { SEO, SEOConfig, SEOInput, SEORule } from "./types.js"

/** Normalize path for comparison (leading slash, collapse slashes, trim trailing except root). */
export function normalizeRoutePath(path: string): string {
  if (!path || path === "/") return "/"
  const t = path.startsWith("/") ? path : `/${path}`
  const c = t.replace(/\/+/g, "/")
  return c.endsWith("/") && c.length > 1 ? c.slice(0, -1) : c
}

function pathSegments(path: string): string[] {
  const n = normalizeRoutePath(path)
  if (n === "/") return []
  return n.slice(1).split("/")
}

function matchSegment(pat: string, seg: string): boolean {
  if (pat === "*") return true
  if (pat.endsWith("*") && pat.length > 1) {
    return seg.startsWith(pat.slice(0, -1))
  }
  return pat === seg
}

/** Segment glob: multi-segment and single-segment wildcards (see rules.test.ts). */
export function matchRouteGlob(pattern: string, route: string): boolean {
  const ps = pathSegments(pattern)
  const rs = pathSegments(route)
  const dfs = (pi: number, ri: number): boolean => {
    if (pi === ps.length) return ri === rs.length
    if (ps[pi] === "**") {
      if (dfs(pi + 1, ri)) return true
      if (ri < rs.length && dfs(pi, ri + 1)) return true
      return false
    }
    if (ri === rs.length) return false
    if (!matchSegment(ps[pi]!, rs[ri]!)) return false
    return dfs(pi + 1, ri + 1)
  }
  return dfs(0, 0)
}

function matchRouteLegacyStar(pattern: string, route: string): boolean {
  const prefix = pattern.slice(0, -1)
  const r = normalizeRoutePath(route)
  const p = normalizeRoutePath(prefix)
  if (r === p) return true
  return r.startsWith(prefix) || r.startsWith(`${p}/`)
}

/** One `*` per path segment (not `**`). */
function matchSingleSegmentStars(pattern: string, route: string): boolean {
  const ps = pathSegments(pattern)
  const rs = pathSegments(route)
  if (ps.length !== rs.length) return false
  for (let i = 0; i < ps.length; i++) {
    if (!matchSegment(ps[i]!, rs[i]!)) return false
  }
  return true
}

export function matchRoute(pattern: string, route: string): boolean {
  if (pattern === "*") return true
  const r = route || "/"
  if (pattern.includes("**")) {
    return matchRouteGlob(pattern, r)
  }
  /** Trailing `*` only → legacy full-path prefix (`/blog/*`, `/api*`). */
  if (pattern.endsWith("*") && pattern.indexOf("*") === pattern.length - 1) {
    return matchRouteLegacyStar(pattern, r)
  }
  if (pattern.includes("*")) {
    return matchSingleSegmentStars(pattern, r)
  }
  return normalizeRoutePath(r) === normalizeRoutePath(pattern)
}

/**
 * Pure rule matcher — `**` segment globs + legacy `prefix*` path match (ARCHITECTURE §11 subset).
 */
export function applyRules(route: string, rules: readonly SEORule[]): Partial<SEOInput> {
  /** Lower priority merged first; higher `priority` wins on duplicate keys (ARCHITECTURE §11). */
  const sorted = [...rules].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
  let acc: Partial<SEOInput> = {}
  for (const rule of sorted) {
    if (matchRoute(rule.match, route)) {
      acc = { ...acc, ...rule.seo }
    }
  }
  return acc
}

/** Merge rule output into a base document (helper for adapters). */
export function applyRulesToSEO(
  route: string,
  base: SEO,
  rules: readonly SEORule[],
  config?: SEOConfig,
): SEO {
  const partial = applyRules(route, rules)
  if (Object.keys(partial).length === 0) return base
  return mergeSEO(base, partial, config)
}

/** Convenience: rules → `createSEO`. */
export function createSEOForRoute(
  route: string,
  input: SEOInput,
  rules: readonly SEORule[],
  config?: SEOConfig,
): SEO {
  const mergedInput: SEOInput = { ...applyRules(route, rules), ...input }
  return createSEO(mergedInput, config)
}
