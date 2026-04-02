# Progress tracker — better-seo.js monorepo

**Purpose:** Single place to see **which Roadmap waves are done, partial, or not started**, with **repo evidence** and **FEATURES** IDs. Sequencing and exit criteria remain in **`Roadmap.md`**. Product intent: **`PRD.md`**.

**Last updated:** 2026-04-02 — Wave 4 distribution polish + Wave 2 **`template`** path; Next example asset pipeline + **D6/D7** docs/examples.

---

## Wave 1–2 gap audit (vs PRD / Roadmap exit criteria)

| Wave  | Exit intent (PRD §5)                                                                        | Verdict   | Gaps / notes                                                                                                                                                                                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | Next App Router `metadata = seo({ title })` &lt; 60s; CI E2E; no public `any` in `.d.ts`    | **Met**\* | \*Canonical import is **`@better-seo/next`** (`seo`, `prepareNextSeo`); **`USAGE.md`** is source of truth vs PRD §0. **Non-blocking:** no **`@better-seo/core/node`** `exports` yet; no automated Edge bundle guard. **`createSEOContext` / `initSEO`** still 🟨 in tracker for that reason. |
| **2** | `npx @better-seo/cli og "Hello World"` → great PNG in ~2s; README before/after visual proof | **Met**\* | \* **`generateOG`** + **`og`**, light/dark, **`--template`** for compiled `.js`/`.mjs` modules (**`OgCardProps`**). **Wave 4:** README table + links (hero raster screenshots still optional / local-only).                                                                                  |

Waves **1–4** in this tracker are complete through **Wave 4** below; later waves remain queued on [`Roadmap.md`](./Roadmap.md).

---

## Deep audit snapshot (2026-04-02)

| Area                        | Status            | Notes                                                                                                                                                                                                                        |
| --------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core pipeline**           | Aligned           | `createSEO` → plugins → optional **`features.jsonLd`** strip; **`serializeJSONLD`** single path.                                                                                                                             |
| **P5 `features`**           | Wired             | **`jsonLd`**, **`openGraphMerge`** read in **`packages/core/src/core.ts`**; documented in **`USAGE.md`**.                                                                                                                    |
| **Twitter ↔ OG**           | Wired             | **`twitter.image`** defaults from first **`openGraph.images[].url`** when OG merge is on (PRD §3.3).                                                                                                                         |
| **`validateSEO`**           | PRD §3.5 baseline | **`ValidationIssueCode`** on each issue; **`requireDescription`** (error + **`DESCRIPTION_REQUIRED`**); title/desc/OG/schema checks; dev-only + **`enabled: false`** / production strip; tests in **`validate.test.ts`**.    |
| **`serializeJSONLD`**       | Hardened          | **`Reflect.ownKeys`** iteration catches **`JSON.parse`**-shaped **`__proto__`**, **`constructor`**, **`prototype`**; non-string keys rejected; tests use realistic payloads (**`serialize.test.ts`**).                       |
| **`renderTags`**            | Extended          | Canonical, hreflang, OG/Twitter, JSON-LD script tags; extra branches covered in **`render.test.ts`**.                                                                                                                        |
| **Rules / globs**           | Improved          | **`rules.ts`**: multi-segment `**` globs, legacy trailing `path/*`, mid-path `*` segments; tests in **`rules.test.ts`**.                                                                                                     |
| **Plugins**                 | Tested            | **`beforeMerge` / `afterMerge`** order + **`features.jsonLd`** interaction — **`plugins.test.ts`**.                                                                                                                          |
| **Coverage**                | Meets goal        | **`packages/core/vitest.config.ts`**: lines/statements **≥90%**, functions **88%**, branches **80%**; **`context.ts`** / **`singleton.ts`** included; registry, migrate, integration-style tests added.                      |
| **E2E**                     | Deeper            | **`head-tags.spec.ts`**: canonical, hreflang, OG/Twitter, JSON-LD, **`/blog/[slug]`**; static **`/og-example.png`** + **`/favicon.ico`** served (**CLI asset pipeline**).                                                    |
| **Edge / prod docs**        | Documented        | **`internal-docs/USAGE.md`**: **`createSEOContext`** vs **`initSEO`**, multi-tenant / Workers cautions, **`validateSEO`** codes and options.                                                                                 |
| **Next adapter**            | Golden            | **`toNextMetadata`** + pipeline tests; root **`build`**: **`@better-seo/core`** → **`@better-seo/assets`** → **`@better-seo/cli`** → **`@better-seo/next`** → **`nextjs-app`**.                                              |
| **OG / CLI (Wave 2)**       | Shipped           | **`@better-seo/assets`**: **`generateOG`** + optional **`template`** (`.js`/`.mjs`); **`@better-seo/cli`**: **`og`**, **`--template`**; tests + bin smoke.                                                                   |
| **Icons / CLI (Wave 3)**    | Shipped           | **`@better-seo/assets`**: **`generateIcons`**, **`buildWebAppManifest`**, **`formatWebManifest`** (Sharp, **`to-ico`** favicon); **`@better-seo/cli`**: **`icons`**; tests + bin smoke. **`splash`** still future (Wave 11). |
| **Still not built**         | See waves 4+      | **`@better-seo/react`**, crawl, full **`fromNextSeo`**, **`useSEO`** real, **`onRenderTags`** / **`extendChannels`**, rich **`initSEO`** inference (PRD §3.9).                                                               |
| **`@better-seo/core/node`** | Open              | No separate conditional **`exports`** entry on published core yet (ARCHITECTURE §10); Edge bundle tree-shaking not verified by automated test.                                                                               |
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

