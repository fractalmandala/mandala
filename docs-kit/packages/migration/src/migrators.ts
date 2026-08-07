import type { DocsConfig } from '@docs-kit/core';

import { convertMarkdown, type ConvertMarkdownOptions } from './components.js';
import type { MigrationFileSystem } from './filesystem.js';
import type { FrontmatterValue } from './frontmatter.js';
import {
	parseMetaNavigation,
	parseMkDocsNavigation,
	parseSummaryNavigation,
	type MigratedNavigationNode
} from './navigation.js';
import type { MigrationReport } from './report.js';

export type MigrationSourceId =
	| 'svocs'
	| 'blume'
	| 'fumadocs'
	| 'starlight'
	| 'docusaurus'
	| 'vitepress'
	| 'mkdocs'
	| 'mdbook';

export interface MigrationContext {
	fs: MigrationFileSystem;
	report: MigrationReport;
}

export interface DocsMigrator {
	id: MigrationSourceId;
	label: string;
	/** Files whose presence identifies the source framework, most specific first. */
	markers: string[];
	/** Candidate documentation directories, in priority order. */
	contentRoots: string[];
	/** Markdown conversion behaviour for this framework. */
	markdown: Omit<ConvertMarkdownOptions, 'file' | 'report'>;
	/** Frontmatter keys renamed on the way in. */
	frontmatterMap: Record<string, string>;
	/** Frontmatter keys deliberately dropped, reported as notes. */
	frontmatterDrop?: string[];
	config(context: MigrationContext): Promise<Partial<DocsConfig>>;
	navigation?(context: MigrationContext): Promise<MigratedNavigationNode[]>;
}

function readJson(source: string | undefined): Record<string, unknown> | undefined {
	if (source === undefined) {
		return undefined;
	}

	try {
		const parsed: unknown = JSON.parse(source);
		return parsed !== null && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : undefined;
	} catch {
		return undefined;
	}
}

/**
 * Extracts simple `key: 'value'` pairs from a JavaScript or TypeScript configuration.
 *
 * A migration never executes source-project code, so only literal values are recovered and
 * everything else is reported for manual review.
 */
function readLiteral(source: string | undefined, key: string): string | undefined {
	if (source === undefined) {
		return undefined;
	}

	const match = new RegExp(`\\b${key}\\s*:\\s*(?:'([^']*)'|"([^"]*)"|\`([^\`]*)\`)`).exec(source);
	return match?.[1] ?? match?.[2] ?? match?.[3];
}

