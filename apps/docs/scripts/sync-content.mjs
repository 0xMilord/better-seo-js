/**
 * Copies canonical documentation from the monorepo `docs/` tree into `apps/docs/content/`
 * for Nextra’s content directory convention (PRD §8.6 — single source in-repo).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** Monorepo `docs/` — three levels up from `apps/docs/scripts/`. */
const REPO_DOCS = path.resolve(__dirname, "../../../docs")
const DEST = path.resolve(__dirname, "../content")

if (!fs.existsSync(REPO_DOCS)) {
  console.error("sync-content: missing", REPO_DOCS)
  process.exit(1)
}

fs.rmSync(DEST, { recursive: true, force: true })
fs.mkdirSync(DEST, { recursive: true })
fs.cpSync(REPO_DOCS, DEST, { recursive: true })
console.log("sync-content: copied docs/ → apps/docs/content/")
