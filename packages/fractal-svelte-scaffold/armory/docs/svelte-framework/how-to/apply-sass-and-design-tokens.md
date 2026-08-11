---
title: "Apply SASS and design tokens"
description: "Style generated Svelte components with external indented SASS and semantic tokens."
type: how-to
---

# Apply SASS and design tokens

This framework uses classic indented SASS for custom component styling and CUBE-style
class grouping for reusable layout and utility composition.

## Use the external file

```svelte
<script lang="ts">
	import './Button.sass'
</script>
```

```sass
.button
	background: var(--action-primary)
	color: var(--action-primary-contrast)

	&:focus-visible
		outline: 3px solid var(--focus-ring)
```

Use one tab per nesting level. Do not use braces or semicolons.

## Use semantic tokens

Component styles consume semantic variables such as `--surface`, `--foreground`,
`--border`, and `--focus-ring`. Primitive palette values belong in the theme layer, not
inside every component.

## Use state attributes

```svelte
<button data-state={open ? 'open' : 'closed'} aria-expanded={open}>
	Details
</button>
```

Prefer `data-state` and `data-variant` over dynamic `class:` directives.

## Validate

Compile the actual `.sass` file. Static greps do not prove SASS syntax. If the target
workspace has a styling check, run it; otherwise record the direct compiler command.

The generic [Svelte styling skill](../../../skills/svelte-styling/SKILL.md) contains
useful CSS custom-property ideas, but its scoped `<style>` examples are not the default
for this repository's Svelte Boss contract.
