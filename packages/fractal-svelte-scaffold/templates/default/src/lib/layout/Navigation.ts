// Navigation.ts — view-logic split (pattern from admin/gui).
// Svelte 5 runes live in the .svelte file; this module owns the pure logic.

export interface NavItem {
	href: string;
	label: string;
}

export const DEFAULT_NAV: readonly NavItem[] = [
	{ href: '/', label: 'Home' },
	{ href: '/about', label: 'About' }
];

export function normalizePath(p: string): string {
	if (p === '/') return p;
	return p.endsWith('/') ? p.slice(0, -1) : p;
}

export function isPathActive(currentPath: string, href: string): boolean {
	return normalizePath(currentPath) === normalizePath(href);
}
