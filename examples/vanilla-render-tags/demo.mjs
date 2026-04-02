import { createSEO, renderTags, webPage } from "@better-seo/core"

const baseUrl = "https://example.com"

const seo = createSEO(
  {
    title: "Vanilla tag demo",
    description: "No framework — just renderTags + serialize-ready SEO.",
    canonical: "/demo",
    schema: [
      webPage({
        name: "Vanilla tag demo",
        description: "Shows the core → HTML head mapping without React.",
        url: `${baseUrl}/demo`,
      }),
    ],
  },
  { defaultTitle: "Demo site", baseUrl, titleTemplate: "%s | Demo site" },
)

const tags = renderTags(seo)
console.log(JSON.stringify(tags.slice(0, 5), null, 2))
console.log(`… ${tags.length} tag descriptors total (see @better-seo/core renderTags).`)
