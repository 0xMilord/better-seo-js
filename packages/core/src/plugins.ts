import type { SEO, SEOConfig, SEOInput, SEOPlugin, TagDescriptor } from "./types.js"

export function defineSEOPlugin(plugin: SEOPlugin): SEOPlugin {
  return plugin
}

export function runBeforeMergePlugins(input: SEOInput, config?: SEOConfig): SEOInput {
  const list = config?.plugins ?? []
  let acc = input
  for (const p of list) {
    acc = p.beforeMerge?.(acc, { config }) ?? acc
  }
  return acc
}

export function runAfterMergePlugins(seo: SEO, config?: SEOConfig): SEO {
  const list = config?.plugins ?? []
  let acc = seo
  for (const p of list) {
    acc = p.afterMerge?.(acc, { config }) ?? acc
  }
  return acc
}

export function runOnRenderTagPlugins(
  tags: readonly TagDescriptor[],
  seo: SEO,
  config?: SEOConfig,
): TagDescriptor[] {
  const list = config?.plugins ?? []
  let acc: TagDescriptor[] = [...tags]
  for (const p of list) {
    const next = p.onRenderTags?.(acc, { seo, config })
    if (next !== undefined) acc = [...next]
  }
  return acc
}
