import { filterDocsAiDocuments, type DocsAiDocument, type DocsAiFilter } from './documents.js';

export interface DocsLlmsSite {
	title: string;
	description?: string;
	/** Absolute site origin. Links become absolute when supplied. */
	url?: string;
}

export interface DocsLlmsSection {
	/** Heading the pages appear under. */
	label: string;
	/** Pathname prefix selecting the pages, for example `/docs/guides`. */
	prefix?: string;
	/** Explicit page ids, used when a prefix is not enough. */
	pages?: readonly string[];
}

export interface CreateLlmsTxtOptions {
	site: DocsLlmsSite;
	filter?: DocsAiFilter;
	/** Section grouping. Defaults to grouping by the first path segment below the base path. */
	sections?: readonly DocsLlmsSection[];
	/** Mount path, used to derive default section names. */
	basePath?: string;
	/** Link to each page's raw Markdown as well as its page. Defaults to true. */
	rawMarkdown?: boolean;
	/** Suffix appended to a pathname to reach its raw Markdown. Defaults to `.md`. */
	rawSuffix?: string;
	/** Extra links appended under an `Optional` heading. */
	optional?: readonly { label: string; href: string; description?: string }[];
}

function absolute(pathname: string, siteUrl: string | undefined): string {
	if (siteUrl === undefined) {
		return pathname;
	}

	try {
		return new URL(pathname, siteUrl).toString();
	} catch {
		return pathname;
	}
}

function sectionLabel(pathname: string, basePath: string): string {
	const rest = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
	const segment = rest.split('/').filter(Boolean)[0];

	if (segment === undefined) {
		return 'Overview';
	}

	return segment
		.replace(/[-_]+/g, ' ')
		.replace(/^\p{Letter}/u, (character) => character.toUpperCase());
}

function documentLine(
	document: DocsAiDocument,
	options: CreateLlmsTxtOptions
): string {
	const href = absolute(document.pathname, options.site.url);
	const raw =
		options.rawMarkdown === false
			? ''
			: ` ([Markdown](${absolute(`${document.pathname}${options.rawSuffix ?? '.md'}`, options.site.url)}))`;
	const description = document.description ? `: ${document.description}` : '';

	return `- [${document.title}](${href})${raw}${description}`;
}

/**
 * Builds `llms.txt`: a concise, link-first index of the documentation.
 *
 * Ordering is deterministic and hidden or draft pages are excluded, so the file is stable
 * across builds and never exposes unpublished content.
 */
export function createLlmsTxt(
	documents: readonly DocsAiDocument[],
	options: CreateLlmsTxtOptions
): string {
	const visible = filterDocsAiDocuments(documents, options.filter ?? {}).sort((left, right) =>
		left.pathname.localeCompare(right.pathname)
	);
	const basePath = options.basePath ?? '/docs';
	const lines = [`# ${options.site.title}`, ''];

	if (options.site.description) {
		lines.push(`> ${options.site.description}`, '');
	}

	if (options.sections && options.sections.length > 0) {
		const used = new Set<string>();

		for (const section of options.sections) {
			const matched = visible.filter(
				(document) =>
					(section.pages?.includes(document.id) ?? false) ||
					(section.prefix !== undefined && document.pathname.startsWith(section.prefix))
			);
			if (matched.length === 0) {
				continue;
			}

			lines.push(`## ${section.label}`, '');
			for (const document of matched) {
				used.add(document.id);
				lines.push(documentLine(document, options));
			}
			lines.push('');
		}

		const remaining = visible.filter((document) => !used.has(document.id));
		if (remaining.length > 0) {
			lines.push('## Other', '');
			for (const document of remaining) {
				lines.push(documentLine(document, options));
			}
			lines.push('');
		}
	} else {
		const grouped = new Map<string, DocsAiDocument[]>();
		for (const document of visible) {
			const label = sectionLabel(document.pathname, basePath);
			grouped.set(label, [...(grouped.get(label) ?? []), document]);
		}

		for (const [label, group] of [...grouped.entries()].sort(([left], [right]) =>
			left === 'Overview' ? -1 : right === 'Overview' ? 1 : left.localeCompare(right)
		)) {
			lines.push(`## ${label}`, '');
			for (const document of group) {
				lines.push(documentLine(document, options));
			}
			lines.push('');
		}
	}

	if (options.optional && options.optional.length > 0) {
		lines.push('## Optional', '');
		for (const link of options.optional) {
			lines.push(`- [${link.label}](${link.href})${link.description ? `: ${link.description}` : ''}`);
		}
		lines.push('');
	}

	return `${lines.join('\n').trimEnd()}\n`;
}

