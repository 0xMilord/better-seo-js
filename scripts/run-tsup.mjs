/**
 * Run tsup from the current package directory without relying on node_modules/.bin
 * shims (Windows + spaced paths often break `tsup` / `npm exec -- tsup`).
 *
 * Resolves the CLI via `tsup`’s package.json `bin` so layout changes (e.g. cli-main.js)
 * and workspace hoisting still work.
 */
import { spawnSync } from "node:child_process"
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(scriptsDir, "..")
const cwd = process.cwd()

function resolveTsupCli() {
  for (const base of [root, cwd]) {
    try {
      const pkgJsonPath = require.resolve("tsup/package.json", { paths: [base] })
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"))
      const bin = pkg.bin
      const rel = typeof bin === "string" ? bin : bin?.tsup
      if (typeof rel === "string" && rel.length > 0) {
        const normalized = rel.replace(/^\.\//, "")
        return path.join(path.dirname(pkgJsonPath), normalized)
      }
    } catch {
      /* try next base */
    }
  }
  for (const spec of ["tsup/dist/cli-default.js", "tsup/dist/cli-main.js"]) {
    for (const base of [root, cwd]) {
      try {
        return require.resolve(spec, { paths: [base] })
      } catch {
        /* continue */
      }
    }
  }
  throw new Error(
    `run-tsup: could not resolve tsup CLI from "${cwd}" or monorepo root "${root}". Run npm ci from the repo root.`,
  )
}

const tsupCli = resolveTsupCli()
const result = spawnSync(process.execPath, [tsupCli], { stdio: "inherit", cwd })
process.exit(result.status === null ? 1 : result.status)
