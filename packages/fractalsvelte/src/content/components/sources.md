<script lang="ts">
	import * as Sources from '$lib/components/ai-elements/sources/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const sources = [
		{ href: 'https://stripe.com/docs/api', title: 'Stripe API Documentation' },
		{ href: 'https://docs.github.com/en/rest', title: 'GitHub REST API' },
		{
			href: 'https://docs.aws.amazon.com/sdk-for-javascript/',
			title: 'AWS SDK for JavaScript'
		}
	];

	const svelteSources = [
		{ href: 'https://svelte.dev', title: 'Svelte Documentation' },
		{ href: 'https://kit.svelte.dev', title: 'SvelteKit Documentation' }
	];

	const triggerProps: PropRow[] = [
		{
			name: 'count',
			type: 'number',
			description: 'Number of sources in the default “Used N sources” label.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Optional custom trigger content.'
		}
	];

	const sourceProps: PropRow[] = [
		{ name: 'href', type: 'string', description: 'External URL (opens in a new tab).' },
		{ name: 'title', type: 'string', description: 'Default layout label next to the book icon.' },
		{
			name: 'children',
			type: 'Snippet',
			description: 'Optional custom link content (replaces book + title).'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as Sources from "fractalsvelte/ai-elements/sources";
<\/script>

<Sources.Root>
  <Sources.Trigger count={2} />
  <Sources.Content>
    <Sources.Item href="https://svelte.dev" title="Svelte Documentation" />
    <Sources.Item href="https://kit.svelte.dev" title="SvelteKit Documentation" />
  </Sources.Content>
</Sources.Root>`;
</script>

{#snippet demoDefault()}
	<div style="width: 100%; max-width: 24rem; margin-inline: auto; min-height: 7rem;">
		<Sources.Root>
			<Sources.Trigger count={sources.length} />
			<Sources.Content>
				{#each sources as source (source.href)}
					<Sources.Item href={source.href} title={source.title} />
				{/each}
			</Sources.Content>
		</Sources.Root>
	</div>
{/snippet}

{#snippet demoOpen()}
	<div style="width: 100%; max-width: 24rem; margin-inline: auto;">
		<Sources.Root open>
			<Sources.Trigger count={svelteSources.length} />
			<Sources.Content>
				{#each svelteSources as source (source.href)}
					<Sources.Item href={source.href} title={source.title} />
				{/each}
			</Sources.Content>
		</Sources.Root>
	</div>
{/snippet}

{#snippet demoCustom()}
	<div style="width: 100%; max-width: 24rem; margin-inline: auto;">
		<Sources.Root open>
			<Sources.Trigger count={1}>
				<span style="font-weight: 500;">References</span>
			</Sources.Trigger>
			<Sources.Content>
				<Sources.Item href="https://www.typescriptlang.org/docs/">
					<span style="text-decoration: underline;">TypeScript handbook</span>
				</Sources.Item>
			</Sources.Content>
		</Sources.Root>
	</div>
{/snippet}

{#snippet demoMany()}
	<div style="width: 100%; max-width: 24rem; margin-inline: auto;">
		<Sources.Root>
			<Sources.Trigger count={5} />
			<Sources.Content>
				{#each [
					{ href: 'https://developer.mozilla.org/', title: 'MDN Web Docs' },
					{ href: 'https://www.w3.org/TR/wcag22/', title: 'WCAG 2.2' },
					{ href: 'https://web.dev/', title: 'web.dev' },
					{ href: 'https://caniuse.com/', title: 'Can I use' },
					{ href: 'https://www.rfc-editor.org/', title: 'RFC Editor' }
				] as source (source.href)}
					<Sources.Item href={source.href} title={source.title} />
				{/each}
			</Sources.Content>
		</Sources.Root>
	</div>
{/snippet}

<h1 class="doc-title">Sources</h1>
<p class="doc-lede">
	A collapsible citation list for links the model used — compact trigger, expandable rows with
	book glyphs.
</p>

<Preview description="Used N sources with expandable links" code={usage}>
	{@render demoDefault()}
</Preview>

## Installation

<CodeBlock code={codeInstall} lang="bash" />

Copy the `sources/` folder, or import from the package:

<CodeBlock code={`import * as Sources from "fractalsvelte/ai-elements/sources";`} lang="ts" />

## Usage

<CodeBlock code={usage} />

`Sources.Trigger` requires `count` for the default label. Each `Sources.Item` is an
`<a target="_blank" rel="noreferrer">`.

## Examples

<Examples
	items={[
		{
			title: 'Default',
			demo: demoDefault,
			code: usage,
			description: 'Used N sources trigger with expandable API doc links.'
		},
		{
			title: 'Open',
			demo: demoOpen,
			code: usage,
			description: 'Starts expanded for Svelte docs.'
		},
		{
			title: 'Custom',
			demo: demoCustom,
			code: usage,
			description: 'Custom trigger label and link children.'
		},
		{
			title: 'Many sources',
			demo: demoMany,
			code: usage,
			description: 'Five reference links under one collapsible.'
		}
	]}
/>


## Props

### Sources.Trigger

<PropsTable props={triggerProps} />

### Sources.Item (Source)

<PropsTable props={sourceProps} />

`Sources` is a collapsible root (`open` bindable). `Sources.Content` is the collapsible panel.

## Theming

| Token / slot | Role |
| --- | --- |
| `[data-slot=sources]` | Root; primary colour, xs type |
| `[data-slot=sources-trigger]` | Quiet trigger row |
| `[data-slot=sources-content]` | Column of links |
| `[data-slot=source]` | External link row |
| `[data-slot=source-icon]` | Book glyph |
| `--primary`, `--ring` | Accent / focus |
