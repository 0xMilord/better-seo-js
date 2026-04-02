import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { runCli } from "./run-cli.js"

vi.mock("@better-seo/assets", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@better-seo/assets")>()
  return {
    ...actual,
    generateOG: vi.fn().mockRejectedValue(new Error("generateOG failed")),
  }
})

describe("runCli when generateOG fails", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("exits 1 and prints message", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {})
    const out = join(tmpdir(), `cli-fail-${Date.now()}.png`)
    const code = await runCli(["node", "cli", "og", "Hi", "--out", out])
    expect(code).toBe(1)
    expect(err).toHaveBeenCalledWith("generateOG failed")
    err.mockRestore()
  })
})
