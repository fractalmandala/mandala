import { getBlock } from '$lib/docs/blocks-registry.js';
import { loadDoc } from '$lib/docs/load.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = ({ params }) => {
	const block = getBlock(params.slug);
	const entry =
		block && {
			slug: block.slug,
			name: block.name,
			wave: 0,
			status: block.status,
			deps: block.uses
		};
	return loadDoc(params.slug, entry, 'block');
};
