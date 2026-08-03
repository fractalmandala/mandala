import { error } from '@sveltejs/kit';
import { getDoc, getPrevNext, listDocsInSequence, renderMarkdown } from '$lib/content';
import type { EntryGenerator, PageServerLoad } from './$types';

function slugKey(slug: string | string[]): string {
	return Array.isArray(slug) ? slug.filter(Boolean).join('/') : slug;
}

export const entries: EntryGenerator = () => {
	return listDocsInSequence().map((s) => ({ slug: s.slug }));
};

export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
	const key = slugKey(params.slug);
	const entry = getDoc(key);
	if (!entry) error(404, `Doc not found: ${key}`);

	return {
		entry: {
			kind: entry.kind,
			slug: entry.slug,
			title: entry.title,
			description: entry.description,
			href: entry.href
		},
		html: await renderMarkdown(entry.body, entry.slug),
		pager: getPrevNext('doc', key)
	};
};
