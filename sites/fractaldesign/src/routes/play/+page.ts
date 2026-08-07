import type { PageLoad } from './$types';
import { allPages } from '$lib/utils/localpulls'

export const load: PageLoad = async () => {
	const pages = allPages;
	return {
		pages
	};
};
