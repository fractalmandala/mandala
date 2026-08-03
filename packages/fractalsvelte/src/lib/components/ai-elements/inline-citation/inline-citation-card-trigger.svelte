<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Badge } from "$lib/components/badge/index.js";

	export type InlineCitationCardTriggerProps = ComponentProps<typeof Badge> & {
		sources: string[];
	};
</script>

<script lang="ts">
	import { HoverCardTrigger } from "$lib/components/hover-card/index.js";

	let {
		sources,
		children,
		variant = "secondary",
		ref = $bindable(null),
		...restProps
	}: InlineCitationCardTriggerProps = $props();

	const badgeContent = $derived.by(() => {
		if (!sources.length) return "unknown";

		try {
			const hostname = new URL(sources[0]).hostname;
			return sources.length > 1 ? `${hostname} +${sources.length - 1}` : hostname;
		} catch {
			return sources.length > 1 ? `${sources[0]} +${sources.length - 1}` : sources[0];
		}
	});
</script>

<HoverCardTrigger>
	<Badge
		bind:ref
		{variant}
		data-slot="inline-citation-card-trigger"
		{...restProps}
	>
		{#if children}
			{@render children()}
		{:else}
			{badgeContent}
		{/if}
	</Badge>
</HoverCardTrigger>
