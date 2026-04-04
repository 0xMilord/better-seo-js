# DOGFOOD.md — Testing better-seo.js on Itself

**Purpose:** Prove the SEO infra works by applying it to our own docs site and repo. If we can't dogfood our own product, nobody should use it.

---

## Test 1: GitHub Pages Docs Site SEO ✅

The docs site at `https://0xmilord.github.io/better-seo-js/` uses better-seo.js for its root metadata and JSON-LD.

### What to Verify

| Check                                                 | Expected | Actual |
| ----------------------------------------------------- | -------- | ------ |
| `<title>` contains "better-seo.js"                    | ✅       | ✅     |
| `<meta name="description">` is present                | ✅       | ✅     |
| `<meta property="og:title">` is present               | ✅       | ✅     |
| `<meta property="og:description">` is present         | ✅       | ✅     |
| `<meta property="og:type">` is "website"              | ✅       | ✅     |
| `<meta property="og:locale">` is "en_US"              | ✅       | ✅     |
| `<meta name="twitter:card">` is "summary_large_image" | ✅       | ✅     |
| `<link rel="canonical">` points to correct URL        | ✅       | ✅     |
| `<meta name="robots">` is "index,follow"              | ✅       | ✅     |
| JSON-LD `SoftwareApplication` schema is present       | ✅       | ✅     |
| JSON-LD `Organization` schema is present              | ✅       | ✅     |
| JSON-LD `WebSite` schema is present                   | ✅       | ✅     |

### How to Test

```bash
# Fetch the docs site
curl -s https://0xmilord.github.io/better-seo-js/ | grep -oP '(?<=<title>)[^<]+'

# Check for meta tags
curl -s https://0xmilord.github.io/better-seo-js/ | grep -oP '<meta[^>]+(?:name|property)="(?:description|og:title|og:description|twitter:card)"[^>]+content="[^"]+"[^>]*/?>'

# Check for JSON-LD
curl -s https://0xmilord.github.io/better-seo-js/ | grep -oP '<script type="application/ld\+json">.*?</script>' | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); const m=d.match(/<script[^>]*>([\s\S]*?)<\/script>/); if(m) JSON.parse(m[1]); console.log('Valid JSON-LD');"
```

### Result

**PASS** — The docs site renders correct SEO tags via the static HTML generator. All meta tags, OG, Twitter, canonical, robots, and JSON-LD are present and valid.

---

## Test 2: CLI `better-seo og` Generates Valid OG Image ✅

```bash
# Generate an OG image for the docs site
npx @better-seo/cli og "better-seo.js Docs" -o ./public/og.png --site-name "better-seo.js" --theme dark
```

### What to Verify

| Check               | Expected                |
| ------------------- | ----------------------- |
| Output file exists  | `./public/og.png`       |
| File size > 0       | Yes (typically 10-30KB) |
| Dimensions          | 1200×630                |
| Contains title text | Yes                     |
| Contains site name  | Yes                     |

### Result

**PASS** — OG image generation works. The Satori + Resvg pipeline produces valid 1200×630 PNGs with light/dark themes.

---

## Test 3: CLI `better-seo icons` Generates Favicon Set ✅

```bash
npx @better-seo/cli icons --input ./test-og.png --out ./public --no-manifest
```

### What to Verify

| Output               | File |
| -------------------- | ---- |
| favicon.ico          | ✅   |
| icon-16.png          | ✅   |
| icon-32.png          | ✅   |
| icon-192.png         | ✅   |
| icon-512.png         | ✅   |
| apple-touch-icon.png | ✅   |
| maskable-icon.png    | ✅   |

### Result

**PASS** — All 7 files generated with correct dimensions.

---

## Test 4: CLI `better-seo scan` Detects Our Own Setup ✅

```bash
# Scan our own codebase
cd examples/nextjs-app
npx @better-seo/cli scan . --framework next
```

### Expected Output

```
Scanning 8 files...
  ✅ app/layout.tsx   — has metadata
  ✅ app/page.tsx     — has metadata
  ✅ app/blog/[slug]/page.tsx — has generateMetadata
  ...
```

### Result

**PASS** — Scan correctly identifies files with and without SEO metadata.

---

## Test 5: CLI `better-seo doctor` Validates Environment ✅

```bash
npx @better-seo/cli doctor
```

### Expected Output

```
✅ Node.js >= 24: v24.x.x
✅ @better-seo/core: found
✅ @better-seo/next: found
✅ @better-seo/react: found
```

### Result

**PASS** — Doctor checks pass for the repo environment.

---

## Test 6: CLI `better-seo snapshot` Captures SEO State ✅

```bash
# Capture snapshot of current SEO state
npx @better-seo/cli snapshot --input ./seo-input.json --output ./snapshot-before.json

# Make a change
echo '{"title":"Changed"}' > ./seo-input.json

# Capture again
npx @better-seo/cli snapshot --input ./seo-input.json --output ./snapshot-after.json

# Compare
npx @better-seo/cli snapshot compare ./snapshot-before.json ./snapshot-after.json
```

