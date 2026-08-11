<script lang="ts">
	import * as Plan from '$lib/components/ai-elements/plan/index.js';
	import { Button } from '$lib/components/button/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let streaming = $state(false);
	let controlledOpen = $state(true);

	const rootProps: PropRow[] = [
		{
			name: 'open',
			type: 'boolean',
			description: 'Controlled open state (bindable).'
		},
		{
			name: 'isStreaming',
			type: 'boolean',
			default: 'false',
			description: 'When true, PlanTitle / PlanDescription wrap children in Shimmer.'
		},
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			description: 'Fires when the plan expands or collapses.'
		},
		{ name: 'children', type: 'Snippet', description: 'Header, Content, Footer, etc.' }
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as Plan from "fractalsvelte/ai-elements/plan";
  import { Button } from "fractalsvelte/button";
<\/script>

<Plan.Root>
  <Plan.Header>
    <div>
      <Plan.Title>Migrate auth to sessions</Plan.Title>
      <Plan.Description>
        Replace API keys with signed session cookies across the dashboard.
      </Plan.Description>
    </div>
    <Plan.Trigger />
  </Plan.Header>
  <Plan.Content>
    <div data-slot="plan-body">…outline…</div>
  </Plan.Content>
  <Plan.Footer>
    <Plan.Action>
      <Button size="sm">Build</Button>
    </Plan.Action>
  </Plan.Footer>
