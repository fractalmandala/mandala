<script lang="ts">
	import { Separator } from "$lib/components/separator/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const props: PropRow[] = [
		{
			name: "orientation",
			type: '"horizontal" | "vertical"',
			default: '"horizontal"',
			description: "Axis of the rule. Rendered as data-orientation.",
		},
		{
			name: "decorative",
			type: "boolean",
			default: "false",
			description: "Hides the separator from assistive technologies when true.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the rendered element.",
		},
		{
			name: "child",
			type: "Snippet",
			description: "Render another element while preserving separator behavior.",
		},
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import { Separator } from "fractalsvelte/separator";
<\/script>

<Separator />`;

	const codeContent = `<div class="box" style="gap:0.25rem">
  <h4>Bits UI Primitives</h4>
  <p>An open-source UI component library.</p>
</div>
<Separator style="margin-block:1rem" />
<div class="row" style="height:1.25rem; align-items:center; gap:1rem">
  <span>Blog</span>
  <Separator orientation="vertical" />
  <span>Docs</span>
</div>`;

	const codeDecorative = `<Separator decorative />`;
</script>

<h1 class="doc-title">Separator</h1>
<p class="doc-lede">A thin rule that separates content on a horizontal or vertical axis.</p>

<Preview description="Separator — content groups" code={usage}>
	<div style="width:min(100%,22rem)">
		<div class="box" style="gap:0.25rem">
			<h4 style="font-size:var(--text-sm); line-height:1; font-weight:500">
				Bits UI Primitives
			</h4>
			<p style="color:var(--muted-foreground); font-size:var(--text-sm)">
				An open-source UI component library.
			</p>
		</div>
		<Separator style="margin-block:1rem" />
		<div class="row" style="height:1.25rem; align-items:center; gap:1rem; font-size:var(--text-sm)">
			<div>Blog</div>
			<Separator orientation="vertical" />
			<div>Docs</div>
			<Separator orientation="vertical" />
			<div>Source</div>
		</div>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/separator/` into your project. It depends on `bits-ui`, and it
expects `styles/_tokens.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoContent()}

<div style="width:min(100%,22rem)">
<div class="box" style="gap:0.25rem">
<h4 style="font-size:var(--text-sm); line-height:1; font-weight:500">
Bits UI Primitives
</h4>
<p style="color:var(--muted-foreground); font-size:var(--text-sm)">
An open-source UI component library.
</p>
</div>
<Separator style="margin-block:1rem" />
<div class="row" style="height:1.25rem; align-items:center; gap:1rem; font-size:var(--text-sm)">
<div>Blog</div>
<Separator orientation="vertical" />
<div>Docs</div>
<Separator orientation="vertical" />
<div>Source</div>
</div>
</div>
{/snippet}

{#snippet demoDecorative()}

<div class="box" style="gap:0.75rem; width:min(100%,20rem)">
<div>Decorative separators are ignored by assistive technology.</div>
<Separator decorative />
<div>Use them when the visual rule does not add semantic structure.</div>
</div>
{/snippet}

<Examples
items={[
{ title: "Content", demo: demoContent, code: codeContent },
{ title: "Decorative", demo: demoDecorative, code: codeDecorative },
]}
/>

## Props

<PropsTable {props} />

## Theming

<div class="doc-table-wrap">

| Token      | Used for              |
| ---------- | --------------------- |
| `--border` | Separator line color. |

</div>
