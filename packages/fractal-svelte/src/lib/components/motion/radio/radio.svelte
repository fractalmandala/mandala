<script lang="ts">
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { SPRING_LAYOUT } from '$lib/ease.js';
	import './radio.sass';

	export interface RadioItem { value: string; label: string; disabled?: boolean; id?: string }
	interface Props { items: RadioItem[]; value?: string; defaultValue?: string; disabled?: boolean; name?: string; orientation?: 'horizontal' | 'vertical'; onchange?: (value: string) => void }
	let { items = [], value = $bindable(), defaultValue = '', disabled = false, name = 'radio', orientation = 'vertical', onchange }: Props = $props();
	const reduce = useReducedMotion();
	let current = $derived(value ?? defaultValue);
	let refs: Record<string, HTMLButtonElement> = {};
	function select(item: RadioItem) { if (disabled || item.disabled) return; value = item.value; onchange?.(item.value); }
	function move(event: KeyboardEvent, index: number) {
		const forward = event.key === 'ArrowRight' || event.key === 'ArrowDown';
		const backward = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
		if (!forward && !backward) return;
		event.preventDefault();
		let next = index;
		do next = (next + (forward ? 1 : -1) + items.length) % items.length; while (items[next]?.disabled && next !== index);
		select(items[next]); refs[items[next].value]?.focus();
	}
</script>

<div data-slot="radio-group" role="radiogroup" aria-orientation={orientation} data-orientation={orientation}>
	{#each items as item, index}
		<label data-slot="radio-item" data-disabled={disabled || item.disabled}>
			<button bind:this={refs[item.value]} id={item.id} type="button" role="radio" name={name} aria-checked={item.value === current} disabled={disabled || item.disabled} tabindex={item.value === current || (!current && index === 0) ? 0 : -1} onclick={() => select(item)} onkeydown={(event) => move(event, index)} data-slot="radio-control">
				{#if item.value === current}<motion.span data-slot="radio-dot" layoutId={`radio-${name}`} transition={$reduce ? { duration: 0 } : SPRING_LAYOUT} />{/if}
			</button>
			<span data-slot="radio-label">{item.label}</span>
		</label>
	{/each}
</div>
