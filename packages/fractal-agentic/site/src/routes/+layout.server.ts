import { getArmoryStats, getSearchIndex, getSidebarNav } from '$lib/content';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	return {
		stats: getArmoryStats(),
		sidebar: getSidebarNav(),
		search: getSearchIndex()
	};
};
