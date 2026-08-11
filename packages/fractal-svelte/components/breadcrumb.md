<script lang="ts">
	import * as Breadcrumb from "$lib/components/breadcrumb/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const props: PropRow[] = [
		{
			name: "child",
			type: "Snippet<[{ props }]>",
			description:
				"Link only. Render a different element — a framework link component — with the link's props applied.",
		},
		{
			name: "children",
			type: "Snippet",
			description:
				"On Separator, replaces the default chevron. Elsewhere, the content.",
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
  import * as Breadcrumb from "fractalsvelte/breadcrumb";
<\/script>

<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page>Settings</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>`;

	const codeSeparator = `<!-- Pass children to replace the chevron. -->
<Breadcrumb.Separator>/</Breadcrumb.Separator>`;

	const codeEllipsis = `<Breadcrumb.Item>
  <Breadcrumb.Ellipsis />
</Breadcrumb.Item>`;

	const codeChild = `<!-- Render a framework link with the breadcrumb's props. -->
<Breadcrumb.Link>
  {#snippet child({ props })}
    <a {...props} href="/docs">Docs</a>
  {/snippet}
</Breadcrumb.Link>`;
</script>

<h1 class="doc-title">Breadcrumb</h1>
<p class="doc-lede">Shows where a page sits in the site hierarchy.</p>

<Preview description="Breadcrumb — default" code={usage}>
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Link href="#top">Home</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Link href="#top">Components</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/breadcrumb/` into your project — it has no runtime dependencies
and the chevron is inline.

## Usage

<CodeBlock code={usage} />

`Root` is a `<nav aria-label="breadcrumb">` and `List` is an `<ol>`, so the trail is announced
as an ordered navigation landmark. Mark the final crumb with `Page`, not `Link` — it carries
`aria-current="page"` and is deliberately not actionable.

## Examples

{#snippet demoDefault()}
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Link href="#top">Home</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Link href="#top">Components</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>
{/snippet}

{#snippet demoSeparator()}
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Link href="#top">Home</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator>/</Breadcrumb.Separator>
			<Breadcrumb.Item>
				<Breadcrumb.Link href="#top">Docs</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator>·</Breadcrumb.Separator>
			<Breadcrumb.Item>
				<Breadcrumb.Page>Current</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>
{/snippet}

{#snippet demoEllipsis()}
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Link href="#top">Home</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Ellipsis />
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Link href="#top">Components</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page>Breadcrumb</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>
{/snippet}

{#snippet demoChild()}
	<Breadcrumb.Root>
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Link>
					{#snippet child({ props })}
						<a {...props} href="#top" data-custom>Custom link element</a>
					{/snippet}
				</Breadcrumb.Link>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			<Breadcrumb.Item>
				<Breadcrumb.Page>Current</Breadcrumb.Page>
			</Breadcrumb.Item>
		</Breadcrumb.List>
	</Breadcrumb.Root>
{/snippet}

<Examples
	items={[
		{ title: "Default", demo: demoDefault, code: usage },
		{
			title: "Custom separator",
			demo: demoSeparator,
			code: codeSeparator,
			description: "Pass children to Separator to replace the chevron.",
		},
		{
			title: "Ellipsis",
			demo: demoEllipsis,
			code: codeEllipsis,
			description: "Collapses a long trail. Announced as “More” to screen readers.",
		},
		{
			title: "Custom link element",
			demo: demoChild,
			code: codeChild,
			description: "The child snippet hands you the props to spread onto your own element.",
		},
	]}
/>

## Props

Every part forwards its native attributes.

<PropsTable {props} />

Parts: `Root`, `List`, `Item`, `Link`, `Page`, `Separator`, `Ellipsis`.

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--muted-foreground` | the trail |
| `--foreground` | current page, and links on hover |
| `--text-sm` | text size |

</div>

The list gap widens from `0.375rem` to `0.625rem` at the `sm` breakpoint, so a trail stays
compact on narrow screens and breathes on wider ones. Separators and the ellipsis are
`aria-hidden` — only the links and the current page are announced.
