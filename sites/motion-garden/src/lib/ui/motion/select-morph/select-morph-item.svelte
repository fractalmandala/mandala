<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { Check } from '@lucide/svelte';
	import { ITEM } from './select-morph.utils.js';
	import { useMorphSelectContext } from './select-morph-context.js';
	import type { MorphSelectItemProps } from './select-morph.types.js';
	import './select-morph.sass';

	let {
		value,
		label: labelProp,
		disabled = false,
		class: className,
		children
	}: MorphSelectItemProps = $props();

	const ctx = useMorphSelectContext('MorphSelectItem');

	const selected = $derived(ctx.value === value);
	const label = $derived.by(() => labelProp ?? value);

	// Register the display label with the root so the trigger/header can
	// resolve the selected value without rendering the items.
	$effect.pre(() => {
		ctx.register(value, label);
		return () => ctx.unregister(value);
	});
</script>

<motion.li variants={ctx.reduce ? undefined : ITEM} data-slot="select-morph-item">
	<button
		type="button"
		role="option"
		aria-selected={selected}
		disabled={disabled}
		data-slot="select-morph-item-button"
		data-selected={selected ? 'true' : undefined}
		data-disabled={disabled ? 'true' : undefined}
		class={className}
		onclick={() => ctx.select(value)}
	>
		{@render children()}
		{#if selected}
			<Check aria-hidden="true" size={14} />
		{/if}
	</button>
</motion.li>
