<script lang="ts">
	import { ScrollArea } from "$lib/components/scroll-area/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	type Artwork = {
		artist: string;
		art: string;
	};

	const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`);

	const works: Artwork[] = [
		{
			artist: "Ornella Binni",
			art: "https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80",
		},
		{
			artist: "Tom Byrom",
			art: "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80",
		},
		{
			artist: "Vladimir Malyavko",
			art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
		},
	];

	const rootProps: PropRow[] = [
		{
			name: "orientation",
			type: '"vertical" | "horizontal" | "both"',
			default: '"vertical"',
			description: "Which scrollbar directions are rendered.",
		},
		{
			name: "width",
			type: "string",
			description: "CSS width for the root element.",
		},
		{
			name: "height",
			type: "string",
			description: "CSS height for the root element.",
		},
		{
			name: "maxWidth",
			type: "string",
			description: "CSS max-width for the root element.",
		},
		{
			name: "maxHeight",
			type: "string",
			description: "CSS max-height for the root element.",
		},
		{
			name: "padding",
			type: "string",
			description: "CSS padding applied to the root before the viewport is measured.",
		},
		{
			name: "bordered",
			type: "boolean",
			default: "false",
			description: "Adds a token border to the root.",
		},
		{
			name: "radius",
			type: '"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"',
			description: "Corner radius. Omit to keep square edges.",
		},
		{
			name: "whitespace",
			type: '"normal" | "nowrap"',
			description: "Controls white-space on the root, useful for horizontal content.",
		},
		{
			name: "viewportRef",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference to the viewport element.",
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference to the root element.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Scrollable content.",
		},
		{
			name: "scrollbarX / scrollbarY",
			type: "Snippet",
			description: "Optional custom scrollbar snippets for horizontal or vertical tracks.",
		},
	];

	const scrollbarProps: PropRow[] = [
		{
			name: "orientation",
			type: '"vertical" | "horizontal"',
			default: '"vertical"',
			description: "Scrollbar axis.",
		},
		{
			name: "forceMount",
			type: "boolean",
			description: "Keep the scrollbar mounted for external animation or measurement.",
		},
		{
			name: "ref",
			type: "HTMLElement | null",
			default: "null",
			description: "Bindable reference to the scrollbar element.",
		},
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import { ScrollArea } from "fractalsvelte/scroll-area";
<\/script>

<ScrollArea height="200px" width="350px" padding="1rem" bordered radius="md">
  Long content…
</ScrollArea>`;

	const codeVertical = `<ScrollArea height="18rem" width="12rem" bordered radius="md">
  <div style="padding:1rem">
    <h4>Tags</h4>
    <!-- repeated rows -->
  </div>
</ScrollArea>`;

	const codeHorizontal = `<ScrollArea width="24rem" bordered radius="md" whitespace="nowrap" orientation="horizontal">
  <div style="display:flex; width:max-content; gap:1rem; padding:1rem">
    <!-- wide content -->
  </div>
</ScrollArea>`;

	const codeBoth = `<ScrollArea height="200px" width="350px" padding="1rem" bordered radius="md" orientation="both">
  <div style="width:400px">Long content…</div>
</ScrollArea>`;
</script>

<h1 class="doc-title">Scroll Area</h1>
<p class="doc-lede">A scrollable viewport with token-styled custom scrollbars.</p>

<Preview description="Scroll Area — vertical content" code={usage}>
	<ScrollArea height="18rem" width="12rem" bordered radius="md">
		<div class="box" style="padding:1rem; gap:0.5rem">
			<h4 style="margin:0; font-size:var(--text-sm); line-height:var(--text-sm--line-height); font-weight:500">
				Tags
			</h4>
			{#each tags as tag (tag)}
				<div
					style="border-bottom:1px solid var(--border); padding-bottom:0.5rem; font-size:var(--text-sm); line-height:var(--text-sm--line-height)"
				>
					{tag}
				</div>
			{/each}
		</div>
	</ScrollArea>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/scroll-area/` into your project. It depends on `bits-ui`, and it
expects the library tokens and typography styles to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoVertical()}
<ScrollArea height="18rem" width="12rem" bordered radius="md">

<div class="box" style="padding:1rem; gap:0.5rem">
<h4
				style="margin:0; font-size:var(--text-sm); line-height:var(--text-sm--line-height); font-weight:500"
			>
Tags
</h4>
{#each tags as tag (tag)}
<div
					style="border-bottom:1px solid var(--border); padding-bottom:0.5rem; font-size:var(--text-sm); line-height:var(--text-sm--line-height)"
				>
{tag}
</div>
{/each}
</div>
</ScrollArea>
{/snippet}

{#snippet demoHorizontal()}
<ScrollArea width="24rem" bordered radius="md" whitespace="nowrap" orientation="horizontal">

<div class="row" style="width:max-content; gap:1rem; padding:1rem">
{#each works as artwork (artwork.artist)}
<figure style="margin:0; flex-shrink:0">
<div style="overflow:hidden; border-radius:calc(var(--radius) - 2px)">
<img
							src={artwork.art}
							alt="Photo by {artwork.artist}"
							style="display:block; aspect-ratio:3 / 4; height:auto; width:auto; object-fit:cover"
							width="300"
							height="400"
						/>
</div>
<figcaption
						style="padding-top:0.5rem; color:var(--muted-foreground); font-size:var(--text-xs); line-height:var(--text-xs--line-height)"
					>
Photo by <span style="color:var(--foreground); font-weight:600">{artwork.artist}</span>
</figcaption>
</figure>
{/each}
</div>
</ScrollArea>
{/snippet}

{#snippet demoBoth()}
<ScrollArea height="200px" width="350px" padding="1rem" bordered radius="md" orientation="both">

<div style="width:400px">
Jokester began sneaking into the castle in the middle of the night and leaving jokes all
over the place: under the king's pillow, in his soup, even in the royal toilet. The king
was furious, but he couldn't seem to stop Jokester. And then, one day, the people of the
kingdom discovered that the jokes left by Jokester were so funny that they couldn't help
but laugh. And once they started laughing, they couldn't stop.
</div>
</ScrollArea>
{/snippet}

<Examples
items={[
{ title: "Vertical", demo: demoVertical, code: codeVertical },
{ title: "Horizontal", demo: demoHorizontal, code: codeHorizontal },
{ title: "Both", demo: demoBoth, code: codeBoth },
]}
/>

## Props

<PropsTable props={rootProps} />

<PropsTable props={scrollbarProps} />

## Theming

Scroll Area reads `--border` for the root border and thumb colour, `--ring` for the viewport
focus state and `--radius` through the shared radius scale.
