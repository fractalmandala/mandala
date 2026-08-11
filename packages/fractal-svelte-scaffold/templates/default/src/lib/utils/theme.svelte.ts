// theme.svelte.ts — runes-based theme store.
// Adapted from admin/gui/utils/theme.ts, rewritten with Svelte 5 runes
// (no svelte/store import). SSR-safe; mirrors the no-FOUC script in app.html.

import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function resolveInitial(): Theme {
	if (!browser) return 'light';
	const stored = localStorage.getItem('theme');
	if (stored === 'light' || stored === 'dark') return stored;
	if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
	return 'light';
}

let current = $state<Theme>(resolveInitial());

function apply(theme: Theme): void {
	if (!browser) return;
	document.documentElement.setAttribute('data-theme', theme);
}

function persist(theme: Theme): void {
	if (!browser) return;
	try {
		localStorage.setItem('theme', theme);
	} catch {
		// localStorage may be unavailable (private mode); ignore.
	}
}

if (browser) {
	$effect(() => apply(current));

	// React to system preference changes only when the user hasn't set one.
	window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		if (!localStorage.getItem('theme')) {
			current = e.matches ? 'dark' : 'light';
		}
	});
}

export const theme = {
	get value(): Theme {
		return current;
	},
	set(next: Theme) {
		current = next;
		persist(next);
	},
	toggle() {
		current = current === 'dark' ? 'light' : 'dark';
		persist(current);
	}
};
