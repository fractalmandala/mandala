<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ArtifactActionsProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: ArtifactActionsProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="artifact-actions"
	{...restProps}
>
	{@render children?.()}
</div>
