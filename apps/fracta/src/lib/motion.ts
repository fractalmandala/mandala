// Fracta's Svelte Motion contract. These are the only timing, travel, and
// scale values available to interactive surfaces.
export const motionTokens = {
	duration: { instant: 80, fast: 180, normal: 280, onboarding: 560 },
	easing: {
		smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
		sharp: [0.4, 0, 0.2, 1] as [number, number, number, number]
	},
	distance: { xs: 4, sm: 8, md: 16, lg: 24 },
	scale: { hover: 0.98, press: 0.96 }
} as const;

type MotionOptions = { essential?: boolean };
type RevealOptions = MotionOptions & {
	axis?: 'x' | 'y';
	direction?: 1 | -1;
	distance?: keyof typeof motionTokens.distance;
	duration?: keyof typeof motionTokens.duration;
};

function lowCapabilityDevice() {
	if (typeof navigator === 'undefined') return false;
	const device = navigator as Navigator & { deviceMemory?: number };
	return (device.deviceMemory !== undefined && device.deviceMemory <= 2)
		|| (device.deviceMemory === undefined && (device.hardwareConcurrency ?? 8) <= 4);
}

export function prefersReducedMotion() {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function shouldAnimate({ essential = false }: MotionOptions = {}) {
	return !prefersReducedMotion() && (essential || !lowCapabilityDevice());
}

export function revealMotion(animate: boolean, options: RevealOptions = {}) {
	const axis = options.axis ?? 'y';
	const direction = options.direction ?? 1;
	const distance = animate ? motionTokens.distance[options.distance ?? 'sm'] * direction : 0;
	const duration = animate ? motionTokens.duration[options.duration ?? 'normal'] : motionTokens.duration.instant;
	const easing = options.duration === 'instant' ? motionTokens.easing.sharp : motionTokens.easing.smooth;
	const offset = axis === 'x' ? { x: distance } : { y: distance };
	const reset = axis === 'x' ? { x: 0 } : { y: 0 };
	return {
		initial: animate ? { opacity: 0, ...offset } : (false as const),
		animate: { opacity: 1, ...reset },
		exit: animate ? { opacity: 0, ...offset } : { opacity: 0 },
		transition: { duration: duration / 1000, ease: easing }
	};
}

export function fadeMotion(animate: boolean, options: MotionOptions = {}) {
	return revealMotion(animate, { ...options, distance: 'xs', duration: 'fast' });
}

// Compatibility bridge for the settings dialog while it retains a native
// `<dialog>` element. All pane, disclosure, and reply motion uses Svelte Motion.
// The bridge is compositor-only and observes the same capability gate.
export function motionReveal(_node: Element, options: RevealOptions = {}) {
	const animate = shouldAnimate({ essential: options.essential });
	const axis = options.axis ?? 'y';
	const direction = options.direction ?? 1;
	const distance = animate ? motionTokens.distance[options.distance ?? 'sm'] * direction : 0;
	const duration = animate ? motionTokens.duration[options.duration ?? 'normal'] : motionTokens.duration.instant;
	const translate = axis === 'x' ? `translateX(${distance}px)` : `translateY(${distance}px)`;
	return { duration, css: (t: number) => `opacity: ${t}; transform: ${t === 1 ? 'none' : translate};` };
}

export function motionFade(node: Element) {
	return motionReveal(node, { distance: 'xs', duration: 'fast' });
}
