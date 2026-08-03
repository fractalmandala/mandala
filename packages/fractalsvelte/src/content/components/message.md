<script lang="ts">
	import * as Message from '$lib/components/ai-elements/message/index.js';
	import { Button } from '$lib/components/button/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';
	import type { MessageVersion } from '$lib/components/ai-elements/message/index.js';

	let copied = $state(false);
	let attachments = $state([
		{
			type: 'file' as const,
			url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=720&fit=crop',
			mediaType: 'image/jpeg',
			filename: 'dashboard-review.jpg'
		},
		{
			type: 'file' as const,
			mediaType: 'application/pdf',
			filename: 'release-notes.pdf'
		}
	]);

	const branchVersions: MessageVersion[] = [
		{
			id: 'intro-short',
			content: `## Option 1

Keep it compact and composable. Use \`Message\` for layout, \`MessageContent\` for a single body, and \`MessageToolbar\` only when the message needs controls.`
		},
		{
			id: 'intro-branch',
			content: `## Option 2

Use branching only for assistant responses with multiple versions. Pass a \`versions\` array to \`MessageBranchContent\` and place the selector inside \`MessageToolbar\`.`
		},
		{
			id: 'intro-attachment',
			content: `## Option 3

Attachments stay separate from the message body. Render them with \`MessageAttachments\` and \`MessageAttachment\`; image files open in a preview dialog.`
		}
	];

	const markdownDoc = `Svelte is a frontend framework for fast web UIs. Most work happens at the **build step**, not in the browser.

That means:

* smaller bundles
* less boilerplate
* simpler reactivity

---

## Counter

\`\`\`svelte
<script>
  let count = $state(0);
<\/script>

<button onclick={() => count++}>
  Clicked {count} times
</button>
\`\`\`

---

## Why teams use it

* Readable syntax
* Great performance
* Excellent DX for design systems and AI chat UIs
`;

	const rootProps: PropRow[] = [
		{
			name: 'from',
			type: '"user" | "assistant" | "system" | "function" | "data" | "tool"',
			description: 'Sender role. Drives alignment and bubble chrome (data-role).'
		},
		{ name: 'children', type: 'Snippet', description: 'Content, attachments, toolbar, actions.' },
		{ name: 'ref', type: 'HTMLDivElement | null', description: 'Bindable root element.' }
	];

	const actionProps: PropRow[] = [
		{
			name: 'tooltip',
			type: 'string',
			description: 'When set, wraps the action in a tooltip.'
		},
		{
			name: 'label',
			type: 'string',
			description: 'Accessible label (also used as tooltip fallback for screen readers).'
		},
		{
			name: 'variant / size',
			type: 'Button props',
			default: 'ghost / icon-sm',
			description: 'Forwarded to Button; keeps full button skin.'
		}
	];

	const attachmentProps: PropRow[] = [
		{
			name: 'data',
			type: 'MessageAttachmentData',
			description: '{ type: "file", filename?, mediaType?, url? }'
		},
		{
			name: 'onRemove',
			type: '() => void',
			description: 'Shows a remove control on hover when provided.'
		}
	];

	const branchProps: PropRow[] = [
		{
			name: 'defaultBranch',
			type: 'number',
			default: '0',
			description: 'Initial branch index.'
		},
		{
			name: 'onBranchChange',
			type: '(index: number) => void',
			description: 'Fires when the active branch changes.'
		}
	];

	const branchContentProps: PropRow[] = [
		{
			name: 'versions',
			type: 'MessageVersion[]',
			description: '{ id, content }[] — content is markdown rendered via MessageResponse.'
		}
	];

	const responseProps: PropRow[] = [
		{
			name: 'content',
			type: 'string',
			description: 'Markdown (and streaming markdown) body for Streamdown.'
		},
		{
			name: '…Streamdown props',
			type: 'StreamdownProps',
			description: 'Forwarded to streamdown-svelte (plugins, etc.).'
		}
	];

	const codeInstall = `npm i fractalsvelte streamdown-svelte mode-watcher @shikijs/themes`;

	const usage = `<script lang="ts">
  import * as Message from "fractalsvelte/ai-elements/message";
<\/script>

<Message.Root from="user">
  <Message.Content>What is Svelte?</Message.Content>
</Message.Root>

<Message.Root from="assistant">
  <Message.Content>
    <Message.Response content="A compiler-first UI framework…" />
  </Message.Content>
  <Message.Actions>
    <Message.Action tooltip="Copy" label="Copy">…</Message.Action>
  </Message.Actions>
</Message.Root>`;

	const codeBranch = `<Message.Root from="assistant">
  <Message.Branch>
    <Message.BranchContent {versions} />
    <Message.Toolbar>
      <Message.BranchSelector>
        <Message.BranchPrevious />
        <Message.BranchPage />
        <Message.BranchNext />
      </Message.BranchSelector>
    </Message.Toolbar>
  </Message.Branch>
</Message.Root>`;

	const codeAttach = `<Message.Root from="user">
  <Message.Attachments>
    <Message.Attachment data={{ type: "file", url, mediaType: "image/jpeg", filename }} />
    <Message.Attachment data={{ type: "file", mediaType: "application/pdf", filename }} onRemove={…} />
  </Message.Attachments>
  <Message.Content>Please review these files.</Message.Content>
</Message.Root>`;

	const attachmentReview = `I can review both:

- Click the image tile to open the preview dialog
- Non-image files stay compact with a tooltip
- \`onRemove\` makes attachments dismissible (try the hover control)`;
</script>

