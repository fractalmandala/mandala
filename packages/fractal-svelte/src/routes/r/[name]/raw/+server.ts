import { error } from '@sveltejs/kit';
import { getRegistryItem } from '$lib/registry-server.js';

export async function GET({ params }) {
	const item = await getRegistryItem(params.name);
	if (!item) error(404, `Registry item "${params.name}" is not ready`);
	return new Response(item.raw, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=300'
		}
	});
}
