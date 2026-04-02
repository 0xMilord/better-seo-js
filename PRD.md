# better-seo.js — Product Requirements Document

> **A programmable SEO engine for modern apps — not just tags, but structured discoverability.**

**Expanded Vision:**
> **SEO + Discovery Surface Automation for modern apps**

You're not just optimizing for Google. You're optimizing for:
- Google Search
- Twitter/X previews
- LinkedIn shares
- Slack previews
- PWA installs
- Every surface where your app is discovered

---

## 0. The "Voilà" Principle (Read This First)

> **Time-to-value = everything**

If a dev can't go from *install → working SEO on a page* in under **60 seconds**, they will uninstall and crawl back to whatever they were using.

### The 60-Second Benchmark

```bash
npm install better-seo.js
```

```ts
// app/page.tsx
import { seo } from "better-seo.js"

export const metadata = seo({ title: "Home" })
```

**It must just work.**

No config ceremony. No mental overhead. No "where does this go?"

---

### The 3 Levels of Effort (Same API, Different Depth)

| Level | Code | Use Case |
|-------|------|----------|
| 🟢 **Lazy** | `export const metadata = seo()` | Auto-infers from route |
| 🟡 **Normal** | `export const metadata = seo({ title: "Dashboard" })` | Override title |
| 🔴 **Power** | `export const metadata = seo({ meta: {...}, openGraph: {...}, schema: [...] })` | Full control |

---

### The Real Product

You're not building:
> "SEO config system"

You're building:
> **"Attach SEO to any page in seconds, and improve it over time."**

Everything else is retention. This is acquisition.

---

## 1. Executive Summary

### 1.1 Problem Statement

Current SEO solutions for React/Next.js fall into two categories:

| Solution | Problem |
|----------|---------|
| **next-seo** | Static config mindset, no system thinking, zero feedback loop |
| **React Helmet** | Manual everything, no abstraction, caveman SEO |
| **Next.js Metadata API** | Low-level primitive, no schema system, just a rendering layer |

**Result:** Developers have helpers, not infrastructure. No unified model. No extensibility.

---

### 1.2 Solution

**better-seo.js** is a **unified SEO document model** that:

- Normalizes SEO into a single source of truth
- Renders to multiple outputs (React, Next.js, vanilla)
- Treats structured data (JSON-LD) as a core primitive, not an add-on
- Provides fallback logic and cross-layer consistency out of the box

---

### 1.3 Positioning

> **Next SEO, but actually complete.**

Target audience: Next.js/React developers building production apps who need complete SEO coverage without boilerplate.

---

## 2. Product Goals

### 2.1 Primary Goals

| Goal | Success Metric |
|------|----------------|
| **Complete SEO coverage** | Supports meta, OG, Twitter, JSON-LD in one object |
| **Zero configuration** | Works with inferred defaults from `package.json` + env |
| **Framework agnostic** | Core engine + adapter pattern (React, Next.js, vanilla) |
| **Extensible by design** | Supports any schema.org type without library updates |
| **60-second voila** | Install → working SEO in under 60 seconds |

### 2.2 Non-Goals

| Non-Goal | Rationale |
|----------|-----------|
| Analytics/tracking | Post-facto observation, not build-time infrastructure |
| AI-generated content | Out of scope for v1 |
| Visual UI components | This is a headless engine |
| Sitemap generation | Separate concern, may add as extension later |

### 2.3 Product Pyramid (Priority Order)

| Level | Feature | Purpose |
|-------|---------|---------|
| **Level 1 (Acquisition)** | `seo({ title })` | Get them in the door |
| **Level 2 (Trust)** | merge + defaults + correctness | Keep them confident |
| **Level 3 (Delight)** | OG + icons generator | Make them say "wow" |
| **Level 4 (Power)** | CLI automation | Lock them in |

**Critical:** Ship Level 1 before Level 4. Most teams build backwards and die.

---

## 3. Technical Architecture

### 3.1 Core Abstraction: The SEO Object

```ts
type SEO = {
  meta: {
    title: string
    description?: string
    canonical?: string
    robots?: string
    
    // Link relations
    alternates?: {
      languages?: Record<string, string>  // hreflang: { "en-US": "/en/page", "es-ES": "/es/page" }
      canonical?: string
    }
    
    pagination?: {
      prev?: string
      next?: string
    }
    
    verification?: {
      google?: string
      bing?: string
      yandex?: string
      pinterest?: string
      facebook?: string
    }
  }

  openGraph?: {
    title?: string
    description?: string
    images?: Array<{
      url: string
      width?: number
      height?: number
      alt?: string
    }>
    type?: "website" | "article" | "product" | "video" | "music" | "book"
    url?: string
    siteName?: string
    locale?: string
  }

  twitter?: {
    card?: "summary" | "summary_large_image"
    title?: string
    description?: string
    image?: string
    site?: string
    creator?: string
  }

  schema?: JSONLD[]
}
```

**Design rationale:**
- Three channels: Search, Social, Structured
- Each channel is optional except `meta.title`
- Flat structure, no nested builders
- Link relations for i18n/enterprise
- OG images as array for platform consistency
- Verification tags to prevent leakage to native APIs

---

### 3.2 JSON-LD System

#### Base Type

```ts
type JSONLD = {
  "@context": "https://schema.org"
  "@type": string
  [key: string]: any
}
```

#### Schema Helpers (v1)

```ts
WebPage(data: Partial<JSONLD>): JSONLD
Article(data: Partial<JSONLD>): JSONLD
Product(data: Partial<JSONLD>): JSONLD
Organization(data: Partial<JSONLD>): JSONLD
Person(data: Partial<JSONLD>): JSONLD
BreadcrumbList(data: Partial<JSONLD>): JSONLD
FAQPage(data: Partial<JSONLD>): JSONLD
```

#### Custom Schema Support

```ts
CustomSchema({ "@type": "Dataset", ...data }): JSONLD
```

**Design rationale:**
- Cover 80% of use cases with helpers
- Allow 20% edge cases via escape hatch
- No need to update library for new schema types

---

### 3.3 Builder Engine

```ts
function createSEO(input: Partial<SEO>, config: SEOConfig): SEO

type SEOConfig = {
  defaultTitle: string
  description?: string
  baseUrl?: string
  defaultImage?: string
  
  // Title composition
  titleTemplate?: string  // "%s | Site Name" or "%s - Site Name"
  
  // Default robots
  defaultRobots?: string
}
```

**Fallback logic:**
- `openGraph.title` → `meta.title`
- `twitter.image` → `openGraph.images[0]?.url`
- `canonical` → `baseUrl + path`
- `robots` → `config.defaultRobots ?? "index,follow"`
- `title` → apply `titleTemplate` if provided

---

### 3.4 Merge Strategy (Layout + Page Composition)

```ts
function mergeSEO(parent: SEO, child: Partial<SEO>): SEO
```

**Merge rules:**
| Field | Strategy |
|-------|----------|
| `meta.title` | Child overrides |
| `meta.description` | Child overrides |
| `meta.alternates.languages` | Deep merge |
| `openGraph.images` | Child overrides |
| `schema` | Concatenate (no dedup by default) |
| All other scalars | Child overrides |

**Use case:**
```ts
// layout.tsx
const layoutSEO = createSEO({
  meta: { title: "Home" }
}, config)

// page.tsx
const pageSEO = mergeSEO(layoutSEO, {
  meta: { title: "About" }  // Final: "About | Site Name"
})
```

---

