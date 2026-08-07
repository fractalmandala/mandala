import { readFile, readdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import {
	contentExtensionFromPath,
	pathToSlug,
	pathToSlugSegments,
	slugToPathname,
	type DiscoveredContent
} from '@docs-kit/core/content';
import { sectionMetaFileName, type DiscoveredSection, type DocsSectionMeta } from '@docs-kit/core/navigation';

export interface DiscoverLocalContentOptions {
	/** Absolute or process-relative directory containing Markdown and mdsvex sources. */
	root: string;
	/** Include dot-prefixed directories. Hidden directories are excluded by default. */
	includeHiddenDirectories?: boolean;
	/** Optional version dimension assigned to every discovered page. */
	version?: string;
	/** Optional locale dimension assigned to every discovered page. */
	locale?: string;
	/** Optional content hash assigned to every discovered page. */
	contentHash?: string;
	/** Optional default-locale source hash assigned to every discovered page. */
	translationSourceHash?: string;
	/** Collection identity assigned to every discovered page. */
	collection?: string;
	/** Read each document's text into `raw`, which page metadata is derived from. */
	readSources?: boolean;
}

function toPosixPath(path: string): string {
	return path.replace(/\\/g, '/');
}

function normalizeOptionalDimension(value: string | undefined, name: string): string | undefined {
	if (value === undefined) {
		return undefined;
	}

	const normalized = value.trim();
	if (!normalized) {
		throw new Error(`${name} must not be empty when supplied.`);
	}

	return normalized;
}

async function collectContentPaths(
	directory: string,
	includeHiddenDirectories: boolean,
	paths: string[]
): Promise<void> {
	const entries = await readdir(directory, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.isDirectory()) {
			if (!includeHiddenDirectories && entry.name.startsWith('.')) {
				continue;
			}

			await collectContentPaths(resolve(directory, entry.name), includeHiddenDirectories, paths);
			continue;
		}

		if (entry.isFile() && contentExtensionFromPath(entry.name)) {
			paths.push(resolve(directory, entry.name));
		}
	}
}

/**
 * Recursively discovers local Markdown and mdsvex files in deterministic path order.
 * The returned records are framework-independent and JSON-serializable.
 */
export async function discoverLocalContent(
	options: DiscoverLocalContentOptions
): Promise<DiscoveredContent[]> {
	const root = resolve(options.root);
	const sourcePaths: string[] = [];
	const version = normalizeOptionalDimension(options.version, 'version');
	const locale = normalizeOptionalDimension(options.locale, 'locale');
	const contentHash = normalizeOptionalDimension(options.contentHash, 'contentHash');
	const translationSourceHash = normalizeOptionalDimension(
		options.translationSourceHash,
		'translationSourceHash'
	);
	const collection = normalizeOptionalDimension(options.collection, 'collection');

	await collectContentPaths(root, options.includeHiddenDirectories ?? false, sourcePaths);

	const sources = options.readSources
		? new Map(
				await Promise.all(
					sourcePaths.map(
						async (sourcePath) => [sourcePath, await readFile(sourcePath, 'utf8')] as const
					)
				)
			)
		: undefined;

	return sourcePaths
		.map((sourcePath) => {
			const relativePath = toPosixPath(relative(root, sourcePath));
			const extension = contentExtensionFromPath(relativePath);

			if (!extension) {
				throw new Error(`Unsupported discovered content path: ${sourcePath}`);
			}

			const slug = pathToSlug(relativePath);
			return {
				sourcePath: toPosixPath(sourcePath),
				relativePath,
				extension,
				slugSegments: pathToSlugSegments(relativePath),
				slug,
				pathname: slugToPathname(slug),
				...(collection === undefined ? {} : { collection }),
				...(version === undefined ? {} : { version }),
				...(locale === undefined ? {} : { locale }),
				...(contentHash === undefined ? {} : { contentHash }),
				...(translationSourceHash === undefined ? {} : { translationSourceHash }),
				...(sources?.get(sourcePath) === undefined ? {} : { raw: sources.get(sourcePath) as string })
			};
		})
		.sort((left, right) =>
			left.relativePath < right.relativePath ? -1 : left.relativePath > right.relativePath ? 1 : 0
		);
}

/** Resolves a discovered content record by a normalized slug string. */
export function findDiscoveredContent(
	content: readonly DiscoveredContent[],
	slug: string
): DiscoveredContent | undefined {
	return content.find((entry) => entry.slug === pathToSlug(slug));
}

export { sectionMetaFileName } from '@docs-kit/core/navigation';

export interface DiscoverLocalSectionsOptions {
	root: string;
	includeHiddenDirectories?: boolean;
	version?: string;
	locale?: string;
	collection?: string;
}

async function collectSectionPaths(
	directory: string,
	includeHiddenDirectories: boolean,
	paths: string[]
): Promise<void> {
	const entries = await readdir(directory, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.isDirectory()) {
			if (!includeHiddenDirectories && entry.name.startsWith('.')) {
				continue;
			}
			await collectSectionPaths(resolve(directory, entry.name), includeHiddenDirectories, paths);
			continue;
		}
		if (entry.isFile() && entry.name === sectionMetaFileName) {
			paths.push(resolve(directory, entry.name));
		}
	}
}

/**
 * Discovers `meta.json` folder metadata in deterministic order.
 *
 * JSON rather than an executable module keeps content discovery framework-neutral: the
 * compiler never evaluates code from a content directory.
 */
export async function discoverLocalSections(
	options: DiscoverLocalSectionsOptions
): Promise<DiscoveredSection[]> {
	const root = resolve(options.root);
	const metaPaths: string[] = [];

	try {
		await collectSectionPaths(root, options.includeHiddenDirectories ?? false, metaPaths);
	} catch {
		return [];
	}

	const sections: DiscoveredSection[] = [];

	for (const metaPath of metaPaths.sort()) {
		const directory = toPosixPath(relative(root, resolve(metaPath, '..')));
		let meta: DocsSectionMeta;

		try {
			const parsed: unknown = JSON.parse(await readFile(metaPath, 'utf8'));
			if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
				throw new Error('not an object');
			}
			meta = parsed as DocsSectionMeta;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new Error(`Could not read section metadata at ${metaPath}: ${message}`);
		}

		sections.push({
			directory,
			meta,
			...(options.collection === undefined ? {} : { collection: options.collection }),
			...(options.version === undefined ? {} : { version: options.version }),
			...(options.locale === undefined ? {} : { locale: options.locale })
		});
	}

	return sections;
}
