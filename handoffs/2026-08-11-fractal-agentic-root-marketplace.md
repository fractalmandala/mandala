---
task: fractal-agentic-root-marketplace
status: done
host: codex
branch: main
boss: meta
updated: 2026-08-11T03:46:24+05:30
---

# Handoff — Fractal Agentic root marketplace

## Where we are

Added the Mandala root Codex marketplace at `.agents/plugins/marketplace.json`. Its
`fractal-agentic` entry uses a `git-subdir` source for
`https://github.com/fractalmandala/mandala.git`, targeting
`./packages/fractal-agentic` on `main`. Updated package metadata, local install guides,
resolver discovery, project integration guidance, and stale standalone-repository links
to match the monorepo layout.

Verification passed: marketplace and package JSON parsing, resolver discovery from the
monorepo root and a workspace directory, `check-armory.sh`,
`check-nonblocking-policy.sh`, `verify.sh`, CLI root resolution, and `git diff --check`.

## Decisions

- Keep `packages/fractal-agentic` as the installable plugin root; there is no nested `plugin/` directory.
- Use the monorepo root `.agents/plugins/marketplace.json` as the Codex catalog.
- Use Codex `git-subdir` source metadata so the public repository remains `fractalmandala/mandala`.
- Normalize plugin/package metadata to version `2.6.6` and the Mandala repository URLs.

## Remaining

- [ ] After this change is pushed, run `codex plugin marketplace add fractalmandala/mandala --sparse .agents/plugins` and install `fractal-agentic` from `/plugins`.
- [ ] Start a new Codex task after installation so bundled skills are rescanned.

## Gotchas

- `codex plugin marketplace add owner/repo/subdirectory` is not supported; the root catalog must be included in the sparse checkout.
- The existing `mandala.code-workspace` edit adding `../screenpipe` was pre-existing and intentionally preserved.
- Capability-agent TOMLs remain optional disk/session layers; missing pin exposure must fall back without blocking work.

## Key files

- `.agents/plugins/marketplace.json` — root Codex catalog and Git subdirectory source.
- `packages/fractal-agentic/docs/02-install.md` — host-specific installation matrix.
- `packages/fractal-agentic/scripts/resolve-plugin-root.sh` — monorepo-aware plugin root discovery.
- `packages/fractal-agentic/project-integration/AGENTS-SNIPPET.md` — project auto-use discovery paths.
