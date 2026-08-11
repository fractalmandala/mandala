---
id: ai-layer-fresh-plan
title: Fresh AI Layer Implementation Plan
type: plan
tags: [plan, ai, architecture, providers, local-models, streaming]
status: proposed
updated: 2026-07-17
---


A ground-up design for an integrated AI layer in an existing SvelteKit (Svelte 5 runes) + Tauri 2 desktop app: API providers (BYOK), workspace `.env` providers, local GGUF models, streaming chat with sessions, token accounting, and full browser-mock parity. Written to be executed by a human agent phase by phase; every phase has explicit deliverables, file paths, and acceptance criteria.

**Design inputs:** this plan encodes the failure modes actually debugged in the current FractalEngine AI layer (see §9 Pitfalls Ledger). The architecture exists to make those bugs *unrepresentable*, not merely fixed.

---

## 1. Design principles

1. **One model registry, one active-model pointer.** The current layer resolves "what model is active" from three cooperating fields (`aiProvider`, `activeApiModel`, `selectedModelId`) with per-provider branch logic. The fresh layer has a single `ModelRef` (`{ modelId: string }`) pointing into a single typed registry. Resolution is a lookup, never a branch.
2. **Providers are adapters, not branches.** `sendMessage()` never contains `if (provider === 'custom')`. Each provider kind implements one `ProviderAdapter` interface; the runtime picks an adapter from the registry entry and calls it.
3. **Credentials are write-only from the frontend.** Keys go straight to the OS keychain via IPC and never come back. Frontend state holds only `credentialId` handles. A model record is persisted *after* its credential write is confirmed (never before), and deleted credentials cannot be resurrected by settings re-commits — drafts hold handles, not values.
4. **Streaming is a generation-stamped event contract.** Every stream run gets a monotonically increasing `runId`; every chunk/done/error event carries it; consumers drop events from stale runs. Out-of-order and post-cancel events become no-ops by construction.
5. **The app is never "ready when it looks ready."** Registry hydration is an explicit async lifecycle with an awaitable `ready` promise and a UI-visible state. Sending is disabled until `ready` resolves. (The current layer's send-before-rehydration race becomes impossible.)
6. **Single IPC gateway + mandatory browser mock parity**, enforced by a contract test over a shared `AiIpc` interface — keep this from the current architecture, it works.
7. **Versioned, sanitized persistence.** Every persisted document (registry, sessions, usage) carries `schemaVersion`; loaders run sanitizers with malformed/legacy/boundary fixture tests before anything touches state.
8. **Config mutations are undoable.** Registry mutations (add/remove/select model, URLs) run inside the app's undo domain, one atomic entry per user action, with credential changes tracked by revision for undo of key writes.

---

## 2. Architecture overview

```
┌─ UI ────────────────────────────────────────────────────────┐
│ ChatPanel · ModelPicker · SettingsModels · StatusPill        │
└──────┬───────────────────────────────────────────────────────┘
       │ (runes state, no IPC)
┌──────▼───────────────────────────────────────────────────────┐
│ src/lib/ai/                                                  │
│  registry.svelte.ts   — models, providers, activeRef, ready  │
│  chat.svelte.ts       — sessions, messages, ChatRun state     │
│  adapters/            — api.ts · env.ts · local.ts (+ mockable)│
│  usage.svelte.ts      — token accounting                     │
└──────┬───────────────────────────────────────────────────────┘
       │ AiIpc interface (single gateway)
┌──────▼──────────────┐        ┌──────────────────────────────┐
│ src/lib/ai/ipc.ts   │◄──────►│ src/lib/ai/ipc-mock.ts       │
│ (Tauri invoke/events)│ parity │ (browser dev + e2e)          │
└──────┬──────────────┘  test  └──────────────────────────────┘
┌──────▼───────────────────────────────────────────────────────┐
│ src-tauri/src/ai/                                             │
│  mod.rs · vault.rs (keychain) · stream.rs (SSE/proxy)        │
│  local.rs (llama.cpp sidecar) · store.rs (registry/sessions) │
└───────────────────────────────────────────────────────────────┘
```

Frontend module boundary: **everything AI lives under `src/lib/ai/`** (state, adapters, ipc, types). UI components live in `src/lib/ai/components/`. Nothing AI-related in a god-object app state.

---

## 3. Data model & contracts

### 3.1 Registry (TypeScript, `src/lib/ai/types.ts`)

```ts
export type ProviderKind = 'api' | 'env' | 'local';

export interface ModelRecord {
  id: string;                 // stable ULID, the ONLY key anything references
  kind: ProviderKind;
  label: string;              // user-facing name
  modelId: string;            // provider-side model name (e.g. "gpt-5.2", "qwen3.gguf")
  // api / env:
  apiFormat?: 'openai' | 'anthropic' | 'ollama';
  baseUrl?: string | null;
  credentialId?: string;      // keychain handle; NEVER the key itself
  envVar?: string;            // env kind: which .env var supplies the key
  // local:
  filePath?: string;          // gguf path
  mmprojPath?: string | null;
  contextLength?: number;
  createdAt: number;
  schemaVersion: 1;
}

export interface AiRegistryDoc {
  schemaVersion: 1;
  models: ModelRecord[];
  activeModelId: string | null;   // the single pointer
}
```

### 3.2 Provider adapter (`src/lib/ai/adapters/types.ts`)

```ts
export interface StreamHandle { runId: number; cancel(): Promise<void>; }

export interface ProviderAdapter {
  kind: ProviderKind;
  /** Throws AiError with a typed code — never a bare string. */
  start(model: ModelRecord, req: ChatRequest, runId: number): Promise<StreamHandle>;
  /** Cheap health probe for the settings UI (key present, file exists, server up). */
  probe(model: ModelRecord): Promise<ProbeResult>;
}

export type AiErrorCode =
  | 'missing-credential' | 'invalid-url' | 'network' | 'auth'
  | 'model-not-found' | 'file-missing' | 'sidecar-crashed'
  | 'timeout' | 'cancelled' | 'rate-limited' | 'unknown';
```

### 3.3 Stream event contract (Tauri events, one channel)

All events on `ai://stream` with payload `{ runId, seq, ev }`:

| `ev.type` | payload | notes |
|---|---|---|
| `reasoning` | `{ text }` | optional CoT deltas |
| `chunk` | `{ text }` | content deltas |
| `usage` | `{ inputTokens, outputTokens }` | may repeat; last wins |
| `done` | `{}` | terminal |
| `error` | `{ code: AiErrorCode, message }` | terminal |

Consumer rule (enforced in `chat.svelte.ts`, unit-tested): ignore any event whose `runId !== currentRun.id` or whose `seq` is not monotonic. `done`/`error` are idempotent.

### 3.4 IPC surface (`AiIpc` interface — both `ipc.ts` and `ipc-mock.ts` implement it)

| fn | signature | notes |
|---|---|---|
| `loadRegistry` | `() => Promise<AiRegistryDoc>` | sanitized on Rust side too |
| `saveRegistry` | `(doc: AiRegistryDoc) => Promise<void>` | atomic write |
| `writeCredential` | `(credentialId, key) => Promise<CredRevision>` | keychain; returns revision for undo |
| `deleteCredential` | `(credentialId) => Promise<CredRevision>` | |
| `restoreCredentialRevision` | `(rev) => Promise<void>` | undo/redo of key changes |
| `probeCredential` | `(credentialId) => Promise<boolean>` | exists? (never returns the key) |
| `startRun` | `(model: ModelRecord, req: ChatRequest, runId) => Promise<void>` | server streams events |
| `cancelRun` | `(runId) => Promise<void>` | idempotent |
| `readEnvProviders` | `(projectPath) => Promise<EnvProvider[]>` | parse, never expose values |
| `localModelStatus` | `(filePath) => Promise<LocalStatus>` | exists/size/loaded |
| `downloadModel` | `(url, target) => Promise<void>` + progress events | checksum verify |
| `loadSessions` / `appendMessage` / `saveSession` | … | versioned session store |

The **parity contract test** (`tests/unit/ai-ipc-contract.test.ts`) asserts both modules export exactly the `AiIpc` keys with matching arity; any native-only addition requires an explicit `NATIVE_ONLY` allowlist entry with a comment justifying it.

### 3.5 Persistence locations

| doc | native | browser mock | schema |
|---|---|---|---|
| registry | app-config dir, `ai/registry.json` | `localStorage ai:registry` | `AiRegistryDoc` v1 |
| credentials | OS keychain only | `localStorage ai:cred:<id>` (mock explicitly mirrors native semantics incl. missing-credential failures) | — |
| sessions | workspace `.app/ai/sessions/` (or SQLite) | `localStorage ai:sessions` | v1 + sanitizer |
| usage | rolled into session docs | same | — |

---

## 4. Phase plan

Each phase ends: typecheck + unit tests green, phase-scoped e2e green, docs updated, one commit.

### Phase 0 — Contracts & skeleton (0.5–1 day)

**Build:** `src/lib/ai/types.ts` (all §3 types), `src/lib/ai/adapters/types.ts`, empty `AiIpc` interface + two stub implementations, `tests/unit/ai-ipc-contract.test.ts`, sanitizers `src/lib/ai/sanitize.ts` for `AiRegistryDoc` + sessions with fixture tests (malformed JSON, wrong types, unknown fields, legacy shapes, 5k-model boundary).

**Accept:** contract test fails if either ipc module drifts; sanitizer fixtures pass; `pnpm check` clean. No UI yet.

### Phase 1 — Rust core: vault, store, stream plumbing (2–3 days)

**Build (`src-tauri/src/ai/`):**
- `vault.rs`: `write_credential`, `delete_credential`, `probe_credential`, `restore_revision` over the OS keychain (keyring crate), with an in-memory revision log for undo. Unit tests with a fake keychain trait.
- `store.rs`: atomic registry read/write (temp file + rename), session append-only store. Rust-side sanitization mirrors frontend sanitizers.
- `stream.rs`: `start_run(model, req, run_id)` — reqwest SSE client for `openai`/`anthropic` formats + ollama; emits `ai://stream` events with `{run_id, seq, ev}`; a `RunTable` (dashmap) maps `run_id → CancellationToken`; `cancel_run` is idempotent. 20s first-byte timeout → `error{timeout}`.
- Register all commands in `lib.rs` under an `ai_` prefix.

**Accept:** `cargo test` green (vault revision undo, run-table cancel idempotency, SSE parser against recorded fixtures for both API formats); events observable from a scratch frontend hook.

### Phase 2 — Frontend registry + IPC + mock (1–2 days)

**Build:**
- `src/lib/ai/ipc.ts` implementing `AiIpc` via `invoke`/`listen`; `ipc-mock.ts` implementing identical semantics in-browser (deterministic fake stream with reasoning + chunks + usage; **rejects missing mock credentials exactly like native**).
- `registry.svelte.ts`: runes class — `models`, `activeModelId`, `activeModel` (`$derived` lookup), `status: 'loading' | 'ready' | 'error'`, and `ready: Promise<void>`. Mutations (`addModel`, `removeModel`, `select`, `setBaseUrl`) each: (a) run in the undo domain, (b) for BYOK adds, `writeCredential` FIRST, await confirmation, then persist the record — on write failure nothing is persisted.
- Model removal deletes the credential in the same transaction; undo restores both via credential revision + registry snapshot.

**Accept:** unit tests — add/remove/select round-trip through mock persistence; add-model with failing credential write leaves registry unchanged; undo of remove restores record *and* key presence (probe). Contract test still green.

### Phase 3 — Adapters + chat runtime (2–3 days)

**Build:**
- `adapters/api.ts` (BYOK + built-in), `adapters/env.ts`, `adapters/local.ts` — each ~50 lines: translate `ModelRecord` → `startRun` call; `probe()` for settings UI.
- `chat.svelte.ts`: `ChatSession` (id, title, messages, model snapshot per message), `ChatRun` lifecycle:
  1. `send(text)` — guards: `registry.status === 'ready'` AND `activeModel != null`, else typed error surfaced inline (never a silent no-op).
  2. Allocate `runId` (monotonic), append user msg + placeholder assistant msg, `adapter.start(...)`.
  3. Event pump applies §3.3 consumer rules; `error{missing-credential}` renders the recovery message with a "open Settings" action.
  4. `cancel()`, `retry()` (same request, new runId), teardown on session switch cancels the live run.
- Sessions persist through `AiIpc`; loading runs sanitizers.

**Accept:** unit tests — stale-runId events dropped; cancel-then-late-chunk is a no-op; retry after error works; missing-credential error path (delete mock cred → send → typed error). Mock-driven e2e: send → streamed reply visible.

### Phase 4 — Local models (2–3 days)

**Build:**
- `local.rs`: llama.cpp **sidecar process** (not FFI) — spawn with model path, speak its HTTP server locally, stream through the same `ai://stream` contract. Health states: `absent | downloading | idle | loading | serving | crashed`, emitted as `ai://local-status`.
- `downloadModel` with progress events + SHA256 verify; UI-facing `LocalStatus`.
- `adapters/local.ts` finalized: `probe()` reports file-missing vs not-loaded vs ready; first `start()` triggers lazy load with status surfaced.
- Mock: fake local model with scripted status transitions so e2e can exercise every state without a real GGUF.

**Accept:** native manual test with a real small GGUF (document which one in the phase report); e2e (mock) covers add-local-model flow, status pill transitions, chat round-trip; sidecar crash mid-stream → `error{sidecar-crashed}` + status `crashed` + retry works after auto-restart.

### Phase 5 — UI (2–3 days)

**Build (`src/lib/ai/components/`):**
- `ChatPanel.svelte` — message list (markdown render through the app's sanitizer profile), reasoning collapse, streaming indicator, retry/copy actions, prompt box (disabled with reason-tooltip until `registry.ready`).
- `ModelPicker.svelte` — grouped by kind, shows probe status dots, searchable.
- `SettingsModels.svelte` — unified add-model flow (tabs: API / Local file), inline validation (URL, required fields), add-is-atomic UX (§ Phase 2 semantics), per-model probe status + "repair" action for dangling credentials (re-enter key writes a NEW credentialId then swaps the record pointer — no in-place mutation).
- `StatusPill.svelte` — local model status cue for the app footer.
- All styles per app conventions (external stylesheets, design tokens only).

**Accept:** e2e — add BYOK model (dialog → saved → selected → chat works after reload **with an explicit wait on the model-active state, not on paint**); invalid URL rejected inline; legacy dangling-credential model shows recovery and repair flow works; a11y pass (labels on all inputs, dialog focus trap, keyboard-only add-model).

### Phase 6 — Hardening & failure drills (1–2 days)

Scripted adversarial pass (each becomes a regression test):
- kill network mid-stream → `error{network}`, partial text preserved, retry works
- cancel during reasoning phase; switch sessions mid-stream; app quit mid-stream (next launch: session shows truncated message flagged incomplete, no corruption)
- delete credential outside the app (keychain) → next send → `missing-credential` recovery
- registry file corrupted on disk → sanitizer fallback to empty registry + non-destructive backup of the bad file + user notice
- two rapid sends → second queues or is blocked with visible state (pick one; test it)
- clock-skew/duplicate `seq` from provider → dropped

**Accept:** all drills encoded as unit or e2e tests; zero uncaught errors in console during the full e2e suite.

### Phase 7 — Migration & cutover (1 day, only if replacing an old layer)

- One-shot migrator: old persisted shapes → `AiRegistryDoc` v1 (fixture-tested against real captured old data); old keychain entries re-pointed, not re-written.
- Feature-flag the new panel; run both for one cycle; delete old layer files in a single commit once e2e is green on the new one only.

**Accept:** migration fixtures pass; app boots from a real old profile with models intact; old code deleted, no dangling imports.

---

## 5. Test matrix (minimum)

| Layer | Tests |
|---|---|
| Contracts | ipc parity; event-shape roundtrip (Rust serialize ↔ TS parse fixture) |
| Sanitizers | malformed / legacy / boundary fixtures per persisted doc |
| Registry | atomic add (cred-first), remove+undo restores cred, select persists |
| Chat runtime | stale-run drop, cancel idempotency, retry, guard-before-ready |
| Rust | vault revisions, run-table, SSE parsers (recorded fixtures per api format), sidecar lifecycle |
| e2e (mock) | add-API-model happy path, invalid URL, dangling-credential recovery, local-model status flow, reload-then-chat with explicit readiness wait |

**e2e discipline (hard-won):** never assert on UI the app hasn't promised; wait on *state signals* (model marked active, `registry.ready`) before acting; never embed literal markdown syntax in rendered-output assertions; selectors target stable roles/labels, not styling-era titles.

---

## 6. Sizing

~10–14 working days solo, parallelizable into two streams after Phase 0: **Stream A** = Rust core + local models (Phases 1, 4); **Stream B** = frontend registry/runtime/UI (Phases 2, 3, 5). Phase 0's contracts are the interlock; Phases 6–7 joint.

---

## 9. Pitfalls ledger (why these rules exist)

Each item below was a real, debugged defect in the predecessor layer:

1. **Credential resurrection.** Deleting a key while a settings draft held its value re-persisted it on commit → "missing credential" test flaked into a successful stream. *Rule 3: drafts hold handles, never values.*
2. **Send-before-rehydration race.** Sending immediately after reload hit an empty registry and fell into the `.env` provider branch → `The .env provider "" was not found`. *Rule 5: awaitable `ready`, guarded send.*
3. **Provider branch sprawl.** `sendAiMessage` resolved models differently per provider across ~200 lines; three state fields cooperated to define "active model". *Rules 1–2.*
4. **Assertions on rendered markdown.** A test asserted `**openai**` literally; the renderer had turned it into `<strong>` → permanent failure. *§5 e2e discipline.*
5. **UI-era selectors.** Tests bound to `title="Reset zoom to 100%"`-style strings broke on intentional UI evolution. *Stable roles/labels.*
6. **Record-before-credential persistence.** An interrupted keychain write left a selectable model with no key (the "dangling model"). *Phase 2 atomic add; ADR-032 in the old layer fixed this late — bake it in from day one.*

---

*Companion references in this repo: ADR-004 (single IPC gateway), ADR-017 (secrets native-only), ADR-028 (contract-typed IPC + sanitization), ADR-032 (immediate BYOK configuration), ADR-035 (envelope-encrypted key store).*
