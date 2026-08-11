---
id: ai-layer-remediation-plan
title: AI Layer Remediation Plan
type: plan
tags: [plan, history]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**


**Repo:** `apps/fractalengine` (SvelteKit + Tauri, Svelte 5 runes, indented SASS)
**This is a REMEDIATION of the existing AI layer, not a new feature.** The
parallel-safety mechanism is the same as AI-MODULE-PLAN.md: a **frozen contract**
(types + a behavior-neutral adapter) is committed to `master` in Phase 0 BEFORE the
agents branch. Stream A rewrites kernel state + native (Rust/IPC) internals behind the
contract; Stream B rebuilds the UI surfaces against the contract. Both compile
independently in their own worktrees at every phase. The contract's exported names,
signatures, and semantics are FROZEN — neither stream may rename anything in it.

You are one of two agents. Your operator will tell you whether you are **Agent A
(Stream A — kernel state, IPC, Rust)** or **Agent B (Stream B — components, styles,
docs)**.

- Agent A: branch `ai-remediation-kernel`.
- Agent B: branch `ai-remediation-ui`.
- Each agent works in its own worktree from the same post-Phase-0 `master` commit.
- Phase 3 (integration, full verification, `docs/INDEX.md` regeneration) runs once
  after both merge. Neither stream regenerates `docs/INDEX.md` — single writer rule.

---

## 1. Defect inventory (what this plan fixes)

Findings from the 2026-07-15 AI-layer review. Numbers are referenced by tasks below.

| # | Defect | Severity |
|---|--------|----------|
| D1 | Native file pickers (`select_file`, `select_download_directory`, `select_open_file`, `select_save_file` in `src-tauri/src/lib.rs`) use **synchronous `rfd::FileDialog` inside sync Tauri commands** — nested modal run loop on the main thread; crashes the app on the second pick (GGUF → mmproj repro). No `.gguf` filter; wrong titles; no frontend try/catch in `browseLocalPath`. | crash |
| D2 | **Sidecar download→run pipeline disconnected**: `startDownload` never sets `GgufModel.localPath`; `downloaded` isn't persisted; `sendAiMessage`'s sidecar branch (`ide.svelte.ts:1741`) only handles `custom-local-gguf`/`custom-local-mlx`, so the four "Local Sidecar" picker entries can NEVER run, downloaded or not. | broken feature |
| D3 | **Model list has six competing sources**: `presetModels` in `aiProviders.ts` (stale, feeds only the Add Model dropdown via label-prefix string matching), hardcoded per-provider defaults in `ide.svelte.ts:370–376`, `recommendedModels`, `envProviders`, `customModels`, and the separate `modelContextWindows.ts` substring table. Aggregation logic exists 3× (`buildModelGroups`, `availableModels`, `currentProviderModels`), resolution logic 3× (`activeModelValue`, `resolvedActiveModel`, `resolveActiveModelLabel`). | architecture |
| D4 | **Two add-model flows with different semantics**: Providers-tab string list (uses the provider keychain key) vs Add Model modal (always creates a `CustomModelConfig` with its own credential, even for "OpenAI"). Provider base URLs duplicated in `executeAddModel`, `aiBaseUrlXxx` fields, and Rust. | UX / architecture |
| D5 | One `localActiveModel` string shared by all radio groups in SettingsDialog (`active-provider-model`, `active-env-provider`, `active-custom-model`) — cross-provider collisions; `resolvedActiveModel` silently falls back to `models[0]`. | correctness |
| D6 | `skillsCatalog` is **never populated** — the `/` autocomplete and the Skills marketplace are permanently empty; `installSkillFromMarketplace` unreachable. | broken feature |
| D7 | `@` file mentions only see `ideState.fileEntries` (workspace root, non-recursive). | gap |
| D8 | Chats are not persisted without an open `rootPath` — the standalone AI module silently loses history (`persistMessage` no-ops). | data loss |
| D9 | Ollama provider never queries `GET /api/tags`; installed models must be typed by hand. | gap |
| D10 | `showHeader={false}` (AI module) drops the Context token meter. | gap |

---

## 2. Frozen contract (Phase 0 — operator commits to master before branching)

Two new files. The adapter is **behavior-neutral**: it delegates to today's kernel
members so master stays green. Stream A rewrites its internals; Stream B binds UI to
it. Nobody renames its exports.

### 2.1 `src/lib/state/modelRegistry.contract.ts` (types only, no runtime code)

