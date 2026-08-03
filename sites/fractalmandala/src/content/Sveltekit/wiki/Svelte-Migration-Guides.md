---
title: Svelte Migration Guides
description: Step-by-step migration from Svelte 4 to Svelte 5 (runes migration) and from SvelteKit 1 to SvelteKit 2, covering breaking changes, automated migration tools, and manual steps.
knowledge-bank:
  - 10-sveltekit
tags:
  - svelte
  - sveltekit
  - migration
  - upgrade
  - breaking-changes
sources:
  - svelteKitDocs-52-v4-migration-guide
  - svelteKitDocs-53-v5-migration-guide
  - svelteDocs-42-migrating-to-sveltekit-2
  - svelteDocs-43-migrating
  - svelteKitDocs-54-faq
related:
  - Svelte-5-Runes
  - Svelte-5-Template-Syntax
  - Svelte-Legacy-Patterns
  - SvelteKit-Routing
  - SvelteKit-Hooks-Server
timestamp: 2026-06-21
source: Wiki repo
---

This guide covers migrating from Svelte 4 to Svelte 5 and from SvelteKit 1 to SvelteKit 2.

## Svelte 4 → Svelte 5 Migration

### Automated Migration

The recommended approach is to use the `sv migrate` CLI command, which automates most of the migration:

```sh
npx sv migrate svelte-5
```

### Key Breaking Changes

1. **Runes mode:** Components can opt into runes mode with `<svelte:options runes={true} />` or globally via compiler options. In Svelte 5, new projects default to runes.

2. **Event syntax:** `on:click` → `onclick`. The compiler provides warnings when legacy syntax is used.

3. **Component props:** `export let` → `$props()`. The compiler can auto-migrate.

4. **Slots → Snippets:** `<slot>` → `{#snippet}` + `{@render}`. Named slots become named snippet props.

5. **Reactive declarations:** `$:` for derived values → `$derived()`. `$:` for side effects → `$effect()`.

6. **Component API:** `new Component()` → `mount()` / `unmount()`.

7. **`<svelte:component>` →** conditional rendering or `<svelte:element>`.

8. **Stores:** Still supported but runes are preferred for new code.

### Per-file Migration Strategy

1. Add `<svelte:options runes={true} />` to test in runes mode
2. Run `sv migrate` for automated transforms
3. Manually fix remaining issues (complex reactive patterns, store interop)
4. Remove legacy `.svelte` files from compatibility mode

## SvelteKit 1 → SvelteKit 2 Migration

### Key Changes

1. **Load function API:** The `load` function signature changed — `page` and `fetch` are now grouped under a single argument
2. **Error handling:** `throw error()` replaces `throw new Error()` in some contexts; the `@sveltejs/kit` error type is required
3. **Redirects:** `throw redirect()` replaces `throw new Redirect()`
4. **Form actions:** Enhanced form handling with `use:enhance` and action results
5. **Hooks API:** Updated `handle` and `handleError` signatures
6. **Path configuration:** `paths.base` and `paths.relative` behavior changes

### Automated Migration

```sh
npx sv migrate sveltekit-2
```

### Manual Steps

- Update `svelte.config.js` for SvelteKit 2 configuration
- Review all load functions for the updated API
- Check error handling for the new `error` and `redirect` imports
- Verify form actions work with the enhanced API
- Test all hooks for the updated signatures

## FAQ

- Can Svelte 4 and Svelte 5 components coexist? Yes, through `svelte/legacy` compatibility layer.
- Do I need to migrate everything at once? No, migration can be incremental with `<svelte:options>` per component.
- Are stores deprecated? No, but runes are recommended for new code.

## See Also
- [Svelte 5 Runes](Svelte-5-Runes) — understanding the new reactivity model
- [Svelte Legacy Patterns](Svelte-Legacy-Patterns) — detailed legacy-to-modern mapping
- [SvelteKit Routing](SvelteKit-Routing) — SvelteKit 2 routing changes
- [SvelteKit Hooks and Server Runtime](SvelteKit-Hooks-Server) — hooks API updates
