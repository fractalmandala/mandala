---
id: ai-memory-architecture
title: Local-First AI Memory & Context Harness Visual Contract
type: design
tags: [ai, memory, context, architecture]
summary: Defines the local-first AI memory contract, including worker-thread persistence and non-amplifying encrypted-message migration.
relates_to: [ADR-011]
updated: 2026-07-15
---


Companion document to [ADR-011](../adr/ADR-011-local-first-ai-memory-and-context-harness.md). This is the long-form design for FractalEngine's harnessing, memory, and context management system — how all AI usage (local sidecar models and API providers alike) gets a project-scoped, searchable, durable memory instead of today's ephemeral `chatMessages[]`.

> This document describes a **design**, not yet-shipped code. See "Implementation Roadmap" at the bottom for how this would be built incrementally.

---

## 1. Why this design

Today every AI provider in `AIChat.svelte` — local llama.cpp/MLX sidecar and the 7+ API providers — streams through one `ai-chunk` event (ADR-004) but produces nothing durable. Closing the app loses the conversation. There is no way for the model to know "we chose `jose` over `jsonwebtoken` last session" or "the user always wants undo/redo boundaries on new state" (this very repo's own AGENTS.md rule). `docs/ai-features.md` asks explicitly for projects, memory, history, and skill/orchestrator awareness.

Five existing systems were studied for prior art (full notes in `docs/harnessing/sample1-7`):

| System | Core idea borrowed | Why borrowed / why not wholesale |
|---|---|---|
| **agentmemory** | Hook-driven auto-capture, 4-tier consolidation (working/episodic/semantic/procedural), hybrid BM25+vector+graph search with RRF fusion, decay/forgetting | Borrowed: hybrid search, decay, the insight that ~1,900 tokens/session beats loading everything. Not borrowed: its own server/MCP/multi-agent-coordination layer — single-app, single-user, no separate server needed. |
| **memU** | Workspace runtime compiling raw sources into typed `MemoryItem`s grouped into `MemoryCategory` folders, with `Resource` provenance | Borrowed: the Resource→MemoryItem→Category three-tier shape, and the idea that extraction is "one structured-output LLM call per batch," not an agentic loop. |
| **Honcho** | Workspace→Peer→Session→Message hierarchy; async API/worker split; a single tool-using chat agent with reasoning tiers | Borrowed: the async write-now/reason-later split (don't block chat streaming on extraction), provider-agnostic LLM call layer. Not borrowed: Peer/social-cognition modeling — no multi-peer concept needed for a single local user. |
| **Graphiti** | Temporal context graph, episodes as provenance, bitemporal fact validity | Borrowed only the *idea* of "supersede, don't delete" for contradicting memories. Full graph engine rejected — disproportionate for one project's memory. |
| **Trellis** | Repo-resident `.trellis/spec`, `.trellis/tasks`, `.trellis/workspace` journals; brainstorm→implement→verify→finish loop | Conceptually adjacent (this app already has `agents/skills/`, `agents/orchestrators/`) but Trellis governs *coding-agent* workflow, not end-user AI-chat memory — not directly adopted, mentioned for completeness. |

## 2. Core primitives

Named to match this app's existing vocabulary (not Honcho's "Peer" or memU's generic "MemoryCategory"):

```
Project          — a user-opened local folder (already exists as workspace root)
 └─ Session       — one AI Copilot chat thread
     └─ Message   — one chat turn (user or assistant), with structured attachment refs
 └─ MemoryItem    — typed, atomic, extracted memory (the searchable/injectable unit)
     └─ Resource  — provenance pointer back to the Message/file/action it came from
 └─ SkillUsage    — record of which agents/skills or agents/orchestrators got referenced,
                     and whether the user corrected the outcome (procedural memory)
```

- **Project** gets a sidecar `.fractal/memory.db` (SQLite), created lazily next to the existing `.fractal-workspace` file on first AI interaction in that folder. No project open → AI Copilot behaves exactly as it does today (ephemeral, in-memory only).
- **MemoryItem** is the layer actually searched and injected into context — never raw message text. Types: `preference | decision | fact | file_pattern | skill_usage | error_fix`. This is the single most important design choice: it's what keeps token cost flat as history grows, instead of degrading the way a raw-transcript-search system does.
- **Resource** lets the UI (future) answer "why does the AI think this" by tracing a MemoryItem back to its source message or file.

## 3. Storage

One SQLite database per project, opened via `rusqlite` from the Rust side. No Postgres, no Docker, no network service — consistent with the app's local-first, zero-external-deps posture. Message content is AES-256-GCM encrypted using a per-purpose Keychain key and an explicit versioned envelope. Database open, migration, encryption, decryption, and writes execute on blocking workers rather than the application event loop.

```sql
sessions(id, project_path, title, created_at, updated_at)
messages(id, session_id, role, content, attachments_json, created_at)
memory_items(
  id, project_path, type, summary, embedding BLOB,
  importance REAL, decay_score REAL,
  created_at, last_accessed_at, superseded_by
)
resources(id, memory_item_id, message_id, file_path, excerpt)
skill_usage(id, project_path, skill_path, session_id, was_corrected, created_at)
```

- `messages` gets an SQLite **FTS5** virtual table for BM25 keyword search.
- `memory_items.embedding` is a BLOB of floats; similarity search is brute-force cosine over however many MemoryItems a single project accumulates — both memU's and agentmemory's own SQLite tiers do exactly this, and it's fine at single-project scale (hundreds to low-thousands of items, not millions).
- `superseded_by` implements "contradicting memory replaces, doesn't delete" (the simplified Graphiti idea) without a graph engine.

## 4. Pipeline

Runs identically regardless of whether the active provider is the local sidecar or an API key — this is why a shared Rust function matters (see §5).

```
Capture        →  Extract (background)      →  Embed (local-only)   →  Consolidate (periodic)
───────────       ──────────────────────        ──────────────────      ──────────────────────
write message     1 structured-output LLM       embed MemoryItem        dedup near-duplicates,
to messages        call per turn → 0..N           summary using           decay unaccessed items,
table,              MemoryItems                    loaded sidecar          mark contradictions
synchronous,                                        model if present,       superseded_by, not
cheap                                               else bundled local      deleted
                                                     embedding path —
                                                     never an API call
```

1. **Capture** — every completed chat turn, and every `@file`/`/skill` reference event, is queued immediately and persisted on a blocking worker. The renderer does not await this best-effort write, and AppKit never performs SQLite/Keychain work. Plaintext migration is a transactional one-time operation; authentication failure is treated as unavailable ciphertext, never as plaintext.
2. **Extract** — after a turn (or on session idle), one structured-output LLM call turns the turn into MemoryItems. This is memU's/Honcho's "minimal deriver" pattern deliberately, not an agentic tool-loop: predictable cost, predictable latency, one call per turn, not N.
3. **Embed** — local-only, by explicit requirement. If a local sidecar model is already loaded, reuse it for embeddings; otherwise use a small bundled local embedding path. This step never calls an API provider, even if the user's active chat provider is an API model — embedding indexing must not leak project content over the network.
4. **Consolidate** — a periodic sweep (on session end or idle, not a cron daemon — this is a desktop app, not a server) that merges near-duplicate MemoryItems, decays items nobody's retrieved in a long time, and marks contradicting same-type items as superseded.

## 5. Provider-agnostic LLM client (new)

`run_api_model()` in `src-tauri/src/lib.rs` currently inlines per-provider HTTP request/response handling directly in the interactive-chat code path. The Extract step (§4.2) needs the exact same "send a prompt to whichever provider is configured, get text back" capability, but as a plain function call, not a streaming Tauri command.

**Design:** factor a `run_completion(provider_config, prompt) -> Result<String>` function out of the existing per-provider branches in `run_api_model()`. Interactive chat keeps its streaming `ai-chunk` event path; the Extract pipeline calls the same underlying function non-streaming. This avoids duplicating OpenAI/Anthropic/Gemini/Ollama request-building logic in two places — one of the few places this design recommends a small refactor of existing code, not just new code.

## 6. Retrieval & context assembly

At chat-send time, before a prompt reaches any provider:

1. Run BM25 (FTS5) and cosine-vector search over `memory_items`, scoped to `project_path`.
2. Fuse with Reciprocal Rank Fusion (agentmemory's RRF, k≈60 is a reasonable starting constant).
3. Token-budget the fused result (default ~1500 tokens — agentmemory's own benchmarked number for "useful without bloating the prompt").
4. Inject as a system-prompt block, **alongside, never instead of**, the already-planned explicit `@file` attachment content and `/skill` persona injection. Explicit references always win over inferred memory — a user who explicitly attaches a file doesn't want it second-guessed by a stale MemoryItem.

## 7. IPC surface (extends the single gateway, ADR-004)

All new commands are project-scoped and added to `ipc.ts` with matching `ipc-mock.ts` browser-mode implementations, same pattern as every existing IPC command:

| Command | Purpose |
|---|---|
| `openProjectMemory(path)` | Lazily creates/opens `.fractal/memory.db` for a project |
| `memorySearch(query, projectPath)` | Hybrid BM25+vector retrieval, returns ranked MemoryItems |
| `memorySaveItem(item)` | Manual save (future UI affordance, e.g. "remember this") |
| `listSessions(projectPath)` | History list for a project |
| `loadSession(sessionId)` | Rehydrate a past session's messages into chat UI |
| `memoryConsolidate(projectPath)` | Trigger the consolidation sweep on demand (also runs automatically on session end/idle) |

## 8. What this explicitly does not do (scope boundary)

- **No knowledge graph / entity-relationship engine.** Graphiti's temporal graph is powerful but is built for evolving facts about many entities over long-running production agents — disproportionate to one user's local project memory. If flat MemoryItem search ever proves insufficient (unlikely below thousands of items), this is the first place to revisit, as its own ADR.
- **No multi-user, team, or cloud-sync features.** Honcho's Workspace/Peer paradigm assumes many users and agents sharing infrastructure; this app is single-user and local-only.
- **No new UI in this design pass.** A memory/history panel, project switcher, and "what does the AI remember" inspector are natural follow-ups but are out of scope until this data/pipeline layer is implemented and proven.

## 9. Implementation Roadmap (for a future planning pass — not this document's job to execute)

1. **Phase 1 — Storage foundation:** add `rusqlite` to `Cargo.toml`; schema migrations; `openProjectMemory`/message capture only (no extraction yet). Chat becomes durable per-project even before memory search exists.
2. **Phase 2 — Extraction & embedding:** factor `run_completion()` out of `run_api_model()`; implement the Extract and Embed steps; background-trigger after each turn.
3. **Phase 3 — Retrieval & injection:** FTS5 + cosine search + RRF; wire into the existing `sendAiMessage()` flow in `ide.svelte.ts` ahead of `@file`/`/skill` injection.
4. **Phase 4 — Consolidation & UI:** decay/dedup/supersede sweep; first UI surface (history list, memory inspector) once the underlying data is trustworthy.

Each phase should land as its own implementation plan with its own verification step — this document is the shared reference they all build against.
