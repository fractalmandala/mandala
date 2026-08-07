import { beforeAll, describe, expect, it } from 'vitest';
import { media } from '$lib/modules/media/state/media.svelte';

describe('media state', () => {
	beforeAll(async () => {
		await media.load();
		if (!media.library) await media.initialize();
	});

	it('supports plain, range, toggle, and clear selection semantics', () => {
		const [first, second, third] = media.visibleItems;
		expect(first && second && third).toBeTruthy();
		media.selectItem(first.id, { metaKey: false, ctrlKey: false, shiftKey: false });
		media.selectItem(third.id, { metaKey: false, ctrlKey: false, shiftKey: true });
		expect(media.selection.size).toBe(3);
		media.selectItem(second.id, { metaKey: true, ctrlKey: false, shiftKey: false });
		expect(media.selection.has(second.id)).toBe(false);
		media.clearSelection();
		expect(media.selection.size).toBe(0);
	});

	it('updates import progress lifecycle through the real mock gateway', async () => {
		await media.importPaths(['/tmp/example.png']);
		expect(media.activeImport).not.toBeNull();
		await new Promise(resolve => setTimeout(resolve, 100));
		expect(media.imports.size).toBeGreaterThan(0);
	});

	it('picks import sources and passes the persisted default mode into the import flow', async () => {
		media.setDefaultImportMode('move');
		await media.pickImportSources('files');
		expect(media.activeImport).not.toBeNull();
		expect(media.defaultImportMode).toBe('move');
	});

	it('derives scope, filter, and sort query data', async () => {
		media.setKinds(['image']);
		await new Promise(resolve => setTimeout(resolve, 0));
		expect(media.query.kinds).toEqual(['image']);
		media.setSearch('ocean');
		expect(media.visibleItems.every(item => item.name.toLowerCase().includes('ocean') || item.tags.some(tag => tag.includes('ocean')))).toBe(true);
	});

	it('undoes and redoes a batch tag mutation through the media domain', async () => {
		media.setSearch('');
		await media.selectScope({ type: 'section', section: 'all' });
		const item = media.visibleItems[0]!;
		const tag = 'undo-media-tag';
		await media.setTags([item.id], [tag], []);
		expect(media.items.find(candidate => candidate.id === item.id)?.tags).toContain(tag);
		media.undo();
		await new Promise(resolve => setTimeout(resolve, 0));
		await media.refresh();
		expect(media.items.find(candidate => candidate.id === item.id)?.tags).not.toContain(tag);
		media.redo();
		await new Promise(resolve => setTimeout(resolve, 0));
		await media.refresh();
		expect(media.items.find(candidate => candidate.id === item.id)?.tags).toContain(tag);
	});
});
