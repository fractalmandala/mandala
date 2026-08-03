export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'fa-theme';

export function isTheme(value: unknown): value is Theme {
	return value === 'light' || value === 'dark';
}

/** Resolve theme from storage, then system preference, defaulting to dark. */
export function resolveTheme(stored: string | null | undefined): Theme {
	if (isTheme(stored)) return stored;
	if (typeof window !== 'undefined' && window.matchMedia) {
		return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
	}
	return 'dark';
}

export function getStoredTheme(): Theme | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const value = localStorage.getItem(THEME_STORAGE_KEY);
		return isTheme(value) ? value : null;
	} catch {
		return null;
	}
}

export function getDocumentTheme(): Theme {
	if (typeof document === 'undefined') return 'dark';
	const attr = document.documentElement.getAttribute('data-theme');
	return isTheme(attr) ? attr : resolveTheme(getStoredTheme());
}

export function applyTheme(theme: Theme): void {
	if (typeof document === 'undefined') return;
	document.documentElement.setAttribute('data-theme', theme);
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// ignore private-mode / blocked storage
	}
}

export function toggleTheme(current: Theme): Theme {
	const next: Theme = current === 'dark' ? 'light' : 'dark';
	applyTheme(next);
	return next;
}
