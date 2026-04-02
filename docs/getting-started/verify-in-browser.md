---
title: Verify in the browser
description: What to check in DevTools and view-source for metadata and JSON-LD.
---

# Verify in the browser

**What it does:** Confirms that **metadata** and **JSON-LD** match what you passed through **`createSEO`** / **`prepareNextSeo`**.

**When to use:** After first integration; when debugging OG previews or Search Console rich results.

## What to check

1. **Elements → `<head>`** — `title`, `meta[name="description"]`, `link[rel="canonical"]`, Open Graph and Twitter tags.
2. **View source or Elements** — `<script type="application/ld+json">` blocks emitted by **`NextJsonLd`**.
3. **Network** — ensure no accidental double JSON-LD from duplicate components.

## Example

No code — use DevTools on `http://localhost:3000` (or your docs site on port **3004**).

## Output

- You should see one coherent story: titles/descriptions in meta and OG match the same **`SEO`** object used for JSON-LD.

## Notes

- Social crawlers cache previews; use their debuggers (e.g. Facebook Sharing Debugger) when testing OG.
- Safe embedding is enforced by **`serializeJSONLD`** — do not concatenate user content into script bodies manually. See [JSON-LD & safety](../concepts/json-ld-and-safety.md).
