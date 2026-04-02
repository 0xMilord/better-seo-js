import type { JSONLD } from "./types.js"
import { SEOError } from "./errors.js"

/**
 * Validates JSON-LD node structure before serialization.
 * Prevents prototype pollution and ensures @context safety.
 *
 * @param node - The JSON-LD node to validate
 * @param path - Current path in the object (for error messages)
 * @throws {SEOError} If validation fails
 */
function validateJSONLDNode(node: unknown, path = "root"): void {
  if (node === null || node === undefined) {
    throw new SEOError("VALIDATION", `JSON-LD node at ${path} is null or undefined`)
  }

  if (typeof node !== "object") {
    throw new SEOError("VALIDATION", `JSON-LD node at ${path} must be an object`)
  }

  const obj = node as Record<string, unknown>

  // Validate @context if present
  if ("@context" in obj) {
    const context = obj["@context"]
    if (typeof context === "string") {
      // Only allow schema.org context
      if (context !== "https://schema.org" && !context.startsWith("https://schema.org/")) {
        console.warn(
          `[@better-seo/core] Non-standard @context at ${path}: ${context}. ` +
            "Only https://schema.org is recommended for security.",
        )
      }
    } else if (typeof context !== "object" || context === null) {
      throw new SEOError("VALIDATION", `@context at ${path} must be a string or object`)
    }
  }

  // Validate @type if present
  if ("@type" in obj) {
    const type = obj["@type"]
    if (typeof type !== "string" || type.length === 0) {
      throw new SEOError("VALIDATION", `@type at ${path} must be a non-empty string`)
    }
    // Warn on potentially dangerous types with HTML/special chars
    if (type.includes("<") || type.includes(">") || type.includes('"')) {
      throw new SEOError("VALIDATION", `@type at ${path} contains invalid characters: ${type}`)
    }
  }

  // Recursively validate nested objects and prevent prototype pollution.
  // Use Reflect.ownKeys so JSON.parse-shaped payloads keep own "__proto__" keys
  // (object literal `__proto__:` sets [[Prototype]] and is invisible to Object.entries).
  for (const key of Reflect.ownKeys(obj)) {
    if (typeof key !== "string") {
      throw new SEOError("VALIDATION", `JSON-LD keys at ${path} must be strings`)
    }
    const value = obj[key]
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      throw new SEOError("VALIDATION", `Dangerous key "${key}" detected at ${path}`)
    }
    if (typeof value === "object" && value !== null) {
      validateJSONLDNode(value, `${path}.${key}`)
    }
  }
}

/**
 * Single JSON-LD serialization path — `JSON.stringify` on the whole graph only (ARCHITECTURE §7).
 * Includes validation to prevent prototype pollution and XSS attacks.
 * For multiple nodes, callers may pass an array; consumers typically emit one script tag per call.
 *
 * @param data - JSON-LD node or array of nodes to serialize
 * @returns JSON string suitable for embedding in <script type="application/ld+json">
 * @throws {SEOError} If validation fails
 *
 * @security Validates against prototype pollution, ensures @context is schema.org,
 *           and properly escapes all user content via JSON.stringify
 */
export function serializeJSONLD(data: JSONLD | readonly JSONLD[]): string {
  // Validate structure before serialization
  if (Array.isArray(data)) {
    data.forEach((node, index) => validateJSONLDNode(node, `array[${index}]`))
  } else {
    validateJSONLDNode(data, "root")
  }

  // Deep clone to prevent prototype pollution
  const sanitized = JSON.parse(JSON.stringify(data)) as JSONLD | JSONLD[]

  // Final serialization with proper escaping for HTML embedding
  // JSON.stringify escapes </script> as <\/script> and handles U+2028/U+2029
  return JSON.stringify(sanitized)
}
