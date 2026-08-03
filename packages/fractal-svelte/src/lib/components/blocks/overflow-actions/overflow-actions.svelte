<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export interface OverflowActionItem { id: string; label: string; icon?: Snippet; onclick?: () => void; disabled?: boolean; variant?: 'default' | 'destructive' }
</script>

<script lang="ts">
	import './overflow-actions.sass';
	let { items, children, open = $bindable(false), onOpenChange, onAction, placement = 'bottom-end', label = 'More actions' }:
		{ items: OverflowActionItem[]; children?: Snippet; open?: boolean; onOpenChange?: (open: boolean) => void; onAction?: (item: OverflowActionItem) => void;
		placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'; label?: string } = $props();
	let trigger: HTMLButtonElement;
	let menu = $state<HTMLDivElement>();
	let menuItems: HTMLButtonElement[] = [];
	const menuId = `overflow-${Math.random().toString(36).slice(2)}`;
	function setOpen(next: boolean, focus = false) { open = next; onOpenChange?.(next); if (focus) queueMicrotask(() => menuItems.find((item) => !item.disabled)?.focus()); }
	function toggle() { setOpen(!open, !open); }
	function action(item: OverflowActionItem) { item.onclick?.(); onAction?.(item); setOpen(false); trigger.focus(); }
	function keydown(event: KeyboardEvent) {
		const enabled = menuItems.filter((item) => !item.disabled); const index = enabled.indexOf(document.activeElement as HTMLButtonElement);
		if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.focus(); }
		else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); enabled[(index + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length]?.focus(); }
		else if (event.key === 'Home') { event.preventDefault(); enabled[0]?.focus(); }
		else if (event.key === 'End') { event.preventDefault(); enabled.at(-1)?.focus(); }
	}
	$effect(() => {
		if (!open) return;
		const outside = (event: PointerEvent) => { if (menu && !menu.contains(event.target as Node) && !trigger.contains(event.target as Node)) setOpen(false); };
		document.addEventListener('pointerdown', outside); return () => document.removeEventListener('pointerdown', outside);
	});
</script>

<div data-slot="overflow-actions" data-placement={placement}>
	<button bind:this={trigger} type="button" data-slot="overflow-actions-trigger" aria-label={label} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
		onclick={toggle} onkeydown={(e) => { if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true, true); } }}>
		{#if children}{@render children()}{:else}<span aria-hidden="true">•••</span>{/if}
	</button>
	{#if open}
		<div bind:this={menu} id={menuId} data-slot="overflow-actions-menu" role="menu" tabindex="-1" onkeydown={keydown}>
			{#each items as item, index (item.id)}
				<button bind:this={menuItems[index]} type="button" role="menuitem" data-slot="overflow-actions-item" data-variant={item.variant ?? 'default'} disabled={item.disabled} tabindex={index === 0 ? 0 : -1} onclick={() => action(item)}>
					{#if item.icon}<span data-slot="overflow-actions-icon" aria-hidden="true">{@render item.icon()}</span>{/if}{item.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
