---
id: sp-spec-2026-06-24-ai-providers-and-local-models-upgrade-walkthrough
title: Superpowers Spec: 2026-06-24-ai-providers-and-local-models-upgrade-walkthrough
type: archive
tags: [superpowers, spec, history]
updated: 2026-07-15
---

> **Historical superpowers specification — kept as reference.**

# AI Providers and Local Models Upgrade Walkthrough

This spec documents the implementation details and walkthrough of the upgrades to AI Provider settings, Local GGUF/Vision/MLX model paths configuration, and the new inline model selector chat bar layout.

## 1. Local Models Backend & File Mappings
- **Rust Sidecar Configuration**: Modified `run_local_model` inside `src-tauri/src/lib.rs` to accept `mmproj_path: Option<String>` for multimodal Vision GGUF support and resolved the parent directory path when a `.safetensors` model file is passed (facilitating Apple MLX execution).
- **IPC Gateway Signatures**: Updated `runLocalModel` signature in `src/lib/ipc.ts` and `src/lib/ipc-mock.ts` to cleanly route `mmprojPath` option.
- **Settings Dialog Paths Pickers**: Modified the `Local Models` tab of `SettingsDialog.svelte` to bind discrete native file picker buttons for GGUF model path (`selectLocalGguf`), mmproj path (`selectLocalMmproj`), and MLX path (`selectLocalMlx`), persisting settings to local storage.

## 2. Inline Chat Bar Model Selector Layout
- **Relocation**: Moved the model selector dropdown out of the AI Chat header to inside the bottom `.prompt-textarea-wrapper` next to the attachment and send buttons.
- **Option Groupings**: Grouped all available models dynamically:
  - **Local Sidecar Models**: Recommended models (Qwen 2.5 Coder 7B, Llama 3 8B, Gemma 2 9B, DeepSeek Coder 1.5B) + custom selected paths (GGUF, MLX).
  - **OpenAI**: Configured OpenAI models.
  - **Anthropic**: Configured Claude models.
  - **Google Gemini**: Configured Gemini models.
  - **Ollama**: Local Ollama server models.
  - **Custom API Providers**: Configured custom model configurations.
- **Unified Switch State Logic**: When a model is selected, the dropdown handler splits the `provider:modelId` option value, updates `ideState.aiProvider`, routes `activeApiModel` or `selectedModelId` accordingly, and saves these choices.

## 3. Premium Interactive Action Buttons
- Integrated 5 premium action/modifier buttons inside the input bar:
  - **Attach**: Native file picker and file attachments list.
  - **@ Reference**: Autocomplete list of workspace files.
  - **# Template**: Autocomplete list of agent skill templates.
  - **Multimodal Visual Inputs (Mock)**: Visual/Image input indicator.
  - **Copilot Mode (Mock)**: Quick copilot mode autocomplete setting.
  - **Microphone (Mock)**: Voice dictation startup helper.
- Clicking the `@` or `#` action buttons dynamically appends the corresponding trigger character (`@` or `/`) to the prompt input field, shifts focus, and displays the autocomplete suggestions panel instantly.

## 4. Editor Splash Welcome Screen Actions
- **Open File Button**: Wired the `Click in Explorer` shortcut button to invoke `ideState.browseAndOpenFile()`. This expand-selects the Files sidebar and opens Tauri's native local file dialog immediately, loading the chosen file directly into the reactive CodeMirror editor instance.
- **Toggle Terminal Button**: Wired the `Footer Click` shortcut button to invoke `ideState.toggleTerminal()` to expand or collapse the console layout reactively.
