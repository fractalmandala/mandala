---
id: ADR-024
title: AI Module — Embed-don’t-rewrite
type: adr
tags: [ai, module, architecture, embedding, history]
summary: Embeds the existing AIChat in the AI workspace, preserving its state contracts while surfacing shared project chat history through a local UI metadata overlay.
relates_to: [ADR-011, ADR-021, ADR-023, ADR-025]
status: accepted
updated: 2026-07-15
---

# ADR-024: AI Module — Embed-don't-rewrite

**Status:** Accepted
**Date:** 2026-07-15
**Decision makers:** Architecture Lead

---

## Context

The FractalEngine codebase already has a mature AI chat experience implemented in `AIChat.svelte` (core) and the `ai-elements/` kit — providers, model selection, local models, streaming, conversation history, attachments, context meter, checkpoints, and markdown/Mermaid rendering. The kernel's `ide.svelte.ts` manages AI providers, Copilot streaming sessions, and the session list.

The AI workspace template ("fractalAI") adds a Claude-Desktop-like dedicated workspace for AI interactions. The question is how to integrate AI features into this new template: rewrite the UI from scratch or embed the existing component.

A separate concern is session metadata. The kernel's ADR-011 session list is project-scoped and keyed by `rootPath`, but it only stores kernel-level session data (id, title, messages). The AI workspace needs UI-level metadata (sidebar tab kind, pin state, user renames). These must not be mixed into kernel storage.

## Decision

### Embed, don't rewrite

The `AIChat.svelte` component (core) is embedded directly in `ChatColumn` with `showHeader={false}`. No existing AI features are rewritten, duplicated, or modified. The ONE exception is the session tab strip — a new UI element that wraps the kernel's `loadChatSession` API — which lives in the AI module, not in the kernel.

This embeds the full existing AI feature set: providers, model selection, local models, streaming, attachments, context meter, checkpoints, and markdown/Mermaid rendering. It also preserves the existing `ai-elements/` component contracts (Stream A ↔ Stream B types).

### Meta-overlay over kernel sessions

Session metadata (kind, pinned, renames) that is specific to the AI workspace UI is stored separately from kernel session storage. The `aiWorkspace.sessions` array merges the kernel's session list with a local `ai:session-meta` overlay (a `Record<sessionId, {kind, pinned, title?}>` persisted in `localStorage`). The kernel is the source of truth for session existence and ordering; the overlay only adds UI-level fields. `AiLayout` refreshes that kernel list on mount, so project history first created through the shared `AIChat.svelte` in IDE or Design appears in the AI module's History sidebar without copying data.

This avoids contaminating kernel state with UI concerns and keeps session management fully functional in the browser mock without IPC changes.

### Single-live-conversation constraint

The kernel has a single `currentSessionId` and `chatMessages` array. The AI workspace respects this: session tabs are quick-switchers that call `loadChatSession(id)`, not parallel chat instances. Only one conversation is ever live at a time. Closing the active tab selects its successor in a single atomic undo entry.

### Accepted ai→ide module edges

The `WorkPanel` component imports `Sidebar` and `Terminal` from the IDE module (`modules/ide/components/`). This is an accepted cross-module edge (precedent: `tileKinds.ts` importing IDE components). It is documented here for resolution during any future kernel decomposition.

### No new IPC

V1 uses only existing IPC commands. The ADR-011 session commands already work in the browser mock (`ipc-mock.ts`), keeping `pnpm dev` fully functional without Tauri. No changes to `ipc.ts` or `ipc-mock.ts`.

## Consequences

### Positive

- Zero risk of regressing existing AI functionality — the entire `AIChat.svelte`/`ai-elements` surface is reused unchanged.
- New session metadata is safely scoped to the AI module with no kernel entanglement.
- V1 works entirely in the browser mock, simplifying development and testing.
- The existing undo domain pattern (`registerUndoDomain`) is reused for layout/tab/pin undo.

### Negative

- The `WorkPanel` introduces an ai→ide module edge that must be resolved during future kernel decomposition (alongside the `tileKinds` edge documented in ADR-023).
- The meta-overlay approach means that session kind/pin state is lost if `localStorage` is cleared — the kernel's session list survives but the UI metadata does not.
- Live-conversation constraint means tabs cannot show parallel chat streams — a future phase could lift this by introducing multiple `ChatColumn` instances, but that would require kernel-level changes.

### Neutral

- The AI module follows the established module-extraction pattern (designer ADR-021, notes ADR-022, ide ADR-023) with its own `components/`, `state/`, `styles/`, and `types.ts`.
- No new npm dependencies are added.
- No native menu `tpl_ai` entry is added this phase.
- No new binary assets are created.

## Alternatives Considered

### Rewrite AI chat UI for the template

Create a new AI chat component specific to the fractalAI template. Rejected because it would duplicate the entire AI feature surface (providers, models, streaming, attachments, etc.) and introduce a maintenance burden of keeping two chat UIs in sync. The embed approach gives the same result with zero duplication.

### Extend kernel session storage with UI metadata

Add kind/pin/rename fields to the kernel's session model. Rejected because kernel storage is project-scoped and persists across template switches. UI metadata would leak into the code/notes/design templates, and clearing the AI workspace preferences would require kernel changes.

### Use concurrent streaming with multiple chat instances

Allow each session tab to maintain its own streaming connection. Rejected because the kernel's chat infrastructure is single-conversation. Supporting concurrent streaming would require a major kernel refactor and is out of scope for this phase.

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-011 | Workspace Sessions & Chat History | Defines the kernel session list that `aiWorkspace` overlays with UI metadata |
| ADR-015 | App Template Routing and Domain State Boundaries | Established the template model that makes the fractalAI template a natural extension |
| ADR-021 | Designer Module Extraction | Established the module-extraction pattern this ADR follows |
| ADR-023 | IDE Module Extraction and Kernel Deferral | Documents the accepted `tileKinds` core→module edge that this ADR's ai→ide edge parallels |

## Notes

The ai→ide edge (`WorkPanel` importing `Sidebar`/`Terminal`) should be revisited during any future decomposition of `ide.svelte.ts`, alongside the `tileKinds` edge documented in ADR-023. A module registry pattern may be warranted if the number of cross-module edges grows.

The meta-overay merge logic and malformed-data fallback are unit-tested in `tests/unit/ai-workspace.test.ts` (Stream A).