### Expected

Exit code 1 (files differ) after making a change.

### Result

**PASS** — Snapshot capture and comparison work.

---

## Test 7: CLI `better-seo crawl robots` Generates robots.txt ✅

```bash
npx @better-seo/cli crawl robots --out ./public/robots.txt --sitemap https://0xmilord.github.io/better-seo-js/sitemap.xml
```

### Expected Output

```
User-agent: *
Allow: /
Sitemap: https://0xmilord.github.io/better-seo-js/sitemap.xml
```

### Result

**PASS** — robots.txt generated correctly.

---

## Test 8: CLI `better-seo crawl sitemap` Generates sitemap.xml ✅

```bash
npx @better-seo/cli crawl sitemap --out ./public/sitemap.xml \
  --url https://0xmilord.github.io/better-seo-js/ \
  --url https://0xmilord.github.io/better-seo-js/getting-started/ \
  --url https://0xmilord.github.io/better-seo-js/concepts/
```

### Expected

Valid XML with `<urlset>` and 3 `<url>` entries.

### Result

**PASS** — sitemap.xml generated correctly.

---

## Test 9: CLI TUI Launches in TTY ✅

```bash
# In an interactive terminal:
npx @better-seo/cli
```

### Expected

Clack-based interactive menu with options:

- Quick start
- Generate OG image
- Generate icons
- Crawl (robots, sitemap, rss, atom, llms, sitemap-index)
- Trust tools (snapshot, preview, analyze)
- Doctor
- Init
- Migrate
- Exit

### Result

**PASS** — TUI launches correctly. Respects `--no-interactive`, `CI=true`, `BETTER_SEO_NO_TUI=1`.

---

## Test 10: Next.js Example App E2E ✅

```bash
cd examples/nextjs-app
npm run test:e2e
```

### Expected

All 17 Playwright tests pass:

- Home page emits correct SEO tags
- Rich results (JSON-LD, OG, Twitter, hreflang, canonical, robots, favicon)
- Dynamic blog route has correct metadata
- with-seo page has merged layout + page SEO

### Result

**PASS** — E2E tests pass on CI (locally requires Playwright browsers).

---

## Test 11: React SPA Example E2E ✅

```bash
cd examples/react-seo-vite
npm run test:e2e
```

### Expected

Helmet title and description reflect SEO config.

### Result

**PASS** — E2E tests pass on CI.

---

## Test 12: Core Size Budget ✅

```bash
npm run size
```

### Expected

Core bundle within size limit (currently 18KB per package.json, 10KB gzip per CI check).

### Result

**PASS** — Core is within budget.

---

## Test 13: `createSEO` → `mergeSEO` → `serializeJSONLD` Pipeline ✅

```ts
import { createSEO, mergeSEO, serializeJSONLD, webPage, organization } from "@better-seo/core"

const config = { baseUrl: "https://example.com", titleTemplate: "%s | Site" }
const layout = createSEO({ title: "Home", schema: [organization({ name: "Site" })] }, config)
const page = mergeSEO(layout, { title: "About", schema: [webPage({ name: "About" })] }, config)

console.log(page.meta.title) // "About"
console.log(page.schema.length) // 2
console.log(serializeJSONLD(page.schema)) // Valid JSON-LD string
```

### Result

**PASS** — Full pipeline works end-to-end.

---

## Summary

| Test                          | Result  |
| ----------------------------- | ------- |
| 1. Docs site SEO              | ✅ PASS |
| 2. OG image generation        | ✅ PASS |
| 3. Icon generation            | ✅ PASS |
| 4. Codebase scan              | ✅ PASS |
| 5. Environment doctor         | ✅ PASS |
| 6. Snapshot capture + compare | ✅ PASS |
| 7. robots.txt generation      | ✅ PASS |
| 8. sitemap.xml generation     | ✅ PASS |
| 9. TUI launcher               | ✅ PASS |
| 10. Next.js E2E               | ✅ PASS |
| 11. React SPA E2E             | ✅ PASS |
| 12. Core size budget          | ✅ PASS |
| 13. Full pipeline             | ✅ PASS |

**13/13 tests passing.** better-seo.js successfully dogfoods its own SEO infrastructure.

---

## Known Gaps from Audit (Not Blocking Dogfood)

1. **CLI `template switch` not implemented** — Can't test template merging on our own docs.
2. **`generateSplash` has no tests** — iOS splash generation untested.
3. **`scan`/`add`/`fix` are regex-based, not AST-first** — Works on our codebase but may miss complex patterns.
4. **Tailwind config parsing not implemented** — `ogPaletteFromTokens` requires manual token input.
5. **`migrate` CLI only prints hints** — No actual file transformation for next-seo migration.
