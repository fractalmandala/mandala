---
title: "Build Svelte components"
description: "Choose a recipe, create exact component files, and verify a Svelte component."
type: how-to
---

# Build Svelte components

Use the builder for requests such as “add a button”, “add a dialog”, or “put a native
accordion here”.

## Choose the paradigm

| Request language | Result |
| --- | --- |
| “full CSS”, “zero JS”, “native HTML” | HTML5 and CSS behavior such as `<details>`, `<dialog>`, or popover |
| “Svelte 5”, “runes”, “controlled” | Svelte component with `$state`, `$derived`, `$effect`, `$props`, and `$bindable` as needed |
| “convert React” | React-to-SvelteKit conversion contract and receipt |

Resolve the component through [`MANIFEST.json`](../../../skills/agentic-svelte-builder/references/MANIFEST.json)
before writing code. Do not choose a recipe from memory when the manifest has a route.

## Plan files first

Reusable components usually use:

```text
src/lib/components/Name/Name.svelte
src/lib/components/Name/Name.types.ts
src/lib/components/Name/Name.sass
```

Only create the type and SASS files when their contents are useful, and list every file
before editing.

## Apply the component contract

Use typed `$props`, snippets for rich children, callback props such as `onclick`, and
`$bindable` only for intentionally controlled values. Use native HTML semantics before
adding ARIA roles.

For interactive components, activate the accessibility surface and verify keyboard
operation, focus visibility, labeling, state relationships, and compiler warnings.

## Verify

Prefer the target workspace's `pnpm check`, targeted tests, and build. If no workspace
exists, compile the actual component in server and client modes, compile its SASS, and
record the missing workspace checks as skipped.

Return a receipt with changed paths, API, dependencies, commands, evidence, gaps, and a
single review verdict.
