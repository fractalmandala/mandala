import { error } from '@sveltejs/kit';
import { getAgent, getCredit, getPrevNext, listAgents, renderMarkdown } from '$lib/content';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => {
	return listAgents().map((s) => ({ slug: s.slug }));
};

export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
	const entry = getAgent(params.slug);
	if (!entry) error(404, `Agent not found: ${params.slug}`);

	return {
		entry: {
			kind: entry.kind,
			slug: entry.slug,
			title: entry.title,
			description: entry.description,
			href: entry.href
		},
		credit: getCredit('agent', params.slug),
		html: await renderMarkdown(entry.body),
		pager: getPrevNext('agent', params.slug)
	};
};
