import type { LayoutServerLoad } from './$types';
import { wiki, pruneTree, tagView } from '$lib/server/wiki';

export const load: LayoutServerLoad = () => {
	return {
		tree: pruneTree(wiki.tree),
		tags: tagView(),
		counts: { docs: wiki.docs.length, tags: wiki.tags.length }
	};
};
