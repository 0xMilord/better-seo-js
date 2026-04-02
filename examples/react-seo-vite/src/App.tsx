import { createSEO } from "@better-seo/core"
import { BetterSEOHelmet } from "@better-seo/react"
import { useMemo } from "react"

export default function App() {
  const seo = useMemo(
    () =>
      createSEO({
        title: "Vite React SEO Demo",
        description: "E2E fixture for @better-seo/react (Wave 5).",
        canonical: "https://example.test/",
      }),
    [],
  )
  return (
    <>
      <BetterSEOHelmet seo={seo} />
      <main>
        <h1>Demo</h1>
      </main>
    </>
  )
}
