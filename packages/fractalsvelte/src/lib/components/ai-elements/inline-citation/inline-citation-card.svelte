<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { Root as HoverCardRoot } from "$lib/components/hover-card/index.js";

	export type InlineCitationCardProps = ComponentProps<typeof HoverCardRoot>;
</script>

<script lang="ts">
	let {
		children,
		closeDelay = 0,
		openDelay = 0,
		open = $bindable(false),
		...restProps
	}: InlineCitationCardProps = $props();
</script>

<HoverCardRoot bind:open {closeDelay} {openDelay} {...restProps}>
	{@render children?.()}
</HoverCardRoot>
