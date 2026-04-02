import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  inferSEOConfigFromEnvAndPackageJson,
  readPackageJsonForSEO,
  resetSEOConfigForTests,
} from "./node.js"

describe("@better-seo/core/node inference", () => {
  afterEach(() => {
    resetSEOConfigForTests()
    vi.unstubAllEnvs()
  })

  it("readPackageJsonForSEO reads name and homepage", () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-"))
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({
        name: "my-app",
        homepage: "https://ex.test/docs",
        description: "App",
      }),
    )
    expect(readPackageJsonForSEO(dir)).toEqual({
      name: "my-app",
      homepage: "https://ex.test/docs",
      description: "App",
    })
  })

  it("inferSEOConfigFromEnvAndPackageJson prefers env over package homepage", () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-"))
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "x", homepage: "https://pkg.test" }),
    )
    vi.stubEnv("SITE_URL", "https://env.test")
    expect(inferSEOConfigFromEnvAndPackageJson(dir)).toEqual({
      baseUrl: "https://env.test",
      titleTemplate: "%s | x",
    })
  })

  it("inferSEOConfigFromEnvAndPackageJson derives baseUrl from homepage when no env", () => {
    const dir = mkdtempSync(join(tmpdir(), "better-seo-"))
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name: "y", homepage: "https://origin.test/path" }),
    )
    expect(inferSEOConfigFromEnvAndPackageJson(dir).baseUrl).toBe("https://origin.test")
  })
})
