import type { CommandItem } from './types';

/** Prefix that switches the command palette into tag-search mode. */
export const TAG_QUERY_PREFIX = '#';

export type TagPaletteMode =
	| { kind: 'normal'; query: string }
	| { kind: 'tag-list'; query: string }
	| { kind: 'tag-filter'; tag: string; text: string };

/**
 * Discriminate palette input for tag search.
 *
 * - No `#` prefix → normal command filter
 * - `#` / `#partial` (no exact known tag) → tag picker list
 * - `#exacttag` or `#exacttag rest` → filter commands by that tag
 */
export function parseTagPaletteQuery(
	raw: string,
	knownTagNames: ReadonlySet<string>,
): TagPaletteMode {
	if (!raw.startsWith(TAG_QUERY_PREFIX)) {
		return { kind: 'normal', query: raw };
	}

	const suffix = raw.slice(TAG_QUERY_PREFIX.length).replace(/^\s+/, '');
	if (!suffix) {
		return { kind: 'tag-list', query: '' };
	}

	const spaceIdx = suffix.indexOf(' ');
	const head = spaceIdx === -1 ? suffix : suffix.slice(0, spaceIdx);
	const rest = spaceIdx === -1 ? '' : suffix.slice(spaceIdx + 1).trim();
	const normalizedHead = head.toLowerCase();

	if (knownTagNames.has(normalizedHead)) {
		return { kind: 'tag-filter', tag: normalizedHead, text: rest };
	}

	// Still typing a tag (or unknown tag) — keep the tag picker open.
	return { kind: 'tag-list', query: normalizedHead };
}

/** Unique tags across the command registry, sorted. */
export function collectCommandTags(commands: readonly CommandItem[]): string[] {
	const tags = new Set<string>();
	for (const command of commands) {
		for (const tag of command.tags ?? []) {
			const normalized = tag.trim().toLowerCase();
			if (normalized) tags.add(normalized);
		}
	}
	return [...tags].sort((a, b) => a.localeCompare(b));
}

/** Filter + rank tag names for the tag-list picker. */
export function filterTagList(tags: readonly string[], query: string): string[] {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return [...tags];

	return tags
		.map((tag) => {
			const lower = tag.toLowerCase();
			let score = 0;
			if (lower === normalized) score = 100;
			else if (lower.startsWith(normalized)) score = 80;
			else if (lower.includes(normalized)) score = 40;
			return { tag, score };
		})
		.filter((entry) => entry.score > 0)
		.sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag))
		.map((entry) => entry.tag);
}

export function formatTagQuery(tag: string, text = ''): string {
	const trimmedText = text.trim();
	return trimmedText ? `${TAG_QUERY_PREFIX}${tag} ${trimmedText}` : `${TAG_QUERY_PREFIX}${tag}`;
}
