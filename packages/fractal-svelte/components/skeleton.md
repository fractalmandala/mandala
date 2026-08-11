<script lang="ts">
	import { Skeleton } from "$lib/components/skeleton/index.js";
	import * as Card from "$lib/components/card/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const props: PropRow[] = [
		{
			name: "width",
			type: "string",
			description: "Any CSS length — 250px, 100%, 12rem.",
		},
		{
			name: "height",
			type: "string",
			description: "Any CSS length.",
		},
		{
			name: "size",
			type: "string",
			description: "Shorthand for equal width and height. Overrides both.",
		},
		{
			name: "radius",
			type: '"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"',
			description: 'Corner radius. Omit for the default 1rem; use "full" for avatars.',
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference to the rendered element.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Skeleton } from "fractalsvelte/skeleton";
<\/script>

<Skeleton width="250px" height="1rem" />`;

	const codeAvatar = `<div class="row ycenter" style="gap:1rem">
  <Skeleton size="3rem" radius="full" />
  <div class="box" style="gap:0.5rem">
    <Skeleton width="250px" height="1rem" />
    <Skeleton width="200px" height="1rem" />
  </div>
</div>`;

	const codeCard = `<div class="box" style="gap:0.75rem">
  <Skeleton width="250px" height="125px" radius="xl" />
  <Skeleton width="250px" height="1rem" />
  <Skeleton width="200px" height="1rem" />
</div>`;

	const codeRadius = `<Skeleton size="3rem" radius="none" />
<Skeleton size="3rem" radius="md" />
<Skeleton size="3rem" radius="full" />`;

	const codeInPlace = `<!-- Skeletons take the shape of the content they stand in for. -->
<Card.Root style="width:20rem">
  <Card.Header>
    <Skeleton width="60%" height="1.125rem" radius="md" />
    <Skeleton width="85%" height="0.875rem" radius="md" />
  </Card.Header>
  <Card.Content>
    <Skeleton width="100%" height="6rem" radius="lg" />
  </Card.Content>
</Card.Root>`;
</script>

<h1 class="doc-title">Skeleton</h1>
<p class="doc-lede">A placeholder that stands in for content while it loads.</p>

<Preview description="Skeleton — a line of text" code={usage}>
	<div class="box" style="gap:0.5rem">
		<Skeleton width="250px" height="1rem" />
		<Skeleton width="200px" height="1rem" />
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/skeleton/` into your project — it has no runtime dependencies and
owns its own animation.

## Usage

<CodeBlock code={usage} />

Skeleton has no intrinsic size: give it `width` and `height`, or `size` when both are equal.
Match the dimensions of the content it replaces so the layout does not shift when the real
content arrives.

## Examples

{#snippet demoAvatar()}
	<div class="row ycenter" style="gap:1rem">
		<Skeleton size="3rem" radius="full" />
		<div class="box" style="gap:0.5rem">
			<Skeleton width="250px" height="1rem" />
			<Skeleton width="200px" height="1rem" />
		</div>
	</div>
{/snippet}

{#snippet demoCard()}
	<div class="box" style="gap:0.75rem">
		<Skeleton width="250px" height="125px" radius="xl" />
		<Skeleton width="250px" height="1rem" />
		<Skeleton width="200px" height="1rem" />
	</div>
{/snippet}

{#snippet demoRadius()}
	<Skeleton size="3rem" radius="none" />
	<Skeleton size="3rem" radius="sm" />
	<Skeleton size="3rem" radius="md" />
	<Skeleton size="3rem" radius="lg" />
	<Skeleton size="3rem" radius="xl" />
	<Skeleton size="3rem" />
	<Skeleton size="3rem" radius="full" />
{/snippet}

{#snippet demoInPlace()}
	<Card.Root style="width:20rem">
		<Card.Header>
			<Skeleton width="60%" height="1.125rem" radius="md" />
			<Skeleton width="85%" height="0.875rem" radius="md" />
		</Card.Header>
		<Card.Content>
			<Skeleton width="100%" height="6rem" radius="lg" />
		</Card.Content>
	</Card.Root>
{/snippet}

<Examples
	items={[
		{
			title: "Avatar and text",
			demo: demoAvatar,
			code: codeAvatar,
			description: 'radius="full" for a circular avatar placeholder.',
		},
		{ title: "Card", demo: demoCard, code: codeCard },
		{
			title: "Radius",
			demo: demoRadius,
			code: codeRadius,
			description: "The sixth is the default — 1rem when radius is omitted.",
		},
		{
			title: "In place of content",
			demo: demoInPlace,
			code: codeInPlace,
			description: "Mirror the real layout so nothing shifts when content arrives.",
		},
	]}
/>

## Props

<PropsTable {props} />

`width`, `height` and `size` are applied as an inline style, so they win over the stylesheet.

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--muted` | the placeholder fill |
| `--radius` | `sm` / `md` / `lg` / `xl` radius values |

</div>

The pulse animation is defined locally and runs for 2s. It is purely decorative — screen
readers see an empty element, so announce loading state on the container instead, with
`aria-busy` or a live region.
