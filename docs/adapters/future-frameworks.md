# Future framework adapters (Remix, Astro, Nuxt)

**Roadmap.md Wave 5** allows **stubs or docs-only** for secondary adapters until each ships.

| Target        | Planned package         | Status                                                      |
| ------------- | ----------------------- | ----------------------------------------------------------- |
| **React SPA** | **`@better-seo/react`** | **Shipped** — `toHelmetProps`, `BetterSEOHelmet`, `useSEO`. |
| **Remix**     | `@better-seo/remix`     | Not started — `meta` / `links` export from `SEO`.           |
| **Astro**     | `@better-seo/astro`     | Not started — layout / frontmatter bridge.                  |
| **Nuxt**      | `@better-seo/nuxt`      | Not started — module + head bridge.                         |

**Contract:** each adapter depends on **`@better-seo/core`**, registers a stable adapter id, and maps **`SEO` → framework head output** without reimplementing JSON-LD stringification (use **`serializeJSONLD`** only).

See [**FEATURES.md**](../../internal-docs/FEATURES.md) §6 and [**ARCHITECTURE.md**](../../internal-docs/ARCHITECTURE.md) §8.
