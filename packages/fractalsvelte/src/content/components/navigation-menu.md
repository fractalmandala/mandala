<script lang="ts">
	import * as NavigationMenu from '$lib/components/navigation-menu/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const components: { title: string; href: string; description: string }[] = [
		{
			title: 'Alert Dialog',
			href: '/docs/components/alert-dialog',
			description: 'A modal dialog that interrupts the user with important content.'
		},
		{
			title: 'Hover Card',
			href: '/docs/components/hover-card',
			description: 'Preview content available behind a link.'
		},
		{
			title: 'Progress',
			href: '/docs/components/progress',
			description: 'Show completion progress for a task.'
		},
		{
			title: 'Scroll Area',
			href: '/docs/components/scroll-area',
			description: 'A styled region for overflowing content.'
		}
	];

	const rootProps: PropRow[] = [
		{ name: 'value', type: 'string', description: 'Bindable value of the currently open item.' },
		{
			name: 'viewport',
			type: 'boolean',
			default: 'true',
			description: 'Renders the shared viewport after the menu children.'
		},
		{
			name: 'delayDuration',
			type: 'number',
			default: '200',
			description: 'Delay before pointer hover opens an item.'
		},
		{
			name: 'skipDelayDuration',
			type: 'number',
			default: '300',
			description: 'Grace window before applying the hover delay again.'
		},
		{ name: 'orientation', type: '"horizontal" | "vertical"', description: 'Menu orientation.' },
		{ name: 'children', type: 'Snippet', description: 'List, items, triggers and links.' },
		{
			name: 'ref',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Bindable reference to the root element.'
		}
	];

	const listProps: PropRow[] = [
		{
			name: 'wrap',
			type: '"nowrap" | "wrap"',
			default: '"nowrap"',
			description: 'Allows top-level items to wrap onto another line.'
		},
		{ name: 'children', type: 'Snippet', description: 'Navigation menu items.' },
		{
			name: 'ref',
			type: 'HTMLUListElement | null',
			default: 'null',
			description: 'Bindable reference to the list.'
		}
	];

	const triggerProps: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "muted"',
			default: '"default"',
			description: 'Trigger tone. Rendered as data-variant.'
		},
		{
			name: 'icon',
			type: 'Snippet | false',
			description: 'Replaces the default chevron, or hides it when false.'
		},
		{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the trigger.' },
		{ name: 'children', type: 'Snippet', description: 'Trigger label.' },
		{
			name: 'ref',
			type: 'HTMLButtonElement | null',
			default: 'null',
			description: 'Bindable reference to the trigger button.'
		}
	];

	const contentProps: PropRow[] = [
		{
			name: 'layout',
			type: '"default" | "simple" | "grid" | "feature"',
			default: '"default"',
			description: 'Applies common documented list layouts to a direct child ul.'
		},
		{
			name: 'width',
			type: '"auto" | "xs" | "sm" | "md" | "lg" | "xl"',
			default: '"auto"',
			description: 'Content width used by menu panels.'
		},
		{
			name: 'forceMount',
			type: 'boolean',
			default: 'false',
			description: 'Keeps content mounted regardless of open state.'
		},
		{ name: 'children', type: 'Snippet', description: 'Panel content.' },
		{
			name: 'ref',
			type: 'HTMLDivElement | null',
			default: 'null',
			description: 'Bindable reference to the content panel.'
		}
	];

	const linkProps: PropRow[] = [
		{
			name: 'variant',
			type: '"default" | "trigger" | "panel" | "hero"',
			default: '"default"',
			description: 'Presentation for top-level links and panel links.'
		},
		{ name: 'active', type: 'boolean', default: 'false', description: 'Marks the current page.' },
		{ name: 'href', type: 'string', description: 'Anchor destination.' },
		{ name: 'onSelect', type: '(event: Event) => void', description: 'Called when selected.' },
		{ name: 'children', type: 'Snippet', description: 'Link content.' },
		{
			name: 'ref',
			type: 'HTMLAnchorElement | null',
			default: 'null',
			description: 'Bindable reference to the anchor.'
		}
	];

	const codeInstall = `npm i fractalsvelte bits-ui`;
	const usage = `<script lang="ts">
  import * as NavigationMenu from "fractalsvelte/navigation-menu";
<\/script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Components</NavigationMenu.Trigger>
      <NavigationMenu.Content layout="grid" width="lg">
        <ul>
          <li><NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link></li>
        </ul>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>`;

	const codeBasic = `<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Home</NavigationMenu.Trigger>
      <NavigationMenu.Content layout="feature" width="lg">
        <ul>
          <li><NavigationMenu.Link variant="hero" href="/">Fractalsvelte</NavigationMenu.Link></li>
        </ul>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>`;

	const codeLinks = `<NavigationMenu.Link variant="trigger" href="/docs">Docs</NavigationMenu.Link>
<NavigationMenu.Link active href="/docs/components">Components</NavigationMenu.Link>`;

	const codeNoViewport = `<NavigationMenu.Root viewport={false}>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>Simple</NavigationMenu.Trigger>
      <NavigationMenu.Content layout="simple" width="xs">
        <ul>
          <li><NavigationMenu.Link href="/docs">Documentation</NavigationMenu.Link></li>
        </ul>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>`;

	const codeCustomIcon = `<NavigationMenu.Trigger>
  Releases
  {#snippet icon()}
    <svg viewBox="0 0 20 20"><path d="m6 8 4 4 4-4" /></svg>
  {/snippet}
</NavigationMenu.Trigger>`;
</script>

