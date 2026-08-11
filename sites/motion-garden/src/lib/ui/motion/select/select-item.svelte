<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { Check } from '@lucide/svelte';
	import { ITEM_VARIANTS } from './select.utils.js';
	import { useSelectContext } from './select.context.js';
	import type { SelectItemProps } from './select.types.js';
	import './select.sass';

	let {
		value,
		label: labelProp,
		disabled = false,
		class: className,
		children
	}: SelectItemProps = $props();

	const ctx = useSelectContext('SelectItem');
	const selected = $derived(ctx.value === value);
	const label = $derived(labelProp ?? value);

	$effect(() => {
		ctx.register(value, label);
		return () => ctx.unregister(value);
	});
</script>

<motion.li variants={ctx.reduce ? undefined : ITEM_VARIANTS}>
	<button
		type="button"
		role="option"
		aria-selected={selected}
		disabled={disabled}
		onclick={() => ctx.select(value)}
		data-slot="select-item-button"
		data-selected={selected ? 'true' : undefined}
		class={className}
	>
		{@render children()}
		{#if selected}
			<Check aria-hidden="true" size={14} />
		{/if}
	</button>
</motion.li>
