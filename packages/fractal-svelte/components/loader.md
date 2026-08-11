<script lang="ts">
	import { Loader } from '$lib/components/ai-elements/loader/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const props: PropRow[] = [
		{
			name: 'size',
			type: 'number',
			default: '16',
			description: 'Icon size in CSS pixels (width and height of the SVG).'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Optional custom spinner. Defaults to the radial-bars LoaderIcon.'
		},
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			description: 'Bindable root element.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Loader } from "fractalsvelte/ai-elements/loader";
<\/script>

<Loader size={20} />`;

	const codeSizes = `<Loader size={12} />
<Loader size={16} />
<Loader size={24} />
<Loader size={32} />`;

	const codeInline = `<p>
  Generating
  <Loader size={14} style="display: inline-flex; vertical-align: -0.15em; margin-inline: 0.35em;" />
  reply…
</p>`;
</script>

{#snippet demoBasic()}
	<div style="display: flex; justify-content: center; padding: 1.5rem; width: 100%;">
		<Loader size={28} />
	</div>
{/snippet}

{#snippet demoSizes()}
	<div style="display: flex; align-items: center; justify-content: center; gap: 1.5rem; padding: 1.5rem; width: 100%;">
		{#each [12, 16, 24, 32, 40] as s}
			<div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
				<Loader size={s} />
				<span style="font-size: 0.7rem; color: var(--muted-foreground);">{s}px</span>
			</div>
		{/each}
	</div>
{/snippet}

{#snippet demoContext()}
	<div style="display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 22rem; margin-inline: auto;">
		<div
			style="display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1rem; border: 1px solid var(--border); border-radius: 3px; background: var(--card, var(--background));"
		>
			<Loader size={16} />
			<span style="font-size: var(--text-sm); color: var(--muted-foreground);">Model is thinking…</span>
		</div>
		<p style="margin: 0; font-size: var(--text-sm); color: var(--foreground);">
			Generating
			<Loader size={14} style="display: inline-flex; vertical-align: -0.15em; margin-inline: 0.35em;" />
			reply…
		</p>
	</div>
{/snippet}

<h1 class="doc-title">Loader</h1>
<p class="doc-lede">
	A compact spinning indicator for AI processing states — radial bars SVG with continuous rotation, sized in pixels.
</p>

<Preview description="Default loader at 28px" code={usage}>
	{@render demoBasic()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/loader/` — no external deps; icons are inline SVG.

## Usage

<CodeBlock code={usage} lang="svelte" />

The root is a `role="status"` region with `aria-label="Loading"`. Animation respects `prefers-reduced-motion`.

## Examples

<Examples
	items={[
		{
			title: 'Basic',
			demo: demoBasic,
			code: usage,
			description: 'Centered spinner for empty or pending panels.'
		},
		{
			title: 'Sizes',
			demo: demoSizes,
			code: codeSizes,
			description: 'Pixel size scales the SVG; colour inherits currentColor (defaults to muted).'
		},
		{
			title: 'In context',
			demo: demoContext,
			code: codeInline,
			description: 'Pair with status text in a card or inline mid-sentence.'
		}
	]}
/>

## Props

<PropsTable {props} />

## Theming

<div class="doc-table-wrap">

| Token / rule | Used for |
| --- | --- |
| `--muted-foreground` | Default spinner colour |
| `currentColor` | Icon strokes (override with `color` / style) |
| `ai-loader-spin` keyframes | 1s linear infinite rotation |

</div>

Export `LoaderIcon` separately if you only need the SVG without the spinning wrapper.
