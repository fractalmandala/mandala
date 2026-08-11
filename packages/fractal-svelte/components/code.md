<script lang="ts">
	import * as Code from '$lib/components/ai-elements/code/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const tsSample = `type User = {
  id: string;
  name: string;
  roles: ("admin" | "editor" | "viewer")[];
};

export function greet(user: User) {
  return \`Hello, \${user.name}\`;
}

console.log(greet({ id: "1", name: "Amrit", roles: ["admin"] }));`;

	const longSample = Array.from({ length: 24 }, (_, i) => `// line ${i + 1}: lorem ipsum dolor sit amet`).join('\n');

	const jsonSample = `{
  "model": "gpt-4o",
  "temperature": 0.2,
  "messages": [
    { "role": "user", "content": "Summarise this PR" }
  ]
}`;

	const rootProps: PropRow[] = [
		{ name: 'code', type: 'string', description: 'Source text to highlight.' },
		{
			name: 'lang',
			type: 'SupportedLanguage',
			default: '"typescript"',
			description: 'bash | diff | javascript | json | svelte | typescript | python | tsx | jsx | css | text'
		},
		{
			name: 'variant',
			type: '"default" | "secondary"',
			default: '"default"',
			description: 'Frame surface (card vs muted secondary).'
		},
		{
			name: 'hideLines',
			type: 'boolean',
			default: 'false',
			description: 'Hide line numbers.'
		},
		{
			name: 'highlight',
			type: '(number | [number, number])[]',
			description: 'Line numbers or inclusive ranges to emphasize.'
		},
		{ name: 'children', type: 'Snippet', description: 'Usually Code.CopyButton (and/or Overflow).' }
	];

	const overflowProps: PropRow[] = [
		{
			name: 'collapsed',
			type: 'boolean',
			default: 'true',
			description: 'Bindable. When true, max-height 300px with fade + Expand.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as Code from "fractalsvelte/ai-elements/code";
<\/script>

<Code.Root code={source} lang="typescript">
  <Code.CopyButton />
</Code.Root>`;

	const usageOverflow = `<Code.Overflow bind:collapsed>
  <Code.Root code={longSource} lang="typescript">
    <Code.CopyButton />
  </Code.Root>
</Code.Overflow>`;
</script>

{#snippet demoDefault()}
	<div style="width: 100%; max-width: 40rem; margin-inline: auto;">
		<Code.Root code={tsSample} lang="typescript">
			<Code.CopyButton />
		</Code.Root>
	</div>
{/snippet}

{#snippet demoHighlight()}
	<div style="width: 100%; max-width: 40rem; margin-inline: auto;">
		<Code.Root code={tsSample} lang="typescript" highlight={[6, [8, 10]]}>
			<Code.CopyButton />
		</Code.Root>
	</div>
{/snippet}

{#snippet demoSecondary()}
	<div style="width: 100%; max-width: 40rem; margin-inline: auto;">
		<Code.Root code={jsonSample} lang="json" variant="secondary" hideLines>
			<Code.CopyButton />
		</Code.Root>
	</div>
{/snippet}

{#snippet demoOverflow()}
	<div style="width: 100%; max-width: 40rem; margin-inline: auto;">
		<Code.Overflow>
			<Code.Root code={longSample} lang="typescript">
				<Code.CopyButton />
			</Code.Root>
		</Code.Overflow>
	</div>
{/snippet}

<h1 class="doc-title">Code</h1>
<p class="doc-lede">
	Syntax-highlighted code block powered by Shiki (dual light/dark themes), with optional line numbers, line highlighting, a copy button (via <code>CopyButton</code>), and a collapsible overflow region. HTML is sanitized with DOMPurify.
</p>

<Preview description="TypeScript with line numbers and copy" code={usage}>
	{@render demoDefault()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/ai-elements/code/`. Uses the existing `copy-button` ai-element.

## Usage

<CodeBlock code={usage} lang="svelte" />

Nest `CopyButton` inside `Root` so it can read the code from context. For long samples, wrap with `Overflow`:

<CodeBlock code={usageOverflow} lang="svelte" />

## Examples

<Examples
	items={[
		{ title: 'Default', demo: demoDefault },
		{ title: 'Highlight', demo: demoHighlight },
		{ title: 'Secondary JSON', demo: demoSecondary },
		{ title: 'Overflow', demo: demoOverflow }
	]}
/>

## Props

### Code.Root

<PropsTable props={rootProps} />

### Code.Overflow

<PropsTable props={overflowProps} />

### Code.CopyButton

Uses the shared `CopyButton` with the parent `Root` code text. Positioned top-right via `data-code-copy`.

## Theming

- Frame: `var(--card)` / `var(--border)`; secondary uses muted secondary wash
- Line numbers + muted chrome: `var(--muted-foreground)`
- Highlighted lines: `var(--secondary)`
- Dark mode: Shiki dual-theme vars (`--shiki-dark*`) under `.dark`
