import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

import * as mockIpc from '$lib/ipc-mock';
import { isFilesystemAccessDenied } from '$lib/ipc';
import type { IpcApi } from '$lib/ipc';

// ── Name parity (fs-source extraction, no Tauri module loading) ──────────────────

const NATIVE_ONLY = new Set([
	'onAppCloseRequested',
	'toggleWindowMaximize',
	'setActiveTemplateMenu',
]);

/**
 * Extract value-level (function/const) top-level export names from a TS source file.
 * Type/interface exports are excluded — they are compile-time only and need no mock.
 */
function extractValueExports(filePath: string): Set<string> {
	const src = fs.readFileSync(filePath, 'utf-8');
	const names = new Set<string>();
	const re = /^export\s+(?:async\s+)?(?:function|const)\s+(\w+)/gm;
	let match: RegExpExecArray | null;
	while ((match = re.exec(src)) !== null) {
		names.add(match[1]);
	}
	return names;
}

/**
 * Extract all (including type/interface) top-level export names.
 */
function extractAllExports(filePath: string): Set<string> {
	const src = fs.readFileSync(filePath, 'utf-8');
	const names = new Set<string>();
	const re = /^export\s+(?:async\s+)?(?:function|const|type|interface)\s+(\w+)/gm;
	let match: RegExpExecArray | null;
	while ((match = re.exec(src)) !== null) {
		names.add(match[1]);
	}
	return names;
}

const ipcTsPath = path.resolve(__dirname, '../../src/lib/ipc.ts');
const ipcMockTsPath = path.resolve(__dirname, '../../src/lib/ipc-mock.ts');

// The mock's `hello` and `subtract` are demo helpers embedded in the mock
// filesystem's demo workspace content (src/main.ts and src/utils.ts example code).
// They are NOT gateway functions and are intentionally exported for the demo.
// Excluding them from the orphan check.
const IGNORED_MOCK_ORPHANS = new Set(['hello', 'subtract']);

describe('IPC contract — name parity', () => {
	const ipcValueExports = extractValueExports(ipcTsPath);
	const mockValueExports = extractValueExports(ipcMockTsPath);
	const mockAllExports = extractAllExports(ipcMockTsPath);

	it('every ipc.ts value export is mock-implemented or NATIVE_ONLY-listed', () => {
		const missing: string[] = [];
		for (const name of ipcValueExports) {
			if (NATIVE_ONLY.has(name)) continue;
			if (!mockValueExports.has(name)) {
				missing.push(name);
			}
		}
		expect(missing, 'These ipc.ts value exports have no mock implementation and are not in NATIVE_ONLY').toEqual([]);
	});

	it('mock has no orphan value exports (not in ipc.ts, excluding demo helpers)', () => {
		const orphans: string[] = [];
		for (const name of mockAllExports) {
			if (!ipcValueExports.has(name) && !IGNORED_MOCK_ORPHANS.has(name)) {
				orphans.push(name);
			}
		}
		expect(orphans, 'Mock exports that are not gateway functions — add to ipc.ts or document as orphan').toEqual([]);
	});
});

describe('filesystem access recovery contract', () => {
	it('recognizes the native authorization denial without conflating it with a missing path', () => {
		expect(isFilesystemAccessDenied(new Error('FS_ACCESS_DENIED:/Users/amrit/fractals'))).toBe(true);
		expect(isFilesystemAccessDenied(new Error('Path does not exist'))).toBe(false);
	});

	it('lists, grants, and revokes mock filesystem roots', async () => {
		const path = '/vault-needing-permission';
		await mockIpc.revokeAuthorizedPath(path);
		expect(await mockIpc.listAuthorizedPaths()).not.toContain(path);
		await mockIpc.requestDirectoryAccess(path);
		expect(await mockIpc.listAuthorizedPaths()).toContain(path);
		expect(await mockIpc.revokeAuthorizedPath(path)).toBe(true);
		expect(await mockIpc.listAuthorizedPaths()).not.toContain(path);
	});
});

