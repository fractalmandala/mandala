---
id: sp-plan-2026-06-24-command-palette-settings-system-and-ai-copilot-upgrade
title: "Superpowers Plan: 2026-06-24-command-palette-settings-system-and-ai-copilot-upgrade"
type: archive
tags: [superpowers, plan, history]
updated: 2026-07-15
---

> **Historical superpowers implementation plan — kept as reference.**


We will build a keyboard-driven App Command Palette, a persistent multi-pane Settings Dialog (supporting API key management for multiple AI providers), and upgrade the AI Copilot chat to support model selectors, local folder file attachments, and rich streaming elements (reasoning accordions and progress indicators).

## User Review Required

> [!IMPORTANT]
> **Anthropic CORS Constraints**: Anthropic API endpoints block direct client-side CORS requests. We propose forwarding API requests via a new Rust backend command (`run_api_model`) using `ureq` in a spawned thread. This completely bypasses CORS and keeps user API keys secure.
> **Key Bindings**: The Command Palette will be mapped to `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux) globally.

## Proposed Changes

We will modify/create the following files in `apps/fractalengine`:

### Backend & Gateway Layer

#### [MODIFY] `Cargo.toml`
* Ensure dependencies support JSON parsing and HTTP client operations.

#### [MODIFY] `lib.rs`
* **[NEW] `select_file` command**: Triggers a native `rfd::FileDialog` file picker to select a local file.
* **[NEW] `run_api_model` command**: Streams API requests from AI providers (OpenAI, Anthropic, Gemini, Ollama) by spawning a background thread, performing POST calls, reading SSE chunks line-by-line, and emitting `ai-chunk` / `ai-done` events.

#### [MODIFY] `ipc.ts`
* Expose `selectFile(title?: string): Promise<string | null>` with a client-side mock fallback.
* Expose `runApiModel(...)` calling backend API streams.

#### [MODIFY] `ipc-mock.ts`
* Implement fallback mock for `selectFile` (simulates file selection).
* Implement fallback mock for `runApiModel` (simulates streaming completions).

---

### Global State Layer

#### [MODIFY] `ide.svelte.ts`
* Add settings state bindings (font size, font family, wrapping, provider configs, custom API model arrays, API keys).
* Load/Save settings to `localStorage`.
* Snapshot settings updates into the Undo/Redo boundary system.
* Integrate active provider and model selections inside `sendAiMessage()`.

---

### UI Components Layer

#### [NEW] `CommandPalette.svelte`
* Add a modal component for search-focused actions.
* Expose actions: sidebar toggles, theme switcher sub-menus, settings triggers, workspaces, and code commands.
* Listen to global `keydown` (`Cmd+K` / `Ctrl+K`) to toggle open/close state.

#### [NEW] `SettingsDialog.svelte`
* Add a multi-tab settings panel (General, AI Providers, Local Models, Browser & Vault).
* General: Font style options.
* AI Providers: Add/Configure API keys for Anthropic, OpenAI, Gemini, Ollama, and add custom model keys.
* Local Models: Select GGUF/MLX folder and list cache files.
* Save buttons with automated `ideState.pushUndo()` snapshot integrations.

#### [MODIFY] `+page.svelte`
* Render `<CommandPalette />` and `<SettingsDialog />` in root scope.
* Bind keyboard shortcut hooks.
* Add an "Open Settings" button in the footer strip next to active theme selections.

#### [MODIFY] `AIChat.svelte`
* **Model Selector Dropdown**: Render a selector next to the model name showing Sidecar GGUFs, local Ollama models, and configured API provider models.
* **File Attachments**: Add a paperclip button. Clicking calls `selectFile` IPC to pick a file. Dragging-and-dropping files over the chat box drops and adds them as chips.
* **Rich Elements**: Render reasoning blocks in expandable accordions with spinners, and tool calls in dynamic checklists.

#### [MODIFY] `Editor.svelte`
* Add type annotation `update: ViewUpdate` inside the CodeMirror update listener callback to resolve the TypeScript implicit `any` compiler error.
* Transform the static key cap `<span>` elements on the welcome splash screen into interactive `<button>` elements mapped to actual navigation and undo actions.

#### [MODIFY] `index.sass`
* Import style rules for command palette, settings tabs, and attachment chips.

#### [NEW] `components/_settings.sass`
* Style sheets for Settings Tabs layout, input fields, password toggles, and buttons.

#### [NEW] `components/_commandpalette.sass`
* Style sheets for centered command search card, list items, keyboard shortcuts chips, and overlay blur.

---

## Verification Plan

### Automated/Diagnostic Checks
* Run `pnpm check` to ensure Svelte 5 runes templates compile with 0 type diagnostics errors.

### Manual Verification
* Press `Cmd+K` to open the palette, search for "theme", press Enter, and check theme switcher.
* Open Settings, configure an API key, save, and check that `localStorage` is populated.
* Verify Undo works by changing settings, closing settings, and pressing `Cmd+Z` to verify values restore in state.
* Attach a text file in AI Chat, check that a chip is added, and submit a message to see the attachment context loaded.
