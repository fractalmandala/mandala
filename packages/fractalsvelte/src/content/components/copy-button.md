<script lang="ts">
	import { CopyButton } from '$lib/components/ai-elements/copy-button/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let lastStatus = $state<string>('—');
	const sample = 'Hello from fractalsvelte CopyButton!';
	const snippet = `import { CopyButton } from "fractalsvelte/ai-elements/copy-button";`;

	const props: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			description: 'String written to the clipboard on click.'
		},
		{
			name: 'animationDuration',
			type: 'number',
			default: '500',
			description: 'Scale-in duration for status icons (ms).'
		},
		{
			name: 'onCopy',
			type: '(status: "success" | "failure" | undefined) => void',
			description: 'Called after each clipboard attempt with the transient status.'
		},
		{
			name: 'icon',
			type: 'Snippet',
			description: 'Custom idle icon. Defaults to an inline copy SVG.'
		},
		{
			name: 'variant / size',
			type: 'Button props',
			default: 'ghost / icon',
			description: 'Forwarded to Button. If children (label) are present and size is icon, size becomes default.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Optional text label next to the icon.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { CopyButton } from "fractalsvelte/ai-elements/copy-button";
<\/script>

<CopyButton text="Hello world" />`;

	const codeLabel = `<CopyButton text={snippet} variant="outline">
  Copy import
</CopyButton>`;

	const codeCallback = `<CopyButton
  text="payload"
  onCopy={(status) => console.log(status)}
/>`;
</script>

{#snippet iconClipboard()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
		<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
	</svg>
{/snippet}

{#snippet demoBasic()}
	<div style="display: flex; justify-content: center; align-items: center; gap: 0.75rem; padding: 1rem; width: 100%;">
		<code style="font-size: 0.8125rem; color: var(--muted-foreground);">{sample}</code>
		<CopyButton
			text={sample}
			onCopy={(s) => {
				lastStatus = s ?? 'idle';
			}}
		/>
	</div>
{/snippet}

{#snippet demoLabel()}
	<div style="display: flex; justify-content: center; gap: 0.75rem; padding: 1rem; flex-wrap: wrap; width: 100%;">
		<CopyButton text={snippet} variant="outline">Copy import</CopyButton>
		<CopyButton text={snippet} variant="secondary" size="sm">Copy</CopyButton>
		<CopyButton text={snippet} variant="ghost" />
	</div>
{/snippet}

{#snippet demoCustom()}
	<div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1rem; width: 100%;">
		<CopyButton
			text={sample}
			variant="outline"
			onCopy={(s) => {
				lastStatus = s ?? 'idle';
			}}
		>
			{#snippet icon()}
				{@render iconClipboard()}
			{/snippet}
			Copy sample
		</CopyButton>
		<p style="margin: 0; font-size: 0.75rem; color: var(--muted-foreground);">
			Last status: <strong style="color: var(--foreground);">{lastStatus}</strong>
		</p>
	</div>
{/snippet}

<h1 class="doc-title">Copy Button</h1>
<p class="doc-lede">
	A Button that copies a string to the clipboard and flashes a check or error icon — inline SVG defaults, no icon packages.
</p>

<Preview description="Icon-only copy next to sample text" code={usage}>
	{@render demoBasic()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/copy-button/` plus `src/lib/hooks/use-clipboard.svelte.ts`. It composes the ported `button` component.

## Usage

<CodeBlock code={usage} lang="svelte" />

Status cycles through idle → success | failure → idle (reset after ~800ms via `UseClipboard`).

## Examples

<Examples
	items={[
		{
			title: 'Icon only',
			demo: demoBasic,
			code: usage,
			description: 'Default ghost icon button; checkmark on success.'
		},
		{
			title: 'With label',
			demo: demoLabel,
			code: codeLabel,
			description: 'Children force a non-icon size when size is icon, so the label fits.'
		},
		{
			title: 'Custom icon + callback',
			demo: demoCustom,
			code: codeCallback,
			description: 'Pass an icon snippet and listen to onCopy for toast wiring.'
		}
	]}
/>

## Props

<PropsTable {props} />

## Theming

Keeps `data-slot="button"` so all Button variants apply. Extra chrome:

<div class="doc-table-wrap">

| Selector / attr | Used for |
| --- | --- |
| `[data-copy-button]` | Flex gap next to label |
| `[data-status]` | success / failure on the button for optional CSS |
| `[data-slot='copy-status-icon']` | Icon box + 1rem SVG size |

</div>
