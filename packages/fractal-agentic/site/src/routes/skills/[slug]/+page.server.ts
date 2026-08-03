import { error } from '@sveltejs/kit';
import { getCredit, getPrevNext, getSkill, listSkills, renderMarkdown } from '$lib/content';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => {
	return listSkills().map((s) => ({ slug: s.slug }));
};

export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
	const entry = getSkill(params.slug);
	if (!entry) error(404, `Skill not found: ${params.slug}`);

	return {
		entry: {
			kind: entry.kind,
			slug: entry.slug,
			title: entry.title,
			description: entry.description,
			href: entry.href
		},
		credit: getCredit('skill', params.slug),
		html: await renderMarkdown(entry.body),
		pager: getPrevNext('skill', params.slug)
	};
};
