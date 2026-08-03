<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ConfirmationActionsProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	import { getConfirmationContext } from "./confirmation-context.svelte.js";

	let {
		children,
		ref = $bindable(null),
		...restProps
	}: ConfirmationActionsProps = $props();

	const context = getConfirmationContext();
	let shouldShow = $derived(context.state === "approval-requested");
</script>

{#if shouldShow}
	<div
		bind:this={ref}
		data-slot="confirmation-actions"
		{...restProps}
	>
		{@render children?.()}
	</div>
{/if}
