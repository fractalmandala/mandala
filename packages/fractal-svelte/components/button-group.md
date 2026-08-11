<script lang="ts">
	import { Button } from "$lib/components/button/index.js";
	import * as ButtonGroup from "$lib/components/button-group/index.js";
	import * as DropdownMenu from "$lib/components/dropdown-menu/index.js";
	import { Input } from "$lib/components/input/index.js";
	import * as Popover from "$lib/components/popover/index.js";
	import Preview from "$lib/docs/Preview.svelte";
	import Examples from "$lib/docs/Examples.svelte";
	import PropsTable from "$lib/docs/PropsTable.svelte";
	import CodeBlock from "$lib/docs/CodeBlock.svelte";
	import type { PropRow } from "$lib/docs/PropsTable.svelte";

	const props: PropRow[] = [
		{
			name: "orientation",
			type: '"horizontal" | "vertical"',
			default: '"horizontal"',
			description: "Direction the grouped controls flow. Rendered as data-orientation.",
		},
		{
			name: "ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the rendered group element.",
		},
		{
			name: "children",
			type: "Snippet",
			description: "Controls rendered inside the group.",
		},
		{
			name: "ButtonGroup.Separator orientation",
			type: '"horizontal" | "vertical"',
			default: '"vertical"',
			description: "Axis of the separator inside the group.",
		},
		{
			name: "ButtonGroup.Separator ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the rendered separator element.",
		},
		{
			name: "ButtonGroup.Text child",
			type: "Snippet",
			description: "Render another element while preserving button-group text styling.",
		},
		{
			name: "ButtonGroup.Text ref",
			type: "HTMLDivElement | null",
			default: "null",
			description: "Bindable reference to the rendered text element.",
		},
		{
			name: "ButtonGroup.Text children",
			type: "Snippet",
			description: "Static text or icon content displayed as a grouped item.",
		},
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Button } from "fractalsvelte/button";
  import * as ButtonGroup from "fractalsvelte/button-group";
<\/script>

<ButtonGroup.Root>
  <Button variant="outline">Copy</Button>
  <Button variant="outline">Paste</Button>
</ButtonGroup.Root>`;

	const codeBasic = `<ButtonGroup.Root>
  <Button variant="outline">Archive</Button>
  <Button variant="outline">Report</Button>
  <Button variant="outline">Snooze</Button>
</ButtonGroup.Root>`;

	const codeSizes = `<ButtonGroup.Root>
  <Button variant="outline" size="sm">Small</Button>
  <Button variant="outline" size="sm">Group</Button>
  <Button variant="outline" size="icon-sm" aria-label="Add">+</Button>
</ButtonGroup.Root>

<ButtonGroup.Root>
  <Button variant="outline">Default</Button>
  <Button variant="outline">Group</Button>
  <Button variant="outline" size="icon" aria-label="Add">+</Button>
</ButtonGroup.Root>

<ButtonGroup.Root>
  <Button variant="outline" size="lg">Large</Button>
  <Button variant="outline" size="lg">Group</Button>
  <Button variant="outline" size="icon-lg" aria-label="Add">+</Button>
</ButtonGroup.Root>`;

	const codeOrientation = `<ButtonGroup.Root orientation="vertical" aria-label="Zoom controls">
  <Button variant="outline" size="icon" aria-label="Zoom in">+</Button>
  <Button variant="outline" size="icon" aria-label="Zoom out">-</Button>
</ButtonGroup.Root>`;

	const codeSeparator = `<ButtonGroup.Root>
  <Button variant="secondary" size="sm">Copy</Button>
  <ButtonGroup.Separator />
  <Button variant="secondary" size="sm">Paste</Button>
</ButtonGroup.Root>`;

	const codeInput = `<ButtonGroup.Root>
  <Input placeholder="Search..." />
  <Button variant="outline" size="icon" aria-label="Search">
    <SearchIcon />
  </Button>
</ButtonGroup.Root>`;

	const codeNested = `<ButtonGroup.Root>
  <ButtonGroup.Root>
    <Button variant="outline" size="sm">1</Button>
    <Button variant="outline" size="sm">2</Button>
    <Button variant="outline" size="sm">3</Button>
  </ButtonGroup.Root>
  <ButtonGroup.Root>
    <Button variant="outline" size="icon-sm" aria-label="Previous">Prev</Button>
    <Button variant="outline" size="icon-sm" aria-label="Next">Next</Button>
  </ButtonGroup.Root>
