import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getBossEntry, listBossEntries } from '$lib/content';
import { renderMarkdownWithToc } from '$lib/content/parse';

export const prerender = true;

export function entries() {
	return listBossEntries().map(({ slug }) => ({ slug }));
}

export const load: PageServerLoad = async ({ params }) => {
	const entry = getBossEntry(params.slug);
	if (!entry) throw error(404, 'Boss not found');

	return {
		entry,
		...(await renderMarkdownWithToc(entry.body, `bosses/${entry.slug}`))
	};
};
