/**
 * Load Pagefind from /pagefind (static, post-build).
 * Kept outside .svelte so Svelte's compiler does not strip `@vite-ignore`
 * from the dynamic import.
 */
export async function loadPagefindModule(origin: string): Promise<{
	init: () => Promise<void>;
	search: (q: string) => Promise<{ results: Array<{ data: () => Promise<unknown> }> }>;
}> {
	const url = `${origin}/pagefind/pagefind.js`;
	// Runtime absolute URL — not a bundler dependency graph entry
	return import(/* @vite-ignore */ url);
}
