---
title: JSON-LD & safety
description: serializeJSONLD and why adapters must not hand-roll script bodies.
---

# JSON-LD & safety

**What it does:** **`serializeJSONLD`** turns **`JSONLD` / `JSONLD[]`** into a string safe for embedding in **`<script type="application/ld+json">`**, using **`JSON.stringify`** on the **whole** graph.

**When to use:** Always, for any user- or CMS-driven fields that could contain `</script>` or Unicode line separators.

## Example

```ts
import { article, serializeJSONLD } from "@better-seo/core"

const graph = article({
  headline: "Hello",
  url: "https://example.com/p/hello",
})

const json = serializeJSONLD(graph)
// Pass to your framework's JSON-LD slot, or use NextJsonLd on App Router.
```

## Output

- One serialized graph string suitable for **`dangerouslySetInnerHTML`** only when it came from **`serializeJSONLD`**, not from string concatenation.

## Notes

- **`NextJsonLd`** in **`@better-seo/next/json-ld`** is the App Router–friendly wrapper around the same serializer.
- Anti-pattern: building scripts from partial JSON of user content.

Next: [API — Core](../api/core.md)
