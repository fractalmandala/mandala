---
id: ADR-038
title: Use a Native On-Device Dictation Bridge
type: adr
tags: [dictation, speech, macos, ipc, privacy, accessibility]
summary: Uses a Swift on-device Apple Speech helper behind Tauri IPC to dictate into FractalEngine writing surfaces without audio crossing the webview boundary.
relates_to: [ADR-004, ADR-025, ADR-026, ADR-028]
status: accepted
updated: 2026-07-17
---


**Status:** Accepted
**Date:** 2026-07-17
**Decision makers:** Product owner and FractalEngine maintainers

## Context

FractalEngine contains several independently implemented text surfaces: CodeMirror files, raw Markdown textareas, TipTap notes, chat composers, and contenteditable design text. macOS system Dictation may insert into some of these surfaces, but gives the application no consistent lifecycle, privacy mode, error feedback, or undo boundary.

The feature must capture microphone audio only after an explicit user action, keep v1 transcription on-device, and deliver partial/final text through the existing Tauri boundary without bypassing each editor's native input and history handling. The browser development mode must remain usable without microphone hardware or a Tauri bridge.

## Decision

We will use a small Swift helper process backed by Apple's Speech and AVFoundation frameworks, supervised by Rust/Tauri and exposed to the renderer exclusively through the existing IPC gateway and browser mock.

The helper requires on-device recognition and emits transcript/state deltas only; audio stays native. A shared Svelte controller applies final text through the focused surface's ordinary DOM/editor transaction path. This chooses a native Apple implementation over browser speech APIs because a Tauri webview cannot reliably provide Apple's on-device speech behavior, and over a cloud provider because v1 explicitly has no network fallback.

## Consequences

### Positive

- Dictation is available to every registered editable surface through one lifecycle and one command path.
- Microphone buffers never cross the Tauri IPC boundary, and the native request refuses a recognizer without on-device support.
- `pnpm dev` retains deterministic dictation events through `ipc-mock.ts`, so interaction tests do not need macOS microphone access.

### Negative

- The macOS build now requires Xcode's `swiftc`, Speech, and AVFoundation frameworks; non-macOS builds expose only the unavailable/fallback behavior.
- The helper binary is written into FractalEngine's app-data directory at runtime and must be monitored for signing/notarization behavior in a packaged release.
- Fn/Globe delivery remains device- and macOS-configuration-dependent, so the command palette, visible controls, and configurable fallback shortcut remain mandatory.

### Neutral

- The existing single IPC gateway and contract test gain four dictation functions/events.
- Each editor retains ownership of its existing undo semantics; the controller does not create a new cross-editor history domain.

## Alternatives Considered

### macOS system Dictation only

This was rejected because it gives no app-owned state, no typed partial/final event lifecycle, and no predictable integration with CodeMirror and rich-text surfaces.

### Browser speech-recognition API

This was rejected because Web Speech availability and on-device behavior are not a dependable contract inside the Tauri macOS webview.

### Cloud transcription provider

This was rejected because the product requirement is on-device transcription without an Apple network fallback in v1.

## Related Decisions

| ADR | Relationship |
| --- | --- |
| ADR-004 | Uses the single IPC gateway for renderer/native calls and events. |
| ADR-025 | Registers fallback Dictation commands through the contribution registry. |
| ADR-026 | Preserves each editor domain's normal undo boundary. |
| ADR-028 | Keeps audio native and mock parity explicit at the trust boundary. |
