import { error } from '@sveltejs/kit';
import { guides } from '$site/content.js';

export function load({ params }) {
	const guide = guides.find((candidate) => candidate.slug === params.guide);
	if (!guide) error(404, 'Guide not found');
	return { guide };
}