function readYamlScalar(source: string | undefined, key: string): string | undefined {
	if (source === undefined) {
		return undefined;
	}

	const match = new RegExp(`^${key}\\s*:\\s*(.+)$`, 'm').exec(source);
	return match?.[1]?.trim().replace(/^['"]|['"]$/g, '');
}

async function firstExisting(
	fs: MigrationFileSystem,
	paths: readonly string[]
): Promise<{ path: string; content: string } | undefined> {
	for (const path of paths) {
		const content = await fs.read(path);
		if (content !== undefined) {
			return { path, content };
		}
	}

	return undefined;
}

function noteUnconvertedConfig(
	context: MigrationContext,
	file: string,
	message: string
): void {
	context.report.add({
		severity: 'warning',
		code: 'CONFIG_NEEDS_REVIEW',
		file,
		message
	});
}

const docusaurus: DocsMigrator = {
	id: 'docusaurus',
	label: 'Docusaurus',
	markers: ['docusaurus.config.js', 'docusaurus.config.ts', 'docusaurus.config.mjs'],
	contentRoots: ['docs'],
	markdown: { stripMdxStatements: true },
	frontmatterMap: {
		sidebar_label: 'label',
		sidebar_position: 'order',
		slug: 'slug',
		title: 'title',
		description: 'description',
		draft: 'draft',
		tags: 'tags'
	},
	frontmatterDrop: ['id', 'sidebar_class_name', 'pagination_next', 'pagination_prev'],
	async config(context) {
		const found = await firstExisting(context.fs, this.markers);
		if (!found) {
			return {};
		}

		noteUnconvertedConfig(
			context,
			found.path,
			'Only the site title, tagline, and URL were converted. Presets, plugins, themes, and navbar items need to be re-expressed as docs-kit configuration or host routes.'
		);

		return {
			site: {
				title: readLiteral(found.content, 'title') ?? 'Documentation',
				...(readLiteral(found.content, 'tagline') === undefined
					? {}
					: { description: readLiteral(found.content, 'tagline') as string }),
				...(readLiteral(found.content, 'url') === undefined
					? {}
					: { url: readLiteral(found.content, 'url') as string })
			},
			routing: { basePath: '/docs' }
		};
	},
	async navigation(context) {
		const sidebars = await firstExisting(context.fs, ['sidebars.js', 'sidebars.ts', 'sidebars.json']);
		if (!sidebars) {
			return [];
		}
		if (sidebars.path.endsWith('.json')) {
			return parseMetaNavigation(sidebars.content);
		}

		context.report.add({
			severity: 'warning',
			code: 'NAVIGATION_NEEDS_REVIEW',
			file: sidebars.path,
			message:
				'Sidebar definitions are JavaScript and were not executed. Navigation was regenerated from the file tree; re-apply any manual ordering.'
		});
		return [];
	}
};

const vitepress: DocsMigrator = {
	id: 'vitepress',
	label: 'VitePress',
	markers: ['.vitepress/config.ts', '.vitepress/config.js', '.vitepress/config.mts'],
	contentRoots: ['docs', '.'],
	markdown: {},
	frontmatterMap: { title: 'title', description: 'description', order: 'order', editLink: 'editLink' },
	frontmatterDrop: ['layout', 'outline', 'aside', 'hero', 'features'],
	async config(context) {
		const found = await firstExisting(context.fs, this.markers);
		if (!found) {
			return {};
		}

		noteUnconvertedConfig(
			context,
			found.path,
			'Only the site title and description were converted. Theme config, sidebar, and nav must be re-expressed in docs-kit configuration.'
		);

		return {
			site: {
				title: readLiteral(found.content, 'title') ?? 'Documentation',
				...(readLiteral(found.content, 'description') === undefined
					? {}
					: { description: readLiteral(found.content, 'description') as string })
			}
		};
	}
};

const mkdocs: DocsMigrator = {
	id: 'mkdocs',
	label: 'MkDocs',
	markers: ['mkdocs.yml', 'mkdocs.yaml'],
	contentRoots: ['docs'],
	markdown: { mkdocsAdmonitions: true },
	frontmatterMap: { title: 'title', description: 'description' },
	async config(context) {
		const found = await firstExisting(context.fs, this.markers);
		if (!found) {
			return {};
		}

		return {
			site: {
				title: readYamlScalar(found.content, 'site_name') ?? 'Documentation',
				...(readYamlScalar(found.content, 'site_description') === undefined
					? {}
					: { description: readYamlScalar(found.content, 'site_description') as string }),
				...(readYamlScalar(found.content, 'site_url') === undefined
					? {}
					: { url: readYamlScalar(found.content, 'site_url') as string }),
				...(readYamlScalar(found.content, 'repo_url') === undefined
					? {}
					: { repository: readYamlScalar(found.content, 'repo_url') as string })
			}
		};
	},
	async navigation(context) {
		const found = await firstExisting(context.fs, this.markers);
		return found ? parseMkDocsNavigation(found.content) : [];
	}
};

const mdbook: DocsMigrator = {
	id: 'mdbook',
	label: 'mdBook',
	markers: ['book.toml'],
	contentRoots: ['src'],
	markdown: {},
	frontmatterMap: {},
	async config(context) {
		const found = await firstExisting(context.fs, this.markers);
		if (!found) {
			return {};
		}

		const title = /^\s*title\s*=\s*"([^"]*)"/m.exec(found.content)?.[1];
		const description = /^\s*description\s*=\s*"([^"]*)"/m.exec(found.content)?.[1];

		return {
			site: {
				title: title ?? 'Documentation',
				...(description === undefined ? {} : { description })
			}
		};
	},
	async navigation(context) {
		const summary = await context.fs.read('src/SUMMARY.md');
		return summary === undefined ? [] : parseSummaryNavigation(summary);
	}
};

const starlight: DocsMigrator = {
	id: 'starlight',
	label: 'Starlight',
	markers: ['astro.config.mjs', 'astro.config.ts', 'astro.config.js'],
	contentRoots: ['src/content/docs'],
	markdown: { stripMdxStatements: true },
	frontmatterMap: {
		title: 'title',
		description: 'description',
		slug: 'slug',
		draft: 'draft',
		template: 'template'
	},
	frontmatterDrop: ['hero', 'banner', 'prev', 'next', 'tableOfContents'],
	async config(context) {
		const found = await firstExisting(context.fs, this.markers);
		if (!found) {
			return {};
		}

		noteUnconvertedConfig(
			context,
			found.path,
			'Only the Starlight site title was converted. Sidebar, social links, and integrations need to be re-expressed for docs-kit.'
		);

		return {
			site: { title: readLiteral(found.content, 'title') ?? 'Documentation' },
			content: { directory: 'src/lib/docs' }
		};
	}
};

