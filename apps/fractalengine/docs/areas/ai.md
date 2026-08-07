---
id: ai
title: AI Area
type: area
tags: [ai, chat, copilot, modules]
summary: Covers modules/ai/**, core AIChat.svelte component, and reusable ai-elements kit.
relates_to: [ADR-009, ADR-011, ADR-024]
updated: 2026-07-22
---

# AI Area

## Purpose & boundaries

The AI area provides AI capabilities including the AI Copilot chat panels, providers registry, token-usage tracking, and reusable Markdown/Mermaid layout blocks.

## State & persistence

- **AI State**: `src/lib/state/ide.svelte.ts` owns the one-live-turn lifecycle; `modules/ai/state/ai.svelte.ts` manages the workspace tab overlay.
- **Model registry**: `modelRegistry.svelte.ts` projects one persisted `ide:settings:model-registry@v2` record into picker groups, custom models, local models, and standard-provider models. The primary BYOK flow writes and verifies the matching OS-keychain credential before it persists or selects the provider name, endpoint, and model id; a failed verification leaves no selectable model record. It intentionally ships with no selectable model presets; contaminated v1 and scattered provider-model keys are inert rather than migration inputs.
- **Persistence**: Chat history is serialized through the native storage layer for both project roots and the app-data global-memory scope. AES-GCM content uses an explicit versioned envelope; plaintext migration is transactional and one-time. SQLite and Keychain work runs on blocking workers, never AppKit's event loop.

## Extension points

- **AI Providers**: The Add Model dialog is the primary BYOK path: provider name, API key, API link, model name, and format. Workspace `.env` providers (`API_KEY_NAME`, `API_LINK_NAME`, `API_MODEL_NAME`, optional `API_FORMAT_NAME`) remain a legacy project-discovery path, not a setup prerequisite.
- **Stream Contracts**: Contract definitions for UI/state coordination specified in `ai-elements/types.ts`.

## Cross-area edges

- **Embeddings**: AIChat panel embeds within `DesignerLayout`, `NotesLayout`, and right sidebar panels (ADR-024).
- **Workspace shell**: `AiLayout.svelte` supplies session navigation, chat, and the work panel to `WorkspaceShell` under the `agent` profile. The active module header toggles the same left and right surfaces.
- **Tauri Listener**: Subscribes to token usage stream updates emitted from Rust backend via Tauri.
- **Stream terminal state**: The kernel awaits event-listener registration before enabling sends and applies a 20-second first-byte deadline, so every turn ends in a response, cancel, or visible error.
- **Local lifecycle and limits**: GGUF/MLX inference spawns a fresh local sidecar for each reply and unloads it when the process exits. The prompt footer chip renders only when a local model is selected and has three states: red "unavailable" when the model file is missing, accent "ready" while idle (the model loads per message), and green "loaded" while the sidecar is generating (ADR-033). Local generation is capped at 1,024 output tokens; API providers do not receive a client-side output cap, and the context meter is informational rather than enforced prompt truncation.
- **Model management**: Settings → AI Models is one immediate-action surface (ADR-033): a unified "Your models" list over `modelRegistry.records()` with active-radio selection and removal, plus a two-mode Add Model dialog (Via API per ADR-032, or Upload local GGUF + optional mmproj). Every action reports success or failure in an in-tab status banner; `.env` and legacy single-path entries appear only when they exist.
- **Recovery from legacy failures**: A previously saved BYOK record whose stored key is missing cannot recover its secret; chat directs the user to remove it and re-add it with the API key. New records cannot reach that state because the encrypted-store read-back happens before persistence.
- **Secret storage**: Provider keys live AES-GCM-encrypted in `api-keys.json`, keyed by a single OS-keychain-held encryption key — not one keychain item per key. This is the same envelope pattern as the vault/chat memory, so adding models does not prompt for the OS keychain on every key (ADR-035).
- **Clean reset**: Settings → AI Models includes a destructive reset for all saved AI model records, endpoints, selections, and provider credentials. It intentionally leaves downloaded model files on disk.
- **Persistence safety**: Authentication failure never implies plaintext. Invalid-key ciphertext renders as an unavailable placeholder and is never encrypted again. Plaintext persistence is capped at 2 MiB; stored payload materialization is capped at 3 MiB.

## Gotchas

- **Styling constraints**: Attachment-name truncation and icon emphasis use semantic-token classes; the malformed inline `max-w` declaration was removed.
- **Browser preview**: `localhost` runs the IPC mock, not the native keychain or a real workspace `.env`. It produces a deterministic mock stream without a secret; use the Tauri app to exercise real credentials and network providers.

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`Actions.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Actions.svelte) | ai-elements/Actions |
| [`Checkpoint.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/checkpoint/Checkpoint.svelte) | Checkpoint.svelte |
| [`index.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/checkpoint/index.ts) | index.ts |
| [`Code.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Code.svelte) | ai-elements/Code |
| [`Context.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/context/Context.svelte) | Context.svelte |
| [`index.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/context/index.ts) | index.ts |
| [`Conversation.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Conversation.svelte) | ai-elements/Conversation |
| [`CopyButton.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/CopyButton.svelte) | ai-elements/CopyButton |
| [`Mermaid.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Mermaid.svelte) | ai-elements/Mermaid |
| [`ModelSelector.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/ModelSelector.svelte) | ai-elements/ModelSelector |
| [`Reasoning.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Reasoning.svelte) | ai-elements/Reasoning |
| [`Response.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Response.svelte) | ai-elements/Response |
| [`types.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/types.ts) | Shared types for ai-elements components (Stream B contract) |
| [`AIChat.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/AIChat.svelte) | AI Copilot — integrated view rebuilt on top of the ai-elements kit |
| [`PromptInput.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/components/PromptInput.svelte) | ─── Types ──────────────────────────────────────────────────────────────────── |
| [`AiChatMain.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/components/AiChatMain.svelte) | AI Copilot — integrated view rebuilt on top of the ai-elements kit |
| [`AiLayout.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/components/AiLayout.svelte) | AiLayout.svelte |
| [`AiSidebar.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/components/AiSidebar.svelte) | AiSidebar.svelte |
| [`ChatColumn.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/components/ChatColumn.svelte) | Session tab strip — uses divs for tabs with close button siblings |
| [`SessionRow.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/components/SessionRow.svelte) | SessionRow.svelte |
| [`WorkPanel.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/components/WorkPanel.svelte) | Tab bar |
| [`contributions.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/contributions.ts) | contributions.ts |
| [`ai.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/state/ai.svelte.ts) | ai.svelte.ts |
| [`_ai-chat-column.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/styles/_ai-chat-column.sass) | ChatColumn — session tab strip + AIChat conversation area |
| [`_ai-checkpoint-exclusive.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/styles/_ai-checkpoint-exclusive.sass) | ── Checkpoint ──────────────────────────────────────────────────────────── |
| [`_ai-elements-exclusive.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/styles/_ai-elements-exclusive.sass) | ── Conversation ────────────────────────────────────────────────────────── |
| [`_ai-layout.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/styles/_ai-layout.sass) | AiLayout — 3-pane flex layout: sidebar \| chat \| workpanel |
| [`_ai-sidebar.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/styles/_ai-sidebar.sass) | AiSidebar — session list with segmented Home/Code tabs |
| [`_ai-work-panel.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/styles/_ai-work-panel.sass) | WorkPanel — Files / Terminal / Browser tabs with left-edge resize handle |
| [`_prompt-input.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/styles/_prompt-input.sass) | _prompt-input.sass |
| [`types.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/types.ts) | types.ts |
| [`ai.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/ai.svelte.ts) | Compatibility domain store for shared AI state. The implementation still |
| [`modelRegistry.contract.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/modelRegistry.contract.ts) | Cross-stream contract for the unified model registry (AI-LAYER-REMEDIATION-PLAN). |
| [`modelRegistry.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/modelRegistry.svelte.ts) | modelRegistry.svelte.ts |
| [`ai-workspace.test.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/ai-workspace.test.ts) | ai-workspace.test.ts |

<!-- filetable:end -->
