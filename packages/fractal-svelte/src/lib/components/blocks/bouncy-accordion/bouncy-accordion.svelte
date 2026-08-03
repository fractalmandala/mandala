<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export interface BouncyAccordionItem { id: string; title: string; description?: string; content?: Snippet; icon?: Snippet; disabled?: boolean }
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import './bouncy-accordion.sass';
	let { items, value = $bindable(), defaultValue = null, onValueChange, collapsible = true }:
		{ items: BouncyAccordionItem[]; value?: string | null; defaultValue?: string | null; onValueChange?: (value: string | null) => void; collapsible?: boolean } = $props();
	let internalValue = $state<string | null>(untrack(() => defaultValue));
	const activeValue = $derived(value === undefined ? internalValue : value);
	const baseId = `accordion-${Math.random().toString(36).slice(2)}`;

	function toggle(id: string) {
		const next = activeValue === id ? (collapsible ? null : id) : id;
		if (value === undefined) internalValue = next;
		else value = next;
		onValueChange?.(next);
	}
</script>

<div data-slot="bouncy-accordion">
	{#each items as item (item.id)}
		{@const open = activeValue === item.id}
		<div data-slot="bouncy-accordion-item" data-state={open ? 'open' : 'closed'}>
			<button type="button" data-slot="bouncy-accordion-trigger" id={`${baseId}-${item.id}-trigger`} disabled={item.disabled}
				aria-expanded={open} aria-controls={`${baseId}-${item.id}-panel`} onclick={() => toggle(item.id)}>
				{#if item.icon}<span data-slot="bouncy-accordion-icon" aria-hidden="true">{@render item.icon()}</span>{/if}
				<span data-slot="bouncy-accordion-title">{item.title}</span>
				<svg data-slot="bouncy-accordion-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
			</button>
			<div data-slot="bouncy-accordion-panel" id={`${baseId}-${item.id}-panel`} role="region"
				aria-labelledby={`${baseId}-${item.id}-trigger`} aria-hidden={!open} hidden={!open}>
				<div data-slot="bouncy-accordion-content">
					{#if item.content}{@render item.content()}{:else}{item.description}{/if}
				</div>
			</div>
		</div>
	{/each}
</div>
