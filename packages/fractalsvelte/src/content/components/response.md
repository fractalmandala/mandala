<script lang="ts">
	import { Response } from '$lib/components/ai-elements/response/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';
	import { onMount } from 'svelte';

	const staticMarkdown = `### Hello, Streamdown

This is a **markdown** response from an AI model.

---

## Lists

- Smaller bundles
- Less boilerplate
- Simpler reactivity

1. Install the package
2. Import \`Response\`
3. Pass a \`content\` string

## Inline code

Use \`const x = 42\` mid-sentence, or a fenced block:

\`\`\`javascript
const greeting = "Hello, world!";
console.log(greeting);
\`\`\`

## Quote

> Streamed markdown should feel like a document, not a wall of plain text.

[Link example](https://example.com) · tables and headings work too.
`;

	const tableMarkdown = `## Comparison

| Feature | Status |
| --- | --- |
| Headings | Ready |
| Lists | Ready |
| Code blocks | Shiki themes |
| Tables | Styled |

Pair \`Response\` with \`Message\` for full chat layout, or use it alone for any markdown surface.
`;

	const streamTokens = [
		'### Streaming',
		' demo',
		'\n\n',
		'Tokens',
		' arrive',
		' one',
		' at',
		' a',
		' time',
		' —',
		' just',
		' like',
		' a',
		' real',
		' model',
		'.',
		'\n\n',
		'- First',
		' bullet',
		'\n',
		'- Second',
		' bullet',
		'\n',
		'- Third',
		' with',
		' `inline`',
		' code',
		'\n\n',
		'```ts\n',
		'const ready = true;\n',
		'```\n'
	];

	let streamed = $state('');
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
		streamed = '';
		streaming = true;
		let i = 0;
		streamTimer = setInterval(() => {
			if (i >= streamTokens.length) {
				stopStream();
				return;
			}
			streamed += streamTokens[i];
			i++;
		}, 80);
	}

	onMount(() => {
		startStream();
		return () => stopStream();
	});

	const props: PropRow[] = [
		{
			name: 'content',
			type: 'string',
			description: 'Markdown (and streaming markdown) body for Streamdown.'
		},
		{
			name: '…Streamdown props',
			type: 'StreamdownProps',
			description: 'Forwarded to streamdown-svelte (plugins, components, etc.).'
		}
	];

	const codeInstall = `npm i fractalsvelte streamdown-svelte mode-watcher @shikijs/themes`;

	const usage = `<script lang="ts">
  import { Response } from "fractalsvelte/ai-elements/response";
<\/script>

<Response content="### Hello\\n\\nThis is **bold** markdown." />`;

	const codeStream = `<script lang="ts">
  import { Response } from "fractalsvelte/ai-elements/response";
  let content = $state("");
  // append tokens from your model stream into content
<\/script>

<Response {content} />`;

	const codeStatic = `<Response content={\`## Heading

- item one
- item two

\\\`\\\`\\\`ts
const ok = true;
\\\`\\\`\\\`
\`} />`;
</script>

{#snippet demoStatic()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto; text-align: start;">
		<Response content={staticMarkdown} />
	</div>
{/snippet}

{#snippet demoStream()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto; text-align: start;">
		<div style="display: flex; justify-content: flex-end; margin-bottom: 0.75rem;">
			<button
				type="button"
				class="doc-ghost-btn"
				style="font-size: 0.75rem; padding: 0.25rem 0.6rem; border: 1px solid var(--border); border-radius: 3px; background: var(--background); cursor: pointer; color: var(--foreground);"
				onclick={startStream}
				disabled={streaming}
			>
				{streaming ? 'Streaming…' : 'Replay stream'}
			</button>
		</div>
		<Response content={streamed || '_Waiting for tokens…_'} />
	</div>
{/snippet}

{#snippet demoTable()}
	<div style="width: 100%; max-width: 36rem; margin-inline: auto; text-align: start;">
		<Response content={tableMarkdown} />
	</div>
{/snippet}

<h1 class="doc-title">Response</h1>
<p class="doc-lede">
	Streaming-friendly markdown for LLM replies — Streamdown under the hood, Shiki themes that follow light/dark mode, and light prose defaults so content is readable without extra chrome.
</p>

<Preview description="Static markdown with headings, lists, code, and a quote" code={usage}>
	{@render demoStatic()}
</Preview>

## Installation

Install the package and peer deps:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/response/` into your project. Runtime deps: `streamdown-svelte`, `mode-watcher`, `@shikijs/themes`.

## Usage

<CodeBlock code={usage} lang="svelte" />

Pass any markdown string as `content`. Additional Streamdown props (plugins, custom components) spread through.

## Examples

<Examples
	items={[
		{
			title: 'Static markdown',
			demo: demoStatic,
			code: codeStatic,
			description: 'Headings, lists, inline code, fenced blocks, and blockquotes.'
		},
		{
			title: 'Token stream',
			demo: demoStream,
			code: codeStream,
			description: 'Append tokens into content as they arrive — the same API for static or live streams.'
		},
		{
			title: 'Tables',
			demo: demoTable,
			code: tableMarkdown,
			description: 'GFM tables pick up border and muted header styles from the response skin.'
		}
	]}
/>

## Props

<PropsTable {props} />

## Theming

Response does not invent its own palette — it reads shared tokens and Shiki themes:

<div class="doc-table-wrap">

| Token / source | Used for |
| --- | --- |
| `--text-sm` / line-height | Body size |
| `--muted` | Code block + table header backgrounds |
| `--border` | Table cells, hr, blockquote rule |
| `--primary` | Links |
| `--muted-foreground` | Blockquote text |
| `--radius` | Code and pre rounding |
| mode-watcher + `@shikijs/themes` | Light/dark code highlighting |

</div>

For chat layout (role bubbles, toolbars), compose with [Message](/docs/components/message) and put `<Response>` inside `MessageContent`.
