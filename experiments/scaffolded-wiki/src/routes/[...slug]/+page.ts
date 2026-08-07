import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { hasModule, loadMdModule } from '$lib/wiki/modules';

/**
 * Resolve a URL path like `/repo/file-system-operations` or `/repo` (a
 * section landing) to its markdown module: a regular doc is `<path>.md`, a
 * folder landing is `<path>/INDEX.md`. The component is handed to the page
 * through load data (same pattern as sites/fractalmandala).
 */	export const load: PageLoad = async ({ params, data }) => {
	// Catch-all params arrive as one string: "repo/file-operations".
	const segs = (params.slug ?? '').split('/').filter(Boolean);
	const base = segs.join('/');
	// Auto-generated section landing (folder without INDEX.md) — the server
	// load provides `landing`, so no markdown module is needed.
	if (data.landing) return { ...data, mod: undefined };
	const rel = hasModule(`${base}.md`) ? `${base}.md` : hasModule(`${base}/INDEX.md`) ? `${base}/INDEX.md` : undefined;
	if (!rel) throw error(404, `No wiki page at /${base}`);
	const mod = await loadMdModule(rel);
	if (!mod) throw error(404, `No wiki page at /${base}`);
	// Spread the server-load data (see +page.ts in the root route).
	return { ...data, mod: mod.default };
};