const fumadocs: DocsMigrator = {
	id: 'fumadocs',
	label: 'Fumadocs',
	markers: ['source.config.ts', 'source.config.js'],
	contentRoots: ['content/docs'],
	markdown: { stripMdxStatements: true },
	frontmatterMap: {
		title: 'title',
		description: 'description',
		icon: 'icon',
		full: 'full'
	},
	async config(context) {
		const packageJson = readJson(await context.fs.read('package.json'));

		return {
			site: { title: typeof packageJson?.['name'] === 'string' ? packageJson['name'] : 'Documentation' }
		};
	},
	async navigation(context) {
		const files = await context.fs.list('content/docs');
		const metaFiles = files.filter((file) => /(^|\/)_?meta\.json$/.test(file));
		const nodes: MigratedNavigationNode[] = [];

		for (const file of metaFiles) {
			const content = await context.fs.read(file);
			if (content !== undefined) {
				nodes.push(...parseMetaNavigation(content));
			}
		}

		return nodes;
	}
};

const blume: DocsMigrator = {
	id: 'blume',
	label: 'Blume',
	markers: ['blume.config.ts', 'blume.config.js', 'blume.config.mjs'],
	contentRoots: ['content', 'docs'],
	markdown: { stripMdxStatements: true },
	frontmatterMap: {
		title: 'title',
		description: 'description',
		icon: 'icon',
		order: 'order',
		label: 'label',
		badge: 'badge'
	},
	async config(context) {
		const found = await firstExisting(context.fs, this.markers);
		if (!found) {
			return {};
		}

		noteUnconvertedConfig(
			context,
			found.path,
			'Search providers, AI options, and theme tokens were not converted. Re-declare the ones you use in docs.config.'
		);

		return {
			site: {
				title: readLiteral(found.content, 'title') ?? 'Documentation',
				...(readLiteral(found.content, 'description') === undefined
					? {}
					: { description: readLiteral(found.content, 'description') as string }),
				...(readLiteral(found.content, 'url') === undefined
					? {}
					: { url: readLiteral(found.content, 'url') as string })
			}
		};
	}
};

const svocs: DocsMigrator = {
	id: 'svocs',
	label: 'Svocs',
	markers: ['svocs.config.ts', 'svocs.config.js'],
	contentRoots: ['src/docs', 'src/content/docs'],
	markdown: {},
	frontmatterMap: {
		title: 'title',
		description: 'description',
		sidebar: 'label',
		order: 'order'
	},
	async config(context) {
		const found = await firstExisting(context.fs, this.markers);
		if (!found) {
			return {};
		}

		return {
			site: {
				title: readLiteral(found.content, 'title') ?? 'Documentation',
				...(readLiteral(found.content, 'description') === undefined
					? {}
					: { description: readLiteral(found.content, 'description') as string })
			}
		};
	}
};

/** Every supported migration source, checked in this order during detection. */
export const docsMigrators: DocsMigrator[] = [
	svocs,
	blume,
	fumadocs,
	starlight,
	docusaurus,
	vitepress,
	mkdocs,
	mdbook
];

export function findDocsMigrator(id: MigrationSourceId): DocsMigrator | undefined {
	return docsMigrators.find((migrator) => migrator.id === id);
}

/** Detects the source framework from the files present in the project. */
export async function detectDocsMigrator(
	fs: MigrationFileSystem
): Promise<DocsMigrator | undefined> {
	for (const migrator of docsMigrators) {
		for (const marker of migrator.markers) {
			if (await fs.exists(marker)) {
				return migrator;
			}
		}
	}

	return undefined;
}

/** Applies a migrator's frontmatter mapping, reporting keys it does not know. */
export function mapFrontmatter(
	migrator: DocsMigrator,
	data: Record<string, FrontmatterValue>,
	file: string,
	report: MigrationReport
): Record<string, FrontmatterValue> {
	const mapped: Record<string, FrontmatterValue> = {};

	for (const [key, value] of Object.entries(data)) {
		const target = migrator.frontmatterMap[key];
		if (target !== undefined) {
			mapped[target] = value;
			continue;
		}
		if (migrator.frontmatterDrop?.includes(key)) {
			report.add({
				severity: 'info',
				code: 'FRONTMATTER_UNMAPPED',
				file,
				message: `Dropped ${migrator.label}-specific frontmatter key "${key}".`,
				snippet: `${key}: ${JSON.stringify(value)}`
			});
			continue;
		}

		mapped[key] = value;
		report.add({
			severity: 'info',
			code: 'FRONTMATTER_UNMAPPED',
			file,
			message: `Kept unrecognized frontmatter key "${key}" unchanged.`
		});
	}

	return mapped;
}

export { convertMarkdown };
