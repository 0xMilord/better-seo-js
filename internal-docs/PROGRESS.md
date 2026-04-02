# Progress tracker — better-seo.js monorepo

**Purpose:** Single place to see **which Roadmap waves are done, partial, or not started**, with **repo evidence** and **FEATURES** IDs. Sequencing and exit criteria remain in **`Roadmap.md`**. Product intent: **`PRD.md`**.

**Last updated:** 2026-04-02 — **Wave 5**: `@better-seo/react` (Helmet + `useSEO`), **`renderTags`** parity with Next OG fields + multi-image, Next **golden** metadata test, Vite **Playwright** example; **Wave 4** npm path documented.

---

## Wave 1–2 gap audit (vs PRD / Roadmap exit criteria)

| Wave  | Exit intent (PRD §5)                                                                        | Verdict   | Gaps / notes                                                                                                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | Next App Router `metadata = seo({ title })` &lt; 60s; CI E2E; no public `any` in `.d.ts`    | **Met**\* | \*PRD §0 + **`USAGE.md`**: install **`@better-seo/next`** for **`seo()`**; **`@better-seo/core/node`** ships **`./node`** for package.json / env inference; global **`initSEO`** remains 🟨 for SSR.        |
| **2** | `npx @better-seo/cli og "Hello World"` → great PNG in ~2s; README before/after visual proof | **Met**\* | \* **`generateOG`** + **`og`**, light/dark, **`--template`** for compiled `.js`/`.mjs` modules (**`OgCardProps`**). **Wave 4:** README table + links (hero raster screenshots still optional / local-only). |

Waves **1–5** in this tracker are complete through **Wave 5** below (public **`@better-seo/react`** + E2E); later waves remain on [`Roadmap.md`](./Roadmap.md).

---

## Deep audit snapshot (2026-04-02)

