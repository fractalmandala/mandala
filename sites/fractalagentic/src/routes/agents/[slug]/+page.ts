import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getAgent, listAgents } from '$lib/content/catalog';
import { renderMarkdownWithToc } from '$lib/content/parse';

export const prerender = true;

export function entries() {
	return listAgents().map(({ slug }) => ({ slug }));
}

export const load: PageLoad = async ({ params }) => {
	const entry = getAgent(params.slug);
	if (!entry) throw error(404, 'Agent not found');
	return { entry, ...(await renderMarkdownWithToc(entry.body, `agents/${entry.slug}`)) };
};
