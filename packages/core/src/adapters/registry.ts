import type { SEOAdapter } from "../types.js"
import { SEOError } from "../errors.js"

const adapters = new Map<string, SEOAdapter<unknown>>()

/**
 * Validates adapter ID to prevent namespace collisions and malicious overrides.
 *
 * @param id - The adapter ID to validate
 * @throws {SEOError} If adapter ID is invalid
 */
function validateAdapterId(id: string): void {
  if (!id || typeof id !== "string") {
    throw new SEOError("VALIDATION", "Adapter ID must be a non-empty string")
  }

  // Prevent extremely long IDs (DoS prevention)
  if (id.length > 64) {
    throw new SEOError("VALIDATION", `Adapter ID too long: ${id.length} chars (max 64)`)
  }

  // Only allow alphanumeric, dash, underscore (prevents path traversal, etc.)
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new SEOError("VALIDATION", `Adapter ID contains invalid characters: ${id}`)
  }

  // Warn on overriding existing adapter (supply chain attack detection)
  if (adapters.has(id)) {
    console.warn(
      `[@better-seo/core] Overriding existing adapter: "${id}". ` +
        "This may indicate a dependency conflict or malicious package.",
    )
  }
}

/**
 * Register an adapter implementation.
 *
 * ⚠️ **SECURITY**: Only register adapters from trusted sources.
 * Malicious adapters can intercept and modify SEO data.
 *
 * @param adapter - The adapter to register
 * @throws {SEOError} If adapter ID is invalid or adapter is not an object
 *
 * @example
 * ```ts
 * import { registerAdapter } from '@better-seo/core'
 *
 * registerAdapter({
 *   id: 'my-framework',
 *   toFramework: (seo) => { /* conversion logic *\/ }
 * })
 * ```
 */
export function registerAdapter<T>(adapter: SEOAdapter<T>): void {
  if (!adapter || typeof adapter !== "object") {
    throw new SEOError("VALIDATION", "Adapter must be an object")
  }

  validateAdapterId(adapter.id)
  adapters.set(adapter.id, adapter)
}

export function getAdapter<T = unknown>(id: string): SEOAdapter<T> | undefined {
  return adapters.get(id) as SEOAdapter<T> | undefined
}

export function listAdapterIds(): string[] {
  return [...adapters.keys()]
}
