<script lang="ts">
	import { Textarea } from "$lib/components/textarea/index.js";
	import { Button } from "$lib/components/button/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	let bio = $state("");

	const props: PropRow[] = [
		{
			name: "value",
			type: "string",
			description: "Bindable. Use bind:value for two-way binding.",
		},
		{
			name: "rows",
			type: "number",
			description: "Native attribute. The box also grows with its content.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Dims the field and blocks interaction.",
		},
		{
			name: "aria-invalid",
			type: "boolean",
			description: "Switches the border and focus ring to the destructive colour.",
		},
		{
			name: "placeholder",
			type: "string",
			description: "Rendered in the muted foreground colour.",
		},
		{
			name: "data-slot",
			type: "string",
			default: '"textarea"',
			description:
				"The styling hook. Wrappers override it to opt the field out of the default styling.",
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference to the rendered textarea.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Textarea } from "fractalsvelte/textarea";

  let bio = $state("");
<\/script>

<Textarea placeholder="Tell us about yourself" bind:value={bio} />`;

	const codeStates = `<Textarea placeholder="Default" />
<Textarea placeholder="Disabled" disabled />
<Textarea placeholder="Invalid" aria-invalid="true" />`;

	const codeGrow = `<!-- The box grows as you type — no rows juggling. -->
<Textarea placeholder="Keep typing…" />`;

	const codeForm = `<Textarea placeholder="Your message" rows={4} />
<Button size="sm">Send</Button>`;
</script>

<h1 class="doc-title">Textarea</h1>
<p class="doc-lede">A multi-line text field that grows with its content.</p>

<Preview description="Textarea — default" code={usage}>
	<Textarea placeholder="Tell us about yourself" style="max-width:24rem" />
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/textarea/` into your project — it has no runtime dependencies.
Copy `styles/_mixins.sass` and `_tokens.sass` too if you do not already have them.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoStates()}
	<div class="box" style="gap:0.625rem; width:24rem">
		<Textarea placeholder="Default" />
		<Textarea placeholder="Disabled" disabled />
		<Textarea placeholder="Invalid" aria-invalid="true" />
	</div>
{/snippet}

{#snippet demoGrow()}
	<div class="box" style="gap:0.5rem; width:24rem">
		<Textarea placeholder="Type a few lines and watch it grow…" bind:value={bio} />
		<span style="font-size:0.75rem; color:var(--muted-foreground)">
			{bio.length} characters
		</span>
	</div>
{/snippet}

{#snippet demoRows()}
	<div class="box" style="gap:0.625rem; width:24rem">
		<Textarea placeholder="Two rows" rows={2} />
		<Textarea placeholder="Six rows" rows={6} />
	</div>
{/snippet}

{#snippet demoForm()}
	<div class="box" style="gap:0.625rem; width:24rem">
		<Textarea placeholder="Your message" rows={4} />
		<div class="row" style="gap:0.5rem; margin-left:auto">
			<Button variant="ghost" size="sm">Cancel</Button>
			<Button size="sm">Send</Button>
		</div>
	</div>
{/snippet}

<Examples
	items={[
		{ title: "States", demo: demoStates, code: codeStates },
		{
			title: "Auto-grow",
			demo: demoGrow,
			code: codeGrow,
			description:
				"Uses field-sizing: content. Browsers without it keep the 4rem minimum height.",
		},
		{
			title: "Rows",
			demo: demoRows,
			code: codeStates,
			description: "rows sets the starting height; the field still grows past it.",
		},
		{ title: "With actions", demo: demoForm, code: codeForm },
	]}
/>

## Props

Every native `<textarea>` attribute is forwarded. The table lists what is specific to this
component.

<PropsTable {props} />

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--input` | field background, at 50% |
| `--muted-foreground` | placeholder |
| `--ring` | focus border and ring |
| `--destructive` | border and ring when `aria-invalid` |
| `--text-base` / `--text-sm` | field text — see below |

</div>

Text is `--text-base` on narrow screens and drops to `--text-sm` from the `md` breakpoint up.
That is deliberate: iOS zooms the page when a focused field's text is under 16px, so the
larger size on phones avoids the jump.

Manual resizing is off — the field sizes itself to its content instead.
