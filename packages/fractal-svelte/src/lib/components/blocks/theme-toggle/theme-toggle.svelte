<script lang="ts" module>
	export type ThemeVariant = 'rectangle' | 'circle' | 'circle-blur' | 'blinds';
	export type ThemeStart = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-up';
</script>

<script lang="ts">
	import './theme-toggle.sass';
	let { theme = $bindable<'light' | 'dark'>('light'), variant = 'rectangle', start = 'bottom-up', ontoggle }:
		{ theme?: 'light' | 'dark'; variant?: ThemeVariant; start?: ThemeStart; ontoggle?: (theme: 'light' | 'dark') => void } = $props();

	const rectFrom: Record<ThemeStart, string> = {
		'top-left': 'inset(0 100% 100% 0)', 'top-right': 'inset(0 0 100% 100%)',
		'bottom-left': 'inset(100% 100% 0 0)', 'bottom-right': 'inset(100% 0 0 100%)',
		center: 'inset(50% 50% 50% 50%)', 'bottom-up': 'inset(100% 0 0 0)'
	};
	const origins: Record<ThemeStart, string> = {
		'top-left': '0% 0%', 'top-right': '100% 0%', 'bottom-left': '0% 100%',
		'bottom-right': '100% 100%', center: '50% 50%', 'bottom-up': '50% 100%'
	};

	function apply(next: 'light' | 'dark') {
		theme = next;
		if (typeof document !== 'undefined') document.documentElement.dataset.theme = next;
		ontoggle?.(next);
	}

	function toggle() {
		const next = theme === 'dark' ? 'light' : 'dark';
		if (typeof document === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches || !('startViewTransition' in document)) {
			apply(next);
			return;
		}
		const root = document.documentElement;
		root.dataset.themeTransition = variant;
		root.style.setProperty('--theme-transition-from', rectFrom[start]);
		root.style.setProperty('--theme-transition-origin', origins[start]);
		const transition = (document as Document & { startViewTransition(callback: () => void): { finished: Promise<void> } }).startViewTransition(() => apply(next));
		transition.finished.finally(() => {
			delete root.dataset.themeTransition;
			root.style.removeProperty('--theme-transition-from');
			root.style.removeProperty('--theme-transition-origin');
		});
	}
</script>

<button type="button" data-slot="theme-toggle" data-variant={variant} onclick={toggle} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
	<span data-slot="theme-toggle-icon" aria-hidden="true">
		{#if theme === 'dark'}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></svg>
		{:else}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
		{/if}
	</span>
</button>
