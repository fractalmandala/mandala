---
id: ADR-030
title: Single Add Model Flow
type: adr
tags: [settings, ai-providers, model-registry]
summary: Consolidates the SettingsDialog's Add Model flow into one universal modal driven by AI_PROVIDER_DEFINITIONS, replacing the previous multi-path provider and custom-config branches.
relates_to: [ADR-009, src/lib/data/aiProviders.ts, src/lib/state/modelRegistry.contract.ts]
status: superseded
updated: 2026-07-16
---

# ADR-030: Single Add Model Flow

**Status:** Superseded by ADR-032
**Date:** 2026-07-15
**Decision makers:** Architecture Lead, Stream B

---

## Context

The SettingsDialog's Add Model flow previously had multiple entry points:
- Standard API providers each had their own configuration sections in the providers tab
- Custom models had a separate form
- The provider `<select>` used label-prefix matching rather than `AI_PROVIDER_DEFINITIONS` ids
- Preset model suggestions were hardcoded in the component

This led to inconsistent UX and code duplication. Each provider section duplicated the same pattern (API key, base URL, model list), and custom models had an entirely separate creation path.

## Decision

### One universal Add Model modal

The Add Model flow is now a single modal with two tabs:

1. **Model Provider tab** — Works for ANY standard provider (not just custom). The provider `<select>` is driven entirely by `AI_PROVIDER_DEFINITIONS` ids. It uses free-text model-id entry with no built-in suggestions or preset data, so only models deliberately added by the user enter the registry. The user enters a model and API key; on submit, the model is appended to `draft.userModels[provider]`.

2. **Custom Config tab** — Builds a `CustomModelDraft` with API format, request URL, model ID, API key, and optional Full URL/Multimodal flags. On submit, it is appended to `draft.customModels` with a generated credential id.

### Provider-scoped model lists

Each standard provider section now has its own model list with add/remove and radio selection. The radio identity is `(providerId, id)` — one radio name per provider section, no shared string namespace.

### Active model selection

`draft.activeModel` is a `{ providerId: string, id: string } | null`. The radio buttons bind to this directly. A "No model selected" state is shown explicitly when `draft.activeModel` is null. Provider switching never auto-reassigns the active model — it offers, don't force.

### Settings bridge

The SettingsDialog no longer owns the save logic. Instead:
- `settingsBridge.captureSettingsDraft()` returns a `SettingsDraft` snapshot on dialog open
- All UI binds to the draft
- `settingsBridge.commitSettingsDraft(draft)` persists everything atomically on save

This moves the keychain rollback/transaction logic behind the bridge, keeping the component free of save orchestration.

## Consequences

### Positive
- Single code path for adding any model type
- Provider list stays in sync with `AI_PROVIDER_DEFINITIONS` — no hardcoded provider labels in SettingsDialog
- Preset model suggestions come from the registry, not hardcoded strings
- Active model selection is unambiguous with `(providerId, id)` identity
- Settings bridge provides cleaner separation of concerns

### Negative
- The `SettingsDraft` type must be maintained in sync with the actual settings shape
- Staged credentials exist in `draft.pendingCredentials` until committed, adding memory overhead for unsaved changes

### Neutral
- Existing Save/Cancel UX is preserved
- `isSaving` and `saveError` remain in the component

## Superseded

Superseded by ADR-032. The draft-only credential lifecycle made a model appear added while
its key remained unsaved when the outer Settings dialog was closed. The flow is now one
immediate BYOK action.
