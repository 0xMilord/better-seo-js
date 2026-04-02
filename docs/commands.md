---
title: CLI commands
description: better-seo CLI reference — TUI, og, icons, crawl, snapshot, preview, content, template, doctor, init, migrate.
---

# `better-seo` CLI — command reference & implementation matrix

**Onboarding:** For what the CLI is for and how it maps to **`@better-seo/assets`** / **`@better-seo/crawl`**, start with [CLI overview](./cli/index.md).

This document is the **published CLI reference** for the monorepo: commands that ship in [`@better-seo/cli`](../packages/better-seo-cli/), what they do, suggested onboarding order, and what is covered by automated tests vs interactive-only paths.

**Related:** [`@better-seo/cli` README](../packages/better-seo-cli/README.md) · [Recipes](./recipes/index.md) · [Monorepo README](../README.md)

---

## TUI (interactive launcher)

The CLI can open a **terminal UI** built with [**@clack/prompts**](https://github.com/bombshell-dev/clack): arrows to move, Enter to confirm, and a clean step-by-step flow for common tasks. All of that lives in **`@better-seo/cli`** only (not in **`@better-seo/core`**).

### When the TUI runs

| Situation                                                   | What happens                                                                                                            |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `npx better-seo` or `better-seo` with **no subcommand**     | If **stdin and stdout** are both TTYs and you are **not** forcing non-interactive (below), the **launcher menu** opens. |
| Same command in **CI**, or **piped** output, or **non-TTY** | No menu: **help** is printed and the process exits with code **1** (same as “no subcommand” in automation).             |
| **`better-seo og …`**, **`icons`**, **`crawl`**, etc.       | Always **non-interactive** argv mode for that subcommand (no full-screen menu).                                         |

### Turning the TUI off (or skipping it)

Use any of these when you need **scripts, CI, or predictable output**:

| Mechanism                                                                                          | Effect                                                                   |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **`--no-interactive`**, **`-y`**, or **`--yes`** as the **first** argument (before any subcommand) | TUI never runs. With **no** subcommand, you get **help** and exit **1**. |
| **`CI=true`** or **`CI=1`**                                                                        | TUI disabled (same as above for bare `better-seo`).                      |
| **`BETTER_SEO_CI=1`** or **`true`**                                                                | Same intent: **no launcher**.                                            |
| **`BETTER_SEO_NO_TUI=1`** or **`true`**                                                            | **No launcher**, without implying a full CI environment.                 |

**Examples:**

```bash
# Interactive menu (local terminal)
npx better-seo

# Skip menu; still run OG non-interactively
npx better-seo --no-interactive og "Hello" -o ./public/og.png

# CI-friendly: no menu on bare invoke
CI=1 npx better-seo
```

### Launcher menu (what each option does)

After a short **intro** and a **welcome note** (trying to detect **Next.js** vs **React** from the current **`package.json`**), you choose one row:

| Menu item                        | Behavior                                                                                                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Generate OG image**            | Prompts: title, optional site name, output path, theme (default / light / dark / auto) → runs the same **`generateOG`** path as **`better-seo og`**.                                                    |
| **Generate favicon + PWA icons** | Prompts: source file, output directory, whether to write **`manifest.json`**, then manifest fields (name, short name, `start_url`, `display`, optional `theme_color`) → same as **`better-seo icons`**. |
| **Snapshot / preview / analyze** | Prompts for **`seo.json`** (and output paths). Runs **`snapshot`**, **`preview`** (optional **`--open`**), or **`analyze`** — Wave 8–10 trust tools.                                                    |
| **MDX → SEO JSON**               | Prompts for a **`.md` / `.mdx`** file and output **`.json`**. Runs **`content from-mdx`** (**`@better-seo/compiler`**, Wave 7 / C17).                                                                   |
| **Industry SEO preset**          | Chooses **blog / docs / saas / ecommerce / portfolio** (or list only). Prints **`defineSEO`** snippet (**`template print`**, Wave 9 / L9).                                                              |
| **Robots / sitemap / feeds**     | Does **not** run **`crawl`** in the TUI. Shows **copy-paste** examples (**robots** through **sitemap-index**) and points here + [Next robots & sitemap recipe](./recipes/sitemap-robots-next.md).       |
| **Run environment doctor**       | Runs **`doctor`**. **`--json`** includes **`nodeMeetsEngineRange`** (Node 24+ vs repo **`engines`**).                                                                                                   |
| **Show install & snippet**       | **Next** vs **React** (detected framework listed first), then **`init`** output (same as **`better-seo init --framework=…`**).                                                                          |
| **Migration hints (next-seo)**   | Prints the **from-next-seo** hint block (same as **`better-seo migrate from-next-seo`**).                                                                                                               |
| **Exit**                         | Closes with a short goodbye; exit code **0**.                                                                                                                                                           |

**Cancel:** follow **Clack** behavior (**Ctrl+C** / cancel) — the CLI exits with code **1** and shows a cancelled message.

After a successful action (except **Exit**), you’ll see a **Done.** outro. Failures from **OG** / **icons** propagate their usual exit codes.

### TUI vs `--help`

- **`better-seo --help`** is parsed as a **subcommand** **`--help`**: you get the **global help** text and exit **0**; the TUI does **not** open.
- **`better-seo` alone** in a TTY opens the **menu**, not the full help sheet.

---

## 1. Order of run

### 1.1 Recommended onboarding order (first hour → production)

| Step | Action                                  | Typical surface                                                                                                   |
| ---- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1    | **Install core + adapter**              | `npm i @better-seo/core @better-seo/next` (or `@better-seo/react`)                                                |
| 2    | **`init`** (install lines + snippet)    | `npx better-seo init` (auto-detect from `package.json`) or `--framework next\|react`; optional `--preset blog\|…` |
| 3    | **Wire `metadata` / Helmet**            | App code (`seo()`, `prepareNextSeo`, …) — not the CLI                                                             |
| 4    | **Validate in dev/CI**                  | `validateSEO` (dev), **`doctor`**                                                                                 |
| 5    | **OG + icons (assets)**                 | **`og`**, **`icons`** → `@better-seo/assets`                                                                      |
| 6    | **Crawl artifacts**                     | **`crawl`** (robots, sitemap, rss, atom, llms, sitemap-index) or App Router recipes + `@better-seo/crawl`         |
| 7    | **Trust / validation**                  | **`snapshot`**, **`preview`**, **`analyze`** ( **`validateSEO`** gate in CI )                                     |
| 8    | **Migration** (if coming from next-seo) | **`migrate from-next-seo`** + core **`fromNextSeo`**                                                              |
| 9    | **Automation** (roadmap)                | **`add` / `scan` / `fix`** — not shipped yet                                                                      |

Heavy or repo-scanning work stays in **CLI or build-time** so **`@better-seo/core`** stays suitable for Edge bundles.

### 1.2 Rough delivery phases (CLI-focused)

Indicative ordering only; the matrix below reflects **what exists in this repo today**.

| Phase | Theme                           | CLI-relevant notes                                                                      |
| ----- | ------------------------------- | --------------------------------------------------------------------------------------- |
| Early | Core + Next + E2E               | Voilà is `seo()` in the app; CLI optional                                               |
| Mid   | Assets                          | **`og`**, **`icons`**                                                                   |
| Mid   | Distribution                    | npm, README, examples                                                                   |
| Later | Snapshots / preview             | **`snapshot`**, **`preview`**, **`analyze`** — baseline shipped                         |
| Later | TUI + **`init`** + **`doctor`** | Launcher (trust / content / template / …), **`doctor`** with **`nodeMeetsEngineRange`** |
| Later | Automation                      | **`add` / `scan` / `fix`** — planned                                                    |
| Later | Crawl + migrate depth           | **`crawl`**, codemod-style **`migrate`** — partial today                                |

---

## 2. Command catalog

| Command / surface                              | What it does                            | How it works                                                                                                                        |
| ---------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **(no subcommand, TTY)**                       | Interactive menu                        | **`@better-seo/cli`** + **@clack/prompts**. OG/icons may load **`@better-seo/assets`**; trust commands are non-interactive only.    |
| **`og <title>`**                               | **1200×630** Open Graph PNG             | CLI → **`@better-seo/assets`** `generateOG` → file write.                                                                           |
| **`icons <source>`**                           | Favicons + optional **`manifest.json`** | CLI → **`generateIcons`**.                                                                                                          |
| **`crawl robots`**                             | **robots.txt** body                     | CLI → **`@better-seo/crawl`** `renderRobotsTxt` → file write.                                                                       |
| **`crawl sitemap`**                            | **urlset** sitemap XML                  | CLI → **`renderSitemapXml`**; URLs from **`--loc`** (repeatable).                                                                   |
| **`crawl rss`**                                | **RSS 2.0** XML                         | CLI → **`renderRssXml`**; **`--title`**, **`--link`** required; optional **`--items`** JSON file.                                   |
| **`crawl atom`**                               | **Atom** XML                            | CLI → **`renderAtomFeed`**; **`--title`**, **`--link`**, **`--id`**, **`--updated`** required; optional **`--entries`** JSON.       |
| **`crawl llms`**                               | **`llms.txt`** body                     | CLI → **`renderLlmsTxt`**; **`--title`** required; optional **`--summary`**, **`--url`** (repeatable).                              |
| **`crawl sitemap-index`**                      | **Sitemap index** XML                   | CLI → **`renderSitemapIndexXml`**; **`--sitemap`** URLs (repeatable).                                                               |
| **`snapshot`**                                 | **`renderTags`** JSON fixture           | **`--input`**, **`--out`** or **`--output`**; **`--out-dir`** + **`--snapshot-file`** (default **`tags.json`**); **`compare a b`**. |
| **`preview`**                                  | **HTML** `<head>` + L6-style blocks     | Same inputs as snapshot; **`--open`** opens default browser unless **`CI`** / **`BETTER_SEO_NO_OPEN`**.                             |
| **`analyze`**                                  | **`validateSEO`** gate                  | Loads **`SEOInput`** from **`--input`**; exit **1** on **`error`**-severity issues.                                                 |
| **`content from-mdx`**                         | Frontmatter + body → **SEOInput JSON**  | **`@better-seo/compiler`** **`fromMdx`**; **`--input`**, **`--out`**.                                                               |
| **`template`**                                 | **`list` / `print` / `preview`**        | Industry presets + **`defineSEO`** (C18); **`template preview`** delegates to **`preview`**.                                        |
| **`doctor`**                                   | Environment + deps check                | Warns if Node &lt; 24; **`--json`** adds **`nodeMeetsEngineRange`** and **`packages`** (incl. **`compiler`**).                      |
| **`init`**                                     | Install lines + snippet                 | Optional **`--framework`** (else detect from **`package.json`**); optional **`--preset`**.                                          |
| **`migrate from-next-seo`**                    | Migration hints                         | Points to **`fromNextSeo`**; not a full codemod yet.                                                                                |
| **`splash`**, **`add`**, **`scan`**, **`fix`** | Planned / PRD                           | **Not** shipped in the CLI.                                                                                                         |

### 2.1 Crawl library-only (programmatic)

| Capability                     | Status                                                     |
| ------------------------------ | ---------------------------------------------------------- |
| **`defaultSitemapUrlFromSEO`** | In **`@better-seo/crawl`** for programmatic use.           |
| **RSS / Atom / llms / index**  | Implemented in **`@better-seo/crawl`**; CLI mirrors above. |

---

## 3. Global flags & environment

Summary table; for **when the launcher runs**, **examples**, and **menu items**, see **[TUI (interactive launcher)](#tui-interactive-launcher)** above.

| Mechanism                                                         | Effect                                                      |
| ----------------------------------------------------------------- | ----------------------------------------------------------- |
| **`--no-interactive`**, **`-y`**, **`--yes`** (before subcommand) | Skip TUI.                                                   |
| **`CI`**, **`BETTER_SEO_CI`**, **`BETTER_SEO_NO_TUI`**            | No launcher; bare **`better-seo`** prints help, exit **1**. |
| **`BETTER_SEO_NO_OPEN`**                                          | **`preview --open`** does not spawn a browser.              |
| **TTY + stdin/stdout**                                            | Required for the menu when no subcommand is passed.         |

---

## 4. Implementation & TUI matrix

| Command / surface                      | Automated CLI tests | TUI                          |
| -------------------------------------- | ------------------- | ---------------------------- |
| Launcher (no args)                     | Yes (mocked)        | Yes                          |
| **`og`**                               | Yes                 | Yes (prompts)                |
| **`icons`**                            | Yes                 | Yes (prompts)                |
| **`crawl`** (all subcommands)          | Yes                 | Stub (copy-paste + pointers) |
| **`snapshot` / `preview` / `analyze`** | Yes                 | Yes (trust menu)             |
| **`content`**                          | Yes                 | Yes (MDX → JSON flow)        |
| **`template`**                         | Yes                 | Yes (preset snippet)         |
| **`doctor`**                           | Yes                 | Yes                          |
| **`init`**                             | Yes                 | Yes                          |
| **`migrate from-next-seo`**            | Yes                 | Yes                          |
| **Planned** (`splash`, `add`, …)       | No                  | No                           |

**E2E** here means Vitest coverage and, where noted in the CLI README, smoke tests on the built **`dist/cli.cjs`**.

---

## 5. Contract

When this file and the CLI disagree, treat **`better-seo --help`** and the sources under **`packages/better-seo-cli/src/`** as the runtime contract. Maintainer-facing checklists stay in the repository’s contributor docs (see **CONTRIBUTING.md**), not in published **`docs/`** links.

---

## 6. See also

- [Recipes index](./recipes/index.md) — OG, icons, Next.js sitemap/robots
- [`docs/compare/next-seo-vs-better-seo.md`](./compare/next-seo-vs-better-seo.md) — migration context
