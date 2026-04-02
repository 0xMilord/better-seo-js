import type { SEOConfig } from "./types.js"

let globalConfig: SEOConfig | undefined

/**
 * ⚠️ **SECURITY WARNING**: Global state is NOT safe for multi-tenant or serverless environments.
 *
 * This function stores config in module-level global state, which can leak between:
 * - Different users in serverless functions (Vercel, Netlify, Cloudflare Workers)
 * - Concurrent requests in Node.js servers
 * - Different tenants in multi-tenant applications
 *
 * **DO NOT USE** in:
 * - Server-side rendering (SSR) with multiple users
 * - Edge functions or Workers
 * - Multi-tenant SaaS applications
 * - Any environment where config must be isolated per request
 *
 * **SAFE ALTERNATIVE:** Use `createSEOContext()` for request-scoped configuration.
 *
 * @deprecated Use `createSEOContext()` for production applications.
 *             Only suitable for single-user, static sites or development.
 *
 * @param config - Global SEO configuration to store
 *
 * @see {@link createSEOContext} for request-scoped configuration
 * @see {@link internal-docs/ARCHITECTURE.md} §10 for runtime matrix
 * @see {@link internal-docs/USAGE.md} for security best practices
 */
export function initSEO(config: SEOConfig): void {
  // Security warning in development
  if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
    console.warn(
      "[@better-seo/core] ⚠️ initSEO() uses global state and is NOT safe for " +
        "multi-tenant or serverless environments. Use createSEOContext() instead. " +
        "See: https://github.com/OWNER/better-seo-js/blob/main/internal-docs/ARCHITECTURE.md",
    )
  }

  globalConfig = config
}

/**
 * Gets the global SEO config.
 *
 * @deprecated Use `createSEOContext()` for production applications.
 *
 * @returns The global SEO config, or undefined if not initialized
 *
 * @see {@link createSEOContext} for request-scoped configuration
 */
export function getGlobalSEOConfig(): SEOConfig | undefined {
  return globalConfig
}

/**
 * Resets the global SEO config.
 *
 * @internal Used for testing only
 */
export function resetSEOConfigForTests(): void {
  globalConfig = undefined
}
