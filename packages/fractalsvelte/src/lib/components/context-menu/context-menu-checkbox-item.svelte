<script lang="ts" module>
	import type { WithoutChildrenOrChild } from '$lib/utils.js';
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type ContextMenuCheckboxItemProps =
		WithoutChildrenOrChild<ContextMenuPrimitive.CheckboxItemProps> & {
			inset?: boolean;
			children?: Snippet;
		};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		inset = false,
		children: childrenProp,
		...restProps
	}: ContextMenuCheckboxItemProps = $props();
</script>

<ContextMenuPrimitive.CheckboxItem
	bind:ref
	bind:checked
	bind:indeterminate
	data-slot="context-menu-checkbox-item"
	data-inset={inset || undefined}
	{...restProps}
>
	{#snippet children({ checked, indeterminate })}
		<span data-slot="context-menu-item-indicator" aria-hidden="true">
			{#if indeterminate}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
					<path d="M5 12h14" />
				</svg>
			{:else if checked}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
					<path d="M20 6 9 17l-5-5" />
				</svg>
			{/if}
		</span>
		{@render childrenProp?.()}
	{/snippet}
</ContextMenuPrimitive.CheckboxItem>
