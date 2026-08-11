/**
 * Returns true only on devices that have a true hover (mouse / trackpad).
 * Touch devices fire phantom :hover on tap that sticks until tap-elsewhere
 * — gate hover-only effects (scale lifts, magnetic pulls) behind this.
 * Exposed as `{ get current() }` so components read `hoverCapable.current`.
 */
export function useHoverCapable() {
	let isHoverCapable = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
		isHoverCapable = mql.matches;
		const handler = (e: MediaQueryListEvent) => {
			isHoverCapable = e.matches;
		};
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});

	return { get current() { return isHoverCapable; } };
}
