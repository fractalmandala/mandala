import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';

interface SnapshotComponent {
	slug: string;
	name: string;
	description: string;
	category: 'motion' | 'agents' | 'blocks';
}

interface Snapshot {
	components: SnapshotComponent[];
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshot = JSON.parse(
	await readFile(resolve(root, 'ports/upstream-catalog.json'), 'utf8')
) as Snapshot;
const outputPath = resolve(root, 'src/lib/catalog/generated.ts');
const previewPath = resolve(root, 'src/lib/catalog/preview-loaders.generated.ts');
const check = process.argv.includes('--check');
const relocations: Record<string, string> = {
	'action-swap': 'blocks/action-swap',
	'theme-toggle': 'blocks/theme-toggle',
	'bouncy-accordion': 'blocks/bouncy-accordion'
};

const categoryMeta = {
	motion: {
		slug: 'motion',
		name: 'Motion',
		description: 'Spring-animated Svelte primitives for responsive, accessible interfaces.'
	},
	agents: {
		slug: 'agents',
		name: 'Agents',
		description: 'Svelte components for conversational, tool-driven, and agentic interfaces.'
	},
	blocks: {
		slug: 'blocks',
		name: 'Blocks',
		description: 'Composable Svelte product patterns ready for application workflows.'
	}
} as const;

function publicDescription(component: SnapshotComponent): string {
	return component.description
		.replace(/motion's/gi, 'shared')
		.replace(/React|Next\.js|Tailwind CSS|shadcn/gi, 'Svelte')
		.replace(/\s+/g, ' ')
		.trim();
}

async function isDirectory(path: string) {
	try {
		return (await stat(path)).isDirectory();
	} catch {
		return false;
	}
}

async function makeEntry(component: SnapshotComponent) {
	const componentPath = relocations[component.slug] ?? `${component.category}/${component.slug}`;
	const absolute = resolve(root, 'src/lib/components', componentPath);
	const ready = await isDirectory(absolute);
	const files: string[] = [];
	if (ready) {
		for (const name of (await readdir(absolute)).sort()) {
			if (name.endsWith('.svelte') || name.endsWith('.sass') || name === 'index.ts') {
				files.push(`src/lib/components/${componentPath}/${name}`);
			}
		}
		const contents = await Promise.all(
			files.map((file) => readFile(resolve(root, file), 'utf8'))
		);
		if (contents.some((content) => content.includes('$lib/ease.js')))
			files.push('src/lib/ease.ts');
		if (
			contents.some((content) => content.includes('$lib/motion/use-hover-capable.svelte.js'))
		) {
			files.push('src/lib/motion/use-hover-capable.svelte.ts');
		}
	}
	return {
		slug: component.slug,
		name: component.name === 'Fixtures' ? 'Knockout Bracket' : component.name,
		description: publicDescription(component),
		category: component.category,
		status: ready ? 'ready' : 'planned',
		componentPath,
		exportPath: ready ? `./${component.slug}` : null,
		files,
		dependencies: ready
			? [
					'svelte',
					...(files.some((file) => file.endsWith('ease.ts')) ||
					(
						await Promise.all(
							files
								.filter((file) => file.endsWith('.svelte'))
								.map((file) => readFile(resolve(root, file), 'utf8'))
						)
					).some((content) => content.includes('@humanspeak/svelte-motion'))
						? ['@humanspeak/svelte-motion']
						: [])
				]
			: []
	};
}

const entries = await Promise.all(snapshot.components.map(makeEntry));
const counts = Object.fromEntries(
	['motion', 'agents', 'blocks'].map((category) => [
		category,
		entries.filter((entry) => entry.category === category).length
	])
);
if (entries.length !== 72 || counts.motion !== 37 || counts.agents !== 17 || counts.blocks !== 18) {
	throw new Error(
		`Frozen snapshot has unexpected counts: ${JSON.stringify({ total: entries.length, ...counts })}`
	);
}
if (entries.filter((entry) => entry.status === 'ready').length !== 29) {
	throw new Error(
		`Expected 29 local components, found ${entries.filter((entry) => entry.status === 'ready').length}`
	);
}

const prettierOptions = { ...(await resolveConfig(outputPath)), parser: 'typescript' as const };
const generated = await format(
	`import type { CatalogCategory, CatalogEntry } from './types.js';\n\nexport const categories = ${JSON.stringify(Object.values(categoryMeta), null, '\t')} as const satisfies readonly CatalogCategory[];\n\nexport const catalog = ${JSON.stringify(entries, null, '\t')} as const satisfies readonly CatalogEntry[];\n`,
	prettierOptions
);
const previewEntries = entries
	.filter((entry) => entry.status === 'ready')
	.map(
		(entry) =>
			`\t'${entry.slug}': () => import('../components/${entry.componentPath}/index.js')`
	)
	.join(',\n');
const previews = await format(
	`export const previewLoaders = {\n${previewEntries}\n} as const;\n\nexport type PreviewSlug = keyof typeof previewLoaders;\nexport const previewSlugs = Object.keys(previewLoaders) as PreviewSlug[];\n`,
	prettierOptions
);

async function emit(path: string, content: string) {
	if (check) {
		let current = '';
		try {
			current = await readFile(path, 'utf8');
		} catch {}
		if (current !== content)
			throw new Error(`${relative(root, path)} is out of date; run pnpm generate:catalog`);
		return;
	}
	await writeFile(path, content);
}

await emit(outputPath, generated);
await emit(previewPath, previews);
console.log(
	`${check ? 'Checked' : 'Generated'} ${entries.length} catalog entries (${entries.filter((entry) => entry.status === 'ready').length} ready, ${entries.filter((entry) => entry.status === 'planned').length} planned)`
);
