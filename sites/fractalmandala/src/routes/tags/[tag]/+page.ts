import type { PageLoad } from './$types';
import type { Component } from 'svelte';

const modules = import.meta.glob<{ default: Component; metadata: { title?: string, tags?: string[] } }>(
	'/src/content/*/wiki/*.md'
);

const bankSlugMap: Record<string, string> = {
	'Archaeology': 'archaeology',
	'Civilization': 'civilization',
	'Comparative Civilization': 'comparative-civilization',
	'History': 'history',
	'Karmic Streams': 'karmic-streams',
	'Shri Ram Swarup and Shri Sita Ram Goel': 'srg-srs',
	'Sri Aurobindo': 'sri-aurobindo',
	'Sveltekit': 'sveltekit',
	'Writings': 'writings'
};

export const load: PageLoad = async ({ params }) => {
	const currentTag = params.tag.toLowerCase();
	const matchedItems: Array<{ title: string; linkpath: string; bank: string }> = [];

	for (const [path, loader] of Object.entries(modules)) {
		const parts = path.split('/');
		const bankFolder = parts[3];
		const fileName = parts[5];
		const slug = fileName.slice(0, -3);

		const mod = await loader();
		const tags = mod.metadata?.tags || [];
		const hasTag = tags.some((t) => typeof t === 'string' && t.toLowerCase() === currentTag);

		if (hasTag) {
			const routeSlug = bankSlugMap[bankFolder] || bankFolder.toLowerCase();
			matchedItems.push({
				title: mod.metadata?.title ?? slug,
				linkpath: `/${routeSlug}/${slug}`,
				bank: bankFolder
			});
		}
	}

	return {
		tag: params.tag,
		items: matchedItems
	};
};
