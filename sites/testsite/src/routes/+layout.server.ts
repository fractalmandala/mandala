import { listDocs, titleOf, type Collection } from '$lib/server/markdown';

export interface NavDoc {
	slug: string;
	title: string;
}

export const load = () => {
	const nav: Array<{ name: Collection; label: string; docs: NavDoc[] }> = (
		[
			{ name: 'posts', label: 'Posts' },
			{ name: 'sveltemotion', label: 'SvelteMotion' }
		] as const
	).map(({ name, label }) => ({
		name,
		label,
		docs: listDocs(name).map((doc) => ({ slug: doc.slug, title: titleOf(doc) }))
	}));

	return { nav };
};
