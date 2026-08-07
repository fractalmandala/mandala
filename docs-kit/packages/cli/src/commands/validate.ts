import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import {
	createDocsManifest,
	formatDocsDiagnostic,
	validateDocs,
	type DiscoveredContent,
	type DocsResolvedConfig
} from '@docs-kit/core';
import { discoverLocalContent, discoverLocalSections } from '@docs-kit/core/discovery';

import { loadDocsConfig } from '../config-file.js';
import { booleanOption, report, stringOption, type DocsCliCommand } from '../runtime.js';

interface ResolvedRoot {
	root: string;
	version?: string;
	locale?: string;
}

/** Content roots implied by the configuration, including version and locale dimensions. */
export function resolveContentRoots(config: DocsResolvedConfig, cwd: string): ResolvedRoot[] {
	const versions = config.versions?.versions ?? config.versions?.available ?? [];
	const locales = config.i18n?.locales ?? [];
	const versionRoots =
		versions.length > 0
			? versions.map((version) => {
					const id = typeof version === 'string' ? version : version.id;
					const source =
						typeof version === 'string' ? config.content.directory : (version.source ?? config.content.directory);
					return { root: resolve(cwd, source), version: id };
				})
			: [{ root: resolve(cwd, config.content.directory) }];

	if (locales.length === 0) {
		return versionRoots;
	}

	return versionRoots.flatMap((versionRoot) =>
		locales.map((locale) => {
			const id = typeof locale === 'string' ? locale : locale.id;
			const source = typeof locale === 'string' ? id : (locale.source ?? locale.id);
			return { ...versionRoot, root: resolve(versionRoot.root, source), locale: id };
		})
	);
}

async function loadContent(roots: readonly ResolvedRoot[]): Promise<{
	content: DiscoveredContent[];
	sections: Awaited<ReturnType<typeof discoverLocalSections>>;
	missing: string[];
}> {
	const content: DiscoveredContent[] = [];
	const sections = [];
	const missing: string[] = [];

	for (const entry of roots) {
		if (!existsSync(entry.root)) {
			missing.push(entry.root);
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

	return { content, sections, missing };
}

/** `docs validate` — checks the documentation set and fails the build on errors. */
export const validateCommand: DocsCliCommand = {
	name: 'validate',
	summary: 'Check slugs, links, anchors, assets, and metadata.',
	usage: 'docs validate [--config <file>] [--assets <dir>] [--orphans] [--strict] [--json]',
	async run(args, context) {
		const { config } = await loadDocsConfig({
			cwd: context.cwd,
			...(stringOption(args, 'config') === undefined
				? {}
				: { configFile: stringOption(args, 'config') as string })
		});

		const roots = resolveContentRoots(config, context.cwd);
		const { content, sections, missing } = await loadContent(roots);

		if (content.length === 0) {
			context.writeError(
				`No documentation found in ${roots.map((entry) => entry.root).join(', ')}.`
			);
			return 1;
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

		const sources = new Map(
			manifest.pages.map((page) => [
				page.id,
				content.find(
					(entry) =>
						entry.relativePath === page.source.relativePath &&
						entry.version === page.version &&
						entry.locale === page.locale
				)?.raw ?? ''
			])
		);

		const assetsDir = stringOption(args, 'assets') ?? 'static';
		const assetRoot = resolve(context.cwd, assetsDir);
		const result = validateDocs({
			manifest,
			sources,
			reportOrphans: booleanOption(args, 'orphans'),
			...(existsSync(assetRoot)
				? { assetExists: (path: string) => existsSync(join(assetRoot, path.replace(/^\//, ''))) }
				: {})
		});

		const failOnWarnings = booleanOption(args, 'strict');
		report(
			context,
			args,
			{
				checked: result.checked,
				errors: result.errors.length,
				warnings: result.warnings.length,
				diagnostics: result.diagnostics,
				missingRoots: missing
			},
			[
				`Checked ${result.checked} page(s)`,
				...missing.map((root) => `  WARNING configured content root does not exist: ${root}`),
				...result.diagnostics.map((diagnostic) => formatDocsDiagnostic(diagnostic)),
				'',
				`${result.errors.length} error(s), ${result.warnings.length} warning(s)`
			]
		);

		return result.errors.length > 0 || (failOnWarnings && result.warnings.length > 0) ? 1 : 0;
	}
};
