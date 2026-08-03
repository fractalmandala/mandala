# AGENTS.md — fracta

A speed-focused knowledge base. Tauri 2 + SvelteKit 2 + Svelte 5 (runes) desktop app.

Markdown files on disk are the source of truth. Capture is instant; organization and
agent assist grow on top without fighting the vault.

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


## Product north star

**fracta** is for performance notes, agent sessions, research clips, and long-term
knowledge — not a second brain bloated with chrome. Three jobs:

1. **Capture** — open → paste → gone. Autosave, source-app auto-tags, zero friction.
2. **Organize** — tags, categories, bookmarks, full-text search over the vault.
3. **Ask** — agent column over the active note. Streams from any OpenAI-compatible
   API the user configures (key + base URL + provider name + model).

### Design principles

- Files first: every entry is a `.md` with YAML frontmatter in a user-chosen vault folder.
- Quiet UI: separation by weight and spacing, not heavy borders. Indented SASS + tokens.
- Draft-first: empty drafts never touch disk; first real content materializes a file.
- Browser preview works without Tauri (empty draft, no vault I/O).

## Architecture

```
src/
  routes/+page.svelte          # App shell: modes, chrome, shortcuts
  lib/
    ipc.ts                     # Tauri command surface
    markdown.ts                # TipTap ↔ markdown
    state/
      entries.svelte.ts        # Vault + active entry + autosave
      bookmarks.svelte.ts      # Pinned ids (localStorage for now)
      prefs.svelte.ts          # Font family / size
      ui.svelte.ts             # Modes, panels
      knowledge.svelte.ts      # Derived index: tags, categories, library rows
      ask.svelte.ts            # Ask transcript + streaming agent
      agent.svelte.ts          # Provider / key / URL / model settings
      rules.svelte.ts          # Source-app auto-tag rules
    agent/
      openai-compat.ts         # OpenAI-compatible SSE chat client
      prompt.ts                # System prompt from open note
      blocks.ts                # Markdown → AskBlock[]
    components/
      app-notes.svelte         # Capture editor (TipTap)
      app-sidebar.svelte       # Entry list + search
      app-nav.svelte           # Mode switcher
      app-organize.svelte      # Tags / bookmarks / categories browser
      AskPanel.svelte          # Agent column
      AgentSettings.svelte     # API key / URL / model
      MetadataPanel.svelte
      RulesPanel.svelte
    styles/                    # Indented SASS, token-driven
src-tauri/src/
  vault.rs                     # List / read / write / delete entries
  frontmatter.rs               # YAML meta
  autotag.rs                   # Clipboard source → tags
```

## Modes (`ui.mode`)

| Mode       | Purpose                                      |
|------------|----------------------------------------------|
| `capture`  | Default. Sidebar + editor. Optional Ask col. |
| `organize` | Full-width browse by tag / category / pin.   |

Ask is a **column** over capture, not a separate mode — keeps the note in view.

## Keyboard

| Shortcut        | Action                    |
|-----------------|---------------------------|
| `⌘ N`           | New draft                 |
| `⌘ S`           | Save now                  |
| `⌘ ⇧ B`         | Toggle bookmark (pin)     |
| `⌘ 1`           | Capture mode              |
| `⌘ 2`           | Organize mode             |
| `⌘ /` or `⌘ K`  | Focus search              |
| `⌘ .`           | Toggle Ask column         |
| `⌘ I`           | Toggle metadata           |
| `⌘ D`           | Open / create daily note  |
| `Esc`           | Close panels              |

## Conventions

- Svelte 5 runes only (`$state`, `$derived`, `$props`, `$effect`). No legacy stores for new state (except existing `iW` layout flag).
- Indented `.sass` with tabs. Design tokens in `_tokens.sass`. No new SCSS.
- Prefer shared layout classes in `styles/` over large component `<style>` blocks for shell UI.
- Tauri commands stay thin; domain logic in Rust modules under `src-tauri/src/`.

## Roadmap (scaffolded → next)

- [x] Vault CRUD, autosave, TipTap capture, source auto-tags
- [x] Bookmarks, metadata, rules panel
- [x] Multi-mode shell: capture + organize + ask column
- [x] Knowledge index (tags / categories derived from summaries)
- [x] Daily note helper
- [x] Configurable OpenAI-compatible agent (stream over open note)
- [x] Local GGUF via managed llama-server
- [ ] Full-text search index (Rust / SQLite FTS)
- [ ] Wikilinks `[[note]]` and backlinks
- [ ] Vault-wide agent context (not only open note)
- [ ] Bookmarks + prefs in vault-side config (not only localStorage)
- [ ] Graph / related notes view

## Agent configuration

User opens **Agent** in the header (or **Connect** in the Ask column).

### Mode: API provider

| Field          | Example                          |
|----------------|----------------------------------|
| Provider name  | `xAI`, `OpenRouter`, `Ollama`    |
| API base URL   | `https://api.x.ai/v1`            |
| API key        | provider secret                  |
| Model          | exact API slug (not display name)|

Presets fill name / URL / model. Settings live in `localStorage` under `fracta:agent`.
Requests go to `{baseUrl}/chat/completions` with SSE streaming.

### Mode: Local GGUF

1. Install llama.cpp so `llama-server` is on PATH (`brew install llama.cpp` on macOS).
2. Agent → **Local GGUF** → **Choose .gguf…** (loads into memory via managed server).
3. Backend spawns `llama-server -m <path>` on a free localhost port; Ask streams from
   `http://127.0.0.1:<port>/v1` (same OpenAI-compatible client as remote).
4. Override binary path with env `FRACTA_LLAMA_SERVER` if needed.

Unload from Agent settings when finished. Large models need RAM; first load can take a while.
CSP allows `https:` and localhost for APIs / local servers.
