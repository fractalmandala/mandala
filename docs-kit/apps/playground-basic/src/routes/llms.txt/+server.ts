import { createLlmsTxt } from '@docs-kit/ai';

import { aiDocuments, site } from '$lib/docs/ai';

import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(createLlmsTxt(aiDocuments(), { site, basePath: '/docs' }), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
