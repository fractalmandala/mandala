<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	export type InputGroupAddonAlign = "inline-start" | "inline-end" | "block-start" | "block-end";

	export type InputGroupAddonProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		align?: InputGroupAddonAlign;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		align = "inline-start",
		...restProps
	}: InputGroupAddonProps = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="input-group-addon"
	data-align={align}
	onclick={(e) => {
		if ((e.target as HTMLElement).closest("button")) return;
		(e.currentTarget.parentElement?.querySelector("input, textarea") as HTMLElement | null)?.focus();
	}}
	{...restProps}
>
	{@render children?.()}
</div>
