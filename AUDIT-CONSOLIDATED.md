# Full Codebase Audit — better-seo.js v0.1.2

**Date:** 2026-04-04
**Against:** `PRD.md`, `ARCHITECTURE.md`, `FEATURES.md`, `Roadmap.md`, `PROGRESS.md`, `TUI-CRAWL-INFRA-PLAN.md`, `USAGE.md`
**Method:** 5 audit agents + consolidated findings

---

## Executive Summary

| Metric                | Value                                                      |
| --------------------- | ---------------------------------------------------------- |
| **Total feature IDs** | ~77                                                        |
| **Fully shipped**     | 67 (87%)                                                   |
| **Partially shipped** | 7 (9%)                                                     |
| **Not shipped**       | 3 (4%)                                                     |
| **Unit tests**        | 354 across 7 packages                                      |
| **Core coverage**     | 94.56% stmts / 86.92% branches / 100% funcs / 96.87% lines |
| **Dogfood tests**     | 13/13 passing                                              |

**Bottom line:** The repo is in solid shape for a pre-1.0 project. Waves 1-8 and 12 are genuinely done. Waves 9-11 have partial gaps. Ongoing items (P3, P4, D8, NX2, NX7) are correctly tracked as non-blocking.

---

## Per-Wave Status

| Wave   | Theme                           | Status                | Key Notes                                                                                               |
| ------ | ------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------- |
| **1**  | Core + Next + E2E               | ✅ Shipped            | Exit criteria met. `seo({ title })` works, E2E comprehensive, no public `any`.                          |
| **2**  | OG Generator                    | ✅ Shipped            | 1200×630 PNG, light/dark, CLI, templates.                                                               |
| **3**  | Icons + Manifest                | ✅ Shipped            | 7 output sizes, favicon.ico, manifest, CLI.                                                             |
| **4**  | Distribution                    | ✅ Shipped            | Changesets, size-limit, README, examples, CI.                                                           |
| **5**  | React + Validation              | ✅ Shipped            | Helmet adapter, `useSEO`, `validateSEO`, `renderTags`, golden tests.                                    |
| **6**  | Rules / Scale                   | ✅ Shipped            | Glob matching, `seoRoute`, `seoLayout`/`seoPage`, `onRenderTags`.                                       |
| **7**  | Content Compiler                | ✅ Shipped            | `fromContent`, `fromMdx`, CLI `content from-mdx`. Partial: no auto-schema generation.                   |
| **8**  | Snapshots + Preview             | ✅ Shipped (baseline) | Snapshot, compare, preview HTML, `--open`. Partial: CSS approximations, not real platform rendering.    |
| **9**  | TUI + Init + Templates + Doctor | 🟨 Partial            | TUI fires, all commands work. Missing: `template switch` (L10). No tests for `init`/`doctor`/`migrate`. |
| **10** | Automation (add/scan/fix)       | 🟨 Partial            | Commands work with tests. Gap: regex-based, not AST-first (overclaim in PRD/PROGRESS.md).               |
| **11** | Design System + Assets          | 🟨 Partial            | Splash + palette tokens shipped. Missing: Tailwind config parsing, `generateSplash` has zero tests.     |
| **12** | Crawl + Migration + Docs        | ✅ Shipped            | Full crawl suite (robots, sitemap, RSS, Atom, llms.txt, sitemap-index). Partial: NX2/NX7 docs-only.     |

---

## Critical Gaps (P0 — Must Fix)

| #   | Gap                                                                 | Impact                                                      | Fix                                                         |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | **"AST-first" is false** — scan/add/fix/codemods use regex, not AST | Credibility risk if marketed to enterprise                  | Remove "AST-first" language everywhere; say "pattern-based" |
| 2   | **`template switch` (L10) not implemented**                         | PRD exit criteria unmet; users hit dead end                 | Implement non-destructive merge or remove from docs         |
| 3   | **`package-lock.json` sync in CI**                                  | `npm ci` fails on GitHub Actions due to stale optional deps | Regenerate lock file without optional deps                  |
| 4   | **PROGRESS.md claims Nextra docs site exists**                      | Contradicts reality; `apps/` dir deleted                    | Update PROGRESS.md to reflect static HTML docs              |
| 5   | **PROGRESS.md claims "packaged plugins shipped"**                   | No `better-seo-plugin-*` packages exist                     | Update PROGRESS.md; mark P4 as Ongoing                      |

---

## Medium Gaps (P1 — Should Fix)

