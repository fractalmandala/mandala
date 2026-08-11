# AGENTS.md — mandala monorepo map

This is the orientation map for the mandala monorepo. It is not app-specific guidance:
each workspace keeps its own `AGENTS.md` with detailed rules — read the workspace file
before working in that workspace.

Common stack: SvelteKit / Svelte 5 (runes) / TypeScript, Tauri for desktop apps, and
single-tab indented SASS styling everywhere (not SCSS — pure old SASS, no braces, no
semicolons).

## Setup (root)

There is **no root `package.json`** — the root is not a runnable workspace and has no
workspace-wide script set. Install per workspace:

- `apps/*`, `sites/*`, `packages/*` are one pnpm workspace (`pnpm-workspace.yaml` at
  repo root; a single `pnpm install` from the repo root covers all of them).
- `docs-kit/` is a **self-contained nested workspace** (own `pnpm-workspace.yaml`,
  lockfile, and Turbo pipeline). Install inside it: `cd docs-kit && pnpm install`.

Run all commands below from inside the workspace directory (`cd <workspace>` first).
Every SvelteKit workspace also has `pnpm dev`; Tauri desktop apps additionally have
`pnpm tauri dev`.

## Workspace map

| Workspace | What it is | Check / test routes |
|---|---|---|
| `apps/fractalengine` | FractalEngine Studio — Tauri 2 + SvelteKit desktop IDE. Has its own [AGENTS.md](apps/fractalengine/AGENTS.md). | `pnpm check` · full gate: `pnpm test:quality` (check + unit + clippy + cargo test + e2e + build) |
| `apps/fractalknow` | FractalKnow — Tauri + SvelteKit knowledge workspace (OpenKnowledge port). | `pnpm check` · `pnpm test` (unit + component + e2e) |
| `apps/shradhapp` | Shradhapp — local-first desktop video editor (Tauri). Has its own [AGENTS.md](apps/shradhapp/AGENTS.md). | `pnpm lint` (prettier check) |
| `apps/styler-builder` | Playground/builder for the `fractals-styler` Vite plugin. | `pnpm check` (svelte-check) |
| `sites/fractalagentic` | Fractal Agentic armory explorer site (pagefind search index on build). | `pnpm check` · `pnpm lint` |
| `sites/fractaldesign` | Design-system documentation + component showcase site. Has its own [AGENTS.md](sites/fractaldesign/AGENTS.md). | `pnpm check` · `pnpm lint` |
| `sites/fractaldharma` | Dharma texts query site with generated data artifacts (local-only, not tracked in git). | `pnpm check` · `pnpm test:data` |
| `sites/fractalmandala` | Fractal Mandala knowledge site. Has its own [AGENTS.md](sites/fractalmandala/AGENTS.md). | `pnpm check` · `pnpm lint` |
| `sites/testsite` | Scratch / test site. | `pnpm check` |
| `packages/fractal-agentation` | Agent annotation Svelte package (`fractal-agentation`). | `pnpm check` · `pnpm test` |
| `packages/fractal-agentic` | Fractal Agentic — orchestration plugin (skills, commands, bosses, agents). Has its own [AGENTS.md](packages/fractal-agentic/AGENTS.md). | `pnpm check` (armory check) · `pnpm test` (verify) |
| `packages/acrolls` | Vendored Acrolls publishing/docs workspace; nested `@acrolls/*` packages are part of the Mandala workspace. | `pnpm --filter @acrolls/<package> check` · `test` · `build` |
| `packages/fractal-svelte` | `@fractaldesign/fractal-svelte` component library. | `pnpm check` · `pnpm lint` · `pnpm test` |
| `packages/fractals-styler` | JIT utility-CSS Vite plugin. Has its own [AGENTS.md](packages/fractals-styler/AGENTS.md). | `pnpm check` (tsc) |
| `packages/fractalsvelte` | shadcn-style Svelte component library without Tailwind. Has its own [AGENTS.md](packages/fractalsvelte/AGENTS.md). | `pnpm check` · `pnpm lint` |
| `packages/morphicons-svelte` | Published Svelte port of morphicons. | `pnpm check` · `pnpm test` |
| `packages/svelte-animated-icon` | Published animated icon library. | `pnpm check` · `pnpm lint` |
| `packages/svelte-icons` | Published `@fractaldesign/svelte-icons` icon library. | `pnpm check` · `pnpm lint` |
| `docs-kit` | Standalone docs toolkit workspace (Turbo pipeline; not part of the root pnpm workspace). | `pnpm check` · `pnpm test` · `pnpm build` (turbo) |

## Git workflow (worktrees & branches)

Policy lives in [admin/repo-management.md](admin/repo-management.md). Trunk-based: `main`
is the stable baseline; all work happens on short-lived scoped branches.

- **Agents work in throwaway worktrees**, one per task — never stack unrelated changes
  in the persistent main worktree at `/Users/amrit/mandala`. Task worktrees live under
  `~/src/mandala/<type>/<name>`:
  ```bash
  scripts/wt.sh add feat/<scope>-<thing>   # branch + worktree off main
  scripts/wt.sh rm feat/<scope>-<thing>    # remove worktree + branch + prune when done
  ```
