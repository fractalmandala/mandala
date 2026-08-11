<script lang="ts">
	import * as Conversation from '$lib/components/ai-elements/conversation/index.js';
	import * as Message from '$lib/components/ai-elements/message/index.js';
	import { Button } from '$lib/components/button/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	type ChatLine = { id: string; role: 'user' | 'assistant'; text: string };

	const seed: Omit<ChatLine, 'id'>[] = [
		{ role: 'user', text: 'Hello, how are you?' },
		{ role: 'assistant', text: "I'm good — how can I help today?" },
		{ role: 'user', text: "I'm looking for information about your services." },
		{
			role: 'assistant',
			text: 'We offer NLP APIs, streaming chat kits, and evaluation tools. What are you interested in?'
		},
		{ role: 'user', text: 'Natural language processing tools.' },
		{
			role: 'assistant',
			text: 'Great choice. Our models cover classification, extraction, and summarisation. Want a quick demo?'
		},
		{ role: 'user', text: 'Yes — show me sentiment analysis.' },
		{
			role: 'assistant',
			text: "Sample: “I love this product!” → positive (0.94). Multilingual support covers 20+ languages."
		},
		{ role: 'user', text: 'How do I get started with the API?' },
		{
			role: 'assistant',
			text: 'Create a project, grab an API key, and stream completions with the SDK. A 14-day trial includes full access.'
		},
		{ role: 'user', text: 'What support do you provide?' },
		{
			role: 'assistant',
			text: '24/7 chat and email for all tiers, plus Slack for enterprise. Let me know if you need anything else.'
		}
	];

	let streamLines = $state<ChatLine[]>([]);
	let streaming = $state(false);
	let streamTimer: ReturnType<typeof setInterval> | null = null;

	function stopStream() {
		if (streamTimer) {
			clearInterval(streamTimer);
			streamTimer = null;
		}
		streaming = false;
	}

	function startStream() {
		stopStream();
		streamLines = [];
		streaming = true;
		let i = 0;
		streamTimer = setInterval(() => {
			if (i >= seed.length) {
				stopStream();
				return;
			}
			const row = seed[i];
			streamLines = [
				...streamLines,
				{ id: crypto.randomUUID(), role: row.role, text: row.text }
			];
			i++;
		}, 450);
	}

	// Manual chat for scroll-button demo
	let manualLines = $state<ChatLine[]>([
		{
			id: 'm1',
			role: 'assistant',
			text: 'Scroll up through this long transcript, then use the floating button to jump back to the latest message.'
		},
		...Array.from({ length: 14 }, (_, i) => ({
			id: `m${i + 2}`,
			role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
			text:
				i % 2 === 0
					? `User note ${Math.floor(i / 2) + 1}: more context about the task.`
					: `Assistant reply ${Math.floor(i / 2) + 1}: here is a longer answer so the conversation overflows the pane and stick-to-bottom can be tested.`
		}))
	]);

	function pushManual() {
		const n = manualLines.length + 1;
		manualLines = [
			...manualLines,
			{
				id: crypto.randomUUID(),
				role: n % 2 === 0 ? 'assistant' : 'user',
				text:
					n % 2 === 0
						? `Assistant message #${n}: streaming-style reply appended at the bottom.`
						: `User message #${n}: another turn.`
			}
		];
	}

	const rootProps: PropRow[] = [
		{
			name: 'initial',
			type: 'ScrollBehavior',
			default: '"smooth"',
			description: 'Scroll behavior when Content attaches and first sticks to bottom.'
		},
		{
			name: 'resize',
			type: 'ScrollBehavior',
			default: '"smooth"',
			description:
				'Scroll behavior when the scrollport resizes while pinned (streaming growth). Prefer "auto" for high-frequency streams.'
		},
		{
			name: 'threshold',
			type: 'number',
			default: '200',
			description: 'Pixels from the bottom that still count as “at bottom” for auto-stick and the scroll button.'
		},
		{
			name: 'height',
			type: 'string',
			description: 'CSS height of the conversation shell (e.g. "24rem", "100%").'
		},
		{
			name: 'maxHeight',
			type: 'string',
			description: 'CSS max-height of the shell.'
		},
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			description: 'Bindable root element.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Content, EmptyState, and ScrollButton.'
		}
	];

	const contentProps: PropRow[] = [
		{
			name: 'gap',
			type: '"default" | "compact" | "loose"',
			default: '"default"',
			description: 'Vertical spacing between messages (2rem / 1rem / 2.5rem).'
		},
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			description: 'Bindable scroll container (the stick-to-bottom element).'
		},
		{ name: 'children', type: 'Snippet', description: 'Messages or EmptyState.' }
	];

	const emptyProps: PropRow[] = [
		{
			name: 'title',
			type: 'string',
			default: '"No messages yet"',
			description: 'Heading when the transcript is empty.'
		},
		{
			name: 'description',
			type: 'string',
			default: '"Start a conversation to see messages here"',
			description: 'Supporting copy under the title.'
		},
		{
			name: 'icon',
			type: 'Snippet',
			description: 'Optional leading icon above the title.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Replace the default title/description layout entirely.'
		}
	];

	const scrollProps: PropRow[] = [
		{
			name: '…Button props',
			type: 'Button props',
			description:
				'Forwards to Button (variant defaults to outline, size to icon). Only rendered when the user is not at the bottom.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Replace the default chevron-down icon.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as Conversation from "fractalsvelte/ai-elements/conversation";
  import * as Message from "fractalsvelte/ai-elements/message";
<\/script>

<Conversation.Root height="24rem">
  <Conversation.Content gap="compact">
    {#each messages as m (m.id)}
      <Message.Message from={m.role}>
        <Message.MessageContent>{m.text}</Message.MessageContent>
      </Message.Message>
    {/each}
  </Conversation.Content>
  <Conversation.ScrollButton />
</Conversation.Root>`;

	const codeStream = `// Append messages over time — Content auto-scrolls while the user stays at the bottom
$effect(() => {
  const id = setInterval(() => { /* push next message */ }, 450);
  return () => clearInterval(id);
});`;

	const codeEmpty = `<Conversation.Root height="16rem">
  <Conversation.Content>
    <Conversation.EmptyState
      title="Start a conversation"
      description="Messages appear here as the chat progresses."
    >
      {#snippet icon()}…{/snippet}
    </Conversation.EmptyState>
  </Conversation.Content>
</Conversation.Root>`;

	const codeScroll = `// Scroll up → ScrollButton appears; click to rejoin the bottom
// Append more messages while scrolled up — stick-to-bottom pauses until you return`;
</script>

{#snippet chatIcon()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
	</svg>
{/snippet}

{#snippet streamDemo()}
	<div class="box" style="gap: 0.75rem; width: 100%;">
		<div class="row wrap" style="gap: 0.5rem;">
			<Button size="sm" onclick={startStream} disabled={streaming}>
				{streaming ? 'Streaming…' : streamLines.length ? 'Replay stream' : 'Start stream'}
			</Button>
			{#if streaming}
				<Button size="sm" variant="outline" onclick={stopStream}>Stop</Button>
			{/if}
			<span style="font-size: var(--text-sm); color: var(--muted-foreground); align-self: center;">
				{streamLines.length} / {seed.length} messages
			</span>
		</div>
		<div
			style="height: 22rem; width: 100%; max-width: 40rem; border: 1px solid var(--border); border-radius: var(--doc-r-lg); overflow: hidden;"
		>
			<Conversation.Root height="100%" resize="auto">
				<Conversation.Content gap="compact">
					{#if streamLines.length === 0}
						<Conversation.EmptyState
							title="Start a conversation"
							description="Messages will appear here as the conversation progresses."
							icon={chatIcon}
						/>
					{:else}
						{#each streamLines as line (line.id)}
							<Message.Message from={line.role}>
								<Message.MessageContent>{line.text}</Message.MessageContent>
							</Message.Message>
						{/each}
					{/if}
				</Conversation.Content>
				<Conversation.ScrollButton />
			</Conversation.Root>
		</div>
	</div>
{/snippet}

{#snippet emptyDemo()}
	<div
		style="height: 16rem; width: 100%; max-width: 36rem; margin-inline: auto; border: 1px solid var(--border); border-radius: var(--doc-r-lg); overflow: hidden;"
	>
		<Conversation.Root height="100%">
			<Conversation.Content>
				<Conversation.EmptyState
					title="No messages yet"
					description="Send a prompt to begin. The empty state centres itself in the scrollport."
					icon={chatIcon}
				/>
			</Conversation.Content>
		</Conversation.Root>
	</div>
{/snippet}

{#snippet scrollDemo()}
	<div class="box" style="gap: 0.75rem; width: 100%;">
		<div class="row wrap" style="gap: 0.5rem;">
			<Button size="sm" variant="outline" onclick={pushManual}>Append message</Button>
			<span style="font-size: var(--text-sm); color: var(--muted-foreground); align-self: center;">
				Scroll up to reveal the jump-to-bottom control
			</span>
		</div>
		<div
			style="height: 18rem; width: 100%; max-width: 40rem; border: 1px solid var(--border); border-radius: var(--doc-r-lg); overflow: hidden;"
		>
			<Conversation.Root height="100%">
				<Conversation.Content gap="compact">
					{#each manualLines as line (line.id)}
						<Message.Message from={line.role}>
							<Message.MessageContent>{line.text}</Message.MessageContent>
						</Message.Message>
					{/each}
				</Conversation.Content>
				<Conversation.ScrollButton />
			</Conversation.Root>
		</div>
	</div>
{/snippet}

{#snippet staticDemo()}
	<div
		style="height: 18rem; width: 100%; max-width: 40rem; margin-inline: auto; border: 1px solid var(--border); border-radius: var(--doc-r-lg); overflow: hidden;"
	>
		<Conversation.Root height="100%" initial="auto">
			<Conversation.Content gap="compact">
				{#each seed.slice(0, 6) as line, i (i)}
					<Message.Message from={line.role}>
						<Message.MessageContent>{line.text}</Message.MessageContent>
					</Message.Message>
				{/each}
			</Conversation.Content>
			<Conversation.ScrollButton />
		</Conversation.Root>
	</div>
{/snippet}

<h1 class="doc-title">Conversation</h1>
<p class="doc-lede">
	A chat scrollport with stick-to-bottom behaviour for streaming transcripts, an empty state, and a floating control that reappears when the user scrolls away from the latest message.
</p>

<Preview description="Streaming transcript — auto-scrolls while pinned to bottom" code={codeStream}>
	{@render streamDemo()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/conversation/` into your project. Pair it with `Message` for role-styled bubbles.

## Usage

<CodeBlock code={usage} lang="svelte" />

Compose `Root` → `Content` (messages) → optional `ScrollButton`. `Content` is the scroll element; stick-to-bottom attaches observers there. While the user remains near the bottom, new children (stream tokens, tool cards, etc.) keep the view pinned. Scrolling up pauses auto-follow until they return or use the scroll button.

## Examples

{#snippet demoStream()}
	{@render streamDemo()}
{/snippet}

{#snippet demoEmpty()}
	{@render emptyDemo()}
{/snippet}

{#snippet demoScroll()}
	{@render scrollDemo()}
{/snippet}

{#snippet demoStatic()}
	{@render staticDemo()}
{/snippet}

<Examples
	items={[
		{
			title: 'Streaming',
			demo: demoStream,
			code: codeStream,
			description: 'Messages append on an interval; stick-to-bottom follows until you scroll away.'
		},
		{
			title: 'Empty state',
			demo: demoEmpty,
			code: codeEmpty,
			description: 'Centred placeholder with optional icon snippet.'
		},
		{
			title: 'Scroll button',
			demo: demoScroll,
			code: codeScroll,
			description: 'Scroll up to show the glass jump-to-bottom control; append more messages while away from the end.'
		},
		{
			title: 'Static thread',
			demo: demoStatic,
			code: usage,
			description: 'Preloaded transcript opens scrolled to the latest message (initial="auto").'
		}
	]}
/>

## Props

### Conversation.Root

<PropsTable props={rootProps} />

### Conversation.Content

<PropsTable props={contentProps} />

### Conversation.EmptyState

<PropsTable props={emptyProps} />

### Conversation.ScrollButton

<PropsTable props={scrollProps} />

### Context

`getStickToBottomContext()` returns the class instance (`isAtBottom`, `scrollToBottom`, `debugInfo`). Do not destructure it — keep the reference for reactivity.

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--background` | Scroll button glass fill |
| `--border` | Scroll button edge |
| `--foreground` | Empty title |
| `--muted-foreground` | Empty description, icon, thin scrollbar |

</div>

Message bubbles are styled by the Message component (`data-role="user" | "assistant"`), not by Conversation.