```ts
// Cross-stream contract for the unified model registry (AI-LAYER-REMEDIATION-PLAN).
// FROZEN: Stream A implements, Stream B consumes. Do not rename exports.
import type { ModelGroup } from '$lib/data/modelContextWindows';
import type { AiProvider } from '$lib/data/aiProviders';
import type { SkillEntry } from '$lib/state/ide.svelte';

export type ModelSource = 'preset' | 'user' | 'custom' | 'env' | 'local';
export type ApiFormat = 'openai' | 'anthropic' | 'gemini' | 'ollama';

// One selectable row in the model picker / settings. Identity = (providerId, id).
export interface ModelRecord {
	providerId: AiProvider;
	id: string;              // provider-scoped: model name, custom-config uuid,
	                         // env provider name, or local model id
	label: string;
	modelId: string;         // the id actually sent to the API (≠ id for custom/env)
	source: ModelSource;
	apiFormat?: ApiFormat;   // custom-source records only
	baseUrl?: string;
	credentialId?: string;   // keychain account; secrets NEVER stored here (ADR-017)
	contextWindow: number;   // resolved, never 0; unknown → DEFAULT_CONTEXT_WINDOW
	isMultimodal: boolean;
	runnable: boolean;       // false ⇒ selectable in settings but the picker renders
	                         // it disabled with unavailableReason
	unavailableReason?: string; // e.g. "Not downloaded", "Set API_MODEL_… in .env"
}

export interface CustomModelDraft {
	name: string;
	provider: string;        // display/bookkeeping only
	modelId: string;
	baseUrl?: string;
	apiFormat: ApiFormat;
	isMultimodal: boolean;
	isFullUrl?: boolean;
}

// Read API + kernel mutators. Mutators are one atomic undo entry each (Rule 9).
export interface ModelRegistryApi {
	records(): ModelRecord[];
	groups(): ModelGroup[];                       // for ai-elements/ModelSelector
	active(): ModelRecord | null;                 // null = nothing valid selected
	setActive(providerId: string, id: string): void;
	addUserModel(providerId: AiProvider, modelId: string): void;
	removeUserModel(providerId: AiProvider, modelId: string): void;
	refreshOllamaModels(): Promise<void>;         // D9; no-op until A7 lands
	contextWindowFor(providerId: string, id: string): number;
}

// Transactional settings save: SettingsDialog edits a draft copy and commits once.
// commit = pushUndo → apply → saveSettings → applyApiKeyChanges → rollback on error.
export interface SettingsDraft {
	aiProvider: AiProvider;
	activeModel: { providerId: string; id: string } | null;
	baseUrls: Partial<Record<AiProvider, string>>;
	userModels: Partial<Record<AiProvider, string[]>>;
	customModels: Array<CustomModelDraft & { id: string; credentialId: string }>;
	localGgufModelPath: string;
	localMmprojPath: string;
	localMlxModelPath: string;
	// credentialId → plaintext key, held only in component memory until commit
	pendingCredentials: Record<string, string>;
}

export interface SettingsBridgeApi {
	captureSettingsDraft(): SettingsDraft;
	commitSettingsDraft(draft: SettingsDraft): Promise<void>; // throws on failure, state rolled back
}

export interface SkillsApi {
	catalog(): SkillEntry[];
	loadCatalog(): Promise<void>;                 // idempotent; hydrates on first call
	install(skill: SkillEntry): Promise<void>;
}

export interface FileHit { path: string; name: string }
export type SearchWorkspaceFiles = (query: string, limit?: number) => Promise<FileHit[]>;
```

### 2.2 `src/lib/state/modelRegistry.svelte.ts` (Phase-0 adapter, behavior-neutral)

Implements and exports:

```ts
export const modelRegistry: ModelRegistryApi = /* delegates to ideState */;
export const settingsBridge: SettingsBridgeApi = /* delegates to ideState */;
export const skillsApi: SkillsApi = /* delegates to ideState.skillsCatalog (empty today) */;
export const searchWorkspaceFiles: SearchWorkspaceFiles =
	async (q, limit = 8) => /* filter ideState.fileEntries, root-only for now */;
```

Phase-0 delegation map (write exactly this, no behavior change):
`groups()` → `ideState.buildModelGroups()`; `active()` → resolve
`ideState.activeModelValue` against `groups()` (return `null` when absent — this is
the ONE intentional Phase-0 behavior delta and it is invisible until B binds to it);
`setActive(p, id)` → `ideState.onSelectModel(p, id)`; `addUserModel`/`removeUserModel`
→ mutate the matching `customXxxModels` array inside `ideState.pushUndo()` +
`saveSettings()`; `refreshOllamaModels()` → resolved no-op; `contextWindowFor` →
`maxContextTokensFor`; `captureSettingsDraft`/`commitSettingsDraft` → assemble/apply
the same fields `SettingsDialog.handleSave` writes today (move that logic here
verbatim, including `applyApiKeyChanges` + rollback); `loadCatalog()` → resolved
no-op; `install` → `ideState.installSkillFromMarketplace`.

