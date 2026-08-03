<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ArtifactProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: ArtifactProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="artifact"
	{...restProps}
>
	{@render children?.()}
</div>
