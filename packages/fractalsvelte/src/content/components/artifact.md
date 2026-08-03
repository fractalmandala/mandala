<script lang="ts">
	import * as Artifact from '$lib/components/ai-elements/artifact/index.js';
	import * as Code from '$lib/components/ai-elements/code/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const sampleCode = `export function Chart() {
  return (
    <div className="chart">
      <h2>Weekly active users</h2>
      {/* chart body */}
    </div>
  );
}`;

	const actionProps: PropRow[] = [
		{ name: 'tooltip', type: 'string', description: 'Shown in a tooltip on hover/focus.' },
		{ name: 'label', type: 'string', description: 'Accessible label (sr-only). Defaults to tooltip.' },
		{ name: 'icon', type: 'Snippet', description: 'Optional icon snippet; children work the same way.' },
		{ name: 'variant / size', type: 'Button props', default: 'ghost / icon-sm', description: 'Forwarded to Button; keeps data-slot=button.' }
	];

	const closeProps: PropRow[] = [
		{ name: 'variant / size', type: 'Button props', default: 'ghost / icon-sm', description: 'Default close glyph when children omitted.' }
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as Artifact from "fractalsvelte/ai-elements/artifact";
<\/script>

<Artifact.Root>
  <Artifact.Header>
    <div>
      <Artifact.Title>chart.tsx</Artifact.Title>
      <Artifact.Description>React component for analytics chart</Artifact.Description>
    </div>
    <Artifact.Actions>
      <Artifact.Action tooltip="Copy" label="Copy">{/* icon */}</Artifact.Action>
      <Artifact.Close />
    </Artifact.Actions>
  </Artifact.Header>
  <Artifact.Content>
    {/* code, iframe, markdown, … */}
  </Artifact.Content>
</Artifact.Root>`;
</script>

{#snippet iconCopy()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
{/snippet}

{#snippet iconDownload()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
{/snippet}

{#snippet demoBasic()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto;">
		<Artifact.Root>
			<Artifact.Header>
				<div>
					<Artifact.Title>chart.tsx</Artifact.Title>
					<Artifact.Description>React component for analytics chart</Artifact.Description>
				</div>
				<Artifact.Actions>
					<Artifact.Action tooltip="Copy code" label="Copy" onclick={() => navigator.clipboard?.writeText(sampleCode)}>
						{@render iconCopy()}
					</Artifact.Action>
					<Artifact.Close />
				</Artifact.Actions>
			</Artifact.Header>
			<Artifact.Content>
				<pre style="margin:0;font-size:0.875rem;white-space:pre-wrap;"><code>{sampleCode}</code></pre>
			</Artifact.Content>
		</Artifact.Root>
	</div>
{/snippet}

{#snippet demoWithCode()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto;">
		<Artifact.Root>
			<Artifact.Header>
				<div>
					<Artifact.Title>Counter.svelte</Artifact.Title>
					<Artifact.Description>Svelte 5 runes example</Artifact.Description>
				</div>
				<Artifact.Actions>
					<Artifact.Action tooltip="Download" label="Download">{@render iconDownload()}</Artifact.Action>
					<Artifact.Action tooltip="Copy" label="Copy">{@render iconCopy()}</Artifact.Action>
					<Artifact.Close />
				</Artifact.Actions>
			</Artifact.Header>
			<Artifact.Content style="padding: 0;">
				<Code.Root
					code={`<script lang="ts">
  let count = $state(0);
<\/script>

<button onclick={() => count++}>
  Clicked {count} times
</button>`}
					lang="svelte"
				>
					<Code.CopyButton />
				</Code.Root>
			</Artifact.Content>
		</Artifact.Root>
	</div>
{/snippet}

{#snippet demoDoc()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto;">
		<Artifact.Root>
			<Artifact.Header>
				<div>
					<Artifact.Title>Release notes</Artifact.Title>
					<Artifact.Description>Markdown artifact preview</Artifact.Description>
				</div>
				<Artifact.Actions>
					<Artifact.Close />
				</Artifact.Actions>
			</Artifact.Header>
			<Artifact.Content>
				<p style="margin: 0 0 0.5rem; font-size: var(--text-sm);">
					<strong>v0.3</strong> ships stick-to-bottom conversations, denser message actions, and artifact panels for generated files.
				</p>
				<ul style="margin: 0; padding-left: 1.25rem; font-size: var(--text-sm); color: var(--muted-foreground);">
					<li>Header + actions chrome</li>
					<li>Scrollable content region</li>
					<li>Works with Code, iframe, prose</li>
				</ul>
			</Artifact.Content>
		</Artifact.Root>
	</div>
{/snippet}

<h1 class="doc-title">Artifact</h1>
<p class="doc-lede">
	Shell for AI-generated artifacts — code files, documents, previews. Header with title/description, action buttons with tooltips, close control, and a scrollable content body.
</p>

<Preview description="Artifact with title, actions, and body" code={usage}>
	{@render demoBasic()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/artifact/`. UI deps: `button`, `tooltip`.

## Usage

<CodeBlock code={usage} lang="svelte" />

`Action` keeps `data-slot=button` and adds `data-artifact-action`. Prefer inline SVG children for icons.

## Examples

<Examples
	items={[
		{ title: 'Basic', demo: demoBasic },
		{ title: 'With Code', demo: demoWithCode },
		{ title: 'Document', demo: demoDoc }
	]}
/>

## Props

### Artifact.Action

<PropsTable props={actionProps} />

### Artifact.Close

<PropsTable props={closeProps} />

Root, Header, Title, Description, Actions, and Content accept standard HTML attributes + children.

## Theming

- Shell: `var(--background)`, `var(--border)`, `+radius('lg')`, light shadow
- Header: muted wash `color-mix(…, var(--muted) 50%, transparent)`
- Actions: muted → foreground on hover via `[data-artifact-action]` / `[data-artifact-close]`
