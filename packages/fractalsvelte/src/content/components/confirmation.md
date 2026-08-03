<script lang="ts">
	import * as Confirmation from '$lib/components/ai-elements/confirmation/index.js';
	import CodeBlock from '$lib/docs/CodeBlock.svelte';
	import Preview from '$lib/docs/Preview.svelte';
	import PropsTable from '$lib/docs/PropsTable.svelte';
	import type { PropRow } from '$lib/docs/PropsTable.svelte';

	const rootProps: PropRow[] = [
		{
			name: 'state',
			type: 'ToolUIPartState',
			description: 'State of tool execution / approval request.'
		},
		{
			name: 'approval',
			type: 'ToolUIPartApproval',
			description: 'Approval status object.'
		}
	];

	const codeInstall = `npm i fractalsvelte`;
	const usage = `<script lang="ts">
  import * as Confirmation from "fractalsvelte/ai-elements/confirmation";
<\/script>

<Confirmation.Root state="approval-requested" approval={{ id: "tool-1" }}>
  <Confirmation.Title>Allow system to delete temporary files?</Confirmation.Title>
  <Confirmation.Request>
    <Confirmation.Actions>
      <Confirmation.Action variant="outline">Deny</Confirmation.Action>
      <Confirmation.Action>Approve</Confirmation.Action>
    </Confirmation.Actions>
  </Confirmation.Request>
</Confirmation.Root>`;
</script>

<h1 class="doc-title">Confirmation</h1>
<p class="doc-lede">User approval prompt component for AI tool calls and confirmation requests.</p>

<Preview description="Confirmation - request state" code={usage}>
	<div style="max-width: 28rem; margin-inline: auto;">
		<Confirmation.Root state="approval-requested" approval={{ id: "tool-1" }}>
			<Confirmation.Title>Allow system to delete temporary files?</Confirmation.Title>
			<Confirmation.Request>
				<Confirmation.Actions>
					<Confirmation.Action variant="outline">Deny</Confirmation.Action>
					<Confirmation.Action>Approve</Confirmation.Action>
				</Confirmation.Actions>
			</Confirmation.Request>
		</Confirmation.Root>
	</div>
</Preview>

## Installation

Install the package:

<CodeBlock code={codeInstall} lang="bash" />

## Usage

<CodeBlock code={usage} />

## Props

### Confirmation.Root

<PropsTable props={rootProps} />
