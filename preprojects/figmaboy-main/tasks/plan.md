# Plan: Variables UI

## Objective

Add a complete Variables UI to the Figmaboy editor — a management panel in the left sidebar and variable binding in the Inspector — using the existing variable data model and backend methods.

## Dependencies

```
domain.ts (boundVariables) ──→ document-validation.ts (sanitize)
       │
       ├──→ editor.svelte.ts (new methods) ──→ VariableManager.svelte ──→ LeftPanel.svelte
       │
       └──→ Inspector.svelte (variable binding + picker)
```

## Implementation Order

1. **Domain**: Add `boundVariables` to `CommonNode` in `domain.ts`
2. **Data layer**: Wire document sanitization for variables in `document-validation.ts`
3. **Session methods**: Add `renameCollection`, `renameMode`, `deleteCollection`, `deleteMode`, `setActiveMode` to `EditorSession`
4. **Variable resolution**: Add `resolveVariableValue` helper
5. **VariableManager UI**: Create `VariableManager.svelte` component
6. **Wire into LeftPanel**: Add `VariableManager` to `LeftPanel.svelte`
7. **Inspector binding**: Add variable picker and badge to `Inspector.svelte`
8. **Tests**: Add tests for new methods and sanitization

## Key Decisions

- `boundVariables` uses dot-notation property paths as keys, variable IDs as values
- Active mode is stored per-collection as a `Map<string, string>` on the session (not persisted)
- Variable picker is a separate component to keep Inspector manageable
- Binding starts with simple properties (fill color, opacity, position, stroke color, font size, gap, padding, corner radius)