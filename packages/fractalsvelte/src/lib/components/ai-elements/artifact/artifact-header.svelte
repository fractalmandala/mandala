<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ArtifactHeaderProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: ArtifactHeaderProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="artifact-header"
	{...restProps}
>
	{@render children?.()}
</div>
