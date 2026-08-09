import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

function installLocalStorage(): void {
	const values = new Map<string, string>();
	const storage: Storage = {
		get length() {
			return values.size;
		},
		clear: () => {
			values.clear();
		},
		getItem: (key: string) => values.get(key) ?? null,
		key: (index: number) => Array.from(values.keys())[index] ?? null,
		removeItem: (key: string) => {
			values.delete(key);
		},
		setItem: (key: string, value: string) => {
			values.set(key, value);
		},
	};

	Object.defineProperty(window, 'localStorage', {
		configurable: true,
		value: storage,
	});
}

function installMatchMedia(): void {
	if (typeof window.matchMedia === 'function') return;
	Object.defineProperty(window, 'matchMedia', {
		configurable: true,
		writable: true,
		value: (query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}),
	});
}

installLocalStorage();
installMatchMedia();

beforeEach(() => {
	window.localStorage.clear();
});

afterEach(() => {
	cleanup();
	window.localStorage.clear();
});