export interface CreateLlmsFullTxtOptions {
	site: DocsLlmsSite;
	filter?: DocsAiFilter;
	/**
	 * Maximum characters per file. Content is never truncated mid-page: a page that would
	 * overflow starts the next part instead.
	 */
	maxCharacters?: number;
	/** Include the source URL above each document. Defaults to true. */
	sourceUrls?: boolean;
}

export interface DocsLlmsFullPart {
	/** 1-based part number. */
	part: number;
	/** Total parts, so a reader knows whether more exist. */
	parts: number;
	content: string;
	/** Page ids included in this part. */
	pageIds: string[];
}

/**
 * Builds `llms-full.txt`: every page's Markdown, in navigation-stable order.
 *
 * Large sites partition into numbered parts rather than silently dropping content, and each
 * document carries its canonical URL so an agent can cite it.
 */
export function createLlmsFullTxtParts(
	documents: readonly DocsAiDocument[],
	options: CreateLlmsFullTxtOptions
): DocsLlmsFullPart[] {
	const visible = filterDocsAiDocuments(documents, options.filter ?? {}).sort((left, right) =>
		left.pathname.localeCompare(right.pathname)
	);
	const maxCharacters = options.maxCharacters ?? Number.POSITIVE_INFINITY;
	const header = `# ${options.site.title}\n\n${options.site.description ? `> ${options.site.description}\n\n` : ''}`;

	const blocks = visible.map((document) => {
		const url = absolute(document.pathname, options.site.url);
		const meta = [
			// A document that writes its own level-one heading keeps it, so the output never
			// shows the title twice.
			hasOwnTitleHeading(document) ? '' : `# ${document.title}`,
			options.sourceUrls === false ? '' : `Source: ${url}`,
			document.description ? `Description: ${document.description}` : '',
			document.version ? `Version: ${document.version}` : '',
			document.locale ? `Locale: ${document.locale}` : ''
		].filter(Boolean);

		return { id: document.id, text: `${meta.filter(Boolean).join('\n')}\n\n${document.body}\n` };
	});

	const parts: DocsLlmsFullPart[] = [];
	let current: { pageIds: string[]; chunks: string[]; length: number } = {
		pageIds: [],
		chunks: [],
		length: header.length
	};

	for (const block of blocks) {
		if (current.chunks.length > 0 && current.length + block.text.length > maxCharacters) {
			parts.push({
				part: parts.length + 1,
				parts: 0,
				content: `${header}${current.chunks.join('\n---\n\n')}`,
				pageIds: current.pageIds
			});
			current = { pageIds: [], chunks: [], length: header.length };
		}

		current.chunks.push(block.text);
		current.pageIds.push(block.id);
		current.length += block.text.length;
	}

	if (current.chunks.length > 0 || parts.length === 0) {
		parts.push({
			part: parts.length + 1,
			parts: 0,
			content: `${header}${current.chunks.join('\n---\n\n')}`,
			pageIds: current.pageIds
		});
	}

	return parts.map((part) => ({ ...part, parts: parts.length }));
}

/** Builds `llms-full.txt` as a single document. */
export function createLlmsFullTxt(
	documents: readonly DocsAiDocument[],
	options: CreateLlmsFullTxtOptions = { site: { title: 'Documentation' } }
): string {
	return createLlmsFullTxtParts(documents, options)[0]?.content ?? '';
}

/** True when the body already opens with its own level-one heading. */
function hasOwnTitleHeading(document: DocsAiDocument): boolean {
	return document.headings.some((heading) => heading.depth === 1);
}

/** Raw-Markdown response body for a page, with its canonical source noted. */
export function createRawMarkdown(
	document: DocsAiDocument,
	options: { site?: DocsLlmsSite; sourceUrl?: boolean } = {}
): string {
	const url = document.url ?? absolute(document.pathname, options.site?.url);
	const header = options.sourceUrl === false ? '' : `<!-- Source: ${url} -->\n\n`;
	const title = hasOwnTitleHeading(document) ? '' : `# ${document.title}\n\n`;

	return `${header}${title}${document.body}\n`;
}
