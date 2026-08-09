import GithubSlugger from 'github-slugger';
import contentDates from 'virtual:svocs-content-dates';
import type { SearchDocument } from '$lib/search/types';
import { renderMarkdownWithToc } from '$lib/content/parse';
import {
	listAgents,
	listBossEntries,
	listCommands,
	listDocs,
	listSkills
} from '$lib/content/catalog';
import { listDocsInSequence } from '$lib/content/nav';

export type MetaItemConfig = {
	title?: string;
	order?: number;
	/** Name from the curated icon set ($lib/icons/icon-set.ts). Wins over a
	 *  page's own frontmatter icon; see applyMetaFallback. */
	icon?: string;
	/** Separators are virtual sidebar headings with no backing file, so
	 *  `title` and `order` are required. */
	type?: 'separator';
};

export type ContentSummary = {
	slug: string;
	path: string;
	title: string;
	description?: string;
	order: number;
	tags: string[];
	wordCount: number;
	readingTimeMinutes: number;
	/** Last git commit date for the source file (YYYY-MM-DD), when known. */
	lastModified?: string;
	/** Name from the curated icon set ($lib/icons/icon-set.ts). */
	icon?: string;
	/** Repo-relative source path, e.g. `packages/fractal-agentic/docs/foo.md` — backs "Edit on GitHub". */
	sourcePath: string;
};

export type TocItem = {
	id: string;
	text: string;
	depth: 2 | 3;
};

/** Unstripped markdown source for llms.txt and the per-page .md route. */
export type LlmsDocument = {
	slug: string;
	url: string;
	title: string;
	description?: string;
	raw: string;
};

const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

/** '2026-07-17' -> 'July 17, 2026'. Date-only, so no timezone drift. */
export function formatLastUpdated(isoDate: string): string {
	const [year, month, day] = isoDate.split('-').map(Number);
	return `${MONTHS[month - 1]} ${day}, ${year}`;
}

function routeFromSlug(slug: string): string {
	return slug ? `/docs/${slug}` : '/docs';
}

function extractTocFromMarkdown(raw: string): TocItem[] {
	const lines = raw.split(/\r?\n/);
	const toc: TocItem[] = [];
	// Same slugger rehype-slug uses, so TOC ids always match rendered heading
	// ids (including underscore handling and duplicate-heading suffixes).
	const slugger = new GithubSlugger();
	let inCodeFence = false;

	for (const line of lines) {
		if (/^```/.test(line.trim())) {
			inCodeFence = !inCodeFence;
			continue;
		}

		if (inCodeFence) {
			continue;
		}

		const match = line.match(/^(#{2,3})\s+(.+)$/);
		if (!match) {
			continue;
		}

		const depth = match[1].length as 2 | 3;
		// Strip markdown link syntax: rehype-slug ids come from the rendered
		// text, so the slugger must see "Datadog", not "[Datadog](https://…)".
		const text = match[2].trim().replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
		const id = slugger.slug(text);

		if (!id) {
			continue;
		}

		toc.push({ id, text, depth });
	}

	return toc;
}

function stripMarkdownToText(raw: string): string {
	const lines = raw.split(/\r?\n/);
	let inCodeFence = false;
	let text = '';

	for (const line of lines) {
		if (/^```/.test(line.trim())) {
			inCodeFence = !inCodeFence;
			continue;
		}

		if (inCodeFence) {
			continue;
		}

		text += ` ${line.replace(/[`*_#[\]()<>-]/g, ' ')}`;
	}

	return text.replace(/\s+/g, ' ').trim();
}

