<script lang="ts">
	import * as WebPreview from '$lib/components/ai-elements/web-preview/index.js';
	import type { LogEntry } from '$lib/components/ai-elements/web-preview/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let currentUrl = $state('https://svelte.dev');

	const sampleLogs: LogEntry[] = [
		{
			level: 'log',
			message: 'Page loaded successfully',
			timestamp: new Date(Date.now() - 10000)
		},
		{
			level: 'warn',
			message: 'Warning: Deprecated API used',
			timestamp: new Date(Date.now() - 5000)
		},
		{
			level: 'error',
			message: 'Error: Failed to load resource',
			timestamp: new Date()
		}
	];

	const rootProps: PropRow[] = [
		{ name: 'defaultUrl', type: 'string', default: '""', description: 'Initial iframe URL.' },
		{ name: 'onUrlChange', type: '(url: string) => void', description: 'Fires when the URL is committed (Enter in Url).' },
		{ name: 'children', type: 'Snippet', description: 'Navigation, Body, Console, …' }
	];

	const bodyProps: PropRow[] = [
		{ name: 'src', type: 'string', description: 'Override iframe src; falls back to context URL.' },
		{ name: 'loading', type: 'Snippet', description: 'Optional overlay while loading.' }
	];

	const consoleProps: PropRow[] = [
		{ name: 'logs', type: 'LogEntry[]', description: '{ level, message, timestamp }[] — log | warn | error.' }
	];

	const navBtnProps: PropRow[] = [
		{ name: 'tooltip', type: 'string', description: 'Tooltip label for the icon button.' }
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as WebPreview from "fractalsvelte/ai-elements/web-preview";
<\/script>

<WebPreview.Root defaultUrl="https://svelte.dev" onUrlChange={(url) => {}}>
  <WebPreview.Navigation>
    <WebPreview.NavigationButton tooltip="Back">…</WebPreview.NavigationButton>
    <WebPreview.NavigationButton tooltip="Forward">…</WebPreview.NavigationButton>
    <WebPreview.NavigationButton tooltip="Refresh">…</WebPreview.NavigationButton>
    <WebPreview.Url />
    <WebPreview.NavigationButton tooltip="Open">…</WebPreview.NavigationButton>
  </WebPreview.Navigation>
  <WebPreview.Body />
  <WebPreview.Console logs={sampleLogs} />
</WebPreview.Root>`;
</script>

{#snippet iconBack()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
{/snippet}
{#snippet iconForward()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
{/snippet}
{#snippet iconRefresh()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
{/snippet}
{#snippet iconExternal()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
{/snippet}

{#snippet demoFull()}
	<div style="width: 100%; max-width: 48rem; margin-inline: auto; height: 28rem;">
		<WebPreview.Root defaultUrl={currentUrl} onUrlChange={(url) => (currentUrl = url)} style="height: 100%;">
			<WebPreview.Navigation>
				<WebPreview.NavigationButton tooltip="Go Back" onclick={() => {}}>
					{@render iconBack()}
				</WebPreview.NavigationButton>
				<WebPreview.NavigationButton tooltip="Go Forward" onclick={() => {}}>
					{@render iconForward()}
				</WebPreview.NavigationButton>
				<WebPreview.NavigationButton tooltip="Refresh" onclick={() => {}}>
					{@render iconRefresh()}
				</WebPreview.NavigationButton>
				<WebPreview.Url bind:value={currentUrl} />
				<WebPreview.NavigationButton
					tooltip="Open in New Tab"
					onclick={() => {
						if (currentUrl) window.open(currentUrl, '_blank');
					}}
				>
					{@render iconExternal()}
				</WebPreview.NavigationButton>
			</WebPreview.Navigation>
			<WebPreview.Body />
			<WebPreview.Console logs={sampleLogs} />
		</WebPreview.Root>
	</div>
{/snippet}

{#snippet demoBare()}
	<div style="width: 100%; max-width: 48rem; margin-inline: auto; height: 20rem;">
		<WebPreview.Root defaultUrl="https://svelte.dev" style="height: 100%;">
			<WebPreview.Navigation>
				<WebPreview.Url />
			</WebPreview.Navigation>
			<WebPreview.Body />
		</WebPreview.Root>
	</div>
{/snippet}

<h1 class="doc-title">Web Preview</h1>
<p class="doc-lede">
	Embeddable browser chrome for AI sandboxes — navigation bar with tooltip icon buttons, URL field, sandboxed iframe, and collapsible console with log levels.
</p>

<Preview description="Full preview with nav, iframe, and console logs" code={usage}>
	{@render demoFull()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/web-preview/`. UI deps: `button`, `tooltip`, `collapsible`.

## Usage

<CodeBlock code={usage} lang="svelte" />

Press Enter in `Url` to commit a navigation. `NavigationButton` keeps `data-slot=button` and adds `data-web-preview-nav-button`. Icons are yours (inline SVG recommended).

## Examples

<Examples
	items={[
		{ title: 'Full chrome', demo: demoFull },
		{ title: 'URL + body', demo: demoBare }
	]}
/>

## Props

### WebPreview.Root

<PropsTable props={rootProps} />

### WebPreview.Body

<PropsTable props={bodyProps} />

### WebPreview.Console

<PropsTable props={consoleProps} />

### WebPreview.NavigationButton

<PropsTable props={navBtnProps} />

## Theming

- Shell: card surface, border, `+radius('lg')`
- Nav bar: muted wash
- Console: monospace, level colors (destructive / warn / foreground)
- Chevron rotates when console is open via `data-open`
