# Agents

The styling system and design of this app is still evolving. So just a few rules MUST BE MAINTAINED:

1. All styling is in single-tab indented SASS. Not SCSS or CSS. Pure old SASS without curly braces or semi colons.
2. Do not create new classes for singular items or elements. If need be, create classes that are reusable general classes. For example, about borders, or gaps, etc. Use the existing classes in `src/lib/styles`.
3. At all times, after you add any styling, ask and check yourself - has your styling decision increased divergence and drift? If it has - reverse your styling.

## Fractal Agentic plugin mandate (required session bootstrap)

**Before any other project work** on a non-trivial task (implementation, review, refactor,
scaffold, debug beyond a one-line answer, port, docs batch, or multi-step plan), you MUST
detect whether the **Fractal Agentic** plugin is installed and readable, and if it is, you
MUST use it for the rest of the session without waiting for the user to `@` or tag it.

### Detection (run first)

1. If env `FRACTAL_AGENTIC_ROOT` is set and `$FRACTAL_AGENTIC_ROOT/plugin.json` exists, use that root.
   (If the env points at the monorepo checkout and `$FRACTAL_AGENTIC_ROOT/plugin/plugin.json`
   exists, use `$FRACTAL_AGENTIC_ROOT/plugin` instead.)
2. Otherwise search upward from the project / workspace root for the first directory that
   contains **all** of:
   - `plugin.json` with `"name": "fractal-agentic"` (or equivalent name field)
   - `AGENTS.md`
   - `skills/boss-orchestration/SKILL.md`
   - `commands/orchestrate.md`
3. Prefer monorepo-relative candidates (stop at the first hit):
   - `<workspace>/fractal-agentic/plugin`
   - `<workspace>/agentic/fractal-agentic/plugin`
   - `<workspace>/../fractal-agentic/plugin`
   - `<repo-root>/fractal-agentic/plugin` (walk up from cwd until `.git` or filesystem root)
   - marketplace / clone installs where the checkout root **is** the plugin (has `plugin.json` at root)
4. Optional shell probe (if the script is reachable):
   ```sh
   # from the plugin root, or after resolving a candidate root:
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

