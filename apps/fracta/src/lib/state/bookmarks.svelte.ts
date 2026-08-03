const STORAGE_KEY = 'fracta-bookmarks';

function loadBookmarkedIds(): string[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
	} catch {
		return [];
	}
}

class BookmarksState {
	ids = $state<string[]>(loadBookmarkedIds());

	isBookmarked(id: string | null): boolean {
		return id ? this.ids.includes(id) : false;
	}

	toggle(id: string): void {
		this.ids = this.isBookmarked(id) ? this.ids.filter((item) => item !== id) : [id, ...this.ids];
		this.persist();
	}

	private persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids));
		} catch {

		}
	}
}

export const bookmarks = new BookmarksState();
