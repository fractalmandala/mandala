<script lang="ts">
	import * as OpenIn from '$lib/components/ai-elements/open-in-chat/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let sampleQuery = $state('How can I implement authentication in SvelteKit?');

	const rootProps: PropRow[] = [
		{
			name: 'query',
			type: 'string',
			description: 'Prompt prefilled into external chat providers via deep links.'
		},
		{ name: 'open', type: 'boolean', description: 'Optional controlled dropdown open state.' }
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as OpenIn from "fractalsvelte/ai-elements/open-in-chat";
<\/script>

<OpenIn.Root query="Explain quantum computing simply">
  <OpenIn.Trigger />
  <OpenIn.Content>
    <OpenIn.ChatGPT />
    <OpenIn.Claude />
    <OpenIn.T3 />
    <OpenIn.Scira />
    <OpenIn.V0 />
  </OpenIn.Content>
</OpenIn.Root>`;

	const usageCustom = `<OpenIn.Root {query}>
  <OpenIn.Trigger />
  <OpenIn.Content>
    <OpenIn.Label>Open with</OpenIn.Label>
    <OpenIn.ChatGPT />
    <OpenIn.Separator />
    <OpenIn.Item>
      <!-- custom menu row -->
    </OpenIn.Item>
  </OpenIn.Content>
</OpenIn.Root>`;
</script>

{#snippet demoProviders()}
	<div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 1.5rem;">
		<p style="margin: 0; font-size: var(--text-sm); color: var(--muted-foreground);">
			Opens the query in ChatGPT, Claude, T3, Scira, or v0
		</p>
		<code
			style="display: block; max-width: 28rem; padding: 0.5rem 0.75rem; border-radius: 3px; background: var(--muted); font-size: var(--text-xs); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
		>
			{sampleQuery}
		</code>
		<OpenIn.Root query={sampleQuery}>
			<OpenIn.Trigger />
			<OpenIn.Content>
				<OpenIn.ChatGPT />
				<OpenIn.Claude />
				<OpenIn.T3 />
				<OpenIn.Scira />
				<OpenIn.V0 />
			</OpenIn.Content>
		</OpenIn.Root>
	</div>
{/snippet}

{#snippet demoLabeled()}
	<div style="display: flex; justify-content: center; padding: 1.5rem;">
		<OpenIn.Root query="Write a Svelte 5 component that fetches data">
			<OpenIn.Trigger />
			<OpenIn.Content>
				<OpenIn.Label>Assistants</OpenIn.Label>
				<OpenIn.ChatGPT />
				<OpenIn.Claude />
				<OpenIn.Separator />
				<OpenIn.Label>Builders</OpenIn.Label>
				<OpenIn.V0 />
				<OpenIn.Scira />
			</OpenIn.Content>
		</OpenIn.Root>
	</div>
{/snippet}

<h1 class="doc-title">Open In Chat</h1>
<p class="doc-lede">
	Dropdown of AI chat providers — deep-link the current query into ChatGPT, Claude, T3 Chat, Scira, or v0. Brand icons ship inline; trigger defaults to an outline button.
</p>

<Preview description="Provider menu for a sample query" code={usage}>
	{@render demoProviders()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/open-in-chat/`. UI deps: `dropdown-menu`, `button`.

## Usage

<CodeBlock code={usage} lang="svelte" />

Provider rows open in a new tab via `providers.*.createUrl(query)`. Build custom menus with `Item`, `Label`, and `Separator`:

<CodeBlock code={usageCustom} lang="svelte" />

## Examples

<Examples
	items={[
		{ title: 'All providers', demo: demoProviders },
		{ title: 'Labeled groups', demo: demoLabeled }
	]}
/>

## Props

### OpenIn.Root / OpenInChat

<PropsTable props={rootProps} />

Provider components (`ChatGPT`, `Claude`, `T3`, `Scira`, `V0`) accept DropdownMenu Item props. `Trigger` renders a default outline button when children are omitted.

### providers map

Exported helpers: `chatgpt`, `claude`, `t3`, `scira`, `v0`, `github` — each has `title` and `createUrl(query)`.

## Theming

- Content width ~13rem, no extra shadow
- Item rows: flex, icon + label; icons use `var(--muted-foreground)`
- Trigger button gap for chevron via `data-open-in-trigger-button`
