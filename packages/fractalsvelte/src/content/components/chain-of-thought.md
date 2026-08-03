<script lang="ts">
	import * as ChainOfThought from '$lib/components/ai-elements/chain-of-thought/index.js';
	import { Button } from '$lib/components/button/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let controlledOpen = $state(true);

	const profileImage =
		'https://i.pinimg.com/736x/75/f1/8f/75f18f979262c802ed8e36b3c4f2ff4f.jpg';

	const rootProps: PropRow[] = [
		{
			name: 'open',
			type: 'boolean',
			description: 'Controlled open state (bindable).'
		},
		{
			name: 'defaultOpen',
			type: 'boolean',
			default: 'false',
			description: 'Initial open state when uncontrolled.'
		},
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			description: 'Called when the chain opens or closes.'
		},
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			description: 'Bindable root element.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Header, Content, Steps, etc.'
		}
	];

	const headerProps: PropRow[] = [
		{
			name: 'icon',
			type: 'Snippet | false',
			description: 'Leading icon. Default brain glyph; pass false to hide.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Header label. Defaults to “Chain of Thought”.'
		}
	];

	const stepProps: PropRow[] = [
		{
			name: 'label',
			type: 'string',
			description: 'Primary step text (required).'
		},
		{
			name: 'description',
			type: 'string',
			description: 'Optional secondary line under the label.'
		},
		{
			name: 'status',
			type: '"complete" | "active" | "pending"',
			default: '"complete"',
			description: 'Progress tone for the step (muted / foreground / faded).'
		},
		{
			name: 'icon',
			type: 'Snippet',
			description: 'Leading icon snippet. Default is a small filled dot.'
		},
		{
			name: 'delay',
			type: 'number',
			description: 'Stagger delay in ms when the chain opens. Defaults to index × 150.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Nested content: search results, images, prose.'
		}
	];

	const imageProps: PropRow[] = [
		{
			name: 'caption',
			type: 'string',
			description: 'Caption under the image frame.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Usually an <img> (or any media).'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as ChainOfThought from "fractalsvelte/ai-elements/chain-of-thought";
<\/script>

<ChainOfThought.Root defaultOpen>
  <ChainOfThought.Header>Thinking process</ChainOfThought.Header>
  <ChainOfThought.Content>
    <ChainOfThought.Step label="Analyzing prompt" status="complete" />
    <ChainOfThought.Step label="Searching knowledge base" status="active">
      <ChainOfThought.SearchResults>
        <ChainOfThought.SearchResult>docs.md</ChainOfThought.SearchResult>
        <ChainOfThought.SearchResult>api.ts</ChainOfThought.SearchResult>
      </ChainOfThought.SearchResults>
    </ChainOfThought.Step>
    <ChainOfThought.Step label="Synthesizing answer" status="pending" />
  </ChainOfThought.Content>
</ChainOfThought.Root>`;

	const codeResearch = `<ChainOfThought.Root defaultOpen>
  <ChainOfThought.Header />
  <ChainOfThought.Content>
    <ChainOfThought.Step icon={searchIcon} label="Searching for profiles…" status="complete">
      <ChainOfThought.SearchResults>…</ChainOfThought.SearchResults>
    </ChainOfThought.Step>
    <ChainOfThought.Step icon={imageIcon} label="Found profile photo" status="complete">
      <ChainOfThought.Image caption="…"><img … /></ChainOfThought.Image>
    </ChainOfThought.Step>
    <ChainOfThought.Step label="Summary of findings…" status="complete" />
    <ChainOfThought.Step icon={searchIcon} label="Searching for recent work…" status="active">
      <ChainOfThought.SearchResults>…</ChainOfThought.SearchResults>
    </ChainOfThought.Step>
  </ChainOfThought.Content>
</ChainOfThought.Root>`;

	const codeControlled = `<script lang="ts">
  let open = $state(true);
<\/script>

<Button onclick={() => (open = !open)}>Toggle</Button>
<ChainOfThought.Root bind:open>
  <ChainOfThought.Header />
  <ChainOfThought.Content>…</ChainOfThought.Content>
</ChainOfThought.Root>`;
</script>

{#snippet iconSearch()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
{/snippet}

{#snippet iconImage()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
{/snippet}

{#snippet iconSpark()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18"/><path d="m5 8 7-5 7 5"/><path d="m5 16 7 5 7-5"/></svg>
{/snippet}

{#snippet demoBasic()}
	<div style="max-width: 32rem; width: 100%; margin-inline: auto;">
		<ChainOfThought.Root defaultOpen>
			<ChainOfThought.Header>Thinking process</ChainOfThought.Header>
			<ChainOfThought.Content>
				<ChainOfThought.Step label="Analyzing prompt" description="Parsed intent and entities" status="complete" />
				<ChainOfThought.Step label="Searching knowledge base" status="active">
					<ChainOfThought.SearchResults>
						<ChainOfThought.SearchResult>docs.md</ChainOfThought.SearchResult>
						<ChainOfThought.SearchResult>api.ts</ChainOfThought.SearchResult>
						<ChainOfThought.SearchResult>README</ChainOfThought.SearchResult>
					</ChainOfThought.SearchResults>
				</ChainOfThought.Step>
				<ChainOfThought.Step label="Synthesizing answer" status="pending" />
			</ChainOfThought.Content>
		</ChainOfThought.Root>
	</div>
{/snippet}

{#snippet demoResearch()}
	<div style="max-width: 32rem; width: 100%; margin-inline: auto;">
		<ChainOfThought.Root defaultOpen>
			<ChainOfThought.Header />
			<ChainOfThought.Content>
				<ChainOfThought.Step
					icon={iconSearch}
					label="Searching for profiles for Bhide Svelte"
					status="complete"
				>
					<ChainOfThought.SearchResults>
						{#each ['www.x.com', 'www.instagram.com', 'www.github.com'] as host (host)}
							<ChainOfThought.SearchResult>{host}</ChainOfThought.SearchResult>
						{/each}
					</ChainOfThought.SearchResults>
				</ChainOfThought.Step>

				<ChainOfThought.Step
					icon={iconImage}
					label="Found the profile photo for Bhide Svelte"
					status="complete"
				>
					<ChainOfThought.Image
						caption="Bhide Svelte's profile photo from x.com, showing a Ghibli-style man."
					>
						<img
							src={profileImage}
							alt="Example generated profile"
							style="height: 150px; width: auto; aspect-ratio: 1; border: 1px solid var(--border);"
						/>
					</ChainOfThought.Image>
				</ChainOfThought.Step>

				<ChainOfThought.Step
					label="Bhide Svelte is an Indian software engineer working on Svelte open-source projects. He builds tools that help developers ship better web apps."
					status="complete"
				/>

				<ChainOfThought.Step
					icon={iconSearch}
					label="Searching for recent work…"
					status="active"
				>
					<ChainOfThought.SearchResults>
						{#each ['www.github.com', 'www.dribbble.com'] as host (host)}
							<ChainOfThought.SearchResult>{host}</ChainOfThought.SearchResult>
						{/each}
					</ChainOfThought.SearchResults>
				</ChainOfThought.Step>
			</ChainOfThought.Content>
		</ChainOfThought.Root>
	</div>
{/snippet}

{#snippet demoStatuses()}
	<div style="max-width: 32rem; width: 100%; margin-inline: auto;">
		<ChainOfThought.Root defaultOpen>
			<ChainOfThought.Header>Generation pipeline</ChainOfThought.Header>
			<ChainOfThought.Content>
				<ChainOfThought.Step
					icon={iconSpark}
					label="Plan"
					description="Finished"
					status="complete"
				/>
				<ChainOfThought.Step
					icon={iconSearch}
					label="Retrieve context"
					description="In progress"
					status="active"
				>
					<ChainOfThought.SearchResults>
						<ChainOfThought.SearchResult>vector index</ChainOfThought.SearchResult>
						<ChainOfThought.SearchResult>session memory</ChainOfThought.SearchResult>
					</ChainOfThought.SearchResults>
				</ChainOfThought.Step>
				<ChainOfThought.Step label="Draft response" status="pending" />
				<ChainOfThought.Step label="Cite sources" status="pending" />
			</ChainOfThought.Content>
		</ChainOfThought.Root>
	</div>
{/snippet}

{#snippet demoControlled()}
	<div class="box" style="gap: 0.75rem; max-width: 32rem; width: 100%; margin-inline: auto;">
		<div class="row ycenter" style="gap: 0.5rem;">
			<Button size="sm" variant="outline" onclick={() => (controlledOpen = !controlledOpen)}>
				{controlledOpen ? 'Collapse' : 'Expand'}
			</Button>
			<span style="font-size: var(--text-sm); color: var(--muted-foreground);">
				open = {String(controlledOpen)}
			</span>
		</div>
		<ChainOfThought.Root bind:open={controlledOpen}>
			<ChainOfThought.Header>Controlled chain</ChainOfThought.Header>
			<ChainOfThought.Content>
				<ChainOfThought.Step label="Step one" status="complete" />
				<ChainOfThought.Step label="Step two" status="complete" />
				<ChainOfThought.Step label="Step three" status="active" />
			</ChainOfThought.Content>
		</ChainOfThought.Root>
	</div>
{/snippet}

{#snippet demoCollapsed()}
	<div style="max-width: 32rem; width: 100%; margin-inline: auto;">
		<ChainOfThought.Root>
			<ChainOfThought.Header>Collapsed by default — click to expand</ChainOfThought.Header>
			<ChainOfThought.Content>
				<ChainOfThought.Step label="Steps stagger in when opened" status="complete" />
				<ChainOfThought.Step label="Each step fades and slides up" status="complete" />
				<ChainOfThought.Step label="Last step has no connector line" status="active" />
			</ChainOfThought.Content>
		</ChainOfThought.Root>
	</div>
{/snippet}

<h1 class="doc-title">Chain of Thought</h1>
<p class="doc-lede">
	A collapsible reasoning panel for AI chats — staggered steps, search result chips, intermediate images, and progress status — so users can inspect how a response was produced.
</p>

<Preview description="Research-style chain with search chips and an image step" code={codeResearch}>
	{@render demoResearch()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/chain-of-thought/` into your project. It depends on the ported `collapsible` and `badge` components (and `bits-ui` underneath collapsible).

## Usage

<CodeBlock code={usage} lang="svelte" />

Compose `Root` → `Header` + `Content` → `Step` children. Nest `SearchResults` / `SearchResult` or `Image` inside a step. Steps animate in with a stagger when the chain opens.

## Examples

<Examples
	items={[
		{
			title: 'Research',
			demo: demoResearch,
			code: codeResearch,
			description: 'Search chips, image frame with caption, and mixed step statuses.'
		},
		{
			title: 'Basic',
			demo: demoBasic,
			code: usage,
			description: 'Minimal three-step pipeline with knowledge-base hits.'
		},
		{
			title: 'Statuses',
			demo: demoStatuses,
			code: usage,
			description: 'complete / active / pending tones on a generation pipeline.'
		},
		{
			title: 'Controlled',
			demo: demoControlled,
			code: codeControlled,
			description: 'bind:open driven from outside the chain.'
		},
		{
			title: 'Collapsed',
			demo: demoCollapsed,
			code: `<ChainOfThought.Root>\n  <ChainOfThought.Header />\n  …\n</ChainOfThought.Root>`,
			description: 'Closed by default; open to see staggered step entrance.'
		}
	]}
/>

## Props

### ChainOfThought.Root

<PropsTable props={rootProps} />

### ChainOfThought.Header

<PropsTable props={headerProps} />

### ChainOfThought.Step

<PropsTable props={stepProps} />

### ChainOfThought.Image

<PropsTable props={imageProps} />

`Content` forwards collapsible content props. `SearchResults` is a flex row wrapper; `SearchResult` is a secondary `Badge` (keeps badge skin via `data-slot="badge"`).

### Context

`getChainOfThoughtContext()` returns `{ isOpen, setIsOpen, toggle }`. Must be used under `Root`.

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--muted-foreground` | Header idle, complete steps, captions |
| `--foreground` | Header hover, active steps |
| `--border` | Vertical step connector |
| `--muted` | Image frame background |
| `--popover-foreground` | Content text |
| `--ring` | Header focus ring |
| Badge tokens | Search result chips |

</div>
