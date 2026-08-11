---
id: sp-plan-2026-06-24-ai-providers-and-local-models-upgrade
title: "Superpowers Plan: 2026-06-24-ai-providers-and-local-models-upgrade"
type: archive
tags: [superpowers, plan, history]
updated: 2026-07-15
---

> **Historical superpowers implementation plan — kept as reference.**


We will upgrade the settings dialog and the AI chat configuration to support adding multiple custom/common API providers, managing local files (GGUF, mmproj, safetensors) individually, and rendering a premium model selector matching the user's screenshots.

## User Review Required

> [!IMPORTANT]
> **OpenAI Compatibility**: Custom/common providers (like DeepSeek, xAI, Z.ai, etc.) typically use standard OpenAI-compatible completions. We will route their completion requests through the Rust backend `run_api_model` with custom base URLs.
> **Local File Paths**: Instead of folder directory scanning, we now provide inputs for specific paths (GGUF, Vision Projector mmproj, and MLX safetensors) which will be passed to llama-cli/mlx-lm.

## Proposed Changes

We will modify/create the following files:

### 1. Tauri Backend & Gateway

#### [MODIFY] `lib.rs`
* Update `run_local_model` signature to accept `mmproj_path: Option<String>`.
* If `mmproj_path` is provided, append `--mmproj <path>` to `llama-cli` args.
* Check if `model_path` ends with `.safetensors`. If so, extract its parent directory and pass it to `mlx_lm generate`.

#### [MODIFY] `ipc.ts`
* Update signature: `export async function runLocalModel(modelPath: string, mmprojPath: string | null | undefined, prompt: string): Promise<void>`.

#### [MODIFY] `ipc-mock.ts`
* Update signature of `runLocalModel` to match `ipc.ts`.

---

### 2. Global State Layer

#### [MODIFY] `ide.svelte.ts`
* Add local model path states: `localGgufModelPath`, `localMmprojPath`, `localMlxModelPath`.
* Add custom models array: `customModels: CustomModelConfig[]`.
* Update availableModels getter to list default models, local paths (if present), and all user-configured custom provider models.
* Parse selected prefix (e.g. `openai:`, `anthropic:`, `custom:`) inside model selector trigger.
* Load/Save these settings to `localStorage`.
* Snapshot configurations in `IDEStateSnapshot` for Undo/Redo boundary support.

---

### 3. UI Components Layer

#### [MODIFY] `SettingsDialog.svelte`
* **Local Models Pane**: Add file pickers for GGUF model file, mmproj file, and MLX safetensors file/folder.
* **AI Providers Pane**:
  * Render a list of all configured API provider models with action buttons to remove them.
  * Add an "Add Model..." button that displays the overlay card.
  * Implement the "Add Model" overlay supporting the two tabs: "Model Provider" and "Custom Config" matching the requested designs.

#### [MODIFY] `AIChat.svelte`
* Relocate the model selector dropdown to the bottom input row inside `.prompt-textarea-wrapper`, next to the attach/mic/send buttons matching the screenshot.
* Style the dropdown with premium styling (no border, clean arrow, HSL tailored text).

---

## Verification Plan

### Automated/Diagnostic Checks
* Run `pnpm check` to ensure Svelte and TypeScript files compile cleanly.
* Run `cargo check` inside `src-tauri` to verify Rust command signatures match.

### Manual Verification
* Verify adding a custom provider (e.g. DeepSeek or a custom URL) displays correctly in the chat input dropdown.
* Verify local file pickers correctly browse and store paths for GGUF, mmproj, and MLX model weights.
* Verify settings undo/redo updates.
