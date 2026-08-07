---
id: ADR-035
title: Envelope-Encrypted API-Key Store and Keyring Backend
type: adr
tags: [security, keychain, ai-providers, byok, backend, encryption]
summary: Enables keyring's platform backend (it shipped with none, silently no-op-ing all provider-secret storage) and moves provider API keys from one keychain item per key to the shared AES-GCM envelope store, matching the vault/memory pattern and removing the per-model keychain prompt.
relates_to: [ADR-017, ADR-028, ADR-032, src/lib.rs, src/crypto.rs]
status: accepted
updated: 2026-07-16
---

# ADR-035: Envelope-Encrypted API-Key Store and Keyring Backend

**Status:** Accepted
**Date:** 2026-07-16
**Decision makers:** FractalEngine Studio maintainer

## Context

Two defects, only visible in the native (Tauri) build and therefore invisible to the
browser-mock test suite, made BYOK provider keys unusable:

1. **The keychain had no backend.** `keyring = "3"` was declared with no feature flags.
   keyring 3.x ships **no credential store** unless a platform feature (`apple-native`,
   `windows-native`, `sync-secret-service`) is enabled; with none, it silently falls back
   to an in-memory mock store where each `Entry::new` is independent. `write_api_key`
   stored a key in one throwaway cell; the immediate read-back in `apply_api_key_changes`
   constructed a *different* cell, read empty, and reported **"Keychain verification failed
   for &lt;credential&gt;"** for every key, every time. Later chat use hit the same wall as
   "No keychain credential found." ADR-017's "keep secrets in native storage" was, in
   practice, a no-op — nothing persisted anywhere.

2. **One keychain item per key forced a permission prompt per model.** Even with a real
   backend, storing each key as its own generic-password item under a per-UUID account
   (`api-key-custom-model-<uuid>`) creates a fresh ACL each time, so macOS prompts for the
   login keychain on *every* model added — unlike desktop editors (VS Code / Cursor / TRAE
   via Electron `safeStorage`) which touch the keychain once for a single encryption key
   and store secrets in an encrypted file. The app already had that exact pattern in
   `crypto.rs` (used by the password vault and chat memory) — the API keys just didn't use it.

## Decision

**Enable the platform keyring backends**, target-scoped so each compiles only where it
applies: `apple-native` (macOS), `windows-native` (Windows), `sync-secret-service` (Linux).

**Move provider API keys onto the shared `crypto.rs` envelope store.** Keys are held in a
single app-data file (`api-keys.json`) as AES-256-GCM ciphertext; the 32-byte encryption
key lives in the OS keychain under one stable account (`api-keys-master-key`), created once
via `get_or_create_key`. `write_api_key`/`read_api_key`/`write_api_key_set` now take the
`AppHandle` and operate on this file; the IPC surface (`save_api_key`, `apply_api_key_changes`,
`restore_api_key_revision`) is unchanged because `AppHandle` is injected on the native side.

The post-write read-back verification from ADR-032 is preserved but simplified to a single
in-process check: the store is a synchronous file, so there is no keychain-consistency race
to retry against.

Migration is a non-issue: because the mock store never persisted anything, there are no
recoverable pre-existing keychain keys to import — every prior save had failed.

## Consequences

### Positive

- Provider keys actually persist; adding and using a BYOK model works.
- One keychain grant total (a single stable item), not one prompt per model — matching how
  Electron-based editors behave.
- The read-back can no longer spuriously fail; verification is a deterministic file round-trip.
- API keys now share the vault's/memory's encryption path — one mechanism to reason about.

### Negative

- On an **unsigned dev build**, macOS may still prompt for the single encryption-key item on
  rebuilds (the binary signature changes, so "Always Allow" doesn't durably stick). Full
  silence — as in signed editors — requires a stable code-signing identity; that is a build
  concern, not addressed here.
- Keys are decrypted into process memory on read (as before). At-rest protection equals the
  keychain-held key plus OS file permissions, the same trust model as the vault.

### Neutral

- ADR-017's boundary guarantees are retained: the renderer stores only a credential id, never
  a raw key; credential-revision undo (`restore_api_key_revision`) is unchanged.

## Alternatives Considered

### Keep one keychain item per key, just enable the backend

Fixes correctness but not the per-model prompt storm; inconsistent with the app's own vault.

### Store keys in a file without any keychain-held key

Rejected: drops the encryption-at-rest guarantee ADR-017/028 established. The envelope keeps it.

### Sign dev builds to silence prompts instead of changing storage

Complementary, not a substitute — signing removes the *repeat* prompt but per-key items would
still mean one grant per model. Pursue signing separately for full parity.

## Related Decisions

| ADR | Title | Relationship |
|---|---|---|
| ADR-017 | Keep Provider Secrets in Native Storage | amends storage mechanism |
| ADR-028 | Security Boundaries & Contract-Typed IPC | preserves encryption-at-rest boundary |
| ADR-032 | Persist BYOK Models Immediately | keeps its write-then-verify guarantee |