// ── Behavioral contract suite (reusable against Tauri driver) ────────────────────
//
// This suite exercises IPC semantics that are common across mock and native.
// The same shape can be reused against a Tauri-driver harness for native parity
// (native behavioral parity remains Phase 3 — see ADR-028).
//
// Data-layer behavioral tests (reindex-no-dup, AND-matching, limit clamps,
// bookmarks CRUD) live in tests/unit/data-layer-mock.test.ts to avoid duplication.

function runContractSuite(
	label: string,
	api: Pick<IpcApi, 'writeFile' | 'readFile' | 'createFile' | 'deleteFile' | 'renameFile' | 'duplicateFile' | 'copyPath' | 'listDirectory'>
) {
	describe(label, () => {
		it('fs round-trip: write, read, rename, delete', async () => {
			const testPath = '/workspace/contract-test.txt';
			const renamedPath = '/workspace/contract-test-renamed.txt';

			// Clean slate
			await api.deleteFile(testPath).catch(() => {});
			await api.deleteFile(renamedPath).catch(() => {});

			// Write
			await api.writeFile(testPath, 'contract test content');
			const content = await api.readFile(testPath);
			expect(content).toBe('contract test content');

			// List directory shows it
			const entries = await api.listDirectory('/workspace');
			expect(entries.some(e => e.name === 'contract-test.txt')).toBe(true);

			// Rename
			await api.renameFile(testPath, 'contract-test-renamed.txt');
			const reread = await api.readFile(renamedPath);
			expect(reread).toBe('contract test content');

			// Delete
			await api.deleteFile(renamedPath);
			await expect(api.readFile(renamedPath)).rejects.toThrow();
		});

		it('path-escape rejection prevents directory traversal', async () => {
			const badPaths = [
				'/workspace/../../etc/passwd',
				'/workspace/../outside.txt',
				'..%2Ftraversal',
			];

			for (const bad of badPaths) {
				try {
					await api.writeFile(bad, 'evil content');
				} catch {
					// Expected — path rejected by normalizedMockPath
				}
			}
			// Verify /etc/passwd wasn't created in the mock FS
			await expect(api.readFile('/etc/passwd')).rejects.toThrow();
		});

		it('duplicateFile creates a copy alongside the source', async () => {
			const src = '/workspace/dup-source.txt';
			await api.writeFile(src, 'duplicate me').catch(() => {});
			await api.duplicateFile(src);
			// Default copy name appends " (copy)"
			const copy = await api.readFile('/workspace/dup-source (copy).txt');
			expect(copy).toBe('duplicate me');
			// Original still exists
			const original = await api.readFile(src);
			expect(original).toBe('duplicate me');
		});

		it('copyPath copies to an explicit destination', async () => {
			const src = '/workspace/copy-dest-source.txt';
			const dest = '/workspace/copy-dest-target.txt';
			await api.writeFile(src, 'copy me').catch(() => {});
			await api.copyPath(src, dest);
			const content = await api.readFile(dest);
			expect(content).toBe('copy me');
		});
	});
}

// Run the contract suite against the mock
runContractSuite('IPC contract — behavioral (mock)', mockIpc);

// ── Mock invariants (not part of the reusable suite) ─────────────────────────────

describe('IPC contract — mock invariants', () => {
	it('isTauri returns false in mock', () => {
		expect(mockIpc.isTauri()).toBe(false);
	});

	it('templateIdToMenuId maps correctly', () => {
		expect(mockIpc.templateIdToMenuId('home')).toBe('tpl_home');
		expect(mockIpc.templateIdToMenuId('notes')).toBe('tpl_notes');
		expect(mockIpc.templateIdToMenuId(null)).toBeNull();
	});
});

// ── fractalMedia mock engine (stream B1; see docs/plans/media-module-plan.md §7) ──

