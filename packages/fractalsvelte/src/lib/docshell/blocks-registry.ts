// Blocks registry — composed page shells and app layouts built from core components.
// Separate from registry.ts (primitives) and ai-registry.ts (AI elements).

export type Status = 'ready' | 'planned';

export type BlockCategory = 'Layout';

export type BlockEntry = {
	slug: string;
	name: string;
	category: BlockCategory;
	status: Status;
	/** Short blurb for the index card. */
	description: string;
	/** Core components the block composes. */
	uses: string[];
};

export const BLOCKS: BlockEntry[] = [
	{
		slug: 'basic',
		name: 'Basic',
		category: 'Layout',
		status: 'ready',
		description: 'Header, main, and footer shell — with optional chrome.',
		uses: []
	},
	{
		slug: 'sidebar-layout',
		name: 'Sidebar Layout',
		category: 'Layout',
		status: 'ready',
		description: 'Main area with left, right, dual, collapsible, and resizable sidebars.',
		uses: ['sidebar', 'resizable', 'button']
	},
	{
		slug: 'sidebar-accordion',
		name: 'Sidebar Accordion',
		category: 'Layout',
		status: 'ready',
		description: 'Sidebar navigation grouped as single-open accordion sections.',
		uses: ['sidebar', 'accordion']
	}
];

export const BLOCK_CATEGORY_ORDER: BlockCategory[] = ['Layout'];

export const getBlock = (slug: string) => BLOCKS.find((b) => b.slug === slug);

export const blocksByCategory = (entries = BLOCKS) =>
	BLOCK_CATEGORY_ORDER.map((category) => ({
		category,
		items: entries.filter((e) => e.category === category)
	})).filter((g) => g.items.length > 0);

export const blocksProgress = () => {
	const total = BLOCKS.length;
	const ready = BLOCKS.filter((b) => b.status === 'ready').length;
	return { blocksReady: ready, blocksTotal: total };
};
