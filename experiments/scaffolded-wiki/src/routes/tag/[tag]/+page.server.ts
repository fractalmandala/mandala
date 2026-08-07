import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { wiki, docMetaView } from '$lib/server/wiki';

export const load: PageServerLoad = async ({ params }) => {
	const entry = wiki.tags.find((t) => t.slug === params.tag);
	if (!entry) throw error(404, `No tag “${params.tag}”`);
	return { tag: entry.tag, pages: entry.pages.map(docMetaView) };
};
