---
title: fracta
description: Speed-focused Tauri+SvelteKit knowledge base app — instant markdown capture, organize, and OpenAI-compat/local-GGUF Ask agent.
tags: [app, fracta, tauri, sveltekit, knowledge-base, markdown, agent]
type: card
module: apps/fracta
path: /Users/amrit/mandala/apps/fracta
created: 2026-08-04
updated: 2026-08-04
relates_to: [mandala-root, conventions, fractal-agentic]
---

# fracta

- **Path:** `/Users/amrit/mandala/apps/fracta`
- **What:** A speed-focused knowledge base. Markdown files on disk are the source of truth; capture instant, organization + agent assist on top.
- **Stack:** Tauri 2 + SvelteKit 2 + Svelte 5 (runes).
- **Three jobs:** Capture (autosave, source-app auto-tags) · Organize (tags/categories/bookmarks/FTS) · Ask (agent column, OpenAI-compatible SSE or local GGUF via managed `llama-server`).
- **Modes:** `capture` (sidebar+editor, optional Ask column), `organize` (full-width browse). Ask = a *column* over capture, not a separate mode.
- **Key files:** `src/routes/+page.svelte` (shell); `src/lib/state/{entries,bookmarks,prefs,ui,knowledge,ask,agent,rules}.svelte.ts`; `src/lib/agent/{openai-compat.ts,prompt.ts,blocks.ts}`; `src/lib/components/{app-notes,app-sidebar,app-nav,app-organize,AskPanel,AgentSettings,MetadataPanel,RulesPanel}.svelte`; `src/lib/styles/`; `src-tauri/src/{vault.rs,frontmatter.rs,autotag.rs}`.
- **Agent config:** provider name + base URL + key + model → `{baseUrl}/chat/completions` SSE. Local GGUF: spawns `llama-server -m <path>` on free localhost port; Ask streams `http://127.0.0.1:<port>/v1`. Override binary: env `FRACTA_LLAMA_SERVER`. Settings in `localStorage` `fracta:agent`.
- **Roadmap (open):** Rust/SQLite FTS, `[[note]]` wikilinks+backlinks, vault-wide agent context, vault-side config, graph/related view.
- **Conventions:** Svelte 5 runes only; indented `.sass` with `_tokens.sass`; Tauri commands thin, domain logic in Rust modules.
