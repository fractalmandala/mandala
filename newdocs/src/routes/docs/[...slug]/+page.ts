import { error } from '@sveltejs/kit';
import { getDoc } from '$lib/docs/content-page';
import type { PageLoad } from './$types';

/**
 * Universal load: lazy mdsvex page modules only (no eager vault).
 * Spreads server `data` (prev/next) so PageData types merge correctly.
 */
export const load: PageLoad = async ({ params, data }) => {
	const slug = params.slug ?? '';
	const doc = await getDoc(slug);

	if (!doc) error(404, `Post "${slug}" not found`);

	const title =
		(typeof doc.meta.title === 'string' && doc.meta.title) || slug || 'Documentation';
	const description =
		(typeof doc.meta.description === 'string' && doc.meta.description) || '';
	const tags = Array.isArray(doc.meta.tags) ? (doc.meta.tags as string[]) : [];

	return {
		...data,
		doc,
		title,
		description,
		tags,
		sourcePath: doc.sourcePath
	};
};
