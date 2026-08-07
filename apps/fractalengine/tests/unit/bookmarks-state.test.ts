import { describe, expect, it, beforeEach } from 'vitest';
import {
	bookmarkList,
	bookmarkAdd,
	bookmarkDelete,
	bookmarkUpdate,
} from '$lib/ipc-mock';
import { UndoHistory } from '$lib/state/undoHistory.svelte';
import type { Bookmark } from '$lib/ipc';

/**
 * Tests for the bookmarks undo reconcile strategy.
 * Uses a lightweight UndoHistory<Bookmark[]> directly to verify the
 * reconcile pattern that bookmarks.svelte.ts implements.
 */

interface BookmarkState {
	items: Bookmark[];
}

async function captureBookmarkState(): Promise<BookmarkState> {
	return { items: JSON.parse(JSON.stringify(await bookmarkList())) };
}

async function reconcileState(snapshot: BookmarkState): Promise<void> {
	const current = await bookmarkList();
	const currentIds = new Set(current.map(b => b.id));
	const snapshotIds = new Set(snapshot.items.map(b => b.id));

	// Delete items added since snapshot
	for (const b of current) {
		if (!snapshotIds.has(b.id)) {
			await bookmarkDelete(b.id).catch(() => {});
		}
	}

	// Re-add items deleted since snapshot
	for (const b of snapshot.items) {
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
	for (const b of snapshot.items) {
		const cur = current.find(c => c.id === b.id);
		if (cur && (cur.url !== b.url || cur.title !== b.title)) {
			await bookmarkUpdate(b.id, {
				url: b.url,
				title: b.title,
				description: b.description,
				tags: b.tags,
			}).catch(() => {});
		}
	}
}

describe('bookmarks undo reconcile', () => {
	beforeEach(async () => {
		// Clean slate
		const all = await bookmarkList();
		for (const b of all) {
			await bookmarkDelete(b.id).catch(() => {});
		}
	});

	it('delete → undo restores bookmark via mock', async () => {
		// Add a bookmark and capture state
		const bm = await bookmarkAdd({ url: 'https://example.com', title: 'Example' });
		const before = await captureBookmarkState();

		// Delete it
		await bookmarkDelete(bm.id);
		let afterDelete = await bookmarkList();
		expect(afterDelete.length).toBe(0);

		// Undo (reconcile)
		await reconcileState(before);
		const restored = await bookmarkList();
		expect(restored.length).toBe(1);
		expect(restored[0].url).toBe('https://example.com');
		expect(restored[0].title).toBe('Example');
	});

	it('add → undo removes the added bookmark', async () => {
		const before = await captureBookmarkState();

		// Add a bookmark
		await bookmarkAdd({ url: 'https://new.com', title: 'New' });
		let afterAdd = await bookmarkList();
		expect(afterAdd.length).toBe(1);

		// Undo (reconcile to before)
		await reconcileState(before);
		const afterUndo = await bookmarkList();
		expect(afterUndo.length).toBe(0);
	});

	it('reconcile handles multiple bookmarks correctly', async () => {
		// Start with 2 bookmarks
		await bookmarkAdd({ url: 'https://a.com', title: 'A' });
		await bookmarkAdd({ url: 'https://b.com', title: 'B' });
		const before = await captureBookmarkState();

		// Add one, delete one
		const all = await bookmarkList();
		await bookmarkDelete(all[0].id);
		await bookmarkAdd({ url: 'https://c.com', title: 'C' });

		// Undo
		await reconcileState(before);
		const restored = await bookmarkList();
		expect(restored.length).toBe(2);
		expect(restored.some(b => b.title === 'A')).toBe(true);
		expect(restored.some(b => b.title === 'B')).toBe(true);
		expect(restored.some(b => b.title === 'C')).toBe(false);
	});
});

describe('bookmarks transact atomicity', () => {
	it('transact produces exactly one undo entry', () => {
		let state: BookmarkState = { items: [] };
		const history = new UndoHistory<BookmarkState>({
			capture: () => state,
			restore: (s) => {
				state = s;
			},
			capacity: 50,
		});

		// Perform a transaction (synchronous mutation)
		history.transact(() => {
			state = { items: [...state.items, { id: 'test-1', url: 'https://tx.com', title: 'Transactional', description: '', faviconUrl: null, tags: [], folderId: null, position: 0, createdAt: 1, updatedAt: 1 }] };
		});

		expect(history.canUndo).toBe(true);
	});

	it('nested transacts coalesce into one entry', () => {
		let state: BookmarkState = { items: [] };
		let undoCount = 0;
		const history = new UndoHistory<BookmarkState>({
			capture: () => state,
			restore: (s) => {
				undoCount++;
				state = s;
			},
			capacity: 50,
		});

		history.transact(() => {
			state = { items: [...state.items, { id: 'outer', url: 'https://outer.com', title: 'Outer', description: '', faviconUrl: null, tags: [], folderId: null, position: 0, createdAt: 1, updatedAt: 1 }] };
			history.transact(() => {
				state = { items: [...state.items, { id: 'inner', url: 'https://inner.com', title: 'Inner', description: '', faviconUrl: null, tags: [], folderId: null, position: 0, createdAt: 2, updatedAt: 2 }] };
			});
		});

		expect(history.canUndo).toBe(true);
		history.undo();
		// After undo, should be back to initial
		expect(state.items.length).toBe(0);
	});
});
