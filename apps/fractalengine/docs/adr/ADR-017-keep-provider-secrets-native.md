---
id: ADR-017
title: Keep Provider Secrets in Native Storage
type: adr
tags: [security, keychain, ipc, ai-providers]
summary: Keeps custom-model and project environment-provider API keys out of persisted renderer state and secret-bearing IPC responses.
relates_to: [ADR-004, ADR-016]
status: accepted
updated: 2026-07-13
---

# ADR-017: Keep Provider Secrets in Native Storage

**Status:** Accepted
**Date:** 2026-07-12
**Decision makers:** FractalEngine maintainers

## Context

Provider API keys are needed to configure custom models and to run models declared in a project `.env`. Persisting a custom model object in browser localStorage previously persisted its API key. Returning parsed `.env` entries to the renderer also made each `API_KEY_*` value available in browser memory and frontend tooling.

The application already has a single IPC gateway and OS-keychain support for standard provider keys. The remaining flows need the same native boundary without losing browser/mock development support.

## Decision

We will store custom model secrets in the native keychain and resolve environment-provider secrets only inside native model execution.

Custom model records persist a generated credential identifier, and startup migrates legacy embedded keys before writing settings again. Environment-provider listing returns only provider metadata, while `run_env_model` reads the matching `.env` key natively. Standard and custom API execution also sends only that identifier: the native `run_api_model` command resolves the keychain entry and performs the request. The former secret-returning `load_api_key` command is removed.

Multi-key Settings saves use `apply_api_key_changes`: native code snapshots every prior secret, applies the requested writes, and restores all affected entries if any keychain operation fails.

Deleting a custom-model configuration is undoable, so it does not delete the referenced keychain credential. Renderer history can restore configuration snapshots but cannot recover an erased native secret; credential garbage collection must therefore occur only at a future non-undoable lifecycle boundary.

Credential replacement history is also native. A successful batch appends before/after keychain values to an in-memory native revision and returns only its numeric revision to the renderer. IDE snapshots store that opaque number; undo/redo calls `restore_api_key_revision`, which transactionally moves keychain state without returning secret values. Settings commits renderer persistence before the credential batch and restores its captured renderer snapshot if either side fails.

## Consequences

### Positive

- LocalStorage no longer persists custom-provider API keys.
- Renderer state no longer receives project `.env` API keys through provider discovery.
- Renderer state no longer receives standard/custom provider keys during startup or execution.
- Browser-mode development retains deterministic mock behavior through the IPC gateway.
- Undoing custom-model deletion restores a usable configuration instead of a dangling credential reference.
- Settings undo/redo restores both public configuration and the corresponding native credential revision.

### Negative

- Keychain availability is now required to create or use a custom model in Tauri mode.
- Legacy configuration migration is asynchronous during workspace initialization.
- Orphaned custom credentials may remain until an explicit, non-undoable credential-management flow is introduced.
- Credential revision history is intentionally process-local, matching the renderer undo stack; both reset when the app restarts.

### Neutral

- Custom model configuration now contains a credential identifier rather than an API-key field.

## Alternatives Considered

### Continue persisting custom-model objects unchanged

Rejected because `localStorage` is not an appropriate at-rest store for API keys.

### Encrypt keys in localStorage

Rejected because a renderer-held decryption key would not establish a meaningful native security boundary.

### Return `.env` keys only when a model runs

Rejected because it still exposes project secrets to renderer memory; native execution can resolve the key directly.

## Related Decisions

| ADR | Title | Relationship |
| --- | --- | --- |
| ADR-004 | Single IPC Gateway Module for All Tauri API Calls | Provides the gateway boundary. |
| ADR-016 | Extract Shared AES-256-GCM Envelope Encryption | Establishes the existing keychain-backed storage pattern. |
