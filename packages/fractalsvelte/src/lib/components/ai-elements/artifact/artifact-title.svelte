<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type ArtifactTitleProps = WithElementRef<HTMLAttributes<HTMLParagraphElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: ArtifactTitleProps = $props();
</script>

<p
	bind:this={ref}
	data-slot="artifact-title"
	{...restProps}
>
	{@render children?.()}
</p>
