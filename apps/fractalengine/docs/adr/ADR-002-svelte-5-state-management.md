---
id: ADR-002
title: Svelte 5 Runes-Only State Management
type: adr
tags: [state-management, svelte, runes]
summary: "Mandates Svelte 5 Runes ($state/$derived/$effect/$props) as the sole state-management mechanism, banning legacy $: reactivity and svelte/store."
relates_to: [ADR-001, ADR-006]
status: accepted
updated: 2026-06-25
---

# ADR-002: Svelte 5 Runes-Only State Management

**Status:** Accepted
**Date:** 2026-06-24
**Decision makers:** Frontend Lead, Backend Lead

---

## Context

FractalEngine has complex shared state across 10+ components: IDE panels (tile positions, sizes, stacking order), file explorer (directory trees, open files, active document), terminal (console history, shell mode), AI copilot (chat messages, model selection, streaming state), settings (theme, editor preferences), and undo/redo stacks. State flows between components — opening a file from the explorer updates the editor tile, running a terminal command may update the file tree, and AI responses may insert text into the editor.

Svelte 4 provided two state management mechanisms: `$:` reactive labels for derived state within a component, and `svelte/store` (writable, readable, derived) for cross-component shared state. Both have well-known problems:

- `$:` relies on implicit dependency tracking through lexical analysis — dependencies are not visible in the source code, and the compiler can miss or incorrectly capture them, especially with destructuring or conditional expressions.
- `svelte/store` requires explicit `.set()` and `.update()` calls, creating ceremony around every state mutation, and `.subscribe()` calls in components create manual cleanup obligations.
- Neither mechanism composes well — stores cannot directly reference other stores' derived values without wiring, and `$:` labels cannot be extracted into shared modules.

Svelte 5 introduced runes (`$state`, `$derived`, `$effect`, `$props`) as explicit compiler directives that work in both `.svelte` files and plain `.ts` modules. Runes eliminate the store abstraction entirely — any `.svelte.ts` file can declare reactive state using the same syntax as a component.

The project configured `svelte.config.js` with `compilerOptions.runes` enabled for all non-node_modules files, enforcing runes-only usage project-wide.

---

## Decision

We will use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) as the exclusive state management mechanism in FractalEngine. No `$:` reactive labels, no `svelte/store` imports, no legacy Svelte 4 state patterns.

We chose runes over `svelte/store` because runes eliminate the `.set()`/`.update()` ceremony — a `$state` variable is reassigned with `=` just like a plain JavaScript variable, and derived state is declared as `$derived(expression)` rather than wired through `derived()`. We chose runes over `$:` because rune dependencies are explicit (visible in the source code as `$state`, `$derived`, `$effect`) rather than inferred through lexical analysis, making refactoring safer. We chose runes-in-`.ts` (e.g., `canvas.svelte.ts`, `ide.svelte.ts`) over component-only state because shared state classes can be imported by any component without prop drilling or context injection.

State stores are implemented as class instances using `$state` fields at module scope:

- [`canvas.svelte.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/canvas.svelte.ts) — tile positions, viewport coordinates, zoom, focus mode, template gallery visibility.
- [`ide.svelte.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts) — active file, open tabs, file tree data, console logs, workspace configurations, chat messages, model registry, undo/redo stacks.

---

## Consequences

### Positive

- Reactive state can be declared in `.svelte.ts` files and imported directly into any component — no provider components, no context injection, no manual subscription cleanup.
- Derived state is explicit and verifiable: `$derived(expression)` makes the computation visible in the source, and the compiler guarantees re-evaluation when dependencies change.
- Refactoring is safer — changing a `$state` variable name or restructuring a reactive expression does not risk breaking implicit dependency tracking as with `$:`.
- New team members need to learn only four rune primitives (`$state`, `$derived`, `$effect`, `$props`) rather than Svelte 4's dual-track model of reactive labels + stores.
- The `svelte-check` tool validates rune usage at compile time, catching misused legacy patterns.

### Negative

- Runes are a Svelte 5 feature and require the Svelte 5 compiler — any attempt to downgrade Svelte or use a non-runes-compatible version would require rewriting all state management.
- Third-party Svelte libraries that expect `svelte/store` imports are incompatible — all state integrations must be written in-house using runes.
- Module-scoped `$state` in `.svelte.ts` files creates singletons by default; if component-scoped state is needed (e.g., per-instance tile state), it must be explicitly managed via props or component-local `$state`.

### Neutral

- All existing state files (`canvas.svelte.ts`, `ide.svelte.ts`) must be maintained as the single source of truth for their domains — no new state files should be created without clear ownership boundaries.

---

## Alternatives Considered

### Svelte 4 stores (`writable` / `derived`)

Rejected because `store.set()` and `.update()` add ceremony to every mutation, and `derived()` stores create an implicit dependency graph that is harder to debug than explicit `$derived()` expressions. Svelte 4 stores also require manual `.subscribe()` in components with corresponding `unsubscribe()` cleanup, which is error-prone in complex component lifecycles.

### Reactive class properties with `$state` mixed with `svelte/store`

We considered allowing both runes and stores during a transition period. Rejected because maintaining two reactivity models doubles the cognitive load for developers and creates inconsistency — some state would be mutated with `=`, other state with `.set()`. The `compilerOptions.runes` configuration enforces runes-only at the compiler level, making violations a build error.

### External state management (MobX, Zustand, Pinia)

Rejected because Svelte 5 runes provide first-class reactive state without any dependency. Adding an external library duplicates Svelte's built-in reactivity, increases bundle size, and introduces a third reactivity model alongside runes and any remaining legacy patterns.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-001 | Use Tauri 2 + SvelteKit as the IDE Framework | This ADR depends on ADR-001; runes require Svelte 5 compiler |
| ADR-006 | Mandatory Undo/Redo Boundary | Enabled by this ADR; undo stacks are managed in `ide.svelte.ts` using `$state` |

---

## Notes

The `compilerOptions.runes` callback in `svelte.config.js` explicitly disables runes for `node_modules` to avoid breaking third-party Svelte components that may use legacy patterns. This is an intentional escape hatch — all first-party code must use runes.
