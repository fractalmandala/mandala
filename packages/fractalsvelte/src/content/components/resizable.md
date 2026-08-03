<script lang="ts">
	import * as Resizable from '$lib/components/resizable/index.js';
	import Preview from '$lib/docs/Preview.svelte';
	import Examples from '$lib/docs/Examples.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const groupProps: PropRow[] = [
		{
			name: 'direction',
			type: '"horizontal" | "vertical"',
			description: 'Axis of the pane split. Required. Applied as data-direction by paneforge.'
		},
		{
			name: 'bordered',
			type: 'boolean',
			default: 'false',
			description: 'Adds a token border around the group.'
		},
		{
			name: 'radius',
			type: '"none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full"',
			description: 'Corner radius. Omit to keep square edges.'
		},
		{
			name: 'maxWidth',
			type: 'string',
			description: 'CSS max-width. Prefer over width — paneforge sets width: 100% inline.'
		},
		{
			name: 'minHeight',
			type: 'string',
			description: 'CSS min-height. Prefer over height — paneforge sets height: 100% inline.'
		},
		{
			name: 'maxHeight',
			type: 'string',
			description: 'CSS max-height for the group.'
		},
		{
			name: 'autoSaveId',
			type: 'string | null',
			description: 'When set, layout is persisted to storage under this id.'
		},
		{
			name: 'keyboardResizeBy',
			type: 'number | null',
			description: 'Step size (percentage) for keyboard resize.'
		},
		{
			name: 'onLayoutChange',
			type: '(layout: number[]) => void',
			description: 'Called when pane sizes change.'
		},
		{
			name: 'storage',
			type: 'PaneGroupStorage',
			description: 'Storage adapter used with autoSaveId. Defaults to localStorage.'
		},
		{
			name: 'ref',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Bindable reference to the group element.'
		},
		{
			name: 'this',
			type: 'PaneGroup',
			description: 'Bindable paneforge instance (getLayout, setLayout, getId).'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Panes and handles.'
		}
	];

	const handleProps: PropRow[] = [
		{
			name: 'withHandle',
			type: 'boolean',
			default: 'false',
			description: 'Shows the grip pill on the resize handle.'
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Disables dragging and keyboard resize.'
		},
		{
			name: 'onDraggingChange',
			type: '(dragging: boolean) => void',
			description: 'Called when a drag starts or ends.'
		},
		{
			name: 'tabindex',
			type: 'number',
			default: '0',
			description: 'Tab index of the handle element.'
		},
		{
			name: 'ref',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Bindable reference to the handle element.'
		}
	];

	const paneProps: PropRow[] = [
		{
			name: 'defaultSize',
			type: 'number',
			description: 'Initial size as a percentage of the group.'
		},
		{
			name: 'minSize',
			type: 'number',
			default: '0',
			description: 'Minimum size as a percentage of the group.'
		},
		{
			name: 'maxSize',
			type: 'number',
			default: '100',
			description: 'Maximum size as a percentage of the group.'
		},
		{
			name: 'collapsible',
			type: 'boolean',
			default: 'false',
			description: 'Allow the pane to collapse past minSize.'
		},
		{
			name: 'collapsedSize',
			type: 'number',
			description: 'Size when collapsed.'
		},
		{
			name: 'order',
			type: 'number',
			description: 'Stable order when panes are conditionally rendered.'
		},
		{
			name: 'onCollapse / onExpand / onResize',
			type: 'function',
			description: 'Lifecycle callbacks from paneforge.'
		},
		{
			name: 'children',
			type: 'Snippet',
			description: 'Pane content.'
		}
	];

	const codeInstall = `npm i fractalsvelte paneforge`;

	const usage = `<script lang="ts">
  import * as Resizable from "fractalsvelte/resizable";
<\/script>

<Resizable.PaneGroup direction="horizontal" minHeight="200px" bordered radius="lg">
  <Resizable.Pane defaultSize={50}>One</Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane defaultSize={50}>Two</Resizable.Pane>
</Resizable.PaneGroup>`;

	const codeNested = `<Resizable.PaneGroup direction="horizontal" maxWidth="28rem" bordered radius="lg">
  <Resizable.Pane defaultSize={50}>
    <div class="box" style="height:200px; align-items:center; justify-content:center; padding:1.5rem">
      <span style="font-weight:600">One</span>
    </div>
  </Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane defaultSize={50}>
    <Resizable.PaneGroup direction="vertical">
      <Resizable.Pane defaultSize={25}>
        <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
          <span style="font-weight:600">Two</span>
        </div>
      </Resizable.Pane>
      <Resizable.Handle />
      <Resizable.Pane defaultSize={75}>
        <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
          <span style="font-weight:600">Three</span>
        </div>
      </Resizable.Pane>
    </Resizable.PaneGroup>
  </Resizable.Pane>
</Resizable.PaneGroup>`;

	const codeVertical = `<Resizable.PaneGroup direction="vertical" maxWidth="28rem" minHeight="200px" bordered radius="lg">
  <Resizable.Pane defaultSize={25}>
    <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
      <span style="font-weight:600">Header</span>
    </div>
  </Resizable.Pane>
  <Resizable.Handle />
  <Resizable.Pane defaultSize={75}>
    <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
      <span style="font-weight:600">Content</span>
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>`;

	const codeHandle = `<Resizable.PaneGroup direction="horizontal" maxWidth="28rem" minHeight="200px" bordered radius="lg">
  <Resizable.Pane defaultSize={25}>
    <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
      <span style="font-weight:600">Sidebar</span>
    </div>
  </Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane defaultSize={75}>
    <div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
      <span style="font-weight:600">Content</span>
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>`;
</script>

