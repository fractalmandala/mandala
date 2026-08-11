<script lang="ts">
	import * as Reasoning from '$lib/components/ai-elements/reasoning/index.js';
	import { Button } from '$lib/components/button/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';
	import { onMount } from 'svelte';

	const reasoningSteps = [
		'Let me think about this problem step by step.',
		'\n\nFirst, I need to understand what the user is asking for.',
		'\n\nThey want a reasoning component that opens automatically when streaming begins and closes when streaming finishes. The component should be composable and follow existing patterns in the codebase.',
		'\n\nThis seems like a collapsible component with state management would be the right approach.'
	].join('');

	let streamContent = $state('');
	let isStreaming = $state(false);
	let streamKey = $state(0);

	function chunkIntoTokens(text: string): string[] {
		const tokenList: string[] = [];
		let i = 0;
		while (i < text.length) {
			const chunkSize = Math.floor(Math.random() * 2) + 3;
			tokenList.push(text.slice(i, i + chunkSize));
			i += chunkSize;
		}
		return tokenList;
	}

	function startStream() {
		streamKey += 1;
		const tokens = chunkIntoTokens(reasoningSteps);
		streamContent = '';
		isStreaming = true;
		let index = 0;
		const key = streamKey;

		function tick() {
			if (key !== streamKey) return;
			if (index >= tokens.length) {
				isStreaming = false;
				return;
			}
			streamContent += tokens[index];
			index += 1;
			setTimeout(tick, 25);
		}
		tick();
	}

	onMount(() => {
		startStream();
	});

	const staticThought = `The user wants a compact collapsible that tracks stream duration.

1. Open while tokens arrive.
2. Measure elapsed seconds when the stream ends.
3. Label switches from "Thinking..." to "Thought for N seconds".
4. Optionally auto-close once after streaming finishes.`;

	const rootProps: PropRow[] = [
		{
			name: 'isStreaming',
			type: 'boolean',
			default: 'false',
			description: 'When true, trigger shows “Thinking…” and duration is measured.'
		},
		{
			name: 'open',
			type: 'boolean',
			description: 'Controlled open state (bindable).'
		},
		{
			name: 'defaultOpen',
			type: 'boolean',
			default: 'true',
			description: 'Initial open state; also gates one-shot auto-close after streaming.'
		},
		{
			name: 'duration',
			type: 'number',
			description: 'Bindable duration in seconds (auto-filled when a stream ends).'
		},
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			description: 'Fires when the panel opens or closes.'
		}
	];

	const contentProps: PropRow[] = [
		{
			name: 'content',
			type: 'string',
			description: 'Markdown (or plain text) body rendered via Response / Streamdown.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as Reasoning from "fractalsvelte/ai-elements/reasoning";
<\/script>

<Reasoning.Root {isStreaming}>
  <Reasoning.Trigger />
  <Reasoning.Content content={markdown} />
</Reasoning.Root>`;
</script>

{#snippet demoStream()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto; display: flex; flex-direction: column; gap: 0.75rem; min-height: 12rem;">
		<div style="display: flex; gap: 0.5rem;">
			<Button size="sm" variant="outline" onclick={startStream} disabled={isStreaming}>
				Replay stream
			</Button>
		</div>
		<Reasoning.Root {isStreaming} defaultOpen>
			<Reasoning.Trigger />
			<Reasoning.Content content={streamContent || '…'} />
		</Reasoning.Root>
	</div>
{/snippet}

{#snippet demoStatic()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto;">
		<!-- defaultOpen=false disables the one-shot auto-close (used after streaming). -->
		<Reasoning.Root duration={4} open defaultOpen={false}>
			<Reasoning.Trigger />
			<Reasoning.Content content={staticThought} />
		</Reasoning.Root>
	</div>
{/snippet}

{#snippet demoClosed()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto;">
		<Reasoning.Root open={false} duration={2} defaultOpen={false}>
			<Reasoning.Trigger />
			<Reasoning.Content
				content="Hidden by default. Expand the trigger to read the model’s intermediate reasoning."
			/>
		</Reasoning.Root>
	</div>
{/snippet}

{#snippet demoCustomTrigger()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto;">
		<Reasoning.Root duration={6} open defaultOpen={false}>
			<Reasoning.Trigger>
				<span style="font-weight: 500;">Show scratchpad</span>
			</Reasoning.Trigger>
			<Reasoning.Content content="Custom trigger children replace the default brain + label + chevron." />
		</Reasoning.Root>
	</div>
{/snippet}

<h1 class="doc-title">Reasoning</h1>
<p class="doc-lede">
	A collapsible “thinking” panel for model intermediate reasoning — streams content via
	Response, tracks duration, and can auto-close after the stream ends.
</p>

<Preview description="Streaming reasoning with auto duration" code={usage}>
	{@render demoStream()}
</Preview>

## Installation

<CodeBlock code={codeInstall} lang="bash" />

Copy the `reasoning/` folder, or import from the package. Depends on the `response` ai-element
for markdown rendering.

## Usage

<CodeBlock code={usage} />

`Reasoning.Trigger` defaults to a brain glyph plus “Thinking…” / “Thought for N seconds”.
Pass children to fully replace that row.

## Examples

<Examples
	items={[
		{
			title: 'Streaming',
			demo: demoStream,
			code: usage,
			description: 'Token stream with Thinking… label and measured duration.'
		},
		{
			title: 'Static duration',
			demo: demoStatic,
			code: usage,
			description: 'Pre-set duration shows “Thought for N seconds”.'
		},
		{
			title: 'Collapsed',
			demo: demoClosed,
			code: usage,
			description: 'Closed by default; expand to read the scratchpad.'
		},
		{
			title: 'Custom trigger',
			demo: demoCustomTrigger,
			code: usage,
			description: 'Children replace the default brain + label + chevron row.'
		}
	]}
/>


## Props

### Reasoning

<PropsTable props={rootProps} />

### Reasoning.Content

<PropsTable props={contentProps} />

## Theming

| Token / slot | Role |
| --- | --- |
| `[data-slot=reasoning]` | Collapsible root |
| `[data-slot=reasoning-trigger]` | Quiet text trigger (overrides collapsible-trigger) |
| `[data-slot=reasoning-icon]` | Brain glyph |
| `[data-slot=reasoning-chevron]` | Rotates when open |
| `[data-slot=reasoning-content]` | Muted body with height animation |
| `[data-slot=ai-response]` | Streamdown host (from response) |
| `--muted-foreground`, `--foreground` | Trigger / body colour |
