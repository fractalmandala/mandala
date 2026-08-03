import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';
import { listPosts } from '$lib/utils/postlists';

const modules = import.meta.glob<{ default: Component; metadata: { title?: string, description?: string, tags?: string[], related?: string[] } }>(
	'/src/content/Civilization/wiki/*.md'
);

export const load: PageLoad = async ({ params }) => {
	const key = `/src/content/Civilization/wiki/${params.post}.md`;
	const loader = modules[key];
	if (!loader) throw error(404, `Post "${params.post}" not found`);
	const mod = await loader();
	const posts = await listPosts('Civilization', 'wiki', 'civilization');
	return {
		content: mod.default,
		title: mod.metadata?.title ?? params.post,
		description: mod.metadata?.description ?? '',
		tags: mod.metadata?.tags ?? [],
		related: mod.metadata?.related ?? [],
		posts
	};
};