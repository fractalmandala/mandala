import type { PageLoad } from './$types';
import { listPosts } from '$lib/utils/postlists';
import { allBanks } from '$lib/utils/bank-configs';
import { error } from '@sveltejs/kit';

const connectionModules = import.meta.glob<{
	topicMap: any[];
	crossBanks?: any[];
	crossBank?: any[];
	allTags: any[];
}>('/src/content/*/CONNECTIONS.ts');

export const load: PageLoad = async ({ params, url }) => {
	const slug = url.pathname.split('/').filter(Boolean)[0];
	const bank = allBanks.find((b) => b.slug === slug);
	if (!bank) throw error(404, `Bank for slug "${slug}" not found`);

	const posts = await listPosts(bank.title, 'wiki', bank.slug);

	const connKey = `/src/content/${bank.title}/CONNECTIONS.ts`;
	const connLoader = connectionModules[connKey];
	let topicMap: any[] = [];
	let crossBanks: any[] = [];
	let allTags: any[] = [];

	if (connLoader) {
		const connModule = await connLoader();
		topicMap = connModule.topicMap || [];
		crossBanks = connModule.crossBanks || connModule.crossBank || [];
		allTags = connModule.allTags || [];
	}

	return {
		posts,
		title: bank.title,
		description: bank.description,
		slug: bank.slug,
		topicMap,
		crossBanks,
		allTags
	};
};
