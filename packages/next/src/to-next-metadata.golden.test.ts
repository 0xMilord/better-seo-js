import { createSEO, webPage, article } from "@better-seo/core"
import { describe, expect, it } from "vitest"
import { toNextMetadata } from "./to-next-metadata.js"

/** Golden output for adapter contract / regressions (FEATURES §2, Roadmap Wave 5). */
describe("toNextMetadata golden", () => {
  it("matches stable JSON shape for rich document", () => {
    const doc = createSEO(
      {
        title: "Golden article",
        description: "A fixture for snapshots.",
        canonical: "https://gold.test/article",
        openGraph: {
          type: "article",
          url: "https://gold.test/article",
          siteName: "Gold fixture",
          locale: "en_US",
          publishedTime: "2026-01-15T12:00:00.000Z",
          authors: ["https://gold.test/authors/jane"],
          section: "Engineering",
          tags: ["seo", "fixture"],
          images: [{ url: "https://gold.test/og.png", width: 1200, height: 630, alt: "OG" }],
        },
        twitter: {
          card: "summary_large_image",
          site: "@gold_fixture",
          creator: "@jane",
          title: "Golden article",
          description: "Twitter desc",
        },
        schema: [
          webPage({
            name: "Golden article",
            description: "A fixture for snapshots.",
            url: "https://gold.test/article",
          }),
          article({
            headline: "Golden article",
            description: "Article body summary.",
            url: "https://gold.test/article",
          }),
        ],
      },
      { baseUrl: "https://gold.test" },
    )
    const m = toNextMetadata(doc)
    expect(JSON.parse(JSON.stringify(m))).toEqual({
      title: "Golden article",
      description: "A fixture for snapshots.",
      alternates: { canonical: "https://gold.test/article" },
      openGraph: {
        title: "Golden article",
        description: "A fixture for snapshots.",
        url: "https://gold.test/article",
        type: "article",
        siteName: "Gold fixture",
        locale: "en_US",
        publishedTime: "2026-01-15T12:00:00.000Z",
        authors: ["https://gold.test/authors/jane"],
        section: "Engineering",
        tags: ["seo", "fixture"],
        images: [{ url: "https://gold.test/og.png", width: 1200, height: 630, alt: "OG" }],
      },
      twitter: {
        card: "summary_large_image",
        site: "@gold_fixture",
        creator: "@jane",
        title: "Golden article",
        description: "Twitter desc",
        images: ["https://gold.test/og.png"],
      },
    })
  })
})
