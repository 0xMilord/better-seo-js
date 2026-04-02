import type { JSONLD } from "./types.js"

/**
 * When the same `@id` + `@type` appears more than once, keep the last occurrence (child-over-parent semantics).
 * Nodes without both `@id` and `@type` string are kept in order.
 */
export function dedupeSchemaByIdAndType(schemas: readonly JSONLD[]): JSONLD[] {
  type Key = string
  const lastIndexByKey = new Map<Key, number>()
  for (let i = 0; i < schemas.length; i++) {
    const node = schemas[i]
    if (!node) continue
    const id = node["@id"]
    const type = node["@type"]
    if (typeof id === "string" && typeof type === "string") {
      lastIndexByKey.set(`${type}::${id}`, i)
    }
  }
  const drop = new Set<number>()
  for (let i = 0; i < schemas.length; i++) {
    const node = schemas[i]
    if (!node) continue
    const id = node["@id"]
    const type = node["@type"]
    if (typeof id === "string" && typeof type === "string") {
      const k = `${type}::${id}`
      if (lastIndexByKey.get(k) !== i) drop.add(i)
    }
  }
  return schemas.filter((_, i) => !drop.has(i))
}
