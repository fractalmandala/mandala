<script lang="ts">
	import { Action, Actions } from '$lib/components/ai-elements/action/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let copied = $state(false);
	let liked = $state<'up' | 'down' | null>(null);
	let regenCount = $state(0);

	const props: PropRow[] = [
		{
			name: 'tooltip',
			type: 'string',
			description: 'When set, wraps the action in Tooltip.Provider + Root and shows this text.'
		},
		{
			name: 'label',
			type: 'string',
			description: 'Accessible name (sr-only). Falls back to tooltip when omitted.'
		},
		{
			name: 'variant',
			type: 'Button variant',
			default: '"ghost"',
			description: 'Forwarded to Button; full button skin retained.'
		},
		{
			name: 'size',
			type: 'Button size',
			default: '"icon-sm"',
			description: 'Forwarded to Button (source size-9 ≈ icon-sm).'
		},
		{
			name: 'ref',
			type: 'HTMLButtonElement | null',
			description: 'Bindable button element.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Icon (or label) content — pass your own SVG.'
		}
	];

	const actionsProps: PropRow[] = [
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			description: 'Bindable flex row root.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'One or more Action buttons.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Action, Actions } from "fractalsvelte/ai-elements/action";
<\/script>

<Actions>
  <Action tooltip="Copy" label="Copy" onclick={…}>
    <!-- your icon svg -->
  </Action>
  <Action tooltip="Regenerate" label="Regenerate" onclick={…}>
    <!-- your icon svg -->
  </Action>
</Actions>`;

	const codeToolbar = `<Actions>
  <Action tooltip="Copy" label="Copy">…</Action>
  <Action tooltip="Good response">…</Action>
  <Action tooltip="Bad response">…</Action>
  <Action tooltip="Regenerate">…</Action>
</Actions>`;

	const codeNoTooltip = `<Actions>
  <Action label="Copy">…</Action>
</Actions>`;
</script>

{#snippet iconCopy()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
{/snippet}
{#snippet iconRefresh()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
{/snippet}
{#snippet iconUp()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
{/snippet}
{#snippet iconDown()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/></svg>
{/snippet}

{#snippet demoBasic()}
	<div style="display: flex; justify-content: center; padding: 1rem; width: 100%;">
		<Actions>
			<Action
				tooltip={copied ? 'Copied' : 'Copy'}
				label="Copy"
				onclick={() => {
					navigator.clipboard?.writeText('Sample assistant reply');
					copied = true;
					setTimeout(() => (copied = false), 1200);
				}}
			>
				{@render iconCopy()}
			</Action>
			<Action
				tooltip="Regenerate"
				label="Regenerate"
				onclick={() => {
					regenCount += 1;
				}}
			>
				{@render iconRefresh()}
			</Action>
		</Actions>
	</div>
	{#if regenCount > 0}
		<p style="margin: 0; text-align: center; font-size: 0.75rem; color: var(--muted-foreground);">
			Regenerated ×{regenCount}
		</p>
	{/if}
{/snippet}

{#snippet demoToolbar()}
	<div
		style="width: 100%; max-width: 28rem; margin-inline: auto; padding: 1rem; border: 1px solid var(--border); border-radius: 3px; text-align: start;"
	>
		<p style="margin: 0 0 0.75rem; font-size: var(--text-sm); line-height: 1.5;">
			<strong>v0.3</strong> ships stick-to-bottom conversations, denser message actions, and
			streaming markdown defaults.
		</p>
		<Actions>
			<Action
				tooltip={copied ? 'Copied' : 'Copy'}
				label="Copy"
				onclick={() => {
					navigator.clipboard?.writeText('v0.3 ships stick-to-bottom…');
					copied = true;
					setTimeout(() => (copied = false), 1200);
				}}
			>
				{@render iconCopy()}
			</Action>
			<Action
				tooltip="Good response"
				label="Good response"
				onclick={() => {
					liked = liked === 'up' ? null : 'up';
				}}
				style={liked === 'up' ? 'color: var(--foreground)' : undefined}
			>
				{@render iconUp()}
			</Action>
			<Action
				tooltip="Bad response"
				label="Bad response"
				onclick={() => {
					liked = liked === 'down' ? null : 'down';
				}}
				style={liked === 'down' ? 'color: var(--foreground)' : undefined}
			>
				{@render iconDown()}
			</Action>
			<Action
				tooltip="Regenerate"
				label="Regenerate"
				onclick={() => {
					regenCount += 1;
				}}
			>
				{@render iconRefresh()}
			</Action>
		</Actions>
	</div>
{/snippet}

{#snippet demoNoTooltip()}
	<div style="display: flex; justify-content: center; padding: 1rem; width: 100%;">
		<Actions>
			<Action label="Copy" onclick={() => navigator.clipboard?.writeText('no tooltip')}>
				{@render iconCopy()}
			</Action>
			<Action label="Regenerate">
				{@render iconRefresh()}
			</Action>
		</Actions>
	</div>
{/snippet}

<h1 class="doc-title">Action</h1>
<p class="doc-lede">
	Small icon buttons for message toolbars — ghost by default, optional tooltips, grouped with `Actions`. Icons are yours (inline SVG); nothing ships from icon packages.
</p>

<Preview description="Copy + regenerate with tooltips" code={usage}>
	{@render demoBasic()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/action/` — it composes the ported `button` and `tooltip` components.

## Usage

<CodeBlock code={usage} lang="svelte" />

Pass icons as children. Prefer `tooltip` for discoverability; always set `label` (or rely on tooltip) so screen readers get a name.

## Examples

<Examples
	items={[
		{
			title: 'Basic',
			demo: demoBasic,
			code: usage,
			description: 'Two actions with tooltips and click handlers.'
		},
		{
			title: 'Message toolbar',
			demo: demoToolbar,
			code: codeToolbar,
			description: 'Typical row under an assistant reply: copy, feedback, regenerate.'
		},
		{
			title: 'Without a tooltip',
			demo: demoNoTooltip,
			code: codeNoTooltip,
			description: 'Pass label only to keep the accessible name without Tooltip chrome.'
		}
	]}
/>

## Props

### Action

<PropsTable {props} />

### Actions

<PropsTable props={actionsProps} />

## Theming

Action keeps `data-slot="button"` so variants and sizes work. Chrome marker is `data-action`:

<div class="doc-table-wrap">

| Token / selector | Used for |
| --- | --- |
| `--muted-foreground` | Resting icon colour |
| `--foreground` | Hover icon colour |
| `[data-slot='actions']` | Flex row, 0.25rem gap |
| `[data-slot='action-label']` | Visually hidden accessible name |

</div>

For chat-specific action rows that sit on a Message, prefer `Message.Action` / `Message.Actions` which share the same pattern with message-scoped data attributes.