{#snippet iconCopy()}
	<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
{/snippet}
{#snippet iconRefresh()}
	<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
{/snippet}

{#snippet demoRoles()}
	<div class="box" style="gap: 1rem; width: 100%; max-width: 40rem; margin-inline: auto;">
		<Message.Message from="user">
			<Message.MessageContent>Hello — how can you help me today?</Message.MessageContent>
		</Message.Message>
		<Message.Message from="assistant">
			<Message.MessageContent>
				I can help you design chat UIs, stream markdown, and compose tools, reasoning, and attachments.
			</Message.MessageContent>
		</Message.Message>
	</div>
{/snippet}

{#snippet demoMarkdown()}
	<div class="box" style="gap: 1rem; width: 100%; max-width: 42rem; margin-inline: auto;">
		<Message.Message from="user">
			<Message.MessageContent>What is Svelte? Provide some examples.</Message.MessageContent>
		</Message.Message>
		<Message.Message from="assistant">
			<Message.MessageContent>
				<Message.MessageResponse content={markdownDoc} />
			</Message.MessageContent>
		</Message.Message>
	</div>
{/snippet}

{#snippet demoActions()}
	<div class="box" style="gap: 1rem; width: 100%; max-width: 40rem; margin-inline: auto;">
		<Message.Message from="user">
			<Message.MessageContent>Summarise our last release notes.</Message.MessageContent>
		</Message.Message>
		<Message.Message from="assistant">
			<Message.MessageContent>
				<Message.MessageResponse
					content="**v0.3** ships stick-to-bottom conversations, chain-of-thought panels, and denser message actions."
				/>
			</Message.MessageContent>
			<Message.MessageActions>
				<Message.MessageAction
					tooltip="Regenerate"
					label="Regenerate"
					onclick={() => {}}
				>
					{@render iconRefresh()}
				</Message.MessageAction>
				<Message.MessageAction
					tooltip={copied ? 'Copied' : 'Copy'}
					label="Copy"
					onclick={() => {
						navigator.clipboard?.writeText(
							'v0.3 ships stick-to-bottom conversations, chain-of-thought panels, and denser message actions.'
						);
						copied = true;
						setTimeout(() => (copied = false), 1200);
					}}
				>
					{@render iconCopy()}
				</Message.MessageAction>
			</Message.MessageActions>
		</Message.Message>
	</div>
{/snippet}

{#snippet demoBranch()}
	<div class="box" style="gap: 1rem; width: 100%; max-width: 40rem; margin-inline: auto;">
		<Message.Message from="user">
			<Message.MessageContent>Give me three short ways to introduce the component in docs.</Message.MessageContent>
		</Message.Message>
		<Message.Message from="assistant">
			<Message.MessageBranch>
				<Message.MessageBranchContent versions={branchVersions} />
				<Message.MessageToolbar>
					<Message.MessageBranchSelector>
						<Message.MessageBranchPrevious />
						<Message.MessageBranchPage />
						<Message.MessageBranchNext />
					</Message.MessageBranchSelector>
				</Message.MessageToolbar>
			</Message.MessageBranch>
		</Message.Message>
	</div>
{/snippet}

{#snippet demoAttachments()}
	<div class="box" style="gap: 1rem; width: 100%; max-width: 40rem; margin-inline: auto;">
		<Message.Message from="user">
			<Message.MessageAttachments>
				{#each attachments as file, i (file.filename)}
					<Message.MessageAttachment
						data={file}
						onRemove={() => {
							attachments = attachments.filter((_, idx) => idx !== i);
						}}
					/>
				{/each}
			</Message.MessageAttachments>
			<Message.MessageContent>Please review these files before we ship the new docs page.</Message.MessageContent>
		</Message.Message>
		<Message.Message from="assistant">
			<Message.MessageContent>
				<Message.MessageResponse content={attachmentReview} />
			</Message.MessageContent>
		</Message.Message>
		{#if attachments.length === 0}
			<Button size="sm" variant="outline" onclick={() => location.reload()}>Reset attachments</Button>
		{/if}
	</div>
{/snippet}

<h1 class="doc-title">Message</h1>
<p class="doc-lede">
	Composable chat messages — role-aware layout, streamed markdown, action toolbars, multi-version branching, and file attachments with image preview.
</p>

<Preview description="User + assistant with streamed markdown" code={usage}>
	{@render demoMarkdown()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/message/` into your project. Heavy deps: `streamdown-svelte`, `mode-watcher`, `@shikijs/themes`. UI deps: `button`, `button-group`, `dialog`, `tooltip`.

## Usage

<CodeBlock code={usage} lang="svelte" />

Use `Message` / `MessageContent` for layout. Put markdown through `MessageResponse`. Attach actions, branches, and files as siblings of content — not inside the bubble — so toolbars stay out of the user chrome.

## Examples

<Examples
	items={[
		{
			title: 'Markdown',
			demo: demoMarkdown,
			code: usage,
			description: 'Assistant reply rendered with Streamdown (headings, lists, code).'
		},
		{
			title: 'Roles',
			demo: demoRoles,
			code: usage,
			description: 'User bubble (secondary surface) vs plain assistant text.'
		},
		{
			title: 'Actions',
			demo: demoActions,
			code: usage,
			description: 'Ghost icon actions with tooltips (copy / regenerate).'
		},
		{
			title: 'Branches',
			demo: demoBranch,
			code: codeBranch,
			description: 'Multiple assistant versions with previous / page / next controls.'
		},
		{
			title: 'Attachments',
			demo: demoAttachments,
			code: codeAttach,
			description: 'Image preview dialog + non-image file chip; removable on hover.'
		}
	]}
/>

## Props

### Message

<PropsTable props={rootProps} />

### MessageAction

<PropsTable props={actionProps} />

### MessageAttachment

<PropsTable props={attachmentProps} />

### MessageBranch

<PropsTable props={branchProps} />

### MessageBranchContent

<PropsTable props={branchContentProps} />

### MessageResponse

<PropsTable props={responseProps} />

`MessageContent`, `MessageActions`, `MessageToolbar`, and `MessageAttachments` are layout shells (`ref` + `children`). Branch nav parts (`Previous` / `Next` / `Page` / `Selector`) read branch context and only render the selector when there is more than one version.

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--secondary` | User bubble background |
| `--foreground` | Bubble and assistant text |
| `--muted` / `--muted-foreground` | File attachment tile, branch page |
| `--background` / `--border` | Remove control glass, response `pre` / `hr` |
| `--primary` | Links inside markdown |
| `--radius` | Bubble and attachment corners |

</div>
