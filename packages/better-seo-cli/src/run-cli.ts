import { writeFile } from "node:fs/promises"
import { parseArgs } from "node:util"
import { generateOG } from "better-seo-assets"
import type { OGTheme } from "better-seo-assets"

function printHelp(): void {
  console.log(`better-seo — CLI for better-seo.js (optional packages)

Usage:
  better-seo og <title> [options]

Options:
  --out, -o          Output PNG path (default: og.png)
  --site-name        Site label in card header (default: "better-seo.js")
  --description, -d  Subtitle text
  --theme            light | dark | auto (default: light; auto → light in Node)
  --logo             Local file path or https URL for the logo image
  --help, -h         Show help

Examples:
  npx better-seo-cli og "Hello World"
  npx better-seo-cli og "Ship faster" -o ./public/og.png --site-name "Acme"
  npx better-seo og "Hello World"
`)
}

function parseTheme(s: string | undefined): OGTheme | undefined {
  if (s === undefined) return undefined
  if (s === "light" || s === "dark" || s === "auto") return s
  throw new Error(`Invalid --theme "${s}". Use light, dark, or auto.`)
}

const ogCommandOptions = {
  out: { type: "string" as const, short: "o", default: "og.png" },
  "site-name": { type: "string" as const, default: "better-seo.js" },
  description: { type: "string" as const, short: "d" },
  theme: { type: "string" as const },
  logo: { type: "string" as const },
  help: { type: "boolean" as const, short: "h", default: false },
}

/**
 * Main entry for tests and the `better-seo` bin. Returns process exit code.
 */
export async function runCli(argv: readonly string[]): Promise<number> {
  const program = argv[2]

  if (program === undefined) {
    printHelp()
    return 1
  }

  if (program === "-h" || program === "--help") {
    printHelp()
    return 0
  }

  if (program !== "og") {
    console.error(`Unknown command "${program}". Run \`better-seo --help\`.`)
    return 1
  }

  const rest = argv.slice(3)

  let values: {
    out?: string
    "site-name"?: string
    description?: string
    theme?: string
    logo?: string
    help?: boolean
  }
  let positionals: string[]

  try {
    const parsed = parseArgs({
      args: rest,
      options: ogCommandOptions,
      allowPositionals: true,
    })
    values = parsed.values
    positionals = parsed.positionals
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }

  if (values.help === true) {
    printHelp()
    return 0
  }

  const title = positionals[0]
  if (!title) {
    console.error('Missing <title>. Example: better-seo og "Hello World"')
    return 1
  }

  let theme: OGTheme | undefined
  try {
    theme = parseTheme(values.theme)
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }

  const out = values.out ?? "og.png"
  const siteName = values["site-name"] ?? "better-seo.js"

  try {
    const started = performance.now()
    const png = await generateOG({
      title,
      siteName,
      ...(values.description !== undefined ? { description: values.description } : {}),
      ...(theme !== undefined ? { theme } : {}),
      ...(values.logo !== undefined ? { logo: values.logo } : {}),
    })
    await writeFile(out, png)
    const ms = Math.round(performance.now() - started)
    console.log(`Wrote ${out} (${png.byteLength} bytes) in ${ms}ms`)
    return 0
  } catch (e) {
    console.error(e instanceof Error ? e.message : e)
    return 1
  }
}
