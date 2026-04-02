/**
 * Run size-limit without relying on node_modules/.bin (Windows + spaced paths).
 */
import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const cwd = process.cwd()

function resolveBin() {
  for (const base of [cwd, root]) {
    try {
      const pkg = require.resolve("size-limit/package.json", { paths: [base] })
      return path.join(path.dirname(pkg), "bin.js")
    } catch {
      /* try next */
    }
  }
  throw new Error("run-size-limit: could not resolve size-limit from " + cwd + " or " + root)
}

const result = spawnSync(process.execPath, [resolveBin()], { stdio: "inherit", cwd })
process.exit(result.status === null ? 1 : result.status)
