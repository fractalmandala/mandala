import { getNavigation } from '$lib/docs/navigation';

export const prerender = true;

export function load() {
	// Server-only: serializable nav (no icons, no raw markdown).
	return { navigation: getNavigation() };
}
