---
task: svelte-style-canvas-skill
status: visual-fix-done
host: grok-build
branch: feat/shradhapp-openreel-fork (dirty; skill edits only under packages/fractal-agentic)
boss: meta
updated: 2026-08-10
---

# Handoff — svelte-style-canvas (visualHtml required)

## Where we are

Skill ships under `packages/fractal-agentic/skills/svelte-style-canvas/`. First real run on fractaldharma home produced a **region text tree** (unusable). Fixed:

1. **Template** — stage prefers `pack.visualHtml`; tree is labeled degraded fallback only.
2. **fractaldharma-home** — regenerated with real markup + CSS (mode: visual).
3. **Contract** — SKILL.md, USERDOCS.md, style-pack-schema.md require non-empty `visualHtml` + `cssSubset`.

Synced to project install: `.grok/skills/svelte-style-canvas/`.

### Artifacts (gitignored)

- `vendors/style-previews/fractaldharma-home/preview.html` — open this
- `vendors/style-previews/fractaldharma-home/style-pack.json` — has `visualHtml` (~6k) + `cssSubset` (~5k)
- `vendors/style-previews/fractaldharma-home/report.md`
- Screenshot QA: `vendors/style-previews/fractaldharma-home/screenshot.png` (real UI mock, not labels)

### Skill source

- `packages/fractal-agentic/skills/svelte-style-canvas/SKILL.md` — hard requirement section
- `…/USERDOCS.md` — “workable” definition + tree-fallback troubleshooting
- `…/assets/preview-template.html` — visual-first stage
- `…/references/style-pack-schema.md` — `visualHtml` field documented

## Decisions

- **Visual first:** region inventory is evidence only; stage always renders markup-faithful HTML.
- L1 = agent-built `visualHtml` + source-derived `cssSubset`.
- Empty `visualHtml` = fail the run / re-run — do not ship tree fallback.

## Remaining

- [ ] User: confirm visual preview looks good enough (or request L3 / higher fidelity)
- [ ] Commit skill docs + template only (do **not** mix with shradhapp openreel WIP on this branch)
- [ ] Optional: reinstall marketplace cache so Claude plugin sees updated skill
- [ ] Optional v2: Playwright L3 computed styles, sass compile L2

## Gotchas

- Current branch has large shradhapp/openreel dirty state — land skill changes on a clean branch/worktree when committing.
- `vendors/` is gitignored; previews are local-only.
- Plugin cache under `~/.claude/plugins/...` may lag monorepo package until sync.

## Key paths

- Skill: `packages/fractal-agentic/skills/svelte-style-canvas/`
- Preview: `vendors/style-previews/fractaldharma-home/preview.html`
