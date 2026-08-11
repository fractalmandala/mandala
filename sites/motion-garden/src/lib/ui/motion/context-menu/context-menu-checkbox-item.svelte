<script lang="ts">
	import { AnimatePresence, motion } from '@humanspeak/svelte-motion';
	import { Check } from '@lucide/svelte';
	import { SPRING_PANEL } from '$lib/ui/lib/ease.js';
	import { getContextMenuContext } from './context-menu-context.js';
	import ContextMenuItemBase from './context-menu-item-base.svelte';
	import type { ContextMenuCheckboxItemProps } from './context-menu.types.js';
	import './context-menu.sass';

	let { children, checked, onCheckedChange, ...rest }: ContextMenuCheckboxItemProps = $props();

	const ctx = getContextMenuContext('ContextMenuCheckboxItem');
</script>

<ContextMenuItemBase
	{...rest}
	role="menuitemcheckbox"
	ariaChecked={checked}
	onSelect={() => onCheckedChange?.(!checked)}
>
	<span data-slot="context-menu-icon">
		<AnimatePresence initial={false}>
			{#if checked}
				<motion.span
					key="check"
					initial={ctx.reduce ? false : { opacity: 0, scale: 0.75 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: ctx.reduce ? 1 : 0.75 }}
					transition={ctx.reduce ? { duration: 0.08 } : SPRING_PANEL}
				>
					<Check aria-hidden="true" size={14} strokeWidth={2.4} />
				</motion.span>
			{/if}
		</AnimatePresence>
	</span>
	{@render children()}
</ContextMenuItemBase>