| Area                        | Status            | Notes                                                                                                                                                                                                                        |
| --------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core pipeline**           | Aligned           | `createSEO` → plugins → optional **`features.jsonLd`** strip; **`serializeJSONLD`** single path.                                                                                                                             |
| **P5 `features`**           | Wired             | **`jsonLd`**, **`openGraphMerge`** read in **`packages/core/src/core.ts`**; documented in **`USAGE.md`**.                                                                                                                    |
| **Twitter ↔ OG**           | Wired             | **`twitter.image`** defaults from first **`openGraph.images[].url`** when OG merge is on (PRD §3.3).                                                                                                                         |
| **`validateSEO`**           | PRD §3.5 baseline | **`ValidationIssueCode`** on each issue; **`requireDescription`** (error + **`DESCRIPTION_REQUIRED`**); title/desc/OG/schema checks; dev-only + **`enabled: false`** / production strip; tests in **`validate.test.ts`**.    |
| **`serializeJSONLD`**       | Hardened          | **`Reflect.ownKeys`** iteration catches **`JSON.parse`**-shaped **`__proto__`**, **`constructor`**, **`prototype`**; non-string keys rejected; tests use realistic payloads (**`serialize.test.ts`**).                       |
| **`renderTags`**            | Wave 5+           | Adds **verification** + **pagination** link tags; **`onRenderTags`** plugin hook when passing **`config`**; parity with **`toNextMetadata`** for fields on **`SEO`**; **`render.test.ts`**.                                  |
| **Rules / globs**           | Improved          | **`rules.ts`**: multi-segment `**` globs, legacy trailing `path/*`, mid-path `*` segments; tests in **`rules.test.ts`**.                                                                                                     |
| **Plugins**                 | Tested            | **`beforeMerge` / `afterMerge` / `onRenderTags`** — **`plugins.test.ts`**.                                                                                                                                                   |
| **Coverage**                | Meets goal        | **`packages/core/vitest.config.ts`**: lines/statements **≥90%**, functions **88%**, branches **80%**; **`context.ts`** / **`singleton.ts`** included; registry, migrate, integration-style tests added.                      |
| **E2E**                     | Next + React SPA  | **`nextjs-app`**: head, assets, blog; **`react-seo-vite-example`**: Helmet title, description, canonical (**Wave 5**).                                                                                                       |
| **Edge / prod docs**        | Documented        | **`internal-docs/USAGE.md`**: Next + **React SPA**, **`createSEOContext`** vs **`initSEO`**, multi-tenant / Workers cautions, **`validateSEO`** codes and options.                                                           |
| **Next adapter**            | Golden + tests    | **`toNextMetadata`** + **`to-next-metadata.golden.test.ts`**, pipeline tests; root **`build`** includes **`@better-seo/react`**.                                                                                             |
| **React adapter (Wave 5)**  | Shipped           | **`@better-seo/react`**: **`toHelmetProps`**, **`BetterSEOHelmet`**, **`SEOProvider`**, **`useSEO`** (**`USE_SEO_NO_PROVIDER`**), **`prepareReactSeo`**, adapter **`react`**; Vitest + **Playwright** example.               |
| **OG / CLI (Wave 2)**       | Shipped           | **`@better-seo/assets`**: **`generateOG`** + optional **`template`** (`.js`/`.mjs`); **`@better-seo/cli`**: **`og`**, **`--template`**; tests + bin smoke.                                                                   |
| **Icons / CLI (Wave 3)**    | Shipped           | **`@better-seo/assets`**: **`generateIcons`**, **`buildWebAppManifest`**, **`formatWebManifest`** (Sharp, **`to-ico`** favicon); **`@better-seo/cli`**: **`icons`**; tests + bin smoke. **`splash`** still future (Wave 11). |
| **Still not built**         | See waves 6+      | **RSS**, deep CLI **scan/fix**, **Remix / Astro / Nuxt** adapters (docs: **`docs/adapters/future-frameworks.md`**).                                                                                                          |
| **`@better-seo/core/node`** | Shipped           | **`exports` `./node`**: **`readPackageJsonForSEO`**, **`inferSEOConfigFromEnvAndPackageJson`**, **`initSEOFromPackageJson`** — **`node.test.ts`**.                                                                           |
| **`better-seo-crawl`**      | Baseline          | **`renderRobotsTxt`**, **`renderSitemapXml`**, **`defaultSitemapUrlFromSEO`** — package **`better-seo-crawl`**.                                                                                                              |
| **`fromNextSeo`**           | Baseline          | Maps common next-seo **`DefaultSeo`** / **`NextSeo`** props — **`migrate.test.ts`**; edge cases still in Wave 12.                                                                                                            |
| **`.d.ts` public `any`**    | Clean             | No `any` on published typings (comment-only match in `index.d.ts`).                                                                                                                                                          |

---

## Legend

| Mark | Meaning                                                             |
| ---- | ------------------------------------------------------------------- |
| ✅   | **Done** — implemented end-to-end in repo with tests where required |
| 🟨   | **Partial** — scaffold, stub, or missing exit criteria              |
| ⬜   | **Not started**                                                     |

---

## Waves

### Wave 1 — Core + Next + E2E (critical path)

