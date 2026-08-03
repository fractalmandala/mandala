<script lang="ts" module>
	import type { Radius } from '$lib/types.js';
	import type { WithElementRef, WithoutChildrenOrChild } from '$lib/utils.js';
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type CheckboxSize = 'sm' | 'default' | 'lg';
	export type CheckboxTone = 'default' | 'accent';

	export type CheckboxProps = WithElementRef<
		WithoutChildrenOrChild<CheckboxPrimitive.RootProps>,
		HTMLButtonElement
	> & {
		size?: CheckboxSize;
		radius?: Radius;
		tone?: CheckboxTone;
		checkedIcon?: Snippet;
		indeterminateIcon?: Snippet;
	};
</script>

<script lang="ts">
	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		size = 'default',
		radius,
		tone = 'default',
		checkedIcon,
		indeterminateIcon,
		...restProps
	}: CheckboxProps = $props();
</script>

<CheckboxPrimitive.Root
	bind:ref
	data-slot="checkbox"
	data-size={size}
	data-radius={radius}
	data-tone={tone}
	bind:checked
	bind:indeterminate
	{...restProps}
>
	{#snippet children({ checked, indeterminate })}
		<span data-slot="checkbox-indicator">
			{#if checked}
				{#if checkedIcon}
					{@render checkedIcon()}
				{:else}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
						<path d="M20 6 9 17l-5-5" />
					</svg>
				{/if}
			{:else if indeterminate}
				{#if indeterminateIcon}
					{@render indeterminateIcon()}
				{:else}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
						<path d="M5 12h14" />
					</svg>
				{/if}
			{/if}
		</span>
	{/snippet}
</CheckboxPrimitive.Root>
