import { createRawMarkdown } from '@docs-kit/ai';
import { error } from '@sveltejs/kit';
import { manifest } from 'virtual:docs-kit/manifest';

import { aiDocuments, site } from '$lib/docs/ai';

import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	manifest.pages
		.filter((page) => !page.hidden && !page.draft)
		.map((page) => ({ slug: page.slug }));

export const GET: RequestHandler = ({ params }) => {
	const document = aiDocuments().find(
		(entry) => entry.pathname === `/docs/${params.slug ?? ''}`.replace(/\/$/, '')
	);

	if (!document || document.hidden) {
		error(404, 'No documentation page matches this address.');
	}

	return new Response(createRawMarkdown(document, { site }), {
		headers: { 'content-type': 'text/markdown; charset=utf-8' }
	});
};
