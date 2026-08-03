<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type AvatarGroupCountProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: AvatarGroupCountProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="avatar-group-count"
	{...restProps}
>
	{@render children?.()}
</div>
