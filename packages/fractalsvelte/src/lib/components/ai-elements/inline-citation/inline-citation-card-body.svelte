<script lang="ts" module>
	import type { ComponentProps } from "svelte";
	import { HoverCardContent } from "$lib/components/hover-card/index.js";

	export type InlineCitationCardBodyProps = ComponentProps<typeof HoverCardContent>;
</script>

<script lang="ts">
	let {
		children,
		ref = $bindable(null),
		...restProps
	}: InlineCitationCardBodyProps = $props();
</script>

<HoverCardContent
	bind:ref
	data-slot="inline-citation-card-body"
	{...restProps}
>
	{@render children?.()}
</HoverCardContent>
