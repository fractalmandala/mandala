<script lang="ts">
	import * as Queue from '$lib/components/ai-elements/queue/index.js';
	import type { QueueMessage, QueueTodo } from '$lib/components/ai-elements/queue/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const sampleMessages: QueueMessage[] = [
		{ id: 'msg-1', parts: [{ type: 'text', text: 'How do I set up the project?' }] },
		{ id: 'msg-2', parts: [{ type: 'text', text: 'What is the roadmap for Q4?' }] },
		{
			id: 'msg-3',
			parts: [
				{ type: 'text', text: 'Update the default logo to this png.' },
				{
					type: 'file',
					url: 'https://github.com/haydenbleasel.png',
					filename: 'setup-guide.png',
					mediaType: 'image/png'
				}
			]
		},
		{ id: 'msg-4', parts: [{ type: 'text', text: 'Please generate a changelog.' }] },
		{ id: 'msg-5', parts: [{ type: 'text', text: 'Add dark mode support.' }] }
	];

	const sampleTodos: QueueTodo[] = [
		{
			id: 'todo-1',
			title: 'Write project documentation',
			description: 'Complete the README and API docs',
			status: 'completed'
		},
		{ id: 'todo-2', title: 'Implement authentication', status: 'pending' },
		{
			id: 'todo-3',
			title: 'Fix bug #42',
			description: 'Resolve crash on settings page',
			status: 'pending'
		},
		{
			id: 'todo-4',
			title: 'Refactor queue logic',
			description: 'Unify queue and todo state management',
			status: 'pending'
		}
	];

	let messages = $state([...sampleMessages]);
	let todos = $state([...sampleTodos]);

	function handleRemoveMessage(id: string) {
		messages = messages.filter((m) => m.id !== id);
	}

	function handleRemoveTodo(id: string) {
		todos = todos.filter((t) => t.id !== id);
	}

	function handleSendNow(id: string) {
		handleRemoveMessage(id);
	}

	function summaryFor(message: QueueMessage) {
		const text = message.parts
			.filter((p) => p.type === 'text')
			.map((p) => p.text ?? '')
			.join(' ')
			.trim();
		return text || '(queued message)';
	}

	const sectionLabelProps: PropRow[] = [
		{ name: 'label', type: 'string', description: 'Section title text (required).' },
		{ name: 'count', type: 'number', description: 'Optional count rendered before the label.' },
		{ name: 'icon', type: 'Snippet', description: 'Optional leading icon after the chevron.' }
	];

	const indicatorProps: PropRow[] = [
		{
			name: 'completed',
			type: 'boolean',
			default: 'false',
			description: 'Filled/muted indicator for done items.'
		}
	];

	const contentProps: PropRow[] = [
		{
			name: 'completed',
			type: 'boolean',
			default: 'false',
			description: 'Mutes and strikes through the line.'
		}
	];

	const actionProps: PropRow[] = [
		{
			name: 'variant / size',
			type: 'Button props',
			default: 'ghost / icon',
			description: 'Forwarded to Button; keeps full button skin (data-slot=button).'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as Queue from "fractalsvelte/ai-elements/queue";
<\/script>

<Queue.Root>
  <Queue.Section>
    <Queue.SectionTrigger>
      <Queue.SectionLabel count={3} label="Queued" />
    </Queue.SectionTrigger>
    <Queue.SectionContent>
      <Queue.List>
        <Queue.Item>
          <div data-slot="queue-item-row">
            <Queue.ItemIndicator />
            <Queue.ItemContent>How do I set up the project?</Queue.ItemContent>
            <Queue.ItemActions>
              <Queue.ItemAction aria-label="Remove">…</Queue.ItemAction>
            </Queue.ItemActions>
          </div>
        </Queue.Item>
      </Queue.List>
    </Queue.SectionContent>
  </Queue.Section>
</Queue.Root>`;
</script>

{#snippet iconTrash()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M3 6h18" />
		<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
		<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
	</svg>
{/snippet}

{#snippet iconSend()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="m5 12 7-7 7 7" />
		<path d="M12 19V5" />
	</svg>
{/snippet}

{#snippet demoFull()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto;">
		{#if messages.length > 0 || todos.length > 0}
			<Queue.Root>
				{#if messages.length > 0}
					<Queue.Section>
						<Queue.SectionTrigger>
							<Queue.SectionLabel count={messages.length} label="Queued" />
						</Queue.SectionTrigger>
						<Queue.SectionContent>
							<Queue.List>
								{#each messages as message (message.id)}
									{@const hasFiles = message.parts.some((p) => p.type === 'file' && p.url)}
									<Queue.Item>
										<div data-slot="queue-item-row">
											<Queue.ItemIndicator />
											<Queue.ItemContent>{summaryFor(message)}</Queue.ItemContent>
											<Queue.ItemActions>
												<Queue.ItemAction
													aria-label="Remove from queue"
													title="Remove from queue"
													onclick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleRemoveMessage(message.id);
													}}
												>
													{@render iconTrash()}
												</Queue.ItemAction>
												<Queue.ItemAction
													aria-label="Send now"
													title="Send now"
													onclick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleSendNow(message.id);
													}}
												>
													{@render iconSend()}
												</Queue.ItemAction>
											</Queue.ItemActions>
										</div>
										{#if hasFiles}
											<Queue.ItemAttachment>
												{#each message.parts.filter((p) => p.type === 'file' && p.url) as file (file.url)}
													{#if file.mediaType?.startsWith('image/') && file.url}
														<Queue.ItemImage alt={file.filename || 'attachment'} src={file.url} />
													{:else}
														<Queue.ItemFile>{file.filename || 'file'}</Queue.ItemFile>
													{/if}
												{/each}
											</Queue.ItemAttachment>
										{/if}
									</Queue.Item>
								{/each}
							</Queue.List>
						</Queue.SectionContent>
					</Queue.Section>
				{/if}

				{#if todos.length > 0}
					<Queue.Section>
						<Queue.SectionTrigger>
							<Queue.SectionLabel count={todos.length} label="Todo" />
						</Queue.SectionTrigger>
						<Queue.SectionContent>
							<Queue.List>
								{#each todos as todo (todo.id)}
									{@const isCompleted = todo.status === 'completed'}
									<Queue.Item>
										<div data-slot="queue-item-row">
											<Queue.ItemIndicator completed={isCompleted} />
											<Queue.ItemContent completed={isCompleted}>{todo.title}</Queue.ItemContent>
											<Queue.ItemActions>
												<Queue.ItemAction
													aria-label="Remove todo"
													onclick={() => handleRemoveTodo(todo.id)}
												>
													{@render iconTrash()}
												</Queue.ItemAction>
											</Queue.ItemActions>
										</div>
										{#if todo.description}
											<Queue.ItemDescription completed={isCompleted}>
												{todo.description}
											</Queue.ItemDescription>
										{/if}
									</Queue.Item>
								{/each}
							</Queue.List>
						</Queue.SectionContent>
					</Queue.Section>
				{/if}
			</Queue.Root>
		{:else}
			<p style="color: var(--muted-foreground); font-size: var(--text-sm); text-align: center;">
				Queue empty — reload the page to reset the demo.
			</p>
		{/if}
	</div>
{/snippet}

{#snippet demoTodos()}
	<div style="width: 100%; max-width: 28rem; margin-inline: auto;">
		<Queue.Root>
			<Queue.Section open>
				<Queue.SectionTrigger>
					<Queue.SectionLabel count={3} label="Todo" />
				</Queue.SectionTrigger>
				<Queue.SectionContent>
					<Queue.List>
						<Queue.Item>
							<div data-slot="queue-item-row">
								<Queue.ItemIndicator completed />
								<Queue.ItemContent completed>Scaffold package</Queue.ItemContent>
							</div>
							<Queue.ItemDescription completed>Init repo and exports</Queue.ItemDescription>
						</Queue.Item>
						<Queue.Item>
							<div data-slot="queue-item-row">
								<Queue.ItemIndicator />
								<Queue.ItemContent>Write component docs</Queue.ItemContent>
							</div>
							<Queue.ItemDescription>Usage, examples, props</Queue.ItemDescription>
						</Queue.Item>
						<Queue.Item>
							<div data-slot="queue-item-row">
								<Queue.ItemIndicator />
								<Queue.ItemContent>Ship v0.1</Queue.ItemContent>
							</div>
						</Queue.Item>
					</Queue.List>
				</Queue.SectionContent>
			</Queue.Section>
		</Queue.Root>
	</div>
{/snippet}

{#snippet demoCollapsed()}
	<div style="width: 100%; max-width: 28rem; margin-inline: auto;">
		<Queue.Root>
			<Queue.Section open={false}>
				<Queue.SectionTrigger>
					<Queue.SectionLabel count={2} label="Queued" />
				</Queue.SectionTrigger>
				<Queue.SectionContent>
					<Queue.List>
						<Queue.Item>
							<div data-slot="queue-item-row">
								<Queue.ItemIndicator />
								<Queue.ItemContent>Draft release notes</Queue.ItemContent>
							</div>
						</Queue.Item>
						<Queue.Item>
							<div data-slot="queue-item-row">
								<Queue.ItemIndicator />
								<Queue.ItemContent>Review pull request</Queue.ItemContent>
							</div>
						</Queue.Item>
					</Queue.List>
				</Queue.SectionContent>
			</Queue.Section>
		</Queue.Root>
	</div>
{/snippet}

{#snippet demoAttachments()}
	<div style="width: 100%; max-width: 28rem; margin-inline: auto;">
		<Queue.Root>
			<Queue.Section>
				<Queue.SectionTrigger>
					<Queue.SectionLabel count={1} label="Queued" />
				</Queue.SectionTrigger>
				<Queue.SectionContent>
					<Queue.List>
						<Queue.Item>
							<div data-slot="queue-item-row">
								<Queue.ItemIndicator />
								<Queue.ItemContent>Attach brand assets</Queue.ItemContent>
							</div>
							<Queue.ItemAttachment>
								<Queue.ItemImage
									alt="avatar"
									src="https://github.com/haydenbleasel.png"
								/>
								<Queue.ItemFile>brand-guide.pdf</Queue.ItemFile>
							</Queue.ItemAttachment>
						</Queue.Item>
					</Queue.List>
				</Queue.SectionContent>
			</Queue.Section>
		</Queue.Root>
	</div>
{/snippet}

<h1 class="doc-title">Queue</h1>
<p class="doc-lede">
	Collapsible sections for queued messages and todos — scrollable lists, completed states,
	attachments, and hover actions.
</p>

<Preview description="Queued messages + todos with remove / send actions" code={usage}>
	{@render demoFull()}
</Preview>

## Installation

Install the package (and bits-ui if you are not already using fractalsvelte collapsibles):

<CodeBlock code={codeInstall} lang="bash" />

Copy the `queue/` folder from the library into your project, or import from the package:

<CodeBlock
	code={`import * as Queue from "fractalsvelte/ai-elements/queue";`}
	lang="ts"
/>

## Usage

<CodeBlock code={usage} />

Use `data-slot="queue-item-row"` on the horizontal row that holds the indicator, content, and
actions — the stylesheet lays it out as a flex row and reveals actions on hover.

## Examples

<Examples
	items={[
		{
			title: 'Full queue',
			demo: demoFull,
			code: usage,
			description: 'Queued messages and todos with remove / send actions and attachments.'
		},
		{
			title: 'Todos',
			demo: demoTodos,
			code: usage,
			description: 'Completed vs pending indicator and strike-through content.'
		},
		{
			title: 'Collapsed',
			demo: demoCollapsed,
			code: usage,
			description: 'Section starts closed; chevron points right.'
		},
		{
			title: 'Attachments',
			demo: demoAttachments,
			code: usage,
			description: 'Image thumbnails and file chips under a queued item.'
		}
	]}
/>


## Props

### Queue.SectionLabel

<PropsTable props={sectionLabelProps} />

### Queue.ItemIndicator / ItemContent / ItemDescription

<PropsTable props={indicatorProps} />

`ItemContent` and `ItemDescription` share the same `completed` flag:

<PropsTable props={contentProps} />

### Queue.ItemAction

<PropsTable props={actionProps} />

`Queue.List` forwards props to `ScrollArea` (`maxHeight` defaults to `10rem`).
`Queue.Section` is a collapsible root (`open` bindable, default `true`).

## Theming

| Token / slot | Role |
| --- | --- |
| `[data-slot=queue]` | Bordered panel shell |
| `[data-slot=queue-section-trigger]` | Muted section header (overrides collapsible-trigger) |
| `[data-slot=queue-item]` | List row; hover background + action reveal |
| `[data-slot=queue-item-row]` | Flex row for indicator / content / actions |
| `[data-slot=queue-item-indicator][data-completed]` | Done state circle |
| `[data-slot=button][data-queue-item-action]` | Dense ghost action (keeps button skin) |
| `[data-slot=queue-item-file]` | File chip with paperclip glyph |
| `--border`, `--muted`, `--muted-foreground`, `--background`, `--radius` | Surface tokens |
