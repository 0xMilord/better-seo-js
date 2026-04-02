# React SPA + `react-helmet-async` (Wave 5 — V3, **FEATURES §6**)

For **Vite**, CRA-style, or other **client-rendered** React apps where Next.js `metadata` does not exist.

## Install

```bash
npm install @better-seo/core @better-seo/react react-helmet-async
```

## Minimal pattern

```tsx
// main.tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HelmetProvider } from "react-helmet-async"
import App from "./App"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
```

```tsx
// App.tsx
import { createSEO } from "@better-seo/core"
import { BetterSEOHelmet } from "@better-seo/react"
import { useMemo } from "react"

export default function App() {
  const seo = useMemo(() => createSEO({ title: "My app", description: "…" }), [])
  return (
    <>
      <BetterSEOHelmet seo={seo} />
      <main>…</main>
    </>
  )
}
```

## Parity rule

**`toHelmetProps`** is implemented by mapping **`renderTags`** output → Helmet `title` / `meta` / `link` / `script`. Same **`createSEO`** pipeline as Next — only the **transport** (Helmet vs `Metadata`) changes.

## Example in this repo

Golden **Playwright** path: [**`examples/react-seo-vite`**](../../examples/react-seo-vite/README.md) (`npm run test:e2e -w react-seo-vite-example` from root after `npm run build`).

## Future framework adapters

Remix, Astro, and Nuxt are tracked on the Roadmap (Wave 5 stubs / docs). See [**Future adapters**](../adapters/future-frameworks.md).
