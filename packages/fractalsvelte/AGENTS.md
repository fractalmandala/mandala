# AGENTS — fractalsvelte

A components library for Sveltekit with no Tailwind, no class-string merging,
and customisation exposed through props. The docs site lives in `src/routes/docs/`; page content lives in `src/content/components/`.

The library still ships from `src/lib/` — SvelteKit keeps them separate automatically.

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


## Page structure

1. `<h1 class="doc-title">` + `<p class="doc-lede">`
2. Hero `<Preview>`
3. **Installation** — npm install *and* copy-paste. We ship both.
4. **Usage** — import + minimal example
5. **Examples** — one `<Examples>` tabbed area
6. **Props** — `<PropsTable>`. Comes *after* Examples: people look for a working example
   first and reach for the API reference second.
7. **Theming** — the tokens the component reads

## Chrome conventions

- **Radius is 3px (`--doc-r`), or 6px (`--doc-r-lg`) for large surfaces** — preview frames,
  tables, cards, drawers. Nothing rounder, and no single-side accent borders: they look
  wrong where the accent meets a rounded corner.
- **Prose selectors must exclude `[data-slot]`.** `docs.sass` styles `p`, `a`, `ul`, `code`
  inside `.doc-article`, and a rendered component sits inside that scope. `<Button href>` is
  an `<a>` and picked up the prose underline until the selector became `a:not([data-slot])`.
  Every new prose rule needs the same exclusion.
- Chrome components live in `src/lib/docs/`: `Preview`, `Examples`, `PropsTable`,
  `CodeBlock`, `Sidebar`, `Toc`.

## Dual distribution

The package is published to npm **and** meant to be copy-pasteable. These conflict: a
component `.sass` that says `+interactive` breaks when the folder is copied alone. A
flattened copy-paste variant (mixins inlined, shared classes resolved) must be generated
from the same source — never maintained by hand.