### 3.5 Dev Warnings & Validation (Lightweight)

```ts
// Optional dev-only warnings (stripped in production)
function validateSEO(seo: SEO, config: ValidationConfig): ValidationError[]

type ValidationConfig = {
  enableWarnings?: boolean  // default: true in dev
  titleMaxLength?: number   // default: 60
  descriptionMaxLength?: number  // default: 160
  requireDescription?: boolean   // default: false
}

type ValidationError = {
  field: string
  message: string
  severity: "warning" | "error"
}
```

**Built-in checks:**
| Check | Trigger |
|-------|---------|
| Title length | `title.length > 60` |
| Description length | `description.length > 160` |
| Missing description | `!description` (if enabled) |
| OG image dimensions | `image.width < 1200` (warning) |
| Schema required fields | Missing `@type`, `@context` |

**Design rationale:**
- Zero runtime cost (dev-only)
- Catches common mistakes before production
- Doesn't block, just warns

---

### 3.6 Adapters

| Adapter | Output |
|---------|--------|
| **Next.js** | `Metadata` object for `generateMetadata()` |
| **React** | `<Helmet>` component props |
| **Vanilla** | Array of `{ type, content }` for manual injection |

---

### 3.7 Asset Generation Engine (Separate Module)

**Package:** `better-seo-assets` (optional install)

```ts
// Keep separate from core to maintain 5KB bundle
import { generateOG, generateIcons, generateManifest } from 'better-seo-assets'
```

#### OG Image Generator

```ts
type OGConfig = {
  title: string
  description?: string
  siteName: string
  logo?: string
  theme?: 'light' | 'dark' | 'auto'
  font?: string
  template?: string  // Custom template path
  colors?: {        // Auto-extracted from Tailwind config
    primary: string
    background: string
  }
}

function generateOG(config: OGConfig): Promise<Buffer>
```

**Modes:**
| Mode | Description |
|------|-------------|
| `auto` | Reads SEO object, generates clean card |
| `template` | Uses custom Satori/React template |
| `design-system` | Extracts colors/fonts from Tailwind config |

---

#### Icon & PWA Generator

```bash
npx better-seo icons ./logo.svg --output /public
```

**Outputs:**
```txt
/public
  favicon.ico
  icon-16.png
  icon-32.png
  icon-192.png
  icon-512.png
  apple-touch-icon.png
  maskable-icon.png
  manifest.json
```

**Config:**
```ts
type IconConfig = {
  source: string  // Path to source logo
  output: string  // Output directory
  sizes?: number[]  // Default: [16, 32, 192, 512]
  backgroundColor?: string
  manifest?: {
    name: string
    shortName: string
    startUrl: string
    display: 'standalone' | 'minimal-ui' | 'browser'
  }
}
```

---

#### Splash Screen Generator

```bash
npx better-seo splash --logo ./logo.svg --theme dark
```

**Outputs:**
- iOS launch images (multiple sizes)
- Android splash screens
- PWA splash assets

**Config:**
```ts
type SplashConfig = {
  logo: string
  backgroundColor: string
  theme?: 'light' | 'dark'
  platforms?: ('ios' | 'android')[]
}
```

---

### 3.8 File Structure

```
better-seo.js/
  core/
    types.ts        ← SEO + JSONLD types
    core.ts         ← createSEO(), mergeSEO()
    schema.ts       ← helpers (WebPage, Article, etc.)
    adapters.ts     ← next/react bindings
    render.ts       ← schema injection, tag rendering
    validate.ts     ← dev warnings & validation
    migrate.ts      ← migration utilities (fromNextSeo)
    voila.ts        ← Quick attach API (seo(), withSEO(), useSEO())
    singleton.ts    ← Global config (initSEO)
    compiler.ts     ← fromContent, fromMDX
    index.ts        ← public API

better-seo-assets/
  og/
    generator.ts    ← OG image generation
    templates.ts    ← Built-in templates
  icons/
    generator.ts    ← Icon resizing + output
    manifest.ts     ← manifest.json generation
  splash/
    generator.ts    ← Splash screen generation
  index.ts

better-seo-cli/
  core/
    tui.ts          ← TUI components (select, input, progress)
    theme.ts        ← CLI theme/styling
  commands/
    init.ts         ← Interactive setup wizard
    og.ts
    icons.ts
    splash.ts
    analyze.ts
    add.ts          ← Auto-inject SEO into pages
    scan.ts         ← Scan & fix
    snapshot.ts     ← Time-travel debugging
    preview.ts      ← Platform previews
    migrate.ts      ← Version migrations
  templates/
    nextjs/
      blog.ts       ← Blog SEO templates
      docs.ts       ← Documentation templates
      saas.ts       ← SaaS templates
      ecommerce.ts  ← E-commerce templates
    react/
      blog.ts
      saas.ts
    astro/
      blog.ts
    remix/
      blog.ts
  index.ts
```

**Design rationale:**
- Core stays lightweight (~5KB)
- Assets are optional (opt-in install)
- CLI orchestrates both with sleek TUI
- Templates provide opinionated starting points
- Voilà API is the "fast path" for adoption
- No dependency hell

---

### 3.9 Internal Design Requirements (For "Voilà" to Work)

To support the 60-second experience:

#### 1. Zero-Config Mode (True Zero)

```ts
// singleton.ts - with fallback inference
let globalConfig: SEOConfig | null = null

export function initSEO(config?: SEOConfig) {
  globalConfig = {
    defaultTitle: config?.defaultTitle ?? inferFromPackageJson(),
    baseUrl: config?.baseUrl ?? inferFromEnv(),
    titleTemplate: config?.titleTemplate ?? "%s",
    ...config
  }
}

function inferFromPackageJson(): string {
  // Reads package.json → name field
  // Falls back to "My App"
}

function inferFromEnv(): string {
  // Reads process.env.NEXT_PUBLIC_SITE_URL
  // Or process.env.VERCEL_URL
  // Falls back to "http://localhost:3000"
}

// Usage: NO config needed for basic usage
import { seo } from 'better-seo.js'
export const metadata = seo({ title: "Home" })  // Just works
```

**Design rationale:** If you force config upfront, you lose 50% of users instantly.

---

#### 2. Smart Defaults

| Input | Auto-Inferred |
|-------|---------------|
| No title | From route path (`/dashboard` → "Dashboard") |
| No OG | From `defaultImage` in config |
| No schema | Empty array (no error) |
| No description | From config fallback |
| No config | From `package.json` + env |

---

#### 3. Adapter Auto-Binding (With Escape Hatch)

```ts
// voila.ts
export function seo(
  input: Partial<SEO> = {},
  options?: { adapter?: 'next-app' | 'next-pages' | 'react' | 'vanilla' }
): Metadata {
  const config = getGlobalConfig()
  const seoObject = createSEO(input, config)

  // Auto-detect framework
  const adapter = options?.adapter ?? detectFramework()

  return renderForAdapter(seoObject, adapter)
}

function detectFramework(): string {
  // Check for next.config.js → Next.js
  // Check for vite.config.js → Vite
  // Check for remix.config.js → Remix
  // Fallback to vanilla
}
```

**Design rationale:** Auto-detect works 95% of the time. Escape hatch for edge cases.

---

#### 4. CLI File Injection (Idempotent + Safe)

