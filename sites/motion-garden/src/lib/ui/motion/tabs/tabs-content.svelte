<script lang="ts">
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import { getTabsContext } from './tabs-context.js';
	import { EASE_OUT } from '$lib/ui/lib/ease.js';

	let {
		value,
		children,
		class: className
	}: {
		value: string;
		children: Snippet;
		class?: string;
	} = $props();

	const tabs = getTabsContext();
	const reduce = useReducedMotion();
	const active = $derived(tabs.value === value);
</script>

{#if active}
	<motion.div
		key={value}
		initial={{ opacity: 0, y: $reduce ? 0 : 4 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.18, ease: EASE_OUT }}
		data-slot="tabs-content"
		class={className}
	>
		{@render children()}
	</motion.div>
{:else}
	<!-- Inactive panels stay mounted but hidden so their content stays in the
	     DOM (crawlers, assistive tech, measurement). -->
	<div hidden data-slot="tabs-content" class={className}>
		{@render children()}
	</div>
{/if}
