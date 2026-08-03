export function useHoverCapable() {
	let isHoverCapable = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
		isHoverCapable = mql.matches;
		const handler = (e: MediaQueryListEvent) => { isHoverCapable = e.matches; };
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});

	return { get current() { return isHoverCapable; } };
}
