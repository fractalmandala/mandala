<script lang="ts">
	import { Button } from '$lib/components/button/index.js';
	import { toast } from '$lib/components/sonner/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const toasterProps: PropRow[] = [
		{
			name: 'theme',
			type: '"light" | "dark" | "system"',
			default: 'mode.current',
			description: 'Synced from the active theme. Override to lock a theme.'
		},
		{
			name: 'position',
			type: 'ToasterPosition',
			default: '"bottom-right"',
			description: 'Corner the stack anchors to.'
		},
		{
			name: 'expand',
			type: 'boolean',
			default: 'false',
			description: 'Expand stacked toasts so every title stays visible.'
		},
		{
			name: 'closeButton',
			type: 'boolean',
			default: 'false',
			description: 'Show a dismiss control on each toast.'
		},
		{
			name: 'duration',
			type: 'number',
			description: 'Default auto-dismiss duration in milliseconds.'
		},
		{
			name: 'richColors',
			type: 'boolean',
			default: 'false',
			description: 'Use stronger success/error/info/warning colour accents.'
		},
		{
			name: 'visibleToasts',
			type: 'number',
			default: '3',
			description: 'How many toasts stay visible before the rest collapse.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;

	const usage = `<script lang="ts">
  import { Toaster, toast } from "fractalsvelte/sonner";
<\/script>

<!-- Mount once near the app root -->
<Toaster />

<button type="button" onclick={() => toast("Event has been created")}>
  Show toast
</button>`;

	const codeLayout = `<script lang="ts">
  import { Toaster } from "fractalsvelte/sonner";
  let { children } = $props();
<\/script>

<Toaster />
{@render children()}`;

	const codeDemo = `<Button
  variant="outline"
  onclick={() =>
    toast("Event has been created", {
      description: "Sunday, December 03, 2023 at 9:00 AM",
      action: {
        label: "Undo",
        onClick: () => console.info("Undo"),
      },
    })}
>
  Show Toast
</Button>`;

	const codeTypes = `<Button variant="outline" onclick={() => toast("Event has been created")}>
  Default
</Button>
<Button variant="outline" onclick={() => toast.success("Event has been created")}>
  Success
</Button>
<Button variant="outline" onclick={() => toast.info("Be there 10 minutes early")}>
  Info
</Button>
<Button variant="outline" onclick={() => toast.warning("Start time cannot be before 8am")}>
  Warning
</Button>
<Button variant="outline" onclick={() => toast.error("Event has not been created")}>
  Error
</Button>
<Button
  variant="outline"
  onclick={() =>
    toast.promise(
      () => new Promise((resolve) => setTimeout(() => resolve({ name: "Event" }), 2000)),
      {
        loading: "Loading...",
        success: (data) => \`\${data.name} has been created\`,
        error: "Error",
      }
    )}
>
  Promise
</Button>`;

	const codeLoading = `<Button
  variant="outline"
  onclick={() => {
    const id = toast.loading("Saving…");
    setTimeout(() => toast.success("Saved", { id }), 1500);
  }}
>
  Loading → success
</Button>`;

	const codeAction = `<Button
  variant="outline"
  onclick={() =>
    toast("File deleted", {
      action: { label: "Undo", onClick: () => toast.success("Restored") },
    })}
>
  With action
</Button>`;
</script>

<h1 class="doc-title">Sonner</h1>
<p class="doc-lede">An opinionated toast stack. Mount <code>Toaster</code> once near the root, then fire toasts from anywhere with <code>toast()</code>. Theme follows light/dark mode and the active palette.</p>

<Preview description="Sonner — toast with description and action" code={codeDemo}>
	<Button
		variant="outline"
		onclick={() =>
			toast('Event has been created', {
				description: 'Sunday, December 03, 2023 at 9:00 AM',
				action: {
					label: 'Undo',
					onClick: () => console.info('Undo')
				}
			})}
	>
		Show Toast
	</Button>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/sonner/` into your project. It syncs with the active theme.

Mount the toaster once in your root layout:

<CodeBlock code={codeLayout} lang="svelte" />

## Usage

<CodeBlock code={usage} lang="svelte" />

Use `toast()`, `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`, `toast.loading()`, and `toast.promise()`. Status icons ship as Phosphor glyphs.

## Examples

{#snippet demoTypes()}
	<div class="row wrap ycenter" style="gap: 0.5rem">
		<Button variant="outline" onclick={() => toast('Event has been created')}>Default</Button>
		<Button variant="outline" onclick={() => toast.success('Event has been created')}>
			Success
		</Button>
		<Button
			variant="outline"
			onclick={() => toast.info('Be at the area 10 minutes before the event time')}
		>
			Info
		</Button>
		<Button
			variant="outline"
			onclick={() => toast.warning('Event start time cannot be earlier than 8am')}
		>
			Warning
		</Button>
		<Button variant="outline" onclick={() => toast.error('Event has not been created')}>
			Error
		</Button>
		<Button
			variant="outline"
			onclick={() => {
				toast.promise<{ name: string }>(
					() => new Promise((resolve) => setTimeout(() => resolve({ name: 'Event' }), 2000)),
					{
						loading: 'Loading...',
						success: (data) => `${data.name} has been created`,
						error: 'Error'
					}
				);
			}}
		>
			Promise
		</Button>
	</div>
{/snippet}

{#snippet demoLoading()}
	<div class="row wrap ycenter" style="gap: 0.5rem">
		<Button
			variant="outline"
			onclick={() => {
				const id = toast.loading('Saving…');
				setTimeout(() => toast.success('Saved', { id }), 1500);
			}}
		>
			Loading → success
		</Button>
		<Button
			variant="outline"
			onclick={() => {
				const id = toast.loading('Uploading…');
				setTimeout(() => toast.error('Upload failed', { id }), 1500);
			}}
		>
			Loading → error
		</Button>
	</div>
{/snippet}

{#snippet demoAction()}
	<div class="row wrap ycenter" style="gap: 0.5rem">
		<Button
			variant="outline"
			onclick={() =>
				toast('File deleted', {
					description: 'report.pdf was moved to trash.',
					action: {
						label: 'Undo',
						onClick: () => toast.success('Restored')
					}
				})}
		>
			With action
		</Button>
		<Button
			variant="outline"
			onclick={() =>
				toast('Invite sent', {
					description: 'We emailed alex@example.com.',
					action: {
						label: 'View',
						onClick: () => console.info('View')
					}
				})}
		>
			Description + action
		</Button>
	</div>
{/snippet}

<Examples
	items={[
		{ title: 'Types', demo: demoTypes, code: codeTypes },
		{ title: 'Loading', demo: demoLoading, code: codeLoading },
		{ title: 'Action', demo: demoAction, code: codeAction }
	]}
/>

## Props

### Toaster

Props are forwarded to the underlying toaster. Common ones:

<PropsTable props={toasterProps} />

### toast()

Imperative API from `svelte-sonner` — re-exported from `fractalsvelte/sonner`. Call `toast("message")` or the typed helpers above. Options include `description`, `action`, `duration`, and `id` (to update an existing toast).

## Theming

Toast surfaces bridge palette tokens through CSS variables on the toaster:

- `--normal-bg: var(--popover)`
- `--normal-text: var(--popover-foreground)`
- `--normal-border: var(--border)`

Light/dark follows the active theme. Status icons use the current text colour; loading uses a spinning Phosphor spinner (`data-slot="sonner-spinner"`).
