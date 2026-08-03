# AGENTS

Welcome, Agent! This document serves as the orientation and technical guide for this codebase. It is not allowed to work in this project if you ignore this file, and the documents it references.

## Fractal Agentic plugin mandate (required session bootstrap)

**Before any other project work** on a non-trivial task (implementation, review, refactor,
scaffold, debug beyond a one-line answer, port, docs batch, or multi-step plan), you MUST
detect whether the **Fractal Agentic** plugin is installed and readable, and if it is, you
MUST use it for the rest of the session without waiting for the user to `@` or tag it.

### Detection (run first)

1. If env `FRACTAL_AGENTIC_ROOT` is set and `$FRACTAL_AGENTIC_ROOT/plugin.json` exists, use that root.
2. Otherwise search upward from the project / workspace root for the first directory that
   contains **all** of:
   - `plugin.json` with `"name": "fractal-agentic"` (or equivalent name field)
   - `AGENTS.md`
   - `skills/boss-orchestration/SKILL.md`
   - `commands/orchestrate.md`
3. Prefer monorepo-relative candidates (stop at the first hit):
   - `<workspace>/agentic/fractal-agentic`
   - `<workspace>/../agentic/fractal-agentic`
   - `<repo-root>/agentic/fractal-agentic` (walk up from cwd until `.git` or filesystem root)
   - `agentic/fractal-agentic` relative to any known monorepo root listed in this file
4. Optional shell probe (if the script is reachable):
   ```sh
   # from fractal-agentic itself, or after resolving a candidate root:
   sh <FRACTAL_AGENTIC_ROOT>/scripts/resolve-plugin-root.sh
   ```
   Exit 0 + printed path ⇒ accessible. Non-zero ⇒ treat as missing.
5. **Accessible** means you can **read** `AGENTS.md` and `skills/boss-orchestration/SKILL.md`
   from that root. A marketplace listing without readable files is **not** enough.

If detection fails: state once *“Fractal Agentic not found; proceeding with project AGENTS only”*
and continue under this project’s rules. Do not invent a fake plugin path. Do not block
trivial Q&A on missing plugin.

### When found — mandatory use

1. **Read immediately** (in order):
   - `<root>/AGENTS.md` — especially §0 decision tree and §0.6 delivery runtime
   - `<root>/skills/boss-orchestration/SKILL.md`
   - `<root>/README.md` if you need install/preflight detail
2. **Operate under the plugin for the whole task:**
   - Select domain boss via the decision tree (Design / Code / Agent / Svelte / Creator /
     Workflow / Meta).
   - For any deliverable that changes the repo or claims completion: follow
     **boss-orchestration** (five-part specs, routine vs complex lanes when spawn types
     exist, primary re-verification, fresh review → `ship | fix-first | rethink`).
   - Prefer plugin commands when applicable: `/orchestrate`, `/activate-boss-*`,
     `/quality-gate`, `/security-scan`, `/svelte-review`, `/santa-loop`, etc.
   - Prefer plugin skills/agents over ad-hoc process when a mapped skill exists.
3. **Do not require the user to tag** `@fractal-agentic` or paste paths after a successful
   detection. Re-detect only if the workspace root changes mid-session.
4. **Stack defaults from the plugin map** apply unless this project AGENTS.md explicitly
   overrides them (this monorepo: Svelte 5 + SvelteKit + indented SASS; Tauri when desktop).
5. Project-local rules in **this** AGENTS.md still win on conflicts for *this repo’s*
   conventions; the plugin supplies process, armory, and delivery gates.

### When found — Codex capability pins (if host supports them)

If the host exposes custom agent types, prefer:

- `fractal_agentic_routine_implementer`
- `fractal_agentic_complex_implementer`
- `fractal_agentic_fresh_reviewer`

After plugin install, pins may need:
`sh <root>/scripts/install-agents.sh` then a fresh task. If types are missing, keep
contracts from `boss-orchestration` and state that model pins are unverified.

### Trivial exemption

