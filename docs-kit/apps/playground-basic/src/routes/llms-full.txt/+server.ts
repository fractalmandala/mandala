import { createLlmsFullTxt } from '@docs-kit/ai';

import { aiDocuments, site } from '$lib/docs/ai';

import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () =>
	new Response(createLlmsFullTxt(aiDocuments(), { site }), {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
