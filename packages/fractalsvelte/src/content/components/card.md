<script lang="ts">
	import { Button } from "$lib/components/button/index.js";
	import * as Card from "$lib/components/card/index.js";
	import { Input } from "$lib/components/input/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const rootProps: PropRow[] = [
		{
			name: "size",
			type: '"default" | "sm"',
			default: '"default"',
			description:
				"Retunes --card-spacing (1.5rem / 1rem), which every part reads. Changes the whole card's rhythm at once.",
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference to the rendered element.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Card parts.",
		},
	];

	const partProps: PropRow[] = [
		{
			name: "bordered",
			type: "boolean",
			default: "false",
			description:
				"Header and Footer only. Adds a divider and the matching padding on the inner edge.",
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference. Available on every part.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as Card from "fractalsvelte/card";
<\/script>

<Card.Root>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card.Root>`;

	const codeFull = `<Card.Root>
  <Card.Header bordered>
    <Card.Title>Create project</Card.Title>
    <Card.Description>Deploy in one click.</Card.Description>
    <Card.Action>
      <Button variant="ghost" size="icon-sm">…</Button>
    </Card.Action>
  </Card.Header>
  <Card.Content>…</Card.Content>
  <Card.Footer bordered>…</Card.Footer>
</Card.Root>`;

	const codeSize = `<Card.Root size="sm">…</Card.Root>`;

	const codeAction = `<Card.Header>
  <Card.Title>Notifications</Card.Title>
  <Card.Description>Manage how you are notified.</Card.Description>
  <!-- Action spans both rows in the top-right corner. -->
  <Card.Action>
    <Button variant="outline" size="sm">Edit</Button>
  </Card.Action>
</Card.Header>`;

	const codeBleed = `<!-- --card-spacing is a public custom property: bleed content to the card edge. -->
<Card.Content style="margin-inline: calc(var(--card-spacing) * -1)">
  <img src="/photo.jpg" alt="" />
</Card.Content>`;
</script>

<h1 class="doc-title">Card</h1>
<p class="doc-lede">A surface that groups related content and actions.</p>

<Preview description="Card — full composition" code={usage}>
	<Card.Root style="width:20rem">
		<Card.Header>
			<Card.Title>Create project</Card.Title>
			<Card.Description>Deploy your new project in one click.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Input placeholder="Project name" />
		</Card.Content>
	</Card.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/card/` into your project — it has no runtime dependencies.

## Usage

<CodeBlock code={usage} />

Card is composed from seven parts: `Root`, `Header`, `Title`, `Description`, `Content`,
`Footer` and `Action`. Use `Header` and `Content` rather than putting everything in `Content` —
the header's grid is what positions `Action` and `Description` correctly.

## Examples

{#snippet demoFull()}
	<Card.Root style="width:21rem">
		<Card.Header bordered>
			<Card.Title>Create project</Card.Title>
			<Card.Description>Deploy your new project in one click.</Card.Description>
			<Card.Action>
				<Button variant="ghost" size="icon-sm" aria-label="More options">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" />
						<circle cx="12" cy="19" r="1" />
					</svg>
				</Button>
			</Card.Action>
		</Card.Header>
		<Card.Content>
			<div class="box" style="gap:0.5rem">
				<Input placeholder="Project name" />
				<Input placeholder="Framework" />
			</div>
		</Card.Content>
		<Card.Footer bordered>
			<div class="row" style="gap:0.5rem; margin-left:auto">
				<Button variant="ghost" size="sm">Cancel</Button>
				<Button size="sm">Deploy</Button>
			</div>
		</Card.Footer>
	</Card.Root>
{/snippet}

{#snippet demoSize()}
	<Card.Root style="width:16rem">
		<Card.Header>
			<Card.Title>Default</Card.Title>
			<Card.Description>--card-spacing is 1.5rem.</Card.Description>
		</Card.Header>
		<Card.Content>Content on the default rhythm.</Card.Content>
	</Card.Root>
	<Card.Root size="sm" style="width:16rem">
		<Card.Header>
			<Card.Title>Small</Card.Title>
			<Card.Description>--card-spacing is 1rem.</Card.Description>
		</Card.Header>
		<Card.Content>Every part tightens together.</Card.Content>
	</Card.Root>
{/snippet}

{#snippet demoAction()}
	<Card.Root style="width:21rem">
		<Card.Header>
			<Card.Title>Notifications</Card.Title>
			<Card.Description>Manage how you are notified.</Card.Description>
			<Card.Action>
				<Button variant="outline" size="sm">Edit</Button>
			</Card.Action>
		</Card.Header>
		<Card.Content>You have 3 unread messages.</Card.Content>
	</Card.Root>
{/snippet}

{#snippet demoBordered()}
	<Card.Root style="width:19rem">
		<Card.Header bordered>
			<Card.Title>With dividers</Card.Title>
		</Card.Header>
		<Card.Content>bordered adds the rule and the padding together.</Card.Content>
		<Card.Footer bordered>
			<Button size="sm" variant="outline">Action</Button>
		</Card.Footer>
	</Card.Root>
	<Card.Root style="width:19rem">
		<Card.Header>
			<Card.Title>Without</Card.Title>
		</Card.Header>
		<Card.Content>The default is no divider.</Card.Content>
		<Card.Footer>
			<Button size="sm" variant="outline">Action</Button>
		</Card.Footer>
	</Card.Root>
{/snippet}

<Examples
	items={[
		{
			title: "Full composition",
			demo: demoFull,
			code: codeFull,
			description: "Header, Action, Content and Footer together.",
		},
		{
			title: "Size",
			demo: demoSize,
			code: codeSize,
			description: 'size="sm" retunes --card-spacing, so every part tightens at once.',
		},
		{
			title: "Action",
			demo: demoAction,
			code: codeAction,
			description:
				"The header becomes two columns only when an Action is present — no prop needed.",
		},
		{
			title: "Dividers",
			demo: demoBordered,
			code: codeBleed,
			description: "bordered adds the rule and its matching padding in one prop.",
		},
	]}
/>

## Props

### Card.Root

<PropsTable props={rootProps} />

### Card.Header, Card.Footer and the rest

<PropsTable props={partProps} />

`Title`, `Description`, `Content` and `Action` take no props of their own beyond `ref`,
`children` and any native attribute.

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--card` / `--card-foreground` | surface and text |
| `--muted-foreground` | description |
| `--border` | dividers when `bordered` |
| `--foreground` | the hairline ring, at 5% (10% in dark) |
| `--text-sm` / `--text-base` | body and title sizes |

</div>

### `--card-spacing`

Card defines `--card-spacing` on its root — `1.5rem`, or `1rem` when `size="sm"`. Header,
content and footer all read it, so it is the single value that controls the card's rhythm.

It is public. Set it yourself to retune one card, or read it to bleed content to the card edge:

<CodeBlock code={codeBleed} />

An image as the first or last child is automatically flush to the edge and inherits the card's
corner radius.
