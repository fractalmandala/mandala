<script lang="ts">
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { EASE_OUT, SPRING_SWAP } from '$lib/ui/lib/ease.js';
	import type { Snippet } from 'svelte';
	import './stateful-button.sass';

	const CASCADE_STAGGER = 0.025;
	const ROLL_BLUR = 'blur(6px)';

	// Per-letter roll: each glyph springs up from below with a stagger delay.
	// `animate`/`exit` are function variants — the per-letter delay arrives as
	// the variant `custom` value, set by the letter spans below.
	const CASCADE_LETTER_VARIANTS = {
		initial: { opacity: 0, y: '105%', filter: ROLL_BLUR },
		animate: (custom: unknown) => ({
			opacity: 1,
			y: '0%',
			filter: 'blur(0px)',
			transition: { ...SPRING_SWAP, delay: typeof custom === 'number' ? custom : 0 }
		}),
		exit: (custom: unknown) => ({
			opacity: 0,
			y: '-105%',
			filter: ROLL_BLUR,
			transition: { duration: 0.16, ease: EASE_OUT, delay: (typeof custom === 'number' ? custom : 0) * 0.5 }
		})
	};

	let {
		value,
		label = null,
		children
	}: {
		value: string;
		label?: string | null;
		children: Snippet;
	} = $props();

	const reduce = useReducedMotion();
	let measureRef: HTMLSpanElement | null = null;
	let width = $state<number | undefined>(undefined);

	// Measure the string with the same per-letter layout as the cascade, so the
	// width animation never clips the final glyph (whole-string kerning).
	$effect(() => {
		const next = measureRef?.offsetWidth;
		if (next && next !== width) width = next;
	});
</script>

<motion.span
	initial={false}
	animate={{ width }}
	transition={$reduce ? { duration: 0 } : SPRING_SWAP}
	data-slot="stateful-text"
>
	<span bind:this={measureRef} aria-hidden="true" data-slot="stateful-text-measure">
		{#if label !== null && !$reduce}
			{#each label.split('') as char, index (index)}
				<span data-slot="stateful-text-letter">{char}</span>
			{/each}
		{:else}
			{@render children()}
		{/if}
	</span>

	{#if label !== null && !$reduce}
		<span class="sr-only">{label}</span>
		<!-- Keyed on value: the key-change sequence exits the old cascade,
		     rewinds to initial, then rolls the new letters in. -->
		<AnimatePresence initial={false}>
			<motion.span
				key={`cascade-${value}`}
				aria-hidden="true"
				initial="initial"
				animate="animate"
				exit={{ opacity: 0, y: '-12%', filter: ROLL_BLUR, transition: { duration: 0.16, ease: EASE_OUT } }}
				data-slot="stateful-cascade"
			>
				{#each label.split('') as char, index (index)}
					<motion.span
						custom={index * CASCADE_STAGGER}
						variants={CASCADE_LETTER_VARIANTS}
						data-slot="stateful-cascade-letter"
					>
						{char}
					</motion.span>
				{/each}
			</motion.span>
		</AnimatePresence>
	{:else}
		<AnimatePresence initial={false}>
			<motion.span
				key={`text-${value}`}
				initial={$reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: ROLL_BLUR }}
				animate={$reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
				exit={$reduce ? { opacity: 0 } : { opacity: 0, y: -14, filter: ROLL_BLUR }}
				transition={$reduce ? { duration: 0.15 } : SPRING_SWAP}
				data-slot="stateful-roll"
			>
				{@render children()}
			</motion.span>
		</AnimatePresence>
	{/if}
</motion.span>
