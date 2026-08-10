---
task: figmaboy-variables-ui
status: complete
host: qoder
branch: main
commit: ad79681d9
updated: 2026-08-10
---

# Handoff — Figmaboy Variables UI (complete)

## What was built

A full Figma-style **Variables system** for the Figmaboy design tool, implementing
all 19 behaviors specified in `PRODUCT.md`. Two sessions of work:

1. **Session 1** — Core Variables UI (8 tasks): domain types, editor commands,
   VariableManager panel, VariablePicker dropdown, Inspector binding, document
   sanitization, and test coverage.
2. **Session 2** — Three deferred follow-ups: canvas rendering of bound values,
   variable-value → property sync, and complex/dotted-path property binding.

**Commit**: `ad79681d9` on `main` (188 files, 27 164 insertions — includes the
entire figmaboy project being committed to the monorepo for the first time).

## Architecture

```
domain.ts          Variable, VariableCollection, VariableMode, VariableValue,
                   CommonNode.boundVariables
                        │
editor.svelte.ts   EditorSession — CRUD commands, activeModes, allVariableValues
                   derived, bindVariable/unbindVariable, syncBoundVariables,
                   getNodePropertyValue/setNodePropertyValue helpers
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
VariableManager   VariablePicker    CanvasNode
(left sidebar)    (Inspector)       (SVG render)
```

### Data model

- `VariableCollection` — named group with `modes[]` and `defaultModeId`
- `VariableMode` — `{ id, name, values: Record<variableId, VariableValue> }`
- `Variable` — `{ id, name, collectionId, type: "color"|"number"|"string"|"boolean" }`
- `CommonNode.boundVariables` — `Record<propertyPath, variableId>`

Property paths are **dotted** strings: `"fill"`, `"stroke.color"`,
`"fill.stops.0.color"`, `"opacity"`, `"fontSize"`, `"shadow.color"`.

### Shorthand mapping

Two property keys have implicit path expansion for solid fills:
- `"fill"` → reads/writes `fill.color` when `node.fill.type === "solid"`
- `"shadow"` → reads/writes `shadow.color`

This prevents replacing nested objects with primitive values.

### Canvas resolution pipeline

1. `EditorSession.allVariableValues` (`$derived`) computes
   `Map<variableId, value>` from `activeModes` and `document.variables`.
2. `EditorCanvas` and `PrototypePreview` pass
   `activeModes={session.activeModes} variableValues={session.allVariableValues}`
   as props to `CanvasNode`.
3. `CanvasNode.resolveNodeVariable(property)` looks up the bound variable ID on
   the node, then reads its current value from the `variableValues` map.
4. Each derived (`fillValue`, `strokeValue`, `resolvedOpacity`,
   `resolvedFontSize`, `resolvedShadowColor`, `iconColor`, gradient stops)
   falls back to raw node values when no binding exists.

### Property sync (`syncBoundVariables`)

Opt-in method that **materializes** resolved values into node properties.
Iterates all nodes with `boundVariables`, resolves each binding for the active
mode, and writes the value using `setNodePropertyValue` (dotted-path setter).
Not auto-called on mode switch — the canvas renders correctly via reactive
resolution alone. This method is for export/persistence consumers.

## Key files

| File | Role |
|---|---|
| `src/lib/domain.ts` (494 lines) | Variable/Collection/Mode types, `boundVariables` on `CommonNode` |
| `src/lib/editor/editor.svelte.ts` (~1144 lines) | Session class: CRUD, `allVariableValues`, `syncBoundVariables`, property helpers |
| `src/lib/editor/VariableManager.svelte` (250 lines) | Left-panel UI: collections, mode tabs, per-type value editors |
| `src/lib/editor/VariablePicker.svelte` (149 lines) | Inspector dropdown: variable list, create-and-bind, unbind |
| `src/lib/editor/CanvasNode.svelte` (227 lines) | SVG renderer with variable-aware derived values |
| `src/lib/editor/EditorCanvas.svelte` (~1355 lines) | Main canvas, passes `activeModes`/`variableValues` to CanvasNode |
| `src/lib/editor/PrototypePreview.svelte` (52 lines) | Prototype mode, also forwards variable props |
| `src/lib/editor/Inspector.svelte` | V-button binding UI for all property rows |
| `src/lib/document-validation.ts` (336 lines) | Sanitizes variables, collections, mode values, and `boundVariables` on load |
| `src/lib/document-validation.test.ts` (122 lines) | 4 variable sanitization tests |
| `src/lib/editor/editor.test.ts` (~734 lines) | 22 variable tests (CRUD, reactivity, sync, dotted paths) |

## Tests

**153 tests pass** across 9 test files (22 new for variables, 131 pre-existing).

Variable test coverage:
- Collection CRUD (create, rename, delete with unbind)
- Mode management (add, rename, delete-not-last, set active)
- Variable CRUD (create with default values, rename, delete with cleanup)
- `allVariableValues` reactivity across mode switches
- `bindVariable` preserves existing variable values
- `syncBoundVariables` — flat properties, nested paths, gradient stops, mode-aware
- Document sanitization — variables, collections, mode values, boundVariables

4 pre-existing `svelte-check` errors remain (unrelated to variables work).

## Known limitations

- **No Inspector gradient editor** — gradient stop binding (`fill.stops.N.color`)
  works at the resolution layer but there's no UI to create/edit gradient stops
  in the Inspector yet.
- **`syncBoundVariables` is opt-in** — not auto-called on mode switch. Canvas
  renders correctly via reactive resolution; sync is for export consumers.
- **No component-level variables** — variables are document-scoped only.
- **No variable aliases** — variables hold literal values, not references to
  other variables.

## Hard rules (from prior sessions)

- Work only inside `preprojects/figmaboy-main/`
- No monorepo edits, no `git stash`/`git clean`
- Stop and report if files go missing

## Dev commands

```bash
cd preprojects/figmaboy-main
bun install
bun run dev          # Vite frontend only (browser)
bun run tauri dev    # Full desktop app (Tauri window)
bun run test         # vitest run (153 tests)
```

## Possible next steps (not started)

1. Inspector gradient editor UI → wire to `fill.stops.N.color` binding
2. Auto-sync on mode switch (call `syncBoundVariables` in a `$effect`)
3. Export integration — materialize variables in codegen output
4. Variable aliases (variable referencing another variable)
5. Component-scoped variables (Figma's "component property" pattern)
