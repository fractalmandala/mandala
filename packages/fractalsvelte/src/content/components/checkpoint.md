<script lang="ts">
	import * as Checkpoint from '$lib/components/ai-elements/checkpoint/index.js';
	import * as Message from '$lib/components/ai-elements/message/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	type ChatMessage = {
		id: string;
		role: 'user' | 'assistant';
		content: string;
	};

	const initialMessages: ChatMessage[] = [
		{ id: '1', role: 'user', content: 'What is Svelte?' },
		{
			id: '2',
			role: 'assistant',
			content:
				'Svelte is a modern JavaScript framework for building user interfaces. It is known for its small bundle size and high performance.'
		},
		{ id: '3', role: 'user', content: 'What are the benefits of using Svelte?' },
		{
			id: '4',
			role: 'assistant',
			content:
				'Compile-time reactivity, tiny bundles, less boilerplate, and excellent DX for design systems.'
		}
	];

	let messages = $state<ChatMessage[]>([...initialMessages]);
	const checkpoints = [{ messageCount: 2, label: 'After intro' }];

	function handleRestore(messageCount: number) {
		messages = initialMessages.slice(0, messageCount);
	}

	function resetChat() {
		messages = [...initialMessages];
	}

	const triggerProps: PropRow[] = [
		{
			name: 'tooltip',
			type: 'string',
			description: 'Optional tooltip text on hover.'
		},
		{
			name: 'variant / size',
			type: 'Button props',
			default: 'ghost / sm',
			description: 'Forwarded to Button; keeps full button skin.'
		}
	];

	const iconProps: PropRow[] = [
		{
			name: 'size',
			type: 'number',
			default: '16',
			description: 'Pixel size of the default bookmark glyph.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Optional custom icon content.'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as Checkpoint from "fractalsvelte/ai-elements/checkpoint";
<\/script>

<Checkpoint.Root>
  <Checkpoint.Icon />
  <Checkpoint.Trigger
    tooltip="Restores workspace and chat to this point"
    onclick={() => restore()}
  >
    Restore checkpoint
  </Checkpoint.Trigger>
</Checkpoint.Root>`;
</script>

{#snippet demoChat()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto; display: flex; flex-direction: column; gap: 1rem;">
		{#each messages as message, index (message.id)}
			<Message.Root from={message.role}>
				<Message.Content>{message.content}</Message.Content>
			</Message.Root>

			{#each checkpoints as checkpoint (checkpoint.label)}
				{#if checkpoint.messageCount === index + 1}
					<Checkpoint.Root>
						<Checkpoint.Icon />
						<Checkpoint.Trigger
							onclick={() => handleRestore(checkpoint.messageCount)}
							tooltip="Restores workspace and chat to this point"
						>
							Restore checkpoint
						</Checkpoint.Trigger>
					</Checkpoint.Root>
				{/if}
			{/each}
		{/each}

		{#if messages.length < initialMessages.length}
			<button
				type="button"
				style="align-self: flex-start; font-size: var(--text-sm); color: var(--primary); background: none; border: none; cursor: pointer; padding: 0;"
				onclick={resetChat}
			>
				Reset demo conversation
			</button>
		{/if}
	</div>
{/snippet}

{#snippet demoBasic()}
	<div style="width: 100%; max-width: 28rem; margin-inline: auto;">
		<Checkpoint.Root>
			<Checkpoint.Icon />
			<Checkpoint.Trigger tooltip="Restore version 3">
				v3.0 — Add authentication
			</Checkpoint.Trigger>
		</Checkpoint.Root>
	</div>
{/snippet}

{#snippet demoMultiple()}
	<div style="width: 100%; max-width: 28rem; margin-inline: auto; display: flex; flex-direction: column; gap: 0.75rem;">
		<Checkpoint.Root>
			<Checkpoint.Icon />
			<Checkpoint.Trigger tooltip="Start of session">Session start</Checkpoint.Trigger>
		</Checkpoint.Root>
		<Checkpoint.Root>
			<Checkpoint.Icon />
			<Checkpoint.Trigger tooltip="After scaffolding">Scaffold complete</Checkpoint.Trigger>
		</Checkpoint.Root>
		<Checkpoint.Root>
			<Checkpoint.Icon />
			<Checkpoint.Trigger tooltip="Before refactor">Pre-refactor</Checkpoint.Trigger>
		</Checkpoint.Root>
	</div>
{/snippet}

{#snippet demoCustomIcon()}
	<div style="width: 100%; max-width: 28rem; margin-inline: auto;">
		<Checkpoint.Root>
			<Checkpoint.Icon>
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
					<path d="M12 8v4l3 3" />
					<circle cx="12" cy="12" r="10" />
				</svg>
			</Checkpoint.Icon>
			<Checkpoint.Trigger>Custom icon + restore</Checkpoint.Trigger>
		</Checkpoint.Root>
	</div>
{/snippet}

<h1 class="doc-title">Checkpoint</h1>
<p class="doc-lede">
	An inline history milestone — bookmark icon, restore trigger, and a trailing separator that
	spans the remaining width.
</p>

<Preview description="Checkpoint in a short chat thread" code={usage}>
	{@render demoChat()}
</Preview>

## Installation

<CodeBlock code={codeInstall} lang="bash" />

Copy the `checkpoint/` folder, or import from the package:

<CodeBlock
	code={`import * as Checkpoint from "fractalsvelte/ai-elements/checkpoint";`}
	lang="ts"
/>

## Usage

<CodeBlock code={usage} />

The root always appends a `Separator` after its children so the rule lines up with the trigger.

## Examples

<Examples
	items={[
		{
			title: 'In conversation',
			demo: demoChat,
			code: usage,
			description: 'Restore trims the thread back to the checkpoint.'
		},
		{
			title: 'Basic',
			demo: demoBasic,
			code: usage,
			description: 'Icon + labeled trigger + trailing separator.'
		},
		{
			title: 'Stack',
			demo: demoMultiple,
			code: usage,
			description: 'Multiple milestones stacked in a timeline.'
		},
		{
			title: 'Custom icon',
			demo: demoCustomIcon,
			code: usage,
			description: 'Icon children replace the default bookmark glyph.'
		}
	]}
/>


## Props

### Checkpoint.Trigger

<PropsTable props={triggerProps} />

### Checkpoint.Icon

<PropsTable props={iconProps} />

## Theming

| Token / slot | Role |
| --- | --- |
| `[data-slot=checkpoint]` | Flex row shell |
| `[data-slot=checkpoint-icon]` | Leading glyph |
| `[data-slot=button][data-checkpoint-trigger]` | Restore control (keeps button skin) |
| `[data-slot=separator][data-checkpoint-separator]` | Flex-grow hairline |
| `--muted-foreground`, `--border` | Colour tokens |