Phase 0 exit: `pnpm check` green, `pnpm test:unit` green, app boots in browser mode.
Operator commits to `master`, then cuts both branches.

---

## 3. File ownership matrix (conflict prevention — HARD RULE)

| Path | Owner |
|---|---|
| `src/lib/state/ide.svelte.ts` | **A** |
| `src/lib/state/modelRegistry.svelte.ts` (internals) | **A** |
| `src/lib/data/aiProviders.ts`, `src/lib/data/modelContextWindows.ts` | **A** |
| `src/lib/ipc.ts`, `src/lib/ipc-mock.ts` | **A** |
| `src-tauri/**` | **A** |
| `tests/unit/*` for registry/ipc/sessions | **A** |
| `src/lib/components/SettingsDialog.svelte` | **B** |
| `src/lib/components/AIChat.svelte`, `PromptInput.svelte` | **B** |
| `src/lib/components/ai-elements/**` | **B** |
| `src/lib/components/ModelMarketplace.svelte`, `SkillsMarketplace.svelte` | **B** |
| `src/lib/modules/ai/components/**` | **B** |
| `src/lib/styles/**`, `src/lib/modules/ai/styles/**` | **B** |
| `docs/routing/*`, `docs/design/*`, `docs/adr/*` | each stream writes docs for ITS OWN files; new ADR numbers: A takes the next odd slot conflict-free by using `ADR-029`, B uses `ADR-030` |
| `docs/INDEX.md` | **neither** — Phase 3 only |
| `src/lib/state/modelRegistry.contract.ts` | **frozen** — nobody |

Stream B never imports from `ide.svelte.ts` for NEW code beyond what it already
imports; all new bindings go through the contract adapter. Stream A never edits a
`.svelte` component. If a stream discovers it needs a contract change, it STOPS and
reports to the operator instead of editing the contract.

---

## 4. Stream A — kernel, IPC, native (branch `ai-remediation-kernel`)

### A1 — Dialog crash fix (D1) *(do first; smallest, highest value)*
- Convert `select_file`, `select_download_directory`, `select_open_file`,
  `select_save_file` to **async Tauri commands** using `rfd::AsyncFileDialog`
  (command signatures/names unchanged — the JS `invoke` side is already async).
  Keep `register_and_persist_authorized_path` behavior identical.
- `select_file` gains an optional `title: Option<String>` (default stays
  "Select File to Attach"); update `ipc.ts` `selectFile(title?)` + mock parity
  (`IpcApi` interface + `tests/unit/ipc-contract.test.ts`).
- Verify: from Settings → Local Models, pick GGUF then mmproj back-to-back in the
  real Tauri app — no crash. Record the manual step in the PR description.

### A2 — Reconnect sidecar pipeline (D2)
- `startDownload`: on success set `model.localPath = targetPath` and persist a
  `ide:models:downloaded@v1` map (`id → localPath`) to localStorage; hydrate in
  `loadModelsCache()`, validating each path via a new cheap `path_exists` IPC (Rust +
  mock) and dropping stale entries.
- `sendAiMessage` sidecar branch: resolve
  `recommendedModels.find(m => m.id === selectedModelId)?.localPath` in addition to the
  two custom ids; clear error message naming the Settings section when unresolved.
- Registry records for local models: `runnable = !!localPath` (or custom path set),
  `unavailableReason = 'Not downloaded'`.

### A3 — Unified model registry internals (D3, D5)
- Rewrite `modelRegistry.svelte.ts` internals so `records()` is THE single
  aggregation: preset suggestions, user-added per-provider models, custom configs,
  env providers, local models — each tagged with `source` and a resolved
  `contextWindow` (fold `maxContextTokensFor` in as the fallback resolver; the
  substring table stays in `modelContextWindows.ts` as data).
- Persist to ONE key `ide:settings:model-registry@v1`; write a migration that reads
  the seven legacy `ide:settings:models-*` keys, `custom-models`, `active-model`,
  `ai-provider`, and local paths, then leaves legacy keys in place (read-only) for one
  release. Malformed input → reset with a logged error, never a throw to the UI.
- `active()` returns `null` when the stored selection no longer resolves — DELETE the
  silent `models[0]` fallback in `resolvedActiveModel`. `buildModelGroups` /
  `availableModels` / `activeModelValue` / `resolvedActiveModel` become thin wrappers
  over the registry (keep them exported so untouched callers keep compiling), each
  marked `@deprecated use modelRegistry`.
