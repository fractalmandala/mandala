---
id: add-a-command-or-keybinding
title: Adding a Command or Keybinding
type: guide
tags: [contributions, keybindings, commands, guide]
relates_to: [ADR-025]
summary: Guide on registering commands, keybindings, and menu actions in the contribution registry.
updated: 2026-07-15
---


This guide outlines the steps to register command actions, keyboard shortcuts, or toolbar menu triggers.

## Playbook & Steps

### 1. Declare contributions
In your module's `contributions.ts` file (or `src/lib/state/coreContributions.ts` for shell actions), declare commands and keybindings matching the registry schema:
```typescript
export const contributions = {
	commands: [
		{
			id: 'notes.search',
			title: 'Search Notes',
			category: 'Notes',
			callback: () => notesState.openSearch()
		}
	],
	keybindings: [
		{
			command: 'notes.search',
			key: 'Cmd+F',
			when: 'editorFocused'
		}
	]
};
```

### 2. Import into registry
Import and append these contributions in the central registry at `src/lib/state/contributions.svelte.ts`.

### 3. Verify name constraints
Ensure the command names and keys match contribution schemas tested by name contract checks.

## Verification Checklist

- [ ] Run `npx vitest run tests/unit/contribution-contracts.test.ts` to verify name schema checks.
- [ ] Test trigger action from the Command Palette (`Cmd+P` or `Ctrl+P`).
- [ ] Confirm keybinding doesn't clash with existing workspace bindings.
