<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLSelectAttributes } from "svelte/elements";

	export type NativeSelectSize = "default" | "sm";

	export type NativeSelectProps = Omit<WithElementRef<HTMLSelectAttributes>, "size"> & {
		size?: NativeSelectSize;
		/** Replaces the built-in chevron. */
		icon?: import("svelte").Snippet;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value = $bindable(),
		size = "default",
		icon,
		children,
		...restProps
	}: NativeSelectProps = $props();
</script>

<div data-slot="native-select-wrapper" data-size={size}>
	<select bind:this={ref} bind:value data-slot="native-select" data-size={size} {...restProps}>
		{@render children?.()}
	</select>

	<span data-slot="native-select-icon" aria-hidden="true">
		{#if icon}
			{@render icon()}
		{:else}
			<!-- Decorative chevron. The library ships no icon dependency, so it is inline;
			     pass the `icon` snippet to substitute your own. -->
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="m6 9 6 6 6-6" />
			</svg>
		{/if}
	</span>
</div>
