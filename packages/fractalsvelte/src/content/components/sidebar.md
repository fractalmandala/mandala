<script lang="ts">
	import * as Sidebar from '$lib/components/sidebar/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	let controlledOpen = $state(true);

	const providerProps: PropRow[] = [
		{
			name: 'open',
			type: 'boolean',
			default: 'true',
			description: 'Bindable open state on desktop. Persisted to a cookie on change.'
		},
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			description: 'Called whenever the desktop open state changes.'
		},
		{
			name: 'contained',
			type: 'boolean',
			default: 'false',
			description:
				'Embed the shell in a sized parent. Uses absolute positioning and height: 100% instead of fixed / 100svh. Useful for previews and panels.'
		},
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the wrapper element.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Sidebar and inset content.'
		}
	];

	const rootProps: PropRow[] = [
		{
			name: 'side',
			type: '"left" | "right"',
			default: '"left"',
			description: 'Edge the sidebar is anchored to. Rendered as data-side.'
		},
		{
			name: 'variant',
			type: '"sidebar" | "floating" | "inset"',
			default: '"sidebar"',
			description: 'Visual treatment of the fixed panel. Rendered as data-variant.'
		},
		{
			name: 'collapsible',
			type: '"offcanvas" | "icon" | "none"',
			default: '"offcanvas"',
			description:
				'How the sidebar collapses. "offcanvas" slides it out of view, "icon" shrinks it to an icon rail, "none" disables collapsing. Below the mobile breakpoint it always renders inside a Sheet.'
		},
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			description: 'Bindable reference to the root element.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Header, content and footer of the sidebar.'
		}
	];

	const menuButtonProps: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "outline"',
			default: '"default"',
			description: 'Visual style. Rendered as data-variant.'
		},
		{
			name: 'size',
			type: '"default" | "sm" | "lg"',
			default: '"default"',
			description: 'Row height. Rendered as data-size.'
		},
		{
			name: 'isActive',
			type: 'boolean',
			default: 'false',
			description: 'Marks the current item. Rendered as data-active when true.'
		},
		{
			name: 'tooltipContent',
			type: 'Snippet | string',
			description:
				'Shown as a tooltip when the sidebar is collapsed to icons. Hidden when expanded or on mobile.'
		},
		{
			name: 'tooltipContentProps',
			type: 'ComponentProps<Tooltip.Content>',
			description: 'Props forwarded to the tooltip content.'
		},
		{
			name: 'child',
			type: 'Snippet<[{ props }]>',
			description: 'Render a custom element (e.g. an anchor) with the button props applied.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Icon and label. The last span child is truncated when it overflows.'
		}
	];

	const menuSubButtonProps: PropRow[] = [
		{
			name: 'size',
			type: '"sm" | "md"',
			default: '"md"',
			description: 'Row text size. Rendered as data-size.'
		},
		{
			name: 'isActive',
			type: 'boolean',
			default: 'false',
			description: 'Marks the current sub-item. Rendered as data-active when true.'
		},
		{
			name: 'child',
			type: 'Snippet<[{ props }]>',
			description: 'Render a custom element with the button props applied.'
		},
		{ name: 'children', type: 'Snippet', description: 'Icon and label.' }
	];

	const menuActionProps: PropRow[] = [
		{
			name: 'showOnHover',
			type: 'boolean',
			default: 'false',
			description:
				'Reveal the action only when the row is hovered or focused. Rendered as data-show-on-hover.'
		},
		{
			name: 'child',
			type: 'Snippet<[{ props }]>',
			description: 'Render a custom element with the button props applied.'
		},
		{ name: 'children', type: 'Snippet', description: 'The action icon.' }
	];

	const menuSkeletonProps: PropRow[] = [
		{
			name: 'showIcon',
			type: 'boolean',
			default: 'false',
			description: 'Render a leading icon skeleton alongside the text skeleton.'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;

	const usage = `<script lang="ts">
  import * as Sidebar from "fractalsvelte/sidebar";
<\/script>

<Sidebar.Provider>
  <Sidebar.Root>
    <Sidebar.Header>Acme Inc</Sidebar.Header>
    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive>Dashboard</Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>
    <Sidebar.Footer>…</Sidebar.Footer>
  </Sidebar.Root>
  <Sidebar.Inset>
    <header class="row ycenter" style="height:3rem; padding-inline:1rem; gap:0.5rem">
      <Sidebar.Trigger />
    </header>
    <!-- page content -->
  </Sidebar.Inset>
</Sidebar.Provider>`;

	const codeIcon = `<Sidebar.Provider contained style="height:100%">
  <Sidebar.Root collapsible="icon">
    <!-- … -->
    <Sidebar.MenuButton tooltipContent="Home">…</Sidebar.MenuButton>
    <Sidebar.Rail />
  </Sidebar.Root>
  <Sidebar.Inset>
    <Sidebar.Trigger />
  </Sidebar.Inset>
</Sidebar.Provider>`;

	const codeOffcanvas = `<Sidebar.Provider contained style="height:100%">
  <Sidebar.Root collapsible="offcanvas">
    <!-- … -->
    <Sidebar.Rail />
  </Sidebar.Root>
  <Sidebar.Inset>
    <Sidebar.Trigger />
  </Sidebar.Inset>
</Sidebar.Provider>`;

	const codeFloating = `<Sidebar.Provider contained style="height:100%">
  <Sidebar.Root variant="floating" collapsible="icon">
    <!-- … -->
  </Sidebar.Root>
  <Sidebar.Inset>…</Sidebar.Inset>
</Sidebar.Provider>`;

	const codeControlled = `<script lang="ts">
  let open = $state(true);
<\/script>

<Sidebar.Provider bind:open contained style="height:100%">
  <Sidebar.Root collapsible="offcanvas">…</Sidebar.Root>
  <Sidebar.Inset>
    <button type="button" onclick={() => (open = !open)}>
      {open ? "Close" : "Open"}
    </button>
  </Sidebar.Inset>
</Sidebar.Provider>`;
</script>

{#snippet iconHome()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
{/snippet}
{#snippet iconInbox()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
{/snippet}
{#snippet iconCalendar()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>
{/snippet}
{#snippet iconSettings()}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
{/snippet}

{#snippet shellIcon()}
	<div style="height: 28rem; width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: var(--doc-r-lg);">
		<Sidebar.Provider contained style="height: 100%;">
			<Sidebar.Root collapsible="icon">
				<Sidebar.Header>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton size="lg">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="m9 8 6 4-6 4Z"/></svg>
								<span>Acme Inc</span>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive tooltipContent="Home">
										{@render iconHome()}
										<span>Home</span>
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton tooltipContent="Inbox">
										{@render iconInbox()}
										<span>Inbox</span>
									</Sidebar.MenuButton>
									<Sidebar.MenuBadge>12</Sidebar.MenuBadge>
								</Sidebar.MenuItem>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton tooltipContent="Calendar">
										{@render iconCalendar()}
										<span>Calendar</span>
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton tooltipContent="Settings">
										{@render iconSettings()}
										<span>Settings</span>
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Projects</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton tooltipContent="Design system">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
										<span>Design system</span>
									</Sidebar.MenuButton>
									<Sidebar.MenuSub>
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton><span>Website</span></Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton isActive><span>Mobile app</span></Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									</Sidebar.MenuSub>
								</Sidebar.MenuItem>
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
				<Sidebar.Footer>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton tooltipContent="Account">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
								<span>Jordan Lee</span>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.Footer>
				<Sidebar.Rail />
			</Sidebar.Root>
			<Sidebar.Inset>
				<div class="row ycenter" style="height: 3rem; gap: 0.5rem; padding-inline: 0.75rem; border-bottom: 1px solid var(--border);">
					<Sidebar.Trigger />
					<strong style="font-size: var(--text-sm); font-weight: 500;">Dashboard</strong>
				</div>
				<div style="flex: 1; padding: 0.75rem; color: var(--muted-foreground); font-size: var(--text-sm);">
					Page content sits in the inset. Toggle with the trigger or <kbd>⌘/Ctrl</kbd>+<kbd>B</kbd>.
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	</div>
{/snippet}

{#snippet shellOffcanvas()}
	<div style="height: 28rem; width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: var(--doc-r-lg);">
		<Sidebar.Provider contained style="height: 100%;">
			<Sidebar.Root collapsible="offcanvas">
				<Sidebar.Header>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton size="lg">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="m9 8 6 4-6 4Z"/></svg>
								<span>Acme Inc</span>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive>{@render iconHome()}<span>Home</span></Sidebar.MenuButton>
								</Sidebar.MenuItem>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton>{@render iconInbox()}<span>Inbox</span></Sidebar.MenuButton>
									<Sidebar.MenuBadge>12</Sidebar.MenuBadge>
								</Sidebar.MenuItem>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton>{@render iconCalendar()}<span>Calendar</span></Sidebar.MenuButton>
								</Sidebar.MenuItem>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton>{@render iconSettings()}<span>Settings</span></Sidebar.MenuButton>
								</Sidebar.MenuItem>
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
				<Sidebar.Rail />
			</Sidebar.Root>
			<Sidebar.Inset>
				<div class="row ycenter" style="height: 3rem; gap: 0.5rem; padding-inline: 0.75rem; border-bottom: 1px solid var(--border);">
					<Sidebar.Trigger />
					<strong style="font-size: var(--text-sm); font-weight: 500;">Dashboard</strong>
				</div>
				<div style="flex: 1; padding: 0.75rem; color: var(--muted-foreground); font-size: var(--text-sm);">
					Offcanvas collapses the panel fully off-screen.
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	</div>
{/snippet}

{#snippet shellFloating()}
	<div style="height: 28rem; width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: var(--doc-r-lg);">
		<Sidebar.Provider contained style="height: 100%;">
			<Sidebar.Root variant="floating" collapsible="icon">
				<Sidebar.Header>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton size="lg">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="m9 8 6 4-6 4Z"/></svg>
								<span>Acme Inc</span>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive tooltipContent="Home">{@render iconHome()}<span>Home</span></Sidebar.MenuButton>
								</Sidebar.MenuItem>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton tooltipContent="Inbox">{@render iconInbox()}<span>Inbox</span></Sidebar.MenuButton>
								</Sidebar.MenuItem>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton tooltipContent="Calendar">{@render iconCalendar()}<span>Calendar</span></Sidebar.MenuButton>
								</Sidebar.MenuItem>
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
				<Sidebar.Rail />
			</Sidebar.Root>
			<Sidebar.Inset>
				<div class="row ycenter" style="height: 3rem; gap: 0.5rem; padding-inline: 0.75rem; border-bottom: 1px solid var(--border);">
					<Sidebar.Trigger />
					<strong style="font-size: var(--text-sm); font-weight: 500;">Dashboard</strong>
				</div>
				<div style="flex: 1; padding: 0.75rem; color: var(--muted-foreground); font-size: var(--text-sm);">
					Floating variant — rounded panel with a light shadow.
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	</div>
{/snippet}

<h1 class="doc-title">Sidebar</h1>
<p class="doc-lede">A composable, collapsible application shell — header, scrollable groups, menus, footer, and an inset for page content. Collapses to an icon rail or off-canvas, and becomes a sheet on small screens.</p>

<Preview description="Icon-collapsible shell — trigger and rail toggle the state" code={codeIcon}>
	{@render shellIcon()}
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/sidebar/` into your project. It depends on `bits-ui` and the already-ported `button`, `input`, `separator`, `sheet`, `skeleton` and `tooltip` parts. The library tokens (including the `--sidebar*` group) must exist.

## Usage

Wrap the app shell in `Sidebar.Provider`, then compose the sidebar from its parts. `Sidebar.Inset` holds the page; `Sidebar.Trigger` and `Sidebar.Rail` toggle the open state (also bound to <kbd>⌘/Ctrl</kbd>+<kbd>B</kbd>).

<CodeBlock code={usage} lang="svelte" />

Read state anywhere below the provider with `useSidebar()` — it returns a class instance (`open`, `state`, `isMobile`, `toggle`, …). Do not destructure it.

## Examples

{#snippet demoControlled()}
	<div style="height: 28rem; width: 100%; overflow: hidden; border: 1px solid var(--border); border-radius: var(--doc-r-lg);">
		<Sidebar.Provider bind:open={controlledOpen} contained style="height: 100%;">
			<Sidebar.Root collapsible="offcanvas">
				<Sidebar.Header>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton size="lg"><span>Controlled</span></Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive>{@render iconHome()}<span>Home</span></Sidebar.MenuButton>
								</Sidebar.MenuItem>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton>{@render iconInbox()}<span>Inbox</span></Sidebar.MenuButton>
								</Sidebar.MenuItem>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton>{@render iconCalendar()}<span>Calendar</span></Sidebar.MenuButton>
								</Sidebar.MenuItem>
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
				<Sidebar.Rail />
			</Sidebar.Root>
			<Sidebar.Inset>
				<div class="row ycenter" style="height: 3rem; gap: 0.5rem; padding-inline: 0.75rem; border-bottom: 1px solid var(--border);">
					<button
						type="button"
						style="font-size: var(--text-sm); padding: 0.25rem 0.5rem; border: 1px solid var(--border); border-radius: var(--doc-r); background: var(--background); cursor: pointer;"
						onclick={() => (controlledOpen = !controlledOpen)}
					>
						{controlledOpen ? 'Close' : 'Open'}
					</button>
					<span style="font-size: var(--text-sm); color: var(--muted-foreground);">
						open = {String(controlledOpen)}
					</span>
				</div>
				<div style="flex: 1; padding: 0.75rem; color: var(--muted-foreground); font-size: var(--text-sm);">
					External controls can drive the same bindable open state as the trigger.
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	</div>
{/snippet}

<Examples
	items={[
		{
			title: 'Icon',
			demo: shellIcon,
			code: codeIcon,
			description: 'collapsible="icon" — shrinks to a rail; tooltips appear on hover.'
		},
		{
			title: 'Offcanvas',
			demo: shellOffcanvas,
			code: codeOffcanvas,
			description: 'collapsible="offcanvas" — slides fully off-screen when collapsed.'
		},
		{
			title: 'Floating',
			demo: shellFloating,
			code: codeFloating,
			description: 'variant="floating" — rounded panel with shadow, still collapsible to icons.'
		},
		{
			title: 'Controlled',
			demo: demoControlled,
			code: codeControlled,
			description: 'bind:open on the provider for external controls.'
		}
	]}
/>

## Props

### Sidebar.Provider

<PropsTable props={providerProps} />

### Sidebar.Root

<PropsTable props={rootProps} />

### Sidebar.MenuButton

<PropsTable props={menuButtonProps} />

### Sidebar.MenuSubButton

<PropsTable props={menuSubButtonProps} />

### Sidebar.MenuAction

<PropsTable props={menuActionProps} />

### Sidebar.MenuSkeleton

<PropsTable props={menuSkeletonProps} />

Structural shells — `Header`, `Footer`, `Content`, `Group`, `GroupContent`, `Menu`, `MenuItem`, `MenuBadge`, `MenuSub`, `MenuSubItem`, `Inset`, `Rail`, `Separator`, `Input` — take `ref` and `children` (plus an optional `child` snippet on `GroupLabel` and `GroupAction`). `Trigger` accepts Button props and toggles the sidebar; pass children to replace the default panel icon.

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--sidebar` / `--sidebar-foreground` | Panel background and text |
| `--sidebar-accent` / `--sidebar-accent-foreground` | Hovered, active and open rows |
| `--sidebar-border` | Dividers, rail hover strip, sub-menu guide, floating border |
| `--sidebar-ring` | Focus-visible ring on interactive rows |
| `--sidebar-width` | Desktop width (default `16rem`, set on the provider) |
| `--sidebar-width-icon` | Icon-collapsed width (default `3rem`) |
| `--background` | Inset surface; outline menu-button fill |

</div>

On mobile the sheet width is `18rem` (`SIDEBAR_WIDTH_MOBILE`). Override widths via the provider `style` string.
