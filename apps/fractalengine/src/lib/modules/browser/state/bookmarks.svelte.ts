/** Browser view of the app-level bookmark store. Data remains module-neutral in storage/IPC. */
import { bookmarkAdd, bookmarkDelete, bookmarkForUrl, bookmarkList, bookmarkUpdate, type Bookmark, type BookmarkInput } from '$lib/ipc';
import { UndoHistory } from '$lib/state/undoHistory.svelte';
import { registerUndoDomain } from '$lib/state/undo.svelte';

class BookmarksState {
	entries = $state<Bookmark[]>([]);
	loaded = $state(false);
	private history = new UndoHistory<Bookmark[]>({
		capture: () => structuredClone(this.entries),
		restore: snapshot => { this.entries = snapshot; void this.reconcile(); },
		capacity: 50
	});

	async load(): Promise<void> {
		this.entries = await bookmarkList();
		this.loaded = true;
	}

	forUrl(url: string): Bookmark | null {
		return this.entries.find(entry => entry.url === url) ?? null;
	}

	async findForUrl(url: string): Promise<Bookmark | null> {
		return bookmarkForUrl(url);
	}

	async add(input: BookmarkInput): Promise<Bookmark> {
		const entry = await bookmarkAdd(input);
		this.history.transact(() => { this.entries = [entry, ...this.entries]; });
		return entry;
	}

	async update(id: string, input: BookmarkInput): Promise<Bookmark> {
		const entry = await bookmarkUpdate(id, input);
		this.history.transact(() => { this.entries = this.entries.map(current => current.id === id ? entry : current); });
		return entry;
	}

	async remove(id: string): Promise<void> {
		await bookmarkDelete(id);
		this.history.transact(() => { this.entries = this.entries.filter(entry => entry.id !== id); });
	}

	undo(): void { this.history.undo(); }
	redo(): void { this.history.redo(); }
	pushUndo(): void { this.history.push(); }

	private async reconcile(): Promise<void> {
		const target = this.entries;
		const actual = await bookmarkList();
		for (const current of actual) {
			if (!target.some(entry => entry.id === current.id)) await bookmarkDelete(current.id);
		}
		for (const entry of target) {
			const current = actual.find(candidate => candidate.id === entry.id);
			if (!current) await bookmarkAdd({ url: entry.url, title: entry.title, description: entry.description, faviconUrl: entry.faviconUrl, tags: entry.tags, folderId: entry.folderId, position: entry.position });
			else if (JSON.stringify(current) !== JSON.stringify(entry)) await bookmarkUpdate(entry.id, { url: entry.url, title: entry.title, description: entry.description, faviconUrl: entry.faviconUrl, tags: entry.tags, folderId: entry.folderId, position: entry.position });
		}
		this.entries = await bookmarkList();
	}
}

export const bookmarks = new BookmarksState();
registerUndoDomain({ id: 'browser-bookmarks', undo: () => bookmarks.undo(), redo: () => bookmarks.redo(), pushUndo: () => bookmarks.pushUndo() });
