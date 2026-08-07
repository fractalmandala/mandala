export interface DocsRecentSearchStore {
	list(): string[];
	add(query: string): string[];
	remove(query: string): string[];
	clear(): void;
}

export const recentSearchesKey = 'docs-kit:recent-searches';

/**
 * Remembers recent queries in `localStorage`.
 *
 * Storage failures are non-fatal: in a private window or with storage disabled the search
 * dialog simply shows no history rather than breaking.
 */
export function createRecentSearches(
	options: { limit?: number; key?: string; storage?: Storage } = {}
): DocsRecentSearchStore {
	const limit = Math.max(options.limit ?? 5, 1);
	const key = options.key ?? recentSearchesKey;

	const storage = (): Storage | undefined => {
		try {
			return options.storage ?? (typeof localStorage === 'undefined' ? undefined : localStorage);
		} catch {
			return undefined;
		}
	};

	const read = (): string[] => {
		try {
			const parsed: unknown = JSON.parse(storage()?.getItem(key) ?? '[]');
			return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : [];
		} catch {
			return [];
		}
	};

	const write = (entries: string[]): string[] => {
		try {
			storage()?.setItem(key, JSON.stringify(entries));
		} catch {
			// A full or unavailable store must not break searching.
		}
		return entries;
	};

	return {
		list: read,
		add(query) {
			const trimmed = query.trim();
			if (trimmed === '') {
				return read();
			}

			const next = [trimmed, ...read().filter((entry) => entry !== trimmed)].slice(0, limit);
			return write(next);
		},
		remove(query) {
			return write(read().filter((entry) => entry !== query));
		},
		clear() {
			try {
				storage()?.removeItem(key);
			} catch {
				// Ignored for the same reason as above.
			}
		}
	};
}
