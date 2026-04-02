import { afterEach, describe, expect, it, vi } from "vitest"
import { createSEO } from "../core.js"
import { SEOError } from "../errors.js"
import {
  detectFramework,
  getAdapter,
  getDefaultAdapter,
  listAdapterIds,
  registerAdapter,
} from "./registry.js"

describe("adapter registry", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it("registers and retrieves by id", () => {
    const id = `reg-${Math.random().toString(36).slice(2)}`
    registerAdapter({ id, toFramework: () => ({ ok: true }) })
    const a = getAdapter<{ ok: boolean }>(id)
    expect(a?.toFramework(createSEO({ title: "x" }))).toEqual({ ok: true })
    expect(listAdapterIds()).toContain(id)
  })

  it("throws when adapter is not an object", () => {
    expect(() => registerAdapter(null as never)).toThrow(SEOError)
  })

  it("throws on empty adapter id", () => {
    expect(() => registerAdapter({ id: "", toFramework: () => ({}) })).toThrow(SEOError)
  })

  it("throws on id longer than 64 chars", () => {
    expect(() => registerAdapter({ id: "a".repeat(65), toFramework: () => ({}) })).toThrow(SEOError)
  })

  it("throws on id with invalid characters", () => {
    expect(() => registerAdapter({ id: "next/bad", toFramework: () => ({}) })).toThrow(SEOError)
  })

  it("warns when overriding an existing adapter id", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const id = `dup-${Math.random().toString(36).slice(2)}`
    registerAdapter({ id, toFramework: () => ({ v: 1 }) })
    registerAdapter({ id, toFramework: () => ({ v: 2 }) })
    expect(warn).toHaveBeenCalled()
    expect(getAdapter<{ v: number }>(id)?.toFramework(createSEO({ title: "x" }))).toEqual({
      v: 2,
    })
  })

  it("detectFramework returns next when NEXT_RUNTIME is set", () => {
    vi.stubEnv("NEXT_RUNTIME", "edge")
    expect(detectFramework()).toBe("next")
  })

  it("getDefaultAdapter returns registered adapter for detected framework", () => {
    registerAdapter({ id: "next", toFramework: () => ({ ok: true }) })
    vi.stubEnv("NEXT_RUNTIME", "edge")
    expect(getDefaultAdapter<{ ok: boolean }>()?.toFramework(createSEO({ title: "x" }))).toEqual({
      ok: true,
    })
  })
})
