import { json } from '@sveltejs/kit';
import { getRegistryIndex } from '$lib/registry-server.js';

export function GET() {
	return json(getRegistryIndex());
}
