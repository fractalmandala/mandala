import { existsSync, watch, type FSWatcher } from 'node:fs';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import {
	createDocsManifest,
	createDocsSearchRecords,
	type DiscoveredContent,
	type DocsManifest,
	type DocsResolvedConfig
} from '@docs-kit/core';
import { discoverLocalContent, discoverLocalSections } from '@docs-kit/core/discovery';
import { generateDocsOgCards } from '@docs-kit/og/server';
import { generateApiDocs, type DocsApiSourceConfig } from '@docs-kit/openapi';
import { createDocsRobots, createDocsSitemap } from '@docs-kit/seo';
import { createDocsSource, syncDocsSources } from '@docs-kit/sources';

import { loadDocsConfig } from '../config-file.js';
import { booleanOption, report, stringOption, type DocsCliCommand, type DocsCliContext } from '../runtime.js';
import { resolveContentRoots } from './validate.js';

export interface GenerateArtifactsOptions {
	config: DocsResolvedConfig;
	cwd: string;
	env?: Record<string, string | undefined>;
	/** Skip network work and reuse cached source content. */
	offline?: boolean;
	/** Static directory for sitemap, robots, and Open Graph cards. */
	staticDir?: string;
}

export interface GenerateArtifactsResult {
	pages: number;
	searchRecords: number;
	written: string[];
	/** Non-fatal problems, for example a source that fell back to its cache. */
	warnings: string[];
	manifest: DocsManifest;
}

async function writeFileAtomic(path: string, content: string): Promise<void> {
	await mkdir(dirname(path), { recursive: true });
	const temporaryPath = `${path}.tmp`;
	await writeFile(temporaryPath, content, 'utf8');
	await rename(temporaryPath, path);
}

/**
 * Produces every generated artifact outside a Vite build.
 *
 * The Vite plugin does the same work during `vite dev` and `vite build`; this command
 * exists so CI, a pre-commit hook, or another framework can generate the same output
 * without starting a bundler.
 */
