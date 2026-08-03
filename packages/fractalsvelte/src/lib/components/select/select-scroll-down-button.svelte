<script lang="ts" module>
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import { Select as SelectPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type SelectScrollDownButtonProps =
		WithoutChildrenOrChild<SelectPrimitive.ScrollDownButtonProps> & {
			icon?: Snippet;
		};
</script>

<script lang="ts">
	let { ref = $bindable(null), icon, ...restProps }: SelectScrollDownButtonProps = $props();
</script>

<SelectPrimitive.ScrollDownButton bind:ref data-slot="select-scroll-down-button" {...restProps}>
	{#if icon}
		{@render icon()}
	{:else}
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="m6 9 6 6 6-6" />
		</svg>
	{/if}
</SelectPrimitive.ScrollDownButton>
