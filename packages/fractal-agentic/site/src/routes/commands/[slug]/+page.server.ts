import { error } from '@sveltejs/kit';
import { getCommand, getCredit, getPrevNext, listCommands, renderMarkdown } from '$lib/content';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => {
	return listCommands().map((s) => ({ slug: s.slug }));
};

export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
	const entry = getCommand(params.slug);
	if (!entry) error(404, `Command not found: ${params.slug}`);

	return {
		entry: {
			kind: entry.kind,
			slug: entry.slug,
			title: entry.title,
			description: entry.description,
			href: entry.href
		},
		credit: getCredit('command', params.slug),
		html: await renderMarkdown(entry.body),
		pager: getPrevNext('command', params.slug)
	};
};
