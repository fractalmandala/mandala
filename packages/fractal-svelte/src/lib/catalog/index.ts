import { previewSlugs } from './preview-loaders.generated.js';
import { catalog, categories } from './generated.js';
import type { CatalogCategorySlug, CatalogEntry, CatalogSearchEntry } from './types.js';

export { catalog, categories };
export type {
	CatalogCategory,
	CatalogCategorySlug,
	CatalogEntry,
	CatalogSearchEntry,
	CatalogStatus
} from './types.js';

export const searchIndex: readonly CatalogSearchEntry[] = catalog.map((entry) => ({
	slug: entry.slug,
	name: entry.name,
	description: entry.description,
	category: entry.category,
	status: entry.status,
	searchText:
		`${entry.name} ${entry.slug} ${entry.description} ${entry.category}`.toLocaleLowerCase()
}));

export function getCatalogEntry(slug: string): CatalogEntry | undefined {
	return catalog.find((entry) => entry.slug === slug);
}

export function getCatalogByCategory(category: CatalogCategorySlug): readonly CatalogEntry[] {
	return catalog.filter((entry) => entry.category === category);
}

export function getReadyCatalog(): readonly CatalogEntry[] {
	return catalog.filter((entry) => entry.status === 'ready');
}

export function getSupportedCatalog(): readonly CatalogEntry[] {
	return catalog.filter((entry) =>
		previewSlugs.includes(entry.slug as (typeof previewSlugs)[number])
	);
}

export function getSupportedCatalogByCategory(
	category: CatalogCategorySlug
): readonly CatalogEntry[] {
	return getSupportedCatalog().filter((entry) => entry.category === category);
}

export function searchCatalog(query: string): readonly CatalogSearchEntry[] {
	const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
	if (terms.length === 0) return searchIndex;
	return searchIndex.filter((entry) => terms.every((term) => entry.searchText.includes(term)));
}

export function searchSupportedCatalog(query: string): readonly CatalogSearchEntry[] {
	const supported = new Set(getSupportedCatalog().map((entry) => entry.slug));
	return searchCatalog(query).filter((entry) => supported.has(entry.slug));
}