```ts
// commands/add.ts
async function addSEOToPage(route: string, options: {
  dryRun?: boolean
  safe?: boolean
  interactive?: boolean
}) {
  const filePath = findPageFile(route)
  const existingContent = readFile(filePath)

  // Check if already has SEO (idempotency)
  if (existingContent.includes('seo(')) {
    console.log('SEO already exists in', filePath)
    return
  }

  const injectCode = `
import { seo } from 'better-seo.js'
export const metadata = seo({ title: "${capitalize(route)}" })
`

  if (options.dryRun) {
    console.log('Would inject:')
    console.log(injectCode)
    return
  }

  if (options.safe || options.interactive) {
    const confirmed = await prompt('Inject SEO into ' + filePath + '?')
    if (!confirmed) return
  }

  injectIntoFile(filePath, injectCode)
}
```

**CLI Flags:**
| Flag | Purpose |
|------|---------|
| `--dry-run` | Show what would change, don't modify |
| `--safe` | Skip files that already have SEO |
| `--interactive` | Prompt before each change |

**Design rationale:** Devs hate tools that "touch my code randomly". Trust = zero without escape hatches.

---

#### 5. Scan & Fix Logic (Idempotent)

```ts
// commands/scan.ts
async function scanForMissingSEO() {
  const pages = findAllPages()
  const missing = []

  for (const page of pages) {
    const content = readFile(page)

    // Check for existing SEO (idempotency)
    if (content.includes('seo(') || content.includes('metadata')) {
      continue  // Skip, already has SEO
    }

    missing.push(page)
  }

  return missing
}

async function fixMissingSEO(pages: string[], options: {
  dryRun?: boolean
  interactive?: boolean
}) {
  for (const page of pages) {
    await addSEOToPage(page, options)
  }
}
```

**Design rationale:** Running `fix` twice should not duplicate metadata or break imports.

---

#### 6. Asset Escape Hatches

```ts
// better-seo.config.ts
export default defineSEO({
  meta: { title: "My App" },

  // Disable specific asset generators
  og: false,  // or { disable: true }
  icons: false,
  splash: false,

  // Or configure
  og: {
    source: "auto",
    theme: "dark",
  }
})
```

**Design rationale:** Automation becomes lock-in without escape hatches.

---

#### 7. Versioning & Migration Strategy

```ts
// Package follows strict semver
{
  "name": "better-seo.js",
  "version": "1.0.0"  // MAJOR.MINOR.PATCH
}

// Migration logs for breaking changes
// CHANGELOG.md
## [2.0.0] - 2024-01-01
### Breaking
- `seo()` now requires `initSEO()` for custom config
- `og.image` renamed to `og.images` (array)

### Migration
Run `npx better-seo migrate` for automatic updates
```

**CLI Migration Command:**
```bash
npx better-seo migrate  # Auto-updates code for breaking changes
```

**Design rationale:** Touching file system + metadata = users get SEO regressions if API breaks. Strict semver + migration logs are mandatory.

---

#### 8. SEO Snapshots (Time-Travel + Debugging)

```ts
// commands/snapshot.ts
async function snapshot(route?: string, options?: {
  compare?: boolean  // Compare with previous snapshot
  output?: string    // Custom output directory
}) {
  const seo = createSEO(input, config)
  const snapshotData = {
    route,
    meta: seo.meta,
    openGraph: seo.openGraph,
    twitter: seo.twitter,
    schema: seo.schema,
    rendered: renderTags(seo),
    timestamp: new Date().toISOString()
  }

  // Save to /seo-snapshots/{route}.json
  saveSnapshot(route, snapshotData)

  if (options?.compare) {
    const previous = loadPreviousSnapshot(route)
    return diff(previous, snapshotData)
  }
}
```

**CLI Usage:**
```bash
npx better-seo snapshot                    # Snapshot all pages
npx better-seo snapshot /blog/my-post      # Snapshot specific page
npx better-seo snapshot --compare          # Show diff from last snapshot
```

**Output:**
```txt
/seo-snapshots/
  homepage.json
  dashboard.json
  blog-article.json
```

**Why this matters:**
| Benefit | Impact |
|---------|--------|
| Debugging | See exact rendered output without deploying |
| Regression protection | Diff snapshots to catch breaking changes |
| Audit trails | Version-controlled SEO for enterprise |
| CI/CD integration | Fail builds on SEO regressions |

**Design rationale:** SEO becomes testable + version-controlled. Replaces debugging tools, guesswork, and manual audits.

---

#### 9. SEO Middleware (Rule-Based Auto-Apply)

```ts
// singleton.ts
export function initSEO(config: SEOConfig & {
  rules?: SEORule[]
}) {
  globalConfig = config
}

export type SEORule = {
  match: string  // Glob pattern: "/blog/*", "/product/*"
  seo: Partial<SEO>
  priority?: number  // For overlapping rules
}

// voila.ts
export function seo(input: Partial<SEO> = {}): Metadata {
  const config = getGlobalConfig()
  const route = getCurrentRoute()

  // Apply matching rules
  const rulesSEO = applyRules(route, config.rules)

  // Merge: rules → input (input wins)
  const merged = mergeSEO(rulesSEO, input)

  const seoObject = createSEO(merged, config)
  return renderForAdapter(seoObject, detectFramework())
}

function applyRules(route: string, rules: SEORule[]): Partial<SEO> {
  const matching = rules.filter(rule => matchesGlob(route, rule.match))
  const sorted = matching.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

  // Merge all matching rules
  return sorted.reduce((acc, rule) => mergeSEO(acc, rule.seo), {})
}
```

**Usage:**
```ts
initSEO({
  defaultTitle: "My App",
  rules: [
    {
      match: "/blog/*",
      seo: {
        openGraph: { type: "article" },
        schema: [Article({ author: "Default Author" })]
      }
    },
    {
      match: "/product/*",
      seo: {
        openGraph: { type: "product" }
      }
    },
    {
      match: "/docs/*",
      seo: {
        robots: "noindex"  // Hide docs from search
      }
    }
  ]
})
```

**Why this matters:**
| Benefit | Impact |
|---------|--------|
| Scale | 1000 pages? No problem |
| No repetition | Define once, auto-apply |
| Predictable | Glob patterns, explicit rules |
| Override-safe | Page-level `seo()` still wins |

**Design rationale:** "Routing for SEO" — feels like magic but predictable. Replaces manual config, duplication, and human error.

---

#### 10. Content → SEO Compiler

```ts
// compiler.ts
export function fromContent(content: ContentInput): Partial<SEO> {
  return {
    meta: {
      title: content.title,
      description: generateDescription(content.body),
    },
    openGraph: {
      title: optimizeForOG(content.title),
      description: generateDescription(content.body),
    },
    schema: [
      Article({
        headline: content.title,
        description: generateDescription(content.body),
        author: content.author,
        datePublished: content.date,
      })
    ]
  }
}

function generateDescription(body: string): string {
  // Extract first paragraph or summarize
  // Truncate to 160 chars
}

function optimizeForOG(title: string): string {
  // Remove special chars
  // Ensure optimal length
}
```

**MDX Integration:**
```ts
// compiler.ts
export function fromMDX(mdx: MDXFile): Partial<SEO> {
  const frontmatter = mdx.frontmatter
  const headings = extractHeadings(mdx.body)

  return {
    meta: {
      title: frontmatter.title,
      description: frontmatter.excerpt ?? generateDescription(mdx.body),
    },
    schema: [
      Article({
        headline: frontmatter.title,
        description: frontmatter.excerpt,
        author: frontmatter.author,
        datePublished: frontmatter.date,
        wordCount: mdx.body.length,
      })
    ]
  }
}
```

