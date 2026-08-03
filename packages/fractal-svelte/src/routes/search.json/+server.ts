import { json } from '@sveltejs/kit';
import { searchSupportedCatalog } from '$lib/catalog/index.js';

export function GET() {
	return json(
		searchSupportedCatalog('').map(({ searchText: _, ...entry }) => ({
			...entry,
			href: `/components/${entry.category}/${entry.slug}`
		})),
		{
			headers: { 'cache-control': 'public, max-age=300' }
		}
	);
}
