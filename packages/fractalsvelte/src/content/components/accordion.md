<script lang="ts">
	import * as Accordion from "$lib/components/accordion/index.js";
	import { Button } from "$lib/components/button/index.js";
	import * as Card from "$lib/components/card/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const rootProps: PropRow[] = [
		{
			name: "type",
			type: '"single" | "multiple"',
			description: "Open one item or multiple items. Required by the headless primitive.",
		},
		{
			name: "value",
			type: "string | string[]",
			description: "Bindable open item value. string for single mode, string[] for multiple mode.",
		},
		{
			name: "variant",
			type: '"default" | "plain" | "card"',
			default: '"default"',
			description: "Container treatment. Rendered as data-variant.",
		},
		{
			name: "size",
			type: '"default" | "sm"',
			default: '"default"',
			description: "Trigger padding and content rhythm. Rendered as data-size.",
		},
		{
			name: "radius",
			type: '"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"',
			description: "Corner radius. Omit to keep the skin's 1rem frame.",
		},
		{
			name: "textSize",
			type: '"xs" | "sm" | "base" | "lg"',
			description: "Font size applied to the root. Trigger and content inherit where not overridden.",
		},
		{
			name: "textTransform",
			type: '"none" | "uppercase" | "lowercase" | "capitalize"',
			description: "Letter casing for accordion text.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Disables the whole accordion.",
		},
		{
			name: "loop",
			type: "boolean",
			default: "true",
			description: "Loops keyboard navigation between items.",
		},
		{
			name: "orientation",
			type: '"vertical" | "horizontal"',
			default: '"vertical"',
			description: "Keyboard orientation passed through to the headless primitive.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the root element.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Accordion items.",
		},
	];

	const itemProps: PropRow[] = [
		{
			name: "value",
			type: "string",
			description: "Item identity used by Root.value.",
		},
		{
			name: "disabled",
			type: "boolean",
			default: "false",
			description: "Prevents this item from opening.",
		},
		{
			name: "inset",
			type: "boolean",
			default: "false",
			description: "Adds the compact inset padding used by bordered examples.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the item element.",
		},
	];

	const triggerProps: PropRow[] = [
		{
			name: "level",
			type: "1 | 2 | 3 | 4 | 5 | 6",
			default: "3",
			description: "Heading level passed to the wrapping header.",
		},
		{
			name: "closedIcon",
			type: "Snippet",
			description: "Icon shown while the item is closed. Omit to use the built-in chevron.",
		},
		{
			name: "openIcon",
			type: "Snippet",
			description: "Icon shown while the item is open. Omit to use the built-in chevron.",
		},
		{
			name: "ref",
			type: "HTMLButtonElement | null",
			default: "null",
			description: "Bindable reference to the trigger button.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Trigger label.",
		},
	];

	const contentProps: PropRow[] = [
		{
			name: "tone",
			type: '"default" | "muted"',
			default: '"default"',
			description: "Content text tone. Rendered as data-tone.",
		},
		{
			name: "forceMount",
			type: "boolean",
			default: "true",
			description: "Keeps content mounted for measurement and animation.",
		},
		{
			name: "hiddenUntilFound",
			type: "boolean",
			default: "false",
			description: "Allows browser find-in-page to reveal closed content.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the content element.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Panel content.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as Accordion from "fractalsvelte/accordion";
<\/script>

<Accordion.Root type="single" value="item-1">
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Product Information</Accordion.Trigger>
    <Accordion.Content>
      Details about the product.
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>`;

	const codeBasic = `<Accordion.Root type="single" value="item-1">
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
    <Accordion.Content>Yes. Keyboard navigation and ARIA are provided.</Accordion.Content>
  </Accordion.Item>
</Accordion.Root>`;

	const codeMultiple = `<Accordion.Root type="multiple" value={["security"]}>
  <Accordion.Item value="billing">…</Accordion.Item>
  <Accordion.Item value="security">…</Accordion.Item>
</Accordion.Root>`;

	const codeVariants = `<Accordion.Root type="single" variant="plain">…</Accordion.Root>
<Accordion.Root type="single" variant="card">…</Accordion.Root>`;

	const codeCompact = `<Accordion.Root type="single" size="sm" radius="md">
  <Accordion.Item value="item-1" inset>…</Accordion.Item>
</Accordion.Root>`;

	const codeDisabled = `<Accordion.Item value="premium" disabled>
  <Accordion.Trigger>Premium feature information</Accordion.Trigger>
  <Accordion.Content>Upgrade your plan to access this content.</Accordion.Content>
</Accordion.Item>`;

	const codeCustomIcons = `{#snippet plusIcon()}
  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
{/snippet}

{#snippet minusIcon()}
  <svg viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
{/snippet}

<Accordion.Trigger closedIcon={plusIcon} openIcon={minusIcon}>
  Custom icons
</Accordion.Trigger>`;
</script>

<h1 class="doc-title">Accordion</h1>
<p class="doc-lede">A vertically stacked set of interactive headings that reveals one or more panels.</p>

<Preview description="Accordion — product information" code={usage} align="start">
	<Accordion.Root type="single" value="item-1" style="max-width:36rem">
		<Accordion.Item value="item-1">
			<Accordion.Trigger>Product Information</Accordion.Trigger>
			<Accordion.Content>
				<p>
					Our flagship product combines resilient engineering with a clean operational
					interface.
				</p>
				<p>
					Key features include advanced processing, audit-ready activity, and a workflow
					that supports both new and expert users.
				</p>
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-2">
			<Accordion.Trigger>Shipping Details</Accordion.Trigger>
			<Accordion.Content>
				<p>Standard delivery takes 3-5 business days. Express delivery takes 1-2 days.</p>
			</Accordion.Content>
		</Accordion.Item>
		<Accordion.Item value="item-3">
			<Accordion.Trigger>Return Policy</Accordion.Trigger>
			<Accordion.Content>
				<p>Return unopened items within 30 days for a full refund.</p>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/accordion/` into your project. It
expects `styles/_mixins.sass`, `_tokens.sass`, `_reset.sass` and `_typography.sass` to exist.

## Usage

<CodeBlock code={usage} />

Accordion is composed from `Root`, `Item`, `Trigger` and `Content`. `Root` owns the open
value. `Trigger` renders the heading and button. `Content` renders the animated panel.

## Examples

{#snippet demoBasic()}
<Accordion.Root type="single" value="item-1" style="width:min(100%,32rem)">
<Accordion.Item value="item-1">
<Accordion.Trigger>Is it accessible?</Accordion.Trigger>
<Accordion.Content>Yes. Keyboard navigation and ARIA are provided.</Accordion.Content>
</Accordion.Item>
<Accordion.Item value="item-2">
<Accordion.Trigger>Is it styled?</Accordion.Trigger>
<Accordion.Content>Yes. The visual layer reads the same tokens as the rest of the library.</Accordion.Content>
</Accordion.Item>
<Accordion.Item value="item-3">
<Accordion.Trigger>Is it animated?</Accordion.Trigger>
<Accordion.Content>Yes. Panels animate with the measured content height.</Accordion.Content>
</Accordion.Item>
</Accordion.Root>
{/snippet}

{#snippet demoMultiple()}
<Accordion.Root type="multiple" value={["security"]} style="width:min(100%,34rem)">
<Accordion.Item value="billing">
<Accordion.Trigger>How does billing work?</Accordion.Trigger>
<Accordion.Content tone="muted">
Billing runs at the beginning of each cycle. You can switch plans or cancel any time.
</Accordion.Content>
</Accordion.Item>
<Accordion.Item value="security">
<Accordion.Trigger>Is my data secure?</Accordion.Trigger>
<Accordion.Content tone="muted">
Data is encrypted in transit and at rest, with audit logs available for teams.
</Accordion.Content>
</Accordion.Item>
</Accordion.Root>
{/snippet}

{#snippet demoVariants()}
<Accordion.Root type="single" variant="plain" value="plain" style="width:min(100%,28rem)">
<Accordion.Item value="plain">
<Accordion.Trigger>Plain</Accordion.Trigger>
<Accordion.Content>Use this inside another framed surface.</Accordion.Content>
</Accordion.Item>
</Accordion.Root>
<Accordion.Root type="single" variant="card" value="card" style="width:min(100%,28rem)">
<Accordion.Item value="card">
<Accordion.Trigger>Card</Accordion.Trigger>
<Accordion.Content>Card adds the filled surface and shadow treatment.</Accordion.Content>
</Accordion.Item>
</Accordion.Root>
{/snippet}

{#snippet demoCompact()}
<Accordion.Root type="single" size="sm" radius="md" value="billing" style="width:min(100%,32rem)">
<Accordion.Item value="billing" inset>
<Accordion.Trigger>How does billing work?</Accordion.Trigger>
<Accordion.Content tone="muted">
Monthly and annual plans are available. Annual billing includes the team discount.
</Accordion.Content>
</Accordion.Item>
<Accordion.Item value="integration" inset>
<Accordion.Trigger>What integrations do you support?</Accordion.Trigger>
<Accordion.Content tone="muted">
The API supports webhook-based integrations and direct sync jobs.
</Accordion.Content>
</Accordion.Item>
</Accordion.Root>
{/snippet}

{#snippet demoInCard()}
<Card.Root style="width:min(100%,34rem)">
<Card.Header>
<Card.Title>Subscription & Billing</Card.Title>
<Card.Description>Common questions about your account, plans, and payments.</Card.Description>
</Card.Header>
<Card.Content>
<Accordion.Root type="multiple" variant="plain" value={["plans"]}>
<Accordion.Item value="plans">
<Accordion.Trigger>What subscription plans do you offer?</Accordion.Trigger>
<Accordion.Content>
<p>Starter, Professional and Enterprise plans are available.</p>
<Button size="sm" variant="outline">View plans</Button>
</Accordion.Content>
</Accordion.Item>
<Accordion.Item value="cancel">
<Accordion.Trigger>How do I cancel my subscription?</Accordion.Trigger>
<Accordion.Content>You can cancel from account settings without a cancellation fee.</Accordion.Content>
</Accordion.Item>
</Accordion.Root>
</Card.Content>
</Card.Root>
{/snippet}

{#snippet demoDisabled()}
<Accordion.Root type="single" value="history" style="width:min(100%,32rem)">
<Accordion.Item value="history">
<Accordion.Trigger>Can I access my account history?</Accordion.Trigger>
<Accordion.Content>Yes. Account history is available from the dashboard.</Accordion.Content>
</Accordion.Item>
<Accordion.Item value="premium" disabled>
<Accordion.Trigger>Premium feature information</Accordion.Trigger>
<Accordion.Content>Upgrade your plan to access this content.</Accordion.Content>
</Accordion.Item>
</Accordion.Root>
{/snippet}

{#snippet plusIcon()}
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M12 5v14M5 12h14" />
</svg>
{/snippet}

{#snippet minusIcon()}
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M5 12h14" />
</svg>
{/snippet}

{#snippet demoCustomIcons()}
<Accordion.Root type="single" value="icons" style="width:min(100%,28rem)">
<Accordion.Item value="icons">
<Accordion.Trigger closedIcon={plusIcon} openIcon={minusIcon}>Custom icons</Accordion.Trigger>
<Accordion.Content>Closed and open icons are passed as snippets.</Accordion.Content>
</Accordion.Item>
</Accordion.Root>
{/snippet}

<Examples
items={[
{ title: "Basic", demo: demoBasic, code: codeBasic },
{ title: "Multiple", demo: demoMultiple, code: codeMultiple },
{ title: "Variants", demo: demoVariants, code: codeVariants },
{ title: "Compact", demo: demoCompact, code: codeCompact },
{ title: "In card", demo: demoInCard, code: usage },
{ title: "Disabled", demo: demoDisabled, code: codeDisabled },
{ title: "Custom icons", demo: demoCustomIcons, code: codeCustomIcons },
]}
/>

## Props

### Accordion.Root

<PropsTable props={rootProps} />

### Accordion.Item

<PropsTable props={itemProps} />

### Accordion.Trigger

<PropsTable props={triggerProps} />

### Accordion.Content

<PropsTable props={contentProps} />

## Theming

Accordion reads these tokens. Override them on `:root`, or on any ancestor to scope a theme.

<div class="doc-table-wrap">

| Token                          | Used for                        |
| ------------------------------ | ------------------------------- |
| `--border`                     | Root frame and item dividers    |
| `--muted`                      | Open item background            |
| `--muted-foreground`           | Trigger icons and muted content |
| `--foreground`                 | Content link hover              |
| `--card` / `--card-foreground` | `card` variant surface and text |
| `--ring`                       | Focus-visible ring              |
| `--radius`                     | Radius override scale           |

</div>
