<script lang="ts">
	import { Button } from '$lib/components/button/index.js';
	import * as Drawer from '$lib/components/drawer/index.js';
	import { Input } from '$lib/components/input/index.js';
	import { Label } from '$lib/components/label/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let goal = $state(350);

	function adjustGoal(delta: number) {
		goal = Math.max(200, Math.min(400, goal + delta));
	}

	const rootProps: PropRow[] = [
		{
			name: 'open',
			type: 'boolean',
			default: 'false',
			description: 'Bindable open state.'
		},
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			description: 'Called when the open state changes.'
		},
		{
			name: 'direction',
			type: '"top" | "bottom" | "left" | "right"',
			default: '"bottom"',
			description: 'Edge the drawer slides in from.'
		},
		{
			name: 'shouldScaleBackground',
			type: 'boolean',
			default: 'true',
			description: 'Scales the page background while the drawer is open.'
		},
		{
			name: 'dismissible',
			type: 'boolean',
			default: 'true',
			description: 'Allows drag, overlay click, and Escape to close.'
		},
		{
			name: 'modal',
			type: 'boolean',
			default: 'true',
			description: 'When false, outside content stays interactive.'
		},
		{
			name: 'handleOnly',
			type: 'boolean',
			default: 'false',
			description: 'Restricts dragging to the bottom handle.'
		},
		{
			name: 'activeSnapPoint',
			type: 'number | string | null',
			description: 'Bindable active snap point when snapPoints is set.'
		},
		{
			name: 'snapPoints',
			type: '(number | string)[]',
			description: 'Snap heights as fractions (0–1) or pixel strings.'
		},
		{ name: 'children', type: 'Snippet', description: 'Trigger and drawer content.' }
	];

	const contentProps: PropRow[] = [
		{
			name: 'portalProps',
			type: 'Drawer.PortalProps',
			description: 'Props forwarded to the portal wrapper.'
		},
		{ name: 'children', type: 'Snippet', description: 'Header, body, and footer.' },
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the content panel.'
		}
	];

	const sectionProps: PropRow[] = [
		{ name: 'children', type: 'Snippet', description: 'Section content.' },
		{
			name: 'ref',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Bindable reference to the element.'
		}
	];

	const triggerCloseProps: PropRow[] = [
		{ name: 'child', type: 'Snippet', description: 'Render a custom control element.' },
		{ name: 'children', type: 'Snippet', description: 'Control label or content.' },
		{
			name: 'ref',
			type: 'HTMLButtonElement | null',
			default: 'null',
			description: 'Bindable reference to the control.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;
	const usage = `<script lang="ts">
  import * as Drawer from "fractalsvelte/drawer";
  import { Button } from "fractalsvelte/button";
<\/script>

<Drawer.Root>
  <Drawer.Trigger>
    {#snippet child({ props })}
      <Button variant="outline" {...props}>Open Drawer</Button>
    {/snippet}
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Are you sure?</Drawer.Title>
      <Drawer.Description>This action cannot be undone.</Drawer.Description>
    </Drawer.Header>
    <Drawer.Footer>
      <Button>Continue</Button>
      <Drawer.Close>
        {#snippet child({ props })}
          <Button variant="outline" {...props}>Cancel</Button>
        {/snippet}
      </Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>`;

	const codeBasic = usage;

	const codeDirections = `{#each ["top", "right", "bottom", "left"] as side}
  <Drawer.Root direction={side}>
    <Drawer.Trigger>
      {#snippet child({ props })}
        <Button variant="outline" {...props}>{side}</Button>
      {/snippet}
    </Drawer.Trigger>
    <Drawer.Content>
      <Drawer.Header>
        <Drawer.Title>Drawer</Drawer.Title>
        <Drawer.Description>Slides in from the {side}.</Drawer.Description>
      </Drawer.Header>
      <Drawer.Footer>
        <Drawer.Close>
          {#snippet child({ props })}
            <Button variant="outline" {...props}>Close</Button>
          {/snippet}
        </Drawer.Close>
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>
{/each}`;

	const codeForm = `<Drawer.Root>
  <Drawer.Trigger>
    {#snippet child({ props })}
      <Button variant="outline" {...props}>Edit profile</Button>
    {/snippet}
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Edit profile</Drawer.Title>
      <Drawer.Description>Make changes to your profile here.</Drawer.Description>
    </Drawer.Header>
    <form style="display: grid; gap: 1rem; padding: 0 1rem;">
      <div style="display: grid; gap: 0.5rem;">
        <Label for="drawer-email">Email</Label>
        <Input id="drawer-email" type="email" value="ada@example.com" />
      </div>
      <div style="display: grid; gap: 0.5rem;">
        <Label for="drawer-username">Username</Label>
        <Input id="drawer-username" value="@ada" />
      </div>
    </form>
    <Drawer.Footer>
      <Button type="submit">Save changes</Button>
      <Drawer.Close>
        {#snippet child({ props })}
          <Button variant="outline" {...props}>Cancel</Button>
        {/snippet}
      </Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>`;

	const sides = ['top', 'right', 'bottom', 'left'] as const;
</script>

<h1 class="doc-title">Drawer</h1>
<p class="doc-lede">
	A gesture-driven panel that slides in from any edge, with a portalled overlay,
	draggable content, and header / footer / title / description parts.
</p>

<Preview description="Drawer — move goal" code={codeBasic} align="center">
	<Drawer.Root>
		<Drawer.Trigger>
			{#snippet child({ props })}
				<Button variant="outline" {...props}>Open Drawer</Button>
			{/snippet}
		</Drawer.Trigger>
		<Drawer.Content>
			<div style="margin-inline: auto; width: 100%; max-width: 24rem;">
				<Drawer.Header>
					<Drawer.Title>Move Goal</Drawer.Title>
					<Drawer.Description>Set your daily activity goal.</Drawer.Description>
				</Drawer.Header>
				<div style="padding: 1rem 1rem 0; display: flex; flex-direction: column; gap: 1rem;">
					<div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
						<Button
							variant="outline"
							size="icon"
							onclick={() => adjustGoal(-10)}
							disabled={goal <= 200}
							aria-label="Decrease"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
								<path d="M5 12h14" />
							</svg>
						</Button>
						<div style="flex: 1; text-align: center;">
							<div style="font-size: 3.5rem; font-weight: 700; letter-spacing: -0.04em; line-height: 1;">
								{goal}
							</div>
							<div style="color: var(--muted-foreground); font-size: 0.7rem; text-transform: uppercase;">
								Calories/day
							</div>
						</div>
						<Button
							variant="outline"
							size="icon"
							onclick={() => adjustGoal(10)}
							disabled={goal >= 400}
							aria-label="Increase"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
								<path d="M5 12h14" />
								<path d="M12 5v14" />
							</svg>
						</Button>
					</div>
				</div>
				<Drawer.Footer>
					<Button>Submit</Button>
					<Drawer.Close>
						{#snippet child({ props })}
							<Button variant="outline" {...props}>Cancel</Button>
						{/snippet}
					</Drawer.Close>
				</Drawer.Footer>
			</div>
		</Drawer.Content>
	</Drawer.Root>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/drawer/` into your project. It
expects
`styles/_tokens.sass`, `_typography.sass` and `_mixins.sass` to exist.

## Usage

<CodeBlock code={usage} />

Compose triggers and close controls with `Button` via the `child` snippet — the
library does not merge class strings onto the primitives.

## Examples

{#snippet demoBasic()}
	<div style="display: flex; justify-content: center; width: 100%;">
		<Drawer.Root>
			<Drawer.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" {...props}>Open Drawer</Button>
				{/snippet}
			</Drawer.Trigger>
			<Drawer.Content>
				<div style="margin-inline: auto; width: 100%; max-width: 24rem;">
					<Drawer.Header>
						<Drawer.Title>Are you sure?</Drawer.Title>
						<Drawer.Description>This action cannot be undone.</Drawer.Description>
					</Drawer.Header>
					<Drawer.Footer>
						<Button>Continue</Button>
						<Drawer.Close>
							{#snippet child({ props })}
								<Button variant="outline" {...props}>Cancel</Button>
							{/snippet}
						</Drawer.Close>
					</Drawer.Footer>
				</div>
			</Drawer.Content>
		</Drawer.Root>
	</div>
{/snippet}

{#snippet demoDirections()}
	<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; width: 100%;">
		{#each sides as side (side)}
			<Drawer.Root direction={side}>
				<Drawer.Trigger>
					{#snippet child({ props })}
						<Button variant="outline" {...props}>{side}</Button>
					{/snippet}
				</Drawer.Trigger>
				<Drawer.Content>
					<Drawer.Header>
						<Drawer.Title>Move Goal</Drawer.Title>
						<Drawer.Description>Drawer opens from the {side}.</Drawer.Description>
					</Drawer.Header>
					<div style="padding: 0 1rem; overflow-y: auto; max-height: 40vh;">
						{#each Array.from({ length: 6 }) as _, i (i)}
							<p style="margin: 0 0 1rem; line-height: 1.5; color: var(--muted-foreground);">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
								tempor incididunt ut labore et dolore magna aliqua.
							</p>
						{/each}
					</div>
					<Drawer.Footer>
						<Button>Submit</Button>
						<Drawer.Close>
							{#snippet child({ props })}
								<Button variant="outline" {...props}>Cancel</Button>
							{/snippet}
						</Drawer.Close>
					</Drawer.Footer>
				</Drawer.Content>
			</Drawer.Root>
		{/each}
	</div>
{/snippet}

{#snippet demoForm()}
	<div style="display: flex; justify-content: center; width: 100%;">
		<Drawer.Root>
			<Drawer.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" {...props}>Edit profile</Button>
				{/snippet}
			</Drawer.Trigger>
			<Drawer.Content>
				<div style="margin-inline: auto; width: 100%; max-width: 24rem;">
					<Drawer.Header>
						<Drawer.Title>Edit profile</Drawer.Title>
						<Drawer.Description>
							Make changes to your profile here. Click save when you're done.
						</Drawer.Description>
					</Drawer.Header>
					<form style="display: grid; gap: 1rem; padding: 0 1rem;">
						<div style="display: grid; gap: 0.5rem;">
							<Label for="drawer-email">Email</Label>
							<Input id="drawer-email" type="email" value="ada@example.com" />
						</div>
						<div style="display: grid; gap: 0.5rem;">
							<Label for="drawer-username">Username</Label>
							<Input id="drawer-username" value="@ada" />
						</div>
					</form>
					<Drawer.Footer>
						<Button type="submit">Save changes</Button>
						<Drawer.Close>
							{#snippet child({ props })}
								<Button variant="outline" {...props}>Cancel</Button>
							{/snippet}
						</Drawer.Close>
					</Drawer.Footer>
				</div>
			</Drawer.Content>
		</Drawer.Root>
	</div>
{/snippet}

<Examples
	items={[
		{ title: 'Basic', demo: demoBasic, code: codeBasic },
		{ title: 'Directions', demo: demoDirections, code: codeDirections },
		{ title: 'Form', demo: demoForm, code: codeForm }
	]}
/>

## Props

### Drawer.Root

<PropsTable props={rootProps} />

### Drawer.Content

<PropsTable props={contentProps} />

### Drawer.Trigger / Drawer.Close

<PropsTable props={triggerCloseProps} />

### Drawer.Header / Footer / Title / Description

<PropsTable props={sectionProps} />

`Drawer.NestedRoot` mirrors `Root` for stacking a drawer above another open drawer.
`Drawer.Portal` and `Drawer.Overlay` are composed automatically by `Content`.

## Theming

Drawer reads `--popover`, `--border`, `--foreground`, `--muted`, and
`--muted-foreground`. The overlay is a translucent scrim with a light blur. The
visible panel is drawn with content's `::before` (radius `2rem`, inset `0.5rem`);
the content box itself stays transparent so the drag gesture can extend past the
panel chrome. The bottom-edge handle uses `var(--muted)`.
