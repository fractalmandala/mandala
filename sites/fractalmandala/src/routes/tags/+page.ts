import type { PageLoad } from './$types';
import { allTags } from '$lib/utils/TAGINDEX';

export const load: PageLoad = async () => {
	return {
		tags: allTags.map((t) => t.tag)
	};
};
