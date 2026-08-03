<script lang="ts">
	import * as Sidebar from '$lib/components/sidebar/index.js';
	import * as Accordion from '$lib/components/accordion/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';

	let section = $state('product');

	const codeSingle = `<Sidebar.Provider contained style="height:100%">
  <Sidebar.Root>
    <Sidebar.Header>…</Sidebar.Header>
    <Sidebar.Content>
      <Accordion.Root type="single" variant="plain" bind:value={section}>
        <Accordion.Item value="product">
          <Accordion.Trigger>Product</Accordion.Trigger>
          <Accordion.Content>
            <Sidebar.Menu>…</Sidebar.Menu>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="team">
          <Accordion.Trigger>Team</Accordion.Trigger>
          <Accordion.Content>…</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </Sidebar.Content>
  </Sidebar.Root>
  <Sidebar.Inset>…</Sidebar.Inset>
</Sidebar.Provider>`;
</script>

{#snippet links(items: string[])}
	<div class="box" style="gap: 0.125rem; padding-block: 0.25rem;">
		{#each items as item (item)}
			<a href="#{item}" data-slot="block-nav-link" onclick={(e) => e.preventDefault()}>{item}</a>
		{/each}
	</div>
{/snippet}

{#snippet demoSingle()}
	<div data-slot="block-frame" data-tall>
		<Sidebar.Provider contained style="height: 100%;">
			<Sidebar.Root side="left" collapsible="icon">
				<Sidebar.Header>
					<span data-slot="block-title">Workspace</span>
				</Sidebar.Header>
				<Sidebar.Content>
					<Accordion.Root type="single" variant="plain" bind:value={section}>
						<Accordion.Item value="product">
							<Accordion.Trigger>Product</Accordion.Trigger>
							<Accordion.Content>
								{@render links(['Overview', 'Roadmap', 'Releases', 'Analytics'])}
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item value="team">
							<Accordion.Trigger>Team</Accordion.Trigger>
							<Accordion.Content>
								{@render links(['Members', 'Roles', 'Invites'])}
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item value="settings">
							<Accordion.Trigger>Settings</Accordion.Trigger>
							<Accordion.Content>
								{@render links(['General', 'Billing', 'Integrations', 'API keys'])}
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</Sidebar.Content>
				<Sidebar.Rail />
			</Sidebar.Root>
			<Sidebar.Inset>
				<div style="display: flex; flex-direction: column; height: 100%; min-height: 0;">
					<header
						style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); flex-shrink: 0;"
					>
						<Sidebar.Trigger />
						<span data-slot="block-title">Accordion nav</span>
					</header>
					<div style="flex: 1; min-height: 0; overflow: auto; padding: 0.875rem;">
						<p data-slot="block-label">Open section</p>
						<p data-slot="block-title" style="margin-top: 0.35rem;">
							{section || '(none)'}
						</p>
						<p data-slot="block-body-text">
							<code>type="single"</code> on Accordion means opening one section closes the others.
							Bind <code>value</code> to track which group is open.
						</p>
					</div>
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	</div>
{/snippet}

{#snippet demoDefaultOpen()}
	<div data-slot="block-frame" data-tall>
		<Sidebar.Provider contained style="height: 100%;">
			<Sidebar.Root side="left" collapsible="none">
				<Sidebar.Header>
					<span data-slot="block-title">Docs</span>
				</Sidebar.Header>
				<Sidebar.Content>
					<Accordion.Root type="single" variant="plain" value="getting-started">
						<Accordion.Item value="getting-started">
							<Accordion.Trigger>Getting started</Accordion.Trigger>
							<Accordion.Content>
								{@render links(['Install', 'Tokens', 'Theming'])}
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item value="components">
							<Accordion.Trigger>Components</Accordion.Trigger>
							<Accordion.Content>
								{@render links(['Button', 'Input', 'Dialog'])}
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item value="ai">
							<Accordion.Trigger>AI Elements</Accordion.Trigger>
							<Accordion.Content>
								{@render links(['Message', 'Prompt Input', 'Tool'])}
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</Sidebar.Content>
			</Sidebar.Root>
			<Sidebar.Inset>
				<div style="padding: 0.875rem;">
					<p data-slot="block-label">Main</p>
					<p data-slot="block-body-text">
						Pass an initial <code>value</code> (uncontrolled) so one section starts open — here
						“Getting started”.
					</p>
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	</div>
{/snippet}

{#snippet demoCollapsibleAll()}
	<div data-slot="block-frame" data-tall>
		<Sidebar.Provider contained style="height: 100%;">
			<Sidebar.Root side="left" collapsible="none">
				<Sidebar.Header>
					<span data-slot="block-title">Library</span>
				</Sidebar.Header>
				<Sidebar.Content>
					<!-- No value / no bind — all start closed; still single-open when expanded -->
					<Accordion.Root type="single" variant="plain" collapsible>
						<Accordion.Item value="a">
							<Accordion.Trigger>Design</Accordion.Trigger>
							<Accordion.Content>
								{@render links(['Colors', 'Type', 'Spacing'])}
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item value="b">
							<Accordion.Trigger>Engineering</Accordion.Trigger>
							<Accordion.Content>
								{@render links(['Stack', 'CI', 'Deploy'])}
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item value="c">
							<Accordion.Trigger>Ops</Accordion.Trigger>
							<Accordion.Content>
								{@render links(['Status', 'Runbooks'])}
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</Sidebar.Content>
			</Sidebar.Root>
			<Sidebar.Inset>
				<div style="padding: 0.875rem;">
					<p data-slot="block-label">Main</p>
					<p data-slot="block-body-text">
						With <code>collapsible</code> on the root, clicking the open trigger again closes it —
						so you can have zero sections open.
					</p>
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	</div>
{/snippet}

{#snippet demoNestedGroups()}
	<div data-slot="block-frame" data-tall>
		<Sidebar.Provider contained style="height: 100%;">
			<Sidebar.Root side="left" collapsible="none">
				<Sidebar.Header>
					<span data-slot="block-title">Admin</span>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupLabel>Pinned</Sidebar.GroupLabel>
						<Sidebar.GroupContent>
							<Sidebar.Menu>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton>Dashboard</Sidebar.MenuButton>
								</Sidebar.MenuItem>
								<Sidebar.MenuItem>
									<Sidebar.MenuButton>Search</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							</Sidebar.Menu>
						</Sidebar.GroupContent>
					</Sidebar.Group>
					<Sidebar.Separator />
					<Accordion.Root type="single" variant="plain" value="org">
						<Accordion.Item value="org">
							<Accordion.Trigger>Organisation</Accordion.Trigger>
							<Accordion.Content>
								{@render links(['Profile', 'Members', 'SSO'])}
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item value="billing">
							<Accordion.Trigger>Billing</Accordion.Trigger>
							<Accordion.Content>
								{@render links(['Plan', 'Invoices', 'Usage'])}
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</Sidebar.Content>
			</Sidebar.Root>
			<Sidebar.Inset>
				<div style="padding: 0.875rem;">
					<p data-slot="block-label">Main</p>
					<p data-slot="block-body-text">
						Mix fixed <code>Sidebar.Group</code> items with accordion sections below a separator.
					</p>
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	</div>
{/snippet}

<h1 class="doc-title">Sidebar Accordion</h1>
<p class="doc-lede">
	Group sidebar navigation into accordion sections where opening one section closes the others —
	ideal for dense product menus and docs outlines.
</p>

<Preview description="Single-open accordion inside Sidebar" code={codeSingle}>
	{@render demoSingle()}
</Preview>

## Behaviour

Use Accordion with **`type="single"`**:

- Opening **Product** closes **Team** and **Settings**
- Optionally set **`collapsible`** so the open section can close entirely
- Bind **`value`** when the main pane should reflect the active group

Pair with [`Sidebar`](/components/sidebar) for collapse/rail, and [`Accordion`](/components/accordion) `variant="plain"` so the accordion does not paint a second card chrome inside the sidebar.

## Usage

<CodeBlock code={codeSingle} lang="svelte" />

## Examples

<Examples
	items={[
		{
			title: 'Single open',
			demo: demoSingle,
			code: codeSingle,
			description: 'Bound value — open section mirrored in the main pane.'
		},
		{
			title: 'Default open',
			demo: demoDefaultOpen,
			code: codeSingle,
			description: 'Initial value opens one section on load.'
		},
		{
			title: 'All collapsible',
			demo: demoCollapsibleAll,
			code: codeSingle,
			description: 'collapsible root — can return to zero open sections.'
		},
		{
			title: 'With pinned items',
			demo: demoNestedGroups,
			code: codeSingle,
			description: 'Fixed group above accordion sections.'
		}
	]}
/>

## Related

- [Sidebar Layout](/blocks/sidebar-layout) — placement and resizable variants
- [Basic](/blocks/basic) — outer header / footer shell
- [Accordion](/components/accordion) · [Sidebar](/components/sidebar)

## Theming

<div class="doc-table-wrap">

| Token | Used for |
| --- | --- |
| `--sidebar` / `--sidebar-foreground` | Sidebar surface |
| `--sidebar-accent` / `--accent` | Nav link hover |
| `--border` | Header divider |
| Accordion plain variant | Transparent nest inside sidebar |

</div>
