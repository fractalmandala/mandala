<script lang="ts">
	import { motion, useReducedMotion } from '@humanspeak/svelte-motion';
	import { SPRING_PRESS } from '$lib/ui/lib/ease.js';
	import { useHoverCapable } from '$lib/ui/lib/use-hover-capable.svelte.js';
	import type { ButtonLinkProps } from './button.types.js';
	import './button.sass';

	let {
		variant = 'primary',
		size = 'md',
		pressScale = 0.93,
		class: className,
		children,
		whileHover = null,
		whileTap = null,
		transition = SPRING_PRESS,
		style,
		...rest
	}: ButtonLinkProps = $props();

	const reduce = useReducedMotion();
	const hoverCapable = useHoverCapable();
</script>

<motion.a
	{...rest}
	style={style ?? undefined}
	whileHover={whileHover !== null ? whileHover : !$reduce && hoverCapable.current ? { scale: 1.02 } : undefined}
	whileTap={whileTap !== null ? whileTap : !$reduce ? { scale: pressScale } : undefined}
	transition={transition}
	data-slot="button"
	data-variant={variant}
	data-size={size}
	class={className}
>
	<span data-slot="button-content">{@render children?.()}</span>
</motion.a>
