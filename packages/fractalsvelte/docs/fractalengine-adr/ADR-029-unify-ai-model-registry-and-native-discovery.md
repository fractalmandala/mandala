---
id: ADR-029
title: Unify AI Model Registry and Native Discovery
type: adr
tags: [ai, model-registry, ipc, native, persistence]
summary: Establishes the blank-by-default v2 model registry and native discovery boundary without importing contaminated legacy presets.
relates_to: [ADR-009, ADR-011, ADR-017, ADR-028]
status: accepted
updated: 2026-07-15
---


**Status:** Accepted
**Date:** 2026-07-15
**Decision makers:** AI Integration Lead, Desktop Platform Lead

## Context

The app exposed provider presets, user-entered models, downloaded GGUFs, custom endpoints, and `.env` providers through separate state paths. Those paths fell out of sync: a successful download did not make its model runnable, and a model selected in one AI surface could resolve differently in another.

Native dialogs and workspace search also belong to the same trust boundary. Blocking dialogs can freeze the macOS UI, while filesystem searches must stay inside roots selected by the user. Sessions created before a folder is opened must survive without silently becoming project sessions.

## Decision

We will use a single versioned model registry persisted at `ide:settings:model-registry@v2`, with native IPC for local validation, workspace search, Ollama discovery, asynchronous file dialogs, and global-memory sessions. The v2 boundary starts blank when absent and does not import the contaminated v1 or scattered provider-model keys; all subsequent writes use the v2 record.

The registry aggregates presets, user models, custom models, environment providers, and local sidecar records into one identity space. Legacy keys are imported and retained for one release. Credentials remain native-only under ADR-017; the renderer stores only credential identifiers.

## Consequences

### Positive

- Every model picker can read the same records, context-window metadata, and runnable state.
- Downloaded GGUF paths are persisted and revalidated before local execution.
- Filesystem operations retain the existing authorized-root boundary.
- The selected model has an explicit `(providerId, id)` identity; a stale selection resolves to no model instead of silently selecting the first available record.

### Negative

- Existing v1/scattered model configuration is not imported automatically. Users must deliberately re-add models, while native Keychain credentials remain intact.
- Ollama refresh has a two-second network timeout and can report an unavailable local service.
- Legacy model keys may remain on disk for rollback compatibility, but current code treats them as inert.

### Neutral

- Global sessions use the app data directory; project sessions remain stored in `.fractal/memory.db`.

## Alternatives Considered

### Keep provider-specific settings arrays

Rejected because it keeps model identity and runnable state distributed across UI-specific code paths.

### Move all provider configuration to Rust

Rejected because draft settings and undo/redo require renderer-owned, transactional editing while secrets must remain native.

## Related Decisions

| ADR | Relationship |
| --- | --- |
| ADR-009 | Supersedes the model-list and selection portions |
| ADR-011 | Extends local-first session persistence with global scope |
| ADR-017 | Depends on native credential storage |
| ADR-028 | Extends typed IPC and authorized filesystem boundaries |

## Incident amendment (2026-07-15)

The v1 migration imported historical preset arrays and an obsolete custom `OpenCode` record even though current onboarding intentionally ships with no selectable models. Because those records had no provenance marker, the app could not distinguish user-authored configuration from seeds written by earlier builds. The v2 boundary therefore rejects automatic v1/scattered-key import instead of attempting a heuristic cleanup.
