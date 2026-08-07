// Provide browser globals for vitest tests that import Svelte modules
// which reference localStorage at module scope (e.g. app.svelte.ts).
import { vi } from 'vitest';

const store: Record<string, string> = {};
vi.stubGlobal('localStorage', {
	getItem: (key: string) => store[key] ?? null,
	setItem: (key: string, value: string) => { store[key] = value; },
	removeItem: (key: string) => { delete store[key]; },
	clear: () => { Object.keys(store).forEach(k => delete store[k]); },
	length: 0,
	key: (_: number) => null,
});