- Branch names follow `<type>/<scope>-<thing>` (`feat fix refactor experiment chore docs test perf ci`);
  commits follow Conventional Commits. `.githooks/commit-msg` warns (advisory) on both;
  direct pushes to `main` are forbidden.
- Merge back with `git merge --no-ff <branch>` from the main worktree (squash for
  one-liner fixes), then prune the worktree and branch immediately.
- If a session already holds uncommitted work in the main worktree, finish and land that
  first; do not start a second task in the same tree.

## Fractal Agentic plugin mandate (required session bootstrap)

Progressive-discovery entrypoints: plugin router
[packages/fractal-agentic/AGENTS.md](./packages/fractal-agentic/AGENTS.md) and boss hub
[packages/fractal-agentic/docs/bosses/INDEX.md](packages/fractal-agentic/docs/bosses/INDEX.md).

**Before any other project work** on a non-trivial task (implementation, review, refactor,
scaffold, debug beyond a one-line answer, port, docs batch, or multi-step plan), you MUST
detect whether the **Fractal Agentic** plugin is installed and readable, and if it is, you
MUST use it for the rest of the session without waiting for the user to `@` or tag it.

### Detection (run first)

1. If env `FRACTAL_AGENTIC_ROOT` is set and `$FRACTAL_AGENTIC_ROOT/plugin.json` exists, use that root.
2. In this monorepo the plugin lives at [`packages/fractal-agentic`](packages/fractal-agentic)
   (contains `plugin.json`, `AGENTS.md`, `skills/boss-orchestration/SKILL.md`, and
   `commands/orchestrate.md`).
3. Optional shell probe: `sh packages/fractal-agentic/scripts/resolve-plugin-root.sh` —
   exit 0 + printed path ⇒ accessible. Non-zero ⇒ treat as missing.
4. **Accessible** means you can **read** `AGENTS.md` and `skills/boss-orchestration/SKILL.md`
   from that root. A marketplace listing without readable files is **not** enough.

If detection fails: state once *“Fractal Agentic not found; proceeding with project AGENTS only”*
and continue under this map and the workspace `AGENTS.md` files. Do not invent a fake
plugin path. Do not block trivial Q&A on missing plugin.

### When found — mandatory use

1. **Read immediately** (in order): the plugin `AGENTS.md` (§0 decision tree and §0.6
   delivery runtime), then `skills/boss-orchestration/SKILL.md`, then `README.md` if you
   need install/preflight detail.
2. **Operate under the plugin for the whole task:** select the domain boss via the
   decision tree; for any deliverable that changes the repo or claims completion, follow
   **boss-orchestration** (five-part specs, routine vs complex lanes, primary
   re-verification, fresh review → `ship | fix-first | rethink`). Prefer plugin commands
   (`/orchestrate`, `/activate-boss-*`, `/quality-gate`, etc.) and mapped skills over
   ad-hoc process.
3. **Do not require the user to tag** `@fractal-agentic` or paste paths after a successful
   detection. Re-detect only if the workspace root changes mid-session.
4. **Stack defaults from the plugin map** apply unless a workspace `AGENTS.md` explicitly
   overrides them (this monorepo: Svelte 5 + SvelteKit + indented SASS; Tauri when desktop).
5. Workspace-local rules in the per-workspace `AGENTS.md` win on conflicts for that
   workspace's conventions; the plugin supplies process, armory, and delivery gates.
6. **Close every non-trivial task with a handoff note** in `handoffs/` (repo root) so
   any other agent — any host — can pick the task up. Spec:
   [packages/fractal-agentic/docs/handoffs.md](packages/fractal-agentic/docs/handoffs.md).

### When found — capability pins (if host supports them)

If the host exposes custom agent types, prefer `fractal_agentic_routine_implementer`,
`fractal_agentic_complex_implementer`, and `fractal_agentic_fresh_reviewer`. After plugin
install, pins may need `sh packages/fractal-agentic/scripts/install-agents.sh` then a
fresh task. If types are missing, keep contracts from `boss-orchestration` and state that
model pins are unverified.

### SvelteKit workspaces: annotation overlay

When working in a SvelteKit app workspace that uses agent annotations (e.g. via
`fractal-agentation` / `sv-agentation`), mount the `<Agentation>` component in that
workspace's root `+layout.svelte` behind `browser && dev` — this is workspace-level
guidance, not something applied at the monorepo root.

### Trivial exemption

Single-sentence answers, pure explanation with no repo change, or “what is X?” questions
may skip full orchestration, but if the answer depends on boss routing or monorepo
process, still load the plugin map when detected.

## Repo-level tooling

- Git hooks live in `.githooks/` (`pre-commit`, `pre-push`).
- The root `pnpm-workspace.yaml` also pins dependency overrides and build approvals —
  keep edits to it deliberate.
