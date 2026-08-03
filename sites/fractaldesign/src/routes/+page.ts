import type { PageLoad } from './$types';
import { allPosts, allPages } from '$lib/utils/localpulls'

export const load: PageLoad = async () => {
	const posts = await allPosts();
	const pages = allPages;
	return {
		posts,
		pages
	};
};
