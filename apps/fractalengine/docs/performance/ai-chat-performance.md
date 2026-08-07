---
id: performance-001
title: AI Chat Performance
type: performance
summary: Historical AI-chat diagnosis and remediation record; the registry, environment-provider format routing, listener readiness, and first-byte failure path were repaired on 2026-07-15.
updated: 2026-07-15
---

# AI Chat Performance

> **Status: remediated.** This report preserves the pre-fix diagnosis. The focused repair introduced canonical registry persistence, `API_FORMAT_<NAME>` routing for workspace providers, awaited stream-listener registration, a 20-second first-byte deadline, durable downloaded-model paths, global-memory frontend access, and regression tests. Read `docs/areas/ai.md` and ADR-029/ADR-030 for current behavior.

## Investigation Scope

**Requested:** Explain why provider details and models are unusable, why Settings does not provide a clear add-model flow, and why sending a chat message hangs.

**In scope:** AI model discovery and selection, Settings draft persistence, the frontend send lifecycle, Tauri IPC, native environment-provider execution, stream completion/error handling, and adjacent tests.

**Out of scope:** Quality of model responses, local GGUF/MLX inference speed after a sidecar has successfully started, and unrelated application startup work.

**Methodology:** Static end-to-end trace plus the existing frontend and Rust test suites. No live request was sent to credentials or endpoints from `.env`.

**Known unknowns:** The exact provider selected during the reported hang, the endpoint's live HTTP response, and whether the user had opened this repository as the active workspace root in the Tauri app.

## Rust Launch Path

The relevant native work begins only after a user sends a message; it is not application-startup work.

