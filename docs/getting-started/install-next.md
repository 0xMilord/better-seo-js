---
title: Install (Next.js)
description: Packages and versions for the reference Next.js App Router integration.
---

# Install (Next.js)

**What it does:** Adds the **zero-dependency core** and the **Next.js adapter** to your app.

**When to use:** Greenfield App Router apps; any page using `export const metadata` or `generateMetadata`.

## Example

```bash
npm install @better-seo/core @better-seo/next
```

Optional: **`@better-seo/assets`** and **`@better-seo/cli`** for OG PNG / icons (Node — not for Edge). See [Assets](../assets/og.md).

## Output

- `dependencies`: `@better-seo/core`, `@better-seo/next` (version per your monorepo or npm).

## Notes

- Set **`NEXT_PUBLIC_SITE_URL`** (or your deployment’s public URL) so canonicals and OG URLs resolve correctly.

Next: [First metadata](./first-metadata.md)