function extractWordCount(raw: string): number {
	const lines = raw.split(/\r?\n/);
	let inCodeFence = false;
	let text = '';

	for (const line of lines) {
		if (/^```/.test(line.trim())) {
			inCodeFence = !inCodeFence;
			continue;
		}

		if (inCodeFence) {
			continue;
		}

		text += ` ${line.replace(/[`*_#[\]()<>-]/g, ' ')}`;
	}

	const words = text.trim().split(/\s+/).filter(Boolean);

	return words.length;
}

/** Directory `_meta.json` sidecars no longer apply — content is sourced from
 *  the package, which carries no site sidebar metadata. Keep the signature so
 *  consumers (docs layout, llms.txt) compile unchanged. */
export function loadMetaByDirectory(): Map<string, Record<string, MetaItemConfig>> {
	return new Map();
}

/**
 * All content summaries in reading order (DOCS_SEQUENCE, then any stragglers
 * alphabetically). Docs are sourced from `packages/fractal-agentic` via the
 * catalog — the site's own `content/` folder is no longer the source of truth.
 */
export function getAllContentSummaries(): ContentSummary[] {
	return listDocsInSequence().map((entry, index) => {
		const wordCount = extractWordCount(entry.body);
		return {
			slug: entry.slug,
			path: routeFromSlug(entry.slug),
			title: entry.title,
			description: entry.description,
			order: index,
			tags: [],
			wordCount,
			readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
			lastModified: entry.sourcePath ? contentDates[entry.sourcePath] : undefined,
			icon: undefined,
			sourcePath: entry.sourcePath ?? `packages/fractal-agentic/docs/${entry.slug}.md`
		};
	});
}

export function getDocsEntries(): ContentSummary[] {
	return getAllContentSummaries();
}

export function getDocEntryBySlug(slugParts: string[]): ContentSummary | null {
	const slug = slugParts.join('/');
	return getDocsEntries().find((entry) => entry.slug === slug) ?? null;
}

/**
 * Render one doc page's markdown body to HTML with an "On this page" TOC.
 * Relative links resolve from the source file's real repo directory (so
 * `../agent/INDEX.md` inside `docs/bosses/creator/` lands on the right boss),
 * while core root docs (AGENTS.md, SOUL.md, …) keep the generic rewrites.
 */
export async function renderDocEntry(entry: ContentSummary): Promise<{
	html: string;
	toc: TocItem[];
}> {
	const doc = listDocs().find((d) => d.slug === entry.slug);
	if (!doc) {
		return { html: '', toc: [] };
	}

	const m = doc.sourcePath?.match(/packages\/fractal-agentic\/docs\/(.*)\/[^/]+\.md$/);
	const repoDir = m ? m[1].split('/').filter(Boolean) : undefined;
	return renderMarkdownWithToc(doc.body, doc.slug, repoDir);
}

/** Markdown body (frontmatter stripped) for one page — backs the /docs/*.md route. */
export function getRawMarkdownBySlug(slugParts: string[]): string | null {
	const slug = slugParts.join('/');
	return listDocs().find((doc) => doc.slug === slug)?.body ?? null;
}

/** Backs llms.txt and llms-full.txt — raw source, unlike search documents. */
export function getAllLlmsDocuments(): LlmsDocument[] {
	return listDocsInSequence().map((entry) => ({
		slug: entry.slug,
		url: entry.href,
		title: entry.title,
		description: entry.description,
		raw: entry.body
	}));
}

/** The canonical source every search backend's indexer builds from. */
export function getAllSearchDocuments(): SearchDocument[] {
	const documents: SearchDocument[] = [];

	for (const entry of listDocsInSequence()) {
		documents.push({
			id: entry.slug,
			url: entry.href,
			title: entry.title,
			description: entry.description,
			content: stripMarkdownToText(entry.body),
			headings: extractTocFromMarkdown(entry.body).map(({ id, text }) => ({ id, text }))
		});
	}

	// The armory catalog (skills, agents, commands, bosses) lives in the
	// sibling package and is prerendered, so index it from raw markdown bodies
	// too — otherwise ⌘K only ever finds the docs pages.
	const catalogEntries = [
		...listSkills(),
		...listAgents(),
		...listCommands(),
		...listBossEntries()
	];

	for (const entry of catalogEntries) {
		documents.push({
			id: `${entry.kind}:${entry.slug}`,
			url: entry.href,
			title: entry.title,
			description: entry.description,
			content: stripMarkdownToText(entry.body),
			headings: extractTocFromMarkdown(entry.body).map(({ id, text }) => ({ id, text }))
		});
	}

	return documents;
}
