---
id: ADR-009
title: AI Providers and Custom Models Settings Integration
type: adr
tags: [ai, settings, providers]
summary: Defines how AI providers and custom/local model configuration are surfaced and persisted in Settings.
relates_to: [ADR-011, ADR-017]
status: superseded
updated: 2026-07-13
---

# ADR-009: AI Providers and Custom Models Settings Integration

**Status:** Superseded in part by ADR-029
**Date:** 2026-06-24
**Decision makers:** Architecture Committee, Frontend Lead, AI Integration Lead

---

## Context

FractalEngine Studio offers an AI Copilot side-panel (`AIChat.svelte`) for code explanation, debugging, and generation. Initially, it supported standard providers (OpenAI, Anthropic, Google, and a local Ollama instance).

To accommodate modern workflows, developers require:
1. First-class settings configuration and endpoint support for newer premium API providers: **DeepSeek**, **xAI Grok**, and **Z.ai**.
2. The ability to register and configure arbitrary custom LLM models (e.g. locally hosted models or internal proxy endpoints) and have them instantly populated in the chat interface.
3. Persistent configuration storage and unified UI grouping.

---

## Decision

We will implement a unified Svelte-state settings storage system and expand the settings dialog to natively support DeepSeek, xAI, Z.ai, and custom model registries.

### 1. Unified Svelte Settings Storage (`ide.svelte.ts`)
Settings are managed in a reactive Svelte 5 class state (`ideState`). Non-secret preferences are persisted to namespaced `localStorage` keys, while credentials follow ADR-017 and remain in the native keychain. This includes:
- Credential identifiers and custom base URLs for all providers (OpenAI, Anthropic, Google, Ollama, DeepSeek, xAI, Z.ai).
- A registry array of `customModels` where each item has the schema:
  ```typescript
  interface CustomModel {
    id: string;
    name: string;
    provider: string; // 'openai' | 'anthropic' | 'google' | 'ollama'
    endpoint?: string;
  }
  ```

### 2. Multi-Provider AI UI Support (`SettingsDialog.svelte` & `AIChat.svelte`)
- **API Settings Form**: The Settings panel exposes credentials sections for DeepSeek, xAI, and Z.ai. The custom model addition sub-form and custom model registry table are kept permanently visible at the bottom of the AI tab, avoiding conditional collapsibles.
- **Optgroup Selection Dropdown**: The AI Chat dropdown groups models under standard, new, and custom optgroup categories:
  ```html
  <select bind:value={currentDropdownValue} onchange={handleModelChange}>
    <optgroup label="OpenAI">...</optgroup>
    <optgroup label="Anthropic">...</optgroup>
    <optgroup label="DeepSeek">...</optgroup>
    <optgroup label="xAI Grok">...</optgroup>
    <optgroup label="Z.ai">...</optgroup>
    <optgroup label="Custom Models">
      {#each ideState.settings.customModels as model}
        <option value="custom:{model.id}">{model.name}</option>
      {/each}
    </optgroup>
  </select>
  ```

### 3. API Execution Routing
In Svelte's `sendPrompt()`, the request parameters are routed dynamically. DeepSeek, xAI, and Z.ai retain normalized provider identities and use the native OpenAI-compatible execution branch with provider-specific default endpoints. Custom models supply their API format, endpoint, model id, and credential id. No execution path passes the raw credential over IPC.

Settings editing is transactional: its form, model lists, custom configurations, and local model paths remain draft-only until Save. Credential writes are awaited first; failures keep the dialog open. Cancel discards the draft.

One shared provider registry defines Settings options and model groups. The active model is resolved against the active provider's available models, and a custom provider may opt into an exact request URL instead of endpoint suffix construction. Credential changes are applied as a native rollback-safe batch; the dialog cannot be dismissed while that batch is pending.

---

## Consequences

### Positive
- **Extensibility**: Developers can configure any OpenAI/Anthropic/Google/Ollama compatible endpoint directly from the UI without changing Svelte source code or Rust bindings.
- **OpenAI Compatibility Reuse**: Leveraging the OpenAI API standard for DeepSeek, xAI, and Z.ai keeps the Tauri Rust backend lightweight and avoids code churn.
- **Improved UX**: Grouped optgroups prevent dropdown clutter, and a permanently visible custom model config makes model management obvious.

### Negative
- OS keychain availability is required for authenticated native provider execution.

### Neutral
- Standard models are hardcoded as UI convenience presets, while custom models require manual base provider mapping.

---

## Alternatives Considered

### 1. Native Tauri Rust API Clients for DeepSeek/xAI/Z.ai
Implementing distinct Rust crates or calling custom endpoints inside Rust. Rejected because their completions payloads strictly match the OpenAI JSON structure, meaning overriding the base endpoint inside the existing OpenAI route yields identical results with zero compilation overhead.
