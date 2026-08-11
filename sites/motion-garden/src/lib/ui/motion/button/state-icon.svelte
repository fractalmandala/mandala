<script lang="ts">
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import type { Snippet } from 'svelte';
	import { EASE_OUT, SPRING_SWAP } from '$lib/ui/lib/ease.js';

	// Icon width collapses too, so the icon adds/removes its own space smoothly
	// instead of popping the row width in a single frame.
	const ICON_VARIANTS = {
		initial: { opacity: 0, width: 0, scale: 0.7, filter: 'blur(6px)' },
		animate: {
			opacity: 1,
			width: '1.5rem',
			scale: 1,
			filter: 'blur(0px)',
			transition: SPRING_SWAP
		},
		exit: {
			opacity: 0,
			width: 0,
			scale: 0.7,
			filter: 'blur(6px)',
			transition: { duration: 0.16, ease: EASE_OUT }
		}
	};

	let {
		keyId,
		glyph
	}: {
		keyId: string;
		glyph: Snippet;
	} = $props();

	const reduce = useReducedMotion();
</script>

<motion.span
	key={keyId}
	variants={ICON_VARIANTS}
	initial={$reduce ? { opacity: 0 } : 'initial'}
	animate={$reduce ? { opacity: 1 } : 'animate'}
	exit={$reduce ? { opacity: 0 } : 'exit'}
	transition={$reduce ? { duration: 0.15 } : undefined}
	data-slot="stateful-icon"
>
	{@render glyph()}
</motion.span>
