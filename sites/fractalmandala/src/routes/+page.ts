import type { PageLoad } from './$types'
import { allBanks } from '$lib/utils/bank-configs'

const writingsConns = import.meta.glob<{
	topicMap: { title: string; slug: string; description: string }[]
}>('/src/content/Writings/CONNECTIONS.ts')

export const load: PageLoad = async () => {
	const posts = allBanks

	let writingsCategories: { title: string; slug: string; description: string }[] = []
	const connLoader = writingsConns['/src/content/Writings/CONNECTIONS.ts']
	if (connLoader) {
		const connModule = await connLoader()
		writingsCategories = connModule.topicMap || []
	}

	return {
		posts,
		writingsCategories
	};
};
