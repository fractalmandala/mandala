<script lang="ts">
	import * as Command from '$lib/components/command/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let open = $state(false);

	const rootProps: PropRow[] = [
		{
			name: 'value',
			type: 'string',
			default: '""',
			description: 'Bindable active search input query value.'
		},
		{
			name: 'api',
			type: 'CommandRootApi | null',
			default: 'null',
			description: 'Bindable command primitive API reference.'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;
	const usage = `<script lang="ts">
  import * as Command from "fractalsvelte/command";
<\/script>

<Command.Root style="max-width: 24rem; border: 1px solid var(--border);">
  <Command.Input placeholder="Type a command or search..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    <Command.Group heading="Suggestions">
      <Command.Item>Calendar</Command.Item>
      <Command.Item>Search Emoji</Command.Item>
      <Command.Item>Calculator</Command.Item>
    </Command.Group>
    <Command.Separator />
    <Command.Group heading="Settings">
      <Command.Item>Profile<Command.Shortcut>⌘P</Command.Shortcut></Command.Item>
      <Command.Item>Billing<Command.Shortcut>⌘B</Command.Shortcut></Command.Item>
      <Command.Item>Settings<Command.Shortcut>⌘S</Command.Shortcut></Command.Item>
    </Command.Group>
  </Command.List>
</Command.Root>`;
</script>

<h1 class="doc-title">Command</h1>
<p class="doc-lede">Fast, composable command menu component for filtering items and shortcuts.</p>

<Preview description="Command - menu" code={usage}>
	<div style="width: 100%; max-width: 24rem; margin-inline: auto; border: 1px solid var(--border); border-radius: var(--radius-4xl);">
		<Command.Root>
			<Command.Input placeholder="Type a command or search..." />
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>
				<Command.Group heading="Suggestions">
					<Command.Item>Calendar</Command.Item>
					<Command.Item>Search Emoji</Command.Item>
					<Command.Item>Calculator</Command.Item>
				</Command.Group>
				<Command.Separator />
				<Command.Group heading="Settings">
					<Command.Item>
						<span>Profile</span>
						<Command.Shortcut>⌘P</Command.Shortcut>
					</Command.Item>
					<Command.Item>
						<span>Billing</span>
						<Command.Shortcut>⌘B</Command.Shortcut>
					</Command.Item>
					<Command.Item>
						<span>Settings</span>
						<Command.Shortcut>⌘S</Command.Shortcut>
					</Command.Item>
				</Command.Group>
			</Command.List>
		</Command.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

## Usage

<CodeBlock code={usage} />

## Props

### Command.Root

<PropsTable props={rootProps} />
