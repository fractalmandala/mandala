<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type AvatarGroupProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: AvatarGroupProps = $props();
</script>

<div
	bind:this={ref}
	data-slot="avatar-group"
	{...restProps}
>
	{@render children?.()}
</div>