</ButtonGroup.Root>`;

	const codeDropdown = `<ButtonGroup.Root>
  <Button variant="outline">Follow</Button>
  <DropdownMenu.Root>
    <DropdownMenu.Trigger>
      {#snippet child({ props })}
        <Button {...props} variant="outline" aria-label="More options">More</Button>
      {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item>Mute conversation</DropdownMenu.Item>
      <DropdownMenu.Item>Share conversation</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item variant="destructive">Delete conversation</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</ButtonGroup.Root>`;

	const codePopover = `<ButtonGroup.Root>
  <Button variant="outline" size="sm">Agent</Button>
  <Popover.Root>
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button {...props} variant="outline" size="icon-sm" aria-label="Open panel">Open</Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content align="end" width="18rem">
      <h3>Agent tasks</h3>
      <p>Describe the task and start a background run.</p>
    </Popover.Content>
  </Popover.Root>
</ButtonGroup.Root>`;
</script>

<h1 class="doc-title">Button Group</h1>
<p class="doc-lede">Groups related buttons and controls so their borders, radii and focus states behave as one unit.</p>

<Preview description="Button Group — grouped actions" code={usage}>
	<ButtonGroup.Root>
		<Button variant="outline">Archive</Button>
		<Button variant="outline">Report</Button>
		<Button variant="outline">Snooze</Button>
	</ButtonGroup.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/button-group/` into your project. It expects `button`,
`separator`, `styles/_mixins.sass` and `styles/_tokens.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoBasic()}
<ButtonGroup.Root>
<Button variant="outline">Archive</Button>
<Button variant="outline">Report</Button>
<Button variant="outline">Snooze</Button>
</ButtonGroup.Root>
{/snippet}

{#snippet demoSizes()}

<div class="box" style="align-items:flex-start; gap:2rem">
<ButtonGroup.Root>
<Button variant="outline" size="sm">Small</Button>
<Button variant="outline" size="sm">Group</Button>
<Button variant="outline" size="icon-sm" aria-label="Add">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M12 5v14M5 12h14" />
</svg>
</Button>
</ButtonGroup.Root>
<ButtonGroup.Root>
<Button variant="outline">Default</Button>
<Button variant="outline">Group</Button>
<Button variant="outline" size="icon" aria-label="Add">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M12 5v14M5 12h14" />
</svg>
</Button>
</ButtonGroup.Root>
<ButtonGroup.Root>
<Button variant="outline" size="lg">Large</Button>
<Button variant="outline" size="lg">Group</Button>
<Button variant="outline" size="icon-lg" aria-label="Add">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M12 5v14M5 12h14" />
</svg>
</Button>
</ButtonGroup.Root>
</div>
{/snippet}

{#snippet demoOrientation()}
<ButtonGroup.Root orientation="vertical" aria-label="Zoom controls">
<Button variant="outline" size="icon" aria-label="Zoom in">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M12 5v14M5 12h14" />
</svg>
</Button>
<Button variant="outline" size="icon" aria-label="Zoom out">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<path d="M5 12h14" />
</svg>
</Button>
</ButtonGroup.Root>
{/snippet}

{#snippet demoSeparator()}
<ButtonGroup.Root>
<Button variant="secondary" size="sm">Copy</Button>
<ButtonGroup.Separator />
<Button variant="secondary" size="sm">Paste</Button>
</ButtonGroup.Root>
{/snippet}

{#snippet demoInput()}
<ButtonGroup.Root>
<Input placeholder="Search..." />
<Button variant="outline" size="icon" aria-label="Search">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
<circle cx="11" cy="11" r="7" />
<path d="m21 21-4.3-4.3" />
</svg>
</Button>
</ButtonGroup.Root>
{/snippet}

{#snippet demoNested()}
<ButtonGroup.Root>
<ButtonGroup.Root>
<Button variant="outline" size="sm">1</Button>
<Button variant="outline" size="sm">2</Button>
<Button variant="outline" size="sm">3</Button>
</ButtonGroup.Root>
<ButtonGroup.Root>
<Button variant="outline" size="icon-sm" aria-label="Previous">Prev</Button>
<Button variant="outline" size="icon-sm" aria-label="Next">Next</Button>
</ButtonGroup.Root>
</ButtonGroup.Root>
{/snippet}

{#snippet demoDropdown()}
<ButtonGroup.Root>
<Button variant="outline">Follow</Button>
<DropdownMenu.Root>
<DropdownMenu.Trigger>
{#snippet child({ props })}
<Button {...props} variant="outline" aria-label="More options">More</Button>
{/snippet}
</DropdownMenu.Trigger>
<DropdownMenu.Content align="end">
<DropdownMenu.Item>Mute conversation</DropdownMenu.Item>
<DropdownMenu.Item>Share conversation</DropdownMenu.Item>
<DropdownMenu.Separator />
<DropdownMenu.Item variant="destructive">Delete conversation</DropdownMenu.Item>
</DropdownMenu.Content>
</DropdownMenu.Root>
</ButtonGroup.Root>
{/snippet}

{#snippet demoPopover()}
<ButtonGroup.Root>
<Button variant="outline" size="sm">Agent</Button>
<Popover.Root>
<Popover.Trigger>
{#snippet child({ props })}
<Button {...props} variant="outline" size="icon-sm" aria-label="Open panel">Open</Button>
{/snippet}
</Popover.Trigger>
<Popover.Content align="end" width="18rem">

<h3 style="font-size:var(--text-sm); font-weight:500; line-height:1">Agent tasks</h3>
<p style="margin-top:0.5rem; color:var(--muted-foreground); font-size:var(--text-sm)">
Describe the task and start a background run.
</p>
</Popover.Content>
</Popover.Root>
</ButtonGroup.Root>
{/snippet}

<Examples
items={[
{ title: "Basic", demo: demoBasic, code: codeBasic },
{ title: "Sizes", demo: demoSizes, code: codeSizes },
{ title: "Orientation", demo: demoOrientation, code: codeOrientation },
{ title: "Separator", demo: demoSeparator, code: codeSeparator },
{ title: "Input", demo: demoInput, code: codeInput },
{ title: "Nested", demo: demoNested, code: codeNested },
{ title: "Dropdown", demo: demoDropdown, code: codeDropdown },
{ title: "Popover", demo: demoPopover, code: codePopover },
]}
/>

## Props

<PropsTable {props} />

## Theming

<div class="doc-table-wrap">

| Token      | Used for                         |
| ---------- | -------------------------------- |
| `--border` | Outline child edge repair.       |
| `--input`  | Button group separator color.    |
| `--muted`  | Button group text background.    |
| `--ring`   | Focus-visible edge repair color. |

</div>
