import type { PageLoad } from './$types';
import { listPosts } from '$lib/utils/postlists';

export const load: PageLoad = async () => {
	const posts = await listPosts('Writings', 'raw', 'writings/blog');
	return {
		posts,
		title: 'Writings Blog'
	};
};
