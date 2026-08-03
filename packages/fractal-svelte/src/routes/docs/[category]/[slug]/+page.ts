import { error, redirect } from '@sveltejs/kit';
import { entryFor } from '$site/content.js';

export function load({ params }: { params: { category: string; slug: string } }) {
	const entry = entryFor(params.category, params.slug);
	if (entry) redirect(308, `/components/${entry.category}/${entry.slug}`);
	error(404, 'Supported component not found');
}
