# better-seo-docs-site

Nextra 4 + Next.js App Router. **Canonical prose lives in repo-root `docs/`**; `predev` / `prebuild` run **`scripts/sync-content.mjs`** to copy it into **`content/`** (gitignored).

## Prerequisite

From the monorepo root, build packages once so workspace links resolve:

```bash
npm ci
npm run build
```

## Develop

```bash
cd apps/docs
npm run dev
```

Open [http://localhost:3004](http://localhost:3004). Set **`NEXT_PUBLIC_SITE_URL`** for correct canonicals (e.g. `http://localhost:3004` locally).

## Dogfooding

Root layout uses **`prepareNextSeo`** + **`NextJsonLd`** from **`@better-seo/next`** with **`Organization`** + **`WebSite`** JSON-LD — same path as application code.

## Production build

```bash
cd apps/docs
npm run build
npm run start
```

Also wired as **`npm run build -w better-seo-docs-site`** from the repository root.
