<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ArtifactDescriptionProps = WithElementRef<HTMLAttributes<HTMLParagraphElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: ArtifactDescriptionProps = $props();
</script>

<p
	bind:this={ref}
	data-slot="artifact-description"
	{...restProps}
>
	{@render children?.()}
</p>
