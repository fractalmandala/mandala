import { error } from '@sveltejs/kit';
import { entryFor, neighbors, relatedTo } from '$site/content.js';

export function load({ params }) {
	const entry = entryFor(params.category, params.slug);
	if (!entry) error(404, 'Supported component not found');
	return { entry, ...neighbors(entry), related: relatedTo(entry) };
}