import type { MediaFsEvent, MediaImportProgress } from '$lib/modules/media/types';

const byName = { sort: 'name', descending: false } as const;

describe('IPC contract — media mock engine', () => {
	it('starts uninitialized, then seeds the fixture library exactly once', async () => {
		expect(await mockIpc.mediaGetLibrary()).toBeNull();
		await expect(mockIpc.mediaListTree()).rejects.toThrow('MEDIA_LIBRARY_NOT_INITIALIZED');

		const lib = await mockIpc.mediaInitLibrary();
		expect(lib?.basePath).toContain('Fracta');
		expect(await mockIpc.mediaInitLibrary()).toEqual(lib);

		const tree = await mockIpc.mediaListTree();
		expect(tree.path).toBe('');
		expect(tree.children.map(c => c.path).sort()).toEqual(['nature', 'shapes']);
		const nature = tree.children.find(c => c.path === 'nature')!;
		expect(nature.children.map(c => c.path)).toEqual(['nature/closeups']);

		const all = await mockIpc.mediaListItems({ scope: { type: 'section', section: 'all' }, ...byName });
		expect(all).toHaveLength(11);
		const pinned = await mockIpc.mediaListItems({ scope: { type: 'section', section: 'pinned' }, ...byName });
		expect(pinned.length).toBeGreaterThan(0);
	});

	it('folder round-trip: create → move → rename → trash emits correct events', async () => {
		const events: MediaFsEvent[] = [];
		const off = mockIpc.onMediaFsEvent(e => events.push(e));
		await mockIpc.mediaCreateFolder('', 'inbox');
		await mockIpc.mediaMoveEntries(['inbox'], 'nature');
		expect(await mockIpc.mediaRenameEntry('nature/inbox', 'archive')).toBe('nature/archive');
		await mockIpc.mediaTrashEntries(['nature/archive']);
		off();
		expect(events.map(e => e.kind)).toEqual(['created', 'renamed', 'renamed', 'removed']);
		expect(events.every(e => e.isDirectory)).toBe(true);
		expect(events[1].newRelPath).toBe('nature/inbox');
		expect(events[2].newRelPath).toBe('nature/archive');
	});

	it('import lifecycle: progress ticks, skipped counting, collision suffixing, fs events', async () => {
		const progress: MediaImportProgress[] = [];
		const off = mockIpc.onMediaImportProgress(p => progress.push(p));
		await mockIpc.mediaImport(
			['/Downloads/pic.jpg', '/Downloads/notes.txt', '/Downloads/pic.jpg'],
			'shapes', 'copy'
		);
		await new Promise(resolve => setTimeout(resolve, 400));
		off();
		const final = progress.at(-1)!;
		expect(final.finished).toBe(true);
		expect(final.error).toBeUndefined();
		expect(final.total).toBe(2);   // two media files
		expect(final.skipped).toBe(1); // notes.txt
		const shapes = await mockIpc.mediaListItems({ scope: { type: 'folder', path: 'shapes' }, ...byName });
		const names = shapes.map(i => i.name);
		expect(names).toContain('pic.jpg');
		expect(names).toContain('pic 2.jpg'); // collision-suffixed, never overwritten
	});

	it('cancelling an import finishes it with the cancelled error', async () => {
		const progress: MediaImportProgress[] = [];
		const off = mockIpc.onMediaImportProgress(p => progress.push(p));
		const importId = await mockIpc.mediaImport(
			['/a.png', '/b.png', '/c.png', '/d.png', '/e.png'], '', 'copy'
		);
		await mockIpc.mediaCancelImport(importId);
		await new Promise(resolve => setTimeout(resolve, 200));
		off();
		const final = progress.at(-1)!;
		expect(final.finished).toBe(true);
		expect(final.error).toBe('cancelled');
		expect(final.done).toBeLessThan(5);
	});

	it('tags round-trip; item id and tags survive a rename', async () => {
		const [item] = await mockIpc.mediaListItems({ scope: { type: 'folder', path: 'nature' }, ...byName });
		await mockIpc.mediaSetTags([item.id], ['holiday'], []);
		const tagged = await mockIpc.mediaListItems({ scope: { type: 'tag', tag: 'holiday' }, ...byName });
		expect(tagged.map(i => i.id)).toContain(item.id);

		const newRel = await mockIpc.mediaRenameEntry(item.relPath, `renamed-${item.name}`);
		const after = await mockIpc.mediaListItems({ scope: { type: 'tag', tag: 'holiday' }, ...byName });
		const survivor = after.find(i => i.id === item.id)!;
		expect(survivor.relPath).toBe(newRel);

		expect((await mockIpc.mediaListAllTags()).map(t => t.tag)).toContain('holiday');
		await mockIpc.mediaSetTags([item.id], [], ['holiday']);
		expect((await mockIpc.mediaListAllTags()).map(t => t.tag)).not.toContain('holiday');
	});

	it('indexes items into the media search source', async () => {
		const [item] = await mockIpc.mediaListItems({ scope: { type: 'section', section: 'all' }, ...byName });
		await mockIpc.mediaSetTags([item.id], ['searchable-tag'], []);
		const hits = await mockIpc.searchAll({ query: 'searchable-tag', sources: ['media'] });
		expect(hits.map(h => h.docId)).toContain(item.id);
		await mockIpc.mediaSetTags([item.id], [], ['searchable-tag']);
	});

	it('pick-import-sources returns externals matching the requested kind', async () => {
		const folder = await mockIpc.mediaPickImportSources('folder');
		expect(folder).toHaveLength(1);
		const files = await mockIpc.mediaPickImportSources('files');
		expect(files!.length).toBeGreaterThan(1);
		// The mock batch deliberately includes one non-media file for skip counting.
		expect(files!.some(p => p.endsWith('.txt'))).toBe(true);
	});

	it('rejects path escapes on every path-taking surface', async () => {
		await expect(mockIpc.mediaCreateFolder('../outside', 'x')).rejects.toThrow('MEDIA_PATH_ESCAPE');
		await expect(mockIpc.mediaTrashEntries(['../../etc'])).rejects.toThrow('MEDIA_PATH_ESCAPE');
		await expect(mockIpc.mediaMoveEntries(['nature'], '../elsewhere')).rejects.toThrow('MEDIA_PATH_ESCAPE');
		await expect(mockIpc.mediaTrashEntries(['/etc/passwd'])).rejects.toThrow('MEDIA_PATH_ESCAPE');
		expect(() => mockIpc.mediaAssetUrl('../secrets.png')).toThrow('MEDIA_PATH_ESCAPE');
		expect(() => mockIpc.mediaAssetUrl('/etc/passwd')).toThrow('MEDIA_PATH_ESCAPE');
	});

	it('asset and thumbnail URLs resolve for seeded and imported items', async () => {
		const all = await mockIpc.mediaListItems({ scope: { type: 'section', section: 'all' }, ...byName });
		const seeded = all.find(i => i.relPath === 'shapes/orbit.svg')!;
		expect(mockIpc.mediaAssetUrl(seeded.relPath)).toBe('/media-fixtures/shapes/orbit.svg');
		const imported = all.find(i => i.name === 'pic.jpg')!;
		expect(mockIpc.mediaAssetUrl(imported.relPath)).toMatch(/^\/media-fixtures\//);
		expect(await mockIpc.mediaGetThumbnail(imported.id, 256)).toMatch(/^\/media-fixtures\//);
		const saved = await mockIpc.mediaSaveVideoThumbnail(imported.id, 'Zm9v');
		expect(saved).toBe('data:image/jpeg;base64,Zm9v');
		expect(await mockIpc.mediaGetThumbnail(imported.id, 256)).toBe(saved);
	});
});
