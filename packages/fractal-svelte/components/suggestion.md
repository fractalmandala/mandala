<script lang="ts">
	import * as Suggestion from '$lib/components/ai-elements/suggestion/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const many = [
		'What are the latest trends in AI?',
		'How does machine learning work?',
		'Explain quantum computing',
		'Best practices for Svelte development',
		'Tell me about TypeScript benefits',
		'How to optimize database queries?',
		'What is the difference between SQL and NoSQL?',
		'Explain cloud computing basics'
	];

	const starter = [
		'Tell me about Svelte 5',
		'How do runes work?',
		'Explain snippets'
	];

	let lastPick = $state<string | null>(null);
	let picked = $state<string | null>(null);

	function select(s: string) {
		lastPick = s;
		picked = s;
	}

	const suggestionProps: PropRow[] = [
		{
			name: 'suggestion',
			type: 'string',
			description: 'Chip label; also the string passed to onSelect.'
		},
		{
			name: 'onSelect',
			type: '(suggestion: string) => void',
			description: 'Fired when the chip is clicked. Replaces Button onclick for this purpose.'
		},
		{
			name: 'variant',
			type: 'Button variant',
			default: '"outline"',
			description: 'Forwarded to Button.'
		},
		{
			name: 'size',
			type: 'Button size',
			default: '"sm"',
			description: 'Forwarded to Button.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Optional custom content instead of the suggestion string.'
		}
	];

	const suggestionsProps: PropRow[] = [
		{
			name: 'orientation',
			type: '"horizontal" | "vertical" | "both"',
			default: '"horizontal"',
			description: 'ScrollArea orientation.'
		},
		{
			name: 'whitespace',
			type: '"normal" | "nowrap"',
			default: '"nowrap"',
			description: 'Keeps chips on one line for horizontal scroll.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'One or more Suggestion chips.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Suggestion, Suggestions } from "fractalsvelte/ai-elements/suggestion";
<\/script>

<Suggestions>
  <Suggestion suggestion="Tell me about Svelte 5" onSelect={(s) => console.log(s)} />
  <Suggestion suggestion="How do runes work?" onSelect={(s) => console.log(s)} />
  <Suggestion suggestion="Explain snippets" onSelect={(s) => console.log(s)} />
</Suggestions>`;

	const codeScroll = `<Suggestions>
  {#each prompts as p}
    <Suggestion suggestion={p} onSelect={handle} />
  {/each}
</Suggestions>`;

	const codeSelected = `<Suggestion
  suggestion="Continue"
  variant={picked === "Continue" ? "default" : "outline"}
  onSelect={(s) => (picked = s)}
/>`;
</script>

{#snippet demoBasic()}
	<div style="width: 100%;">
		<Suggestion.Suggestions>
			{#each starter as s (s)}
				<Suggestion.Suggestion suggestion={s} onSelect={select} />
			{/each}
		</Suggestion.Suggestions>
		{#if lastPick}
			<p style="margin: 0.75rem 0 0; font-size: 0.8125rem; color: var(--muted-foreground);">
				Selected: <strong style="color: var(--foreground);">{lastPick}</strong>
			</p>
		{/if}
	</div>
{/snippet}

{#snippet demoScroll()}
	<div style="width: 100%; max-width: 28rem; margin-inline: auto;">
		<Suggestion.Suggestions>
			{#each many as s (s)}
				<Suggestion.Suggestion suggestion={s} onSelect={select} />
			{/each}
		</Suggestion.Suggestions>
		<p style="margin: 0.5rem 0 0; font-size: 0.75rem; color: var(--muted-foreground);">
			Scroll horizontally when chips overflow.
		</p>
	</div>
{/snippet}

{#snippet demoVariants()}
	<div style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%; align-items: flex-start;">
		<Suggestion.Suggestions>
			<Suggestion.Suggestion suggestion="Outline (default)" variant="outline" onSelect={select} />
			<Suggestion.Suggestion suggestion="Secondary" variant="secondary" onSelect={select} />
			<Suggestion.Suggestion suggestion="Ghost" variant="ghost" onSelect={select} />
			<Suggestion.Suggestion
				suggestion={picked === 'Active' ? 'Active ✓' : 'Mark active'}
				variant={picked === 'Active' ? 'default' : 'outline'}
				onSelect={() => select('Active')}
			/>
		</Suggestion.Suggestions>
	</div>
{/snippet}

<h1 class="doc-title">Suggestion</h1>
<p class="doc-lede">
	Horizontally scrollable suggestion chips for empty states, follow-ups, and prompt starters — pill-shaped Buttons in a ScrollArea row.
</p>

<Preview description="Three starter chips" code={usage}>
	{@render demoBasic()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/suggestion/` into your project. It composes ported `button` and `scroll-area`.

## Usage

<CodeBlock code={usage} lang="svelte" />

Namespace import also works: `Suggestion.Root` / `Suggestion.Item` are aliases for `Suggestions` / `Suggestion`.

## Examples

<Examples
	items={[
		{
			title: 'Basic',
			demo: demoBasic,
			code: usage,
			description: 'A short row of chips; onSelect receives the suggestion string.'
		},
		{
			title: 'Overflow scroll',
			demo: demoScroll,
			code: codeScroll,
			description: 'Many chips stay on one line inside a horizontal ScrollArea.'
		},
		{
			title: 'Variants',
			demo: demoVariants,
			code: codeSelected,
			description: 'Any Button variant works; toggle variant for a selected look.'
		}
	]}
/>

## Props

### Suggestion

<PropsTable props={suggestionProps} />

### Suggestions

<PropsTable props={suggestionsProps} />

## Theming

Chips keep full Button skin (`data-slot="button"`). Pill radius and padding come from `[data-suggestion]`:

<div class="doc-table-wrap">

| Selector / token | Used for |
| --- | --- |
| `[data-slot='button'][data-suggestion]` | Full pill, horizontal padding, nowrap |
| Button tokens (`--primary`, `--border`, …) | Fill, border, hover via `variant` |
| ScrollArea | Horizontal overflow for long rows |

</div>
