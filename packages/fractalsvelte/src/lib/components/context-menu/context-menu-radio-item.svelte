<script lang="ts" module>
	import type { WithoutChild } from '$lib/utils.js';
	import { ContextMenu as ContextMenuPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type ContextMenuRadioItemProps = WithoutChild<ContextMenuPrimitive.RadioItemProps> & {
		inset?: boolean;
		children?: Snippet<[{ checked: boolean }]>;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		inset = false,
		children: childrenProp,
		...restProps
	}: ContextMenuRadioItemProps = $props();
</script>

<ContextMenuPrimitive.RadioItem
	bind:ref
	data-slot="context-menu-radio-item"
	data-inset={inset || undefined}
	{...restProps}
>
	{#snippet children({ checked })}
		<span data-slot="context-menu-item-indicator" aria-hidden="true">
			{#if checked}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
					<path d="M20 6 9 17l-5-5" />
				</svg>
			{/if}
		</span>
		{@render childrenProp?.({ checked })}
	{/snippet}
</ContextMenuPrimitive.RadioItem>
