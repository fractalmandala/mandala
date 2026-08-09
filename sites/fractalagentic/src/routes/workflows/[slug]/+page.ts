import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getWorkflow, listWorkflows } from '$lib/content/catalog';
import { renderMarkdownWithToc } from '$lib/content/parse';

export const prerender = true;

export function entries() {
	return listWorkflows().map(({ slug }) => ({ slug }));
}

export const load: PageLoad = async ({ params }) => {
	const entry = getWorkflow(params.slug);
	if (!entry) throw error(404, 'Workflow not found');
	return { entry, ...(await renderMarkdownWithToc(entry.body, `workflows/${entry.slug}`)) };
};