| Item                                                      | Status | Evidence / notes                                                                                                                                                                    |
| --------------------------------------------------------- | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Types `SEO`, `SEOConfig`, JSON-LD                         |   ✅   | `packages/core/src/types.ts`                                                                                                                                                        |
| `createSEO` / `mergeSEO` / fallbacks                      |   ✅   | `packages/core/src/core.ts` + **`core.test.ts`** (incl. **`schemaMerge`**)                                                                                                          |
| `withSEO` (alias + Next export)                           |   ✅   | `core.ts`, `@better-seo/next` `surface.ts`                                                                                                                                          |
| `schemaMerge` dedupeByIdAndType                           |   ✅   | `schema-dedupe.ts`, `createSEO`                                                                                                                                                     |
| `serializeJSONLD`                                         |   ✅   | `serialize.ts` (validation + **`Reflect.ownKeys`**); **`serialize.test.ts`**                                                                                                        |
| Schema helpers + `customSchema` + **`techArticle`**       |   ✅   | `schema.ts`, **`schema.test.ts`**                                                                                                                                                   |
| Route rules + glob-style **`match`**                      |   ✅   | `rules.ts` (`**`, `*`, trailing `path/*`); **`rules.test.ts`**                                                                                                                      |
| `registerAdapter`, `@better-seo/next`, `toNextMetadata`   |   ✅   | `packages/next/*`, **`adapters/registry.test.ts`**                                                                                                                                  |
| Voilà `seo`, `prepareNextSeo`                             |   ✅   | `surface.ts`, **`voila.test.ts`**                                                                                                                                                   |
| `useSEO` stub in **core** (real in **@better-seo/react**) |   ✅   | **`packages/core/src/voila.ts`** — **`USE_SEO_NOT_AVAILABLE`**; **`@better-seo/react`** — **`SEOProvider`** + **`useSEO`**                                                          |
| `createSEOContext`, `initSEO`                             |   🟨   | Implemented + **`context.test.ts`**, **`singleton.test.ts`**; **`@better-seo/core/node`** inference + **`initSEOFromPackageJson`** — global **`initSEO`** still discouraged for SSR |
| Plugin `defineSEOPlugin`, hooks                           |   ✅   | **`beforeMerge` / `afterMerge` / `onRenderTags`** — **`plugins.test.ts`**                                                                                                           |
| Optional P5 `features` flags                              |   ✅   | `jsonLd` / `openGraphMerge` in **`core.ts`**; **`core.test.ts`**                                                                                                                    |
| Unit tests (>90% lines goal)                              |   ✅   | **`packages/core/vitest.config.ts`** (90/90/88/80); core ~**98%** lines in CI                                                                                                       |
| `renderTags` (vanilla channel)                            |   ✅   | **`render.ts`** — full OG URL/type + multi-image; **`render.test.ts`**                                                                                                              |
| `examples/nextjs-app` + Playwright                        |   ✅   | `e2e/home.spec.ts`, `with-seo.spec.ts`, **`head-tags.spec.ts`**                                                                                                                     |
| **N5 / N6** recipes                                       |   ✅   | `docs/recipes/n5-*`, `n6-*`                                                                                                                                                         |
| Structured **`SEOError`**                                 |   ✅   | `packages/core/src/errors.ts` (+ codes **`USE_SEO_NO_PROVIDER`**, …)                                                                                                                |
| **`validateSEO`** (PRD §3.5 baseline)                     |   ✅   | **`validate.ts`**: **`ValidationIssueCode`**, **`requireDescription`**, … — **`validate.test.ts`**                                                                                  |
| Monorepo build order                                      |   ✅   | Root **`package.json` `build`**: **core** → **assets** → **cli** → **better-seo-crawl** → **next** → **react** → examples                                                           |

---

### Wave 2 — OG generator

| Item                                  | Status | Evidence                                                                      |
| ------------------------------------- | :----: | ----------------------------------------------------------------------------- |
| `@better-seo/assets` OG (Satori, tpl) |   ✅   | **`generateOG`**, **`OGConfig`**, light/dark; **`generate-og.test.ts`**       |
| CLI **`og`** (**L2**)                 |   ✅   | **`run-cli*.test.ts`**, **`run-cli.binary.test.ts`**                          |
| README / USAGE / recipe               |   ✅   | **`README.md`**, **`internal-docs/USAGE.md`**, **`docs/recipes/og-wave2.md`** |

**Also shipped:** **`--template`** / compiled **`.js`/`.mjs`** custom OG modules.

---

### Wave 3 — Icons + manifest

| Item                               | Status | Evidence                                              |
| ---------------------------------- | :----: | ----------------------------------------------------- |
| Icon pipeline (Sharp) + faviconICO |   ✅   | **`generate-icons.ts`**, **`generate-icons.test.ts`** |
| **`manifest.json`** (**A3**)       |   ✅   | **`buildWebAppManifest`**, CLI **`icons`**            |
| CLI **`icons`** (**L2**)           |   ✅   | **`run-cli.ts`**, tests                               |
| Docs recipe                        |   ✅   | **`docs/recipes/icons-wave3.md`**                     |