Single-sentence answers, pure explanation with no repo change, or “what is X?” questions
may skip full orchestration, but if the answer depends on boss routing or monorepo
process, still load the plugin map when detected.


You must follow these rules without exception:

1. **Tokens Only**: Components must never hardcode colors, font sizes, spacing, radii, or shadows (except for properties used in <= 2 places, where case-by-case hardcoded exceptions are approved to prevent over-tokenization).
2. **Two-Layer CSS Tokens**: Map variables as Primitives → Semantic. Components must consume semantic CSS variables only (e.g. `--background10`, `--border-secondary`, `--text-primary`, `--theme-color`) defined in `src/lib/styles/_tokens.sass` (except where low-usage overrides are hardcoded directly).
3. **Svelte 5 Runes Only**: Use `$state`, `$derived`, `$effect`, and `$props`. Absolutely no legacy `$: ` reactivity or `svelte/store` imports.
4. **Reactive Derivations**: Always write derived expressions directly, e.g. `let x = $derived(val)`. Never wrap them in an anonymous function like `$derived(() => val)`.
5. **Indented SASS Discipline**: All styles must use classic indented SASS (`.sass` syntax) with single-tab indentation, no curly braces, and no semicolons. No `.scss` or CSS.
6. **No Style Blocks in Svelte**: Svelte components must not contain `<style>` blocks. Write all styles under `src/lib/styles/components/` or under per-module `src/lib/modules/<app>/styles/` directories, and import them in `src/lib/styles/index.sass`. Shared styles remain under `src/lib/styles/` (see [styles guide](file:///Users/amrit/fractals/apps/fractalengine/docs/guides/add-styles-or-tokens.md)).
7. **Single IPC Gateway**: All Tauri API commands must go through the single module gateway: [ipc.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts). Browser mock [ipc-mock.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc-mock.ts) must be maintained to keep `pnpm dev` working fully outside Tauri (see [ipc guide](file:///Users/amrit/fractals/apps/fractalengine/docs/guides/add-an-ipc-function.md)). Parity is enforced by `IpcApi` interface + `tests/unit/ipc-contract.test.ts`; NATIVE_ONLY additions require justification (see ADR-028).
8. **Design Control Color Pickers**: In design panels, never use native browser `<input type="color">`; use the custom spectrum/hex picker popover.
9. **Mandatory Undo/Redo Boundary**: Any user-editable state (forms, layouts, editor values, sliders, theme selections) must support a complete Undo/Redo boundary via `Cmd+Z` / `Ctrl+Z` and native app menus. Wrap mutations in your domain's `UndoHistory.transact()` (or delegate to an engine-backed `pushUndo` for kernel call sites); define snapshot capture/restore in the domain's own state module and register the domain via `registerUndoDomain` (see [undo section of add-a-module guide](file:///Users/amrit/fractals/apps/fractalengine/docs/guides/add-a-module.md), `src/lib/state/undoHistory.svelte.ts` and ADR-026).
10. **Documentation Integrity**: After every task or set of tasks completions, do these steps:
	- Update the `docs/areas/` doc(s) for what you touched; add an ADR for decisions; update a guide if a playbook changed; run `tests/unit/docs-contracts.test.ts` — it enforces index coverage and file-table freshness. Regenerate file tables via `pnpm docs:filetables` after adding/moving source files.
	- Document all styling additions and changes in `docs/design` folder, use the SKILL.md file in `agents/skills/styling-docs-builder`. Update the DESIGN.md file there.
	- Use the SKILL.md file at `agents/skills/adr-writing` to update/add relevant files in folder `docs/adr`.
	- Regenerate the affected rows in [`docs/INDEX.md`](file:///Users/amrit/fractals/apps/fractalengine/docs/INDEX.md) via `agents/skills/doc-frontmatter` (see Section 3) so the index never drifts from what's on disk.

11. **Settings & Contributions Check**: After every task or set of task completions, if you have edited/created components or pages, consider what should be added to settings and/or the contribution registry. For new commands, keybindings, or header actions, declare them in your module's `contributions.ts` (or `src/lib/state/coreContributions.ts` for shell features) (see [command guide](file:///Users/amrit/fractals/apps/fractalengine/docs/guides/add-a-command-or-keybinding.md)); the palette, shortcut handler, and header render from the registry automatically. `SettingsDialog.svelte` additions are still manual until the settings-sections phase.
12. **Audit Completeness Protocol**: A green typecheck/build is necessary but never sufficient for a whole-app audit. Before declaring an audit complete:
	- Build a mutation inventory and verify every user action has one atomic undo entry, including composite actions such as closing an active tab and selecting its successor. New mutations must run inside `UndoHistory.transact()`; engine invariants themselves are covered by `tests/unit/undo-history.test.ts`.
	- Exercise async actions under failure, cancellation, out-of-order completion, mid-operation navigation, and immediate teardown.
	- Test persisted data with malformed, duplicate, missing-optional-field, legacy-compatible, and boundary-value fixtures.
	- Run `tests/unit/contribution-contracts.test.ts`; extend it when adding a new contribution TYPE.
	- Add adjacent regression coverage: test the caller before and after the changed boundary, not only the exact function that was fixed.
	- Run the complete quality suite only after targeted adversarial tests pass, then inspect `git diff --check` and the final mutation/documentation inventory.

13. **Hostile-HTML Boundary**: Any `{@html}` expression in a `.svelte` component must render sanitized output via `$lib/sanitizeHtml` profiles (see [html guide](file:///Users/amrit/fractals/apps/fractalengine/docs/guides/render-external-html.md)). `tests/unit/html-boundary.test.ts` enforces this across all `.svelte` files — a new `{@html}` anywhere not in the allowlist fails with "route it through sanitizeHtml — see ADR-028". The sanitization profiles (markdown, svg, imported, inline) are documented in [sanitizeHtml.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/sanitizeHtml.ts) and ADR-028.
---

## 2. Directory Structure

- [src/lib/components/](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components): Modular Svelte 5 components (AIChat, AppDock, Browser, Canvas, CommandPalette, Minimap, SettingsDialog, TemplateGallery, Tile, TileDock, etc.).
  - [src/lib/components/ai-elements/](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements): Reusable AI Copilot primitives — `Conversation` (auto-stick scroll), `Response` (markdown + Mermaid routing), `Reasoning` (collapsible CoT), `Code` (read-only CodeMirror), `Mermaid` (lazy diagram renderer), `CopyButton`, `Actions`, `ModelSelector` (searchable model palette), plus `checkpoint/` (state restore marker) and `context/` (token-usage meter) submodules. See [`types.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/types.ts) for the shared Stream A ↔ Stream B contracts.
- [src/lib/modules/](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules): Module directories — each contains a self-contained feature domain with its own components, state, and styles:
  - [src/lib/modules/ai/](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai): AI module (`components/`, `state/`, `styles/`, `types.ts`) — AiLayout, AiSidebar, ChatColumn, WorkPanel, SessionRow — see `docs/adr/ADR-024-ai-module-embed-dont-rewrite.md`.
  - [src/lib/modules/bookmarks/](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/bookmarks): Bookmarks module (`components/`, `state/`, `styles/`, `contributions.ts`) — BookmarksLayout, BookmarksState — see `docs/adr/ADR-027-data-layer-mock-engine.md`.
  - [src/lib/modules/designer/](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer): Designer module (`engine/`, `state/`, `components/`, `data/`, `styles/`) — see `docs/adr/ADR-021-designer-module-extraction.md`.
  - [src/lib/modules/notes/](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/notes): Notes module (`components/`, `state/`, `styles/`, `frontmatter.ts`) — see `docs/adr/ADR-022-notes-module-extraction.md`.
  - [src/lib/modules/ide/](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide): IDE module (`components/`, `fileIcons.ts`, `styles/`) — ClassicIdeLayout, Editor, Sidebar, Terminal, TreeNode — see `docs/adr/ADR-023-ide-module-extraction-and-kernel-deferral.md`.
- [src/lib/modules/ide/fileIcons.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/ide/fileIcons.ts): Filetype-to-icon mapping for sidebar file tree (maps extensions/filenames to icons from `static/iconset/`).
- [src/lib/state/](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state): Svelte 5 runes global state registry — [ide.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts), [contributions.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/contributions.svelte.ts) (contribution registry), plus module-scoped declaration files for [core](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/coreContributions.ts), [notes](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/notes/contributions.ts), [designer](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/contributions.ts), and [ai](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/contributions.ts).
- [src/lib/styles/](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles): Indented SASS stylesheet files.
- [docs/design/](file:///Users/amrit/fractals/apps/fractalengine/docs/design): Design system reference (tokens, typography, layout, classes, fonts) — start at [DESIGN.md](file:///Users/amrit/fractals/apps/fractalengine/docs/design/DESIGN.md) for progressive discovery.
- [docs/areas/](file:///Users/amrit/fractals/apps/fractalengine/docs/areas): Domain-specific functional architecture documentation (e.g. state management, undo/redo boundaries, core systems).
- [docs/guides/](file:///Users/amrit/fractals/apps/fractalengine/docs/guides): Standard task playbooks for developers (e.g. adding a module, command, keybinding, or IPC endpoint).
- [agents/skills/](file:///Users/amrit/fractals/apps/fractalengine/agents/skills): Individual capability skills for background tasks.
- [agents/orchestrators/](file:///Users/amrit/fractals/apps/fractalengine/agents/orchestrators): Unified orchestrator instructions for coordinating agents.

---

## 3. Instructions

1. **Never open a file in `docs/adr/`, `docs/design/`, `docs/areas/`, or `docs/guides/` speculatively.** Read `docs/INDEX.md` first — it's one file with one row per doc (id, title, tags, relates_to, path), a fraction of the cost of opening even two or three candidate docs to see which is relevant.
2. **Grep the index, don't skim it whole.** `grep -i <keyword> docs/INDEX.md` against tags/titles/ids to jump straight to the relevant row(s) instead of reading the full manifest top to bottom.
3. **Only `Read` the underlying doc once the index confirms it.** The index's `summary`/`tags` columns exist precisely so you can rule files in or out without opening them — treat opening a doc as the expensive fallback, not the first move.
4. **Follow `relates_to` instead of re-searching.** If the index row for your target doc lists related ids, check those rows next rather than grepping the index again from scratch.
5. **Keep `docs/INDEX.md` in sync.** Whenever you add, rename, delete, or change the frontmatter of a file in `docs/adr/`, `docs/design/`, `docs/areas/`, or `docs/guides/` (or add/change a skill or orchestrator), use `agents/skills/doc-frontmatter` to update that file's frontmatter and the registry, then regenerate the affected rows in `docs/INDEX.md`. A stale index defeats the entire point — it must always match what's on disk.
6. **Identify what skills or orchestrators you can use for any current task from the `docs/INDEX.md`, use them.

---

## 4. Co-learnings

The folder `chat` inside the `agents` folder (`fractaldesign/agents/chat`) belongs to you, the agents. At any time, if you feel like, you can add a new markdown document here speaking on whatever you want to - a learning, a realization, an amusing story, something you want to share, etc. This is the agents corner to do as they see fit. You may enjoy reading existing documents here. If you do create a document here, follow these rules:

1. all docs should have the following frontmatter:
```
---
id: agentchat-1 //use the next available number
title: Today I Messed Up the Styling //titles should be direct, giving a clear indication what the document is about
type: chat
tags: [tag, tag, tag] //any and all related tags here
summary: "give a one-line summary here"
relates_to: [id, id] //any and all related files' ID here
updated: YYYY-MM-DD
agent: //write here who you are
---
```

2. Write and say whatever you like.
3. You can also choose to reply to an existing chat, in which case the title of your document should be "A Response to Chat ID XX by AgentName".
4. If this is a new doc, add it to the index at `INDEX.md` in `docs/INDEX.md`. 
5. If `docs/INDEX.md` does not exist - create it, follow template of the other registries there.
6. keep INDEX.md up to date.