| Location | Action | Cost shape | Relevance |
|---|---|---|---|
| [`read_env_provider_configs`](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs#L353-L412) | Reads only `<active workspace>/.env`, groups exact suffixes, and surfaces records having a key. | Synchronous filesystem read during workspace initialization/refresh. | A process-level or repository `.env` is invisible unless its directory is the active workspace root. |
| [`run_env_model`](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs#L1862-L1895) | Re-reads the selected workspace `.env`, resolves the secret, then calls the API runner with provider hardcoded to `openai`. | Async command setup followed by detached streaming work. | Anthropic/Gemini-style endpoints cannot use their native wire formats through the `.env` path. |
| [`run_api_model_with_key`](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs#L1471-L1819) | Builds provider-specific payloads, spawns a thread, parses streaming lines, and emits `ai-chunk`, `ai-error`, or `ai-done`. | 15-second connect timeout and 60-second read-gap timeout. | A mismatched or nonconforming stream looks hung for a long interval even though the webview itself is still responsive. |

## Frontend Bootstrap

AI listeners are registered from workspace initialization at [`initWorkspace`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L764-L815), and the event bridge is created at [`initAiListeners`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1493-L1517). Listener registration is asynchronous internally at [`safeListen`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts#L10-L20), but the initialization flag is set before registration success is known. A registration failure is only logged and is never retried.

Model data is not sourced from one persisted registry. [`modelRecords`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/modelRegistry.svelte.ts#L113-L131) reconstructs records from provider presets, seven legacy per-provider arrays, recommended/local models, environment-provider metadata, and custom configurations. The supposedly canonical `ide:settings:model-registry@v1` key documented by ADR-029 is not read or written. Persistence still uses the legacy keys in [`loadSettings`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L2300-L2345) and [`saveSettings`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L2407-L2438).

The Settings surface contains multiple overlapping add paths. Standard providers have an inline free-text model field at [`SettingsDialog.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/SettingsDialog.svelte#L559-L611). A separate “Add API Provider” control opens the modal directly on its custom tab at [`SettingsDialog.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/SettingsDialog.svelte#L516-L520), while the modal's standard-provider tab only offers preset model ids at [`SettingsDialog.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/SettingsDialog.svelte#L932-L1006). This is not the single discoverable add-model flow described by ADR-030.

## Reactivity Waves

### Wave 1 — Workspace/provider discovery

| File | Action | Cost shape |
|---|---|---|
| [`ide.svelte.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1896-L1918) | Opens project memory, lists sessions, and reads providers from the active root. | Parallel IPC, then reactive assignment. |
| [`modelRegistry.svelte.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/modelRegistry.svelte.ts#L113-L145) | Rebuilds and deduplicates all model records/groups whenever a consumer reads them. | Synchronous array construction; small today, architectural drift risk. |
| [`AIChat.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/AIChat.svelte#L47-L69) | Repeatedly calls `records()` while mapping every group option. | Avoidable repeated registry reconstruction, but not large enough to explain the reported hang. |

### Wave 2 — Submit

| File | Action | Cost shape |
|---|---|---|
| [`AIChat.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/AIChat.svelte#L280-L287) | Clears the composer and calls `sendAiMessage` without awaiting it. | Immediate UI transition; errors depend on internal handling. |
| [`ide.svelte.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1697-L1758) | Appends the user message, sets `isAiStreaming`, gathers referenced files, and resolves provider/model. | Reactive render followed by optional sequential file reads. |
| [`ide.svelte.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1814-L1861) | Chooses env/custom/standard execution and awaits only native command startup. | The UI remains streaming until native events arrive. |

### Wave 3 — Native stream

| File | Action | Cost shape |
|---|---|---|
| [`lib.rs`](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs#L1620-L1650) | Connects and sends the request on a detached thread. | Up to 15 seconds before a connect error event. |
| [`lib.rs`](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs#L1651-L1816) | Reads lines and recognizes only the selected provider's expected streaming shape. | Up to 60 seconds between reads; unrecognized lines emit no visible progress. |
| [`ide.svelte.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1497-L1513) | Applies chunks, finalizes on done, or displays an error. | Correct only if listeners registered and the native thread emits a terminal event. |

## Performance Drivers

1. **All `.env` providers use the OpenAI protocol — inferred-high.** The environment runner discards provider identity and invokes `run_api_model_with_key` as `openai`. This directly explains why a complete `.env` record can be discovered yet unusable for Gemini or Anthropic wire formats.

2. **Long silent timeout window — inferred-high.** The UI says “streaming” before the native connection succeeds. The native worker permits 15 seconds to connect and 60 seconds without a readable line. No intermediate connection state or client-side deadline exists.

3. **Listener failure is permanent for the process — inferred-high.** `aiListenersInitialized` is set before asynchronous registrations resolve. If a listener registration fails, later calls cannot retry, so a successfully started backend stream can never clear the UI state.

4. **The “unified registry” is an adapter over legacy state — inferred-high.** ADR-029 promises one durable key, but the implementation continues to use multiple arrays and keys. Selection still silently falls back to the first available model at [`resolvedActiveModel`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L2295-L2298), contradicting the explicit no-selection contract.

5. **Settings remains fragmented — inferred-high.** The implementation exposes inline model editing, a preset-only provider modal, and a custom endpoint modal. The main “Add API Provider” button opens the custom path, making the standard path hard to discover and preventing free-text entry in that modal.

6. **Preset rows claim to be runnable without checking credentials — inferred-high.** [`modelRecords`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/modelRegistry.svelte.ts#L113-L123) marks every provider preset and user-entered model `runnable: true`; it has no credential-readiness signal. The picker can therefore offer a model as usable even when native execution will reject it for having no keychain credential.

7. **Downloaded recommendations still do not become runnable — inferred-high.** [`startDownload`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1614-L1647) sets only `downloaded = true`; it does not store `localPath`. [`loadModelsCache`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1592-L1597) restores only the download directory. The registry decides runnable state from `localPath`, so the disconnected pipeline named in the remediation plan remains disconnected.

8. **No executable end-to-end provider regression test — measured from test inventory.** `pnpm check`, 82 frontend/unit tests, and 28 Rust tests pass, but the suite has no test that submits a real or deterministic streamed provider response through UI → IPC → parser → terminal state. Green checks therefore do not cover the reported failure.

9. **Global chat persistence remains absent — inferred-high.** [`persistMessage`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1872-L1884) still returns immediately without a workspace, despite ADR-029 stating that global sessions use the app data directory.

## Recommendations

1. **Make provider execution a typed record and route by `apiFormat`.** Change the environment-provider metadata and `run_env_model` boundary so OpenAI-compatible, Anthropic, Gemini, and Ollama formats select their real native payload/parser. Expected impact: **large**; confidence: **inferred-high**. Risk: migrations must define a safe default for existing `.env` entries, preferably explicit `API_FORMAT_NAME` with OpenAI-compatible as the documented fallback.

2. **Replace the detached event-only lifecycle with a request id and guaranteed terminal result.** Register listeners before enabling send, return a stream id from startup, add a shorter configurable first-byte timeout, and guarantee exactly one done/error/cancel event. Expected impact: **large**; confidence: **inferred-high**. Risk: local sidecar and API cancellation semantics must remain atomic.

3. **Implement the registry ADR rather than wrapping legacy arrays.** Persist one versioned registry, migrate legacy keys once, resolve active identity by `(providerId, id)`, and return `null` instead of silently selecting the first model. Expected impact: **large**; confidence: **inferred-high**. Risk: existing user settings need fixture-tested migration and rollback.

4. **Consolidate Settings into one add/edit flow.** One visible button should support free-text model ids, provider/base URL, API format, credential staging, and an explicit “use this model” action. Expected impact: **medium**; confidence: **inferred-high**. Risk: keychain writes must remain transactional and undo-safe.

5. **Add one deterministic stream contract test before another broad remediation.** Cover success chunks, HTTP failure, malformed stream, no first byte, cancellation, listener-registration failure, and provider-format routing. Expected impact: **large**; confidence: **measured**. Risk: tests need a local fixture server or extracted parser functions to remain deterministic.

6. **Restore workspace-independent sessions or remove the claim.** Implement app-data global storage and exercise standalone AI chat without a root path. Expected impact: **medium**; confidence: **inferred-high**. Risk: session scope and migration must prevent project/global collisions.

## Appendix: Files Read

- [`package.json`](file:///Users/amrit/fractals/apps/fractalengine/package.json) — framework versions and test scripts.
- [`svelte.config.js`](file:///Users/amrit/fractals/apps/fractalengine/svelte.config.js) — forced Svelte 5 runes and static adapter.
- [`.env`](file:///Users/amrit/fractals/apps/fractalengine/.env) — variable names/completeness only; secret values were not surfaced.
- [`AI-MODULE-PLAN.md`](file:///Users/amrit/fractals/apps/fractalengine/docs/plans/AI-MODULE-PLAN.md) — intended embed architecture.
- [`AI-LAYER-REMEDIATION-PLAN.md`](file:///Users/amrit/fractals/apps/fractalengine/docs/plans/AI-LAYER-REMEDIATION-PLAN.md) — promised defect remediation and exit criteria.
- [`ADR-017`](file:///Users/amrit/fractals/apps/fractalengine/docs/adr/ADR-017-keep-provider-secrets-native.md) — keychain boundary.
- [`ADR-029`](file:///Users/amrit/fractals/apps/fractalengine/docs/adr/ADR-029-unify-ai-model-registry-and-native-discovery.md) — promised unified registry/global sessions.
- [`ADR-030`](file:///Users/amrit/fractals/apps/fractalengine/docs/adr/ADR-030-single-add-model-flow.md) — promised single settings flow.
- [`aiProviders.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/data/aiProviders.ts) — provider presets and default URLs.
- [`modelRegistry.svelte.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/modelRegistry.svelte.ts) — actual aggregation and settings bridge.
- [`ide.svelte.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts) — persistence, selection, send lifecycle, and listeners.
- [`SettingsDialog.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/SettingsDialog.svelte) — actual provider/model UI.
- [`AIChat.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/AIChat.svelte) — submit and model-picker bindings.
- [`ipc.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts) and [`ipc-mock.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc-mock.ts) — native/browser execution boundary.
- [`src-tauri/src/lib.rs`](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs) — environment parsing, provider requests, timeouts, and stream parsing.
- [`tests/unit`](file:///Users/amrit/fractals/apps/fractalengine/tests/unit) and Rust unit tests — current coverage inventory and passing baseline.
