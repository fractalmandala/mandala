<script lang="ts">
	import { untrack } from 'svelte';
	import { useReducedMotion } from '@humanspeak/svelte-motion';
	import { useId } from '$lib/ui/lib/use-id.js';
	import { cn } from '$lib/ui/lib/cn.js';
	import type { BouncyAccordionProps } from './bouncy-accordion.types.js';
	import BouncyAccordionRow from './bouncy-accordion-row.svelte';
	import './bouncy-accordion.sass';

	let {
		items,
		value,
		defaultValue = null,
		onValueChange,
		collapsible = true,
		class: className,
		classNames
	}: BouncyAccordionProps = $props();

	const reduce = useReducedMotion();
	const baseId = useId();

	let internalValue = $state<string | null>(untrack(() => defaultValue));

	const isControlled = $derived(value !== undefined);
	const activeValue = $derived(isControlled ? value ?? null : internalValue);
	const activeIndex = $derived(items.findIndex((item) => item.id === activeValue));

	function setActiveValue(next: string | null) {
		if (!isControlled) internalValue = next;
		onValueChange?.(next);
	}

	function toggleItem(id: string) {
		if (activeValue === id) {
			if (collapsible) setActiveValue(null);
			return;
		}
		setActiveValue(id);
	}
</script>

<div data-slot="bouncy-accordion" class={cn(classNames?.root, className)}>
	{#each items as item, index (item.id)}
		{@const open = activeValue === item.id}
		{@const previousIsOpen = activeIndex === index - 1}
		{@const nextIsOpen = activeIndex === index + 1}
		{@const startsGroup = open || index === 0 || previousIsOpen}
		{@const endsGroup = open || index === items.length - 1 || nextIsOpen}
		{@const separatedFromPrevious = index > 0 && (open || previousIsOpen)}
		{@const contentId = `${baseId}-${item.id}-content`}
		{@const triggerId = `${baseId}-${item.id}-trigger`}
		<BouncyAccordionRow
			{item}
			{open}
			{startsGroup}
			{endsGroup}
			{separatedFromPrevious}
			{contentId}
			{triggerId}
			reduce={reduce.current}
			{classNames}
			onToggle={() => toggleItem(item.id)}
		/>
	{/each}
</div>
