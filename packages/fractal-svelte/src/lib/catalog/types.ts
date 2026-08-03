export type CatalogCategorySlug = 'motion' | 'agents' | 'blocks';
export type CatalogStatus = 'ready' | 'planned';

export interface CatalogCategory {
	slug: CatalogCategorySlug;
	name: string;
	description: string;
}

export interface CatalogEntry {
	slug: string;
	name: string;
	description: string;
	category: CatalogCategorySlug;
	status: CatalogStatus;
	componentPath: string;
	exportPath: string | null;
	files: readonly string[];
	dependencies: readonly string[];
}

export interface CatalogSearchEntry {
	slug: string;
	name: string;
	description: string;
	category: CatalogCategorySlug;
	status: CatalogStatus;
	searchText: string;
}
