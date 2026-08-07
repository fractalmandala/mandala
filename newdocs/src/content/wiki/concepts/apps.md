---
title: Apps Module
description: Tauri+SvelteKit desktop apps under apps/ — fracta knowledge base, shradhapp, fractaldesk docs, vendored CodeEdit.
tags: [apps, tauri, sveltekit, desktop, fracta, shradhapp]
type: concept
module: apps
path: apps
created: 2026-08-04
updated: 2026-08-06
---

Desktop applications built on Tauri 2 + SvelteKit 2 + Svelte 5 (runes). Each app keeps a thin Tauri command surface (`src-tauri/src/` with domain logic in Rust modules, and a SvelteKit front-end in `src/`.

## In-scope apps

### fracta — `apps/fracta`
A speed-focused knowledge base. Markdown files on disk are the source of truth; capture is instant, organization and agent assist grow on top.

- **Three jobs:** Capture (open → paste → gone, autosave, source-app auto-tags) · Organize (tags, categories, bookmarks, full-text search) · Ask (agent column streaming from any OpenAI-compatible API, or local GGUF via managed `llama-server`.
- **Modes:** `capture` (sidebar + editor, optional Ask column) and `organize` (full-width browse by tag/category/pin). Ask is a *column* over capture, not a separate mode — keeps the note in view.
- **Architecture:** `src/routes/+page.svelte` shell; `src/lib/state/*` (entries, bookmarks, prefs, ui, knowledge, ask, agent, rules); `src/lib/agent/` (openai-compat SSE client, prompt, blocks); `src/lib/components/` (app-notes TipTap editor, sidebar, nav, organize, AskPanel, AgentSettings, MetadataPanel, RulesPanel); `src/lib/styles/`. `src-tauri/src/` has `vault.rs`, `frontmatter.rs`, `autotag.rs`.
- **Agent config:** user enters provider name + API base URL + key + model; requests hit `{baseUrl}/chat/completions` with SSE. Local GGUF spawns `llama-server -m <path>` on a free localhost port; Ask streams from `http://127.0.0.1:<port>/v1` via the same client. Override binary with env `FRACTA_LLAMA_SERVER`. Settings persist in `localStorage` under `fracta:agent`.
- **Roadmap (open):** Rust/SQLite FTS index, `[[note]]` wikilinks + backlinks, vault-wide agent context, vault-side config, graph/related view.

### shradhapp — `apps/shradhapp`
A SvelteKit app whose styling system is still evolving. Strict SASS discipline applies (see [Coding Conventions](../cards/conventions.md)):
1. Indented SASS only — never SCSS or CSS.
2. No singular-element classes; create reusable general classes (borders, gaps) from `src/lib/styles`.
3. After any styling change, self-check: did this increase divergence/drift? If yes, reverse it.

Carries `DESIGN.md`, `design-tokens.json`, a `svelte-video-editor-ref/` reference, and an `audit/drag-drop-*` review folder.

### fractaldesk — `apps/fractaldesk`
Not a code app — a docs reference bundle for **Open WebUI**. Agent-readable: discover pages via `https://docs.openwebui.com/sitemap.xml`, search via `/api/search?q=`, fetch `.md`/`.txt` variants, cite canonical HTML URLs. Ships `llms.txt` and `llms-full.txt` corpora.

### CodeEdit-main — `apps/CodeEdit-main`
A vendored third-party **Swift/Xcode macOS code editor** (CodeEdit.app). Reference only — not part of the SvelteKit stack. Built with SwiftPM/Xcode; its `.gitignore` is Xcode-oriented (DerivedData, xcuserdata, Carthage, fastlane). Treat as a study reference, not a build target of this monorepo.

## Excluded apps (separately-tracked repos)
`apps/fractalknow`, `apps/fractalengine`, `apps/fractalai` are listed in the root `.gitignore` and excluded from this knowledge build. (fractalengine is described in the project AGENTS.md as the "current project" — its full AGENTS.md lives at `apps/fractalengine/AGENTS.md` if re-included later.)

See [Packages Module](packages.md) and [Coding Conventions](../cards/conventions.md).
