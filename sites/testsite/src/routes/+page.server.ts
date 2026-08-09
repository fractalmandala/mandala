import { formatDate, listDocs, titleOf, type Collection } from '$lib/server/markdown';

interface HomeDoc {
	slug: string;
	title: string;
	description?: string;
	date?: string;
	tags?: string[];
}

export const load = () => {
	const collections = (
		[
			{ name: 'posts', label: 'Posts' },
			{ name: 'sveltemotion', label: 'SvelteMotion' }
		] as const
	).map(({ name, label }) => {
		const docs: HomeDoc[] = listDocs(name).map((doc) => ({
			slug: doc.slug,
			title: titleOf(doc),
			description: doc.meta.description as string | undefined,
			date: formatDate(doc.meta.date),
			tags: Array.isArray(doc.meta.tags) ? (doc.meta.tags as string[]) : undefined
		}));
		return { name, label, count: docs.length, docs };
	});

	// Recent writing: newest dated docs across both collections
	const recent = collections
		.flatMap((c) =>
			c.docs
				.filter((d) => d.date)
				.map((d) => ({ ...d, collection: c.name as Collection }))
		)
		.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
		.slice(0, 5);

	return { kind: 'home', collections, recent };
};