</Plan.Root>`;
</script>

{#snippet iconDoc()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
		<path d="M14 2v4a2 2 0 0 0 2 2h4" />
		<path d="M10 9H8" />
		<path d="M16 13H8" />
		<path d="M16 17H8" />
	</svg>
{/snippet}

{#snippet demoDefault()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto;">
		<Plan.Root open={false}>
			<Plan.Header>
				<div>
					<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
						{@render iconDoc()}
						<Plan.Title>Rewrite AI Elements to SolidJS</Plan.Title>
					</div>
					<Plan.Description>
						Rewrite the AI Elements component library from React to SolidJS while maintaining
						compatibility with existing React-based UI components, updating all components and their
						test suite.
					</Plan.Description>
				</div>
				<Plan.Trigger />
			</Plan.Header>
			<Plan.Content>
				<div data-slot="plan-body">
					<div>
						<h3>Overview</h3>
						<p>
							This plan outlines the migration strategy for converting the library, ensuring
							compatibility and maintaining existing functionality.
						</p>
					</div>
					<div>
						<h3>Key steps</h3>
						<ul>
							<li>Set up SolidJS project structure</li>
							<li>Install compatibility layer for shared UI</li>
							<li>Migrate components one by one</li>
							<li>Update test suite for each component</li>
							<li>Verify compatibility with the design system</li>
						</ul>
					</div>
				</div>
			</Plan.Content>
			<Plan.Footer>
				<Plan.Action>
					<Button size="sm">Build</Button>
				</Plan.Action>
			</Plan.Footer>
		</Plan.Root>
	</div>
{/snippet}

{#snippet demoOpen()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto;">
		<Plan.Root open>
			<Plan.Header>
				<div>
					<Plan.Title>Ship collapsible plan cards</Plan.Title>
					<Plan.Description>
						Compose Card + Collapsible so long outlines stay out of the way until expanded.
					</Plan.Description>
				</div>
				<Plan.Trigger />
			</Plan.Header>
			<Plan.Content>
				<div data-slot="plan-body">
					<div>
						<h3>Deliverables</h3>
						<ul>
							<li>Plan root with optional streaming shimmer</li>
							<li>Header / title / description / trigger</li>
							<li>Collapsible content + footer actions</li>
						</ul>
					</div>
				</div>
			</Plan.Content>
			<Plan.Footer>
				<Plan.Action>
					<Button size="sm" variant="outline">Edit</Button>
					<Button size="sm">Approve</Button>
				</Plan.Action>
			</Plan.Footer>
		</Plan.Root>
	</div>
{/snippet}

{#snippet demoStreaming()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto; display: flex; flex-direction: column; gap: 0.75rem;">
		<div style="display: flex; gap: 0.5rem;">
			<Button size="sm" variant={streaming ? 'secondary' : 'default'} onclick={() => (streaming = !streaming)}>
				{streaming ? 'Stop streaming' : 'Simulate streaming'}
			</Button>
		</div>
		<Plan.Root open isStreaming={streaming}>
			<Plan.Header>
				<div>
					<Plan.Title>Draft migration plan…</Plan.Title>
					<Plan.Description>
						The model is still writing the outline. Title and description shimmer until the stream
						settles.
					</Plan.Description>
				</div>
				<Plan.Trigger />
			</Plan.Header>
			<Plan.Content>
				<div data-slot="plan-body">
					<p>Steps will appear here once the stream completes.</p>
				</div>
			</Plan.Content>
		</Plan.Root>
	</div>
{/snippet}

{#snippet demoControlled()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto; display: flex; flex-direction: column; gap: 0.75rem;">
		<Button size="sm" variant="outline" onclick={() => (controlledOpen = !controlledOpen)}>
			{controlledOpen ? 'Collapse' : 'Expand'} plan
		</Button>
		<Plan.Root bind:open={controlledOpen}>
			<Plan.Header>
				<div>
					<Plan.Title>Controlled open state</Plan.Title>
					<Plan.Description>bind:open keeps the plan in sync with external UI.</Plan.Description>
				</div>
				<Plan.Trigger />
			</Plan.Header>
			<Plan.Content>
				<div data-slot="plan-body">
					<p>Toggle via the button above or the chevrons control.</p>
				</div>
			</Plan.Content>
		</Plan.Root>
	</div>
{/snippet}

<h1 class="doc-title">Plan</h1>
<p class="doc-lede">
	A collapsible card for agent plans — title, description, outline body, footer actions, and an
	optional streaming shimmer on the header copy.
</p>

<Preview description="Collapsed plan with expand trigger and build action" code={usage}>
	{@render demoDefault()}
</Preview>

## Installation

<CodeBlock code={codeInstall} lang="bash" />

Copy the `plan/` folder, or import from the package:

<CodeBlock code={`import * as Plan from "fractalsvelte/ai-elements/plan";`} lang="ts" />

`PlanTitle` / `PlanDescription` optionally compose the `shimmer` ai-element when
`isStreaming` is set.

## Usage

<CodeBlock code={usage} />

Place `Plan.Trigger` inside `Plan.Header` (typically opposite the title block). The trigger is a
ghost icon button that keeps full Button skin.

## Examples

<Examples
	items={[
		{
			title: 'Collapsed',
			demo: demoDefault,
			code: usage,
			description: 'Closed by default with expand trigger and build action.'
		},
		{
			title: 'Open',
			demo: demoOpen,
			code: usage,
			description: 'Expanded outline with dual footer actions.'
		},
		{
			title: 'Streaming',
			demo: demoStreaming,
			code: usage,
			description: 'isStreaming wraps title and description in Shimmer.'
		},
		{
			title: 'Controlled',
			demo: demoControlled,
			code: usage,
			description: 'bind:open driven from an external button.'
		}
	]}
/>


## Props

### Plan

<PropsTable props={rootProps} />

### Composition

| Part | Role |
| --- | --- |
| `Plan.Header` | Card header; flex row for title block + trigger |
| `Plan.Title` | Card title; shimmers when streaming |
| `Plan.Description` | Card description; shimmers when streaming |
| `Plan.Trigger` | Ghost icon button that toggles the collapsible |
| `Plan.Content` | Collapsible body wrapped in card content |
| `Plan.Footer` | Card footer |
| `Plan.Action` | Card action slot (often inside footer) |

## Theming

| Token / slot | Role |
| --- | --- |
| `[data-slot=plan]` | Collapsible root |
| `[data-slot=card][data-plan-card]` | Shadowless plan surface |
| `[data-slot=card-header][data-plan-header]` | Flex header layout |
| `[data-slot=button][data-plan-trigger]` | Dense 2rem toggle |
| `[data-slot=plan-body]` | Optional outline prose layout |
| `[data-slot=shimmer]` | Streaming text effect (from shimmer) |
| `--card`, `--card-foreground`, `--muted-foreground`, `--radius` | Surface tokens |
