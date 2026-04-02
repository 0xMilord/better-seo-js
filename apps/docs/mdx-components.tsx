import type { MDXComponents } from "nextra/mdx-components"
import { useMDXComponents as useDocsThemeComponents } from "nextra-theme-docs"

export function useMDXComponents(components: MDXComponents) {
  return useDocsThemeComponents(components)
}
