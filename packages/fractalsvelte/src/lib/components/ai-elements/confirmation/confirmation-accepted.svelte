<script lang="ts" module>
	import type { Snippet } from "svelte";

	export type ConfirmationAcceptedProps = {
		children?: Snippet;
	};
</script>

<script lang="ts">
	import { getConfirmationContext } from "./confirmation-context.svelte.js";

	let { children }: ConfirmationAcceptedProps = $props();

	const context = getConfirmationContext();

	let shouldShow = $derived(
		context.approval?.approved === true &&
			(context.state === "approval-responded" ||
				context.state === "output-denied" ||
				context.state === "output-available")
	);
</script>

{#if shouldShow}
	{@render children?.()}
{/if}
