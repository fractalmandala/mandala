<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type ShimmerProps = WithElementRef<HTMLAttributes<HTMLElement>> & {
		/** HTML tag to render. Default `p`. */
		as?: keyof HTMLElementTagNameMap;
		/** Animation cycle duration in seconds. Default `2`. */
		duration?: number;
		/** Multiplier for highlight width vs content length. Default `2`. */
		spread?: number;
		/**
		 * Approximate character count of the text — used to size the shimmer band.
		 * Defaults to 30 when omitted. Prefer the length of the rendered string.
		 */
		contentLength?: number;
		children?: Snippet;
	};
</script>

<script lang="ts">
	let {
		as = 'p',
		duration = 2,
		spread = 2,
		contentLength = 30,
		children,
		ref = $bindable(null),
		...restProps
	}: ShimmerProps = $props();

	const dynamicSpread = $derived(contentLength * spread);
</script>

<!--
	Shimmer: muted text base + a sliding --background highlight band.
	CSS custom properties drive duration and band width from props.
-->
<svelte:element
	this={as}
	bind:this={ref}
	data-slot="shimmer"
	style="--spread: {dynamicSpread}px; --shimmer-duration: {duration}s;"
	{...restProps}
>
	{@render children?.()}
</svelte:element>
