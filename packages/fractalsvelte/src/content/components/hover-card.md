<script lang="ts">
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import * as HoverCard from '$lib/components/hover-card';

	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const usage = `import * as HoverCard from "fractalsvelte/hover-card";`;

	const codeInstall = `npm i fractalsvelte`;

	const codeBasic = `<HoverCard.Root>
	<HoverCard.Trigger href="https://github.com/sveltejs" target="_blank" rel="noreferrer noopener">
		@sveltejs
	</HoverCard.Trigger>
	<HoverCard.Content>
		<h4>Svelte</h4>
		<p>Cybernetically enhanced web apps.</p>
	</HoverCard.Content>
</HoverCard.Root>`;

	const codeSides = `<HoverCard.Root openDelay={100} closeDelay={100}>
	<HoverCard.Trigger>top</HoverCard.Trigger>
	<HoverCard.Content side="top">
		This hover card appears above the trigger.
	</HoverCard.Content>
</HoverCard.Root>`;

	const hoverCardSides = ['top', 'right', 'bottom', 'left'] as const;

	const rootProps: PropRow[] = [
		{
			name: 'open',
			type: 'boolean',
			default: 'false',
			description: 'Controlled open state. Bindable.'
		},
		{
			name: 'openDelay',
			type: 'number',
			default: '700',
			description: 'Delay in milliseconds before the preview opens.'
		},
		{
			name: 'closeDelay',
			type: 'number',
			default: '300',
			description: 'Delay in milliseconds before the preview closes.'
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Prevents the preview from opening.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Root children, usually Trigger and Content.'
		}
	];

	const triggerProps: PropRow[] = [
		{
			name: 'ref',
			type: 'HTMLAnchorElement | null',
			description: 'Bindable reference to the trigger element.'
		},
		{
			name: 'child',
			type: 'Snippet',
			description: 'Renders a custom trigger element with behavior props applied.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Trigger content.'
		}
	];

	const contentProps: PropRow[] = [
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			description: 'Bindable reference to the floating content element.'
		},
		{
			name: 'side',
			type: '"top" | "right" | "bottom" | "left"',
			description: 'Preferred side for the floating content.'
		},
		{
			name: 'align',
			type: '"start" | "center" | "end"',
			default: '"center"',
			description: 'Alignment against the trigger.'
		},
		{
			name: 'sideOffset',
			type: 'number',
			default: '4',
			description: 'Distance in pixels between trigger and content.'
		},
		{
			name: 'portalProps',
			type: 'HoverCardPortalProps',
			description: 'Props forwarded to the portal wrapper.'
		},
		{
			name: 'child',
			type: 'Snippet',
			description: 'Renders custom content markup with behavior props applied.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Preview body content.'
		}
	];
</script>

<h1 class="doc-title">Hover Card</h1>
<p class="doc-lede">
	Preview secondary information when a user hovers over or focuses a trigger.
</p>

<Preview description="Hover Card — profile preview" code={usage}>
	<HoverCard.Root openDelay={100} closeDelay={100}>
		<HoverCard.Trigger href="https://github.com/sveltejs" target="_blank" rel="noreferrer noopener">
			@sveltejs
		</HoverCard.Trigger>
		<HoverCard.Content>
			<div class="row xbetween" style="gap: 1rem; align-items: flex-start">
				<div
					aria-hidden="true"
					style="width: 2.5rem; height: 2.5rem; border-radius: var(--radius); background: var(--muted); display: grid; place-items: center; font-weight: 600"
				>
					SK
				</div>
				<div class="box" style="gap: 0.25rem">
					<h4 style="font-size: var(--text-sm); line-height: var(--text-sm--line-height); font-weight: 600">
						@sveltejs
					</h4>
					<p style="font-size: var(--text-sm); line-height: var(--text-sm--line-height)">
						Cybernetically enhanced web apps.
					</p>
					<div class="row ycenter" style="gap: 0.5rem; padding-top: 0.5rem">
						<svg aria-hidden="true" viewBox="0 0 24 24" style="width: 1rem; height: 1rem; opacity: 0.7">
							<path
								d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
							/>
						</svg>
						<span style="color: var(--muted-foreground); font-size: var(--text-xs); line-height: var(--text-xs--line-height)">
							Joined September 2022
						</span>
					</div>
				</div>
			</div>
		</HoverCard.Content>
	</HoverCard.Root>
</Preview>

## Installation

<CodeBlock code={codeInstall} lang="bash" />

Copy `src/lib/components/hover-card` into your project and import the component stylesheet from your SASS entry point.

## Usage

<CodeBlock code={usage} lang="ts" />

<CodeBlock code={codeBasic} lang="svelte" />

## Examples

{#snippet demoBasic()}
<HoverCard.Root openDelay={100} closeDelay={100}>
<HoverCard.Trigger href="https://github.com/sveltejs" rel="noreferrer noopener">
@sveltejs
</HoverCard.Trigger>
<HoverCard.Content>

<div class="box" style="gap: 0.25rem">
<h4 style="font-weight: 600">Svelte</h4>
<p>Cybernetically enhanced web apps.</p>
</div>
</HoverCard.Content>
</HoverCard.Root>
{/snippet}

{#snippet demoSides()}

<div class="row xcenter ycenter" style="gap: 1rem; flex-wrap: wrap">
{#each hoverCardSides as side}
<HoverCard.Root openDelay={100} closeDelay={100}>
<HoverCard.Trigger>{side}</HoverCard.Trigger>
<HoverCard.Content {side}>
<div class="box" style="gap: 0.25rem">
<h4 style="font-weight: 600">Hover Card</h4>
<p>This hover card appears on the {side} side of the trigger.</p>
</div>
</HoverCard.Content>
</HoverCard.Root>
{/each}
</div>
{/snippet}

<Examples
items={[
{ title: 'Basic', demo: demoBasic, code: codeBasic },
{ title: 'Sides', demo: demoSides, code: codeSides }
]}
/>

## Props

### Root

<PropsTable props={rootProps} />

### Trigger

<PropsTable props={triggerProps} />

### Content

<PropsTable props={contentProps} />

## Theming

Hover Card reads `--popover`, `--popover-foreground`, `--foreground`, `--background`, `--muted`, `--muted-foreground`, `--ring`, and `--radius`.