**Usage:**
```ts
import { seo, fromContent, fromMDX } from 'better-seo.js'
import post from './my-post.mdx'

export const metadata = seo(fromMDX(post))
```

**Why this matters:**
| Benefit | Impact |
|---------|--------|
| No thinking | Devs provide content, you provide SEO |
| Consistent | Same logic across all pages |
| Future-proof | Foundation for AI enhancements |

**Design rationale:** Bridge between "I have content" and "I need SEO". Replaces manual writing, schema decisions, and optimization thinking.

---

#### 11. SEO Preview (Bonus Killer Feature)

```ts
// commands/preview.ts
async function preview(route: string, options?: {
  open?: boolean  // Auto-open browser
}) {
  const seo = getSEOForRoute(route)
  const previews = {
    google: renderGooglePreview(seo),
    twitter: renderTwitterPreview(seo),
    linkedin: renderLinkedInPreview(seo),
    slack: renderSlackPreview(seo),
  }

  // Generate HTML preview page
  const html = generatePreviewPage(previews)

  if (options?.open) {
    openInBrowser(html)
  }

  return html
}
```

**CLI Usage:**
```bash
npx better-seo preview /blog/my-post       # Preview all platforms
npx better-seo preview / --open            # Auto-open browser
```

**Output:**
- Side-by-side previews for Google, Twitter, LinkedIn, Slack
- Shows exactly how the page will appear when shared

**Why this matters:**
| Benefit | Impact |
|---------|--------|
| Instant feedback | No more deploy → check → redeploy loop |
| Demo magic | Show stakeholders in real-time |
| Debugging | Catch OG issues before production |

**Design rationale:** Saves hours of trial-and-error. Makes demos insanely effective.

---

#### 12. Interactive CLI & Installation Experience

**TUI Design Principles:**
| Principle | Implementation |
|-----------|----------------|
| **Sleek** | Modern colors, smooth animations, clear typography |
| **Fast** | < 500ms startup, lazy-load heavy operations |
| **Guided** | Step-by-step wizard, sensible defaults |
| **Safe** | Dry-runs, confirmations, undo options |

---

**Installation Wizard (`npx better-seo init`):**

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🚀 better-seo.js — Setup Wizard                       │
│                                                         │
│   Make your app look pro in 60 seconds.                 │
│                                                         │
└─────────────────────────────────────────────────────────┘

? Select your framework:
  ❯ Next.js (App Router)
    Next.js (Pages Router)
    React + Vite
    Astro
    Remix
    Nuxt
    Other (Manual Setup)

? What type of project is this?
  ❯ SaaS / Web App
    Blog / Content Site
    Documentation
    E-commerce
    Portfolio
    Other

? Enable asset generation? (OG images, icons, etc.)
  ❯ Yes, generate automatically
    No, I'll handle assets manually
    Ask me per-command

? Enable dev warnings? (title length, missing fields, etc.)
  ❯ Yes
    No

┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ⚙️  Generating configuration...                        │
│   ✓ Created better-seo.config.ts                        │
│   ✓ Installed @better-seo/core                          │
│   ✓ Installed @better-seo/next (adapter)                │
│   ✓ Installed @better-seo/assets (optional)             │
│                                                         │
│   🎉 Setup complete!                                    │
│                                                         │
│   Quick start:                                          │
│   export const metadata = seo({ title: "Home" })        │
│                                                         │
│   Run 'npx better-seo add /' to inject SEO              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Template System:**

Each template provides:
- Pre-configured SEO rules (middleware)
- Schema helpers for that use case
- OG image templates
- Sample content compiler config

**Templates:**

| Template | Includes |
|----------|----------|
| **blog** | Article schema, OG templates, RSS meta, author schema |
| **docs** | TechDoc schema, noindex for drafts, breadcrumb schema |
| **saas** | SoftwareApp schema, Product schema for features, FAQ schema |
| **ecommerce** | Product schema, Offer schema, Review schema, BreadcrumbList |
| **portfolio** | Person schema, CreativeWork schema, ImageObject schema |

**Template Config Output:**
```ts
// better-seo.config.ts (blog template)
import { defineSEO, Article } from 'better-seo.js'

export default defineSEO({
  template: 'blog',
  
  meta: {
    title: "My Blog",
    description: "Thoughts on tech and life",
  },

  rules: [
    {
      match: "/blog/*",
      seo: {
        openGraph: { type: "article" },
        schema: [Article({ author: "Default Author" })]
      }
    }
  ],

  og: {
    source: "auto",
    theme: "dark",
    template: "blog-card"
  },

  icons: {
    source: "./src/app/icon.svg"
  }
})
```

---

**Framework Detection (Auto):**

```ts
// cli/detect.ts
function detectFramework(): Framework {
  if (exists('next.config.js') || exists('next.config.mjs')) {
    return hasAppRouter() ? 'next-app' : 'next-pages'
  }
  if (exists('vite.config.ts') || exists('vite.config.js')) {
    return 'vite'
  }
  if (exists('astro.config.mjs')) {
    return 'astro'
  }
  if (exists('remix.config.js')) {
    return 'remix'
  }
  if (exists('nuxt.config.ts')) {
    return 'nuxt'
  }
  return 'unknown'
}
```

---

**Adapter Installation:**

```bash
# Auto-detected Next.js
Installing @better-seo/next...

# User can also install manually
npm install @better-seo/react
npm install @better-seo/astro
npm install @better-seo/remix
npm install @better-seo/nuxt
```

**Adapter Packages:**
| Adapter | Package | Provides |
|---------|---------|----------|
| Next.js (App) | `@better-seo/next` | `toNextMetadata()`, app router types |
| Next.js (Pages) | `@better-seo/next` | `toNextMetadata()`, pages router types |
| React | `@better-seo/react` | `toHelmetProps()`, hook components |
| Astro | `@better-seo/astro` | Astro component, head helpers |
| Remix | `@better-seo/remix` | `meta` export helpers |
| Nuxt | `@better-seo/nuxt` | Nuxt module, head helpers |

---

**CLI Commands with TUI:**

```bash
# Interactive mode (default)
npx better-seo init

# Non-interactive (CI/CD)
npx better-seo init --framework next-app --template saas --no-interactive

# Add SEO with TUI selection
npx better-seo add
# → Shows interactive route selector
# → Preview before inject

# Template switching
npx better-seo template switch
# → Select new template
# → Merges with existing config

# Template preview
npx better-seo template preview blog
# → Shows what the template includes
```

---

**Progress Indicators:**

```
┌─────────────────────────────────────────────────────────┐
│  Generating OG Images                                   │
│                                                         │
│  [████████████████░░░░░░░░] 60% | 12/20 pages          │
│                                                         │
│  Current: /blog/my-awesome-post                         │
│  ETA: 3s                                                │
└─────────────────────────────────────────────────────────┘
```

---

**Error Handling:**

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  Warning                                            │
│                                                         │
│  No logo found at /public/logo.svg                      │
│                                                         │
│  Options:                                               │
│  ❯ Use default placeholder                              │
│    Specify different path                               │
│    Skip OG generation                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Design rationale:**
- First impression matters — sleek TUI builds trust
- Guided setup reduces decision fatigue
- Templates provide opinionated best practices
- Framework-specific adapters keep core agnostic
- Auto-detect + manual override for edge cases

---

## 4. API Specification

### 4.1 Public API

