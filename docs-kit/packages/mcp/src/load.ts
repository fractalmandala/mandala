import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { createDocsAiDocument, type DocsAiDocument } from '@docs-kit/ai';
import { discoverLocalContent } from '@docs-kit/core/discovery';
import {
	createDocsPath,
	normalizeDocsLocales,
	normalizeDocsVersions,
	type DocsResolvedConfig
} from '@docs-kit/core';

export interface LoadDocsMcpDocumentsOptions {
	config: DocsResolvedConfig;
	cwd?: string;
	/** Additional roots, for example synced source caches. */
	extraRoots?: readonly string[];
}

/**
 * Reads the documentation set an MCP session serves.
 *
 * Pathnames are produced with the same routing rules the website uses, so a citation from
 * an agent resolves to a real page.
 */
export async function loadDocsMcpDocuments(
	options: LoadDocsMcpDocumentsOptions
): Promise<DocsAiDocument[]> {
	const cwd = options.cwd ?? process.cwd();
	const { config } = options;
	const routing = {
		basePath: config.routing.basePath,
		versionPrefix: config.routing.versionPrefix,
		localePrefix: config.routing.localePrefix,
		...(config.versions === undefined ? {} : { versions: config.versions }),
		...(config.i18n === undefined ? {} : { locales: config.i18n })
	};
	const versions = config.versions ? normalizeDocsVersions(config.versions).versions : [];
	const locales = config.i18n ? normalizeDocsLocales(config.i18n).locales : [];
	const roots: Array<{ root: string; version?: string; locale?: string }> = [];

	const contentRoots = versions.length > 0
		? versions.map((version) => ({
				root: resolve(cwd, version.source ?? config.content.directory),
				version: version.id
			}))
		: [{ root: resolve(cwd, config.content.directory) }];

	for (const contentRoot of contentRoots) {
		if (locales.length === 0) {
			roots.push(contentRoot);
			continue;
		}

		for (const locale of locales) {
			roots.push({
				...contentRoot,
				root: resolve(contentRoot.root, locale.source ?? locale.id),
				locale: locale.id
			});
		}
	}

	for (const extraRoot of options.extraRoots ?? []) {
		roots.push({ root: resolve(cwd, extraRoot) });
	}

	const documents: DocsAiDocument[] = [];

	for (const entry of roots) {
		let discovered;
		try {
			discovered = await discoverLocalContent({
				root: entry.root,
				...(entry.version === undefined ? {} : { version: entry.version }),
				...(entry.locale === undefined ? {} : { locale: entry.locale })
			});
		} catch {
			// A configured root that does not exist contributes nothing.
			continue;
		}

		for (const page of discovered) {
			documents.push(
				createDocsAiDocument({
					id: page.relativePath,
					pathname: createDocsPath(
						{
							slug: page.slug,
							...(entry.version === undefined ? {} : { version: entry.version }),
							...(entry.locale === undefined ? {} : { locale: entry.locale })
						},
						routing
					),
					source: await readFile(page.sourcePath, 'utf8'),
					...(entry.version === undefined ? {} : { version: entry.version }),
					...(entry.locale === undefined ? {} : { locale: entry.locale }),
					...(config.site.url === undefined ? {} : { siteUrl: config.site.url })
				})
			);
		}
	}

	return documents;
}
