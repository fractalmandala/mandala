import {
	categories,
	getSupportedCatalog,
	getSupportedCatalogByCategory,
	type CatalogCategorySlug,
	type CatalogEntry
} from '$lib/catalog/index.js';

export const packageName = '@fractaldesign/fractal-svelte';
export const guides = [
	{
		slug: 'getting-started',
		name: 'Getting started',
		description: 'Install the package and add your first component.'
	},
	{
		slug: 'theming',
		name: 'Theming',
		description: 'Use semantic tokens and light, dark, or system preferences.'
	},
	{
		slug: 'accessibility',
		name: 'Accessibility',
		description: 'Build keyboard-friendly, reduced-motion-aware interfaces.'
	}
] as const;

export function isCategory(value: string): value is CatalogCategorySlug {
	return categories.some((category) => category.slug === value);
}

export function categoryFor(slug: CatalogCategorySlug) {
	return categories.find((category) => category.slug === slug)!;
}

export function entryFor(category: string, slug: string): CatalogEntry | undefined {
	return getSupportedCatalog().find(
		(entry) => entry.category === category && entry.slug === slug
	);
}

export function neighbors(entry: CatalogEntry) {
	const entries = getSupportedCatalogByCategory(entry.category);
	const index = entries.findIndex((candidate) => candidate.slug === entry.slug);
	return {
		previous: index > 0 ? entries[index - 1] : null,
		next: index < entries.length - 1 ? entries[index + 1] : null
	};
}

export function relatedTo(entry: CatalogEntry) {
	return getSupportedCatalogByCategory(entry.category)
		.filter((candidate) => candidate.slug !== entry.slug)
		.slice(0, 3);
}

export function componentPath(entry: Pick<CatalogEntry, 'category' | 'slug'>) {
	return `/components/${entry.category}/${entry.slug}`;
}