<h1 class="doc-title">Navigation Menu</h1>
<p class="doc-lede">A collection of links for navigating websites.</p>

<!-- overflow=visible + tall wrapper: absolute viewport/content panels must paint
     outside the default .doc-preview overflow:hidden clip. -->
<Preview description="Navigation Menu — product sections" code={usage} overflow="visible" align="center">
	<div style="min-height: 22rem; width: 100%; display: flex; justify-content: center; position: relative;">
		<NavigationMenu.Root>
			<NavigationMenu.List wrap="wrap">
				<NavigationMenu.Item>
					<NavigationMenu.Trigger>Home</NavigationMenu.Trigger>
					<NavigationMenu.Content layout="feature" width="lg">
						<ul>
							<li>
								<NavigationMenu.Link variant="hero" href="/">
									<span data-slot="navigation-menu-link-title">Fractalsvelte</span>
									<span data-slot="navigation-menu-link-description">
										Svelte 5 components styled with semantic tokens and SASS.
									</span>
								</NavigationMenu.Link>
							</li>
							<li>
								<NavigationMenu.Link variant="panel" href="/docs">
									<span data-slot="navigation-menu-link-title">Introduction</span>
									<span data-slot="navigation-menu-link-description">
										Learn the structure and styling model.
									</span>
								</NavigationMenu.Link>
							</li>
							<li>
								<NavigationMenu.Link variant="panel" href="/docs/installation">
									<span data-slot="navigation-menu-link-title">Installation</span>
									<span data-slot="navigation-menu-link-description">
										Install the package or copy component source.
									</span>
								</NavigationMenu.Link>
							</li>
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
				<NavigationMenu.Item>
					<NavigationMenu.Trigger>Components</NavigationMenu.Trigger>
					<NavigationMenu.Content layout="grid" width="xl">
						<ul>
							{#each components as component}
								<li>
									<NavigationMenu.Link variant="panel" href={component.href}>
										<span data-slot="navigation-menu-link-title">{component.title}</span>
										<span data-slot="navigation-menu-link-description">
											{component.description}
										</span>
									</NavigationMenu.Link>
								</li>
							{/each}
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
				<NavigationMenu.Item>
					<NavigationMenu.Link variant="trigger" href="/docs">Docs</NavigationMenu.Link>
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/navigation-menu/` into your project. It depends on `bits-ui`, and
it expects `styles/_tokens.sass`, `_typography.sass` and `_mixins.sass` to exist.

## Usage

<CodeBlock code={usage} />

## Examples

{#snippet demoBasic()}
	<div style="min-height: 22rem; width: 100%; display: flex; justify-content: center; position: relative;">
		<NavigationMenu.Root>
			<NavigationMenu.List wrap="wrap">
				<NavigationMenu.Item>
					<NavigationMenu.Trigger>Home</NavigationMenu.Trigger>
					<NavigationMenu.Content layout="feature" width="lg">
						<ul>
							<li>
								<NavigationMenu.Link variant="hero" href="/">
									<span data-slot="navigation-menu-link-title">Fractalsvelte</span>
									<span data-slot="navigation-menu-link-description">
										Components built with Svelte 5 and SASS.
									</span>
								</NavigationMenu.Link>
							</li>
							<li>
								<NavigationMenu.Link variant="panel" href="/docs">Introduction</NavigationMenu.Link>
							</li>
							<li>
								<NavigationMenu.Link variant="panel" href="/docs/installation">Installation</NavigationMenu.Link>
							</li>
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
				<NavigationMenu.Item>
					<NavigationMenu.Trigger>Components</NavigationMenu.Trigger>
					<NavigationMenu.Content layout="grid" width="xl">
						<ul>
							{#each components as component}
								<li>
									<NavigationMenu.Link variant="panel" href={component.href}>
										{component.title}
									</NavigationMenu.Link>
								</li>
							{/each}
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	</div>
{/snippet}

{#snippet demoLinks()}
	<div style="min-height: 6rem; width: 100%; display: flex; justify-content: center;">
		<NavigationMenu.Root>
			<NavigationMenu.List>
				<NavigationMenu.Item>
					<NavigationMenu.Link variant="trigger" href="/docs">Docs</NavigationMenu.Link>
				</NavigationMenu.Item>
				<NavigationMenu.Item>
					<NavigationMenu.Link variant="trigger" active href="/docs/components">Components</NavigationMenu.Link>
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	</div>
{/snippet}

{#snippet demoNoViewport()}
	<div style="min-height: 14rem; width: 100%; display: flex; justify-content: center; position: relative;">
		<NavigationMenu.Root viewport={false}>
			<NavigationMenu.List>
				<NavigationMenu.Item>
					<NavigationMenu.Trigger>Simple</NavigationMenu.Trigger>
					<NavigationMenu.Content layout="simple" width="xs">
						<ul>
							<li><NavigationMenu.Link href="/docs">Documentation</NavigationMenu.Link></li>
							<li><NavigationMenu.Link href="/docs/components">Components</NavigationMenu.Link></li>
							<li><NavigationMenu.Link href="/docs/blocks">Blocks</NavigationMenu.Link></li>
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	</div>
{/snippet}

{#snippet demoCustomIcon()}
	<div style="min-height: 12rem; width: 100%; display: flex; justify-content: center; position: relative;">
		<NavigationMenu.Root>
			<NavigationMenu.List>
				<NavigationMenu.Item>
					<NavigationMenu.Trigger>
						Releases
						{#snippet icon()}
							<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
								<path d="m6 8 4 4 4-4" />
							</svg>
						{/snippet}
					</NavigationMenu.Trigger>
					<NavigationMenu.Content layout="simple" width="sm">
						<ul>
							<li><NavigationMenu.Link href="/docs">Latest changes</NavigationMenu.Link></li>
						</ul>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
			</NavigationMenu.List>
		</NavigationMenu.Root>
	</div>
{/snippet}

<Examples
	overflow="visible"
	items={[
		{ title: 'Basic', demo: demoBasic, code: codeBasic },
		{ title: 'Links', demo: demoLinks, code: codeLinks },
		{ title: 'No viewport', demo: demoNoViewport, code: codeNoViewport },
		{ title: 'Custom icon', demo: demoCustomIcon, code: codeCustomIcon }
	]}
/>

## Props

### NavigationMenu.Root

<PropsTable props={rootProps} />

### NavigationMenu.List

<PropsTable props={listProps} />

### NavigationMenu.Trigger

<PropsTable props={triggerProps} />

### NavigationMenu.Content

<PropsTable props={contentProps} />

### NavigationMenu.Link

<PropsTable props={linkProps} />

## Theming

Navigation Menu reads `--foreground`, `--muted`, `--popover`, `--popover-foreground`,
`--border`, `--ring`, `--radius`, and the `--text-*` typography tokens. The viewport size is
controlled by Bits UI through `--bits-navigation-menu-viewport-width` and
`--bits-navigation-menu-viewport-height`.
