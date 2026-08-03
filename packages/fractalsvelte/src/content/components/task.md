<script lang="ts">
	import * as Task from '$lib/components/ai-elements/task/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	type TaskLine =
		| { key: string; value: string }
		| { key: string; value: { type: 'file-read'; text: string; fileName: string } };

	const tasks: TaskLine[] = [
		{ key: '1', value: 'Searching "src/routes/+page.svelte, components structure"' },
		{ key: '2', value: { type: 'file-read', text: 'Read', fileName: '+page.svelte' } },
		{ key: '3', value: 'Scanning 47 files' },
		{ key: '4', value: 'Scanning 3 files' },
		{ key: '5', value: { type: 'file-read', text: 'Reading file', fileName: '+layout.svelte' } }
	];

	const triggerProps: PropRow[] = [
		{
			name: 'title',
			type: 'string',
			description: 'Default trigger label when no children are provided.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Optional custom trigger content (replaces search icon + title + chevron).'
		}
	];

	const rootProps: PropRow[] = [
		{
			name: 'open',
			type: 'boolean',
			default: 'true',
			description: 'Controlled open state (bindable).'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as Task from "fractalsvelte/ai-elements/task";
<\/script>

<Task.Root>
  <Task.Trigger title="Found project files" />
  <Task.Content>
    <Task.Item>Scanning 47 files</Task.Item>
    <Task.Item>
      Reading file
      <Task.ItemFile>+page.svelte</Task.ItemFile>
    </Task.Item>
  </Task.Content>
</Task.Root>`;
</script>

{#snippet svelteLogo()}
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 107 128" width="14" height="14" aria-hidden="true">
		<title>svelte</title>
		<path
			d="M94.157 22.819c-10.4-14.885-30.94-19.297-45.792-9.835L22.282 29.608A29.92 29.92 0 0 0 8.764 49.65a31.5 31.5 0 0 0 3.108 20.231 30 30 0 0 0-4.477 11.183 31.9 31.9 0 0 0 5.448 24.116c10.402 14.887 30.942 19.297 45.791 9.835l26.083-16.624A29.92 29.92 0 0 0 98.235 78.35a31.53 31.53 0 0 0-3.105-20.232 30 30 0 0 0 4.474-11.182 31.88 31.88 0 0 0-5.447-24.116"
			fill="#ff3e00"
		/>
		<path
			d="M45.817 106.582a20.72 20.72 0 0 1-22.237-8.243 19.17 19.17 0 0 1-3.277-14.503 18 18 0 0 1 .624-2.435l.49-1.498 1.337.981a33.6 33.6 0 0 0 10.203 5.098l.97.294-.09.968a5.85 5.85 0 0 0 1.052 3.878 6.24 6.24 0 0 0 6.695 2.485 5.8 5.8 0 0 0 1.603-.704L69.27 76.28a5.43 5.43 0 0 0 2.45-3.631 5.8 5.8 0 0 0-.987-4.371 6.24 6.24 0 0 0-6.698-2.487 5.7 5.7 0 0 0-1.6.704l-9.953 6.345a19 19 0 0 1-5.296 2.326 20.72 20.72 0 0 1-22.237-8.243 19.17 19.17 0 0 1-3.277-14.502 17.99 17.99 0 0 1 8.13-12.052l26.081-16.623a19 19 0 0 1 5.3-2.329 20.72 20.72 0 0 1 22.237 8.243 19.17 19.17 0 0 1 3.277 14.503 18 18 0 0 1-.624 2.435l-.49 1.498-1.337-.98a33.6 33.6 0 0 0-10.203-5.1l-.97-.294.09-.968a5.86 5.86 0 0 0-1.052-3.878 6.24 6.24 0 0 0-6.696-2.485 5.8 5.8 0 0 0-1.602.704L37.73 51.72a5.42 5.42 0 0 0-2.449 3.63 5.79 5.79 0 0 0 .986 4.372 6.24 6.24 0 0 0 6.698 2.486 5.8 5.8 0 0 0 1.602-.704l9.952-6.342a19 19 0 0 1 5.295-2.328 20.72 20.72 0 0 1 22.237 8.242 19.17 19.17 0 0 1 3.277 14.503 18 18 0 0 1-8.13 12.053l-26.081 16.622a19 19 0 0 1-5.3 2.328"
			fill="#fff"
		/>
	</svg>
{/snippet}

{#snippet demoFound()}
	<div style="width: 100%; max-width: 28rem; margin-inline: auto;">
		<Task.Root>
			<Task.Trigger title="Found project files" />
			<Task.Content>
				{#each tasks as task (task.key)}
					<Task.Item>
						{#if typeof task.value === 'string'}
							{task.value}
						{:else}
							<span style="display: inline-flex; align-items: center; gap: 0.25rem; flex-wrap: wrap;">
								{task.value.text}
								<Task.ItemFile>
									{@render svelteLogo()}
									<span>{task.value.fileName}</span>
								</Task.ItemFile>
							</span>
						{/if}
					</Task.Item>
				{/each}
			</Task.Content>
		</Task.Root>
	</div>
{/snippet}

{#snippet demoSimple()}
	<div style="width: 100%; max-width: 28rem; margin-inline: auto;">
		<Task.Root>
			<Task.Trigger title="Running checks" />
			<Task.Content>
				<Task.Item>Typecheck packages</Task.Item>
				<Task.Item>Lint ai-elements</Task.Item>
				<Task.Item>Build docs site</Task.Item>
			</Task.Content>
		</Task.Root>
	</div>
{/snippet}

{#snippet demoCollapsed()}
	<div style="width: 100%; max-width: 28rem; margin-inline: auto;">
		<Task.Root open={false}>
			<Task.Trigger title="Indexed workspace" />
			<Task.Content>
				<Task.Item>Cached 128 modules</Task.Item>
				<Task.Item>
					Updated
					<Task.ItemFile>tsconfig.json</Task.ItemFile>
				</Task.Item>
			</Task.Content>
		</Task.Root>
	</div>
{/snippet}

{#snippet demoCustom()}
	<div style="width: 100%; max-width: 28rem; margin-inline: auto;">
		<Task.Root>
			<Task.Trigger title="ignored when children set">
				<span style="font-weight: 500; color: var(--foreground);">Agent steps</span>
			</Task.Trigger>
			<Task.Content>
				<Task.Item>Custom trigger children replace the default search row.</Task.Item>
				<Task.Item>
					Opened
					<Task.ItemFile>Agents.md</Task.ItemFile>
				</Task.Item>
			</Task.Content>
		</Task.Root>
	</div>
{/snippet}

<h1 class="doc-title">Task</h1>
<p class="doc-lede">
	A collapsible log of agent work — search-style trigger, left-bordered steps, and inline file
	chips.
</p>

<Preview description="Found project files with file chips" code={usage}>
	{@render demoFound()}
</Preview>

## Installation

<CodeBlock code={codeInstall} lang="bash" />

Copy the `task/` folder, or import from the package:

<CodeBlock code={`import * as Task from "fractalsvelte/ai-elements/task";`} lang="ts" />

## Usage

<CodeBlock code={usage} />

`Task.Trigger` requires a `title` for the default layout (search icon + label + chevron). Pass
`children` to replace that entire row.

## Examples

<Examples
	items={[
		{
			title: 'File search',
			demo: demoFound,
			code: usage,
			description: 'Search-style trigger with file chips inline on steps.'
		},
		{
			title: 'Simple list',
			demo: demoSimple,
			code: usage,
			description: 'Plain step lines under a running-checks title.'
		},
		{
			title: 'Collapsed',
			demo: demoCollapsed,
			code: usage,
			description: 'open={false} until the user expands the log.'
		},
		{
			title: 'Custom trigger',
			demo: demoCustom,
			code: usage,
			description: 'Children replace the default search icon row.'
		}
	]}
/>


## Props

### Task

<PropsTable props={rootProps} />

### Task.Trigger

<PropsTable props={triggerProps} />

`Task.Item` and `Task.ItemFile` are presentational wrappers (`HTMLDivElement` props).

## Theming

| Token / slot | Role |
| --- | --- |
| `[data-slot=task]` | Collapsible root |
| `[data-slot=task-trigger]` | Quiet text trigger |
| `[data-slot=task-content-inner]` | Left-bordered step stack |
| `[data-slot=task-item]` | Muted step line |
| `[data-slot=task-item-file]` | Secondary file chip |
| `--muted`, `--secondary`, `--border`, `--muted-foreground` | Surface tokens |
