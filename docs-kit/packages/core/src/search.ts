import type { DocsManifestPage } from '@docs-kit/core/manifest';
import { splitDocsFrontmatter, splitDocsSections } from '@docs-kit/core/markdown';

/** One indexable unit: a page, or a section within a page. */
export interface DocsSearchRecord {
	/** Stable record id: the page id, plus the heading anchor for section records. */
	id: string;
	pageId: string;
	/** Route to open for this result, including the heading anchor when there is one. */
	pathname: string;
	/** Page title, shown as the result group. */
	title: string;
	/** Section heading, absent for whole-page records. */
	section?: string;
	/** Heading trail from the page title down to this record. */
	headingPath: string[];
	description?: string;
	/** Plain text body, with Markdown syntax removed. */
	body: string;
	version?: string;
	locale?: string;
	/** Ranking hint: page records outrank their sections. */
	boost: number;
	tags: string[];
}

export interface CreateDocsSearchRecordsOptions {
	/** Raw document text keyed by page id. Pages without text produce title-only records. */
	sources?: ReadonlyMap<string, string>;
	/** Index hidden and draft pages. Defaults to false. */
	includeHidden?: boolean;
	/** Emit one record per heading section as well as the page record. Defaults to true. */
	sections?: boolean;
	/** Maximum characters of body text kept per record. Defaults to 2000. */
	maxBodyLength?: number;
}

const codeFencePattern = /^\s{0,3}(`{3,}|~{3,})/;

/**
 * Reduces Markdown to searchable prose.
 *
 * Code blocks, HTML, and link syntax are removed rather than indexed so a query matches
 * what a reader can see, and result excerpts stay readable.
 */
export function toSearchableText(markdown: string): string {
	const lines = splitDocsFrontmatter(markdown).body.split('\n');
	const kept: string[] = [];
	let fenceMarker: string | undefined;

	for (const line of lines) {
		const fence = codeFencePattern.exec(line)?.[1]?.[0];
		if (fence) {
			fenceMarker = fenceMarker === undefined ? fence : fenceMarker === fence ? undefined : fenceMarker;
			continue;
		}
		if (fenceMarker !== undefined) {
			continue;
		}

		kept.push(line);
	}

	return kept
		.join('\n')
		// Directive markers are structure, not prose; the label of a tab is worth keeping.
		.replace(/^\s*:{2,}[a-zA-Z][\w-]*\s*(\{[^\n]*\})?\s*$/gm, '')
		.replace(/^\s*:{2,}\s*$/gm, '')
		.replace(/^\s*@tab\s+(.+)$/gm, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/^\s{0,3}#{1,6}\s+/gm, '')
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/`([^`]*)`/g, '$1')
		.replace(/[*_~>]/g, '')
		.replace(/^\s{0,3}[-+*]\s+/gm, '')
		.replace(/&#\d+;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function truncate(text: string, maxLength: number): string {
	return text.length <= maxLength ? text : `${text.slice(0, maxLength).trimEnd()}…`;
}

function readTags(page: DocsManifestPage): string[] {
	const tags = page.frontmatter['tags'];
	if (Array.isArray(tags)) {
		return tags.filter((tag): tag is string => typeof tag === 'string');
	}
	return typeof tags === 'string' ? [tags] : [];
}

/**
 * Builds the records every search provider indexes.
 *
 * Records are produced from the manifest plus raw sources, so search, the site, and agent
 * surfaces always describe the same pages.
 */
export function createDocsSearchRecords(
	pages: readonly DocsManifestPage[],
	options: CreateDocsSearchRecordsOptions = {}
): DocsSearchRecord[] {
	const maxBodyLength = options.maxBodyLength ?? 2000;
	const includeSections = options.sections ?? true;
	const records: DocsSearchRecord[] = [];

	for (const page of pages) {
		if ((page.hidden || page.draft) && options.includeHidden !== true) {
			continue;
		}

		const source = options.sources?.get(page.id);
		const tags = readTags(page);
		const dimensions = {
			...(page.version === undefined ? {} : { version: page.version }),
			...(page.locale === undefined ? {} : { locale: page.locale })
		};

		records.push({
			id: page.id,
			pageId: page.id,
			pathname: page.pathname,
			title: page.title,
			headingPath: [page.title],
			...(page.description === undefined ? {} : { description: page.description }),
			body: truncate(source === undefined ? '' : toSearchableText(source), maxBodyLength),
			...dimensions,
			boost: 2,
			tags
		});

		if (!includeSections || source === undefined) {
			continue;
		}

		for (const section of splitDocsSections(splitDocsFrontmatter(source).body)) {
			const heading = section.heading;
			if (!heading || heading.depth === 1) {
				continue;
			}

			records.push({
				id: `${page.id}#${heading.id}`,
				pageId: page.id,
				pathname: `${page.pathname}#${heading.id}`,
				title: page.title,
				section: heading.text,
				// The page title and a level-one heading are the same thing; keep one.
				headingPath: [page.title, ...section.path, heading.text].filter(
					(entry, index, all) => entry !== all[index - 1]
				),
				body: truncate(toSearchableText(section.content), maxBodyLength),
				...dimensions,
				boost: 1,
				tags
			});
		}
	}

	return records;
}
