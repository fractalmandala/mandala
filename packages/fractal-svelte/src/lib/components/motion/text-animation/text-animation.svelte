<script lang="ts">
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import './text-animation.sass';
	import type { Snippet } from 'svelte';
	type Props = { text?: string | string[]; variant?: 'reveal' | 'shimmer' | 'cascade' | 'typewriter'; split?: 'word' | 'char'; stagger?: number; delay?: number; duration?: number; blur?: number; yOffset?: string | number; children?: Snippet };
	let { text = '', variant = 'shimmer', split = 'word', stagger = 0.09, delay = 0, duration = 2.5, blur = 12, yOffset = '40%', children }: Props = $props();
	const reduce = useReducedMotion();
	let lines = $derived(Array.isArray(text) ? text : [text]);
	let displayed = $state('');
	$effect(() => { if (variant !== 'typewriter') return; const full = lines.join(' '); if ($reduce) { displayed = full; return; } displayed = ''; let index = 0; const timer = setInterval(() => { displayed = full.slice(0, ++index); if (index >= full.length) clearInterval(timer); }, Math.max(1, delay || 50)); return () => clearInterval(timer); });
</script>

<span data-slot="text-animation" data-variant={variant} style={`--ta-duration:${duration}s`}>
	{#if variant === 'reveal'}
		{#each lines as line}
			<span data-slot="text-line">{#each (split === 'word' ? line.split(' ') : Array.from(line)) as unit, index}<motion.span data-slot="text-unit" initial={$reduce ? { opacity: 0 } : { opacity: 0, y: yOffset, filter: `blur(${blur}px)` }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={$reduce ? { duration: 0 } : { type: 'spring', stiffness: 140, damping: 26, mass: 1.2, delay: delay + index * stagger }}>{unit}{split === 'word' && index < line.split(' ').length - 1 ? '\u00a0' : ''}</motion.span>{/each}</span>
		{/each}
	{:else if variant === 'typewriter'}<span data-slot="typewriter-text">{displayed}<span data-slot="typewriter-cursor" aria-hidden="true">|</span></span>
	{:else if variant === 'cascade'}<span data-slot="cascade-text" aria-label={lines.join(' ')}>{#each Array.from(lines.join(' ')) as char, index}<span style={`--cascade-delay:${index * 0.025}s`} aria-hidden="true">{char}</span>{/each}</span>
	{:else}<span data-slot="shimmer-text">{@render children?.()}{lines.join(' ')}</span>{/if}
</span>
