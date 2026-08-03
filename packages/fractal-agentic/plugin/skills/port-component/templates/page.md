<script lang="ts">
	import { Name } from "$lib/components/name/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	// Every prop belongs here — with no class escape hatch, an undocumented prop is unusable.
	// Descriptions carry the non-obvious behaviour, not just the type.
	const props: PropRow[] = [
		{
			name: "variant",
			type: '"default" | "outline"',
			default: '"default"',
			description: "Visual style. Rendered as data-variant.",
		},
		{
			name: "radius",
			type: '"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"',
			description: "Corner radius. Omit to keep the theme default.",
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference to the rendered element.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Content.",
		},
	];

	// Code strings live here as consts — multi-line template literals inside markdown
	// attributes are fragile.
	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Name } from "fractalsvelte/name";
<\/script>

<Name>Content</Name>`;

	const codeVariants = `<Name>default</Name>
<Name variant="outline">outline</Name>`;

	const codeRadius = `<Name radius="none">square</Name>
<Name radius="full">pill</Name>`;
</script>

<h1 class="doc-title">Name</h1>
<p class="doc-lede">One sentence describing what it does.</p>

<Preview description="Name — at rest" code={codeVariants}>
	<Name>Content</Name>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/name/` into your project — it has no runtime dependencies.
Copy `styles/_mixins.sass` and `_tokens.sass` too if you do not already have them.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoVariants()}
<Name>default</Name>
<Name variant="outline">outline</Name>
{/snippet}

{#snippet demoRadius()}
<Name radius="none">none</Name>
<Name radius="md">md</Name>
<Name radius="full">full</Name>
{/snippet}

<Examples
items={[
{ title: "Variants", demo: demoVariants, code: codeVariants },
{
title: "Radius",
demo: demoRadius,
code: codeRadius,
description: "Optional note shown above the stage.",
},
]}
/>

## Props

<PropsTable {props} />

## Theming

Name reads these tokens. Override them on `:root`, or on any ancestor to scope a theme.

<div class="doc-table-wrap">

| Token                          | Used for                                    |
| ------------------------------ | ------------------------------------------- |
| `--card` / `--card-foreground` | surface and text                            |
| `--border`                     | border                                      |
| `--ring`                       | focus ring                                  |
| `--radius`                     | all `radius` values except `2xl` and `full` |

</div>
