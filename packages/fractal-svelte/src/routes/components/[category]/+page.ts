import { error } from '@sveltejs/kit';
import { getSupportedCatalogByCategory } from '$lib/catalog/index.js';
import { categoryFor, isCategory } from '$site/content.js';

export function load({ params }) {
	if (!isCategory(params.category)) error(404, 'Category not found');
	return {
		category: categoryFor(params.category),
		entries: getSupportedCatalogByCategory(params.category)
	};
}
