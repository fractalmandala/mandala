# FractalKnow Accessibility Audit

Date: 2026-07-31
Scope: migrated SvelteKit/Tauri shell in `/Users/amrit/fractals/apps/fractalknow`

## Verified Coverage

- Keyboard navigation: Playwright covers opening the command palette with the platform shortcut, running a command with `Enter`, switching editor modes by button, opening the terminal dock, and closing settings through the labelled close button.
- Focus management: `CommandPalette.svelte` focuses the search input when opened and handles `Escape`, `ArrowDown`, `ArrowUp`, and `Enter`; component tests assert the command palette dialog and listbox options are discoverable by role/name.
- Dialog labels: `DialogHost.svelte` renders each modal with `role="dialog"`, `aria-modal="true"`, a surface-specific accessible label, and a labelled close button. Component and Playwright tests assert Settings, Command palette, Send Feedback, and Create Project by role/name.
- Editor controls: `EditorSurface.svelte`, `RichEditor.svelte`, and `SourceEditor.svelte` expose labelled editor landmarks, formatting toggle state through `aria-pressed`, source content labels, terminal panel labels, and polite/alert status regions.
- Sidebar and tree navigation: `ShellSidebar.svelte` exposes workspace, filter, recent-project, and document-navigation labels. The document browser now uses `role="tree"` rows with `role="treeitem"`, `aria-level`, `aria-selected`, `aria-expanded`, roving `tabindex`, and arrow-key handlers. Playwright covers file filtering, document selection, revealable recent-project state, and labelled resize control availability.

## Findings To Carry Forward

- Dialog focus is not yet trapped inside `DialogHost.svelte`; keyboard users can close dialogs and operate controls, but a full tab loop should be added when the modal system is hardened.
- Sidebar tree semantics are now present for the migrated in-memory tree; keep the broader file-tree parity item open until native project-backed hierarchy, persistence, and drag/drop validation are completed.
- The rich editor depends on Tiptap/ProseMirror runtime semantics. Current labels and toolbar states are present, but a screen-reader pass should be repeated after collaborative cursors, comments, or decorations are added.
- Native Tauri dialogs are represented by accessible Svelte fallback dialogs in browser tests. Re-audit platform-native labels after the bridge owns folder picking, updater prompts, and crash-report surfaces.

## Evidence

- Component assertions: `src/lib/components/migrated-surfaces.component.test.ts`
- Browser flow assertions: `tests/e2e/migrated-flows.spec.ts`
- Local commands to re-run:
	- `pnpm run test:component`
	- `pnpm run test:e2e`
	- `pnpm check`
