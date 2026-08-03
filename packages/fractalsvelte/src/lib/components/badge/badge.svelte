<script lang="ts" module>
	import type { Radius } from "$lib/types.js";
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";

	export type BadgeVariant =
		| "default"
		| "secondary"
		| "destructive"
		| "outline"
		| "ghost"
		| "link";

	export type BadgeProps = WithElementRef<HTMLAttributes<HTMLSpanElement>> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: BadgeVariant;
			radius?: Radius;
		};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		href,
		variant = "default",
		radius,
		children,
		...restProps
	}: BadgeProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="badge"
		data-variant={variant}
		data-radius={radius}
		{href}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<span
		bind:this={ref}
		data-slot="badge"
		data-variant={variant}
		data-radius={radius}
		{...restProps}
	>
		{@render children?.()}
	</span>
{/if}
