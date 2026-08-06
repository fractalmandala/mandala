<script lang="ts">
	import * as Card from '$lib/components/card/index.js';
	import * as Collapsible from '$lib/components/collapsible/index.js';
	import { Input } from '$lib/components/input/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let open = $state(false);
	let settingsOpen = $state(false);

	const rootProps: PropRow[] = [
		{ name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state.' },
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Prevents the trigger from opening the panel.'
		},
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			description: 'Called when open changes.'
		},
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the root element.'
		},
		{ name: 'children', type: 'Snippet', description: 'Trigger and content.' }
	];

	const triggerProps: PropRow[] = [
		{
			name: 'ref',
			type: 'HTMLButtonElement | null',
			default: 'null',
			description: 'Bindable reference to the trigger button.'
		},
		{
			name: 'child',
			type: 'Snippet',
			description: 'Render another component as the trigger while preserving behaviour.'
		},
		{ name: 'children', type: 'Snippet', description: 'Trigger content.' }
	];

	const contentProps: PropRow[] = [
		{
			name: 'forceMount',
			type: 'boolean',
			default: 'false',
			description: 'Keeps the content mounted even when closed.'
		},
		{
			name: 'hiddenUntilFound',
			type: 'boolean',
			default: 'true',
			description: 'Allows browser find-in-page to reveal closed content.'
		},
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the content element.'
		},
		{ name: 'children', type: 'Snippet', description: 'Panel content.' }
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as Collapsible from "fractalsvelte/collapsible";
<\/script>

<Collapsible.Root>
  <Collapsible.Trigger>Can I use this?</Collapsible.Trigger>
  <Collapsible.Content>Yes.</Collapsible.Content>
</Collapsible.Root>`;

	const codeBasic = `<Collapsible.Root bind:open>
  <Collapsible.Trigger>Toggle repositories</Collapsible.Trigger>
  <Collapsible.Content>...</Collapsible.Content>
</Collapsible.Root>`;

	const codeButtonTrigger = `<Collapsible.Trigger aria-label="Toggle details">
  Toggle details
</Collapsible.Trigger>`;

	const codeSettings = `<Collapsible.Root bind:open={settingsOpen}>
  <div class="row">
    <Input placeholder="Radius X" />
    <Input placeholder="Radius Y" />
    <Collapsible.Trigger>...</Collapsible.Trigger>
  </div>
  <Collapsible.Content>...</Collapsible.Content>
</Collapsible.Root>`;
</script>

<h1 class="doc-title">Collapsible</h1>
<p class="doc-lede">A disclosure primitive for expanding and collapsing a panel.</p>

<Preview description="Collapsible — repositories" code={usage}>
	<Collapsible.Root bind:open style="width:min(100%,22rem)">
		<div class="row" style="align-items:center; justify-content:space-between; gap:1rem">
			<h4 style="font-size:var(--text-sm); font-weight:600">Starred repositories</h4>
			<Collapsible.Trigger aria-label="Toggle repositories">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
				</svg>
			</Collapsible.Trigger>
		</div>
		<div class="box" style="gap:0.5rem; margin-top:0.5rem">
			<div style="border:1px solid var(--border); border-radius:var(--radius); padding:0.75rem 1rem; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size:var(--text-sm)">
				@fractalmandala/fractal-agentic
			</div>
			<Collapsible.Content>
				<div class="box" style="gap:0.5rem">
					<div style="border:1px solid var(--border); border-radius:var(--radius); padding:0.75rem 1rem; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size:var(--text-sm)">
						@fractalmandala/fractalsvelte
					</div>
					<div style="border:1px solid var(--border); border-radius:var(--radius); padding:0.75rem 1rem; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size:var(--text-sm)">
						@fractalmandala/svelte-icons
					</div>
				</div>
			</Collapsible.Content>
		</div>
	</Collapsible.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/collapsible/` into your project.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoBasic()}
<Collapsible.Root bind:open style="width:min(100%,22rem)">

<div class="row" style="align-items:center; justify-content:space-between; gap:1rem">
<span style="font-weight:600">Package files</span>
			<Collapsible.Trigger>{open ? 'Hide' : 'Show'}</Collapsible.Trigger>
</div>
<Collapsible.Content>
<div class="box" style="gap:0.5rem; margin-top:0.75rem">
<span>package.json</span>
<span>svelte.config.js</span>
<span>vite.config.ts</span>
</div>
</Collapsible.Content>
</Collapsible.Root>
{/snippet}

{#snippet demoButtonTrigger()}
<Collapsible.Root style="width:min(100%,22rem)">
<Collapsible.Trigger>Toggle details</Collapsible.Trigger>
<Collapsible.Content>

<p style="margin-top:0.75rem; color:var(--muted-foreground)">
The trigger can be rendered by another component through the child snippet.
</p>
</Collapsible.Content>
</Collapsible.Root>
{/snippet}

{#snippet demoSettings()}
<Card.Root size="sm" style="width:min(100%,20rem)">
<Card.Header>
<Card.Title>Radius</Card.Title>
<Card.Description>Set the corner radius of the element.</Card.Description>
</Card.Header>
<Card.Content>
<Collapsible.Root bind:open={settingsOpen}>

<div class="row" style="align-items:start; gap:0.5rem">
<div class="box" style="gap:0.5rem; flex:1">
<div class="row" style="gap:0.5rem">
<Input placeholder="0" aria-label="Radius X" />
<Input placeholder="0" aria-label="Radius Y" />
</div>
<Collapsible.Content>
<div class="row" style="gap:0.5rem; margin-top:0.5rem">
<Input placeholder="0" aria-label="Radius bottom left" />
<Input placeholder="0" aria-label="Radius bottom right" />
</div>
</Collapsible.Content>
</div>
					<Collapsible.Trigger aria-label="Toggle advanced radii">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							{#if settingsOpen}
								<path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5" />
							{:else}
								<path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5" />
							{/if}
						</svg>
					</Collapsible.Trigger>
</div>
</Collapsible.Root>
</Card.Content>
</Card.Root>
{/snippet}

<Examples
items={[
{ title: 'Basic', demo: demoBasic, code: codeBasic },
{ title: 'Button trigger', demo: demoButtonTrigger, code: codeButtonTrigger },
{ title: 'Settings', demo: demoSettings, code: codeSettings }
]}
/>

## Props

### Collapsible.Root

<PropsTable props={rootProps} />

### Collapsible.Trigger

<PropsTable props={triggerProps} />

### Collapsible.Content

<PropsTable props={contentProps} />

## Theming

Collapsible itself reads no colour, radius or shadow tokens. It only provides state and
measurement attributes for composition. Its content animation reads
`--bits-collapsible-content-height`, which the collapsible primitives set as they measure.
