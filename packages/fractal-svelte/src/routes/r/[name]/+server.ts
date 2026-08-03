import { json, error } from '@sveltejs/kit';
import { getRegistryItem } from '$lib/registry-server.js';

export async function GET({ params }) {
	const item = await getRegistryItem(params.name);
	if (!item) error(404, `Registry item "${params.name}" is not ready`);
	return json(item);
}
