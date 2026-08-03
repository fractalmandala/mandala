<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type ActionSwapAnimation = 'blur' | 'roll' | 'cascade';
	export type ActionSwapVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
	export type ActionSwapSize = 'sm' | 'md' | 'lg' | 'icon';
	export interface ActionSwapItem { id: string; label: string; icon?: Snippet; ariaLabel?: string }
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import './action-swap.sass';

	let {
		items = [], value = $bindable(), defaultValue, onValueChange, variant = 'secondary', size = 'md',
		animation = 'blur', iconOnly = size === 'icon', cycle = true, disabled = false, children
	}: {
		items?: ActionSwapItem[]; value?: string; defaultValue?: string;
		onValueChange?: (value: string, item: ActionSwapItem) => void; variant?: ActionSwapVariant;
		size?: ActionSwapSize; animation?: ActionSwapAnimation; iconOnly?: boolean; cycle?: boolean;
		disabled?: boolean; children?: Snippet<[ActionSwapItem]>;
	} = $props();

	let internalValue = $state(untrack(() => defaultValue));
	const currentValue = $derived(value ?? internalValue ?? items[0]?.id);
	const activeIndex = $derived(Math.max(0, items.findIndex((item) => item.id === currentValue)));
	const activeItem = $derived(items[activeIndex] ?? items[0]);
	const hasIcon = $derived(items.some((item) => item.icon));

	function activate() {
		if (disabled || !cycle || items.length === 0) return;
		const next = items[(activeIndex + 1) % items.length];
		if (!next) return;
		if (value === undefined) internalValue = next.id;
		else value = next.id;
		onValueChange?.(next.id, next);
	}
</script>

{#if activeItem}
	<button
		type="button" data-slot="action-swap" data-variant={variant} data-size={size}
		data-animation={animation} disabled={disabled} aria-label={activeItem.ariaLabel ?? (iconOnly ? activeItem.label : undefined)}
		onclick={activate}
	>
		{#if hasIcon}
			<span data-slot="action-swap-icon" aria-hidden="true" data-key={activeItem.id}>
				{#if activeItem.icon}{@render activeItem.icon()}{/if}
			</span>
		{/if}
		{#if !iconOnly}
			<span data-slot="action-swap-text" data-key={activeItem.id}>
				{#if animation === 'cascade'}
					<span data-slot="action-swap-sr">{activeItem.label}</span>
					<span aria-hidden="true" data-slot="action-swap-letters">
						{#each Array.from(activeItem.label) as letter, index}<span style:--swap-index={index}>{letter}</span>{/each}
					</span>
				{:else}{activeItem.label}{/if}
			</span>
		{/if}
		{#if children}{@render children(activeItem)}{/if}
	</button>
{/if}
