---
id: ipc-and-data-layer
title: IPC and Data Layer Area
type: area
tags: [ipc, data-layer, database, tauri, backend, commands, events, native]
summary: The native Tauri/Rust backend reference — the command surface, event contract, managed state, secret storage, local-model sidecar lifecycle, and the single IPC gateway plus its browser-mock parity.
relates_to: [ADR-004, ADR-011, ADR-016, ADR-017, ADR-018, ADR-023, ADR-027, ADR-028, ADR-035]
updated: 2026-07-22
---

# IPC and Data Layer Area

## Purpose & boundaries

This area is the reference for the **native (Tauri/Rust) backend** and the single IPC gateway
that fronts it. The renderer never calls the OS directly: every native capability is a
`#[tauri::command]` in `src-tauri/src/` reached through `src/lib/ipc.ts`, with `src/lib/ipc-mock.ts`
providing a browser-only stand-in so `pnpm dev` runs fully outside Tauri (ADR-004).

Whole subsystems here — the keychain, the local-model sidecar, SQLite, real filesystem access —
**only exist in the native build**. The browser mock simulates their observable results but not
their mechanics, so behavior that depends on native internals cannot be exercised by the
Vitest/Playwright suites (which run against the mock). Document that behavior here; do not assume
the frontend can discover it.

## Native command surface

Native commands are registered in `lib.rs`'s `generate_handler!`. `AppHandle` and `State<…>` params
are injected by Tauri and are **not** part of the JS-facing argument object.

- **Filesystem / terminal**: `list_directory`, `read_file`, `write_file`, `create_file`, `delete_file`,
  `rename_file`, `duplicate_file`, `copy_path`, `path_exists`, `search_workspace_files`. All are
  gated by `AuthorizedPaths` (see below).
- **Terminal execution**: Code's integrated terminal uses `terminal_open`, `terminal_write`,
  `terminal_resize`, and `terminal_close` to manage native `portable-pty` shell sessions rooted in
  the authorized workspace directory. Each terminal tab owns a separate PTY session. Renderer
  keystrokes are written to the selected PTY, output streams back over `terminal://event`, and xterm
  reports resize dimensions back through `terminal_resize`.
- **Dialogs / selection**: `select_file`, `select_open_file`, `select_save_file`,
  `select_download_directory`.
- **AI execution & streaming**: `run_api_model`, `run_env_model`, `run_local_model`,
  `cancel_ai_stream` — each drives one turn and emits stream events.
- **Models / download**: `download_model`, `list_ollama_models`.
- **Credentials**: `save_api_key`, `apply_api_key_changes`, `restore_api_key_revision`
  (envelope-encrypted store, see Secret storage).
- **Browser window and tabs**: `browser_window_open`, `browser_window_state`,
  `browser_window_close`, session-restore settings, and tab-addressed create, close,
  activate, reorder, reopen, navigate, reload, stop, history, viewport, overlay, and autofill
  commands. The former unaddressed single-window navigation and content-bounds gateway is not
  retained; all browser actions carry their owning window (and tab where applicable).
- **Password vault**: `load_password_database`, `save_password_database`.
- **Workspace / docs / providers**: `read_env_providers`, `rebuild_docs_index`,
  `set_active_template_menu`, `install_skill`.

## Event contract (native → renderer)

Emitted via `Emitter`; subscribed through `src/lib/ipc.ts` listeners.

- **AI stream**: `ai-chunk` (token/segment), `ai-done` (turn complete), `ai-error` (human-readable
  failure). Exactly one turn is live at a time — see the stream-generation guard.
- **Download**: `download-progress` (fraction), `download-done` (target path), `download-error`.
- **Menu**: `menu-event` (native menu-bar selection, e.g. template switch).
- **Terminal**: `terminal://event` emits `{ sessionId, kind, data }`, where `kind` is `data`,
  `error`, or `exit`. Renderers route events by native session id, not by the active tab, because
  background terminal tabs continue streaming while another terminal is selected.

## Managed state

Registered with `.manage(…)` at startup and injected into commands as `State<…>`:

- **`AiStreamState { generation: AtomicU64 }`** — the single-active-stream guard. Every
  `run_*_model` and `cancel_ai_stream` does `fetch_add(1)` on the generation; a spawned worker
  captures `my_generation` and, before emitting each chunk, checks it still equals the current
  generation — otherwise it stops silently. This is why a superseded or cancelled local sidecar
  stops mid-flight and why only the newest turn reaches the UI. Frontend features that reflect
  "is a turn live" (e.g. the local-model status cue) depend on this, not on a persistent flag.
- **`ApiKeyHistoryState`** — process-local before/after revisions of credential batches; powers
  `apply_api_key_changes` / `restore_api_key_revision` so credential edits participate in undo
  (ADR-017). Resets on app restart, matching the renderer undo stack.
- **`AuthorizedPaths(Mutex<Vec<PathBuf>>)`** — the set of user-approved roots. `authorized_path()`
  rejects filesystem commands targeting anything outside it; selecting a file/folder registers it.
- **`BrowserChromeHeight`** — layout inset for the embedded browser window.
- **`TerminalPtyState`** — process-local map of active terminal session ids to their PTY child,
  master handle, and writer. Resize targets the PTY master; close kills the child and drops the
  writer so the reader thread emits an `exit` event.

## Secret storage

