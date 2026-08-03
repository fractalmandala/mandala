<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type InputGroupTextProps = WithElementRef<HTMLAttributes<HTMLSpanElement>>;
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		...restProps
	}: InputGroupTextProps = $props();
</script>

<span
	bind:this={ref}
	data-slot="input-group-text"
	{...restProps}
>
	{@render children?.()}
</span>
