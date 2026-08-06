# Monorepo release workflow

Portable specification for releasing a package from the mandala monorepo.
Covers version bump, changelog generation, publish, and notification.

## Purpose

Autonomous release segment for public npm packages inside the mandala monorepo
(morphicons-svelte, svelte-animated-icon, fractalsvelte, fractals-styler).

## Phases

### Phase 1 — Verify
- Run build + typecheck in the target package
- Run tests
- Check workspace dependencies are not broken (pnpm ls -r)
- Verify changelog has no unreleased entries

### Phase 2 — Changelog
- Scan conventional commits since last git tag
- Generate changelog entries grouped: feat, fix, refactor, docs
- Write to CHANGELOG.md or prepend to existing

### Phase 3 — Version bump
- Determine bump: major (breaking), minor (feat), patch (fix)
- Present to user for confirmation
- Update package.json version
- git tag v{version}

### Phase 4 — Publish
- pnpm publish --filter {package} (with 2FA if configured)
- gh release create v{version} --generate-notes

### Phase 5 — Notify
- Update docs site if the package has a public site (fractaldesign, fractalmandala)
- Add release to fractal-agentic wiki (optional)
- Log release to session ledger

## Inputs

| Field | Required | Description |
|---|---|---|
| package | yes | Package name (e.g. morphicons-svelte) |
| bump | yes | major | minor | patch |
| dry_run | no | Preview without publishing |

## Safety

- Never publish without user confirmation
- Verify 2FA is available before publish attempt
- Do not push tags if publish fails
- Revert version bump on publish failure

## Related

- /quality-gate — Phase 1 precondition
- /santa-loop — Optional adversarial review for major versions
- Boss: Creator or Code for final ship
