# Tasks: Variables UI

## Task 1: Add `boundVariables` to domain types

- **Acceptance**: `CommonNode` has an optional `boundVariables?: Record<string, string>` field. TypeScript compiles without errors.
- **Verify**: `npm run check` passes.
- **Files**: `src/lib/domain.ts`

## Task 2: Wire document sanitization for variables

- **Acceptance**: `sanitizeVariableCollection` and `sanitizeVariable` functions exist in `document-validation.ts`. `PageDocument` sanitization uses them instead of hardcoded empty arrays. Variables survive a round-trip through `sanitizeDocument`.
- **Verify**: Existing tests pass, new test in `document-validation.test.ts` confirms round-trip.
- **Files**: `src/lib/document-validation.ts`, `src/lib/document-validation.test.ts`

## Task 3: Add variable management methods to EditorSession

- **Acceptance**: `renameCollection`, `renameMode`, `deleteCollection`, `deleteMode`, `setActiveMode` methods exist on `EditorSession`. Delete collection also unbinds all nodes using any variable in that collection. Delete mode is rejected if it's the last mode. Active mode is tracked per collection.
- **Verify**: New tests in `editor.test.ts` cover each method (create a collection, rename it, add modes, delete a mode, delete the collection, verify unbinding works).
- **Files**: `src/lib/editor/editor.svelte.ts`, `src/lib/editor/editor.test.ts`

## Task 4: Add variable resolution helper

- **Acceptance**: A function `resolveVariableValue(variableId, document, activeModes)` returns the resolved value for the active mode. Returns `undefined` if the variable or collection is not found.
- **Verify**: Unit test covers resolution with multiple modes, missing variable, missing collection.
- **Files**: New file or inline in `editor.svelte.ts`

## Task 5: Create VariableManager component

- **Acceptance**: `VariableManager.svelte` renders all variable collections with expand/collapse, mode tabs, per-mode variable value editing, add variable form, add/rename/delete collection, add/rename/delete mode. Matches the styling patterns of `StyleManager.svelte` and `ComponentEditor.svelte`.
- **Verify**: Manual verification in the browser — create collections, add variables, edit values, switch modes, delete items.
- **Files**: `src/lib/editor/VariableManager.svelte`

## Task 6: Wire VariableManager into LeftPanel

- **Acceptance**: `<VariableManager {session} />` renders below `<ComponentEditor {session} />` in `LeftPanel.svelte`.
- **Verify**: Variables section appears in the left panel's file tab.
- **Files**: `src/lib/editor/LeftPanel.svelte`

## Task 7: Add variable binding to Inspector

- **Acceptance**: Fill color, opacity, position (X, Y, W, H), stroke color, font size, gap, padding, and corner radius properties show a "V" button. Clicking opens a variable picker with all variables grouped by collection. Selecting a variable binds the property and shows a blue badge. Unbinding restores the previous local value. A "Create variable" option at the bottom of the picker creates a new variable.
- **Verify**: Manual verification — bind a color variable to fill, change the variable value via VariableManager, see the fill update on the canvas. Bind a number variable to width, change the value, see the width update.
- **Files**: `src/lib/editor/Inspector.svelte`, `src/lib/editor/VariablePicker.svelte` (new)

## Task 8: Add tests

- **Acceptance**: All new EditorSession methods have unit test coverage. Document sanitization for variables is tested. Variable resolution is tested.
- **Verify**: `npm test` passes.
- **Files**: `src/lib/editor/editor.test.ts`, `src/lib/document-validation.test.ts`