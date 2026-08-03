import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog, categories } from '../src/lib/catalog/index.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshot = JSON.parse(
	await readFile(resolve(root, 'ports/upstream-catalog.json'), 'utf8')
) as {
	components: Array<{ slug: string; category: string }>;
};
const expected = { motion: 37, agents: 17, blocks: 18 } as const;
const slugs = catalog.map((entry) => entry.slug);
const snapshotSlugs = snapshot.components.map((entry) => entry.slug);

if (catalog.length !== 72) throw new Error(`Expected 72 entries, found ${catalog.length}`);
if (new Set(slugs).size !== slugs.length) throw new Error('Catalog slugs are not unique');
if (JSON.stringify(slugs) !== JSON.stringify(snapshotSlugs))
	throw new Error('Catalog slugs or ordering differ from the frozen snapshot');
for (const [category, count] of Object.entries(expected)) {
	const actual = catalog.filter((entry) => entry.category === category).length;
	if (actual !== count) throw new Error(`Expected ${count} ${category} entries, found ${actual}`);
}
if (categories.length !== 3) throw new Error(`Expected 3 categories, found ${categories.length}`);
if (
	catalog.some((entry) =>
		/https?:\/\/|beui|react|next\.js|tailwind|shadcn/i.test(
			`${entry.name} ${entry.description}`
		)
	)
) {
	throw new Error('Catalog exposes a source URL or legacy public branding');
}
const ready = catalog.filter((entry) => entry.status === 'ready');
if (ready.length !== 29) throw new Error(`Expected 29 ready entries, found ${ready.length}`);
if (catalog.filter((entry) => entry.status === 'planned').length !== 43)
	throw new Error('Expected 43 planned entries');
for (const slug of ['action-swap', 'theme-toggle', 'bouncy-accordion']) {
	const entry = catalog.find((item) => item.slug === slug);
	if (entry?.category !== 'motion' || !entry.componentPath.startsWith('blocks/'))
		throw new Error(`Canonical relocation is incorrect for ${slug}`);
}
console.log(
	'Catalog check passed: 72 entries (37 motion, 17 agents, 18 blocks; 29 ready, 43 planned)'
);
