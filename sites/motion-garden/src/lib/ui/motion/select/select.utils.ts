import { EASE_OUT } from '$lib/ui/lib/ease.js';
import type { Variants } from '@humanspeak/svelte-motion';

export const INSTANT_TRANSITION = { duration: 0 } as const;

// Spring with bounce powers the unfold/separation; per-property timings in the
// content choreograph it (see SelectContent). Mirrors bouncy-accordion's feel.
export const CHEVRON_TRANSITION = { type: 'spring', duration: 0.4, bounce: 0.3 } as const;

export const LIST_VARIANTS: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } }
};

export const ITEM_VARIANTS: Variants = {
	hidden: { opacity: 0, y: -6, filter: 'blur(3px)' },
	show: { opacity: 1, y: 0, filter: 'blur(0px)' }
};