| Item                                                    | Status | Evidence / notes                                                                                                                                                    |
| ------------------------------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Types `SEO`, `SEOConfig`, JSON-LD                       |   ✅   | `packages/core/src/types.ts`                                                                                                                                        |
| `createSEO` / `mergeSEO` / fallbacks                    |   ✅   | `packages/core/src/core.ts` + **`core.test.ts`** (incl. **`schemaMerge`**)                                                                                          |
| `withSEO` (alias + Next export)                         |   ✅   | `core.ts`, `@better-seo/next` `surface.ts`                                                                                                                          |
| `schemaMerge` dedupeByIdAndType                         |   ✅   | `schema-dedupe.ts`, `createSEO`                                                                                                                                     |
| `serializeJSONLD`                                       |   ✅   | `serialize.ts` (validation + **`Reflect.ownKeys`**); **`serialize.test.ts`**                                                                                        |
| Schema helpers + `customSchema` + **`techArticle`**     |   ✅   | `schema.ts`, **`schema.test.ts`**                                                                                                                                   |
| Route rules + glob-style **`match`**                    |   ✅   | `rules.ts` (`**`, `*`, trailing `path/*`); **`rules.test.ts`**                                                                                                      |
| `registerAdapter`, `@better-seo/next`, `toNextMetadata` |   ✅   | `packages/next/*`, **`adapters/registry.test.ts`**                                                                                                                  |
| Voilà `seo`, `prepareNextSeo`                           |   ✅   | `surface.ts`, **`voila.test.ts`**                                                                                                                                   |
| `useSEO` stub (throws, Wave 5)                          |   ✅   | `packages/core/src/voila.ts` — **`SEOError`**                                                                                                                       |
| `createSEOContext`, `initSEO`                           |   🟨   | Implemented + **`context.test.ts`**, **`singleton.test.ts`**; **`USAGE.md`** Edge / multi-tenant — no **`package.json` `exports` `./node`** yet; no tree-shake test |
| Plugin `defineSEOPlugin`, `afterMerge` / `beforeMerge`  |   ✅   | `plugins.ts` + `core.ts`; hook order + **`features.jsonLd`** — **`plugins.test.ts`**                                                                                |
| Optional P5 `features` flags                            |   ✅   | `jsonLd` / `openGraphMerge` in **`core.ts`**; **`core.test.ts`**                                                                                                    |
| Unit tests (>90% lines goal)                            |   ✅   | **`packages/core/vitest.config.ts`** (90/90/88/80); core ~**98%** lines in CI                                                                                       |
| `renderTags` (vanilla channel)                          |   ✅   | `render.ts` — **`render.test.ts`** (canonical, alternates, OG/Twitter, empty `images`)                                                                              |
| `examples/nextjs-app` + Playwright                      |   ✅   | `e2e/home.spec.ts`, `with-seo.spec.ts`, **`head-tags.spec.ts`** (canonical, hreflang, OG, Twitter, JSON-LD, **`/blog/[slug]`**)                                     |
| **N5 / N6** recipes                                     |   ✅   | `docs/recipes/n5-*`, `n6-*`                                                                                                                                         |
| Structured **`SEOError`**                               |   ✅   | `packages/core/src/errors.ts`                                                                                                                                       |
| **`validateSEO`** (PRD §3.5 baseline)                   |   ✅   | **`validate.ts`**: **`ValidationIssueCode`**, **`requireDescription`**, logging toggle; prod / **`enabled: false`** strip — **`validate.test.ts`**                  |
| Monorepo build order (DTS / `file:` deps)               |   ✅   | Root **`package.json` `build`**: **`@better-seo/core`** → **`@better-seo/assets`** → **`@better-seo/cli`** → **`@better-seo/next`** → **`nextjs-app`**              |

**Remaining Wave 1 adjacencies (not blocking “core path”):** separate **Node-only** `exports` on published core (ARCHITECTURE §10), automated Edge/tree-shaking verification, PRD §0 import snippet vs **`@better-seo/next`** (**`USAGE.md`** is canonical).

---

### Wave 2 — OG generator

