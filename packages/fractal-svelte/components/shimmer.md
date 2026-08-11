<script lang="ts">
	import { Shimmer } from '$lib/components/ai-elements/shimmer/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const phrase = 'Generating AI response…';
	const longPhrase = 'Thinking through your request and drafting a careful answer…';

	const props: PropRow[] = [
		{
			name: 'as',
			type: 'keyof HTMLElementTagNameMap',
			default: '"p"',
			description: 'Element tag to render (p, span, h2, …).'
		},
		{
			name: 'duration',
			type: 'number',
			default: '2',
			description: 'Animation cycle duration in seconds.'
		},
		{
			name: 'spread',
			type: 'number',
			default: '2',
			description: 'Multiplier for highlight band width (times contentLength).'
		},
		{
			name: 'contentLength',
			type: 'number',
			default: '30',
			description: 'Approx. character count used to size the shimmer band. Prefer the length of your string.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Text (or nodes) that receive the shimmer clip.'
		},
		{
			name: 'ref',
			type: 'HTMLElement | null',
			description: 'Bindable root element.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Shimmer } from "fractalsvelte/ai-elements/shimmer";
<\/script>

<Shimmer contentLength={24}>Generating AI response…</Shimmer>`;

	const codeSpeed = `<Shimmer duration={1.2} contentLength={40}>
  Working faster…
</Shimmer>

<Shimmer duration={3.5} contentLength={40}>
  Slow thoughtful sweep…
</Shimmer>`;

	const codeAs = `<Shimmer as="span" contentLength={18}>
  Inline shimmer
</Shimmer>

<Shimmer as="h2" contentLength={12} duration={2.5}>
  Drafting title
</Shimmer>`;
</script>

{#snippet demoBasic()}
	<div style="display: flex; justify-content: center; padding: 1.25rem; width: 100%;">
		<Shimmer contentLength={phrase.length}>{phrase}</Shimmer>
	</div>
{/snippet}

{#snippet demoSpeed()}
	<div style="display: flex; flex-direction: column; gap: 1rem; align-items: center; width: 100%; padding: 1rem;">
		<div style="text-align: center;">
			<p style="margin: 0 0 0.35rem; font-size: 0.75rem; color: var(--muted-foreground);">duration=1.2</p>
			<Shimmer duration={1.2} contentLength={longPhrase.length}>{longPhrase}</Shimmer>
		</div>
		<div style="text-align: center;">
			<p style="margin: 0 0 0.35rem; font-size: 0.75rem; color: var(--muted-foreground);">duration=3.5</p>
			<Shimmer duration={3.5} contentLength={longPhrase.length}>{longPhrase}</Shimmer>
		</div>
	</div>
{/snippet}

{#snippet demoTags()}
	<div style="display: flex; flex-direction: column; gap: 1.25rem; align-items: center; width: 100%; padding: 1rem;">
		<p style="margin: 0; font-size: var(--text-sm);">
			Status:
			<Shimmer as="span" contentLength={16}>still thinking</Shimmer>
		</p>
		<Shimmer as="h2" contentLength={14} duration={2.5} style="margin: 0; font-size: 1.25rem;">
			Drafting title
		</Shimmer>
		<Shimmer as="div" contentLength={longPhrase.length} duration={2}>
			{longPhrase}
		</Shimmer>
	</div>
{/snippet}

<h1 class="doc-title">Shimmer</h1>
<p class="doc-lede">
	Animated shimmering text for “thinking” and generation states — a sliding highlight band clipped to the glyphs.
</p>

<Preview description="Default shimmer paragraph" code={usage}>
	{@render demoBasic()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/shimmer/` — pure CSS animation, no runtime deps.

## Usage

<CodeBlock code={usage} lang="svelte" />

Set `contentLength` to roughly the character count of the text so the highlight band scales with the label.

## Examples

<Examples
	items={[
		{
			title: 'Basic',
			demo: demoBasic,
			code: usage,
			description: 'Default 2s cycle on a short status line.'
		},
		{
			title: 'Duration',
			demo: demoSpeed,
			code: codeSpeed,
			description: 'Faster or slower sweeps via the duration prop (seconds).'
		},
		{
			title: 'Element tag',
			demo: demoTags,
			code: codeAs,
			description: 'Render as span, heading, or div with the as prop.'
		}
	]}
/>

## Props

<PropsTable {props} />

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--muted-foreground` | Base text fill under the shimmer |
| `--background` | Sliding highlight band |
| `--spread` / `--shimmer-duration` | Set from props as CSS variables |

</div>

The effect relies on `background-clip: text`. Under `forced-colors: active` it falls back to solid text with no animation.
