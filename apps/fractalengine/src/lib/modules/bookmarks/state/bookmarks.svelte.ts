import {
	bookmarkList,
	bookmarkAdd,
	bookmarkUpdate,
	bookmarkDelete,
	type Bookmark,
	type BookmarkInput,
} from '$lib/ipc';
import { UndoHistory } from '$lib/state/undoHistory.svelte';
import { registerUndoDomain } from '$lib/state/undo.svelte';
import { appState } from '$lib/state/app.svelte';
import { ideState } from '$lib/state/ide.svelte';

const STORAGE_KEY = 'fractalengine:bookmarks-workspace';

interface PersistedLayout {
	filterText: string;
	activeTags: string[];
	showAddForm: boolean;
}

function loadLayoutPrefs(): Partial<PersistedLayout> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const value: unknown = JSON.parse(raw);
		return value && typeof value === 'object' ? (value as PersistedLayout) : {};
	} catch {
		return {};
	}
}

class BookmarksState {
	items = $state<Bookmark[]>([]);
	loading = $state(false);
	loaded = $state(false);
	filterText = $state('');
	activeTags = $state<string[]>([]);
	showAddForm = $state(false);
	error = $state<string | null>(null);

	private history = new UndoHistory<Bookmark[]>({
		capture: () => JSON.parse(JSON.stringify(this.items)),
		restore: (snapshot) => void this.reconcile(snapshot),
		capacity: 50,
	});

	constructor() {
		const prefs = loadLayoutPrefs();
		if (typeof prefs.filterText === 'string') this.filterText = prefs.filterText;
		if (Array.isArray(prefs.activeTags)) this.activeTags = prefs.activeTags;
		if (typeof prefs.showAddForm === 'boolean') this.showAddForm = prefs.showAddForm;
	}

	/** Load bookmarks from the store. Called on template activation. */
	async load(): Promise<void> {
		if (this.loading) return;
		this.loading = true;
		this.error = null;
		try {
			this.items = await bookmarkList();
			this.loaded = true;
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to load bookmarks';
		} finally {
			this.loading = false;
		}
	}

	/** Add a new bookmark. */
	async add(input: BookmarkInput): Promise<void> {
		this.error = null;
		try {
			const bookmark = await bookmarkAdd(input);
			this.history.transact(() => {
				this.items = [...this.items, bookmark];
			});
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to add bookmark';
			throw e;
		}
	}

	/** Update an existing bookmark. */
	async edit(id: string, input: BookmarkInput): Promise<void> {
		this.error = null;
		try {
			const updated = await bookmarkUpdate(id, input);
			this.history.transact(() => {
				this.items = this.items.map(b => (b.id === id ? updated : b));
			});
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to update bookmark';
			throw e;
		}
	}

	/** Delete a bookmark. */
	async remove(id: string): Promise<void> {
		this.error = null;
		try {
			await bookmarkDelete(id);
			this.history.transact(() => {
				this.items = this.items.filter(b => b.id !== id);
			});
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to delete bookmark';
			throw e;
		}
	}

	/** Undo the last mutation. */
	undo(): void {
		this.history.undo();
	}

	/** Redo the last undone mutation. */
	redo(): void {
		this.history.redo();
	}

	pushUndo(): void {
		this.history.push();
	}

	get canUndo(): boolean {
		return this.history.canUndo;
	}

	get canRedo(): boolean {
		return this.history.canRedo;
	}

	/** Reconcile the current state against a snapshot by diffing and calling IPC. */
	private async reconcile(snapshot: Bookmark[]): Promise<void> {
		const current = this.items;
		const currentIds = new Set(current.map(b => b.id));
		const snapshotIds = new Set(snapshot.map(b => b.id));

		try {
			// Delete items in snapshot but not in current (these were added since snapshot)
			for (const b of current) {
				if (!snapshotIds.has(b.id)) {
					await bookmarkDelete(b.id).catch(() => {});
				}
			}

			// Add items in snapshot but not in current (these were deleted since snapshot)
			for (const b of snapshot) {
				if (!currentIds.has(b.id)) {
					await bookmarkAdd({
						url: b.url,
						title: b.title,
						description: b.description,
						tags: b.tags,
					}).catch(() => {});
				}
			}

			// Update items that exist in both but differ
			for (const b of snapshot) {
				const cur = current.find(c => c.id === b.id);
				if (cur && (cur.url !== b.url || cur.title !== b.title || cur.description !== b.description || JSON.stringify(cur.tags) !== JSON.stringify(b.tags))) {
					await bookmarkUpdate(b.id, {
						url: b.url,
						title: b.title,
						description: b.description,
						tags: b.tags,
					}).catch(() => {});
				}
			}

			// Reload fresh state from store
			this.items = await bookmarkList();
		} catch {
			// Reconcile failures are logged but never thrown — the undo boundary
			// covers the in-memory state.
			this.error = 'Undo reconcile failed; state may be stale.';
		}
	}

	/** All unique tags across bookmarks. */
	get allTags(): string[] {
		const tagSet = new Set<string>();
		for (const b of this.items) {
			for (const t of b.tags) tagSet.add(t);
		}
		return [...tagSet].sort();
	}

	/** Filtered bookmarks based on text and tag filters. */
	get filteredItems(): Bookmark[] {
		let result = this.items;
		const lowerFilter = this.filterText.toLowerCase().trim();
		if (lowerFilter) {
			result = result.filter(
				b =>
					b.title.toLowerCase().includes(lowerFilter) ||
					b.url.toLowerCase().includes(lowerFilter) ||
					b.description.toLowerCase().includes(lowerFilter) ||
					b.tags.some(t => t.toLowerCase().includes(lowerFilter))
			);
		}
		if (this.activeTags.length > 0) {
			result = result.filter(b => this.activeTags.some(t => b.tags.includes(t)));
		}
		return result;
	}

	toggleTag(tag: string): void {
		if (this.activeTags.includes(tag)) {
			this.activeTags = this.activeTags.filter(t => t !== tag);
		} else {
			this.activeTags = [...this.activeTags, tag];
		}
		this.persist();
	}

	setFilterText(text: string): void {
		this.filterText = text;
		this.persist();
	}

	setShowAddForm(show: boolean): void {
		this.showAddForm = show;
		this.persist();
	}

	private persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({
				filterText: this.filterText,
				activeTags: this.activeTags,
				showAddForm: this.showAddForm,
			}));
		} catch {
			// Best-effort
		}
	}
}

export const bookmarks = new BookmarksState();

registerUndoDomain({
	id: 'bookmarks',
	undo: () => bookmarks.undo(),
	redo: () => bookmarks.redo(),
	pushUndo: () => bookmarks.pushUndo(),
});
