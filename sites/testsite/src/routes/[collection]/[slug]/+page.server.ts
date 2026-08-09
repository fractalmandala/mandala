import { error } from '@sveltejs/kit';
import {
	extractHeadings,
	formatDate,
	getDoc,
	listDocs,
	renderMarkdown,
	titleOf,
	type Collection
} from '$lib/server/markdown';

export const load = async ({ params }) => {
	const { collection, slug } = params as { collection: Collection; slug: string };

	if (collection !== 'posts' && collection !== 'sveltemotion') {
		error(404, `Unknown collection "${collection}"`);
	}

	const doc = getDoc(collection, slug);
	if (!doc) error(404, `No doc at /${collection}/${slug}`);

	const [html, siblings] = await Promise.all([renderMarkdown(doc.body), listDocs(collection)]);
	const idx = siblings.findIndex((d) => d.slug === slug);

	return {
		kind: 'doc',
		collection,
		slug: doc.slug,
		title: titleOf(doc),
		meta: { ...doc.meta, date: formatDate(doc.meta.date) },
		html,
		toc: extractHeadings(html),
		hasComponents: doc.hasComponents,
		prev:
			idx > 0
				? { slug: siblings[idx - 1].slug, title: titleOf(siblings[idx - 1]) }
				: null,
		next:
			idx < siblings.length - 1
				? { slug: siblings[idx + 1].slug, title: titleOf(siblings[idx + 1]) }
				: null
	};
};
