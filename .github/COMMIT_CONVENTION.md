# Commit convention

This repo uses **[Conventional Commits](https://www.conventionalcommits.org/)** so history stays **machine-readable** and CI can enforce structure.

## Format

```txt
<type>(<optional-scope>): <short description>

[optional body]

[optional footer(s)]
```

Examples:

```txt
feat(core): add serializeJSONLD helper
fix(next): correct openGraph image mapping
docs: update CONTRIBUTING for changesets
chore(ci): add commitlint workflow
```

For an interactive prompt (types, scope, emoji via **cz-git**):

```bash
npm run commit
```

## Types (common)

| type | When |
|------|------|
| `feat` | New capability (user-visible) |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Internal refactor |
| `perf` | Performance |
| `test` | Tests only |
| `build` | Bundler, package layout |
| `ci` | CI / automation |
| `chore` | Maintenance, deps, tooling |

## Breaking changes

 Put `BREAKING CHANGE:` in the footer **or** use a `!` after the type, e.g. `feat(core)!: drop Node 18`.

## Versioning vs commits

- **Release semver** is driven by [**Changesets**](https://github.com/changesets/changesets) (`.changeset/*.md`) and [**PACKAGE.md**](../PACKAGE.md), **not** by parsing commit messages for version bumps.
- Conventional commits still matter for **review, git blame, and optional tooling**.

## Hooks

After `npm install`, **Husky** runs **commitlint** on `commit-msg` locally so invalid messages are blocked before push.
