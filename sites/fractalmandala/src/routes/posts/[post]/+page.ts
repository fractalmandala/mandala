import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Component } from 'svelte';

const modules = import.meta.glob<{ default: Component; metadata: { title?: string } }>(
	'/src/content/Writings/raw/*.md'
);

export const load: PageLoad = async ({ params }) => {
	const key = `/src/content/Writings/raw/${params.post}.md`;
	const loader = modules[key];
	if (!loader) throw error(404, `Post "${params.post}" not found`);
	const mod = await loader();
	return {
		content: mod.default,
		title: mod.metadata?.title ?? params.post
	};
};