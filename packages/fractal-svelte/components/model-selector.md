<script lang="ts">
	import * as ModelSelector from '$lib/components/ai-elements/model-selector/index.js';
	import { Button } from '$lib/components/button/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	type Model = {
		chef: string;
		chefSlug: string;
		id: string;
		name: string;
		providers: string[];
	};

	const models: Model[] = [
		{ chef: 'OpenAI', chefSlug: 'openai', id: 'gpt-4o', name: 'GPT-4o', providers: ['openai', 'azure'] },
		{
			chef: 'OpenAI',
			chefSlug: 'openai',
			id: 'gpt-4o-mini',
			name: 'GPT-4o Mini',
			providers: ['openai', 'azure']
		},
		{
			chef: 'Anthropic',
			chefSlug: 'anthropic',
			id: 'claude-sonnet-4',
			name: 'Claude Sonnet 4',
			providers: ['anthropic', 'amazon-bedrock']
		},
		{
			chef: 'Anthropic',
			chefSlug: 'anthropic',
			id: 'claude-haiku',
			name: 'Claude Haiku',
			providers: ['anthropic']
		},
		{
			chef: 'Google',
			chefSlug: 'google',
			id: 'gemini-2.0-flash',
			name: 'Gemini 2.0 Flash',
			providers: ['google', 'google-vertex']
		},
		{ chef: 'xAI', chefSlug: 'xai', id: 'grok-3', name: 'Grok 3', providers: ['xai'] },
		{
			chef: 'Mistral AI',
			chefSlug: 'mistral',
			id: 'mistral-large',
			name: 'Mistral Large',
			providers: ['mistral', 'azure']
		},
		{
			chef: 'DeepSeek',
			chefSlug: 'deepseek',
			id: 'deepseek-r1',
			name: 'DeepSeek R1',
			providers: ['deepseek', 'togetherai']
		}
	];

	let open = $state(false);
	let selectedModel = $state('gpt-4o');

	const selectedModelData = $derived(models.find((m) => m.id === selectedModel));
	const chefs = $derived(Array.from(new Set(models.map((m) => m.chef))));

	const rootProps: PropRow[] = [
		{ name: 'open', type: 'boolean', default: 'false', description: 'Controlled dialog open state (bindable).' }
	];

	const logoProps: PropRow[] = [
		{
			name: 'provider',
			type: 'ModelProvider',
			description: 'Slug for https://models.dev/logos/{provider}.svg (openai, anthropic, …).'
		}
	];

	const itemProps: PropRow[] = [
		{ name: 'value', type: 'string', description: 'Searchable command value.' },
		{ name: 'onSelect', type: '() => void', description: 'Called when the item is chosen.' }
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as ModelSelector from "fractalsvelte/ai-elements/model-selector";
  import { Button } from "fractalsvelte/button";
  let open = $state(false);
  let selected = $state("gpt-4o");
<\/script>

<ModelSelector.Root bind:open>
  <ModelSelector.Trigger>
    <Button variant="outline">
      <ModelSelector.Logo provider="openai" />
      <ModelSelector.Name>GPT-4o</ModelSelector.Name>
    </Button>
  </ModelSelector.Trigger>
  <ModelSelector.Content>
    <ModelSelector.Input placeholder="Search models..." />
    <ModelSelector.List>
      <ModelSelector.Empty>No models found.</ModelSelector.Empty>
      <ModelSelector.Group heading="OpenAI">
        <ModelSelector.Item value="gpt-4o" onSelect={() => { selected = "gpt-4o"; open = false; }}>
          <ModelSelector.Logo provider="openai" />
          <ModelSelector.Name>GPT-4o</ModelSelector.Name>
          <ModelSelector.LogoGroup>
            <ModelSelector.Logo provider="openai" />
            <ModelSelector.Logo provider="azure" />
          </ModelSelector.LogoGroup>
        </ModelSelector.Item>
      </ModelSelector.Group>
    </ModelSelector.List>
  </ModelSelector.Content>
</ModelSelector.Root>`;
</script>

{#snippet checkIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-left: auto; flex-shrink: 0; opacity: 0.5;"><path d="M20 6 9 17l-5-5"/></svg>
{/snippet}

{#snippet demoPicker()}
	<div style="display: flex; justify-content: center; padding: 1rem;">
		<ModelSelector.Root bind:open>
			<ModelSelector.Trigger>
				<Button variant="outline" style="min-width: 14rem; justify-content: flex-start; gap: 0.5rem;">
					{#if selectedModelData}
						<ModelSelector.Logo provider={selectedModelData.chefSlug} />
						<ModelSelector.Name>{selectedModelData.name}</ModelSelector.Name>
					{:else}
						<ModelSelector.Name>Select model</ModelSelector.Name>
					{/if}
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-left: auto; opacity: 0.5;"><path d="m6 9 6 6 6-6"/></svg>
				</Button>
			</ModelSelector.Trigger>
			<ModelSelector.Content>
				<ModelSelector.Input placeholder="Search models..." />
				<ModelSelector.List>
					<ModelSelector.Empty>No models found.</ModelSelector.Empty>
					{#each chefs as chef}
						<ModelSelector.Group heading={chef}>
							{#each models.filter((m) => m.chef === chef) as model}
								<ModelSelector.Item
									value={model.id}
									onSelect={() => {
										selectedModel = model.id;
										open = false;
									}}
								>
									<ModelSelector.Logo provider={model.chefSlug} />
									<ModelSelector.Name>{model.name}</ModelSelector.Name>
									<ModelSelector.LogoGroup>
										{#each model.providers as provider}
											<ModelSelector.Logo {provider} />
										{/each}
									</ModelSelector.LogoGroup>
									{#if selectedModel === model.id}
										{@render checkIcon()}
									{/if}
								</ModelSelector.Item>
							{/each}
						</ModelSelector.Group>
					{/each}
				</ModelSelector.List>
			</ModelSelector.Content>
		</ModelSelector.Root>
	</div>
{/snippet}

{#snippet demoCompact()}
	<div style="display: flex; justify-content: center; padding: 1rem;">
		<p style="font-size: var(--text-sm); color: var(--muted-foreground);">
			Selected: <strong style="color: var(--foreground);">{selectedModelData?.name ?? '—'}</strong>
			({selectedModel})
		</p>
	</div>
{/snippet}

<h1 class="doc-title">Model Selector</h1>
<p class="doc-lede">
	Searchable command dialog for picking AI models — provider logos from models.dev, grouped lists, multi-provider logo stacks, and a customizable trigger.
</p>

<Preview description="Open the dialog and pick a model" code={usage}>
	{@render demoPicker()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/model-selector/`.

## Usage

<CodeBlock code={usage} lang="svelte" />

`Root` is a Dialog. `Content` wraps a Command palette (input + list). Logos load from `https://models.dev/logos/{provider}.svg`. There is also `ModelSelector.Dialog` (Command.Dialog) for an all-in-one palette shell.

## Examples

<Examples
	items={[
		{ title: 'Model picker', demo: demoPicker },
		{ title: 'Selection state', demo: demoCompact }
	]}
/>

## Props

### ModelSelector.Root

<PropsTable props={rootProps} />

### ModelSelector.Logo

<PropsTable props={logoProps} />

### ModelSelector.Item

<PropsTable props={itemProps} />

Group accepts `heading`. Input / List / Empty / Separator / Shortcut mirror Command primitives with `data-slot` prefixes.

## Theming

- Content: borderless dialog shell filled by command
- Logo: 12×12, inverted in dark mode
- LogoGroup: overlapping rings with background + border
- Name: truncating flex-1 label
