---
name: 'app-documenter'
description: "Studies SvelteKit pages and components to generate functional logic documentation inside the matching docs/areas/<area>.md document. Invoke when the user asks to document a component, page, or app structure; or when they say 'app-write', 'document this', or 'generate docs for' a specific file."
---

# App Documenter

Generates functional documentation for SvelteKit pages or components by static analysis and updates the corresponding architecture area document in `docs/areas/`.

---

## When to Invoke

- User says "app-write" followed by a file path or component name.
- User asks "document this page/component".
- User wants "generate docs for [filename]".
- User requests a "component report" or "page analysis".

---

## Workflow

### Phase 0 — Locate the Target Area Doc

Analyze the target file path to determine which area document under `docs/areas/` governs it:

1. **Modules**: If the file is inside `src/lib/modules/<app>/`, it belongs to `docs/areas/<app>.md`.
2. **AI Elements**: If inside `src/lib/components/ai-elements/` or relates to AI, it belongs to `docs/areas/ai.md`.
3. **IDE**: If inside `src/lib/modules/ide/` or ide components, it belongs to `docs/areas/ide.md`.
4. **Shell & Routes**: If inside `src/routes/` or is a general shell component, it belongs to `docs/areas/shell-and-routes.md`.
5. **Undo System**: If related to undo history, it belongs to `docs/areas/undo-system.md`.
6. **Styling**: If related to style state or css tokens, it belongs to `docs/areas/styling-system.md`.
7. **IPC & Data**: If related to ipc commands or mock services, it belongs to `docs/areas/ipc-and-data-layer.md`.

### Phase 1 — Read the Target File

Use `Read` to extract the script and template elements of the target file. Check for:

1. Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`).
2. Event handlers, functions, and state mutations.
3. Component template structures, slot details, and class names.
4. Violations (e.g., inline `<style>` tags).

### Phase 2 — Update the Area Document

Open the target `docs/areas/<area>.md` file and perform two updates:

#### 2a. Add to the File Table

Append a row for the new file in the Markdown file table under the "Source Files" or matching section of the area doc. Format:
`| [basename](file:///absolute/path/to/source) | Description of functional responsibility |`

#### 2b. Append Component Logic Section

At the end of the area doc (or in its logical components section), add a new heading for the component:

```markdown
### Functional Logic: [Component Name]

- **Role**: High-level responsibility in the system.
- **State & Runes**: Detailed usage of Svelte 5 reactive state (`$state` vars, `$derived` derivations, `$effect` hooks).
- **IPC & Gateway Connections**: Specific backend commands invoked via `$lib/ipc.ts`.
- **Interactions & Events**: Local functions and user gestures handled by this component.
```

### Phase 3 — Regenerate the Docs Registry

Run the NPM script to refresh all file tables and clean up the INDEX file:
`pnpm docs:filetables`
Confirm changes pass the validation suite:
`npx vitest run tests/unit/docs-contracts.test.ts`

---

## Important Rules

1. **Do not create routing files**: Never write to `docs/routing/`. That directory is fully retired.
2. **Use clickable `file:///` links** for every source file reference.
3. **Enforce styling conventions**: Flag any `<style>` blocks in Svelte components as violations of the "No Style Blocks in Svelte" constraint.
