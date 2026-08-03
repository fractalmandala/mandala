import { json } from '@sveltejs/kit';
import { getAllPosts } from '$lib/utils/postlists';

export const GET = async () => {
	const allPosts = await getAllPosts();
	return json(allPosts);
};
