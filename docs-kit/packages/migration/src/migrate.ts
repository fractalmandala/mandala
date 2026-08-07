import { mkdir, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { resolveDocsConfig, type DocsConfig } from '@docs-kit/core';

import { convertMarkdown } from './components.js';
import { createNodeMigrationFileSystem, type MigrationFileSystem } from './filesystem.js';
import { parseFrontmatter, serializeFrontmatter } from './frontmatter.js';
import {
	detectDocsMigrator,
	findDocsMigrator,
	mapFrontmatter,
	type DocsMigrator,
	type MigrationSourceId
} from './migrators.js';
import type { MigratedNavigationNode } from './navigation.js';
import { MigrationReport, type MigrationDiagnostic } from './report.js';

export interface MigrationOutputFile {
	/** Path relative to the migration output directory. */
	path: string;
	content: string;
}

export interface MigrationResult {
	source: MigrationSourceId;
	label: string;
	config: DocsConfig;
	files: MigrationOutputFile[];
	navigation: MigratedNavigationNode[];
	diagnostics: MigrationDiagnostic[];
	/** The Markdown review report a migration always produces. */
	reviewReport: string;
}

export interface MigrateDocsOptions {
	/** Source project root. Never modified. */
	cwd?: string;
	/** Explicit source framework. Detected when omitted. */
	source?: MigrationSourceId;
	/** Documentation directory in the output, relative to the project. */
	contentDirectory?: string;
	/** Custom file system, used by fixtures and tests. */
	fs?: MigrationFileSystem;
}

const documentPattern = /\.(md|mdx|markdown|svx)$/i;

function toOutputPath(relativePath: string, contentRoot: string, contentDirectory: string): string {
	const withoutRoot =
		contentRoot === '.' || contentRoot === ''
			? relativePath
			: relativePath.slice(contentRoot.length + 1);

	return `${contentDirectory}/${withoutRoot.replace(documentPattern, '.md')}`;
}

async function resolveContentRoot(
	migrator: DocsMigrator,
	fs: MigrationFileSystem
): Promise<string | undefined> {
	for (const candidate of migrator.contentRoots) {
		const files = await fs.list(candidate);
		if (files.some((file) => documentPattern.test(file))) {
			return candidate;
		}
	}

	return undefined;
}

/**
 * Converts a documentation project without touching it.
 *
 * The result is a plan: converted files, configuration, navigation, and a review report.
 * Nothing is written until `writeMigration` is called with an explicit output directory.
 */
export async function migrateDocs(options: MigrateDocsOptions = {}): Promise<MigrationResult> {
	const cwd = options.cwd ?? process.cwd();
	const fs = options.fs ?? createNodeMigrationFileSystem(cwd);
	const report = new MigrationReport();
	const migrator = options.source ? findDocsMigrator(options.source) : await detectDocsMigrator(fs);

	if (!migrator) {
		throw new Error(
			'Could not detect the documentation framework. Pass an explicit source, one of: svocs, blume, fumadocs, starlight, docusaurus, vitepress, mkdocs, mdbook.'
		);
	}

	const context = { fs, report };
	const partialConfig = await migrator.config(context);
	const contentDirectory =
		options.contentDirectory ?? partialConfig.content?.directory ?? 'src/lib/docs';
	const config: DocsConfig = {
		site: partialConfig.site ?? { title: 'Documentation' },
		...partialConfig,
		content: { directory: contentDirectory }
	};

	// Validate the produced configuration so a migration cannot emit something unusable.
	resolveDocsConfig(config);

	const contentRoot = await resolveContentRoot(migrator, fs);
	const files: MigrationOutputFile[] = [];

	if (contentRoot === undefined) {
		report.add({
			severity: 'error',
			code: 'SOURCE_NOT_DETECTED',
			message: `No documentation files were found in ${migrator.label}'s expected directories (${migrator.contentRoots.join(', ')}).`
		});
	} else {
		for (const file of await fs.list(contentRoot)) {
			if (!documentPattern.test(file)) {
				continue;
			}

			const source = await fs.read(file);
			if (source === undefined) {
				continue;
			}

			const { data, body, unparsed } = parseFrontmatter(source);
			for (const entry of unparsed) {
				report.add({
					severity: 'warning',
					code: 'FRONTMATTER_UNMAPPED',
					file,
					line: entry.line,
					message: 'Frontmatter line could not be parsed and was dropped. Re-add it manually.',
					snippet: entry.text
				});
			}

			const frontmatter = mapFrontmatter(migrator, data, file, report);
			const converted = convertMarkdown(body, { ...migrator.markdown, file, report });

			files.push({
				path: toOutputPath(file, contentRoot, contentDirectory),
				content: `${serializeFrontmatter(frontmatter)}${
					serializeFrontmatter(frontmatter) === '' ? '' : '\n'
				}${converted.trimStart()}`
			});
			report.add({
				severity: 'info',
				code: 'CONTENT_CONVERTED',
				file,
				message: `Converted to ${toOutputPath(file, contentRoot, contentDirectory)}.`
			});
		}
	}

	const navigation = (await migrator.navigation?.(context)) ?? [];
	if (navigation.length > 0) {
		report.add({
			severity: 'info',
			code: 'NAVIGATION_EXTRACTED',
			message: `Extracted ${navigation.length} top-level navigation entries into navigation.json.`
		});
	}

	files.push({
		path: 'docs.config.json',
		content: `${JSON.stringify(config, null, '\t')}\n`
	});
	if (navigation.length > 0) {
		files.push({
			path: 'navigation.json',
			content: `${JSON.stringify(navigation, null, '\t')}\n`
		});
	}

	const reviewReport = report.render(`${migrator.label} migration report`);
	files.push({ path: 'MIGRATION-REPORT.md', content: reviewReport });

	return {
		source: migrator.id,
		label: migrator.label,
		config,
		files: files.sort((left, right) => left.path.localeCompare(right.path)),
		navigation,
		diagnostics: report.diagnostics,
		reviewReport
	};
}

export interface WriteMigrationOptions {
	/** Output directory. Created if missing; existing files are never overwritten silently. */
	outDir: string;
	cwd?: string;
	/** Overwrite files that already exist. Defaults to false. */
	force?: boolean;
}

export interface WriteMigrationSummary {
	outDir: string;
	written: string[];
	skipped: string[];
}

async function exists(path: string): Promise<boolean> {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * Writes a migration plan to a new directory.
 * The source project is never modified, and existing output files are skipped unless
 * `force` is set, so a re-run cannot destroy manual edits.
 */
export async function writeMigration(
	result: MigrationResult,
	options: WriteMigrationOptions
): Promise<WriteMigrationSummary> {
	const outDir = resolve(options.cwd ?? process.cwd(), options.outDir);
	const written: string[] = [];
	const skipped: string[] = [];

	for (const file of result.files) {
		const target = join(outDir, file.path);
		if (!options.force && (await exists(target))) {
			skipped.push(file.path);
			continue;
		}

		await mkdir(dirname(target), { recursive: true });
		const temporaryPath = `${target}.tmp`;
		await writeFile(temporaryPath, file.content, 'utf8');
		await rename(temporaryPath, target);
		written.push(file.path);
	}

	return { outDir, written, skipped };
}
