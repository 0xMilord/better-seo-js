# Progress tracker — better-seo.js monorepo

**Purpose:** Single place to see **which Roadmap waves are done, partial, or not started**, with **repo evidence** and **FEATURES** IDs. Sequencing and exit criteria remain in **`Roadmap.md`**. Product intent: **`PRD.md`**.

**Last updated:** 2026-04-02 (Wave 2 — **`better-seo-assets`** + **`better-seo-cli`** `og`; Wave 1 items unchanged).

---

## Deep audit snapshot (2026-04-02)

| Area                     | Status            | Notes                                                                                                                                                                                                                     |
| ------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core pipeline**        | Aligned           | `createSEO` → plugins → optional **`features.jsonLd`** strip; **`serializeJSONLD`** single path.                                                                                                                          |
| **P5 `features`**        | Wired             | **`jsonLd`**, **`openGraphMerge`** read in **`packages/core/src/core.ts`**; documented in **`USAGE.md`**.                                                                                                                 |
| **Twitter ↔ OG**         | Wired             | **`twitter.image`** defaults from first **`openGraph.images[].url`** when OG merge is on (PRD §3.3).                                                                                                                      |
| **`validateSEO`**        | PRD §3.5 baseline | **`ValidationIssueCode`** on each issue; **`requireDescription`** (error + **`DESCRIPTION_REQUIRED`**); title/desc/OG/schema checks; dev-only + **`enabled: false`** / production strip; tests in **`validate.test.ts`**. |
| **`serializeJSONLD`**    | Hardened          | **`Reflect.ownKeys`** iteration catches **`JSON.parse`**-shaped **`__proto__`**, **`constructor`**, **`prototype`**; non-string keys rejected; tests use realistic payloads (**`serialize.test.ts`**).                    |
| **`renderTags`**         | Extended          | Canonical, hreflang, OG/Twitter, JSON-LD script tags; extra branches covered in **`render.test.ts`**.                                                                                                                     |
| **Rules / globs**        | Improved          | **`rules.ts`**: multi-segment `**` globs, legacy trailing `path/*`, mid-path `*` segments; tests in **`rules.test.ts`**.                                                                                                  |
| **Plugins**              | Tested            | **`beforeMerge` / `afterMerge`** order + **`features.jsonLd`** interaction — **`plugins.test.ts`**.                                                                                                                       |
| **Coverage**             | Meets goal        | **`packages/core/vitest.config.ts`**: lines/statements **≥90%**, functions **88%**, branches **80%**; **`context.ts`** / **`singleton.ts`** included; registry, migrate, integration-style tests added.                   |
| **E2E**                  | Deeper            | **`examples/nextjs-app/e2e/head-tags.spec.ts`**: canonical, hreflang, OG/Twitter, parseable JSON-LD, dynamic **`/blog/[slug]`** + **`generateMetadata`**.                                                                 |
| **Edge / prod docs**     | Documented        | **`internal-docs/USAGE.md`**: **`createSEOContext`** vs **`initSEO`**, multi-tenant / Workers cautions, **`validateSEO`** codes and options.                                                                              |
| **Next adapter**         | Golden            | **`toNextMetadata`** + pipeline tests; monorepo **`build`** order: core → **`@better-seo/next`** → example (avoids DTS race).                                                                                             |
| **OG / CLI (Wave 2)**    | Shipped           | **`packages/better-seo-assets`**: **`generateOG`** (Satori, Resvg, light/dark, **1200×630**); **`packages/better-seo-cli`**: **`better-seo og`**; tests + built-bin smoke in CI. Custom **`template`** deferred.          |
| **Still not built**      | See waves 3+      | **`@better-seo/react`**, crawl, full **`fromNextSeo`**, **`useSEO`** real, **`onRenderTags`** / **`extendChannels`**, rich **`initSEO`** inference (PRD §3.9).                                                            |
| **`better-seo.js/node`** | Open              | No separate conditional **`exports`** entry yet (ARCHITECTURE §10); Edge bundle tree-shaking not verified by automated test.                                                                                              |
| **`.d.ts` public `any`** | Clean             | No `any` on published typings (comment-only match in `index.d.ts`).                                                                                                                                                       |

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
| Monorepo build order (DTS / `file:` deps)               |   ✅   | Root **`package.json` `build`**: **`better-seo.js`** → **`better-seo-assets`** → **`better-seo-cli`** → **`@better-seo/next`** → **`nextjs-app`**                   |

**Remaining Wave 1 adjacencies (not blocking “core path”):** separate **`better-seo.js`** export for Node-only surfaces (ARCHITECTURE §10), automated Edge/tree-shaking verification, `seo()` path wording in PRD §0 vs **`@better-seo/next`** (USAGE is canonical).

---

### Wave 2 — OG generator

| Item                                       | Status | Evidence                                                                                                                                                                |
| ------------------------------------------ | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `better-seo-assets` OG (Satori, templates) |   ✅   | **`packages/better-seo-assets`**: **`generateOG`**, **`OGConfig`**, light/dark templates (`og/templates/og-card.tsx`); Inter **`.woff`**; **`generate-og.test.ts`**     |
| CLI **`og`** (**L2**)                      |   ✅   | **`packages/better-seo-cli`**: bins **`better-seo`** / **`better-seo-cli`** → **`dist/cli.cjs`**; **`run-cli*.test.ts`**, **`run-cli.binary.test.ts`** (production bin) |
| README / USAGE / recipe                    |   ✅   | **`README.md`**, **`internal-docs/USAGE.md`**, **`docs/recipes/og-wave2.md`**                                                                                           |

**Deferred (not Wave 2):** user-provided **`template`** file path; PRD **`generateIcons`** / **`generateManifest`** → **Wave 3**. Full “before/after” hero imagery → **Wave 4** polish.

---

### Wave 3 — Icons + manifest

| Item                   | Status | Evidence |
| ---------------------- | ------ | -------- |
| Icons + manifest       | ⬜     |          |
| CLI `icons` / `splash` | ⬜     |          |

---

### Wave 4 — Distribution & polish

| Item                     | Status | Evidence                              |
| ------------------------ | ------ | ------------------------------------- |
| npm publish / Changesets | 🟨     | See `PACKAGE.md`                      |
| README visual proof      | 🟨     | Depends on Wave 2 OG for before/after |
| Extra examples (D7)      | 🟨     | Only `nextjs-app`                     |

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
| 11      | Design system OG       |   ⬜   | **A5**                                                               |
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
