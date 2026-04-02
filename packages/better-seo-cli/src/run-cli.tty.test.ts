import { readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import * as clack from "@clack/prompts"
import { runCli } from "./run-cli.js"

vi.mock("@clack/prompts", () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  cancel: vi.fn(),
  isCancel: vi.fn(() => false),
  select: vi.fn(),
  text: vi.fn(),
  confirm: vi.fn(),
}))

describe("runCli TTY / launcher", () => {
  const stdoutTTY = Object.getOwnPropertyDescriptor(process.stdout, "isTTY")
  const stdinTTY = Object.getOwnPropertyDescriptor(process.stdin, "isTTY")
  const prevCi = process.env.CI
  const prevNoTui = process.env.BETTER_SEO_NO_TUI

  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.CI
    delete process.env.BETTER_SEO_NO_TUI
  })

  afterEach(() => {
    if (stdoutTTY) Object.defineProperty(process.stdout, "isTTY", stdoutTTY)
    else delete (process.stdout as { isTTY?: boolean }).isTTY
    if (stdinTTY) Object.defineProperty(process.stdin, "isTTY", stdinTTY)
    else delete (process.stdin as { isTTY?: boolean }).isTTY
    if (prevCi === undefined) delete process.env.CI
    else process.env.CI = prevCi
    if (prevNoTui === undefined) delete process.env.BETTER_SEO_NO_TUI
    else process.env.BETTER_SEO_NO_TUI = prevNoTui
  })

  it("no subcommand + non-TTY prints help and exits 1", async () => {
    Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: false })
    Object.defineProperty(process.stdin, "isTTY", { configurable: true, value: false })
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli"])).toBe(1)
    expect(log.mock.calls.join("\n")).toContain("better-seo")
    log.mockRestore()
  })

  it("no subcommand + TTY opens launcher (exit path)", async () => {
    Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: true })
    Object.defineProperty(process.stdin, "isTTY", { configurable: true, value: true })
    vi.mocked(clack.select).mockResolvedValueOnce("exit" as never)
    expect(await runCli(["node", "cli"])).toBe(0)
  })

  it("CI=true skips launcher", async () => {
    process.env.CI = "true"
    Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: true })
    Object.defineProperty(process.stdin, "isTTY", { configurable: true, value: true })
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli"])).toBe(1)
    log.mockRestore()
  })

  it("--no-interactive with no subcommand prints help (exit 1)", async () => {
    Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: true })
    Object.defineProperty(process.stdin, "isTTY", { configurable: true, value: true })
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    expect(await runCli(["node", "cli", "--no-interactive"])).toBe(1)
    log.mockRestore()
  })

  it("-y before og still runs og", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const out = join(tmpdir(), `cli-og-noint-${Date.now()}.png`)
    try {
      expect(await runCli(["node", "cli", "-y", "og", "Hi", "--out", out])).toBe(0)
      const buf = readFileSync(out)
      expect(buf[0]).toBe(0x89)
    } finally {
      rmSync(out, { force: true })
      log.mockRestore()
    }
  })
})
