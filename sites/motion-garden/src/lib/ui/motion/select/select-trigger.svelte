<script lang="ts">
	import { motion } from '@humanspeak/svelte-motion';
	import { ChevronDown } from '@lucide/svelte';
	import { EASE_OUT } from '$lib/ui/lib/ease.js';
	import { CHEVRON_TRANSITION, INSTANT_TRANSITION } from './select.utils.js';
	import { useSelectContext } from './select.context.js';
	import type { SelectTriggerProps } from './select.types.js';
	import './select.sass';

	let { class: className, children }: SelectTriggerProps = $props();

	const ctx = useSelectContext('SelectTrigger');
	const isTop = $derived(ctx.placement === 'top');

	// Edge facing the panel flattens then rounds; the far edge stays rounded.
	// All four corners are specified so none gets stranded when placement flips.
	const kf = $derived(ctx.open ? [0, 0, 12] : [12, 0, 12]);
	const kfT = $derived(
		ctx.reduce
			? { duration: 0 }
			: ctx.open
				? { duration: 0.6, times: [0, 0.4, 1], ease: EASE_OUT }
				: { duration: 0.42, times: [0, 0.5, 1], ease: EASE_OUT }
	);
</script>

<!-- Gooey: the edge facing the panel snaps flat (panel attached) then rounds
back once the panel pulls away — the two pinch apart. -->
<motion.button
	type="button"
	id={ctx.triggerId}
	disabled={ctx.disabled}
	aria-haspopup="listbox"
	aria-expanded={ctx.open}
	aria-controls={ctx.listId}
	onclick={() => ctx.setOpen(!ctx.open)}
	initial={false}
	animate={{
		borderTopLeftRadius: isTop ? kf : 12,
		borderTopRightRadius: isTop ? kf : 12,
		borderBottomLeftRadius: isTop ? 12 : kf,
		borderBottomRightRadius: isTop ? 12 : kf
	}}
	transition={{
		borderTopLeftRadius: isTop ? kfT : INSTANT_TRANSITION,
		borderTopRightRadius: isTop ? kfT : INSTANT_TRANSITION,
		borderBottomLeftRadius: isTop ? INSTANT_TRANSITION : kfT,
		borderBottomRightRadius: isTop ? INSTANT_TRANSITION : kfT
	}}
	data-slot="select-trigger"
	class={className}
>
	{@render children()}
	<motion.span
		aria-hidden="true"
		animate={{ rotate: ctx.open ? 180 : 0 }}
		transition={ctx.reduce ? { duration: 0 } : CHEVRON_TRANSITION}
		data-slot="select-trigger-chevron"
	>
		<ChevronDown aria-hidden="true" size={16} />
	</motion.span>
</motion.button>
