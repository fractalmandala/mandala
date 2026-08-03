<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type AvatarBadgeProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: AvatarBadgeProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="avatar-badge"
	{...restProps}
>
	{@render children?.()}
</span>
