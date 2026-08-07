import type { PageLoad } from './$types';
import { loadMdModule } from '$lib/wiki/modules';

export const load: PageLoad = async ({ data }) => {
	const mod = await loadMdModule('INDEX.md');
	// Spread the server-load data: with both +page.ts and +page.server.ts, the
	// universal load's return value is what reaches the component.
	return { ...data, mod: mod?.default, indexMeta: mod?.metadata };
};
