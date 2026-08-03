<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Button } from "$lib/components/button/index.js";

	export type ContextTriggerProps = ComponentProps<typeof Button>;
</script>

<script lang="ts">
	import { HoverCardTrigger } from "$lib/components/hover-card/index.js";
	import ContextIcon from "./context-icon.svelte";
	import { getContextValue } from "./context-context.svelte.js";

	let {
		children,
		variant = "ghost",
		ref = $bindable(null),
		...restProps
	}: ContextTriggerProps = $props();

	const context = getContextValue();
</script>

<HoverCardTrigger>
	{#if children}
		{@render children()}
	{:else}
		<Button
			bind:ref
			type="button"
			{variant}
			{...restProps}
			data-context-trigger="true"
		>
			<span data-slot="context-trigger-percent">
				{context.displayPercent}
			</span>
			<ContextIcon />
		</Button>
	{/if}
</HoverCardTrigger>
