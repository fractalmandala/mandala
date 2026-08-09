import { formatDate, listDocs, titleOf } from '$lib/server/markdown';

export const load = () => {
	const docs = listDocs('posts').map((doc) => ({
		slug: doc.slug,
		title: titleOf(doc),
		date: formatDate(doc.meta.date),
		description: doc.meta.description as string | undefined,
		tags: Array.isArray(doc.meta.tags) ? (doc.meta.tags as string[]) : undefined
	}));
	return { kind: 'collection', collection: 'posts', label: 'Posts', docs };
};
