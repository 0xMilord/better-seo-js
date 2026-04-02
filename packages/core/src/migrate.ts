import { SEOError } from "./errors.js"

/**
 * Codemod-oriented helpers — stub until Wave 12 / CLI `migrate` (FEATURES C15).
 * @throws {SEOError} MIGRATE_NOT_IMPLEMENTED
 */
export function fromNextSeo(_nextSeoExport: unknown): never {
  void _nextSeoExport
  throw new SEOError("MIGRATE_NOT_IMPLEMENTED")
}