| Item                                  | Status | Evidence                                                                                                                |
| ------------------------------------- | :----: | ----------------------------------------------------------------------------------------------------------------------- |
| `@better-seo/assets` OG (Satori, tpl) |   ✅   | **`generateOG`**, **`OGConfig`**, light/dark (`og/templates/og-card.tsx`); Inter **`.woff`**; **`generate-og.test.ts`** |
| CLI **`og`** (**L2**)                 |   ✅   | Bins **`better-seo`** / **`better-seo-cli`** → **`dist/cli.cjs`**; **`run-cli*.test.ts`**, **`run-cli.binary.test.ts`** |
| README / USAGE / recipe               |   ✅   | **`README.md`**, **`internal-docs/USAGE.md`**, **`docs/recipes/og-wave2.md`**                                           |

**Also shipped (Wave 4 catch-up):** **`--template`** / **`OGConfig.template`** → compiled **`.js`/`.mjs`** ESM module (default export = Satori component; props = **`OgCardProps`**).

---

### Wave 3 — Icons + manifest

| Item                               | Status | Evidence                                                                                                                                                                             |
| ---------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Icon pipeline (Sharp) + faviconICO |   ✅   | **`@better-seo/assets`** `icons/generate-icons.ts`: `icon-{16,32,192,512}.png`, **`apple-touch-icon.png`**, **`maskable-icon.png`**, **`favicon.ico`**; **`generate-icons.test.ts`** |
| **`manifest.json`** (**A3**)       |   ✅   | **`buildWebAppManifest`**, **`formatWebManifest`**, **`defaultWebManifestIcons`**; CLI writes manifest by default (`--no-manifest` to skip)                                          |
| CLI **`icons`** (**L2**)           |   ✅   | **`run-cli.ts`** `icons` subcommand; **`run-cli.test.ts`**, **`run-cli.binary.test.ts`**                                                                                             |
| Docs recipe                        |   ✅   | **`docs/recipes/icons-wave3.md`**, **`docs/recipes/README.md`**                                                                                                                      |

**Deferred:** **`splash`** / rich asset matrix — **Wave 11** (Roadmap §3).

---

### Wave 4 — Distribution & polish

| Item                      | Status | Evidence                                                                                        |
| ------------------------- | :----: | ----------------------------------------------------------------------------------------------- |
| npm publish / Changesets  |   🟨   | `PACKAGE.md`, `.changeset/`, `release.yml`; publish when org + **`NPM_TOKEN`** ready            |
| Dual ESM/CJS + semver     |   ✅   | **`tsup`**; **`CHANGELOG.md`** + Changesets                                                     |
| **size-limit** (core)     |   ✅   | **`npm run ci`** → **`npm run size`**                                                           |
| README + visual proof     |   ✅   | Root **README** before/after table; links to recipes / compare                                  |
| **`examples/nextjs-app`** |   ✅   | **`predev`/`prebuild` → `assets`** (CLI **`og`+`icons`**), layout **`icons`**, E2E static files |
| **D6** compare            |   ✅   | **`docs/compare/next-seo-vs-better-seo.md`**                                                    |
| **D7** extra example      |   ✅   | **`examples/vanilla-render-tags`**                                                              |

---

### Wave 5 — Adapters + validation

| Item                           | Status | Evidence                                                                                                              |
| ------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------- |
| `toHelmetProps`, `useSEO` real | ⬜     | `@better-seo/react`                                                                                                   |
| `renderTags` complete          | 🟨     | Extended Twitter meta; C7 “complete” = future channels                                                                |
| `validateSEO` dev behavior     | ✅     | Core **`validateSEO`** matches PRD §3.5 baseline (codes, **`requireDescription`**, strip); see **`validate.test.ts`** |
| Adapter golden tests           | 🟨     | Next tests expanded; full goldens TBD                                                                                 |

---

### Waves 6–12 & ongoing

| Wave    | Theme                  | Status | Notes                                                                |
| ------- | ---------------------- | :----: | -------------------------------------------------------------------- |
| 6       | Rules / scale          |   🟨   | Glob-style **`match`** improved (**Wave 1**); **N9** / **V4–V6** TBD |
| 7       | Content compiler       |   ⬜   | **C16/C17**                                                          |
| 8       | Snapshot / preview CLI |   ⬜   | **L5/L6**                                                            |
| 9       | TUI, init, doctor      |   ⬜   | **L1/L8/L9–L11**                                                     |
| 10      | add / scan / fix       |   ⬜   | **L3/L4**                                                            |
| 11      | Design system OG       |   ⬜   | **A5**, **`splash`** depth                                           |
| 12      | Crawl + migrate        |   ⬜   | `fromNextSeo` throws **MIGRATE_NOT_IMPLEMENTED**                     |
| Ongoing | Plugins ecosystem      |   ⬜   | **P3/P4**, D8                                                        |

---

## Quick commands

```bash
npm run check   # format, lint, typecheck, test:coverage, build
npm run ci      # check + E2E + size-limit (see root package.json)
```

---

## Traceability

- **FEATURES ID → wave:** `Roadmap.md` §4
- **Architecture gates:** `Roadmap.md` §5, `ARCHITECTURE.md`

When you complete a wave item, update this file in the same PR (or immediately after) so the sequencing doc stays trustworthy.
