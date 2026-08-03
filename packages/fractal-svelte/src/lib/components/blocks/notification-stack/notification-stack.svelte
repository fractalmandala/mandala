<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export interface NotificationStackItem { id: string; title: string; description?: string; trailing?: Snippet; actionLabel?: string }
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import './notification-stack.sass';
	let { items, expanded = $bindable(), defaultExpanded = false, onExpandedChange, onViewAll, onAction, onDismiss,
		maxVisible = 3, collapsedLabel = 'Notifications', expandedLabel = 'View all', emptyLabel = 'All caught up', swipeThreshold = 60 }:
		{ items: NotificationStackItem[]; expanded?: boolean; defaultExpanded?: boolean; onExpandedChange?: (value: boolean) => void;
		onViewAll?: () => void; onAction?: (item: NotificationStackItem) => void; onDismiss?: (item: NotificationStackItem) => void;
		maxVisible?: number; collapsedLabel?: string; expandedLabel?: string; emptyLabel?: string; swipeThreshold?: number } = $props();
	let internalExpanded = $state(untrack(() => defaultExpanded));
	let pointerStart = $state<number | null>(null);
	const open = $derived(expanded === undefined ? internalExpanded : expanded);
	const visible = $derived(items.slice(0, Math.max(1, maxVisible)));

	function setOpen(next: boolean) { if (expanded === undefined) internalExpanded = next; else expanded = next; onExpandedChange?.(next); }
	function click() { if (!open) setOpen(true); else if (onViewAll) onViewAll(); else setOpen(false); }
	function keydown(event: KeyboardEvent) { if (event.key === 'Escape') { event.preventDefault(); setOpen(false); } }
	function pointerup(event: PointerEvent, item: NotificationStackItem) {
		if (pointerStart !== null && Math.abs(event.clientX - pointerStart) >= swipeThreshold) onDismiss?.(item);
		pointerStart = null;
	}
</script>

{#if visible.length === 0}
	<div data-slot="notification-empty" role="status">{emptyLabel}</div>
{:else}
	<div data-slot="notification-stack" data-expanded={open} role="group" aria-label="Notifications" onmouseenter={() => setOpen(true)} onmouseleave={() => setOpen(false)} onfocusin={() => setOpen(true)} onfocusout={(e) => { if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setOpen(false); }}>
		<div data-slot="notification-cards" aria-live="polite">
			{#each visible as item, index (item.id)}
				<article data-slot="notification-item" style:--notification-index={index} onpointerdown={(e) => pointerStart = e.clientX} onpointerup={(e) => pointerup(e, item)}>
					<div data-slot="notification-content"><strong>{item.title}</strong>{#if item.description}<span>{item.description}</span>{/if}</div>
					{#if item.trailing}<span data-slot="notification-trailing">{@render item.trailing()}</span>{/if}
					{#if item.actionLabel}<button type="button" data-slot="notification-action" onclick={() => onAction?.(item)}>{item.actionLabel}</button>{/if}
				</article>
			{/each}
		</div>
		<button type="button" data-slot="notification-footer" aria-expanded={open} onclick={click} onkeydown={keydown}>
			<span data-slot="notification-count">{items.length}</span><span>{open ? expandedLabel : collapsedLabel}</span>
		</button>
	</div>
{/if}
