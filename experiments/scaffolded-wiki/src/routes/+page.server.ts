import type { PageServerLoad } from './$types';
import { wiki, pruneTree, tagView, docMetaView } from '$lib/server/wiki';

export const load: PageServerLoad = () => {
	const landing = wiki.find('/');
	const tree = pruneTree(wiki.tree);

	const sectionCards = tree
		.filter((n) => n.kind === 'section')
		.map((s) => {
			const land = wiki.find(s.path);
			return {
				title: s.title,
				path: s.path,
				count: s.count ?? 0,
				description: land?.description ?? ''
			};
		});

	const rootDocs = tree.filter((n) => n.kind === 'doc' && n.path !== '/');
	const cloud = [...tagView()].sort((a, b) => b.count - a.count).slice(0, 24);

	return {
		landing: landing ? docMetaView(landing) : undefined,
		sectionCards,
		rootDocs,
		cloud,
		counts: { docs: wiki.docs.length, tags: wiki.tags.length, sections: sectionCards.length }
	};
};
