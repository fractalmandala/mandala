<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export interface ExpandableActionBarItem { id: string; label: string; icon: Snippet; onclick?: () => void; disabled?: boolean; active?: boolean; badge?: string; shortcut?: string }
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import './expandable-action-bar.sass';
	let { items, expanded = $bindable(), defaultExpanded = false, onExpandedChange, activeId, onAction, size = 'md', expandOnHover = true, expandOnFocus = true, collapseDelay = 90 }:
		{ items: ExpandableActionBarItem[]; expanded?: boolean; defaultExpanded?: boolean; onExpandedChange?: (value: boolean) => void; activeId?: string;
		onAction?: (item: ExpandableActionBarItem) => void; size?: 'sm' | 'md'; expandOnHover?: boolean; expandOnFocus?: boolean; collapseDelay?: number } = $props();
	let internalExpanded = $state(untrack(() => defaultExpanded));
	let timer: ReturnType<typeof setTimeout> | undefined;
	const open = $derived(expanded === undefined ? internalExpanded : expanded);
	function setOpen(next: boolean) { clearTimeout(timer); if (expanded === undefined) internalExpanded = next; else expanded = next; onExpandedChange?.(next); }
	function close() { clearTimeout(timer); timer = setTimeout(() => setOpen(false), collapseDelay); }
	function act(item: ExpandableActionBarItem) { item.onclick?.(); onAction?.(item); }
	$effect(() => () => clearTimeout(timer));
</script>

<div data-slot="expandable-action-bar" data-expanded={open} data-size={size} role="toolbar" aria-label="Actions" tabindex="-1"
	onmouseenter={() => expandOnHover && setOpen(true)} onmouseleave={() => expandOnHover && close()}
	onfocusin={() => expandOnFocus && setOpen(true)} onfocusout={(e) => { if (expandOnFocus && !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) close(); }}>
	{#each items as item (item.id)}
		<button type="button" data-slot="expandable-action-bar-item" data-active={item.active || activeId === item.id} disabled={item.disabled} title={item.label} onclick={() => act(item)}>
			<span data-slot="expandable-action-bar-icon" aria-hidden="true">{@render item.icon()}</span>
			<span data-slot="expandable-action-bar-label" aria-hidden={!open}>{item.label}</span>
			{#if item.shortcut}<kbd data-slot="expandable-action-bar-shortcut" aria-hidden={!open}>{item.shortcut}</kbd>{/if}
			{#if item.badge}<span data-slot="expandable-action-bar-badge">{item.badge}</span>{/if}
		</button>
	{/each}
</div>