```ts
// Core (better-seo.js)
import { createSEO, mergeSEO, type SEO, type SEOConfig } from 'better-seo.js'

// Schema helpers
import { WebPage, Article, Product, Organization, Person, BreadcrumbList, FAQPage } from 'better-seo.js'

// Adapters
import { toNextMetadata, toHelmetProps } from 'better-seo.js'

// Validation (dev-only)
import { validateSEO } from 'better-seo.js'

// Migration
import { fromNextSeo } from 'better-seo.js'

// Content compiler
import { fromContent, fromMDX } from 'better-seo.js'

// Assets (better-seo-assets - optional)
import { generateOG, generateIcons, generateManifest, generateSplash } from 'better-seo-assets'

// Voilà API (Quick Attach)
import { seo, withSEO, useSEO, initSEO } from 'better-seo.js'

// Types
import type { SEORule } from 'better-seo.js'
```

### 4.2 Voilà API (Quick Attach)

#### Next.js — Singleton Pattern

```ts
// lib/seo.ts
import { seo } from 'better-seo.js'

initSEO({
  defaultTitle: "My App",
  baseUrl: "https://example.com",
  titleTemplate: "%s | My App",
})

export { seo }

// app/page.tsx
import { seo } from "@/lib/seo"

export const metadata = seo({ title: "Home" })
```

#### API Levels

| Method | Framework | Usage |
|--------|-----------|-------|
| `seo()` | Next.js | `export const metadata = seo({...})` |
| `withSEO()` | Next.js | `export const metadata = withSEO({...})` |
| `useSEO()` | React | `useSEO({...})` in component |
| `seo.layout()` | Next.js | Layout-level with auto-merge |
| `seo.page()` | Next.js | Page-level with auto-merge |
| `seo.route()` | Any | Route-aware: `seo.route("/dashboard", {...})` |
| `seo.auto()` | Any | Infers from current route |

---

#### Layout + Page Auto-Merge

```ts
// layout.tsx
export const metadata = seo.layout({
  title: "App",
  description: "Default description"
})

// page.tsx
export const metadata = seo.page({
  title: "Dashboard"  // Final: "Dashboard | App"
})
```

Internally calls `mergeSEO()` automatically.

---

#### React Hook

```tsx
import { useSEO } from 'better-seo.js'

function Page() {
  useSEO({ title: "Dashboard" })
  
  return <h1>Dashboard</h1>
}
```

No wrapper components. No JSX clutter.

---

### 4.3 CLI Commands

```bash
# Initialize config (optional - zero-config mode works without)
npx better-seo init

# Generate OG images
npx better-seo og                    # Auto mode
npx better-seo og "Hello World"      # Quick demo - instant OG image
npx better-seo og --template ./og.tsx
npx better-seo og --theme dark

# Generate icons from logo
npx better-seo icons ./logo.svg
npx better-seo icons ./logo.svg --output /public

# Generate splash screens
npx better-seo splash --logo ./logo.svg --theme dark

# Analyze SEO coverage
npx better-seo analyze ./app

# Voilà: Auto-inject SEO into pages
npx better-seo add /dashboard              # Injects seo() into page
npx better-seo add /blog --layout          # Injects at layout level
npx better-seo add /dashboard --dry-run    # Preview changes only
npx better-seo add /dashboard --safe       # Skip if already exists
npx better-seo add /dashboard --interactive # Prompt before each change

# Scan & Fix
npx better-seo scan                  # Reports missing SEO
npx better-seo scan --dry-run        # Preview only
npx better-seo fix                   # Auto-injects baseline SEO
npx better-seo fix --interactive     # Prompt before each fix

# Snapshots (Time-Travel + Debugging)
npx better-seo snapshot                      # Snapshot all pages
npx better-seo snapshot /blog/my-post        # Snapshot specific page
npx better-seo snapshot --compare            # Show diff from last snapshot
npx better-seo snapshot --output ./seo-snapshots

# Preview (See how pages look when shared)
npx better-seo preview /blog/my-post         # Preview all platforms
npx better-seo preview / --open              # Auto-open browser

# Migration (for breaking changes)
npx better-seo migrate               # Auto-updates code for new versions
```

---

### 4.4 Visual Proof (Demo Shock)

**README must include before/after visuals:**

#### OG Image Generation

| Before | After |
|--------|-------|
| Broken link preview (no image) | Clean, branded OG card |
| Default Twitter card | Custom design-system-matched preview |

**Demo command:**
```bash
npx better-seo og "Hello World"
# → Outputs beautiful OG image in 2 seconds
```

---

#### Icon Generation

| Before | After |
|--------|-------|
| Single favicon.ico | Full set: 16, 32, 192, 512, apple-touch, maskable |
| No PWA support | `manifest.json` + all assets |

**Demo command:**
```bash
npx better-seo icons ./logo.svg
# → Outputs 7 icon files + manifest.json
```

---

#### SEO Coverage

| Before | After |
|--------|-------|
| 5/20 pages with SEO | 20/20 pages with SEO |
| Missing descriptions | All pages validated |

**Demo command:**
```bash
npx better-seo scan
# → Reports: "15 pages missing SEO"
npx better-seo fix
# → All pages now have SEO
```

---

**Design rationale:** You're selling aesthetics + automation. Without visual proof, your biggest differentiator is invisible.

### 4.3 Usage Examples

#### Next.js (App Router) — Full Example

```ts
// app/page.tsx
import { createSEO, mergeSEO, toNextMetadata, Article } from 'better-seo.js'

// Layout-level SEO (root layout)
const layoutSEO = createSEO({
  meta: {
    title: "Home",
    description: "Default site description",
  },
  openGraph: {
    siteName: "My Site",
    locale: "en_US",
  },
}, {
  defaultTitle: "My Site",
  baseUrl: "https://example.com",
  titleTemplate: "%s | My Site",
})

// Page-level SEO (merged with layout)
const pageSEO = mergeSEO(layoutSEO, {
  meta: {
    title: "My Article",  // Final: "My Article | My Site"
    description: "A compelling article description",
    canonical: "/blog/my-article",
    alternates: {
      languages: {
        "en-US": "/en/blog/my-article",
        "es-ES": "/es/blog/my-article",
      },
    },
    verification: {
      google: "verification-code",
    },
  },
  openGraph: {
    type: "article",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Article preview",
    }],
  },
  schema: [
    Article({
      headline: "My Article",
      datePublished: "2024-01-01",
      author: { "@type": "Person", name: "John Doe" },
      image: { "@type": "ImageObject", url: "/og-image.jpg" }
    })
  ]
})

export const metadata = toNextMetadata(pageSEO)
```

#### React (React Helmet Async)

```tsx
import { createSEO, toHelmetProps } from 'better-seo.js'
import { Helmet } from 'react-helmet-async'

function Page() {
  const seo = createSEO({...}, {...})
  
  return (
    <>
      <Helmet {...toHelmetProps(seo)} />
      <h1>My Page</h1>
    </>
  )
}
```

#### Migration from next-seo

```ts
// Before (next-seo)
import { NextSeo } from 'next-seo'

<NextSeo
  title="My Page"
  description="My description"
  canonical="https://example.com/page"
  openGraph={{
    title: "OG Title",
    images: [{ url: "/image.jpg" }]
  }}
/>

// After (better-seo.js)
import { createSEO, fromNextSeo } from 'better-seo.js'

// Option 1: Manual migration
const seo = createSEO({
  meta: { title: "My Page", description: "My description" },
  openGraph: { images: [{ url: "/image.jpg" }] }
}, config)

// Option 2: Auto-convert (provided utility)
const seo = fromNextSeo({
  title: "My Page",
  description: "My description",
  canonical: "https://example.com/page",
  openGraph: { ... }
}, config)
```

