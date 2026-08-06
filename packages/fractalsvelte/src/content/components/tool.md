<script lang="ts">
	import * as Tool from '$lib/components/ai-elements/tool/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const success = {
		type: 'web_search',
		state: 'output-available' as const,
		input: {
			query: 'latest AI developments 2024',
			count: 5,
			language: 'en'
		},
		output: {
			results: [
				{
					title: 'Revolutionary AI Breakthrough in 2024',
					url: 'https://example.com/ai-breakthrough-2024',
					snippet: 'Scientists have achieved a major milestone in artificial intelligence…'
				},
				{
					title: 'The Future of Machine Learning',
					url: 'https://example.com/ml-future',
					snippet: 'New research shows promising developments in neural networks…'
				}
			],
			total_results: 147
		}
	};

	const errorTool = {
		type: 'database_query',
		state: 'output-error' as const,
		input: {
			query: "SELECT * FROM users WHERE invalid_column = 'test'",
			database: 'production'
		},
		errorText: "SQL Error: Column 'invalid_column' doesn't exist in table 'users'"
	};

	const loading = {
		type: 'api_call',
		state: 'input-available' as const,
		input: {
			endpoint: '/api/v1/data',
			method: 'GET',
			headers: { Authorization: 'Bearer …', 'Content-Type': 'application/json' }
		}
	};

	const pending = {
		type: 'file_analyzer',
		state: 'input-streaming' as const,
		input: {
			file_path: '/documents/report.pdf',
			analysis_type: 'summarization'
		}
	};

	const rootProps: PropRow[] = [
		{
			name: 'open',
			type: 'boolean',
			default: 'false',
			description: 'Controlled open state (bindable Collapsible).'
		},
		{ name: 'children', type: 'Snippet', description: 'Header + Content.' }
	];

	const headerProps: PropRow[] = [
		{ name: 'type', type: 'string', description: 'Tool name shown in the header (e.g. web_search).' },
		{
			name: 'state',
			type: '"input-streaming" | "input-available" | "output-available" | "output-error"',
			description: 'Drives status badge label, icon, and pulse/error tone.'
		}
	];

	const inputProps: PropRow[] = [
		{ name: 'input', type: 'unknown', description: 'Tool parameters — stringified as pretty JSON in a Code block.' }
	];

	const outputProps: PropRow[] = [
		{
			name: 'output',
			type: 'unknown',
			description: 'Tool result. Objects/strings render as Code (JSON); other values as text.'
		},
		{
			name: 'errorText',
			type: 'string',
			description: 'When set, shows an error frame instead of output.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Custom result body (overrides default Code rendering when no error).'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as Tool from "fractalsvelte/ai-elements/tool";
<\/script>

<Tool.Root open>
  <Tool.Header type="web_search" state="output-available" />
  <Tool.Content>
    <Tool.Input input={{ query: "svelte 5", count: 5 }} />
    <Tool.Output output={{ results: [] }} />
  </Tool.Content>
</Tool.Root>`;

	const codeStates = `<!-- Pending -->
<Tool.Header type="file_analyzer" state="input-streaming" />
<!-- Running -->
<Tool.Header type="api_call" state="input-available" />
<!-- Completed -->
<Tool.Header type="web_search" state="output-available" />
<!-- Error -->
<Tool.Header type="database_query" state="output-error" />`;
</script>

{#snippet demoSuccess()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto;">
		<Tool.Root open>
			<Tool.Header type={success.type} state={success.state} />
			<Tool.Content>
				<Tool.Input input={success.input} />
				<Tool.Output output={success.output} />
			</Tool.Content>
		</Tool.Root>
	</div>
{/snippet}

{#snippet demoStates()}
	<div style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 36rem; margin-inline: auto;">
		<Tool.Root open>
			<Tool.Header type={pending.type} state={pending.state} />
			<Tool.Content>
				<Tool.Input input={pending.input} />
			</Tool.Content>
		</Tool.Root>
		<Tool.Root open>
			<Tool.Header type={loading.type} state={loading.state} />
			<Tool.Content>
				<Tool.Input input={loading.input} />
			</Tool.Content>
		</Tool.Root>
		<Tool.Root open>
			<Tool.Header type={success.type} state={success.state} />
			<Tool.Content>
				<Tool.Input input={success.input} />
				<Tool.Output output={success.output} />
			</Tool.Content>
		</Tool.Root>
		<Tool.Root open>
			<Tool.Header type={errorTool.type} state={errorTool.state} />
			<Tool.Content>
				<Tool.Input input={errorTool.input} />
				<Tool.Output errorText={errorTool.errorText} />
			</Tool.Content>
		</Tool.Root>
	</div>
{/snippet}

{#snippet demoError()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto;">
		<Tool.Root open>
			<Tool.Header type={errorTool.type} state={errorTool.state} />
			<Tool.Content>
				<Tool.Input input={errorTool.input} />
				<Tool.Output errorText={errorTool.errorText} />
			</Tool.Content>
		</Tool.Root>
	</div>
{/snippet}

<h1 class="doc-title">Tool</h1>
<p class="doc-lede">
	Collapsible panel for an AI tool call — header with status badge (Pending / Running / Completed / Error), pretty-printed JSON input, and output as a syntax-highlighted <code>Code</code> block or error text.
</p>

<Preview description="Completed web_search tool with parameters and results" code={usage}>
	{@render demoSuccess()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/tool/`. It composes the `collapsible`, `badge`, and `code` ai-element.

## Usage

<CodeBlock code={usage} lang="svelte" />

Compose `Root` → `Header` + `Content` → optional `Input` / `Output`. Status icons are inline SVG (no icon package). Open state is a bindable Collapsible.

## Examples

<Examples
	items={[
		{ title: 'Completed', demo: demoSuccess },
		{ title: 'All states', demo: demoStates },
		{ title: 'Error', demo: demoError }
	]}
/>

## Props

### Tool.Root

<PropsTable props={rootProps} />

### Tool.Header

<PropsTable props={headerProps} />

### Tool.Input

<PropsTable props={inputProps} />

### Tool.Output

<PropsTable props={outputProps} />

## Theming

- Frame: `var(--border)`, `var(--background)`, radius via `+radius('md')`
- Section labels: `var(--muted-foreground)` uppercase tracking
- Status: pulse on Running; green on Completed; `var(--destructive)` on Error
- Code frames: `color-mix(…, var(--muted) 50%, transparent)`

## Status map

<CodeBlock code={codeStates} lang="svelte" />
