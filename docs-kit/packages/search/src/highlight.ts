import type { DocsSearchResult } from './provider.js';
import { tokenizeQuery } from './provider.js';

export interface DocsHighlightSegment {
	text: string;
	/** True when the segment matched a query term. */
	match: boolean;
}

/**
 * Splits text into matched and unmatched segments.
 *
 * Highlighting is returned as data rather than HTML so the UI renders it with ordinary
 * elements; user-supplied query text is never interpolated into markup.
 */
export function highlightMatches(text: string, query: string): DocsHighlightSegment[] {
	const terms = tokenizeQuery(query);
	if (terms.length === 0 || text === '') {
		return [{ text, match: false }];
	}

	const lower = text.toLowerCase();
	const ranges: Array<[number, number]> = [];

	for (const term of terms) {
		let index = lower.indexOf(term);
		while (index !== -1) {
			ranges.push([index, index + term.length]);
			index = lower.indexOf(term, index + term.length);
		}
	}

	if (ranges.length === 0) {
		return [{ text, match: false }];
	}

	ranges.sort((left, right) => left[0] - right[0]);
	const merged: Array<[number, number]> = [];
	for (const range of ranges) {
		const last = merged.at(-1);
		if (last && range[0] <= last[1]) {
			last[1] = Math.max(last[1], range[1]);
		} else {
			merged.push([...range]);
		}
	}

	const segments: DocsHighlightSegment[] = [];
	let cursor = 0;

	for (const [start, end] of merged) {
		if (start > cursor) {
			segments.push({ text: text.slice(cursor, start), match: false });
		}
		segments.push({ text: text.slice(start, end), match: true });
		cursor = end;
	}

	if (cursor < text.length) {
		segments.push({ text: text.slice(cursor), match: false });
	}

	return segments;
}

export interface DocsSearchGroup {
	/** Page the results belong to. */
	pageId: string;
	title: string;
	pathname: string;
	results: DocsSearchResult[];
}

/**
 * Groups results by page, preserving relevance order.
 *
 * A page and its sections arrive as separate records; grouping keeps them together so a
 * reader sees one entry per page with the matching sections beneath it.
 */
export function groupSearchResults(results: readonly DocsSearchResult[]): DocsSearchGroup[] {
	const groups = new Map<string, DocsSearchGroup>();

	for (const result of results) {
		const existing = groups.get(result.record.pageId);

		if (existing) {
			existing.results.push(result);
			continue;
		}

		groups.set(result.record.pageId, {
			pageId: result.record.pageId,
			title: result.record.title,
			// The group links to the page itself, not to whichever section matched first.
			pathname: result.record.pathname.split('#')[0] ?? result.record.pathname,
			results: [result]
		});
	}

	return [...groups.values()];
}
