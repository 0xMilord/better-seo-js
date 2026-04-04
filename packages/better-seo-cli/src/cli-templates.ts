/**
 * Wave 9 — industry presets (L9) + **`defineSEO`** (C18) snippets.
 * Wave 9 L10 — **`template switch`** non-destructive merge with existing config.
 */
import { parseArgs } from "node:util"
import { defineSEO, mergeSEO, createSEO, type SEOInput, type SEOConfig } from "@better-seo/core"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { runPreview } from "./cli-devtools.js"
import { existsSync } from "node:fs"

export const TEMPLATE_IDS = ["blog", "docs", "saas", "ecommerce", "portfolio"] as const
export type TemplateId = (typeof TEMPLATE_IDS)[number]

function isTemplateId(s: string): s is TemplateId {
  return (TEMPLATE_IDS as readonly string[]).includes(s)
}

const blog = defineSEO({
  title: "My blog",
  description: "Articles, notes, and updates.",
  openGraph: { type: "website", siteName: "My blog" },
})

const docs = defineSEO({
  title: "Documentation",
  description: "Product docs, guides, and API reference.",
  openGraph: { type: "website", siteName: "Docs" },
})

const saas = defineSEO({
  title: "Ship faster with Acme",
  description: "The modern platform for teams who care about SEO and speed.",
  openGraph: { type: "website", siteName: "Acme" },
  twitter: { card: "summary_large_image", site: "@acme" },
})

const ecommerce = defineSEO({
  title: "Shop / Store",
  description: "Quality products with fast checkout.",
  openGraph: { type: "website", siteName: "Our store" },
})

const portfolio = defineSEO({
  title: "Portfolio",
  description: "Selected work and contact information.",
  openGraph: { type: "website" },
})

function presetFor(id: TemplateId): SEOInput {
  switch (id) {
    case "blog":
      return blog
    case "docs":
      return docs
    case "saas":
      return saas
    case "ecommerce":
      return ecommerce
    case "portfolio":
      return portfolio
    default: {
      const _x: never = id
      return _x
    }
  }
}

export function getTemplateSEOInput(id: string): SEOInput | undefined {
  return isTemplateId(id) ? presetFor(id) : undefined
}

/**
 * Find an existing better-seo config file (TS or JS).
 */
function findConfigFile(cwd: string): string | null {
  const candidates = [
    join(cwd, "better-seo.config.ts"),
    join(cwd, "better-seo.config.js"),
    join(cwd, "better-seo.config.mjs"),
  ]
  for (const c of candidates) {
    if (existsSync(c)) return c
  }
  return null
}

/**
 * Generate a better-seo.config.ts file from a merged SEO input.
 */
function generateConfigFile(input: SEOInput, config: SEOConfig): string {
  return `import { defineSEO, type SEOConfig } from "@better-seo/core"

export const seoInput = defineSEO(${JSON.stringify(input, null, 2)})

export const seoConfig: SEOConfig = ${JSON.stringify(config, null, 2)}
`
}

/**
 * Attempt to parse an existing config file to extract SEOInput and SEOConfig.
 * This is a best-effort approach — we look for the exported variables.
 */
async function parseExistingConfig(
  configPath: string,
): Promise<{ input: SEOInput; config: SEOConfig } | null> {
  try {
    const content = await readFile(configPath, "utf8")

    // Try to extract seoInput and seoConfig from the file
    const inputMatch = content.match(
      /export\s+const\s+seoInput\s*=\s*(\{[\s\S]*?\})\s*(?:as const)?/m,
    )
    const configMatch = content.match(
      /export\s+const\s+seoConfig\s*:\s*SEOConfig\s*=\s*(\{[\s\S]*?\})\s*(?:as const)?/m,
    )

    if (inputMatch) {
      const input = JSON.parse(inputMatch[1]) as SEOInput
      const config = configMatch ? (JSON.parse(configMatch[1]) as SEOConfig) : {}
      return { input, config }
    }
  } catch {
    // Parse failed — fall back to defaults
  }
  return null
}

