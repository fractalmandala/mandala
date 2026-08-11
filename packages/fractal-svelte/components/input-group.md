<script lang="ts">
	import * as InputGroup from '$lib/components/input-group/index.js';
	import * as DropdownMenu from '$lib/components/dropdown-menu/index.js';
	import { Label } from '$lib/components/label/index.js';
	import { Spinner } from '$lib/components/spinner/index.js';
	import { UseClipboard } from '$lib/hooks/use-clipboard.svelte.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let isFavorite = $state(false);
	const clipboard = new UseClipboard();

	const rootProps: PropRow[] = [
		{
			name: 'data-disabled',
			type: 'boolean | ""',
			description: 'Set on Root to dim addon content when the control is disabled.'
		},
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the group shell.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Addons, control, and nested buttons.'
		}
	];

	const addonProps: PropRow[] = [
		{
			name: 'align',
			type: '"inline-start" | "inline-end" | "block-start" | "block-end"',
			default: '"inline-start"',
			description: 'Addon placement relative to the control. Rendered as data-align.'
		},
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the addon.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Icons, text, buttons, labels, or spinners.'
		}
	];

	const buttonProps: PropRow[] = [
		{
			name: 'variant',
			type: 'ButtonVariant',
			default: '"ghost"',
			description: 'Forwarded to Button. Ghost keeps the control frame calm.'
		},
		{
			name: 'size',
			type: '"xs" | "sm" | "icon-xs" | "icon-sm"',
			default: '"xs"',
			description: 'Compact sizes tuned for the shell. Rendered as data-size on Button.'
		},
		{
			name: 'type',
			type: '"button" | "submit" | "reset"',
			default: '"button"',
			description: 'Native button type.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Label and/or icon.'
		}
	];

	const controlProps: PropRow[] = [
		{
			name: 'value',
			type: 'string',
			description: 'Bindable. Use bind:value for two-way binding.'
		},
		{
			name: 'placeholder',
			type: 'string',
			description: 'Muted placeholder text.'
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the field. Pair with data-disabled on Root for addon opacity.'
		},
		{
			name: 'data-slot',
			type: 'string',
			default: '"input-group-control"',
			description: 'Opts the field out of standalone Input/Textarea skin so the shell owns the frame.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import * as InputGroup from "fractalsvelte/input-group";
<\/script>

<InputGroup.Root>
  <InputGroup.Input placeholder="Search..." />
  <InputGroup.Addon>
    <!-- search icon -->
  </InputGroup.Addon>
  <InputGroup.Addon align="inline-end">12 results</InputGroup.Addon>
</InputGroup.Root>`;

	const codeHero = `<InputGroup.Root>
  <InputGroup.Input placeholder="Search..." />
  <InputGroup.Addon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  </InputGroup.Addon>
  <InputGroup.Addon align="inline-end">12 results</InputGroup.Addon>
</InputGroup.Root>`;

	const codeIcon = `<InputGroup.Root>
  <InputGroup.Input placeholder="Search..." />
  <InputGroup.Addon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  </InputGroup.Addon>
</InputGroup.Root>

<InputGroup.Root>
  <InputGroup.Input type="email" placeholder="Enter your email" />
  <InputGroup.Addon>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  </InputGroup.Addon>
</InputGroup.Root>`;

	const codeText = `<InputGroup.Root>
  <InputGroup.Addon>
    <InputGroup.Text>$</InputGroup.Text>
  </InputGroup.Addon>
  <InputGroup.Input placeholder="0.00" />
  <InputGroup.Addon align="inline-end">
    <InputGroup.Text>USD</InputGroup.Text>
  </InputGroup.Addon>
</InputGroup.Root>

<InputGroup.Root>
  <InputGroup.Addon>
    <InputGroup.Text>https://</InputGroup.Text>
  </InputGroup.Addon>
  <InputGroup.Input placeholder="example.com" />
  <InputGroup.Addon align="inline-end">
    <InputGroup.Text>.com</InputGroup.Text>
  </InputGroup.Addon>
</InputGroup.Root>`;

	const codeButton = `<InputGroup.Root>
  <InputGroup.Input placeholder="https://example.com" readonly />
  <InputGroup.Addon align="inline-end">
    <InputGroup.Button aria-label="Copy" size="icon-xs" onclick={() => clipboard.copy("…")}>
      <!-- copy icon -->
    </InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>

<InputGroup.Root>
  <InputGroup.Input placeholder="Type to search..." />
  <InputGroup.Addon align="inline-end">
    <InputGroup.Button variant="secondary">Search</InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>`;

	const codeTextarea = `<InputGroup.Root>
  <InputGroup.Addon align="block-start">
    <InputGroup.Text>script.js</InputGroup.Text>
    <InputGroup.Button size="icon-xs" style="margin-left: auto" aria-label="Refresh">
      <!-- refresh -->
    </InputGroup.Button>
    <InputGroup.Button variant="ghost" size="icon-xs" aria-label="Copy">
      <!-- copy -->
    </InputGroup.Button>
  </InputGroup.Addon>
  <InputGroup.Textarea placeholder="console.log('Hello, world!');" />
  <InputGroup.Addon align="block-end">
    <InputGroup.Text>Line 1, Column 1</InputGroup.Text>
    <InputGroup.Button size="sm" style="margin-left: auto" variant="default">
      Run
    </InputGroup.Button>
  </InputGroup.Addon>
</InputGroup.Root>`;

	const codeLabel = `<InputGroup.Root>
  <InputGroup.Input id="ig-email" placeholder="username" />
  <InputGroup.Addon>
    <Label for="ig-email">@</Label>
  </InputGroup.Addon>
</InputGroup.Root>

<InputGroup.Root>
  <InputGroup.Input id="ig-email-2" placeholder="you@example.com" />
  <InputGroup.Addon align="block-start">
    <Label for="ig-email-2">Email</Label>
  </InputGroup.Addon>
</InputGroup.Root>`;

	const codeSpinner = `<InputGroup.Root data-disabled>
  <InputGroup.Input placeholder="Searching..." disabled />
  <InputGroup.Addon align="inline-end">
    <Spinner />
  </InputGroup.Addon>
</InputGroup.Root>

<InputGroup.Root data-disabled>
  <InputGroup.Input placeholder="Saving changes..." disabled />
  <InputGroup.Addon align="inline-end">
    <InputGroup.Text>Saving...</InputGroup.Text>
    <Spinner />
  </InputGroup.Addon>
</InputGroup.Root>`;

	const codeDropdown = `<InputGroup.Root>
  <InputGroup.Input placeholder="Enter file name" />
  <InputGroup.Addon align="inline-end">
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <InputGroup.Button {...props} data-slot="button" variant="ghost" size="icon-xs" aria-label="More">
            <!-- more icon -->
          </InputGroup.Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item>Settings</DropdownMenu.Item>
        <DropdownMenu.Item>Copy path</DropdownMenu.Item>
        <DropdownMenu.Item>Open location</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </InputGroup.Addon>
</InputGroup.Root>`;
</script>

<h1 class="doc-title">Input Group</h1>
<p class="doc-lede">Compose inputs and textareas with icons, prefix/suffix text, buttons, labels, and loading indicators inside one shared frame.</p>

<Preview description="Input Group — search with results count" code={codeHero}>
	<div style="max-width: 24rem; margin-inline: auto; width: 100%">
		<InputGroup.Root>
			<InputGroup.Input placeholder="Search..." />
			<InputGroup.Addon>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
			</InputGroup.Addon>
			<InputGroup.Addon align="inline-end">12 results</InputGroup.Addon>
		</InputGroup.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/input-group/` into your project. It depends on `button`, `input`, and `textarea`, plus `styles/_mixins.sass` and `_tokens.sass`.

## Usage

<CodeBlock code={usage} />

The shell (`InputGroup.Root`) owns border, background, and focus ring. Controls use `data-slot="input-group-control"` so they stay transparent inside that frame. Put icons, text, and buttons in `InputGroup.Addon` with `align` for placement.

## Examples

{#snippet demoBasic()}
	<div class="box" style="gap: 1.5rem; max-width: 24rem; margin-inline: auto; width: 100%">
		<InputGroup.Root>
			<InputGroup.Input placeholder="Search..." />
			<InputGroup.Addon>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
			</InputGroup.Addon>
			<InputGroup.Addon align="inline-end">12 results</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Input placeholder="example.com" />
			<InputGroup.Addon>
				<InputGroup.Text>https://</InputGroup.Text>
			</InputGroup.Addon>
			<InputGroup.Addon align="inline-end">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16v-4M12 8h.01" />
				</svg>
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Input placeholder="@username" />
			<InputGroup.Addon align="inline-end">
				<span
					style="display:flex;width:1rem;height:1rem;align-items:center;justify-content:center;border-radius:9999px;background:var(--primary);color:var(--primary-foreground)"
					aria-hidden="true"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
						<path d="M20 6 9 17l-5-5" />
					</svg>
				</span>
			</InputGroup.Addon>
		</InputGroup.Root>
	</div>
{/snippet}

{#snippet demoIcon()}
	<div class="box" style="gap: 1.5rem; max-width: 24rem; margin-inline: auto; width: 100%">
		<InputGroup.Root>
			<InputGroup.Input placeholder="Search..." />
			<InputGroup.Addon>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Input type="email" placeholder="Enter your email" />
			<InputGroup.Addon>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<rect width="20" height="16" x="2" y="4" rx="2" />
					<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
				</svg>
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Input placeholder="Card number" />
			<InputGroup.Addon>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<rect width="20" height="14" x="2" y="5" rx="2" />
					<path d="M2 10h20" />
				</svg>
			</InputGroup.Addon>
			<InputGroup.Addon align="inline-end">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path d="M20 6 9 17l-5-5" />
				</svg>
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Input placeholder="Card number" />
			<InputGroup.Addon align="inline-end">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
				</svg>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16v-4M12 8h.01" />
				</svg>
			</InputGroup.Addon>
		</InputGroup.Root>
	</div>
{/snippet}

{#snippet demoText()}
	<div class="box" style="gap: 1.5rem; max-width: 24rem; margin-inline: auto; width: 100%">
		<InputGroup.Root>
			<InputGroup.Addon>
				<InputGroup.Text>$</InputGroup.Text>
			</InputGroup.Addon>
			<InputGroup.Input placeholder="0.00" />
			<InputGroup.Addon align="inline-end">
				<InputGroup.Text>USD</InputGroup.Text>
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Addon>
				<InputGroup.Text>https://</InputGroup.Text>
			</InputGroup.Addon>
			<InputGroup.Input placeholder="example.com" />
			<InputGroup.Addon align="inline-end">
				<InputGroup.Text>.com</InputGroup.Text>
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Input placeholder="Enter your username" />
			<InputGroup.Addon align="inline-end">
				<InputGroup.Text>@company.com</InputGroup.Text>
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Textarea placeholder="Enter your message" />
			<InputGroup.Addon align="block-end">
				<InputGroup.Text>120 characters left</InputGroup.Text>
			</InputGroup.Addon>
		</InputGroup.Root>
	</div>
{/snippet}

{#snippet demoButton()}
	<div class="box" style="gap: 1.5rem; max-width: 24rem; margin-inline: auto; width: 100%">
		<InputGroup.Root>
			<InputGroup.Input placeholder="https://example.com" readonly />
			<InputGroup.Addon align="inline-end">
				<InputGroup.Button
					aria-label="Copy"
					title="Copy"
					size="icon-xs"
					onclick={() => clipboard.copy('https://example.com')}
				>
					{#if clipboard.copied}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path d="M20 6 9 17l-5-5" />
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<rect width="14" height="14" x="8" y="8" rx="2" />
							<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
						</svg>
					{/if}
				</InputGroup.Button>
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Addon>
				<InputGroup.Text>https://</InputGroup.Text>
			</InputGroup.Addon>
			<InputGroup.Input placeholder="example.com" />
			<InputGroup.Addon align="inline-end">
				<InputGroup.Button
					onclick={() => (isFavorite = !isFavorite)}
					size="icon-xs"
					aria-label="Favorite"
					aria-pressed={isFavorite}
				>
					<svg
						viewBox="0 0 24 24"
						fill={isFavorite ? 'currentColor' : 'none'}
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
						style={isFavorite ? 'color: var(--primary)' : undefined}
					>
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
					</svg>
				</InputGroup.Button>
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Input placeholder="Type to search..." />
			<InputGroup.Addon align="inline-end">
				<InputGroup.Button variant="secondary">Search</InputGroup.Button>
			</InputGroup.Addon>
		</InputGroup.Root>
	</div>
{/snippet}

{#snippet demoTextarea()}
	<div style="max-width: 28rem; margin-inline: auto; width: 100%">
		<InputGroup.Root>
			<InputGroup.Addon align="block-start">
				<InputGroup.Text>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<path d="M20 4 12 12 4 4" />
						<path d="M4 20h16" />
					</svg>
					script.js
				</InputGroup.Text>
				<InputGroup.Button size="icon-xs" style="margin-left: auto" aria-label="Refresh">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
						<path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
						<path d="M16 16h5v5" />
					</svg>
				</InputGroup.Button>
				<InputGroup.Button variant="ghost" size="icon-xs" aria-label="Copy">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<rect width="14" height="14" x="8" y="8" rx="2" />
						<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
					</svg>
				</InputGroup.Button>
			</InputGroup.Addon>
			<InputGroup.Textarea
				placeholder="console.log('Hello, world!');"
				style="min-height: 10rem"
			/>
			<InputGroup.Addon align="block-end">
				<InputGroup.Text>Line 1, Column 1</InputGroup.Text>
				<InputGroup.Button size="sm" style="margin-left: auto" variant="default">
					Run
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<path d="m9 10 3 3 3-3M12 13V4" />
						<path d="M5 20h14" />
					</svg>
				</InputGroup.Button>
			</InputGroup.Addon>
		</InputGroup.Root>
	</div>
{/snippet}

{#snippet demoLabel()}
	<div class="box" style="gap: 1rem; max-width: 24rem; margin-inline: auto; width: 100%">
		<InputGroup.Root>
			<InputGroup.Input id="ig-email" placeholder="username" />
			<InputGroup.Addon>
				<Label for="ig-email">@</Label>
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Input id="ig-email-2" placeholder="you@example.com" />
			<InputGroup.Addon align="block-start">
				<Label for="ig-email-2">Email</Label>
			</InputGroup.Addon>
		</InputGroup.Root>
	</div>
{/snippet}

{#snippet demoSpinner()}
	<div class="box" style="gap: 1rem; max-width: 24rem; margin-inline: auto; width: 100%">
		<InputGroup.Root data-disabled>
			<InputGroup.Input placeholder="Searching..." disabled />
			<InputGroup.Addon align="inline-end">
				<Spinner />
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root data-disabled>
			<InputGroup.Input placeholder="Processing..." disabled />
			<InputGroup.Addon>
				<Spinner />
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root data-disabled>
			<InputGroup.Input placeholder="Saving changes..." disabled />
			<InputGroup.Addon align="inline-end">
				<InputGroup.Text>Saving...</InputGroup.Text>
				<Spinner />
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root data-disabled>
			<InputGroup.Input placeholder="Refreshing data..." disabled />
			<InputGroup.Addon>
				<Spinner />
			</InputGroup.Addon>
			<InputGroup.Addon align="inline-end">
				<InputGroup.Text>Please wait...</InputGroup.Text>
			</InputGroup.Addon>
		</InputGroup.Root>
	</div>
{/snippet}

{#snippet demoDropdown()}
	<div class="box" style="gap: 1rem; max-width: 24rem; margin-inline: auto; width: 100%">
		<InputGroup.Root>
			<InputGroup.Input placeholder="Enter file name" />
			<InputGroup.Addon align="inline-end">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<InputGroup.Button
								{...props}
								data-slot="button"
								variant="ghost"
								aria-label="More"
								size="icon-xs"
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
									<circle cx="12" cy="12" r="1" />
									<circle cx="19" cy="12" r="1" />
									<circle cx="5" cy="12" r="1" />
								</svg>
							</InputGroup.Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item>Settings</DropdownMenu.Item>
						<DropdownMenu.Item>Copy path</DropdownMenu.Item>
						<DropdownMenu.Item>Open location</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</InputGroup.Addon>
		</InputGroup.Root>
		<InputGroup.Root>
			<InputGroup.Input placeholder="Enter search query" />
			<InputGroup.Addon align="inline-end">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<InputGroup.Button {...props} data-slot="button" variant="ghost">
								Search In...
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" aria-hidden="true">
									<path d="m6 9 6 6 6-6" />
								</svg>
							</InputGroup.Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item>Documentation</DropdownMenu.Item>
						<DropdownMenu.Item>Blog Posts</DropdownMenu.Item>
						<DropdownMenu.Item>Changelog</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</InputGroup.Addon>
		</InputGroup.Root>
	</div>
{/snippet}

<Examples
	items={[
		{ title: 'Basic', demo: demoBasic, code: codeHero },
		{ title: 'Icon', demo: demoIcon, code: codeIcon },
		{ title: 'Text', demo: demoText, code: codeText },
		{ title: 'Button', demo: demoButton, code: codeButton },
		{ title: 'Textarea', demo: demoTextarea, code: codeTextarea },
		{ title: 'Label', demo: demoLabel, code: codeLabel },
		{ title: 'Spinner', demo: demoSpinner, code: codeSpinner },
		{ title: 'Dropdown', demo: demoDropdown, code: codeDropdown }
	]}
/>

## Props

### InputGroup.Root

<PropsTable props={rootProps} />

### InputGroup.Addon

<PropsTable props={addonProps} />

### InputGroup.Button

Keeps `data-slot="button"` so button skin applies. Group-specific radius and density live under the shell.

<PropsTable props={buttonProps} />

### InputGroup.Input / InputGroup.Textarea

Forward native field props. Both force `data-slot="input-group-control"`.

<PropsTable props={controlProps} />

### InputGroup.Text

Muted helper text (and inline icons) for addons. No variant props — colour comes from the text skin.

## Theming

Tokens read by the shell and parts:

- `--input` — shell background (mixed 50% transparent)
- `--ring` — focus border and ring on the shell
- `--destructive` — invalid border/ring when a slotted control has `aria-invalid`
- `--muted-foreground` — addon and text colour, placeholders
- `--foreground` — control text
- `--text-sm` / `--text-sm--line-height` — type scale
- `--radius` — used in compact button corner math (`calc(var(--radius) + 4px)`)

Structure hooks:

- `[data-slot=input-group]` — shell
- `[data-slot=input-group-control]` — transparent field
- `[data-slot=input-group-addon]` + `[data-align=…]` — addon layout
- `[data-slot=input-group-text]` — muted text
- nested `[data-slot=button]` — compact pill buttons inside the group
