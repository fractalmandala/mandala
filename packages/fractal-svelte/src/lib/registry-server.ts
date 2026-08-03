import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { catalog, getCatalogEntry, getReadyCatalog } from './catalog/index.js';

export interface RegistryFile {
	path: string;
	type: 'registry:component' | 'registry:style';
	content: string;
}

export interface RegistryItem {
	name: string;
	type: 'registry:component';
	title: string;
	description: string;
	dependencies: string[];
	registryDependencies: string[];
	files: RegistryFile[];
	raw: string;
}

const libRoot = new URL('./', import.meta.url);

function resolveCatalogFile(path: string): URL {
	if (!path.startsWith('src/lib/')) throw new Error(`Registry path is outside src/lib: ${path}`);
	return new URL(path.slice('src/lib/'.length), libRoot);
}

function registryPath(path: string): string {
	return path.slice('src/lib/'.length);
}

function registryFileType(path: string): RegistryFile['type'] {
	return path.endsWith('.sass') ? 'registry:style' : 'registry:component';
}

export function getRegistryIndex() {
	return {
		name: 'fractal-svelte',
		title: 'Fractal Svelte',
		description: 'Spring-animated Svelte primitives, agent components, and product blocks.',
		items: getReadyCatalog().map((entry) => ({
			name: entry.slug,
			type: 'registry:component' as const,
			title: entry.name,
			description: entry.description,
			category: entry.category,
			status: entry.status,
			dependencies: [...entry.dependencies],
			registryDependencies: [] as string[],
			files: [...entry.files]
		}))
	};
}

export async function getRegistryItem(slug: string): Promise<RegistryItem | null> {
	const entry = getCatalogEntry(slug);
	if (!entry || entry.status !== 'ready') return null;
	const files: RegistryFile[] = [];
	for (const path of entry.files) {
		const url = resolveCatalogFile(path);
		let content: string;
		try {
			content = await readFile(url, 'utf8');
		} catch (cause) {
			throw new Error(`Declared registry file is missing: ${fileURLToPath(url)}`, { cause });
		}
		files.push({ path: registryPath(path), type: registryFileType(path), content });
	}
	return {
		name: entry.slug,
		type: 'registry:component',
		title: entry.name,
		description: entry.description,
		dependencies: [...entry.dependencies],
		registryDependencies: [],
		files,
		raw: files.map((file) => file.content).join('\n')
	};
}

export function getCatalogSlugs(): string[] {
	return getReadyCatalog().map((entry) => entry.slug);
}

export function getReadyRegistrySlugs(): string[] {
	return catalog.filter((entry) => entry.status === 'ready').map((entry) => entry.slug);
}

export function hasCatalogEntry(slug: string): boolean {
	return getReadyCatalog().some((entry) => entry.slug === slug);
}