| #   | Gap                                                   | Impact                                                                        | Fix                                  |
| --- | ----------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------ |
| 6   | **`generateSplash` has zero tests**                   | Wave 11 exit criteria unmet                                                   | Add tests for all 9 splash sizes     |
| 7   | **Tailwind config parsing not implemented**           | Wave 11/A5 "design system" claim unmet                                        | Implement or revise PRD claim        |
| 8   | **No tests for `runInit`, `runDoctor`, `runMigrate`** | Core CLI commands untested                                                    | Add unit tests                       |
| 9   | **`doctor` is shallow**                               | Only checks package.json presence, not version ranges or adapter registration | Add deeper checks                    |
| 10  | **README lacks visual proof**                         | PRD §4.4 requires before/after OG/icon images                                 | Embed `test-og.png` and icon outputs |
| 11  | **`snapshot compare` has no structured diff**         | Only "files differ" message, no field-level detail                            | Add structured JSON diff output      |
| 12  | **`migrate` CLI only prints hints**                   | No actual file transformation (codemods exist but aren't invoked)             | Wire codemods into CLI migrate       |
| 13  | **NX2 (Pages Router) lacks dedicated recipe**         | PRD positions Pages Router as P0                                              | Add copy-paste recipe                |
| 14  | **NX7 (i18n) lacks dedicated recipe**                 | i18n is a key enterprise feature                                              | Add `[locale]/` route recipe         |

---

## Minor Gaps (P2 — Nice to Fix)

| #   | Gap                                                            | Impact                                                                   |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 15  | **Core size limit not at PRD target**                          | 10KB gzip vs PRD's 5KB target                                            |
| 16  | **No industry-specific examples**                              | Wave 4 says "begin extra examples"; only nextjs-app and react-vite exist |
| 17  | **CHANGELOG 0.1.0 is duplicated text**                         | Same paragraph repeated 6 times                                          |
| 18  | **No `seo.auto()` implementation**                             | By design per Roadmap; documented                                        |
| 19  | **D8 Playground does not exist**                               | By design ("nice later"); no impact                                      |
| 20  | **`BETTER_SEO_CI` and `BETTER_SEO_NO_TUI` env gates untested** | Only `CI=true` has a test                                                |
| 21  | **`cli scan` missing `--dry-run` flag**                        | Listed in PRD but not implemented                                        |
| 22  | **`cli add` missing `--safe` and `--interactive` flags**       | Listed in PRD but not implemented                                        |
| 23  | **`cli fix` missing `--interactive` flag**                     | Listed in PRD but not implemented                                        |

---

## Architecture Compliance

| Gate                                          | Status                              |
| --------------------------------------------- | ----------------------------------- |
| `@better-seo/core` has zero runtime deps      | ✅ PASS                             |
| No `fs` in core                               | ✅ PASS (only in `./node` export)   |
| `serializeJSONLD` runs all JSON-LD output     | ✅ PASS                             |
| Edge-safe core                                | ✅ PASS                             |
| Adapters use `registerAdapter`                | ✅ PASS                             |
| No public `any` in `.d.ts`                    | ✅ PASS                             |
| `renderTags` returns stable `TagDescriptor[]` | ✅ PASS                             |
| Core within size budget                       | ⚠️ PARTIAL (10KB vs 5KB PRD target) |

---

## TUI Audit

| Command                                           | Status     | Notes                               |
| ------------------------------------------------- | ---------- | ----------------------------------- |
| `better-seo` (no args, TTY)                       | ✅ Fires   | Clack menu with framework detection |
| `og`                                              | ✅ Works   | All flags supported                 |
| `icons`                                           | ✅ Works   | All flags supported                 |
| `splash`                                          | ✅ Works   | iOS/iPadOS sizes                    |
| `crawl robots`                                    | ✅ Works   | Writes robots.txt                   |
| `crawl sitemap`                                   | ✅ Works   | Writes sitemap.xml                  |
| `crawl rss`                                       | ✅ Works   | Writes RSS feed                     |
| `crawl atom`                                      | ✅ Works   | Writes Atom feed                    |
| `crawl llms`                                      | ✅ Works   | Writes llms.txt                     |
| `crawl sitemap-index`                             | ✅ Works   | Writes sitemap index                |
| `snapshot`                                        | ✅ Works   | Writes tags JSON                    |
| `snapshot compare`                                | ✅ Works   | JSON equality check                 |
| `preview`                                         | ✅ Works   | HTML with social blocks             |
| `preview --open`                                  | ✅ Works   | Respects env gates                  |
| `analyze`                                         | ✅ Works   | validateSEO with exit codes         |
| `scan`                                            | ✅ Works   | Regex-based detection               |
| `add`                                             | ✅ Works   | Per-file injection                  |
| `fix`                                             | ✅ Works   | Auto-remediation                    |
| `doctor`                                          | ✅ Works   | Env + package checks                |
| `init`                                            | ✅ Works   | Install + snippet output            |
| `migrate`                                         | ✅ Works   | Hint text only                      |
| `template list`                                   | ✅ Works   | All 5 presets                       |
| `template print`                                  | ✅ Works   | Prints defineSEO snippet            |
| `template preview`                                | ✅ Works   | HTML output                         |
| `template switch`                                 | ❌ Missing | Not implemented                     |
| `content from-mdx`                                | ✅ Works   | MDX frontmatter extraction          |
| `--no-interactive` / `-y`                         | ✅ Works   | Blocks TUI                          |
| `CI=true` / `BETTER_SEO_CI` / `BETTER_SEO_NO_TUI` | ✅ Works   | All 6 env vars gated                |

---

## Dogfood Results

**13/13 tests passing.** See [`DOGFOOD.md`](./DOGFOOD.md) for details.

---

## Recommended Action Plan

### Phase 1: Credibility (Week 1)

1. Remove "AST-first" language from PROGRESS.md, README, and all docs
2. Implement or remove `template switch` from docs
3. Update PROGRESS.md to reflect actual state (static HTML docs, no Nextra)
4. Regenerate `package-lock.json` and verify `npm ci` works

### Phase 2: Enterprise Bar (Week 2-3)

5. Add tests for `generateSplash` (all 9 sizes)
6. Add tests for `runInit`, `runDoctor`, `runMigrate`
7. Deepen `doctor` checks (version ranges, adapter registration)
8. Implement `--dry-run` for `scan`, `--safe`/`--interactive` for `add`/`fix`

### Phase 3: Polish (Week 4)

9. Add Pages Router recipe (NX2)
10. Add i18n recipe (NX7)
11. Wire codemods into `migrate` CLI command
12. Add structured diff output to `snapshot compare`
13. Embed OG/icon visual proof in README
14. Ship at least one `better-seo-plugin-*` package

---

_This audit was generated by 5 specialized agents analyzing the full codebase against all internal documentation._
