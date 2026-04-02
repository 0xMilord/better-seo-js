# Contributing

Thanks for helping improve **better-seo.js**. Product direction and architecture live in [`internal-docs/`](./internal-docs/); packaging and release flow in [**PACKAGE.md**](./PACKAGE.md).

## Prerequisites

- **Node.js** LTS (see root `engines` in `package.json` when added)
- **npm** (default for this repo)

## Getting started

```bash
git clone https://github.com/OWNER/better-seo-js.git
cd better-seo-js
npm ci
npm run build
npm run test
```

## Changesets (required for versioned packages)

Any change that should appear in **CHANGELOG** and trigger a **semver** bump must include a **Changeset**:

```bash
npm run changeset
```

Commit the generated `.changeset/*.md` with your PR. Maintainers merge **Version Packages** PRs and CI publishes to npm—see **PACKAGE.md §5–§7**.

## Pull requests

1. Branch from **`main`**: `feat/short-name` or `fix/short-name`
2. Keep commits focused; prefer **one logical change** per PR
3. Ensure **`npm run ci`** passes locally (lint, types, tests, E2E when applicable)
4. Update **internal docs** only when behavior or public API changes (see **PRD / ARCHITECTURE / FEATURES / Roadmap**)

## Code style

Match existing patterns in the package you touch. The core package must stay **runtime dependency-free** unless **ARCHITECTURE** is explicitly updated.

## Questions

Open a **Discussion** or issue (non-security); for security, see [**SECURITY.md**](./SECURITY.md).
