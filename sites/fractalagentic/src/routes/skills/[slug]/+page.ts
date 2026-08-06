import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getSkill, listSkills } from '$lib/content/catalog';
import { renderMarkdownWithToc } from '$lib/content/parse';

export const prerender = true;

export function entries() {
	return listSkills().map(({ slug }) => ({ slug }));
}

export const load: PageLoad = async ({ params }) => {
	const entry = getSkill(params.slug);
	if (!entry) throw error(404, 'Skill not found');
	return { entry, ...(await renderMarkdownWithToc(entry.body, `skills/${entry.slug}`)) };
};
