<script lang="ts" module>
	import type { WithoutChild } from '$lib/utils.js';
	import { Select as SelectPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type SelectItemProps = WithoutChild<SelectPrimitive.ItemProps> & {
		indicator?: Snippet;
		children?: Snippet<[{ selected: boolean; highlighted: boolean }]>;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		value,
		label,
		indicator,
		children: childrenProp,
		...restProps
	}: SelectItemProps = $props();
</script>

<SelectPrimitive.Item bind:ref {value} data-slot="select-item" {label} {...restProps}>
	{#snippet children({ selected, highlighted })}
		<span data-slot="select-item-indicator" aria-hidden="true">
			{#if selected}
				{#if indicator}
					{@render indicator()}
				{:else}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
						<path d="M20 6 9 17l-5-5" />
					</svg>
				{/if}
			{/if}
		</span>
		<span data-slot="select-item-text">
			{#if childrenProp}
				{@render childrenProp({ selected, highlighted })}
			{:else}
				{label || value}
			{/if}
		</span>
	{/snippet}
</SelectPrimitive.Item>
