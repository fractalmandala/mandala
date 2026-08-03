<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { HoverCardContent } from "$lib/components/hover-card/index.js";

	export type ContextContentProps = ComponentProps<typeof HoverCardContent>;
</script>

<script lang="ts">
	let {
		children,
		side = "top",
		align = "center",
		sideOffset = 4,
		ref = $bindable(null),
		...restProps
	}: ContextContentProps = $props();
</script>

<HoverCardContent
	bind:ref
	{side}
	{align}
	{sideOffset}
	data-slot="context-content"
	{...restProps}
>
	{@render children?.()}
</HoverCardContent>
