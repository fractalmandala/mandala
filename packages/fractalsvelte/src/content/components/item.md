<script lang="ts">
	import * as Item from "$lib/components/item/index.js";
	import { Button } from "$lib/components/button/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const props: PropRow[] = [
		{
			name: "variant",
			type: '"default" | "outline" | "muted"',
			default: '"default"',
			description: "Root visual style. Rendered as data-variant.",
		},
		{
			name: "size",
			type: '"default" | "sm" | "xs"',
			default: '"default"',
			description: "Root padding, gap, and descendant media sizing. Rendered as data-size.",
		},
		{
			name: "child",
			type: "Snippet",
			description: "Render another root element, such as an anchor, with item props applied.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the rendered root element.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Root content, usually Item.Content with optional media and actions.",
		},
		{
			name: "Item.Group layout",
			type: '"default" | "grid"',
			default: '"default"',
			description: "Group layout. Grid mode uses the columns prop.",
		},
		{
			name: "Item.Group columns",
			type: "string",
			description: "Grid column count, written to --item-group-columns.",
		},
		{
			name: "Item.Group gap",
			type: '"default" | "xs" | "sm" | "lg"',
			default: '"default"',
			description: "Overrides the group gap when root size matching is not enough.",
		},
		{
			name: "Item.Content gap",
			type: '"default" | "none" | "xs" | "sm"',
			default: '"default"',
			description: "Content stack gap.",
		},
		{
			name: "Item.Content align",
			type: '"start" | "center" | "end"',
			description: "Text alignment for secondary content columns.",
		},
		{
			name: "Item.Content grow",
			type: "boolean",
			default: "true",
			description: "Set false for fixed-width secondary content.",
		},
		{
			name: "Item.Title clamp",
			type: "1 | 2 | \"none\"",
			default: "1",
			description: "Line clamp for the title.",
		},
		{
			name: "Item.Description clamp",
			type: "1 | 2 | \"none\"",
			default: "2",
			description: "Line clamp for the description.",
		},
		{
			name: "Item.Media variant",
			type: '"default" | "icon" | "image"',
			default: '"default"',
			description: "Media presentation. Image media resizes with the root size.",
		},
		{
			name: "Item.Media radius",
			type: '"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"',
			description: "Media corner radius. Omit to keep the skin default.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as Item from "fractalsvelte/item";
<\/script>

<Item.Root variant="outline">
  <Item.Content>
    <Item.Title>Basic item</Item.Title>
    <Item.Description>A compact content row with actions.</Item.Description>
  </Item.Content>
</Item.Root>`;

	const codeVariants = `<Item.Root>
  <Item.Content>
    <Item.Title>Default variant</Item.Title>
    <Item.Description>Subtle row styling with transparent border.</Item.Description>
  </Item.Content>
</Item.Root>

<Item.Root variant="outline">
  <Item.Content>
    <Item.Title>Outline variant</Item.Title>
    <Item.Description>A visible border around the row.</Item.Description>
  </Item.Content>
</Item.Root>

<Item.Root variant="muted">
  <Item.Content>
    <Item.Title>Muted variant</Item.Title>
    <Item.Description>A quiet filled treatment.</Item.Description>
  </Item.Content>
</Item.Root>`;

	const codeSizes = `<Item.Root variant="outline">
  <Item.Content>
    <Item.Title>Default size</Item.Title>
    <Item.Description>Standard row spacing.</Item.Description>
  </Item.Content>
</Item.Root>

<Item.Root variant="outline" size="sm">
  <Item.Content>
    <Item.Title>Small size</Item.Title>
  </Item.Content>
</Item.Root>

<Item.Root variant="outline" size="xs">
  <Item.Content>
    <Item.Title>Extra small size</Item.Title>
  </Item.Content>
</Item.Root>`;

	const codeMedia = `<Item.Root variant="outline">
  <Item.Media variant="icon">
    <ShieldIcon />
  </Item.Media>
  <Item.Content>
    <Item.Title>Security alert</Item.Title>
    <Item.Description>New login detected from an unknown device.</Item.Description>
  </Item.Content>
</Item.Root>

<Item.Root variant="outline">
  <Item.Media variant="image">
    <img src="/cover.jpg" alt="Album cover" />
  </Item.Media>
  <Item.Content>
    <Item.Title>Midnight City Lights</Item.Title>
    <Item.Description>Neon Dreams</Item.Description>
  </Item.Content>
</Item.Root>`;

	const codeGroup = `<Item.Group>
  <Item.Root>
    <Item.Content>
      <Item.Title>First item</Item.Title>
      <Item.Description>Grouped rows keep consistent rhythm.</Item.Description>
    </Item.Content>
  </Item.Root>
  <Item.Separator />
  <Item.Root>
    <Item.Content>
      <Item.Title>Second item</Item.Title>
      <Item.Description>Separators inherit the item spacing.</Item.Description>
    </Item.Content>
  </Item.Root>
</Item.Group>`;

	const codeLink = `<Item.Root size="sm">
  {#snippet child({ props })}
    <a href="/docs" {...props}>
      <Item.Content>
        <Item.Title>Visit documentation</Item.Title>
        <Item.Description>Open a linked row with item focus states.</Item.Description>
      </Item.Content>
      <Item.Actions>
        <ArrowRightIcon />
      </Item.Actions>
    </a>
  {/snippet}
</Item.Root>`;

	const codeGrid = `<Item.Group layout="grid" columns="3">
  <Item.Root variant="outline">
    <Item.Header>
      <img src="/image.jpg" alt="Model" />
    </Item.Header>
    <Item.Content>
      <Item.Title>v0-1.5-sm</Item.Title>
      <Item.Description>Everyday tasks and UI generation.</Item.Description>
    </Item.Content>
  </Item.Root>
</Item.Group>`;
</script>

<h1 class="doc-title">Item</h1>
<p class="doc-lede">Displays a flexible content row with media, body text, and actions.</p>

<Preview description="Item — outline row with action" code={usage}>
	<div style="width:min(100%,28rem)">
		<Item.Root variant="outline">
			<Item.Content>
				<Item.Title>Basic Item</Item.Title>
				<Item.Description>A simple item with title and description.</Item.Description>
			</Item.Content>
			<Item.Actions>
				<Button variant="outline" size="sm">Action</Button>
			</Item.Actions>
		</Item.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/item/` into your project. It depends on `separator`, and expects
`styles/_mixins.sass` and `styles/_tokens.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoVariants()}

<div class="box" style="gap:1rem; width:min(100%,28rem)">
<Item.Root>
<Item.Content>
<Item.Title>Default Variant</Item.Title>
<Item.Description>Standard styling with subtle borders.</Item.Description>
</Item.Content>
<Item.Actions>
<Button variant="outline" size="sm">Open</Button>
</Item.Actions>
</Item.Root>
<Item.Root variant="outline">
<Item.Content>
<Item.Title>Outline Variant</Item.Title>
<Item.Description>Outlined style with a visible border.</Item.Description>
</Item.Content>
<Item.Actions>
<Button variant="outline" size="sm">Open</Button>
</Item.Actions>
</Item.Root>
<Item.Root variant="muted">
<Item.Content>
<Item.Title>Muted Variant</Item.Title>
<Item.Description>Subdued appearance for secondary content.</Item.Description>
</Item.Content>
<Item.Actions>
<Button variant="outline" size="sm">Open</Button>
</Item.Actions>
</Item.Root>
</div>
{/snippet}

{#snippet demoSizes()}

<div class="box" style="gap:1rem; width:min(100%,28rem)">
<Item.Root variant="outline">
<Item.Content>
<Item.Title>Default size</Item.Title>
<Item.Description>Standard spacing for common rows.</Item.Description>
</Item.Content>
</Item.Root>
<Item.Root variant="outline" size="sm">
<Item.Media variant="icon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M20 6 9 17l-5-5" />
</svg>
</Item.Media>
<Item.Content>
<Item.Title>Small size</Item.Title>
</Item.Content>
</Item.Root>
<Item.Root variant="outline" size="xs">
<Item.Content>
<Item.Title>Extra small size</Item.Title>
</Item.Content>
</Item.Root>
</div>
{/snippet}

{#snippet demoMedia()}

<div class="box" style="gap:1rem; width:min(100%,28rem)">
<Item.Root variant="outline">
<Item.Media variant="icon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
<path d="M12 8v4" />
<path d="M12 16h.01" />
</svg>
</Item.Media>
<Item.Content>
<Item.Title>Security Alert</Item.Title>
<Item.Description>New login detected from an unknown device.</Item.Description>
</Item.Content>
</Item.Root>
<Item.Root variant="outline">
<Item.Media variant="image">
<img src="https://avatar.vercel.sh/midnight-city-lights" alt="Midnight City Lights" />
</Item.Media>
<Item.Content>
<Item.Title>Midnight City Lights</Item.Title>
<Item.Description>Neon Dreams</Item.Description>
</Item.Content>
<Item.Content grow={false} align="center">
<Item.Description>3:45</Item.Description>
</Item.Content>
</Item.Root>
</div>
{/snippet}

{#snippet demoGroup()}

<div style="width:min(100%,28rem)">
<Item.Group>
<Item.Root>
<Item.Content>
<Item.Title>First item</Item.Title>
<Item.Description>Grouped rows keep consistent rhythm.</Item.Description>
</Item.Content>
</Item.Root>
<Item.Separator />
<Item.Root>
<Item.Content>
<Item.Title>Second item</Item.Title>
<Item.Description>Separators inherit the item spacing.</Item.Description>
</Item.Content>
</Item.Root>
</Item.Group>
</div>
{/snippet}

{#snippet demoLink()}

<div style="width:min(100%,28rem)">
<Item.Root size="sm">
{#snippet child({ props })}
<a href="#top" {...props}>
<Item.Content>
<Item.Title>Visit documentation</Item.Title>
<Item.Description>Open a linked row with item focus states.</Item.Description>
</Item.Content>
<Item.Actions>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="m9 18 6-6-6-6" />
</svg>
</Item.Actions>
</a>
{/snippet}
</Item.Root>
</div>
{/snippet}

{#snippet demoGrid()}

<div style="width:min(100%,34rem)">
<Item.Group layout="grid" columns="3" gap="sm">
{#each ["v0-1.5-sm", "v0-1.5-lg", "v0-2.0-mini"] as model, index (model)}
<Item.Root variant="outline">
<Item.Header>
<img
src={`https://avatar.vercel.sh/${model}-${index}`}
alt={model}
width="128"
height="128"
style="aspect-ratio:1; width:100%; border-radius:var(--radius); object-fit:cover"
/>
</Item.Header>
<Item.Content>
<Item.Title>{model}</Item.Title>
<Item.Description>Everyday tasks and UI generation.</Item.Description>
</Item.Content>
</Item.Root>
{/each}
</Item.Group>
</div>
{/snippet}

<Examples
items={[
{ title: "Variants", demo: demoVariants, code: codeVariants },
{ title: "Sizes", demo: demoSizes, code: codeSizes },
{ title: "Media", demo: demoMedia, code: codeMedia },
{ title: "Group", demo: demoGroup, code: codeGroup },
{ title: "Link", demo: demoLink, code: codeLink },
{ title: "Grid", demo: demoGrid, code: codeGrid },
]}
/>

## Props

<PropsTable {props} />

## Theming

<div class="doc-table-wrap">

| Token                    | Used for                           |
| ------------------------ | ---------------------------------- |
| `--background`           | Action buttons used in examples.   |
| `--border`               | Outline item borders.              |
| `--muted`                | Muted item fill and anchor hover.  |
| `--muted-foreground`     | Item descriptions.                 |
| `--primary`              | Hovered links inside descriptions. |
| `--ring`                 | Focus-visible ring.                |
| `--radius`               | Image media radius.                |
| `--text-sm`              | Item text size.                    |
| `--text-sm--line-height` | Item text line height.             |

</div>
