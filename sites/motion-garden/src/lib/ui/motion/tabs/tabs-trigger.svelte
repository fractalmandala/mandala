<script lang="ts">
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import { getTabsContext, TABS_TRANSITION } from './tabs-context.js';

	let {
		value,
		children,
		class: className,
		indicatorClassName
	}: {
		value: string;
		children: Snippet;
		class?: string;
		indicatorClassName?: string;
	} = $props();

	const tabs = getTabsContext();
	const reduce = useReducedMotion();
	const active = $derived(tabs.value === value);

	function onKeyDown(event: KeyboardEvent) {
		const tab = event.currentTarget as HTMLElement;
		const tabsList = Array.from(
			tab.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []
		);
		const index = tabsList.indexOf(tab);
		if (index === -1) return;
		let next: number | null = null;
		if (event.key === 'ArrowRight') next = (index + 1) % tabsList.length;
		else if (event.key === 'ArrowLeft') next = (index - 1 + tabsList.length) % tabsList.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = tabsList.length - 1;
		if (next === null) return;
		event.preventDefault();
		tabsList[next].focus();
		tabs.setValue(tabsList[next].getAttribute('data-value') ?? value);
	}
</script>

<button
	type="button"
	role="tab"
	data-value={value}
	aria-selected={active}
	onclick={() => tabs.setValue(value)}
	onkeydown={onKeyDown}
	data-slot="tabs-trigger"
	class={className}
>
	{#if active}
		<motion.span
			layoutId={tabs.layoutId}
			style={{
				borderRadius: tabs.variant === 'pill' ? 9999 : tabs.variant === 'segment' ? 8 : 0
			}}
			transition={$reduce ? { duration: 0 } : TABS_TRANSITION}
			data-slot="tabs-indicator"
			class={indicatorClassName}
		/>
	{/if}
	{@render children()}
</button>