export async function generateDocsArtifacts(
	options: GenerateArtifactsOptions
): Promise<GenerateArtifactsResult> {
	const { config, cwd } = options;
	const written: string[] = [];
	const warnings: string[] = [];
	const outDir = resolve(cwd, config.outDir);
	const staticDir = resolve(cwd, options.staticDir ?? 'static');
	const extraRoots: string[] = [];

	if (config.sources.entries.length > 0) {
		const sync = await syncDocsSources({
			cwd,
			cacheDir: config.sources.cacheDir,
			onConflict: config.sources.onConflict,
			offline: options.offline ?? false,
			sources: config.sources.entries.map((entry) =>
				createDocsSource(entry, { env: options.env ?? {} })
			)
		});

		for (const source of sync.sources) {
			if (source.error) {
				warnings.push(`source "${source.sourceId}": ${source.error}`);
			}
		}
		for (const diagnostic of sync.diagnostics) {
			warnings.push(`${diagnostic.code}: ${diagnostic.message}`);
		}

		extraRoots.push(resolve(cwd, config.sources.cacheDir));
	}

	const specifications: DocsApiSourceConfig[] = config.openapi.map(({ collection: _collection, ...entry }) => entry);
	if (specifications.length > 0) {
		const api = await generateApiDocs({
			cwd,
			outDir: join(config.outDir, 'generated/openapi'),
			sources: specifications.map((source) => ({
				basePath: config.routing.basePath,
				...source
			}))
		});

		const errors = api.diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
		if (errors.length > 0) {
			throw new Error(
				`Could not compile ${errors.length} API specification(s):\n${errors
					.map((diagnostic) => `  [${diagnostic.sourceId}] ${diagnostic.message}`)
					.join('\n')}`
			);
		}

		for (const diagnostic of api.diagnostics) {
			warnings.push(`[${diagnostic.sourceId}] ${diagnostic.code}: ${diagnostic.message}`);
		}

		written.push(...api.written.map((path) => join(config.outDir, 'generated/openapi', path)));
		extraRoots.push(api.outDir);
	}

	// Generated roots carry no version or locale of their own; dimensions come from the
	// configured content roots.
	const roots: Array<{ root: string; version?: string; locale?: string }> = [
		...resolveContentRoots(config, cwd),
		...extraRoots.filter((root) => existsSync(root)).map((root) => ({ root }))
	];

	const content: DiscoveredContent[] = [];
	const sections = [];

	for (const entry of roots) {
		if (!existsSync(entry.root)) {
			warnings.push(`content root does not exist: ${entry.root}`);
			continue;
		}

		content.push(
			...(await discoverLocalContent({
				root: entry.root,
				readSources: true,
				...(entry.version === undefined ? {} : { version: entry.version }),
				...(entry.locale === undefined ? {} : { locale: entry.locale })
			}))
		);
		sections.push(
			...(await discoverLocalSections({
				root: entry.root,
				...(entry.version === undefined ? {} : { version: entry.version }),
				...(entry.locale === undefined ? {} : { locale: entry.locale })
			}))
		);
	}

	const manifest = createDocsManifest(content, {
		sections,
		routing: {
			basePath: config.routing.basePath,
			versionPrefix: config.routing.versionPrefix,
			localePrefix: config.routing.localePrefix,
			...(config.versions === undefined ? {} : { versions: config.versions }),
			...(config.i18n === undefined ? {} : { locales: config.i18n })
		},
		...(config.versions === undefined ? {} : { versions: config.versions }),
		...(config.i18n === undefined ? {} : { locales: config.i18n })
	});

	await writeFileAtomic(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, '\t')}\n`);
	written.push(join(config.outDir, 'manifest.json'));

	const searchRecords = createDocsSearchRecords(manifest.pages, {
		sources: new Map(
			manifest.pages.map((page) => [
				page.id,
				content.find(
					(entry) =>
						entry.relativePath === page.source.relativePath &&
						entry.version === page.version &&
						entry.locale === page.locale
				)?.raw ?? ''
			])
		)
	});
	await writeFileAtomic(
		join(outDir, 'search/records.json'),
		`${JSON.stringify(searchRecords, null, '\t')}\n`
	);
	written.push(join(config.outDir, 'search/records.json'));

	if (config.site.url !== undefined) {
		await writeFileAtomic(
			join(staticDir, 'sitemap.xml'),
			createDocsSitemap(manifest.pages, { url: config.site.url })
		);
		await writeFileAtomic(
			join(staticDir, 'robots.txt'),
			createDocsRobots({ url: config.site.url })
		);
		written.push('static/sitemap.xml', 'static/robots.txt');

		const cards = await generateDocsOgCards({
			pages: manifest.pages,
			outDir: join(staticDir, 'og'),
			cwd,
			siteName: config.site.title
		});
		written.push(...cards.cards.filter((card) => card.status === 'written').map((card) => `static/og/${card.file}`));
	} else {
		warnings.push('site.url is not configured, so the sitemap, robots, and cards were skipped.');
	}

	return { pages: manifest.pages.length, searchRecords: searchRecords.length, written, warnings, manifest };
}

function watchRoots(
	roots: readonly string[],
	onChange: () => void
): { close: () => void } {
	const watchers: FSWatcher[] = [];
	let timer: NodeJS.Timeout | undefined;

	for (const root of roots) {
		if (!existsSync(root)) {
			continue;
		}

		watchers.push(
			watch(root, { recursive: true }, () => {
				// Editors write several times per save, so changes are coalesced.
				clearTimeout(timer);
				timer = setTimeout(onChange, 120);
			})
		);
	}

	return {
		close() {
			clearTimeout(timer);
			for (const watcher of watchers) {
				watcher.close();
			}
		}
	};
}

/** `docs generate` — writes manifests, search records, and discovery artifacts. */
export const generateCommand: DocsCliCommand = {
	name: 'generate',
	summary: 'Generate manifests, search records, sitemap, robots, and Open Graph cards.',
	usage: 'docs generate [--config <file>] [--static <dir>] [--offline] [--watch] [--json]',
	async run(args, context: DocsCliContext) {
		const { config } = await loadDocsConfig({
			cwd: context.cwd,
			...(stringOption(args, 'config') === undefined
				? {}
				: { configFile: stringOption(args, 'config') as string })
		});

		const run = async (): Promise<number> => {
			const result = await generateDocsArtifacts({
				config,
				cwd: context.cwd,
				env: context.env,
				offline: booleanOption(args, 'offline'),
				...(stringOption(args, 'static') === undefined
					? {}
					: { staticDir: stringOption(args, 'static') as string })
			});

			report(
				context,
				args,
				{
					pages: result.pages,
					searchRecords: result.searchRecords,
					written: result.written,
					warnings: result.warnings
				},
				[
					`Generated ${result.pages} page(s) and ${result.searchRecords} search record(s)`,
					...result.written.map((path) => `  wrote ${path}`),
					...result.warnings.map((warning) => `  WARNING ${warning}`)
				]
			);

			return 0;
		};

		const code = await run();

		if (!booleanOption(args, 'watch')) {
			return code;
		}

		const roots = resolveContentRoots(config, context.cwd).map((entry) => entry.root);
		context.write(`Watching ${roots.length} content root(s). Press Ctrl+C to stop.`);

		await new Promise<void>(() => {
			watchRoots(roots, () => {
				void run().catch((error: unknown) => {
					context.writeError(error instanceof Error ? error.message : String(error));
				});
			});
		});

		return code;
	}
};
