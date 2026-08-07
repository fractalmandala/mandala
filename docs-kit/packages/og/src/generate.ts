import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

import { hashDocsManifestConfig, type DocsManifestPage } from '@docs-kit/core';

import {
	createDocsOgCard,
	ogTemplateVersion,
	type CreateDocsOgCardOptions,
	type DocsOgCardInput
} from './card.js';
import { docsOgCardFileName, docsOgCardUrl } from './url.js';

/** Converts an SVG card to a raster image. Supply one to emit PNG instead of SVG. */
export type DocsOgRasterizer = (
	svg: string,
	size: { width: number; height: number }
) => Promise<Uint8Array>;

export interface DocsOgCacheEntry {
	/** Path relative to the output directory. */
	file: string;
	/** Hash of every input that affects the rendered card. */
	hash: string;
}

export interface DocsOgCache {
	version: number;
	entries: DocsOgCacheEntry[];
}

export interface GenerateDocsOgCardsOptions extends CreateDocsOgCardOptions {
	pages: readonly DocsManifestPage[];
	/** Directory the cards are written to, for example `static/og`. */
	outDir: string;
	cwd?: string;
	/** Public path the generated files are served from. Defaults to `/og`. */
	publicPath?: string;
	siteName?: string;
	/** Logo data URI placed on every card. */
	logo?: string;
	/** Rasterizer. Without one, cards are written as `.svg`. */
	rasterize?: DocsOgRasterizer;
	/** Include hidden and draft pages. Defaults to false. */
	includeHidden?: boolean;
}

export interface DocsOgCardResult {
	pageId: string;
	pathname: string;
	/** URL to put in `og:image`. */
	url: string;
	file: string;
	status: 'written' | 'unchanged';
}

export interface GenerateDocsOgCardsResult {
	cards: DocsOgCardResult[];
	/** Files removed because their page no longer exists. */
	removed: string[];
	outDir: string;
}

const cacheFileName = 'cache.json';
const cacheVersion = 1;

function cardInput(page: DocsManifestPage, options: GenerateDocsOgCardsOptions): DocsOgCardInput {
	const section = page.slugSegments.length > 1 ? page.slugSegments[0] : undefined;

	return {
		title: page.title,
		...(page.description === undefined ? {} : { description: page.description }),
		...(section === undefined ? {} : { section }),
		...(options.siteName === undefined ? {} : { siteName: options.siteName }),
		...(page.locale === undefined ? {} : { locale: page.locale }),
		...(page.version === undefined ? {} : { version: page.version }),
		...(options.logo === undefined ? {} : { logo: options.logo })
	};
}

async function readCache(path: string): Promise<DocsOgCache> {
	try {
		const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));
		if (
			parsed !== null &&
			typeof parsed === 'object' &&
			(parsed as DocsOgCache).version === cacheVersion &&
			Array.isArray((parsed as DocsOgCache).entries)
		) {
			return parsed as DocsOgCache;
		}
	} catch {
		// A missing or unreadable cache simply regenerates everything.
	}

	return { version: cacheVersion, entries: [] };
}

async function writeFileAtomic(path: string, data: string | Uint8Array): Promise<void> {
	await mkdir(dirname(path), { recursive: true });
	const temporaryPath = `${path}.tmp`;
	await writeFile(temporaryPath, data);
	await rename(temporaryPath, path);
}

/**
 * Generates one Open Graph card per page.
 *
 * A card is rewritten only when something that affects it changed — its title, description,
 * theme, logo, or the template version — and cards whose page disappeared are deleted, so a
 * build never leaves stale images behind.
 */
export async function generateDocsOgCards(
	options: GenerateDocsOgCardsOptions
): Promise<GenerateDocsOgCardsResult> {
	const cwd = options.cwd ?? process.cwd();
	const outDir = resolve(cwd, options.outDir);
	const publicPath = (options.publicPath ?? '/og').replace(/\/$/, '');
	const extension = options.rasterize ? 'png' : 'svg';
	const previous = await readCache(join(outDir, cacheFileName));
	const previousByFile = new Map(previous.entries.map((entry) => [entry.file, entry]));

	const pages = options.pages.filter(
		(page) => options.includeHidden === true || (!page.hidden && !page.draft)
	);
	const cards: DocsOgCardResult[] = [];
	const entries: DocsOgCacheEntry[] = [];

	for (const page of pages) {
		const file = docsOgCardFileName(page, extension);
		const input = cardInput(page, options);
		const hash = hashDocsManifestConfig({
			input,
			theme: options.theme ?? null,
			raster: extension,
			template: ogTemplateVersion
		});
		const existing = previousByFile.get(file);
		previousByFile.delete(file);

		const result: DocsOgCardResult = {
			pageId: page.id,
			pathname: page.pathname,
			url: `${publicPath}/${file}`,
			file,
			status: existing?.hash === hash ? 'unchanged' : 'written'
		};

		if (result.status === 'written') {
			const svg = createDocsOgCard(input, {
				...(options.theme === undefined ? {} : { theme: options.theme }),
				...(options.template === undefined ? {} : { template: options.template })
			});
			const data = options.rasterize
				? await options.rasterize(svg, {
						width: options.theme?.width ?? 1200,
						height: options.theme?.height ?? 630
					})
				: svg;

			await writeFileAtomic(join(outDir, file), data);
		}

		entries.push({ file, hash });
		cards.push(result);
	}

	const removed: string[] = [];
	for (const stale of previousByFile.keys()) {
		await rm(join(outDir, stale), { force: true });
		removed.push(stale);
	}

	await writeFileAtomic(
		join(outDir, cacheFileName),
		`${JSON.stringify({ version: cacheVersion, entries: entries.sort((left, right) => left.file.localeCompare(right.file)) }, null, '\t')}\n`
	);

	return { cards, removed, outDir };
}

/** Lists card files currently on disk, used by diagnostics and tests. */
export async function listDocsOgCards(outDir: string): Promise<string[]> {
	try {
		const entries = await readdir(outDir, { recursive: true, withFileTypes: true });
		return entries
			.filter((entry) => entry.isFile() && entry.name !== cacheFileName)
			.map((entry) => relative(outDir, join(entry.parentPath ?? outDir, entry.name)))
			.sort();
	} catch {
		return [];
	}
}
