<script lang="ts">
	import './button.sass';
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { SPRING_PRESS } from '$lib/ease.js';
	import { useHoverCapable } from '$lib/motion/use-hover-capable.svelte.js';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	type Ripple = { id: number; x: number; y: number; size: number };
	type Props = HTMLButtonAttributes & {
		variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
		size?: 'sm' | 'md' | 'lg' | 'icon';
		pressScale?: number;
		ripple?: boolean;
		children?: Snippet;
	};

	let { variant = 'primary', size = 'md', pressScale = 0.93, ripple = false, children, onpointerdown, type = 'button', disabled = false, ...rest }: Props = $props();
	const reduce = useReducedMotion();
	const hoverCapable = useHoverCapable();
	let ripples = $state<Ripple[]>([]);
	let nextId = 0;

	function handlePointerDown(event: PointerEvent) {
		if (ripple && !$reduce && !disabled) {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
			const item = { id: nextId++, x: event.clientX - rect.left, y: event.clientY - rect.top, size: Math.max(rect.width, rect.height) * 2 };
			ripples = [...ripples, item];
			setTimeout(() => ripples = ripples.filter((entry) => entry.id !== item.id), 1600);
		}
		onpointerdown?.(event as PointerEvent & { currentTarget: EventTarget & HTMLButtonElement });
	}
</script>

<motion.button {...rest} {type} {disabled} onpointerdown={handlePointerDown} whileTap={!$reduce && !disabled ? { scale: pressScale } : undefined} whileHover={!$reduce && hoverCapable.current && !disabled ? { scale: 1.02 } : undefined} transition={!$reduce ? SPRING_PRESS : { duration: 0 }} data-slot="button" data-variant={variant} data-size={size} data-ripple={ripple}>
	{#if ripple && !$reduce}
		<span data-slot="button-ripples" aria-hidden="true">
			{#each ripples as item (item.id)}
				<span data-slot="button-ripple" style={`--ripple-x:${item.x}px;--ripple-y:${item.y}px;--ripple-size:${item.size}px`}></span>
			{/each}
		</span>
	{/if}
	<span data-slot="button-content">{@render children?.()}</span>
</motion.button>
