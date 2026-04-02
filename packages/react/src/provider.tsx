import type { SEO } from "@better-seo/core"
import { SEOError } from "@better-seo/core"
import { createContext, useContext, type ReactNode } from "react"

const SEOReactContext = createContext<SEO | null>(null)

/** Request- or route-scoped SEO for client trees (FEATURES N8-style isolation in React apps). */
export function SEOProvider({
  seo,
  children,
}: {
  readonly seo: SEO
  readonly children: ReactNode
}) {
  return <SEOReactContext.Provider value={seo}>{children}</SEOReactContext.Provider>
}

/**
 * Current `SEO` from the nearest {@link SEOProvider}.
 * @throws {SEOError} USE_SEO_NO_PROVIDER when used outside a provider
 */
export function useSEO(): SEO {
  const v = useContext(SEOReactContext)
  if (v === null) {
    throw new SEOError("USE_SEO_NO_PROVIDER")
  }
  return v
}
