<script lang="ts" module>
	import type { WithoutChild } from '$lib/utils.js';
	import { Menubar as MenubarPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type MenubarRadioItemProps = WithoutChild<MenubarPrimitive.RadioItemProps> & {
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
	}: MenubarRadioItemProps = $props();
</script>

<MenubarPrimitive.RadioItem
	bind:ref
	data-slot="menubar-radio-item"
	data-inset={inset || undefined}
	{...restProps}
>
	{#snippet children({ checked })}
		<span data-slot="menubar-radio-item-indicator" aria-hidden="true">
			{#if checked}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
					<path d="M20 6 9 17l-5-5" />
				</svg>
			{/if}
		</span>
		{@render childrenProp?.({ checked })}
	{/snippet}
</MenubarPrimitive.RadioItem>
