import { listCommands, toSummaries } from '$lib/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		items: toSummaries(listCommands())
	};
};
