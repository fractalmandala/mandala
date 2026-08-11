---
id: ADR-016
title: Extract Shared AES-256-GCM Envelope Encryption into crypto.rs for Vault and Chat Memory
tags: [security, encryption, crypto, vault, memory]
summary: Defines versioned AES-256-GCM envelopes and a one-time, non-amplifying worker-thread migration boundary for vault and chat memory.
relates_to: [ADR-007, ADR-011]
status: accepted
updated: 2026-07-15
---


**Status:** Accepted
**Date:** 2026-07-12
**Decision makers:** Backend Lead, Security Reviewer

---

## Context

Two subsystems in FractalEngine persist sensitive user data to local disk outside the OS keychain, because the data is too large to fit inside a single keychain credential: Windows Credential Manager caps an individual credential blob at 2560 bytes.

The password vault (`passwords.json`, see ADR-007) stores login items, provider API keys, and TOTP secrets as a JSON blob that can easily exceed that cap once a user has more than a handful of entries. ADR-007's own Notes section flagged this as a known gap: "the current `passwords.json` uses plaintext storage... must be encrypted at rest before any public release." Earlier in this session, that gap was closed by adding `encrypt_vault`/`decrypt_vault`/`get_or_create_vault_key` directly inline in `lib.rs`: a 32-byte AES-256 key generated with `OsRng`, stored base64-encoded under a single keychain entry (`vault-master-key`), used to encrypt the whole vault file with a random 12-byte nonce per write.

Immediately after, the local-first AI memory harness (`memory.rs`, ADR-011) needed the same protection for a different reason: `memory.rs` persists chat session messages to a per-project SQLite database (`<project>/.fractal/memory.db`) so conversations survive reload. Message `content` is free-text user/assistant chat — the actually sensitive column in that schema (session ids, timestamps, and roles stay plaintext so they remain queryable/sortable via SQL). Writing a second, independent AES-GCM-plus-keychain-key implementation directly into `memory.rs` — copying the same `OsRng`/`Aes256Gcm`/nonce-encoding logic that had just been written for the vault — would have meant two hand-rolled cryptographic call sites in the same codebase, each one a separate place a future edit (e.g. a nonce-handling change, a key-rotation feature) could drift out of sync with the other.

Both subsystems share the same shape of problem: bulk data on disk, a small derived key in the OS keychain, AES-256-GCM as the cipher, and a need for the two datasets' keys to stay cryptographically independent of each other (a compromise of one subsystem's key should not expose the other's data).

---

## Decision

We will extract the vault's AES-256-GCM envelope-encryption logic into a new shared module, `src-tauri/src/crypto.rs`, and have both the password vault (`lib.rs`) and chat memory (`memory.rs`) call into it with their own separate keychain account name.

`crypto.rs` exposes key retrieval plus authenticated envelope helpers. New ciphertext uses the explicit `enc:v1:{nonce_b64}:{ciphertext_b64}` format; decryption remains compatible with the historical `{nonce_b64}:{ciphertext_b64}` format. `is_encrypted_envelope()` classifies both formats structurally without authenticating them. This distinction is mandatory: authentication failure can mean a missing or rotated key, but it never proves that the stored value is plaintext.

Chat-memory plaintext migration runs transactionally once per database and encrypts only values that are not structurally valid envelopes. A structurally valid envelope that cannot authenticate remains byte-for-byte unchanged and renders as an unavailable-message placeholder. All SQLite and keychain work runs through `spawn_blocking`, and message persistence/load paths enforce payload-size limits before allocating or returning content to the renderer.

We chose extraction into a shared module over duplicating the AES-GCM implementation a second time in `memory.rs` because the vault's own encryption had just been hand-written that same session — copying it again would have created two independently-evolving copies of security-critical code with no way to fix a bug (e.g. nonce handling, key-derivation edge cases) in both places at once. We chose per-purpose keys over a single shared key across both subsystems because chat memory content and vault credentials have different threat models and lifecycles; keeping the keys independent means compromising one doesn't automatically expose the other.

---

## Consequences

### Positive

