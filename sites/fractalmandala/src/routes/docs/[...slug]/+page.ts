import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { docs } from '$lib/docs/source';

export const entries: EntryGenerator = () =>
	docs.documents.map((document) => ({ slug: document.slug }));

export const load: PageLoad = ({ params }) => {
	const slug = params.slug ?? '';

	if (!docs.get(slug)) {
		error(404, `Documentation page "${slug || 'index'}" not found`);
	}

	return { slug };
};
