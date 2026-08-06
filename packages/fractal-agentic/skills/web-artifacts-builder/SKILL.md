---
name: web-artifacts-builder
description: Guidelines for building elaborate, multi-component features (artifacts) inside the FractalEngine Studio workspace (e.g. AI panel, wiki/notes layer, email interface, database inspector). Ensures integration with Svelte 5 runes, indented SASS styles, and the central ideState.
license: Complete terms in LICENSE.txt
---

# FractalEngine Studio Feature & Layer Builder

This guide provides instructions on how to design, architect, and build new workspace features, components, and layers (such as the upcoming AI Integration, Notes Vault/Wiki, Email client, or SQLite DB inspector) within FractalEngine Studio.

## 1. Feature Stack & Structure

All new features must use the official project technology stack:

- **Framework**: Svelte 5 components with explicit runes (`$state`, `$derived`, `$effect`, `$props`). Do not use stores or legacy Svelte patterns.
- **Styling**: Classic indented SASS (`.sass` syntax, tab indentation) saved under `src/lib/styles/components/` and imported in `index.sass`. Absolutely no `<style>` blocks or Tailwind CSS.
- **Reactivity & States**: Global/shared feature states must be integrated into `ideState` inside [ide.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts) to keep panel interactions synchronized.
- **IPC Gateway**: Any database queries, filesystem access, or external network requests must bind to [ipc.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts).

## 2. Walkthrough: Adding a New Workspace Layer (e.g. Wiki Notes Vault)

### Step 1: Define the State in ide.svelte.ts

Add necessary properties, methods, and undo/redo snapshot handlers inside the `IDEState` class:

```typescript
// Example properties for Notes Vault
notesList = $state<Array<{ id: string; title: string; content: string }>>([]);
activeNoteId = $state<string | null>(null);

// Methods to modify notes
saveNote(id: string, title: string, content: string) {
	// ... logic to update notesList and write file via ipc.ts ...
	this.pushUndoSnapshot(); // Save for Undo boundary
}
```

### Step 2: Create Components

Build modular Svelte 5 components inside `src/lib/components/`:

- E.g. [NotesExplorer.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesExplorer.svelte)
- Use custom SVG icons from `static/iconset/` for consistent aesthetics.
- Avoid hardcoded color definitions; reference variables like `--background10`, `--foreground20`, or `--border-secondary`.

### Step 3: Write Styles in Indented SASS

Create a new sass partial under `src/lib/styles/components/_notes.sass`:

```sass
.notes-explorer
	background: var(--background20)
	border-right: 1px solid var(--border-primary)
	display: flex
	flex-direction: column

	.note-item-row
		padding: 8px 12px
		cursor: pointer
		&:hover
			background: var(--background30)
```

Import the new partial in `src/lib/styles/index.sass`:

```sass
@use 'components/notes'
```

### Step 4: Integrate into the Layout (+page.svelte)

Position the new component inside the main sidebar panels or editor pane, binding visibility to layout toggles. Ensure it respects resize bounds.

- Update the Undo/Redo key handler in `+layout.svelte` if special input trapping is required.
