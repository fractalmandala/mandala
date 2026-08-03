<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ArtifactContentProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: ArtifactContentProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="artifact-content"
	{...restProps}
>
	{@render children?.()}
</div>
