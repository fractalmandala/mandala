import {
	extractDocsHeadings,
	extractDocsTitle,
	splitDocsFrontmatter,
	type DocsHeading
} from '@docs-kit/core';

/** A documentation page prepared for agent consumption. */
export interface DocsAiDocument {
	id: string;
	pathname: string;
	title: string;
	description?: string;
	version?: string;
	locale?: string;
	/** Raw Markdown body without frontmatter. */
	body: string;
	headings: DocsHeading[];
	/** Absolute canonical URL when a site origin is configured. */
	url?: string;
	/** Pages excluded from public agent surfaces, for example drafts or private content. */
	hidden?: boolean;
	/** Arbitrary access tags evaluated by the host's access policy. */
	audiences?: string[];
}

export interface CreateAiDocumentOptions {
	id: string;
	pathname: string;
	source: string;
	title?: string;
	description?: string;
	version?: string;
	locale?: string;
	siteUrl?: string;
	hidden?: boolean;
	audiences?: readonly string[];
}

function readFrontmatterField(frontmatter: string, field: string): string | undefined {
	const pattern = new RegExp(`^${field}\\s*:\\s*(.+)$`, 'm');
	const value = pattern.exec(frontmatter)?.[1]?.trim();
	if (value === undefined) {
		return undefined;
	}

	return value.replace(/^['"]|['"]$/g, '');
}

/** Builds an agent-facing document from a page's raw Markdown. */
export function createDocsAiDocument(options: CreateAiDocumentOptions): DocsAiDocument {
	const { frontmatter, body } = splitDocsFrontmatter(options.source);
	const title =
		options.title ??
		readFrontmatterField(frontmatter, 'title') ??
		extractDocsTitle(options.source) ??
		options.pathname;
	const description = options.description ?? readFrontmatterField(frontmatter, 'description');
	const hidden =
		options.hidden ??
		(readFrontmatterField(frontmatter, 'hidden') === 'true' ||
			readFrontmatterField(frontmatter, 'draft') === 'true');
	let url: string | undefined;

	if (options.siteUrl !== undefined) {
		try {
			url = new URL(options.pathname, options.siteUrl).toString();
		} catch {
			url = undefined;
		}
	}

	return {
		id: options.id,
		pathname: options.pathname,
		title,
		...(description === undefined ? {} : { description }),
		...(options.version === undefined ? {} : { version: options.version }),
		...(options.locale === undefined ? {} : { locale: options.locale }),
		body: body.trim(),
		headings: extractDocsHeadings(options.source),
		...(url === undefined ? {} : { url }),
		...(hidden ? { hidden: true } : {}),
		...(options.audiences === undefined ? {} : { audiences: [...options.audiences] })
	};
}

/** Dimension and visibility filters shared by every agent surface. */
export interface DocsAiFilter {
	version?: string;
	locale?: string;
	/** Include hidden and draft pages. Defaults to false. */
	includeHidden?: boolean;
	/** Audiences the caller is entitled to. Pages tagged otherwise are excluded. */
	audiences?: readonly string[];
}

/**
 * Applies dimension and access filters.
 *
 * Access is enforced here rather than in each surface, so MCP tools, Ask AI, and generated
 * files can never disagree about what a caller may see.
 */
export function filterDocsAiDocuments(
	documents: readonly DocsAiDocument[],
	filter: DocsAiFilter = {}
): DocsAiDocument[] {
	return documents.filter((document) => {
		if (filter.version !== undefined && document.version !== filter.version) {
			return false;
		}
		if (filter.locale !== undefined && document.locale !== filter.locale) {
			return false;
		}
		if (document.hidden && filter.includeHidden !== true) {
			return false;
		}
		if (document.audiences && document.audiences.length > 0) {
			const allowed = filter.audiences ?? [];
			return document.audiences.some((audience) => allowed.includes(audience));
		}

		return true;
	});
}