#### Vanilla / Custom Renderer

```ts
const seo = createSEO({...}, {...})

// Access raw values
seo.meta.title
seo.openGraph?.images
seo.schema?.[0]

// Render JSON-LD manually
seo.schema?.map(s => 
  `<script type="application/ld+json">${JSON.stringify(s)}</script>`
)
```

#### Asset Generation Workflow

```bash
# 1. Initialize (creates better-seo.config.ts)
npx better-seo init

# 2. Generate OG images from config
npx better-seo og

# 3. Generate icons from logo
npx better-seo icons ./src/assets/logo.svg

# 4. Generate splash screens
npx better-seo splash

# Output ready in /public, referenced in SEO config
```

```ts
// better-seo.config.ts
export default defineSEO({
  meta: {
    title: "My App",
    description: "My app description",
  },
  og: {
    source: "auto",
    logo: "/logo.svg",
    theme: "dark",
  },
  icons: {
    source: "./src/assets/logo.svg",
    output: "/public",
  }
})

// app/layout.tsx
import { createSEO, toNextMetadata } from 'better-seo.js'
import config from '../better-seo.config'

const seo = createSEO(config.meta, {
  defaultTitle: config.meta.title,
  baseUrl: "https://example.com",
  titleTemplate: "%s | My App",
})

export const metadata = toNextMetadata(seo)
```

---

## 5. Implementation Phases

### Phase 1: Core Engine + Voilà (Week 1-2) **SHIP OR DIE**

| Task | Deliverable | Priority |
|------|-------------|----------|
| Define TypeScript types | `types.ts` (with alternates, verification, OG images array) | 🔴 Critical |
| Implement `createSEO()` | `core.ts` (with titleTemplate support) | 🔴 Critical |
| Implement `mergeSEO()` | `core.ts` (layout + page composition) | 🔴 Critical |
| Schema helpers (7 types) | `schema.ts` | 🟡 High |
| **Voilà API** | `voila.ts` (seo(), withSEO(), useSEO()) | 🔴 Critical |
| **Zero-config mode** | `singleton.ts` with package.json + env inference | 🔴 Critical |
| **Adapter escape hatch** | Explicit `adapter` option | 🟡 High |
| Basic tests | Vitest suite | 🔴 Critical |

**Exit criteria:** 
- `npm install better-seo.js` → `export const metadata = seo({ title: "Home" })` works in 60 seconds
- Zero config required for basic usage
- Next.js adapter works flawlessly

---

### Phase 2: OG Generator (Week 3) **HOOK USERS**

| Task | Deliverable | Priority |
|------|-------------|----------|
| Basic OG generator | `better-seo-assets/og/` with Satori | 🔴 Critical |
| CLI `og` command | `npx better-seo og "Hello World"` | 🔴 Critical |
| Simple templates | 2-3 built-in templates (light/dark) | 🟡 High |

**Exit criteria:** 
- `npx better-seo og "Hello World"` outputs beautiful OG image in 2 seconds
- README shows before/after visual proof

---

### Phase 3: Icon Generator (Week 4) **LOCK THEM IN**

| Task | Deliverable | Priority |
|------|-------------|----------|
| Icon generator | `better-seo-assets/icons/` with sharp | 🔴 Critical |
| CLI `icons` command | `npx better-seo icons ./logo.svg` | 🔴 Critical |
| Manifest generator | `manifest.json` output | 🟡 High |

**Exit criteria:** 
- `npx better-seo icons ./logo.svg` outputs 7 icon files + manifest.json
- Before/after visual proof in README

---

### Phase 4: Launch Core (Week 5)

| Task | Deliverable |
|------|-------------|
| npm package setup | `package.json`, build config |
| GitHub repo | Public repo with clean README + visual proof |
| Initial announcement | Twitter/X, Reddit, Discord |
| Example project | `/examples/nextjs-app` |

**Exit criteria:** First 100 installs.

---

### Phase 5: Adapters + Validation (Week 6-7)

| Task | Deliverable |
|------|-------------|
| React Helmet adapter | `toHelmetProps()` |
| Vanilla renderer | `renderTags()` |
| Dev warnings | `validate.ts` (title/description length, missing fields) |
| Integration tests | Adapter test suite |

**Exit criteria:** Works in React + Vite apps, warnings fire in dev mode.

---

### Phase 6: SEO Middleware (Week 8) **SCALE UNLOCK**

| Task | Deliverable |
|------|-------------|
| Rule engine | `applyRules()` with glob matching |
| SEORule type | `{ match, seo, priority }` |
| Route detection | `getCurrentRoute()` for SSR/SSG |
| Merge priority | Rules → input (input wins) |

**Exit criteria:** `initSEO({ rules: [...] })` auto-applies SEO to matching routes.

---

### Phase 7: Content Compiler (Week 9) **INTELLIGENCE LAYER**

| Task | Deliverable |
|------|-------------|
| `fromContent()` | Generate SEO from title + body |
| `fromMDX()` | Parse frontmatter + extract headings |
| Description generator | Summarize content to 160 chars |
| OG title optimizer | Clean and truncate for social |

**Exit criteria:** `seo(fromMDX(post))` generates complete SEO from content alone.

---

### Phase 8: Snapshots + Preview (Week 10-11) **TRUST + DEBUGGING**

| Task | Deliverable |
|------|-------------|
| `snapshot` command | Save SEO output to JSON files |
| `--compare` flag | Diff snapshots for regression detection |
| `preview` command | Generate platform previews (Google, Twitter, LinkedIn) |
| `--open` flag | Auto-open preview in browser |

**Exit criteria:** 
- `npx better-seo snapshot --compare` shows SEO changes
- `npx better-seo preview /blog --open` shows side-by-side previews

---

### Phase 9: CLI TUI + Installation Wizard (Week 12-13)

| Task | Deliverable |
|------|-------------|
| TUI components | Select, input, progress, confirm |
| `init` wizard | Interactive setup flow |
| Framework detection | Auto-detect + manual override |
| Template system | blog, docs, saas, ecommerce, portfolio |
| Adapter packages | `@better-seo/next`, `@better-seo/react`, etc. |
| Non-interactive mode | `--no-interactive` flag for CI/CD |

**Exit criteria:** 
- `npx better-seo init` shows sleek interactive wizard
- Auto-detects Next.js and suggests correct adapter
- Templates provide opinionated starting configs

---

### Phase 10: CLI Automation (Week 14)

| Task | Deliverable |
|------|-------------|
| `add` command | Auto-inject SEO into pages |
| `scan` command | Report missing SEO |
| `fix` command | Auto-fix missing SEO |
| Safety flags | `--dry-run`, `--safe`, `--interactive` |
| Idempotency | Running twice doesn't duplicate |

**Exit criteria:** `npx better-seo add /dashboard --dry-run` and `npx better-seo scan && fix` work end-to-end.

---

### Phase 11: Design System Integration (Week 15-16)

| Task | Deliverable |
|------|-------------|
| Tailwind config parser | Extract colors/fonts automatically |
| Custom OG templates | User-provided React/Satori templates |
| Splash screen generator | iOS + Android splash assets |

**Exit criteria:** OG images match app's design system automatically.

---

### Phase 12: Migration + Polish (Week 17)

