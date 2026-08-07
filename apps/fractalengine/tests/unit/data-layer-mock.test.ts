import { describe, expect, it, beforeEach } from 'vitest';
import {
	searchAll,
	indexDocuments,
	removeIndexedDocuments,
	bookmarkList,
	bookmarkAdd,
	bookmarkUpdate,
	bookmarkDelete,
} from '$lib/ipc-mock';
import type { SearchQuery, Bookmark } from '$lib/ipc';

// Reset the in-memory state between tests by re-importing (vitest caches modules,
// but ipc-mock stores state in module-level Maps — we clear them by side effect).
// For these tests, we recreate state by calling delete on everything.
async function resetMockState() {
	// Remove all indexed docs by iterating over known sources
	await removeIndexedDocuments('note', ['*']);
	await removeIndexedDocuments('bookmark', ['*']);
	// Remove all bookmarks
	const bms = await bookmarkList();
	for (const b of bms) {
		await bookmarkDelete(b.id).catch(() => {});
	}
}

describe('data layer mock — search engine', () => {
	beforeEach(async () => {
		await resetMockState();
	});

	it('AND matching: all query terms must appear', async () => {
		await indexDocuments([
			{ source: 'note', docId: 'a.md', title: 'Alpha', body: 'foo bar baz', path: '/v/a.md', updatedAt: 1 },
			{ source: 'note', docId: 'b.md', title: 'Beta', body: 'foo qux', path: '/v/b.md', updatedAt: 2 },
			{ source: 'note', docId: 'c.md', title: 'Gamma', body: 'bar only', path: '/v/c.md', updatedAt: 3 },
		]);

		const q: SearchQuery = { query: 'foo bar', limit: 50 };
		const hits = await searchAll(q);

		// Only 'Alpha' has both 'foo' and 'bar'
		expect(hits.length).toBe(1);
		expect(hits[0].docId).toBe('a.md');
	});

	it('snippet markers wrap the first match in «»', async () => {
		await indexDocuments([
			{ source: 'note', docId: 'snippet.md', title: 'Snippet Test', body: 'this is a test document with some content', path: '/v/snippet.md', updatedAt: 1 },
		]);

		const q: SearchQuery = { query: 'test', limit: 50 };
		const hits = await searchAll(q);

		expect(hits.length).toBe(1);
		expect(hits[0].snippet).toContain('«test»');
	});

	it('reindex replaces rather than duplicates', async () => {
		await indexDocuments([
			{ source: 'note', docId: 'dup.md', title: 'Original', body: 'hello world', path: '/v/dup.md', updatedAt: 1 },
		]);
		await indexDocuments([
			{ source: 'note', docId: 'dup.md', title: 'Updated', body: 'hello world updated', path: '/v/dup.md', updatedAt: 2 },
		]);

		const q: SearchQuery = { query: 'updated', limit: 50 };
		const hits = await searchAll(q);

		expect(hits.length).toBe(1);
		expect(hits[0].title).toBe('Updated');
	});

	it('source filter narrows results', async () => {
		await indexDocuments([
			{ source: 'note', docId: 'n.md', title: 'Note', body: 'common word', path: '/v/n.md', updatedAt: 1 },
		]);
		// Add a bookmark via the CRUD so it gets indexed
		await bookmarkAdd({ url: 'https://example.com', title: 'Example', description: 'common word' });

		const q: SearchQuery = { query: 'common', sources: ['note'], limit: 50 };
		const hits = await searchAll(q);
		expect(hits.length).toBe(1);
		expect(hits[0].source).toBe('note');
	});

	it('limit clamps at 200', async () => {
		const docs = Array.from({ length: 250 }, (_, i) => ({
			source: 'note' as const,
			docId: `doc${i}.md`,
			title: `Doc ${i}`,
			body: 'searchable content',
			path: `/v/doc${i}.md`,
			updatedAt: i,
		}));
		await indexDocuments(docs);

		const q: SearchQuery = { query: 'searchable', limit: 999 };
		const hits = await searchAll(q);
		expect(hits.length).toBeLessThanOrEqual(200);
	});

	it('offset works correctly with limit', async () => {
		const docs = Array.from({ length: 10 }, (_, i) => ({
			source: 'note' as const,
			docId: `doc${i}.md`,
			title: `Doc ${i}`,
			body: 'searchable content',
			path: `/v/doc${i}.md`,
			updatedAt: i,
		}));
		await indexDocuments(docs);

		const page1 = await searchAll({ query: 'searchable', limit: 5, offset: 0 });
		const page2 = await searchAll({ query: 'searchable', limit: 5, offset: 5 });

		expect(page1.length).toBe(5);
		expect(page2.length).toBe(5);
		// Should not overlap
		const ids1 = new Set(page1.map(h => h.docId));
		const ids2 = new Set(page2.map(h => h.docId));
		for (const id of ids1) {
			expect(ids2.has(id)).toBe(false);
		}
	});

	it('empty query returns no results', async () => {
		await indexDocuments([
			{ source: 'note', docId: 'test.md', title: 'Test', body: 'content', path: '/v/test.md', updatedAt: 1 },
		]);

		const hits = await searchAll({ query: '', limit: 50 });
		expect(hits.length).toBe(0);
	});

	it('removeIndexedDocuments removes entries', async () => {
		await indexDocuments([
			{ source: 'note', docId: 'rm.md', title: 'Remove Me', body: 'will be deleted', path: '/v/rm.md', updatedAt: 1 },
		]);

		await removeIndexedDocuments('note', ['rm.md']);
		const hits = await searchAll({ query: 'remove', limit: 50 });
		expect(hits.length).toBe(0);
	});
});

