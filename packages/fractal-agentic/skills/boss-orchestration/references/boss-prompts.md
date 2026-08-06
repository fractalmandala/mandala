# Per-boss constraint snippets

Paste the matching block into every worker CONSTRAINTS (and default VERIFICATION) when
that boss is ACTIVE. Keep bullets tight; expand from that boss's authoritative nested
`docs/bosses/<boss>/INDEX.md` only when needed.

## Design Boss

CONSTRAINTS:

- Prefer monorepo Svelte UI craft; React/Vue/Flutter only if stack-detected.
- Two-layer tokens (primitive → semantic); no drive-by hardcoded palette.
- WCAG 2.2 AA: focus, targets, contrast, ARIA.
- Motion via motion-foundations / motion-ui; advanced only when needed.
- Use impeccable / improved-interfaces for polish — not media `taste` grammar.
- Visual/a11y QA via browser-qa (Design-owned); not behavioral E2E ownership.

VERIFICATION defaults:

- Inspect token usage and contrast-critical surfaces.
- `/quality-gate` when shipping UI.
- Sites only: SEO structural sanity.

## Code Boss

CONSTRAINTS:

- Security first: no secrets, injection, unsafe tool surfaces.
- Distinguish production-audit (live) vs workspace-surface-audit / harness-audit (repo).
- Behavioral E2E is Code-owned; prefer real assertions over silent fallbacks.
- Document material architecture changes (ADR) when remediation is large.

VERIFICATION defaults:

- `/security-scan` for sensitive surfaces.
- Targeted tests + `/test-coverage` as scoped.
- `/quality-gate` before ship; `/santa-loop` on release-critical paths.

## Agent Boss

CONSTRAINTS:

- Product agent systems only — not personal Workflow pruning, not Meta portfolio admin.
- Prefer continuous-agent-loop as loop matrix; autonomous-loops = detail.
- Memory tiers: instincts → memclaw entity → context-save session.
- Tool/MCP safety: safety-guard / gateguard; no over-broad tool permissions.
- Skill portfolio health hands to Meta.

VERIFICATION defaults:

- `/harness-audit` when harness changes.
- Evidence-first harness review (better-harness) for material changes.
- `/santa-loop` when accepting agent-output quality claims.

## Svelte Boss

CONSTRAINTS:

- Canonical runes: svelte-5-runes (`$state`, `$derived`, `$effect`, `$props`, `$bindable`).
- No legacy stores / `$:` as default.
- SvelteKit data flow: correct `+page.ts` vs `+page.server.ts`, invalidation.
- Indented SASS; zero in-component `<style>` when project rules require it.
- Snippets/`{@render}`; template directives as needed (`@attach`, etc.).
- Port lane: port-component primary; shadcn-porting for source conversion.
- React/Vue reviewers only for migration — not peer defaults.

VERIFICATION defaults:

- `/svelte-review` mindset + `svelte-check` / `/svelte-build`.
- `/svelte-test` when behavior changes.
- `/quality-gate` before ship.

## Creator Boss

CONSTRAINTS:

- Live monorepo registry only (fractalengine, fracta, sites/_, packages/_); mark planned targets explicitly.
- Phase 0: brainstorm → spec → blueprint → scaffold before volume coding.
- Executive lean-on: Design craft, Svelte body/port, Code ship, Agent AI, Meta skills.
- Tauri: single IPC gateway + ipc-mock parity for desktop apps.
- Media `taste` only for media/video grammar — not UI craft.

VERIFICATION defaults:

- `/project-init` / blueprint alignment for new trees.
- `/quality-gate` + package/open-source gates when publishing.
- `/santa-loop` before major ship.

## Workflow Boss

CONSTRAINTS:

- Personal OS only — not product agent frameworks, not ECC compliance primary.
- Prefer continuous-agent-loop for personal loops.
- Context-save / context-restore for session handoff.
- Prune/sort tools; dual-own skill-health with Meta.

VERIFICATION defaults:

- Usually no product quality-gate unless the automation edits the monorepo.
- If it does edit code, hand to Code/Svelte for ship gates.

## Meta Boss

CONSTRAINTS:

- ECC install/inventory/comply/promote/prune only.
- Prefer live indexes; never invent skill counts.
- Agent Sort DAILY vs LIBRARY; no silent skill sprawl.

VERIFICATION defaults:

- `/ecc-guide` against live indexes.
- `/skill-health`; installer/check scripts when changing pins.
- `scripts/verify.sh` after orchestration template changes.
