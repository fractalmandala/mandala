import { browser } from '$app/environment';

function storage(): Storage | null {
	if (!browser) return null;
	const value = window.localStorage;
	if (
		typeof value?.getItem !== 'function'
		|| typeof value.setItem !== 'function'
	) {
		return null;
	}
	return value;
}

export function readLocalStorage(key: string): string | null {
	try {
		return storage()?.getItem(key) ?? null;
	} catch {
		return null;
	}
}

export function writeLocalStorage(key: string, value: string): void {
	try {
		storage()?.setItem(key, value);
	} catch {
		// Some test/browser-preview environments expose a partial Storage shim.
	}
}
