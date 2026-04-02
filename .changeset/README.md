# Changesets

When your change should **release a new semver** for a published package:

```bash
npm run changeset
```

Pick the package(s) and **patch / minor / major**. Commit the new file under `.changeset/` with your PR.

On **merge to `main`**, [`.github/workflows/release.yml`](../.github/workflows/release.yml) will either open a **Version Packages** PR (bump versions + update `CHANGELOG.md`) or **publish to npm** if versions were already bumped and there are no pending changesets.

See [**PACKAGE.md**](../PACKAGE.md) for the full release flow.
