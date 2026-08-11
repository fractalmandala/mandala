---
id: ADR-039
title: Complete the Owned-Library Media Workflow
type: adr
tags: [media, library, undo-redo, watcher, tauri, filesystem]
summary: Defines the completed owned-library media workflow, including reversible media operations, native file drops, video thumbnail capture, and conservative watcher rename reconciliation.
relates_to: [ADR-018, ADR-025, ADR-026, ADR-027, media-module-plan]
status: accepted
updated: 2026-07-17
---


**Status:** Accepted
**Date:** 2026-07-17
**Decision makers:** Product owner and FractalEngine maintainers

## Context

The media module manages a real user-owned library rather than opaque application blobs. It combines filesystem mutations, a stable-ID SQLite catalog, asset-protocol rendering, browser mock parity, and a Svelte module state domain. The first implementation had the core engine but lacked several user-visible completion requirements: reversible in-library changes, file-drop intake, video poster creation, scalable grid rendering, and identity preservation for Finder renames.

The product must preserve annotations across app-initiated moves and safe external edits without treating user source files as application data. Imports and OS Trash have deliberately different semantics: imports may be large and partially completed; OS Trash is recoverable through the operating system but not a reliable app-local undo target.

## Decision

We will complete fractalMedia as an owned-library workflow with operation-backed media undo, Tauri file-drop copy intake, webview video thumbnail capture, row-windowed rendering, and conservative external-rename reconciliation.

The media state records reversible folder, rename, move, tag, pin, and preference changes through `UndoHistory.transact()`. The watcher retains an item ID only for an unambiguous missing/new pair with identical size and modification time; all ambiguous cases remain create/remove so annotations are never attached by guesswork. This chooses a bounded heuristic over content hashing because v1 excludes duplicate detection and long-running full-file reads.

## Consequences

### Positive

- Reversible media gestures participate in the existing template undo coordinator as one atomic entry.
- Finder drops, IDE intake, and picker intake all use the same native import engine and retain copy-by-default behavior.
- Video listings gain a persisted JPEG poster plus cached dimensions/duration without an ffmpeg sidecar.
- Libraries with thousands of entries keep only a small row window of cards mounted.

### Negative

- Undoing a newly created empty folder moves that folder to OS Trash before a redo recreates it; imports and user-initiated removal remain outside app-local undo.
- Size/mtime matching cannot identify ambiguous external renames, which intentionally sacrifices annotation retention in that edge case.
- Video poster capture depends on formats supported by the platform webview.

### Neutral

- Media keeps its existing SQLite catalog and asset-protocol grants; no new cloud service or sidecar is introduced.
- ADR-048 supersedes the original user-selectable library-root behavior; Media now uses the fixed owned root `~/Documents/Gallery/Fracta`.

## Alternatives Considered

### Command-only filesystem undo

This was rejected because tags, pins, and view preferences need the same cross-surface coordinator, while a media operation snapshot keeps a single domain boundary.

### Full-file content hashing for external renames

This was rejected because it adds unbounded disk reads during watcher reconciliation and overlaps v1's explicitly excluded duplicate-detection work.

### Mount every media card

This was rejected because the plan requires smooth operation around 5,000 items; row-windowing bounds the mounted card count.

## Related Decisions

| ADR | Relationship |
| --- | --- |
| ADR-018 | Uses the authorized-path and asset containment boundary. |
| ADR-025 | Registers media commands and header actions through contributions. |
| ADR-026 | Uses the shared transaction undo engine. |
| ADR-027 | Indexes media catalog entries through the shared data layer. |
| ADR-048 | Supersedes the user-selectable library-root behavior with a fixed owned root. |