Provider API keys use the shared `crypto.rs` envelope: keys live AES-256-GCM encrypted in a single
app-data file (`api-keys.json`), and only the 32-byte encryption key sits in the OS keychain under
one stable account (`get_or_create_key`). The renderer holds only a credential id, never a raw key;
`run_api_model` resolves the key natively. This is the same pattern the password vault and chat
memory use, and it replaced one-keychain-item-per-key, which forced an OS prompt on every model
added (ADR-035, refining ADR-017). `keyring` **must** be built with a platform backend feature
(`apple-native` / `windows-native` / `sync-secret-service`) or it silently no-ops into an in-memory
mock store — the root cause fixed in ADR-035.

## Local-model sidecar lifecycle

`run_local_model` spawns a fresh process per turn — `llama-cli` for GGUF (with optional `--mmproj`),
`mlx_lm`/`mlx_vlm` for MLX directories — reads stdout under the generation guard, and the process
**exits when the reply ends**. There is no resident model server, so there is no persistent
"loaded" state to query; a model is "loaded" only while its turn is streaming. Local generation is
capped (`-n 1024`); API turns have no client-side output cap.

## Persistence modules

- **`storage.rs`** — bundled SQLite (rusqlite) for bookmarks and the FTS5 search index; idempotent
  migrations (see its unit tests). **`memory.rs`** — per-project chat memory (ADR-011), AES-GCM
  content via the `crypto.rs` envelope with a separate keychain account. **`crypto.rs`** — the
  shared envelope (`get_or_create_key`, `encrypt_with_key`, `decrypt_with_key`). **`docs_index.rs`** —
  mechanical `docs/INDEX.md` rebuild from frontmatter (`rebuild_docs_index`).

## Extension points

- **API additions**: declare the signature in the `IpcApi` contract, then implement both the native
  `#[tauri::command]` (register it in `generate_handler!`) and the `ipc-mock.ts` adapter. See the
  [add-an-ipc-function guide](file:///Users/amrit/fractals/apps/fractalengine/docs/guides/add-an-ipc-function.md). NATIVE_ONLY additions need justification (ADR-028).

## Cross-area edges

- **State Sync**: called by state managers to load, update, or remove workspace artifacts.
- **AI area**: the stream events and `run_*_model` commands back the AI Copilot; the local-model
  status cue reads the sidecar lifecycle described above.

## Gotchas

- **The mock has no native internals**: `localhost` (`pnpm dev`) has no keychain, no sidecar, no
  real SQLite or filesystem. Keychain/sidecar/credential behavior can only be exercised in the
  Tauri build — the automated suites cannot catch native-only regressions (e.g. ADR-035's missing
  keyring backend). Use `pnpm tauri dev` for those.
- **Injected params are not JS args**: adding `AppHandle`/`State` to a command does not change its
  `invoke(...)` call shape; the JS-facing argument object is unchanged.
- **Parity verification**: run `ipc-contract.test.ts` after any IPC change. The browser mock rejects
  a missing `custom-model-*` credential during a chat request, matching native behaviour rather than
  supplying a fallback key.
- **Unsigned dev builds prompt for the keychain**: a rebuilt dev binary changes signature, so macOS
  re-prompts for the single encryption-key item; a signed release grants once. Not a code bug (ADR-035).

## macOS Dictation bridge

`src-tauri/native/dictation_bridge.swift` owns microphone capture and Apple Speech recognition. It requires on-device recognition, streams only state/transcript deltas, and never sends microphone buffers into the renderer. `src-tauri/src/dictation.rs` supervises that helper and emits `dictation://event`; `src/lib/ipc.ts` and `src/lib/ipc-mock.ts` expose matching `start`, `stop`, `cancel`, and subscription APIs. See ADR-038.

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`annotations.rs`](file:////Users/amrit/fractals/apps/fractalengine/src-tauri/src/annotations.rs) | annotations.rs |
| [`crypto.rs`](file:////Users/amrit/fractals/apps/fractalengine/src-tauri/src/crypto.rs) | Shared AES-256-GCM envelope encryption: a small per-purpose key lives in the OS |
| [`docs_index.rs`](file:////Users/amrit/fractals/apps/fractalengine/src-tauri/src/docs_index.rs) | Mechanical rebuild of docs/INDEX.md from existing frontmatter + agents/skills-and-agents.json. |
| [`lib.rs`](file:////Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs) | lib.rs |
| [`main.rs`](file:////Users/amrit/fractals/apps/fractalengine/src-tauri/src/main.rs) | Prevents additional console window on Windows in release, DO NOT REMOVE!! |
| [`memory.rs`](file:////Users/amrit/fractals/apps/fractalengine/src-tauri/src/memory.rs) | ADR-011 Phase 1 — per-project local memory storage (SQLite via rusqlite). |
| [`storage.rs`](file:////Users/amrit/fractals/apps/fractalengine/src-tauri/src/storage.rs) | storage.rs |
| [`ipc-mock.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/ipc-mock.ts) | Simple in-memory virtual filesystem for browser preview mode |
| [`ipc.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts) | ipc.ts |
| [`data-layer-mock.test.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/data-layer-mock.test.ts) | Reset the in-memory state between tests by re-importing (vitest caches modules, |
| [`ipc-contract.test.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/ipc-contract.test.ts) | ── Name parity (fs-source extraction, no Tauri module loading) ────────────────── |
| [`ipc-credential-history.test.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/ipc-credential-history.test.ts) | ipc-credential-history.test.ts |

<!-- filetable:end -->
