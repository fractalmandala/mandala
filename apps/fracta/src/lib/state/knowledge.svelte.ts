import { bookmarks } from '$lib/state/bookmarks.svelte';
import { entries } from '$lib/state/entries.svelte';
import { formatWhen } from '$lib/utils/dates';
import type { EntrySummary } from '$lib/ipc';

export interface LibraryItem {
	id: string;
	title: string;
	excerpt: string;
	category: string;
	tags: string[];
	when: string;
	updatedAt: number;
	bookmarked: boolean;
}

export interface TermCount {
	name: string;
	count: number;
}

function toLibraryItem(entry: EntrySummary): LibraryItem {
	return {
		id: entry.id,
		title: entry.title || 'Untitled',
		excerpt: entry.excerpt || '',
		category: entry.category || '',
		tags: entry.tags,
		when: formatWhen(entry.updated_at),
		updatedAt: entry.updated_at,
		bookmarked: bookmarks.isBookmarked(entry.id)
	};
}

/**
 * Derived knowledge index over the vault summaries.
 * Keeps organize / filter UI free of ad-hoc Map logic.
 */
class Knowledge {
	/** All library rows, newest first. */
	get items(): LibraryItem[] {
		const rows = entries.summaries.map(toLibraryItem);
		return rows.sort((a, b) => b.updatedAt - a.updatedAt);
	}

	get tagTerms(): TermCount[] {
		return this.#countBy((item) => item.tags);
	}

	get categoryTerms(): TermCount[] {
		return this.#countBy((item) => (item.category ? [item.category] : []));
	}

	get bookmarked(): LibraryItem[] {
		return this.items.filter((item) => item.bookmarked);
	}

	get tagCount(): number {
		return this.tagTerms.length;
	}

	get categoryCount(): number {
		return this.categoryTerms.length;
	}

	get entryCount(): number {
		return entries.summaries.length;
	}

	/** Unique tags across the vault (sorted). */
	get allTags(): string[] {
		return this.tagTerms.map((t) => t.name);
	}

	/** Unique categories (sorted). */
	get allCategories(): string[] {
		return this.categoryTerms.map((t) => t.name);
	}

	#countBy(keysOf: (item: LibraryItem) => string[]): TermCount[] {
		const map = new Map<string, number>();
		for (const item of this.items) {
			for (const key of keysOf(item)) {
				const name = key.trim();
				if (!name) continue;
				map.set(name, (map.get(name) ?? 0) + 1);
			}
		}
		return [...map.entries()]
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
	}
}

export const knowledge = new Knowledge();
