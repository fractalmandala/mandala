<script lang="ts">
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { SPRING_LAYOUT } from '$lib/ease.js';
	import './tabs.sass';
	import type { Snippet } from 'svelte';
	export interface Tab { id: string; label: string; disabled?: boolean }
	interface Props { tabs: Tab[]; activeId?: string; defaultValue?: string; variant?: 'pill' | 'segment' | 'underline'; children?: Snippet<[Tab]>; onchange?: (id: string) => void }
	let { tabs, activeId = $bindable(), defaultValue, variant = 'pill', children, onchange }: Props = $props();
	const reduce = useReducedMotion();
	let fallback = $derived(defaultValue ?? tabs.find((tab) => !tab.disabled)?.id ?? '');
	let current = $derived(activeId ?? fallback);
	let refs: Record<string, HTMLButtonElement> = {};
	function select(tab: Tab) { if (tab.disabled) return; activeId = tab.id; onchange?.(tab.id); }
	function navigate(event: KeyboardEvent, index: number) { let next = index; if (event.key === 'Home') next = 0; else if (event.key === 'End') next = tabs.length - 1; else if (event.key === 'ArrowRight') next = (index + 1) % tabs.length; else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length; else return; event.preventDefault(); while (tabs[next]?.disabled) next = (next + (event.key === 'ArrowLeft' ? -1 : 1) + tabs.length) % tabs.length; select(tabs[next]); refs[tabs[next].id]?.focus(); }
	let selected = $derived(tabs.find((tab) => tab.id === current));
</script>

<div data-slot="tabs" data-variant={variant}>
	<div data-slot="tabs-list" role="tablist" aria-orientation="horizontal">
		{#each tabs as tab, index}<button bind:this={refs[tab.id]} type="button" data-slot="tab-trigger" role="tab" id={`tab-${tab.id}`} aria-selected={tab.id === current} aria-controls={`tabpanel-${tab.id}`} tabindex={tab.id === current ? 0 : -1} disabled={tab.disabled} onclick={() => select(tab)} onkeydown={(event) => navigate(event, index)}>{#if tab.id === current}<motion.span data-slot="tab-indicator" layoutId="tabs-indicator" transition={$reduce ? { duration: 0 } : SPRING_LAYOUT} />{/if}<span data-slot="tab-label">{tab.label}</span></button>{/each}
	</div>
	{#if children && selected}<motion.div key={selected.id} data-slot="tab-panel" role="tabpanel" id={`tabpanel-${selected.id}`} aria-labelledby={`tab-${selected.id}`} tabindex="0" initial={$reduce ? { opacity: 1 } : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: $reduce ? 0 : 0.18 }}>{@render children(selected)}</motion.div>{/if}
</div>
