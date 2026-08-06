---
description: Full delivery pipeline from current state to merged PR — verify, version bump, changelog, PR. Optionally publish.
---

# /ship

End-to-end delivery. Takes the current branch from working state to merged PR.
Stops at each phase for user confirmation. Never publishes without explicit yes.

## Usage

```
/ship
/ship --patch
/ship --minor
/ship --publish
/ship --dry-run
```

## Pipeline

### Phase 1 — Verify
Runs /sv (review → build → test → quality-gate).
If anything fails → stop, report, wait for fix.

### Phase 2 — Changelog
- Scan git log since last tag: `git log $(git describe --tags --abbrev=0)..HEAD --oneline`
- Group by conventional commit type: feat, fix, refactor, docs, chore
- Write changelog entry to CHANGELOG.md or print inline for small repos

### Phase 3 — Version bump
- Determine bump: --patch (default), --minor, --major
- Detect from commits if not specified (feat → minor, fix → patch, BREAKING → major)
- Show: current version → new version
- Confirm with user before proceeding

### Phase 4 — Commit and PR
- Commit version bump + changelog
- Create PR via /pr
- Wait for CI green
- Merge PR (if user confirms)

### Phase 5 — Publish (optional)
- Only if --publish flag set
- Run `pnpm publish --filter <pkg>` (public packages only)
- Run `gh release create v{version} --generate-notes`
- Log release to session ledger

## Safety

- Never publish without --publish flag AND user confirmation
- Never version-bump without showing old→new
- Never merge before CI green
- Verify working tree clean before starting

## Arguments
- --patch | --minor | --major optional (auto-detected from commits if omitted)
- --publish optional
- --dry-run optional (print plan, make no changes)