| Task | Deliverable |
|------|-------------|
| Migration utility | `fromNextSeo()` auto-converter |
| `migrate` CLI command | Auto-update code for breaking changes |
| API documentation | `/docs/api.md` |
| Schema reference | `/docs/schemas.md` |
| Migration guide | `/docs/migration.md` |

**Exit criteria:** A stranger can migrate from next-seo in 10 minutes without asking questions.

---

**Critical Note:** Phases 1-4 are the **minimum viable product**. Phases 5-12 are retention features. Do not build Phase 10 before Phase 1 works.

**Unfair Leverage Features** (Phases 6-9):
| Feature | Category | Why it wins |
|---------|----------|-------------|
| **SEO Middleware** | Scale | Scales to 1000s of pages without repetition |
| **Content Compiler** | Intelligence | Devs provide content, you provide SEO |
| **SEO Snapshots** | Trust | Testable + version-controlled SEO |
| **SEO Preview** | Debugging | Instant feedback, demo magic |
| **CLI TUI** | UX | First impression, guided setup, templates |

---

## 6. Success Metrics

### 6.1 Technical KPIs

| Metric | Target |
|--------|--------|
| Core bundle size | < 5KB gzipped |
| Type safety | 100% typed, no `any` in public API |
| Test coverage | > 90% |
| Zero dependencies (core) | No runtime deps |
| Asset generation time | < 2s per OG image |
| CLI startup time | < 500ms |
| **Time-to-first-SEO** | < 60 seconds (install → working) |
| **CLI injection success rate** | > 95% (files correctly modified) |

### 6.2 Adoption KPIs (First 90 Days)

| Metric | Target |
|--------|--------|
| npm downloads/week (core) | 500+ |
| npm downloads/week (assets) | 200+ |
| GitHub stars | 200+ |
| Production adopters | 10+ public repos |
| CLI commands run | 1000+ /week |
| **`add` command usage** | 500+ /week |
| **`scan && fix` usage** | 200+ /week |

---

## 7. Competitive Differentiation

| Feature | better-seo.js | next-seo | Next.js Metadata |
|---------|---------------|----------|------------------|
| Unified SEO object | ✅ | ❌ | ❌ |
| JSON-LD as primitive | ✅ | ⚠️ (add-on) | ❌ |
| Framework agnostic | ✅ | ❌ (Next only) | ❌ (Next only) |
| Schema helpers | ✅ | ⚠️ (limited) | ❌ |
| Custom schema escape hatch | ✅ | ❌ | N/A |
| Fallback logic | ✅ | ⚠️ (manual) | ❌ |
| **Layout + Page merge** | ✅ | ❌ | ⚠️ (manual) |
| **titleTemplate** | ✅ | ✅ | ❌ |
| **hreflang / alternates** | ✅ | ✅ | ⚠️ (manual) |
| **Verification tags** | ✅ | ✅ | ❌ |
| **OG images array** | ✅ | ✅ | ⚠️ (manual) |
| **Dev warnings** | ✅ | ❌ | ❌ |
| **Migration utility** | ✅ | N/A | N/A |
| **OG image generator** | ✅ | ❌ | ❌ |
| **Icon generator** | ✅ | ❌ | ❌ |
| **CLI tooling** | ✅ | ❌ | ❌ |
| **Design system integration** | ✅ | ❌ | ❌ |
| **Voilà API (quick attach)** | ✅ | ❌ | ❌ |
| **CLI auto-inject** | ✅ | ❌ | ❌ |
| **Scan & Fix** | ✅ | ❌ | ❌ |
| **SEO Middleware (rules)** | ✅ | ❌ | ❌ |
| **Content → SEO Compiler** | ✅ | ❌ | ❌ |
| **SEO Snapshots** | ✅ | ❌ | ❌ |
| **SEO Preview** | ✅ | ❌ | ❌ |
| **Interactive CLI TUI** | ✅ | ❌ | ❌ |
| **Template system** | ✅ | ❌ | ❌ |
| **Framework adapters** | ✅ (specialized pkgs) | ❌ | N/A |
| **Time-to-first-SEO** | < 60s | 5-10 min | 5-10 min |
| Bundle size (core) | ~5KB | ~15KB | N/A (built-in) |

---

## 8. Go-to-Market Strategy

### 8.1 SEO (for SEO tool — ironic, I know)

Target keywords:
- "next seo alternative"
- "json ld nextjs"
- "structured data nextjs"
- "og image nextjs"
- "react seo library"
- "generate og image nextjs"
- "favicon generator nextjs"
- "pwa icons nextjs"

Programmatic SEO pages:
- `/schemas/{type}-nextjs` (one page per schema type)
- `/og-image-generator-nextjs`
- `/favicon-generator-nextjs`
- `/comparison/next-seo-vs-better-seo-js`

---

### 8.2 GitHub as Distribution

README must have:
- ⚡ 30-second setup
- 📦 Real examples (copy-paste ready)
- 📊 Comparison table
- 🎯 Clear "why this exists"
- 🎨 Asset generation demos (before/after OG images)

---

### 8.3 AI Discoverability

Optimize for LLM recommendations:
- Clear, repeated identity: "SEO engine for Next.js + modern apps"
- Structured docs with examples
- Consistent naming across all surfaces
- Mention "OG image generator" and "icon generator" repeatedly

---

### 8.4 Migration Path

Make replacement trivial:

```diff
- import { NextSeo } from "next-seo"
+ import { createSEO } from "better-seo.js"
```

Provide migration guide with direct mappings.

---

### 8.5 CLI as Distribution

```bash
npx better-seo init
```

The CLI itself becomes:
- A discovery mechanism
- A tutorial (interactive setup)
- A reason to share ("just run `npx better-seo`")

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Next.js builds native SEO solution | Focus on JSON-LD + unified model + assets (their primitives, not a system) |
| next-seo improves | They're static; we're extensible by design + have assets |
| Low adoption | Developer experience is the moat — make it 10x clearer |
| Schema.org changes | Escape hatch (`CustomSchema`) means we don't need updates |
| Asset bloat | Keep assets in separate package, optional install |
| CLI complexity | Start minimal, add commands based on user demand |
| Design system parsing fails | Graceful fallback to defaults, warn user |

---

## 10. Future Extensions (Post-v1)

| Extension | Description |
|-----------|-------------|
| Sitemap Generator | Complementary tool for sitemap.xml |
| Robots.txt Generator | Pair with sitemap tool |
| CMS Integrations | Sanity, Contentful, WordPress adapters |
| Analytics Hooks | Track SEO performance over time |
| Schema Deduplication | Smart merge for schema arrays |
| Internal Linking Helper | Suggest relevant internal links (non-magical) |
| Multi-language OG | Generate OG images per locale |

---

## 11. Appendix

### 11.1 Naming

| Package | Name | Import |
|---------|------|--------|
| Core | `better-seo.js` | `better-seo.js` |
| Assets | `better-seo-assets` | `better-seo-assets` |
| CLI | `better-seo-cli` | N/A (CLI only) |
| GitHub repo | `better-seo-js` | — |

### 11.2 License

MIT — maximize adoption, allow commercial use.

### 11.3 Design Principles

