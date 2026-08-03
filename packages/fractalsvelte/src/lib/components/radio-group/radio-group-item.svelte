<script lang="ts" module>
	import type { WithElementRef, WithoutChildrenOrChild } from '$lib/utils.js';
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import type { Snippet } from 'svelte';

	export type RadioGroupItemProps = WithElementRef<
		WithoutChildrenOrChild<RadioGroupPrimitive.ItemProps>,
		HTMLButtonElement
	> & {
		indicator?: Snippet;
	};
</script>

<script lang="ts">
	let { ref = $bindable(null), indicator, ...restProps }: RadioGroupItemProps = $props();
</script>

<RadioGroupPrimitive.Item bind:ref data-slot="radio-group-item" {...restProps}>
	{#snippet children({ checked })}
		<span data-slot="radio-group-indicator" data-checked={checked || undefined}>
			{#if checked}
				{#if indicator}
					{@render indicator()}
				{:else}
					<svg viewBox="0 0 8 8" aria-hidden="true">
						<circle cx="4" cy="4" r="4" />
					</svg>
				{/if}
			{/if}
		</span>
	{/snippet}
</RadioGroupPrimitive.Item>
