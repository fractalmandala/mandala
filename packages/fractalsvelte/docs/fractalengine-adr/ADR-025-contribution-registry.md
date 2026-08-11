---
id: ADR-025
title: Contribution Registry
type: adr
tags: [contributions, registry, commands, keybindings, architecture]
summary: Replaces the central-editing pattern (editing CommandPalette/+layout/+page per module) with a contribution registry where modules declare commands, keybindings, header actions, and menu actions in their own contributions.ts files.
relates_to: [ADR-021, ADR-022, ADR-023, ADR-024, src/lib/state/contributions.svelte.ts]
status: accepted
updated: 2026-07-15
---


**Status:** Accepted
**Date:** 2026-07-15
**Decision makers:** Architecture Lead

---

## Context

The FractalEngine codebase had a growing maintenance problem. Three module extractions (Designer ADR-021, Notes ADR-022, IDE ADR-023, and AI ADR-024) each required editing three shared touch-points:

1. **CommandPalette.svelte** — hardcoded command arrays with per-template sections. Every new module meant another `if (activeTemplateId === 'notes')` / `=== 'design'` / `=== 'ai'` block.
2. **`+layout.svelte`** — the global keydown handler had ~25 `isCmdOrCtrl`/key conditionals plus the native menu dispatch. Every new module added shortcut branches and menu-action strings.
3. **`+page.svelte`** — the header strip had 13 per-template button branches. Every new module added header buttons with their own aria-labels and icons.

This was rule 11's explicit instruction: "edit `CommandPalette.svelte` and `SettingsDialog.svelte` accordingly." The repeated edits across three shared files made each extraction riskier and harder to verify, and shortcut/handler drift was an audit step rather than a test failure.

The contribution registry replaces the central-editing pattern with a declaration pattern: each module declares its commands, keybindings, and header actions in its own `contributions.ts` file. The shared consumers become renderers of the registered data.

## Decision

### Core registry

A `ContributionRegistry` class in `src/lib/state/contributions.svelte.ts` provides:

- **Command registration** (`registerCommands`) — named executable actions with label, category, icon, scope, and shortcutLabel
- **Keybinding registration** (`registerKeybindings`) — keyboard shortcut→command mappings
- **Header action registration** (`registerHeaderActions`) — header strip buttons with kind/ariaLabel/icon/order
- **Menu action registration** (`registerMenuActions`) — native menu string→command mappings

Registration is eager and deterministic: `+layout.svelte` imports the four contribution files for side effects at module scope.

### Module-scoped declaration files

- `src/lib/state/coreContributions.ts` — shell-level items (global commands, template-switch menu actions, global keybindings, global header actions)
- `src/lib/modules/notes/contributions.ts` — notes-scoped items
- `src/lib/modules/designer/contributions.ts` — designer-scoped items
- `src/lib/modules/ai/contributions.ts` — AI-scoped items

Command ids are namespaced (`core.*`, `notes.*`, `designer.*`, `ai.*`).

### Consumer rewrite

- **CommandPalette.svelte**: hardcoded arrays → `contributions.commandsFor(appState.activeTemplateId)` mapped into the existing item shape
- **`+layout.svelte`**: migrated command-shaped keydown branches → `contributions.matchKeybinding(e, appState.activeTemplateId)`; migrated menu-action branches → `contributions.menuCommandFor(action)`
- **`+page.svelte`**: migrated plain-action header buttons → `contributions.headerActionsFor(appState.activeTemplateId)`

### What stayed manual

| Component | Why |
|-----------|-----|
| `SettingsDialog.svelte` | Settings sections use a different composition model; future settings-sections phase |
| Native menu definitions | Menu JSON is Rust-side; only the dispatch migrates |
| Undo/redo keyboard routing | Lifecycle/non-command machinery, not action-shaped |
| Quit/flush lifecycle handlers | Non-command |
| Complex header widgets | Saved-Vaults dropdown, vault-name prompt have local state and markup beyond a button |

### Contract test as structural replacement

`tests/unit/contribution-contracts.test.ts` replaces the rule-12 manual shortcut cross-check. It asserts:

1. All command ids are unique and namespaced
2. Every keybinding/header/menu action resolves to a registered command
3. Keybinding scope is compatible with its command's scope
4. Shortcut labels ↔ keybinding combos are consistent (both directions)
5. Every combo is normalized (`cmd` before `alt` before `shift`, lowercase)
6. Icon paths point to existing assets

## Consequences

### Positive

- Adding a module command means editing one file (the module's `contributions.ts`), not three shared files.
- Shortcut/handler drift is now a failing unit test instead of an audit step.
- The palette, shortcut handler, and header are driven by data, reducing the risk of missed branches.
- The registry's `$state(0)` version counter gives free reactivity to `$derived` consumers.
- Zero behavioral change: labels, categories, icons, shortcut behavior, header button order/appearance, and menu actions are transcriptions of existing code.
- `SettingsDialog.svelte` is untouched — it has a dedicated future phase.
- No new dependencies, IPC, or Rust changes.

### Negative

- The registry class uses `$state()` for internal reactivity, which requires the Svelte Vite plugin in vitest config.
- Legacy non-migrated branches (complex widgets, lifecycle handlers) remain in `+page.svelte` and `+layout.svelte`, creating a dual-path system until the final phase.
- Test is vacuous until contributions are filled (requires Stream A's transcribed data).

### Neutral

- The `snapshot()` method exists solely for the contract test and is not used in production.
- The four contribution files are registered via side-effect imports in `+layout.svelte`, which is the correct module-scope pattern but is implicit.

## Alternatives Considered

### Continue the central-editing pattern

Keep hardcoded arrays and conditionals. Rejected because every module extraction (past and future) requires touching three shared files, and type-checking cannot catch a missing template branch. The registry provides a single extension point.

### A full plugin API with priorities and overrides

Generic plugin architecture with loading order, priority sorting, and user-customizable keybindings. Rejected as premature — the current needs are simple registration and deterministic order. A plugin API should be designed when third-party modules or user overrides are a real requirement.

### Dynamic module discovery

Scan `modules/*/contributions.ts` at startup instead of explicit imports. Rejected because it adds filesystem overhead and complexity without benefit — all modules are known at build time.

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-015 | App Template Routing and Domain State Boundaries | Established the template model that scopes contributions |
| ADR-021/022/023/024 | Module Extractions | Each would have required the three-file edit pattern; the registry prevents it going forward |
| ADR-006 | Mandatory Undo/Redo Boundary | Undo/redo routing remains hand-written in `+layout.svelte` — not migrated to the registry |

## Notes

The `SettingsDialog.svelte` integration is deferred to a future settings-sections phase, at which point its sections can also declare via the registry. The rule-11 instruction in AGENTS.md is updated to reflect the new declaration pattern (see B3).
