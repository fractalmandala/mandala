<script lang="ts">
	import { Button } from "$lib/components/button/index.js";
	import { Spinner } from "$lib/components/spinner/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const props: PropRow[] = [
		{
			name: "size",
			type: "string",
			default: '"1rem"',
			description:
				"Any CSS length. Applied as an inline style, so it wins over the stylesheet.",
		},
		{
			name: "aria-label",
			type: "string",
			default: '"Loading"',
			description: "Announced by screen readers. Override it to describe what is loading.",
		},
		{
			name: "role",
			type: "string",
			default: '"status"',
			description: "ARIA role on the SVG.",
		},
		{
			name: "ref",
			type: "SVGSVGElement | null",
			default: "null",
			description: "Bindable reference to the rendered SVG.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Spinner } from "fractalsvelte/spinner";
<\/script>

<Spinner />`;

	const codeSizes = `<Spinner />
<Spinner size="1.5rem" />
<Spinner size="2rem" />`;

	const codeButton = `<Button size="sm" variant="outline" disabled>
  <Spinner />
  Submit
</Button>`;

	const codeColor = `<!-- Spinner draws with currentColor, so it inherits the text colour. -->
<span style="color: var(--destructive)">
  <Spinner />
</span>`;

	const codeLabel = `<Spinner aria-label="Loading results" />`;
</script>

<h1 class="doc-title">Spinner</h1>
<p class="doc-lede">An indeterminate loading indicator.</p>

<Preview description="Spinner — default" code={usage}>
	<Spinner />
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/spinner/` into your project — it has no runtime dependencies and
the artwork is inline, so there is no icon library to install.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoSizes()}
	<Spinner />
	<Spinner size="1.5rem" />
	<Spinner size="2rem" />
	<Spinner size="3rem" />
{/snippet}

{#snippet demoButton()}
	<Button size="sm" variant="outline" disabled>
		<Spinner />
		Submit
	</Button>
	<Button size="sm" disabled>
		<Spinner />
		Saving
	</Button>
	<Button variant="ghost" size="icon" disabled aria-label="Loading">
		<Spinner />
	</Button>
{/snippet}

{#snippet demoColor()}
	<span style="color: var(--muted-foreground)"><Spinner /></span>
	<span style="color: var(--primary)"><Spinner /></span>
	<span style="color: var(--destructive)"><Spinner /></span>
{/snippet}

{#snippet demoLabel()}
	<Spinner aria-label="Loading results" />
{/snippet}

<Examples
	items={[
		{ title: "Sizes", demo: demoSizes, code: codeSizes },
		{
			title: "In a button",
			demo: demoButton,
			code: codeButton,
			description: "Pair with disabled. The button's size rules handle icon spacing.",
		},
		{
			title: "Colour",
			demo: demoColor,
			code: codeColor,
			description: "Drawn with currentColor, so it inherits the surrounding text colour.",
		},
		{
			title: "Accessible label",
			demo: demoLabel,
			code: codeLabel,
			description: 'role="status" and a default aria-label of "Loading" are built in.',
		},
	]}
/>

## Props

<PropsTable {props} />

## Theming

Spinner has no colours of its own — it draws with `currentColor`, so it takes the text colour
of whatever contains it. Set `color` on an ancestor to restyle it.

Its animation respects `prefers-reduced-motion`: the spin slows to 2.4s rather than stopping,
since a motionless spinner reads as a broken one.