- One AES-256-GCM implementation is now unit-tested once (`crypto.rs`'s `round_trips_plaintext`, `different_calls_use_different_nonces`, `wrong_key_fails_to_decrypt`, `malformed_ciphertext_is_rejected`) and that coverage backs both call sites, instead of the vault having tests that memory.rs's independent implementation wouldn't have inherited.
- A future third at-rest-encrypted subsystem (e.g. a notes-vault encryption feature) needs zero new cryptographic code — just a new `const ..._KEY_ACCOUNT` and two one-line wrapper functions calling into `crypto.rs`.
- Fixing a bug in nonce generation, key encoding, or the ciphertext format fixes it for every current and future caller simultaneously, rather than requiring the same patch to be applied N times across N hand-rolled copies.
- The vault and chat memory keys remain cryptographically independent (`vault-master-key` vs. `memory-master-key`, two separate `keyring::Entry` records) even though they now share an implementation — extracting the module did not collapse the security boundary between the two subsystems.

### Negative

- `lib.rs` and `memory.rs` now both take a compile-time dependency on `mod crypto;` — a bug in `get_or_create_key`'s keychain-lookup path (shared by both) affects vault and memory simultaneously, whereas before this refactor a keychain-access regression could only ever have affected the vault (memory encryption did not exist yet as a separate implementation).
- The `keyring` crate's behavior differs by OS backend (macOS Keychain, Windows Credential Manager, Linux Secret Service via libsecret/D-Bus). A machine where the OS keychain backend is unavailable — e.g. a headless Linux box with no Secret Service daemon running — now breaks both the password vault and chat memory persistence at once, doubling the blast radius of that specific environment problem compared to when only the vault depended on it.
- A missing/rotated memory key makes historical ciphertext unrecoverable. The UI returns an explicit placeholder instead of raw ciphertext, preserving availability at the cost of losing access to those historical message bodies.
- Memory persistence rejects plaintext above 2 MiB and refuses to materialize stored payloads above 3 MiB. Very large attachments must remain references rather than being persisted inside a chat turn.

### Neutral

- The vault detects its legacy plaintext JSON by document shape. Chat memory uses a one-time SQLite migration plus structural envelope classification because arbitrary free-text messages do not have a safe plaintext sentinel.
- Both subsystems' keychain entries live under the same `KEYCHAIN_SERVICE` constant (`"com.fractalmandala.fractalengine"`), now defined once in `crypto.rs` rather than being duplicated as a second constant if `memory.rs` had rolled its own implementation.

---

## Alternatives Considered

### Duplicate the AES-GCM + keychain-key code a second time in `memory.rs`

Copy the same `OsRng`/`Aes256Gcm`/base64-nonce-encoding logic that had just been written for the vault directly into `memory.rs`, with its own local key-derivation function. Rejected because this produces two independently-evolving implementations of the same security-critical primitive in the same codebase — a fix to one (e.g. correcting nonce reuse behavior) would not automatically apply to the other, and reviewers would need to re-audit two call sites instead of one shared module.

### Single shared encryption key for both vault and memory

Use one keychain entry and one derived AES-256 key for both the password vault and chat message content, rather than giving each subsystem its own account name. Rejected because vault credentials (API keys, TOTP secrets, login passwords) and chat message content have different sensitivity profiles and different code paths that touch them; a single shared key means any future bug or exposure in the memory-extraction pipeline's key handling would also put the password vault at risk. Per-purpose keys under one shared `crypto.rs` implementation get the benefits of code reuse without collapsing that isolation boundary.

### Encrypt the entire SQLite database file (e.g. via SQLCipher) instead of just the `content` column

Considered for `memory.rs` specifically: encrypt `memory.db` as a whole rather than selectively encrypting message content. Rejected because SQLCipher requires a different `rusqlite` build configuration than the existing `bundled` feature already in `Cargo.toml`, adding a new native dependency for a database where session ids, timestamps, and roles are not sensitive and need to stay directly queryable/sortable via plain SQL (e.g. `ORDER BY updated_at`). Column-level encryption of just `content`, reusing the exact primitive already trusted for the vault, achieves the actual security goal (protect chat text at rest) without giving up SQL-level querying on the rest of the schema or introducing a new dependency.

### Store vault/memory data directly in the OS keychain, no on-disk encrypted file

Skip the "small key in the keychain, bulk data encrypted on disk" indirection entirely and store the sensitive data directly as keychain entries. Rejected because Windows Credential Manager caps a single credential at 2560 bytes — the vault already exceeds this for users with more than a handful of login entries, and chat message history is unbounded in size. Bulk data must live on disk; only the small 32-byte derived key can safely live in the keychain across all three target platforms.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-007 | In-App Browser with Integrated Password Vault and 2FA | This ADR closes the "plaintext storage" gap ADR-007's Notes section flagged, and `crypto.rs` is extracted from the vault's own encryption code |
| ADR-011 | Local-First AI Memory and Context Harness | `memory.rs`'s chat message persistence is the second consumer of `crypto.rs`, encrypting the `content` column of the messages table |

---

## Notes

This is a retroactive ADR: the vault's inline AES-256-GCM implementation and its later extraction into `crypto.rs` (with `memory.rs` as the second consumer) both happened within the same working session, prior to this decision being formally recorded. Context and consequences above are written as they were understood at the time the extraction was made, i.e. immediately after chat-memory encryption was identified as a second, near-identical need to the vault's already-solved problem.

On 2026-07-15 the former migration rule was found to have expanded a 41-message database to 3.7 GiB: every authentication failure was treated as plaintext and encrypted again during database open. Individual rows reached 894 MiB, and synchronous `append_message` work beachballed AppKit. The corrupt database was quarantined, and the envelope classifier, one-time migration marker, worker-thread boundary, and size guards became mandatory regression contracts.

Any third at-rest-encrypted subsystem added later must use the versioned envelope format and must never infer plaintext from authentication failure. Bulk migration and keychain access must stay off the application event loop.