- Move the Add-Model provider default base URLs OUT of the UI: extend
  `AI_PROVIDER_DEFINITIONS` with `defaultBaseUrl` and refresh `presetModels` to
  current-generation ids (these become registry `source: 'preset'` suggestions).
- Rule 9: every registry mutator runs inside the ide undo domain
  (`pushUndo`/transact) — one atomic entry per user action; snapshot/restore extended
  to the new key.
- Tests (Rule 12): migration fixtures — legacy-complete, partial, malformed JSON,
  duplicate ids, boundary (empty arrays); active-resolution never silently reassigns.

### A4 — Skills catalog hydration (D6, kernel half)
- Implement `skillsApi.loadCatalog()`: bundle a static catalog at
  `src/lib/data/skillsCatalog.json` (name, description, url) as the seed source;
  merge `installed` from `localStorage['skill:installed:*']` AND, when a workspace is
  open, from an `agents/skills/<name>/SKILL.md` existence check (reuse existing fs
  IPC; no new Rust needed). Idempotent, errors logged not thrown.

### A5 — Workspace file search (D7, kernel half)
- New Rust command `search_workspace_files(root, query, limit)` — case-insensitive
  substring on file names, walk under the authorized root, skip `node_modules`,
  `.git`, `target`, `build`; cap `limit` (default 8, max 50). Wire through `ipc.ts`
  (+ mock: recursive filter over the virtual fs) and point the adapter's
  `searchWorkspaceFiles` at it. `IpcApi` + contract test updated.

### A6 — Sessions without a workspace (D8)
- When `rootPath` is empty, `persistMessage`/`listSessions`/`loadSession` fall back
  to an app-scoped store (Rust: `app_data_dir()/global-memory/`, same schema as
  project memory; mock: in-memory). Kernel routes on `rootPath || GLOBAL_SCOPE`.
  Sessions carry their scope so the AI module lists both; opening a project does not
  orphan global chats. Keep the change inside the existing session IPC surface.

### A7 — Ollama discovery (D9)
- New Rust command `list_ollama_models(base_url)` → GET `{base}/api/tags`, 2s
  timeout, returns `string[]`; unreachable host → `Ok([])` with a logged warning
  (never an error toast on app start). `refreshOllamaModels()` merges results as
  `source: 'preset'` records for the ollama provider (user-added kept distinct).
  Called lazily: on settings open and on picker open, never on boot.

### A8 — Stream A docs
- `docs/adr/ADR-029-unified-model-registry.md` (supersedes the model-list parts of
  ADR-009; records D1 dialog decision, migration, and the global-session scope).
- Routing docs for `modelRegistry.svelte.ts`, changed `ipc.ts` sections. Do NOT touch
  `docs/INDEX.md`.

Stream A exit criteria: `pnpm check` green; unit suite green including new migration
+ contract tests; manual Tauri verification of A1 and A2 (download → select → run a
real reply from a local GGUF).

---

## 5. Stream B — UI surfaces (branch `ai-remediation-ui`)

Build everything against the Phase-0 adapter. Where A's internals haven't landed yet,
the adapter's neutral behavior keeps your UI functional (e.g. `loadCatalog()` no-op →
empty state renders; that's fine until merge).

### B1 — SettingsDialog rebuild (D1 frontend, D4, D5)
- Replace the field-by-field save plumbing with `captureSettingsDraft()` /
  `commitSettingsDraft(draft)`; keep the existing Save/Cancel + `isSaving` +
  `saveError` UX. Delete the local `handleSave` keychain/rollback logic (now behind
  the bridge).
- **One Add Model flow.** The modal works for ANY provider: provider `<select>` is
  driven by `AI_PROVIDER_DEFINITIONS` **ids** (no label-prefix matching); preset
  suggestions come from the registry's preset records with free-text entry allowed;
  choosing a standard provider appends to `draft.userModels[provider]` (provider
  keychain key), choosing Custom builds a `CustomModelDraft` + per-model credential.
  The base-URL defaulting reads `defaultBaseUrl` from the provider definition — no
  URLs hardcoded in the component.