**Deferred:** **`splash`** — **Wave 11**.

---

### Wave 4 — Distribution & polish

| Item                      | Status | Evidence                                                                                                                      |
| ------------------------- | :----: | ----------------------------------------------------------------------------------------------------------------------------- |
| npm publish / Changesets  |  ✅\*  | Packages publishable under **`@better-seo`** org; **`PACKAGE.md`**, **`.changeset/`**, **`release.yml`** — \*maintainer token |
| Dual ESM/CJS + semver     |   ✅   | **`tsup`**; **`CHANGELOG.md`** + Changesets                                                                                   |
| **size-limit** (core)     |   ✅   | **`npm run ci`** → **`npm run size`**                                                                                         |
| README + visual proof     |   ✅   | Root **README** before/after table; recipes / compare                                                                         |
| **`examples/nextjs-app`** |   ✅   | **`predev`/`prebuild` → `assets`**, E2E                                                                                       |
| **D6** compare            |   ✅   | **`docs/compare/next-seo-vs-better-seo.md`**                                                                                  |
| **D7** extra examples     |   ✅   | **`examples/vanilla-render-tags`**, **`examples/react-seo-vite`**                                                             |

---

### Wave 5 — Adapters + validation

| Item                           | Status | Evidence                                                                                                                             |
| ------------------------------ | :----: | ------------------------------------------------------------------------------------------------------------------------------------ |
| `toHelmetProps`, `useSEO` real |   ✅   | **`packages/react`**: **`toHelmetProps`**, **`BetterSEOHelmet`**, **`SEOProvider`**, **`useSEO`**; **`docs/recipes/react-wave5.md`** |
| `renderTags` complete (C7)     |   ✅   | **`og:url`**, **`og:type`**, multiple **`og:image`** groups; tests **`render.test.ts`**                                              |
| `validateSEO` dev behavior     |   ✅   | **`validate.test.ts`**                                                                                                               |
| Adapter golden tests           |   ✅   | **`packages/next/src/to-next-metadata.golden.test.ts`**; React Helmet parity via **`renderTags`** mapping                            |
| Remix / Astro / Nuxt           |   🟨   | **Docs-only** — **`docs/adapters/future-frameworks.md`** (Roadmap: stub or docs until implemented)                                   |

---

### Waves 6–12 & ongoing

| Wave    | Theme                  | Status | Notes                                                                                   |
| ------- | ---------------------- | :----: | --------------------------------------------------------------------------------------- |
| 6       | Rules / scale          |   🟨   | Glob **`match`** improved (**Wave 1**); **N9** / **V4–V6** TBD                          |
| 7       | Content compiler       |   ⬜   | **C16/C17**                                                                             |
| 8       | Snapshot / preview CLI |   ⬜   | **L5/L6**                                                                               |
| 9       | TUI, init, doctor      |   🟨   | **`doctor` / `init` / `migrate`** hints shipped; TUI / templates TBD (**L1/L8/L9–L11**) |
| 10      | add / scan / fix       |   ⬜   | **L3/L4**                                                                               |
| 11      | Design system OG       |   ⬜   | **A5**, **`splash`** depth                                                              |
| 12      | Crawl + migrate        |   🟨   | **`better-seo-crawl`** baseline + **`fromNextSeo`** mapper; RSS / full codemods TBD     |
| Ongoing | Plugins ecosystem      |   ⬜   | **P3/P4**, D8                                                                           |

---

## Quick commands

```bash
npm run check   # format, lint, typecheck, test:coverage, build
npm run ci      # check + E2E (nextjs-app + react-seo-vite) + size-limit
```

---

## Traceability

- **FEATURES ID → wave:** `Roadmap.md` §4
- **Architecture gates:** `Roadmap.md` §5, `ARCHITECTURE.md`

When you complete a wave item, update this file in the same PR (or immediately after) so the sequencing doc stays trustworthy.
