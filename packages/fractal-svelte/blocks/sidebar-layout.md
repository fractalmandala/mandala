<script lang="ts">
	import * as Sidebar from '$lib/components/sidebar/index.js';
	import * as Resizable from '$lib/components/resizable/index.js';
	import { Button } from '$lib/components/button/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';

	let leftOpen = $state(true);
	let rightOpen = $state(true);
	let dualOpen = $state(true);

	const codeLeft = `<Sidebar.Provider contained style="height:100%">
  <Sidebar.Root side="left" collapsible="offcanvas">
    <Sidebar.Header>…</Sidebar.Header>
    <Sidebar.Content>…</Sidebar.Content>
  </Sidebar.Root>
  <Sidebar.Inset>
    <header>… <Sidebar.Trigger /> …</header>
    <main>…</main>
  </Sidebar.Inset>
</Sidebar.Provider>`;

	const codeRight = `<Sidebar.Root side="right" collapsible="offcanvas">…</Sidebar.Root>`;

	const codeBoth = `<!-- One provider, two roots -->
<Sidebar.Root side="left" collapsible="icon">…</Sidebar.Root>
<Sidebar.Inset>…</Sidebar.Inset>
<Sidebar.Root side="right" collapsible="icon">…</Sidebar.Root>`;

	const codeResizable = `<Resizable.PaneGroup direction="horizontal" minHeight="100%">
  <Resizable.Pane defaultSize={22} minSize={14} maxSize={36}>Left</Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane defaultSize={56}>Main</Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane defaultSize={22} minSize={14} maxSize={36}>Right</Resizable.Pane>
</Resizable.PaneGroup>`;
</script>

