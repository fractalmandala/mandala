<script lang="ts" module>
	import type { WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import DialogClose from './dialog-close.svelte';

	export type DialogFooterAlign = 'end' | 'start' | 'between';

	export type DialogFooterProps = WithElementRef<
		HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	> & {
		align?: DialogFooterAlign;
		showCloseButton?: boolean;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		align = 'end',
		showCloseButton = false,
		...restProps
	}: DialogFooterProps = $props();
</script>

<div bind:this={ref} data-slot="dialog-footer" data-align={align} {...restProps}>
	{@render children?.()}
	{#if showCloseButton}
		<DialogClose>Close</DialogClose>
	{/if}
</div>
