<script lang="ts">
	import { Button } from "$lib/components/button/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const props: PropRow[] = [
		{
			name: "variant",
			type: '"default" | "outline" | "secondary" | "ghost" | "destructive" | "link"',
			default: '"default"',
			description: "Visual style. Rendered as data-variant.",
		},
		{
			name: "size",
			type: '"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
			default: '"default"',
			description: "Height, padding, gap and icon size. Rendered as data-size.",
		},
		{
			name: "radius",
			type: '"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"',
			description: "Corner radius. Omit to keep the theme's pill shape.",
		},
		{
			name: "textSize",
			type: '"xs" | "sm" | "base" | "lg"',
			description: "Font size. Overrides whatever size would have set.",
		},
		{
			name: "textTransform",
			type: '"none" | "uppercase" | "lowercase" | "capitalize"',
			description: "Letter casing of the label.",
		},
		{
			name: "href",
			type: "string",
			description: "Renders an <a> instead of a <button>, styled identically.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description:
				"Dims and blocks interaction. On the anchor form, sets aria-disabled and removes href.",
		},
		{
			name: "type",
			type: '"button" | "submit" | "reset"',
			default: '"button"',
			description: "Native button type. Ignored when href is set.",
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
			description: "Button content. Icons are sized and spaced automatically.",
		},
	];

	const usage = `<script lang="ts">
  import { Button } from "fractalsvelte/button";
<\/script>

<Button variant="outline">Button</Button>`;

	const codeVariants = `<Button>default</Button>
<Button variant="outline">outline</Button>
<Button variant="secondary">secondary</Button>
<Button variant="ghost">ghost</Button>
<Button variant="destructive">destructive</Button>
<Button variant="link">link</Button>`;

	const codeSizes = `<Button size="xs">xs</Button>
<Button size="sm">sm</Button>
<Button>default</Button>
<Button size="lg">lg</Button>`;

	const codeIcons = `<Button size="icon" aria-label="Submit">
  <ArrowUpIcon />
</Button>`;

	const codeWithIcon = `<Button variant="outline" size="sm">
  <GitBranchIcon /> New Branch
</Button>`;

	const codeRadius = `<Button radius="none">none</Button>
<Button radius="md">md</Button>
<Button radius="full">full</Button>`;

	const codeTextSize = `<Button textSize="xs">xs</Button>
<Button textSize="lg">lg</Button>`;

	const codeTransform = `<Button textTransform="uppercase">uppercase</Button>
<Button textTransform="capitalize">capitalize</Button>`;

	const codeLink = `<Button href="/dashboard">Dashboard</Button>
<Button href="/dashboard" disabled>Dashboard</Button>`;

	const codeDisabled = `<Button disabled>Submit</Button>\n<Button variant="outline" disabled>Cancel</Button>`;

	const codeInstall = `npm i fractalsvelte`;
</script>

<h1 class="doc-title">Button</h1>
<p class="doc-lede">Displays a button, or a link that looks like one.</p>

<Preview description="Button — default and icon" code={codeVariants}>
	<Button variant="outline">Button</Button>
	<Button variant="outline" size="icon" aria-label="Submit">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M12 19V5M5 12l7-7 7 7" />
		</svg>
	</Button>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/button/` into your project — it has no runtime dependencies.
Copy `styles/_mixins.sass` and `_tokens.sass` too if you do not already have them.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoVariants()}
	<Button>default</Button>
	<Button variant="outline">outline</Button>
	<Button variant="secondary">secondary</Button>
	<Button variant="ghost">ghost</Button>
	<Button variant="destructive">destructive</Button>
	<Button variant="link">link</Button>
{/snippet}

{#snippet demoSizes()}
	<Button variant="outline" size="xs">xs</Button>
	<Button variant="outline" size="sm">sm</Button>
	<Button variant="outline">default</Button>
	<Button variant="outline" size="lg">lg</Button>
{/snippet}

{#snippet demoIconSizes()}
	<Button variant="outline" size="icon-xs" aria-label="icon-xs"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg></Button>
	<Button variant="outline" size="icon-sm" aria-label="icon-sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg></Button>
	<Button variant="outline" size="icon" aria-label="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg></Button>
	<Button variant="outline" size="icon-lg" aria-label="icon-lg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg></Button>
{/snippet}

{#snippet demoWithIcon()}
	<Button variant="outline" size="sm">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
		</svg>
		New Branch
	</Button>
	<Button size="sm">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
		</svg>
		Commit
	</Button>
{/snippet}

{#snippet demoRadius()}
	<Button variant="outline" radius="none">none</Button>
	<Button variant="outline" radius="sm">sm</Button>
	<Button variant="outline" radius="md">md</Button>
	<Button variant="outline" radius="lg">lg</Button>
	<Button variant="outline" radius="xl">xl</Button>
	<Button variant="outline" radius="2xl">2xl</Button>
	<Button variant="outline" radius="full">full</Button>
{/snippet}

{#snippet demoTextSize()}
	<Button variant="outline" textSize="xs">xs</Button>
	<Button variant="outline" textSize="sm">sm</Button>
	<Button variant="outline" textSize="base">base</Button>
	<Button variant="outline" textSize="lg">lg</Button>
{/snippet}

{#snippet demoTransform()}
	<Button variant="outline" textTransform="none">none</Button>
	<Button variant="outline" textTransform="uppercase">uppercase</Button>
	<Button variant="outline" textTransform="lowercase">LOWERCASE</Button>
	<Button variant="outline" textTransform="capitalize">capitalize me</Button>
{/snippet}

{#snippet demoLink()}
	<Button href="#top">Dashboard</Button>
	<Button href="#top" variant="outline" disabled>Disabled link</Button>
{/snippet}

{#snippet demoDisabled()}
	<Button disabled>Submit</Button>
	<Button variant="outline" disabled>Cancel</Button>
	<Button variant="ghost" disabled>Dismiss</Button>
{/snippet}

<Examples
	items={[
		{ title: "Variants", demo: demoVariants, code: codeVariants },
		{ title: "Sizes", demo: demoSizes, code: codeSizes },
		{ title: "Icon sizes", demo: demoIconSizes, code: codeIcons },
		{
			title: "With icon",
			demo: demoWithIcon,
			code: codeWithIcon,
			description: "Icon spacing comes from the size rules — icons need no margin.",
		},
		{ title: "Radius", demo: demoRadius, code: codeRadius },
		{
			title: "Text size",
			demo: demoTextSize,
			code: codeTextSize,
			description: "textSize is applied after size, so it wins.",
		},
		{ title: "Text transform", demo: demoTransform, code: codeTransform },
		{
			title: "As a link",
			demo: demoLink,
			code: codeLink,
			description:
				"With href it renders an <a>. Adding disabled drops the href and sets aria-disabled.",
		},
		{ title: "Disabled", demo: demoDisabled, code: codeDisabled },
	]}
/>

## Props

<PropsTable {props} />

## Theming

Button reads these tokens. Override them on `:root`, or on any ancestor to scope a theme.

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--primary` / `--primary-foreground` | `default` variant fill and label |
| `--secondary` / `--secondary-foreground` | `secondary` variant |
| `--muted` / `--foreground` | `outline` and `ghost` hover |
| `--background` | `outline` fill |
| `--border` | `outline` border |
| `--destructive` | `destructive` variant and invalid ring |
| `--input` | `outline` hover in dark mode |
| `--ring` | focus ring |
| `--radius` | all `radius` values except `2xl` and `full` |

</div>

The `aria-invalid="true"` attribute switches the border and focus ring to `--destructive`,
so form libraries get error styling without a prop.
