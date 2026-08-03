// Flat title index for the docs command palette — components, AI elements, blocks, and section pages.

import { COMPONENTS } from './registry.js';
import { AI_COMPONENTS } from './ai-registry.js';
import { BLOCKS } from './blocks-registry.js';

export type SearchSection = 'Pages' | 'Components' | 'AI Elements' | 'Blocks';

export type SearchHit = {
	/** Unique id for keys / command values */
	id: string;
	/** Display title (what the user sees and primarily matches) */
	title: string;
	href: string;
	section: SearchSection;
	/** Extra filter tokens: slug, category */
	keywords: string;
};

const pages: SearchHit[] = [
	{
		id: 'page:home',
		title: 'Home',
		href: '/',
		section: 'Pages',
		keywords: 'home index landing fractalsvelte'
	},
	{
		id: 'page:components',
		title: 'Components',
		href: '/components',
		section: 'Pages',
		keywords: 'components index core primitives'
	},
	{
		id: 'page:ai',
		title: 'AI Elements',
		href: '/ai',
		section: 'Pages',
		keywords: 'ai elements index chat'
	},
	{
		id: 'page:blocks',
		title: 'Blocks',
		href: '/blocks',
		section: 'Pages',
		keywords: 'blocks index layout shells'
	}
];

function buildIndex(): SearchHit[] {
	const componentHits: SearchHit[] = COMPONENTS.filter((c) => c.status === 'ready').map((c) => ({
		id: `component:${c.slug}`,
		title: c.name,
		href: `/components/${c.slug}`,
		section: 'Components' as const,
		keywords: `${c.slug} ${c.category} component`
	}));

	const aiHits: SearchHit[] = AI_COMPONENTS.filter((c) => c.status === 'ready').map((c) => ({
		id: `ai:${c.slug}`,
		title: c.name,
		href: `/ai/${c.slug}`,
		section: 'AI Elements' as const,
		keywords: `${c.slug} ${c.category} ai element`
	}));

	const blockHits: SearchHit[] = BLOCKS.filter((b) => b.status === 'ready').map((b) => ({
		id: `block:${b.slug}`,
		title: b.name,
		href: `/blocks/${b.slug}`,
		section: 'Blocks' as const,
		keywords: `${b.slug} ${b.category} block ${b.description}`
	}));

	return [...pages, ...componentHits, ...aiHits, ...blockHits];
}

/** Full searchable catalogue (ready titles only). */
export const SEARCH_INDEX: SearchHit[] = buildIndex();

export const SEARCH_SECTIONS: SearchSection[] = [
	'Pages',
	'Components',
	'AI Elements',
	'Blocks'
];

export function hitsBySection(section: SearchSection, index = SEARCH_INDEX) {
	return index.filter((h) => h.section === section);
}

/** Value string Command uses for filtering. */
export function searchValue(hit: SearchHit) {
	return `${hit.title} ${hit.keywords} ${hit.section}`.toLowerCase();
}
