---
id: ADR-048
title: Constrain Media Mutations to the Owned Fracta Library Root
type: adr
tags: [media, filesystem, security, library, tauri]
summary: Restricts FractalMedia to ~/Documents/Gallery/Fracta so it cannot mutate or retain a grant for sibling Gallery folders.
relates_to: [ADR-018, ADR-028, ADR-039, media]
status: accepted
updated: 2026-07-22
---


**Status:** Accepted
**Date:** 2026-07-22
**Decision makers:** Project owner, implementing agent

## Context

FractalMedia previously opened a folder picker while suggesting a library location. Selecting `~/Documents/Gallery` made that parent directory the native media root. Media operations correctly stayed below the configured root, but the configured root itself included every sibling gallery and could therefore be renamed or sent to Trash by the Media module.

The intended product boundary is a single application-owned folder: `~/Documents/Gallery/Fracta`. Users retain control of all folders outside it. Existing persisted roots from the picker can survive restarts, so correcting only the setup screen would leave the old authorization path available.

## Decision

We will create and activate only `~/Documents/Gallery/Fracta` as the FractalMedia library root.

Native activation verifies the canonical path equals this owned directory; initialization and restoration create it without a folder picker. On startup, a persisted legacy media root is removed from the authorization registry before the owned root is activated. The UI presents the fixed location rather than a Change-location action.

## Consequences

### Positive

- Media filesystem operations can only reach files and folders below `~/Documents/Gallery/Fracta`.
- A legacy grant for a previously selected media root, such as `~/Documents/Gallery`, is revoked during startup.
- The setup flow cannot accidentally select the parent Gallery directory.

### Negative

- Media no longer supports a user-selected or relocated library location.
- Existing media located in a prior custom library is not automatically moved into the owned Fracta folder.

### Neutral

- The frozen IPC relocation method remains available for contract compatibility, but reselects the fixed owned root.
- The module continues to use the shared authorized-path registry for its one owned directory.

## Alternatives Considered

### Keep the picker and append Fracta to its selection

Rejected because the picker would still invite selection of a location outside the required Documents/Gallery route and complicate migration of existing broad roots.

### Allow arbitrary selected roots with additional confirmation

Rejected because confirmation cannot enforce the stated ownership boundary; a selected parent directory still grants Media access to unrelated folders.

## Related Decisions

| ADR | Title | Relationship |
| --- | --- | --- |
| ADR-018 | Contain Filesystem IPC to User-Selected Roots | narrows the media exception to one owned root |
| ADR-028 | Security Boundaries & Contract-Typed IPC | applies its least-privilege boundary to media activation |
| ADR-039 | Complete the Owned-Library Media Workflow | supersedes its user-selectable media-root behavior |
