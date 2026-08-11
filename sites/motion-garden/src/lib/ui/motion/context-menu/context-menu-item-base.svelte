<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import { SPRING_LAYOUT } from '$lib/ui/lib/ease.js';
	import { useId } from '$lib/ui/lib/use-id.js';
	import { getContextMenuContext } from './context-menu-context.js';
	import type { ContextMenuItemProps } from './context-menu.types.js';
	import './context-menu.sass';

	let {
		children,
		onSelect,
		disabled = false,
		closeOnSelect = true,
		tone = 'default',
		inset = false,
		class: className,
		textValue,
		role = 'menuitem',
		ariaChecked
	}: ContextMenuItemProps & {
		role?: 'menuitem' | 'menuitemcheckbox' | 'menuitemradio';
		ariaChecked?: boolean;
	} = $props();

	const ctx = getContextMenuContext('ContextMenuItem');
	const id = useId();
	const active = $derived(ctx.activeId === id);

	function handlePointerMove(event: PointerEvent) {
		if (!disabled && event.pointerType !== 'touch') {
			const el = event.currentTarget as HTMLElement | null;
			el?.focus();
		}
	}

	function handleClick() {
		if (disabled) return;
		onSelect?.();
		if (closeOnSelect) ctx.setOpen(false);
	}
</script>

<button
	type="button"
	{id}
	{role}
	aria-checked={role === 'menuitem' ? undefined : ariaChecked}
	{disabled}
	data-context-menu-item="true"
	data-disabled={disabled ? 'true' : undefined}
	data-label={textValue}
	data-tone={tone}
	data-inset={inset ? 'true' : undefined}
	tabindex={-1}
	onfocus={() => ctx.setActiveId(id)}
	onpointermove={handlePointerMove}
	onclick={handleClick}
	data-slot="context-menu-item"
	class={className}
>
	{#if active}
		<motion.span
			layoutId={`${ctx.menuId}-active`}
			data-slot="context-menu-item-active"
			data-tone={tone}
			transition={ctx.reduce ? { duration: 0 } : SPRING_LAYOUT}
		/>
	{/if}
	{@render children()}
</button>