<h1 class="doc-title">Resizable</h1>
<p class="doc-lede">Accessible, draggable split panes with keyboard support. Compose a <code>PaneGroup</code> with <code>Pane</code>s separated by a <code>Handle</code>, horizontally or vertically.</p>

<Preview description="Nested horizontal and vertical panes" code={codeNested}>
	<Resizable.PaneGroup direction="horizontal" maxWidth="28rem" bordered radius="lg">
		<Resizable.Pane defaultSize={50}>
			<div class="box" style="height:200px; align-items:center; justify-content:center; padding:1.5rem">
				<span style="font-weight:600">One</span>
			</div>
		</Resizable.Pane>
		<Resizable.Handle />
		<Resizable.Pane defaultSize={50}>
			<Resizable.PaneGroup direction="vertical">
				<Resizable.Pane defaultSize={25}>
					<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
						<span style="font-weight:600">Two</span>
					</div>
				</Resizable.Pane>
				<Resizable.Handle />
				<Resizable.Pane defaultSize={75}>
					<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
						<span style="font-weight:600">Three</span>
					</div>
				</Resizable.Pane>
			</Resizable.PaneGroup>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

Or copy `src/lib/components/resizable/` into your project. It depends on `paneforge`, and it
expects the library tokens to exist.

## Usage

<CodeBlock code={usage} lang="svelte" />

`Pane` is re-exported from paneforge. Put content inside each pane; sizes are percentages of the group. Size the group with <code>minHeight</code> / <code>maxWidth</code> (or a sized parent) — paneforge owns inline <code>height</code> and <code>width</code>.

## Examples

{#snippet demoNested()}
	<Resizable.PaneGroup direction="horizontal" maxWidth="28rem" bordered radius="lg">
		<Resizable.Pane defaultSize={50}>
			<div class="box" style="height:200px; align-items:center; justify-content:center; padding:1.5rem">
				<span style="font-weight:600">One</span>
			</div>
		</Resizable.Pane>
		<Resizable.Handle />
		<Resizable.Pane defaultSize={50}>
			<Resizable.PaneGroup direction="vertical">
				<Resizable.Pane defaultSize={25}>
					<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
						<span style="font-weight:600">Two</span>
					</div>
				</Resizable.Pane>
				<Resizable.Handle />
				<Resizable.Pane defaultSize={75}>
					<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
						<span style="font-weight:600">Three</span>
					</div>
				</Resizable.Pane>
			</Resizable.PaneGroup>
		</Resizable.Pane>
	</Resizable.PaneGroup>
{/snippet}

{#snippet demoVertical()}
	<Resizable.PaneGroup direction="vertical" maxWidth="28rem" minHeight="200px" bordered radius="lg">
		<Resizable.Pane defaultSize={25}>
			<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
				<span style="font-weight:600">Header</span>
			</div>
		</Resizable.Pane>
		<Resizable.Handle />
		<Resizable.Pane defaultSize={75}>
			<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
				<span style="font-weight:600">Content</span>
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
{/snippet}

{#snippet demoHandle()}
	<Resizable.PaneGroup direction="horizontal" maxWidth="28rem" minHeight="200px" bordered radius="lg">
		<Resizable.Pane defaultSize={25}>
			<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
				<span style="font-weight:600">Sidebar</span>
			</div>
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane defaultSize={75}>
			<div class="box" style="height:100%; align-items:center; justify-content:center; padding:1.5rem">
				<span style="font-weight:600">Content</span>
			</div>
		</Resizable.Pane>
	</Resizable.PaneGroup>
{/snippet}

<Examples
	items={[
		{ title: 'Nested', demo: demoNested, code: codeNested },
		{ title: 'Vertical', demo: demoVertical, code: codeVertical },
		{ title: 'With handle', demo: demoHandle, code: codeHandle }
	]}
/>

## Props

### PaneGroup

<PropsTable props={groupProps} />

### Handle

<PropsTable props={handleProps} />

### Pane

Re-exported from paneforge. Common props:

<PropsTable props={paneProps} />

## Theming

<div class="doc-table-wrap">

| Token          | Used for                                      |
| -------------- | --------------------------------------------- |
| `--border`     | Handle line, grip pill, optional group border |
| `--background` | Focus ring offset colour                      |
| `--ring`       | Focus ring colour                             |
| `--radius`     | Grip pill and group `radius="lg"`             |

</div>
