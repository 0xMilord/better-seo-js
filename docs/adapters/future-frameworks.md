# Future framework adapters (Remix, Astro, Nuxt)

**Roadmap.md Wave 5** allows **stubs or docs-only** for secondary adapters until each ships.

| Target        | Planned package         | Status                                                      |
| ------------- | ----------------------- | ----------------------------------------------------------- |
| **React SPA** | **`@better-seo/react`** | **Shipped** — `toHelmetProps`, `BetterSEOHelmet`, `useSEO`. |
| **Remix**     | `@better-seo/remix`     | Not started — `meta` / `links` export from `SEO`.           |
| **Astro**     | `@better-seo/astro`     | Not started — layout / frontmatter bridge.                  |
| **Nuxt**      | `@better-seo/nuxt`      | Not started — module + head bridge.                         |

**Contract:** each adapter depends on **`@better-seo/core`**, registers a stable adapter id, and maps **`SEO` → framework head output** without reimplementing JSON-LD stringification (use **`serializeJSONLD`** only).

New adapters should follow the same pattern as **`@better-seo/next`**: depend on **`@better-seo/core`**, take **`SEO`**, emit framework-specific metadata or head props, and keep JSON-LD on **`serializeJSONLD`**. See **`packages/next/README.md`** and **`packages/core/README.md`**.