{#snippet menuItems(labels: string[])}
	<Sidebar.Menu>
		{#each labels as label (label)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{label}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
{/snippet}

{#snippet insetChrome(title: string, note: string, showTrigger = true)}
	<div style="display: flex; flex-direction: column; height: 100%; min-height: 0;">
		<header
			style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); flex-shrink: 0;"
		>
			{#if showTrigger}
				<Sidebar.Trigger />
			{/if}
			<span data-slot="block-title">{title}</span>
		</header>
		<div style="flex: 1; min-height: 0; overflow: auto; padding: 0.875rem;">
			<p data-slot="block-label">Main</p>
			<p data-slot="block-body-text">{note}</p>
		</div>
	</div>
{/snippet}

{#snippet demoLeft()}
	<div data-slot="block-frame" data-tall>
		<Sidebar.Provider contained style="height: 100%;">
			<Sidebar.Root side="left" collapsible="offcanvas">
				<Sidebar.Header>
					<span data-slot="block-title">Left</span>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Nav</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							{@render menuItems(['Overview', 'Projects', 'Settings'])}
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
			</Sidebar.Root>
			<Sidebar.Inset>
				{@render insetChrome(
					'Left sidebar',
					'Primary navigation on the left. Trigger toggles the panel (offcanvas on this demo).'
				)}
			</Sidebar.Inset>
		</Sidebar.Provider>
	</div>
{/snippet}

{#snippet demoRight()}
	<div data-slot="block-frame" data-tall>
		<Sidebar.Provider contained style="height: 100%;">
			<Sidebar.Inset>
				{@render insetChrome(
					'Right sidebar',
					'Inspector / secondary panel on the right. Trigger still opens the registered sidebar.'
				)}
			</Sidebar.Inset>
			<Sidebar.Root side="right" collapsible="offcanvas">
				<Sidebar.Header>
					<span data-slot="block-title">Right</span>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Details</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							{@render menuItems(['Properties', 'History', 'Comments'])}
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
			</Sidebar.Root>
		</Sidebar.Provider>
	</div>
{/snippet}

{#snippet demoBoth()}
	<div data-slot="block-frame" data-tall>
		<Sidebar.Provider bind:open={dualOpen} contained style="height: 100%;">
			<Sidebar.Root side="left" collapsible="icon">
				<Sidebar.Header>
					<span data-slot="block-title">App</span>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							{@render menuItems(['Inbox', 'Drafts', 'Archive'])}
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
				<Sidebar.Rail />
			</Sidebar.Root>
			<Sidebar.Inset>
				{@render insetChrome(
					'Both sidebars',
					'Left navigation + right inspector. Shared provider open state; collapsible="icon" collapses to icons. Drag the rail or use the trigger.'
				)}
			</Sidebar.Inset>
			<Sidebar.Root side="right" collapsible="icon">
				<Sidebar.Header>
					<span data-slot="block-title">Panel</span>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Context</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							{@render menuItems(['Outline', 'Files', 'Chat'])}
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
				<Sidebar.Rail />
			</Sidebar.Root>
		</Sidebar.Provider>
	</div>
{/snippet}

{#snippet demoCollapsible()}
	<div data-slot="block-frame" data-tall>
		<div style="display: flex; flex-direction: column; height: 100%; min-height: 0;">
			<div
				style="display: flex; gap: 0.5rem; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); flex-shrink: 0;"
			>
				<Button size="sm" variant={leftOpen ? 'default' : 'outline'} onclick={() => (leftOpen = !leftOpen)}>
					Left {leftOpen ? 'open' : 'closed'}
				</Button>
				<Button
					size="sm"
					variant={rightOpen ? 'default' : 'outline'}
					onclick={() => (rightOpen = !rightOpen)}
				>
					Right {rightOpen ? 'open' : 'closed'}
				</Button>
			</div>
			<div style="flex: 1; min-height: 0; display: flex;">
				{#if leftOpen}
					<aside
						data-slot="block-pane"
						data-tone="sidebar"
						style="width: 11rem; flex-shrink: 0; border-right: 1px solid var(--border);"
					>
						<p data-slot="block-label">Left</p>
						<p data-slot="block-body-text" style="color: inherit; opacity: 0.85;">
							Independently toggled panel (simple show/hide).
						</p>
					</aside>
				{/if}
				<div data-slot="block-pane" style="flex: 1;">
					<p data-slot="block-label">Main</p>
					<p data-slot="block-body-text">
						When you need left and right to open/close independently, drive two boolean states (as
						here) or mount two sidebar providers. The Sidebar primitive shares one open flag per
						provider.
					</p>
				</div>
				{#if rightOpen}
					<aside
						data-slot="block-pane"
						data-tone="sidebar"
						style="width: 11rem; flex-shrink: 0; border-left: 1px solid var(--border);"
					>
						<p data-slot="block-label">Right</p>
						<p data-slot="block-body-text" style="color: inherit; opacity: 0.85;">
							Secondary panel.
						</p>
					</aside>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

{#snippet demoResizable()}
	<div data-slot="block-frame" data-tall>
		<Resizable.PaneGroup direction="horizontal" minHeight="100%" style="height: 100%;">
			<Resizable.Pane defaultSize={22} minSize={14} maxSize={34}>
				<div data-slot="block-pane" data-tone="sidebar">
					<p data-slot="block-label">Left</p>
					<p data-slot="block-body-text" style="color: inherit; opacity: 0.85;">
						Drag the handle to resize. min/max sizes keep the panel usable.
					</p>
				</div>
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={56} minSize={30}>
				<div data-slot="block-pane">
					<p data-slot="block-label">Main</p>
					<p data-slot="block-body-text">
						Primary workspace. Combine with a Basic header above the PaneGroup for a full app shell.
					</p>
				</div>
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={22} minSize={14} maxSize={34}>
				<div data-slot="block-pane" data-tone="sidebar">
					<p data-slot="block-label">Right</p>
					<p data-slot="block-body-text" style="color: inherit; opacity: 0.85;">
						Inspector / AI panel / outline.
					</p>
				</div>
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</div>
{/snippet}

{#snippet demoResizableLeftOnly()}
	<div data-slot="block-frame" data-tall>
		<Resizable.PaneGroup direction="horizontal" minHeight="100%" style="height: 100%;">
			<Resizable.Pane defaultSize={28} minSize={16} maxSize={42}>
				<div data-slot="block-pane" data-tone="sidebar">
					<p data-slot="block-label">Nav</p>
					<p data-slot="block-body-text" style="color: inherit; opacity: 0.85;">
						Single resizable sidebar on the left.
					</p>
				</div>
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={72}>
				<div data-slot="block-pane">
					<p data-slot="block-label">Main</p>
					<p data-slot="block-body-text">Content stretches into the remaining space.</p>
				</div>
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</div>
{/snippet}

<h1 class="doc-title">Sidebar Layout</h1>
<p class="doc-lede">
	Main content with side navigation or inspectors — left, right, both, collapsible, or width-draggable
	via Resizable.
</p>

<Preview description="Left sidebar + inset main" code={codeLeft}>
	{@render demoLeft()}
</Preview>

## Building blocks

| Need | Use |
| --- | --- |
| App nav that collapses | [`Sidebar`](/components/sidebar) (`Provider` + `Root` + `Inset`) |
| Left or right | `side="left"` / `side="right"` |
| Collapse to icons / off-canvas | `collapsible="icon"` / `"offcanvas"` |
| Independent open flags | Local booleans (or two providers) |
| Drag to resize widths | [`Resizable`](/components/resizable) `PaneGroup` |

Always set **`contained`** on `Sidebar.Provider` inside previews and embedded panels so the shell fills its parent instead of the viewport.

## Usage

### Sidebar (collapsible)

<CodeBlock code={codeLeft} lang="svelte" />

### Resizable widths

<CodeBlock code={codeResizable} lang="svelte" />

## Examples

<Examples
	items={[
		{
			title: 'Left',
			demo: demoLeft,
			code: codeLeft,
			description: 'Classic app nav on the left with offcanvas collapse.'
		},
		{
			title: 'Right',
			demo: demoRight,
			code: codeRight,
			description: 'Inspector / secondary panel on the right.'
		},
		{
			title: 'Both',
			demo: demoBoth,
			code: codeBoth,
			description: 'Left + right with icon collapse and rails.'
		},
		{
			title: 'Independent collapse',
			demo: demoCollapsible,
			code: codeBoth,
			description: 'Left and right open/close independently (boolean panels).'
		},
		{
			title: 'Resizable both',
			demo: demoResizable,
			code: codeResizable,
			description: 'Drag handles — left | main | right widths.'
		},
		{
			title: 'Resizable left',
			demo: demoResizableLeftOnly,
			code: codeResizable,
			description: 'Single draggable nav column.'
		}
	]}
/>

## Combining patterns

1. **Basic** shell for header/footer.
2. Put a **Sidebar Provider** or **Resizable PaneGroup** in main.
3. Nest [Sidebar Accordion](/blocks/sidebar-accordion) inside `Sidebar.Content` for grouped nav.

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--sidebar` / `--sidebar-foreground` | Sidebar surfaces (when defined by theme) |
| `--border` | Dividers between panes |
| `--muted` / `--background` | Pane washes in resizable demos |
| `--radius` | Inner control corners |

</div>