- **Fix active-model selection (D5):** radio identity is `(providerId, id)` — bind to
  `draft.activeModel`, one radio name per provider section, no shared string. Show an
  explicit "No model selected" state; never auto-reassign on provider switch (offer,
  don't force).
- GGUF/mmproj/MLX pickers: use `selectOpenFile('Select GGUF model', 'gguf')` for both
  gguf and mmproj, keep `selectDownloadDirectory` for MLX; wrap every picker call in
  try/catch surfacing `saveError`; validate the chosen name ends in `.gguf`.
- Local Models tab gains per-model "Downloaded ✓ / not downloaded" straight from
  registry `runnable`.

### B2 — Picker + chat surfaces (D2 UI, D10)
- `ModelSelector` consumes `modelRegistry.groups()`; render non-`runnable` records
  disabled with `unavailableReason` as the hint; `value` from
  `modelRegistry.active()` (null → placeholder).
- `AIChat`: replace direct `buildModelGroups`/`activeModelValue` reads with the
  registry; move the `Context` meter into the `PromptInput` toolbar area so it is
  visible with `showHeader={false}` (AI module) as well — header keeps it too; no
  duplication when both render (meter component takes a `compact` prop).
- `ModelMarketplace`: downloaded badge and Download button state read the registry's
  local records (post-merge, A2 makes these live).

### B3 — Skills UI (D6 UI half)
- `SkillsMarketplace`: call `skillsApi.loadCatalog()` on mount; loading, error, and
  genuine-empty states (today's permanent "No skills match" becomes impossible);
  install button wired to `skillsApi.install` with per-row busy state.
- `/` autocomplete in `AIChat`: source from `skillsApi.catalog()` (trigger
  `loadCatalog()` lazily on first `/`), show installed indicator.

### B4 — `@` mention search (D7 UI half)
- Replace the root-only `fileEntries` filter with debounced (150ms)
  `searchWorkspaceFiles(query)`; render `name` with the relative `path` as secondary
  text; keep keyboard nav identical; empty query keeps current instant root listing.
  Cancel stale requests by sequence counter (mirror the kernel's requestId pattern).

### B5 — Styles & rules discipline
- All new/changed styles in `src/lib/styles/components/` (or module styles dir),
  indented SASS, semantic tokens only, imported via `src/lib/styles/index.sass`. No
  `<style>` blocks, no native `<input type="color">`, sanitized `{@html}` only.

### B6 — Stream B docs
- Routing docs for every changed component; `docs/design` entries for styling
  changes + DESIGN.md; `docs/adr/ADR-030-single-add-model-flow.md` (UI decision
  record referencing ADR-029). Do NOT touch `docs/INDEX.md`.

Stream B exit criteria: `pnpm check` green; `pnpm dev` (browser mode, ipc-mock)
manually exercised: settings open→edit→save→cancel, add model both paths, picker
disabled-state rendering, `/` and `@` autocomplete, undo/redo across a settings save
(one Cmd+Z reverts the whole save — Rule 9).

---

## 6. Phase 3 — Integration (single agent or operator, after both merge)

1. Merge order: A → master, then B → master (B's UI binds to contract only, so
   conflicts should be zero; any conflict means the ownership matrix was violated —
   investigate, don't auto-resolve).
2. Delete the `@deprecated` kernel wrappers IF no callers remain (grep first).
3. Full suite: `pnpm check`, all unit tests (`ipc-contract`, `undo-history`,
   `contribution-contracts`, `html-boundary`, new registry/migration tests), then the
   Audit Completeness Protocol (AGENTS.md Rule 12): mutation inventory — every new
   mutator (setActive, add/remove model, commitSettingsDraft, skill install) is one
   atomic undo entry; async failure/cancel/out-of-order paths exercised; persisted
   fixtures (malformed/legacy/duplicate/boundary) pass.
4. Manual verification in the real Tauri app (use `run-fractalengine` skill where
   applicable): D1 repro (GGUF→mmproj picks, no crash), D2 (download → pick in
   selector → real local reply), D3/D5 (settings round-trip + migration from a
   pre-branch profile), D6 (`/` shows skills), D7 (`@` finds nested file), D8 (chat
   without workspace survives restart), D9 (Ollama tags appear when daemon runs),
   D10 (meter visible in AI module).
5. Regenerate affected `docs/INDEX.md` rows via `agents/skills/doc-frontmatter`.
6. `git diff --check`; final commit.

---

## 7. Sequencing & dependency notes

- A1 is independent — land it first inside Stream A; it's the only crash.
- B can start immediately after Phase 0; nothing in B blocks on A except live data
  (empty skills catalog, root-only search) which degrades gracefully until merge.
- The ONLY cross-stream coupling is the frozen contract. Contract change requests go
  to the operator, who updates master and both agents rebase.
- Neither stream edits: `AiLayout/AiSidebar/SessionRow/WorkPanel` (module layout is
  out of scope), `undoHistory.svelte.ts`, vault/password code, `sanitizeHtml.ts`.
