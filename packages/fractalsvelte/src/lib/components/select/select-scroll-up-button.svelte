<script lang="ts" module>
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import { Select as SelectPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type SelectScrollUpButtonProps =
		WithoutChildrenOrChild<SelectPrimitive.ScrollUpButtonProps> & {
			icon?: Snippet;
		};
</script>

<script lang="ts">
	let { ref = $bindable(null), icon, ...restProps }: SelectScrollUpButtonProps = $props();
</script>

<SelectPrimitive.ScrollUpButton bind:ref data-slot="select-scroll-up-button" {...restProps}>
	{#if icon}
		{@render icon()}
	{:else}
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="m18 15-6-6-6 6" />
		</svg>
	{/if}
</SelectPrimitive.ScrollUpButton>
