<script lang="ts">
	import * as Context from '$lib/components/ai-elements/context/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const rootProps: PropRow[] = [
		{ name: 'usedTokens', type: 'number', description: 'Tokens consumed so far.' },
		{ name: 'maxTokens', type: 'number', description: 'Context window size.' },
		{
			name: 'usage',
			type: 'LanguageModelUsage',
			description: '{ inputTokens?, outputTokens?, reasoningTokens?, cachedInputTokens? }'
		},
		{
			name: 'modelId',
			type: 'string',
			description: 'Used for rough USD cost estimates in usage rows / footer.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as Context from "fractalsvelte/ai-elements/context";
<\/script>

<Context.Root
  usedTokens={40_000}
  maxTokens={128_000}
  modelId="openai:gpt-4o"
  usage={{ inputTokens: 32_000, outputTokens: 8_000, cachedInputTokens: 0, reasoningTokens: 0 }}
>
  <Context.Trigger />
  <Context.Content>
    <Context.ContentHeader />
    <Context.ContentBody>
      <Context.InputUsage />
      <Context.OutputUsage />
      <Context.ReasoningUsage />
      <Context.CacheUsage />
    </Context.ContentBody>
    <Context.ContentFooter />
  </Context.Content>
</Context.Root>`;
</script>

{#snippet demoFull()}
	<div style="display: flex; justify-content: center; padding: 1.5rem;">
		<Context.Root
			maxTokens={128_000}
			modelId="openai:gpt-4o"
			usage={{
				inputTokens: 32_000,
				outputTokens: 8_000,
				cachedInputTokens: 4_000,
				reasoningTokens: 1_200
			}}
			usedTokens={40_000}
		>
			<Context.Trigger />
			<Context.Content>
				<Context.ContentHeader />
				<Context.ContentBody>
					<Context.InputUsage />
					<Context.OutputUsage />
					<Context.ReasoningUsage />
					<Context.CacheUsage />
				</Context.ContentBody>
				<Context.ContentFooter />
			</Context.Content>
		</Context.Root>
	</div>
{/snippet}

{#snippet demoLow()}
	<div style="display: flex; justify-content: center; padding: 1.5rem; gap: 2rem; flex-wrap: wrap;">
		<Context.Root
			maxTokens={128_000}
			modelId="anthropic:claude-sonnet"
			usage={{ inputTokens: 2_400, outputTokens: 600 }}
			usedTokens={3_000}
		>
			<Context.Trigger />
			<Context.Content>
				<Context.ContentHeader />
				<Context.ContentBody>
					<Context.InputUsage />
					<Context.OutputUsage />
				</Context.ContentBody>
				<Context.ContentFooter />
			</Context.Content>
		</Context.Root>
		<Context.Root
			maxTokens={32_000}
			modelId="openai:gpt-4o-mini"
			usage={{ inputTokens: 28_000, outputTokens: 2_000 }}
			usedTokens={30_000}
		>
			<Context.Trigger />
			<Context.Content>
				<Context.ContentHeader />
				<Context.ContentBody>
					<Context.InputUsage />
					<Context.OutputUsage />
				</Context.ContentBody>
				<Context.ContentFooter />
			</Context.Content>
		</Context.Root>
	</div>
{/snippet}

<h1 class="doc-title">Context</h1>
<p class="doc-lede">
	Token usage hover card — ring progress trigger, percent + compact counts, per-channel token rows with rough cost, and total cost footer. Drop next to a prompt submit control.
</p>

<Preview description="Hover the trigger for full usage breakdown" code={usage}>
	{@render demoFull()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/context/`.

## Usage

<CodeBlock code={usage} lang="svelte" />

`Trigger` defaults to a percent label + circular progress icon. Usage rows hide themselves when their token count is 0. Cost estimates are illustrative (not live pricing).

## Examples

<Examples
	items={[
		{ title: 'Full breakdown', demo: demoFull },
		{ title: 'Low vs high usage', demo: demoLow }
	]}
/>

## Props

### Context.Root

<PropsTable props={rootProps} />

Content / Trigger accept HoverCard / Button props. Usage subcomponents take optional children to fully override the default row.

## Theming

- Trigger percent: `var(--muted-foreground)`
- Card sections separated by `var(--border)`
- Footer: `var(--secondary)` bar with total cost
- Usage labels muted; costs in compact monospace-ish layout
