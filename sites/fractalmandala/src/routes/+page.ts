import type { PageLoad } from './$types'
import { allBanks } from '$lib/utils/bank-configs'

export const load: PageLoad = async () => {
	const posts = allBanks
	return {
		posts
	};
};
