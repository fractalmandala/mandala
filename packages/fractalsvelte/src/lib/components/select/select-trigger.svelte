<script lang="ts" module>
	import type { WithoutChild } from '$lib/utils.js';
	import { Select as SelectPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type SelectTriggerSize = 'sm' | 'default';
	export type SelectTriggerProps = WithoutChild<SelectPrimitive.TriggerProps> & {
		size?: SelectTriggerSize;
		width?: string;
		icon?: Snippet;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		children,
		size = 'default',
		width,
		icon,
		style: styleProp,
		...restProps
	}: SelectTriggerProps = $props();

	const style = $derived(
		[width ? `width: ${width}` : undefined, styleProp].filter(Boolean).join('; ') || undefined
	);
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	data-size={size}
	{style}
	{...restProps}
>
	<span data-slot="select-value">
		{@render children?.()}
	</span>
	<span data-slot="select-trigger-icon" aria-hidden="true">
		{#if icon}
			{@render icon()}
		{:else}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="m6 9 6 6 6-6" />
			</svg>
		{/if}
	</span>
</SelectPrimitive.Trigger>
