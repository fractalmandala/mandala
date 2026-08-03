<script lang="ts">
	import { AnimatePresence, motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import './tooltip.sass';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	type Side = 'top' | 'right' | 'bottom' | 'left';
	type Props = HTMLAttributes<HTMLSpanElement> & { content: string | Snippet; side?: Side; position?: Side; delay?: number; children?: Snippet };
	let { content, side = 'top', position, delay = 120, children, ...rest }: Props = $props();
	const reduce = useReducedMotion();
	const id = `tooltip-${Math.random().toString(36).slice(2)}`;
	let anchor: HTMLSpanElement;
	let open = $state(false);
	let top = $state(0);
	let left = $state(0);
	let timer: ReturnType<typeof setTimeout>;
	let resolvedSide = $derived(position ?? side);
	function place() { if (!anchor) return; const r = anchor.getBoundingClientRect(); const gap = 8; top = resolvedSide === 'top' ? r.top - gap : resolvedSide === 'bottom' ? r.bottom + gap : r.top + r.height / 2; left = resolvedSide === 'left' ? r.left - gap : resolvedSide === 'right' ? r.right + gap : r.left + r.width / 2; }
	function show() { clearTimeout(timer); timer = setTimeout(() => { place(); open = true; }, delay); }
	function hide() { clearTimeout(timer); open = false; }
	function keydown(event: KeyboardEvent) { if (event.key === 'Escape') hide(); }
	$effect(() => { if (!open) return; const update = () => place(); window.addEventListener('scroll', update, true); window.addEventListener('resize', update); return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); }; });
</script>

<svelte:window onkeydown={keydown} />
<span {...rest} bind:this={anchor} data-slot="tooltip-trigger" aria-describedby={id} onmouseenter={show} onmouseleave={hide} onfocusin={show} onfocusout={hide}>
	{@render children?.()}
	<AnimatePresence>{#if open}<span data-slot="tooltip-anchor" data-side={resolvedSide} style={`top:${top}px;left:${left}px`}><motion.span id={id} role="tooltip" data-slot="tooltip" data-side={resolvedSide} initial={$reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, filter: 'blur(5px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.94 }} transition={$reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 30, mass: 0.7 }}>{#if typeof content === 'string'}{content}{:else}{@render content()}{/if}</motion.span></span>{/if}</AnimatePresence>
</span>
