# Variables UI — Tech Spec

## Context

The variable system has a complete data model and backend API in the editor session, but no UI to manage or bind variables. The current state:

- **Domain types** (`src/lib/domain.ts`): `VariableCollection`, `VariableMode`, `Variable`, `VariableType`, `VariableValue` are fully defined. `PageDocument.variableCollections` and `PageDocument.variables` arrays exist at lines 311–312.
- **Editor session methods** (`src/lib/editor/editor.svelte.ts`): `createVariableCollection`, `addMode`, `createVariable`, `deleteVariable`, `setVariableModeValue` are implemented at lines 766–822.
- **Document validation** (`src/lib/document-validation.ts`): Lines 271–272 hardcode `variableCollections: []` and `variables: []` — not yet wired through sanitization. This must be updated to preserve variables across save/load.
- **Left panel** (`src/lib/editor/LeftPanel.svelte`): Hosts `StyleManager` and `ComponentEditor` as collapsible sections in the file tab. The Variables panel will follow the same pattern.
- **Inspector** (`src/lib/editor/Inspector.svelte`): Property inputs for fill, stroke, position, opacity, typography, effects, etc. No variable binding exists yet.
- **No variable binding field on nodes**: `CommonNode` in `domain.ts` does not have a `boundVariables` map. This needs to be added to support binding node properties to variables.

Commit SHA: `87d293dc11994edfc5a1469583e9e1e651f9303f`

## Proposed changes

### 1. Add `boundVariables` to `CommonNode` (`src/lib/domain.ts`)

Add an optional `boundVariables` field to `CommonNode`:

```typescript
boundVariables?: Record<string, string>; // key = property path, value = variable id
```

Property paths use dot notation: `"fill"`, `"stroke.color"`, `"opacity"`, `"x"`, `"y"`, `"width"`, `"height"`, `"radius"`, `"effects.0"`, `"fontSize"`, `"itemSpacing"`, `"paddingTop"`, etc.

### 2. Add variable management methods to EditorSession (`src/lib/editor/editor.svelte.ts`)

Add the following methods:

- `renameCollection(collectionId: string, name: string)` — renames a collection.
- `renameMode(collectionId: string, modeId: string, name: string)` — renames a mode.
- `deleteCollection(collectionId: string)` — removes a collection, its modes, all its variables, and unbinds any nodes using those variables.
- `deleteMode(collectionId: string, modeId: string)` — removes a mode (cannot remove the last remaining mode).
- `setActiveMode(collectionId: string, modeId: string)` — sets the active mode for a collection (stored as a map of `collectionId -> modeId` on the session, not persisted).

### 3. Wire document sanitization for variables (`src/lib/document-validation.ts`)

Replace the hardcoded empty arrays with proper sanitization:

```typescript
variableCollections: sanitizeArray(source.variableCollections, sanitizeVariableCollection),
variables: sanitizeArray(source.variables, sanitizeVariable),
```

Add `sanitizeVariableCollection` and `sanitizeVariable` functions that validate the structure of each collection and variable.

### 4. Create VariableManager component (`src/lib/editor/VariableManager.svelte`)

A new Svelte component following the same pattern as `StyleManager.svelte` and `ComponentEditor.svelte`:

- Collapsible header "Variables" with an add-collection button.
- Each collection renders as an expandable section with:
  - Inline-editable name.
  - Mode tabs row (clickable, add-mode button, delete-mode on hover).
  - Variable list with per-mode value editing (color picker, number input, text input, boolean toggle).
  - Add-variable form (name + type selector).
  - Delete collection button.
- Empty states for no variables in a collection.
- Uses `$derived` for reactive state from `session.document.variableCollections` and `session.document.variables`.

### 5. Add VariableManager to LeftPanel (`src/lib/editor/LeftPanel.svelte`)

Import and render `<VariableManager {session} />` below `<ComponentEditor {session} />`.

### 6. Add variable binding to Inspector (`src/lib/editor/Inspector.svelte`)

For each property input that supports variable binding, add a "V" button that opens a variable picker dropdown. The dropdown is a new component or inline:

- `VariablePicker` component: accepts a list of variables, current binding, a callback `onPick(variableId)`, and a callback `onUnbind()`.
- When a variable is bound, the property input is replaced by a `VariableBadge` component showing the variable name in blue with a "V" prefix and an "×" unbind button.
- A "Create variable" option at the bottom of the picker opens a quick-create form.

### 7. Add variable resolution to property rendering

The Inspector and canvas rendering need to resolve variable values when a property is bound:

- Add a helper `resolveVariableValue(variableId, document)` that returns the resolved value for the current active mode.
- In the Inspector, bound properties display the resolved value.
- On the canvas, bound properties use the resolved value for rendering.

### 8. Variable binding data flow

```
User binds property → node.boundVariables["fill"] = "var_123"
                      ↓
Property reads → if bound, resolveVariableValue("var_123", doc)
                      ↓
                Returns the value from the active mode of the variable's collection
                      ↓
User changes mode → session.activeMode changes → all bound properties re-resolve
```

### 9. Re-rendering on variable change

When a variable value changes (via `setVariableModeValue`) or the active mode changes, the canvas must re-render. The `changeToken` mechanism in `EditorSession` handles this: `mutate()` already calls `this.changed()` which increments `changeToken`. The canvas renders subscribe to `changeToken` via `$effect`.

For variable binding to work correctly, `setVariableModeValue` already uses `mutate()`, so canvas re-rendering is automatic. Mode switching will need to trigger a `mutate()` or increment `changeToken` directly.

## Testing and validation

Reference `PRODUCT.md` behavior invariants:

- **Behavior 1–11 (Variable Panel)**: Verify by rendering `VariableManager` with empty doc, creating collections, adding modes, creating variables of each type, editing values per mode, renaming, deleting. Test via `src/lib/editor/editor.test.ts` adding new test cases for the new `EditorSession` methods.
- **Behavior 12–16 (Variable Binding)**: Verify by selecting a node, binding a color variable to fill, changing the variable value, and confirming the node's fill updates. Test via Inspector unit tests or manual verification.
- **Behavior 17–18 (Persistence)**: Verify by creating variables, serializing the document, parsing it back, and confirming variables are preserved. Test via `src/lib/document-validation.test.ts`.

## Parallelization

This feature is not well-suited for parallel implementation. The changes are tightly coupled:
- The `boundVariables` field on `CommonNode` must be added before variable binding can work.
- Document sanitization must be updated before variables can persist.
- The VariableManager UI depends on the editor session methods.
- Inspector binding depends on both the domain type change and the VariableManager.

All changes should be implemented sequentially in the order listed above.

## Risks and mitigations

- **Risk**: Variable binding to properties that have complex types (e.g., gradient fills with multiple stops) is non-trivial. **Mitigation**: Start with simple properties (fill color, opacity, position, stroke color, font size, gap, padding, corner radius) and defer complex property binding.
- **Risk**: The `boundVariables` field adds storage overhead. **Mitigation**: The field is optional and only populated when a variable is bound. Unused entries are cleaned up when variables are deleted.
- **Risk**: Mode switching performance with many bound variables. **Mitigation**: Variable resolution is a simple O(1) lookup — `variable.collectionId` → find collection → find active mode → `mode.values[variableId]`. No traversal needed.

## Follow-ups

- Variable alias support (a variable value referencing another variable).
- Variable scope across the document tree (local variables on frames/components).
- Bulk variable import/export.
- Variable suggestions in the picker (show recently used variables first).