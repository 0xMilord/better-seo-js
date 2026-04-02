# Recipe — Open Graph PNG (Wave 2)

**Packages:** `@better-seo/assets`, `@better-seo/cli`  
**Roadmap:** Wave 2 (**A1**, **L2**)

## CLI (fastest)

From the monorepo root (after `npm install` / `npm run build`):

```bash
node packages/better-seo-cli/dist/cli.cjs og "My post title" -o ./public/og.png --site-name "My blog"
```

Or with `npx` once published:

```bash
npx @better-seo/cli og "My post title" -o ./public/og.png
```

## Custom template (compiled `.js` / `.mjs`)

`generateOG` can load a **default-exported React function component** with the same props as the built-in card (**`OgCardProps`** re-exported from **`@better-seo/assets`**). The file must be **ESM** (`.mjs` or `.js`), not raw TSX — bundle or transpile first.

Place the template **inside a project that can resolve `react`** (e.g. your app or this monorepo). A lone file under `/tmp` may not resolve `import` from `"react"` because Node walks **`node_modules`** from the template’s directory upward.

```bash
npx @better-seo/cli og "Branded" --template ./dist/my-og.mjs -o ./public/og.png --site-name "Acme"
```

```ts
await generateOG({
  title: "Branded",
  siteName: "Acme",
  template: new URL("./templates/og-branded.mjs", import.meta.url).pathname,
})
```

## Library (CI / build script)

```ts
import { writeFile } from "node:fs/promises"
import { generateOG } from "@better-seo/assets"

const png = await generateOG({
  title: "Shipping checklists",
  siteName: "Eng blog",
  description: "How we cut incidents in half.",
  theme: "dark",
})

await writeFile("public/og/shipping.png", png)
```

Point `openGraph.images[0].url` (or your host’s metadata API) at the generated file URL. Keep generation in **Node** — this stack is not Edge-safe.

## Tests in this repo

- **`packages/better-seo-assets`**: `generateOG` PNG dimensions and edge cases (`vitest`).
- **`packages/better-seo-cli`**: `runCli` integration + **built `dist/cli.cjs` smoke** (`vitest`).