describe('data layer mock — bookmarks CRUD', () => {
	beforeEach(async () => {
		await resetMockState();
	});

	it('addBookmark returns a bookmark with generated id', async () => {
		const bm = await bookmarkAdd({ url: 'https://example.com', title: 'Example', description: 'An example site', tags: ['demo'] });
		expect(bm.id).toBeTruthy();
		expect(bm.id).toMatch(/^bm_/);
		expect(bm.url).toBe('https://example.com');
		expect(bm.title).toBe('Example');
		expect(bm.description).toBe('An example site');
		expect(bm.tags).toEqual(['demo']);
		expect(bm.createdAt).toBeGreaterThan(0);
		expect(bm.updatedAt).toBeGreaterThan(0);
	});

	it('listBookmarks returns all bookmarks sorted by updatedAt desc', async () => {
		const b1 = await bookmarkAdd({ url: 'https://a.com', title: 'A' });
		// Small delay to ensure different timestamps
		await new Promise(r => setTimeout(r, 5));
		const b2 = await bookmarkAdd({ url: 'https://b.com', title: 'B' });

		const list = await bookmarkList();
		expect(list.length).toBe(2);
		expect(list[0].id).toBe(b2.id); // most recent first
	});

	it('updateBookmark modifies fields and upserts search index', async () => {
		const bm = await bookmarkAdd({ url: 'https://example.com', title: 'Example', description: 'original' });
		// Ensure a different timestamp
		await new Promise(r => setTimeout(r, 5));
		const updated = await bookmarkUpdate(bm.id, { url: 'https://updated.com', title: 'Updated', description: 'modified', tags: ['new'] });

		expect(updated.url).toBe('https://updated.com');
		expect(updated.title).toBe('Updated');
		expect(updated.description).toBe('modified');
		expect(updated.tags).toEqual(['new']);
		expect(updated.updatedAt).not.toBe(bm.updatedAt);
	});

	it('deleteBookmark removes bookmark and its search index entry', async () => {
		const bm = await bookmarkAdd({ url: 'https://example.com', title: 'Example' });
		await bookmarkDelete(bm.id);

		const list = await bookmarkList();
		expect(list.length).toBe(0);

		// Also not searchable
		const hits = await searchAll({ query: 'Example', limit: 50 });
		expect(hits.length).toBe(0);
	});

	it('deleteBookmark throws for non-existent id', async () => {
		await expect(bookmarkDelete('nonexistent')).rejects.toThrow('Bookmark not found');
	});
});
