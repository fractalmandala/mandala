---
id: ADR-018
title: Contain Filesystem IPC to User-Selected Roots
type: adr
tags: [ipc, security, filesystem, workspace]
summary: Requires every native filesystem command to canonicalize paths and reject access outside folders explicitly selected by the user.
relates_to: [ADR-004, src/lib/ipc.ts, src/lib/components/TreeNode.svelte]
status: accepted
updated: 2026-07-13
---

# ADR-018: Contain Filesystem IPC to User-Selected Roots

**Status:** Accepted  
**Date:** 2026-07-13  
**Decision makers:** FractalEngine maintainers

## Context

The IDE must mutate user projects, but its original Tauri commands trusted frontend-provided absolute paths. Parent segments could escape the workspace, while compromised trusted UI code could target unrelated files.

## Decision

We will authorize only canonical roots returned by native pickers and reject every filesystem IPC path outside those roots.

The native gateway records selected roots, canonicalizes existing paths and parents of new paths, validates rename leaves, and applies containment to list/read/write/rename/delete/duplicate/copy, model downloads, and local model execution. Native picker grants are persisted in the app-data directory and restored only for still-existing canonical targets. This makes workspace restoration depend on a prior native user grant rather than on renderer-provided localStorage. The browser mock mirrors the boundary under `/workspace`.

Malformed persisted-grant JSON is quarantined instead of aborting startup. MLX execution requires a selected model directory and never promotes a selected `.safetensors` file into a parent-directory grant. Marketplace skills install only beneath the explicitly authorized workspace and enforce a 1 MiB response limit.

New files use an exclusive native create command so preflight checks cannot race into overwriting an existing note. Skill installation creates and canonicalizes every destination segment beneath the authorized root and exclusively creates `SKILL.md`; an existing regular file or symlink is never followed or overwritten.

Renames also refuse an existing destination (with a same-name no-op), and renderer-side mutation reconciliation updates open tabs, buffers, the active file, selections, expanded-folder caches, clipboard entries, and attachments after rename/delete/cut. Nested parent directories refresh through the same state helper, so successful disk mutations cannot leave stale explorer or editor references behind.

## Consequences

### Positive

- Parent, absolute-path, and symlink escapes are rejected at the native trust boundary.
- Frontend validation improves feedback without becoming the security boundary.
- Browser and desktop invalid-path behavior agree.
- Note creation cannot overwrite an existing file, even under a concurrent create race.

### Negative

- External files require an explicit picker action before access.
- Revoking a previously granted folder currently requires removing the app's persisted authorization data; a dedicated grant-management UI can be added later.

### Neutral

- App-private encrypted storage continues through dedicated commands.

## Alternatives Considered

Frontend-only validation was rejected because client code can invoke native commands. Unrestricted absolute paths were rejected because convenience does not justify an unbounded filesystem capability.
