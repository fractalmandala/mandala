---
id: ADR-011
title: Local-First AI Memory and Context Harness
type: adr
tags: [ai, memory, context]
summary: Proposes a local-first memory and context harness for the AI Copilot so conversation history and project context persist without a remote backend.
relates_to: [ADR-009]
status: proposed
updated: 2026-07-15
---


**Status:** Proposed
**Date:** 2026-06-25
**Decision makers:** Architecture Committee, AI Integration Lead

---

## Context

FractalEngine's AI Copilot (`AIChat.svelte`, `ide.svelte.ts`, `ipc.ts`, `src-tauri/src/lib.rs`) routes chat through nine provider categories — local llama.cpp/MLX sidecar models and API providers (OpenAI, Anthropic, Gemini, DeepSeek, xAI, Z.ai, Ollama, custom) — all converging on a single `ai-chunk` streaming event (see ADR-004). Every chat session today is ephemeral: messages live only in Svelte runes state (`chatMessages[]`), vanish on reload, and there is no project-scoped memory, no history search, and no mechanism for the model to recall prior decisions, file conventions, or skill usage across sessions.

`docs/ai-features.md` calls for "projects" (any user-selected local folder), built-in memory/history/context management, and skills/orchestrators awareness via `@file` and `/skill` references — none of which exist yet.

Five reference memory/context systems were surveyed (`docs/harnessing/sample1-7`): agentmemory (hook-driven capture, 4-tier consolidation, hybrid BM25+vector+graph search with RRF, decay/forgetting), memU (workspace runtime compiling sources into typed Index/Skill/Memory layers), Honcho (Workspace→Peer→Session→Message hierarchy with async background reasoning), Graphiti (temporal context graphs with provenance), and Trellis (repo-resident spec/task/journal loop). FractalEngine is a single-user, local-first desktop app (Tauri) — patterns requiring external servers, Postgres/Docker, multi-tenant team sharing, or knowledge-graph engines were rejected as disproportionate to this scope.

## Decision

Adopt a **local-first, project-scoped memory and context harness**, backed by **SQLite via `rusqlite`** (one database per project, no external services), with the following primitives and pipeline:

1. **Project** — a user-opened local folder gains a sidecar `.fractal/memory.db`, created lazily on first AI interaction. Without an active project, the AI Copilot falls back to today's ephemeral session-only behavior.
2. **Session / Message** — existing chat threads and turns become durable once a project is active, with `@file` attachments and `/skill` references recorded as structured metadata, not inlined text.
3. **MemoryItem** — a typed, atomic extracted memory (`preference | decision | fact | file_pattern | skill_usage | error_fix`) is the unit that gets searched and injected into context — not raw messages. This avoids the token-bloat failure mode of loading full history into every prompt.
4. **Resource** — a provenance pointer from a MemoryItem back to the message/file/action it was derived from.
5. **Pipeline** — Capture (immediate renderer enqueue, blocking-worker SQLite/Keychain write) → Extract (single structured-output LLM call per turn, via a new provider-agnostic `run_completion()` Rust function shared with interactive chat) → Embed (local-only, never calls an API provider for this step) → Consolidate (periodic dedup/decay/supersede sweep, not a cron daemon).
6. **Retrieval** — hybrid BM25 (SQLite FTS5) + brute-force cosine vector search, scoped to the active project, reciprocal-rank-fused, token-budgeted (~1500 tokens default), injected as a system-prompt block. Explicit `@file`/`/skill` references always take precedence over inferred memory.
7. **IPC** — new project-scoped commands (`openProjectMemory`, `memorySearch`, `memorySaveItem`, `listSessions`, `loadSession`, `memoryConsolidate`) added to the single IPC gateway (ADR-004), with matching mock implementations in `ipc-mock.ts`.
8. **Project lifecycle isolation** — every async project-memory/session result must carry the project path and a monotonically increasing request generation. A result may mutate renderer state only when both still match the active workspace. Opening another root cancels the current stream and clears project-scoped chat, session, provider, attachment, selection, and pending clipboard state before initializing the new project.

Full data model, pipeline detail, and phased implementation roadmap are in [`docs/design/AI-MEMORY-ARCHITECTURE.md`](../design/AI-MEMORY-ARCHITECTURE.md).

## Explicitly Rejected / Deferred

- **No knowledge graph engine** (Graphiti-style entity/relationship graph with temporal validity windows) — adds a dependency and complexity disproportionate to one project's memory at this scale. Revisit only if flat MemoryItem search proves insufficient.
- **No multi-user/team sharing, no cloud sync, no peer modeling** — this is a single-user local app; Honcho's Workspace/Peer paradigm does not apply.
- **No new UI this round** — a memory/history panel and project switcher are follow-up work once this architecture is implemented.

## Consequences

- **Positive:** AI chat gains cross-session memory and project awareness with zero new external dependencies or services (consistent with the app's no-cloud, local-first posture). Memory extraction reuses whichever LLM provider is already configured, so it costs nothing extra to wire per-provider.
- **Negative:** Adds `rusqlite` and a background extraction/consolidation pipeline. Every SQLite migration, query/write, encryption/decryption, and Keychain access must stay off the UI thread and the streaming chat path.
- **Negative:** Generation guards deliberately discard stale completions instead of displaying them; callers must retry a session/provider refresh after switching back to a project.
- **Follow-up:** A separate implementation plan must scaffold the SQLite schema, the Rust storage/embedding/retrieval modules, the new IPC commands and their mocks, and (later) the memory/history UI panel.
