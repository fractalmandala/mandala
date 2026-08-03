<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Alert } from "$lib/components/alert/index.js";
	import type { ToolUIPartApproval, ToolUIPartState } from "./confirmation-context.svelte.js";

	export type ConfirmationProps = ComponentProps<typeof Alert> & {
		approval?: ToolUIPartApproval;
		state: ToolUIPartState;
	};
</script>

<script lang="ts">
	import { setConfirmationContext } from "./confirmation-context.svelte.js";

	let {
		approval,
		state,
		children,
		ref = $bindable(null),
		...restProps
	}: ConfirmationProps = $props();

	let shouldRender = $derived(
		approval && state !== "input-streaming" && state !== "input-available"
	);

	setConfirmationContext({
		get approval() {
			return approval;
		},
		get state() {
			return state;
		}
	});
</script>

{#if shouldRender}
	<Alert
		bind:ref
		data-slot="confirmation"
		{...restProps}
	>
		{@render children?.()}
	</Alert>
{/if}
