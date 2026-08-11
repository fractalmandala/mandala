---
id: add-a-module
title: Adding a Module
type: guide
tags: [module, architectural, guide]
relates_to: [ADR-015, ADR-021, ADR-022, ADR-024]
summary: Guide on how to add a self-contained feature module to FractalEngine Studio.
updated: 2026-07-15
---


This guide details the procedure for introducing a new self-contained feature module under `src/lib/modules/`.

## Playbook & Steps

### 1. Folder structure
Create the directory structure under `src/lib/modules/<name>/`:
- `components/` — Svelte 5 components.
- `state/` — Module-specific state runners (e.g., `<name>.svelte.ts`).
- `styles/` — Class-based indented SASS files (`_layout.sass`, etc.).
- `contributions.ts` — Command and keybinding registry.
- `types.ts` — TypeScript definitions.

### 2. Template registration
Register the module in the template configuration:
- Add entry to the template catalog `src/lib/data/templates.ts`.
- Register template validators in:
  - `src/lib/state/app.svelte.ts` (validate page layout bounds).
  - `src/lib/state/canvas.svelte.ts` (validate tile positioning bounds).
- Register a lazy page branch under `src/routes/+page.svelte` (renders layout matching your template active state).

### 3. Contributions & Keybindings
Declare workspace actions inside `<name>/contributions.ts`:
- Define menu options, shortcuts, or commands using the core registry.
- Import and register in `src/lib/state/contributions.svelte.ts` under core mappings.

### 4. Undo domain
Wrap mutations in a transaction boundary:
- Call `UndoHistory.transact('Change Name', () => { ... })` for user actions.
- Register your domain snapshot capture and restore hooks via `UndoHistory.registerUndoDomain('<name>', hooks)`.

### 5. Styles configuration
- Create your `.sass` files inside the module's `styles/` folder.
- Import the main style sheet of the module inside `src/lib/styles/index.sass`.

### 6. Documentation
- Create or update the owning area documentation in `docs/areas/<name>.md`.
- Refresh file tables via `pnpm docs:filetables`.

## Verification Checklist

- [ ] All svelte components use Svelte 5 runes (`$state`, `$derived`, `$props`).
- [ ] No inline `<style>` blocks are present in components.
- [ ] Run `npx vitest run tests/unit/docs-contracts.test.ts` to verify area documentation.
- [ ] Run `pnpm check` to ensure no TypeScript compilation errors.
- [ ] Run `pnpm test:unit` to verify undo/redo boundaries and contribution contracts.
