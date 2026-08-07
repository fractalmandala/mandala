---
id: ADR-033
title: Unified Model Management and Local Status Cue
type: adr
tags: [ai, settings, model-registry, local-models, byok, status-cue]
summary: Collapses the AI API Providers and Local Models settings tabs into one immediate-action AI Models tab with a two-mode Add Model dialog, and replaces the always-on red footer chip with a three-state local-model lifecycle cue.
relates_to: [ADR-017, ADR-029, ADR-030, ADR-032]
status: accepted
updated: 2026-07-16
---

# ADR-033: Unified Model Management and Local Status Cue

**Status:** Accepted
**Date:** 2026-07-16
**Decision makers:** FractalEngine Studio maintainer

## Context

After ADR-032 made BYOK adds immediate, the settings surface still split model management
across two tabs ("AI API Providers" and "Local Models") with draft-committed edits, stale
per-provider credential/base-URL/model sections that appeared only when a hidden active
provider matched, a legacy path picker trio, and a redundant download-status list. A user
could not see all their saved models in one place, and the Save Changes button governed some
AI edits but not others.

Separately, the AI prompt footer showed a "Local model unloaded" chip in permanent red — even
when an API model was selected — because the only inputs were `aiProvider === 'sidecar'` and
`isAiStreaming`. The local sidecar (`llama-cli` / `mlx_lm`) is spawned per message and exits
after each reply, so a persistent "loaded" state does not exist in the current architecture.

## Decision

We will manage all AI models from one immediate-action **AI Models** settings tab:

- One "Your models" list renders every saved model from `modelRegistry.records()` (BYOK
  custom, per-provider user models, and local models) with an active-model radio and a
  Remove action. Selection and removal apply immediately through the registry/kernel
  mutators, each as one atomic undo entry.
- One **Add Model** dialog with two modes: **Via API** (provider name, API format, API link,
  model name, API key — committed with its keychain credential in one settings-bridge
  transaction per ADR-032) and **Upload local file** (model name, GGUF file, optional mmproj
  GGUF — added and selected in one `addLocalModel` undo entry).
- Every add/select/remove/clear/reset action reports success or failure in a persistent
  status banner inside the tab; dialog validation failures render inside the dialog.
- Removing a BYOK model clears its keychain credential (empty key = delete) in the same
  transaction that drops the record.
- Workspace `.env` records and legacy single-path GGUF/mmproj/MLX entries render only when
  they exist, as read-only/clearable compatibility sections.
- The dialog-level Save Changes button now governs only non-AI settings (editor, browser).

The AI prompt footer chip becomes a three-state lifecycle cue rendered only when a local
model is selected: red "Local model unavailable" when the model file is missing, accent
"Local model ready" when idle (the model loads per message), green "Local model loaded"
while the sidecar process is generating.

## Consequences

### Positive

- All saved models are visible in one list and remain selectable from every model picker.
- Users get an explicit success/error cue for each model action instead of silent drafts.
- The footer chip no longer claims a local model is "unloaded" when an API model is active,
  and its green state now matches the real per-message sidecar lifecycle.

### Negative

- AI model edits are no longer reverted by Cancel in the outer Settings dialog; undo/redo is
  the recovery path.
- Per-provider base-URL overrides and credential replacement lost their dedicated settings UI;
  existing values persist and remain editable only by re-adding a model.

### Neutral

- A truly persistent "loaded" state would require a resident llama-server; the cue documents
  the per-message lifecycle honestly until such a runtime exists.
- The "Model Downloads" marketplace tab remains the path for curated model downloads.

## Alternatives Considered

### Keep separate API and local tabs with clearer copy

Rejected: the split was the confusion — two add paths, two lists, and two commit models for
what users think of as one "my models" collection.

### Show a permanently green chip once a local model is selected

Rejected as dishonest: the sidecar loads the model per message, so "loaded" outside a running
reply would misrepresent memory state and mask first-token latency.

## Related Decisions

| ADR | Title | Relationship |
|---|---|---|
| ADR-017 | Keep Provider Secrets in Native Storage | depends on |
| ADR-029 | Unify AI Model Registry and Native Discovery | depends on |
| ADR-030 | Single Add Model Flow | supersedes remainder |
| ADR-032 | Persist BYOK Models Immediately | extends |
