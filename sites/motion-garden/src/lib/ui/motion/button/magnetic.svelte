<script lang="ts">
	import { motion, useMotionValue, useReducedMotion, useSpring } from '@humanspeak/svelte-motion';
	import { SPRING_MOUSE } from '$lib/ui/lib/ease.js';
	import { useHoverCapable } from '$lib/ui/lib/use-hover-capable.svelte.js';
	import type { MagneticProps } from './button.types.js';
	import './magnetic.sass';

	let { children, strength = 0.35, class: className }: MagneticProps = $props();

	const reduce = useReducedMotion();
	const hoverCapable = useHoverCapable();
	// Decorative cursor-follow: skip on touch (phantom hover) and reduced motion.
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const sx = useSpring(x, SPRING_MOUSE);
	const sy = useSpring(y, SPRING_MOUSE);
	let ref = $state<HTMLDivElement | null>(null);

	function onMove(event: MouseEvent) {
		const el = ref;
		if (!el || $reduce || !hoverCapable.current) return;
		const rect = el.getBoundingClientRect();
		x.set((event.clientX - rect.left - rect.width / 2) * strength);
		y.set((event.clientY - rect.top - rect.height / 2) * strength);
	}

	function onLeave() {
		x.set(0);
		y.set(0);
	}
</script>

<motion.div
	bind:ref={ref}
	onmousemove={onMove}
	onmouseleave={onLeave}
	style={{ x: sx, y: sy }}
	data-slot="magnetic"
	class={className}
>
	{@render children?.()}
</motion.div>