1. **Time-to-value first** — 60 seconds from install → working SEO
2. **Ship voila before perfect** — Level 1 (acquisition) before Level 5 (unfair)
3. **Complete, not complex** — Cover all channels, stay simple
4. **Convention over configuration** — Sensible defaults, opt-out not opt-in
5. **Zero-config mode** — Infer from `package.json` + env, config is optional
6. **Escape hatches everywhere** — Never block advanced use cases
7. **Zero runtime cost** — No dependencies, tree-shakeable
8. **Docs as product** — If it's not documented, it doesn't exist
9. **Layout + Page composition** — Real apps have nested SEO; make it trivial
10. **Dev experience > Features** — Warnings beat errors, DX beats cleverness
11. **Core + Modules** — Core stays lean, features are optional addons
12. **Design-system aware** — Assets should match the app's visual identity
13. **Active, not passive** — Scan, fix, inject — don't just wait for config
14. **Idempotent CLI** — Running commands twice never breaks or duplicates
15. **Trust through safety** — `--dry-run`, `--safe`, `--interactive` flags mandatory
16. **SEO as code** — Snapshots make SEO testable + version-controlled
17. **Routing for SEO** — Middleware auto-applies rules at scale
18. **Content-first** — Compiler bridges "I have content" → "I need SEO"
19. **Preview everything** — Instant feedback beats deploy → check → redeploy
20. **Sleek TUI** — First impression matters, guided setup reduces friction
21. **Templates over blank slate** — Opinionated starting points beat config hell
22. **Framework specialization** — Core agnostic, adapters specialized per ecosystem

### 11.4 Mental Model

You're not building:
> a meta tag helper

You're building:
> **a normalized SEO document model**

Everything else is just:
> rendering that model into different formats

And now:
> **generating discovery surfaces from that model**

---

## 12. Sign-Off

| Role | Name | Date |
|------|------|------|
| Product | — | — |
| Engineering | — | — |
| Design | — | — |

---

**Version:** 4.0 (Final)  
**Last updated:** 2026-04-02  
**Status:** Ready for Implementation

---

## Summary: What Changed in v5

| Area | v1 | v2 | v3 | v4 | v5 (Final) |
|------|----|----|----|----|------------|
| **Scope** | SEO library | SEO + Discovery Surface Engine | Discovery Infrastructure | SEO Compiler + Infrastructure | SEO Platform + Ecosystem |
| **Packages** | Single | Core + Assets + CLI | Core + Assets + CLI (phased) | Core + Assets + CLI (phased) | Core + Adapters + Assets + CLI |
| **OG Images** | Manual | Auto-generated | Auto + visual proof | Auto + visual proof | Auto + visual proof + templates |
| **Icons** | Manual | CLI generator | CLI + before/after | CLI + before/after | CLI + before/after + manifest |
| **Positioning** | "Next SEO but better" | "SEO + Brand Surface Automation" | "Make your app look pro in 60s" | "SEO that feels like a compiler" | "SEO platform with guided setup" |
| **Bundle** | ~5KB | ~5KB core + optional assets | ~5KB core + optional assets | ~5KB core + optional assets | ~5KB core + adapter pkgs + assets |
| **Distribution** | npm + GitHub | npm + GitHub + CLI | npm + GitHub + CLI + demo shock | npm + GitHub + CLI + demo shock | npm + GitHub + CLI + TUI + templates |
| **Voilà API** | ❌ | ✅ | ✅ + zero-config | ✅ + zero-config | ✅ + zero-config |
| **CLI Auto-Inject** | ❌ | ✅ | ✅ + idempotent + safe flags | ✅ + idempotent + safe flags | ✅ + idempotent + safe flags + TUI |
| **Time-to-first-SEO** | 5-10 min | < 60 seconds | < 60 seconds (true zero-config) | < 60 seconds (true zero-config) | < 60 seconds (wizard + templates) |
| **Config Required** | Yes | Yes | No (inferred) | No (inferred) | No (inferred + template defaults) |
| **Safety Flags** | ❌ | ❌ | ✅ (`--dry-run`, `--safe`, `--interactive`) | ✅ (`--dry-run`, `--safe`, `--interactive`) | ✅ (`--dry-run`, `--safe`, `--interactive`) |
| **Escape Hatches** | Partial | Partial | Complete (asset disable, adapter override) | Complete (asset disable, adapter override) | Complete (asset disable, adapter override) |
| **Versioning** | ❌ | ❌ | ✅ (semver + migrate command) | ✅ (semver + migrate command) | ✅ (semver + migrate command) |
| **SEO Middleware** | ❌ | ❌ | ❌ | ✅ (rules auto-apply at scale) | ✅ (rules auto-apply at scale) |
| **Content Compiler** | ❌ | ❌ | ❌ | ✅ (fromContent, fromMDX) | ✅ (fromContent, fromMDX) |
| **SEO Snapshots** | ❌ | ❌ | ❌ | ✅ (time-travel + debugging) | ✅ (time-travel + debugging) |
| **SEO Preview** | ❌ | ❌ | ❌ | ✅ (Google, Twitter, LinkedIn previews) | ✅ (Google, Twitter, LinkedIn previews) |
| **CLI TUI** | ❌ | ❌ | ❌ | ❌ | ✅ (sleek wizard, progress, prompts) |
| **Template System** | ❌ | ❌ | ❌ | ❌ | ✅ (blog, docs, saas, ecommerce, portfolio) |
| **Framework Adapters** | ❌ | ❌ | ❌ | ❌ | ✅ (@better-seo/next, react, astro, etc.) |
| **Auto-Detect** | ❌ | ❌ | ❌ | ❌ | ✅ (framework + router detection) |

---

**The One-Liner:**

> Make your app look and rank like a finished product in 60 seconds.

---

**The Acquisition Hook:**

> `export const metadata = seo({ title: "Home" })` — done in 60 seconds, zero config.

---

**The Retention Moat:**

> OG generators, icon automation, design system integration, scan & fix.

---

**The Unfair Leverage** (v5 differentiators):

| Feature | Category | Why it wins |
|---------|----------|-------------|
| **SEO Middleware** | Scale | 1000s of pages, zero repetition |
| **Content Compiler** | Intelligence | Devs provide content, you provide SEO |
| **SEO Snapshots** | Trust | Testable + version-controlled SEO |
| **SEO Preview** | Debugging | Instant feedback, demo magic |
| **CLI TUI** | UX | First impression, guided setup |
| **Templates** | Opinionation | Blog, docs, saas — pre-configured best practices |
| **Framework Adapters** | Ecosystem | Core agnostic, specialized per framework |

---

**The Product Pyramid:**

| Level | Feature | Purpose |
|-------|---------|---------|
| **Level 1 (Acquisition)** | `seo({ title })` | Get them in the door |
| **Level 2 (Trust)** | merge + defaults + correctness | Keep them confident |
| **Level 3 (Delight)** | OG + icons generator | Make them say "wow" |
| **Level 4 (Power)** | CLI automation | Lock them in |
| **Level 5 (Unfair)** | Middleware + Compiler + Snapshots | Category-defining |
| **Level 6 (Ecosystem)** | TUI + Templates + Adapters | Platform lock-in |

**Critical:** Ship Level 1 before Level 6. Most teams build backwards and die.

---

**The Real Risk:**

> Not competitors. Not features. **Overbuilding and dying mid-flight.**

---

**The Win Condition:**

> Ship the "voilà moment" before the "perfect system".

Because users forgive missing features. They do NOT forgive confusion.

---

**The Endgame:**

You're not competing with:
- next-seo
- Next.js Metadata API

You're competing with:
> **how people think about SEO entirely**

SEO that feels like a **compiler**, not config.

SEO that **guides you** from install, not abandons you after npm.

SEO that **scales** from 1 page to 10,000 without rewriting.