function printTemplateHelp(): void {
  console.log(`Industry SEO presets (Wave 9 / L9) + defineSEO (C18).

Usage:
  better-seo template list
  better-seo template print <id>    ${TEMPLATE_IDS.join(" | ")}
  better-seo template preview <id> [--out preview.html] [--open]
  better-seo template switch <id>   [--out better-seo.config.ts] [--dry-run]

switch merges the template preset with existing config (non-destructive).
preview writes a head fixture HTML (same as better-seo preview).
`)
}

export async function runTemplate(rest: string[]): Promise<number> {
  try {
    const { positionals, values } = parseArgs({
      args: rest,
      options: {
        out: { type: "string" as const },
        open: { type: "boolean" as const, default: false },
        "dry-run": { type: "boolean" as const, default: false },
        help: { type: "boolean" as const, short: "h", default: false },
      },
      allowPositionals: true,
    })
    if (values.help || positionals.length === 0) {
      printTemplateHelp()
      return positionals.length === 0 ? 1 : 0
    }
    const sub = positionals[0]
    const id = positionals[1]
    if (sub === "list") {
      console.log(TEMPLATE_IDS.join("\n"))
      return 0
    }
    if (sub === "print") {
      if (!id || !isTemplateId(id)) {
        console.error(`template print: need id (${TEMPLATE_IDS.join(", ")})`)
        return 1
      }
      const preset = presetFor(id)
      console.log(
        `import { createSEO, defineSEO } from "@better-seo/core"\n\nconst base = defineSEO(${JSON.stringify(preset, null, 2)} as const)\n\nexport const seo = createSEO(base, { baseUrl: "https://example.com" })\n`,
      )
      return 0
    }
    if (sub === "switch") {
      if (!id || !isTemplateId(id)) {
        console.error(`template switch: need id (${TEMPLATE_IDS.join(", ")})`)
        return 1
      }
      const templateInput = presetFor(id)
      const cwd = process.cwd()
      const existingPath = findConfigFile(cwd)

      let mergedInput: SEOInput = templateInput
      let mergedConfig: SEOConfig = { baseUrl: "https://example.com" }

      if (existingPath) {
        const existing = await parseExistingConfig(existingPath)
        if (existing) {
          // Merge: template provides defaults, existing overrides
          const config: SEOConfig = {
            ...existing.config,
            baseUrl: existing.config.baseUrl || "https://example.com",
          }
          const seo = createSEO(existing.input, config)
          const merged = mergeSEO(seo, templateInput, config)
          mergedInput = merged as unknown as SEOInput
          mergedConfig = config
          console.log(`Merged template "${id}" with existing config: ${existingPath}`)
        } else {
          console.log(`Found config but could not parse: ${existingPath}. Starting fresh.`)
        }
      }

      const outPath = (values.out as string)?.trim() || join(cwd, "better-seo.config.ts")
      const content = generateConfigFile(mergedInput, mergedConfig)

      if (values["dry-run"]) {
        console.log(`[dry-run] Would write ${outPath}:`)
        console.log(content)
        return 0
      }

      await mkdir(dirname(outPath), { recursive: true })
      await writeFile(outPath, content, "utf8")
      console.log(`Wrote ${outPath}`)
      return 0
    }
    if (sub === "preview") {
      if (!id || !isTemplateId(id)) {
        console.error(`template preview: need id (${TEMPLATE_IDS.join(", ")})`)
        return 1
      }
      const preset = presetFor(id)
      const dir = tmpdir()
      const jsonPath = join(dir, `better-seo-template-${id}-${Date.now()}.json`)
      await writeFile(jsonPath, `${JSON.stringify(preset, null, 2)}\n`, "utf8")
      const outHtml = values.out?.trim() || join(dir, `better-seo-preview-${id}-${Date.now()}.html`)
      await mkdir(dirname(outHtml), { recursive: true })
      const code = await runPreview([
        "--input",
        jsonPath,
        "--out",
        outHtml,
        ...(values.open ? ["--open"] : []),
      ])
      return code
    }
    console.error(`Unknown template subcommand "${sub}". Use list | print | preview | switch`)
    return 1
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}
