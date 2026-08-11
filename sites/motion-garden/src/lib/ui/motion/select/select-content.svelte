<script lang="ts">
	import { untrack } from 'svelte';
	import { motion } from '@humanspeak/svelte-motion';
	import { EASE_OUT } from '$lib/ui/lib/ease.js';
	import { INSTANT_TRANSITION, LIST_VARIANTS } from './select.utils.js';
	import { useSelectContext } from './select.context.js';
	import type { SelectContentProps } from './select.types.js';
	import './select.sass';

	let { class: className, children }: SelectContentProps = $props();

	const ctx = useSelectContext('SelectContent');
	let innerEl = $state<HTMLDivElement | null>(null);
	let height = $state(0);

	$effect(() => {
		const node = untrack(() => innerEl);
		if (!node) return;
		const measure = () => {
			height = node.offsetHeight;
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(node);
		return () => observer.disconnect();
	});

	// On open, flip upward when there isn't room below and there's more above.
	$effect(() => {
		if (!ctx.open) return;
		const trigger = document.getElementById(ctx.triggerId);
		const node = untrack(() => innerEl);
		if (!trigger || !node) return;
		const rect = trigger.getBoundingClientRect();
		const h = node.offsetHeight;
		const below = window.innerHeight - rect.bottom;
		const above = rect.top;
		ctx.setPlacement(below < h + 16 && above > below ? 'top' : 'bottom');
	});

	// Specify EVERY corner + both margins each render. The near edge (facing the
	// trigger) animates flat->round and the gap opens on that side; the far edge
	// stays rounded and its margin pinned to 0. Setting all of them avoids a
	// stranded square corner when the placement flips between opens.
	const isTop = $derived(ctx.placement === 'top');
	const nearGap = $derived(ctx.open ? 8 : 0);
	const nearRadius = $derived(ctx.open ? 12 : 0);

	const gapT = $derived(
		ctx.open
			? { type: 'spring', duration: 0.6, bounce: 0.5, delay: 0.12 }
			: { type: 'spring', duration: 0.3, bounce: 0.1 }
	);
	const radiusT = $derived(
		ctx.open
			? { duration: 0.3, ease: EASE_OUT, delay: 0.14 }
			: { duration: 0.16, ease: EASE_OUT }
	);

	const animate = $derived(
		ctx.reduce
			? { opacity: ctx.open ? 1 : 0, height: ctx.open ? height : 0 }
			: {
					opacity: ctx.open ? 1 : 0,
					height: ctx.open ? height : 0,
					// gap opens on the side facing the trigger
					marginTop: isTop ? 0 : nearGap,
					marginBottom: isTop ? nearGap : 0,
					// near corners go flat->round; far corners stay rounded
					borderTopLeftRadius: isTop ? 12 : nearRadius,
					borderTopRightRadius: isTop ? 12 : nearRadius,
					borderBottomLeftRadius: isTop ? nearRadius : 12,
					borderBottomRightRadius: isTop ? nearRadius : 12
				}
	);

	const transition = $derived(
		ctx.reduce
			? { duration: 0.12 }
			: {
					opacity: ctx.open
						? { duration: 0.18 }
						: { duration: 0.16, delay: 0.12 },
					height: ctx.open
						? { type: 'spring', duration: 0.42, bounce: 0.14 }
						: { duration: 0.26, ease: EASE_OUT, delay: 0.14 },
					marginTop: isTop ? INSTANT_TRANSITION : gapT,
					marginBottom: isTop ? gapT : INSTANT_TRANSITION,
					borderTopLeftRadius: isTop ? INSTANT_TRANSITION : radiusT,
					borderTopRightRadius: isTop ? INSTANT_TRANSITION : radiusT,
					borderBottomLeftRadius: isTop ? radiusT : INSTANT_TRANSITION,
					borderBottomRightRadius: isTop ? radiusT : INSTANT_TRANSITION
				}
	);
</script>

<!-- Items stay mounted (open just animates the panel) so each item's label
registration persists — otherwise the trigger would fall back to the
placeholder the moment the panel closes. -->
<motion.div
	id={ctx.listId}
	role="listbox"
	aria-labelledby={ctx.triggerId}
	aria-hidden={!ctx.open}
	inert={!ctx.open}
	initial={false}
	animate={animate}
	transition={transition}
	style={`transform-origin:${isTop ? 'bottom' : 'top'};overflow:hidden;pointer-events:${ctx.open ? 'auto' : 'none'}`}
	data-slot="select-content"
	data-placement={isTop ? 'top' : 'bottom'}
	class={className}
>
	<motion.div
		bind:ref={innerEl}
		variants={ctx.reduce ? undefined : LIST_VARIANTS}
		initial={false}
		animate={ctx.open ? 'show' : 'hidden'}
		data-slot="select-content-list"
	>
		{@render children()}
	</motion.div>
</motion.div>
