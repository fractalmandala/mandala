<script lang="ts">
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { SPRING_PRESS } from '$lib/ui/lib/ease.js';
	import { useHoverCapable } from '$lib/ui/lib/use-hover-capable.svelte.js';
	import type { ButtonProps, Ripple } from './button.types.js';
	import './button.sass';

	let {
		variant = 'primary',
		size = 'md',
		pressScale = 0.93,
		ripple = false,
		class: className,
		children,
		onpointerdown,
		whileHover = null,
		whileTap = null,
		transition = SPRING_PRESS,
		style,
		type = 'button',
		disabled = false,
		...rest
	}: ButtonProps = $props();

	const reduce = useReducedMotion();
	const hoverCapable = useHoverCapable();
	let ripples = $state<Ripple[]>([]);
	let nextId = 0;

	// Svelte event props widen currentTarget; the handler prop expects it typed
	// to the button, so derive the parameter type from the prop.
	type ButtonPointerEvent = Parameters<NonNullable<typeof onpointerdown>>[0];
	function handlePointerDown(event: ButtonPointerEvent) {
		if (ripple && !$reduce && !disabled) {
			const rect = event.currentTarget.getBoundingClientRect();
			const item = {
				id: nextId++,
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
				size: Math.max(rect.width, rect.height) * 2
			};
			ripples = [...ripples, item];
			// Ripple animation runs 1.6s (see button.sass) — drop it once done.
			setTimeout(() => {
				ripples = ripples.filter((entry) => entry.id !== item.id);
			}, 1600);
		}
		onpointerdown?.(event);
	}
</script>

<motion.button
	{...rest}
	style={style ?? undefined}
	{type}
	{disabled}
	onpointerdown={handlePointerDown}
	whileHover={whileHover !== null ? whileHover : !$reduce && hoverCapable.current && !disabled ? { scale: 1.02 } : undefined}
	whileTap={whileTap !== null ? whileTap : !$reduce && !disabled ? { scale: pressScale } : undefined}
	transition={transition}
	data-slot="button"
	data-variant={variant}
	data-size={size}
	class={className}
>
	{#if ripple && !$reduce}
		<span data-slot="button-ripples" aria-hidden="true">
			{#each ripples as item (item.id)}
				<span
					data-slot="button-ripple"
					style={`--ripple-x:${item.x}px;--ripple-y:${item.y}px;--ripple-size:${item.size}px`}
				></span>
			{/each}
		</span>
	{/if}
	<span data-slot="button-content">{@render children?.()}</span>
</motion.button>
