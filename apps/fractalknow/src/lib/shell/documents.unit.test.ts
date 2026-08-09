import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	clearRecentDocuments,
	closeActiveDocument,
	createDocument,
	createDocumentInFolder,
	deleteActiveDocument,
	discardActiveChanges,
	documentWorkspace,
	loadProjectDocuments,
	moveWorkspaceDocument,
	openDocument,
	recentDocumentPaths,
	removeRecentDocument,
	renameActiveDocument,
	saveActiveDocumentContent,
	saveActiveVersion,
	updateActiveContent,
	updateDocumentViewState,
	type WorkspaceDocument,
} from './documents';

function projectDocument(
	path: string,
	content: string,
	kind: WorkspaceDocument['kind'] = 'doc',
): WorkspaceDocument {
	return {
		kind,
		path,
		title: path.split('/').at(-1) ?? path,
		content,
		versions: [],
		lastSavedContent: content,
		loadState: 'loaded',
		syncState: 'saved',
		loadError: null,
	};
}

function resetWorkspace(): void {
	documentWorkspace.set({
		documents: [
			{
				kind: 'migration',
				path: '/migration',
				title: 'Migration Plan',
				content: 'Task-wise Tauri + SvelteKit migration plan.',
				versions: [],
				lastSavedContent: 'Task-wise Tauri + SvelteKit migration plan.',
				loadState: 'loaded',
				syncState: 'saved',
				loadError: null,
				metadata: {
					size: 42,
					extension: '',
					mime: 'text/plain',
					binary: false,
					large: false,
					updatedAt: '2026-07-30T00:00:00.000Z',
				},
			},
		],
		openPaths: ['/migration'],
		activePath: '/migration',
		pendingTarget: null,
		notice: null,
	});
}

describe('document workspace store', () => {
	beforeEach(resetWorkspace);

	it('opens existing and new documents while preserving the migration fallback tab', () => {
		openDocument({ kind: 'doc', path: '/content/Test.md', title: 'Test.md' });

		expect(get(documentWorkspace).activePath).toBe('/content/Test.md');
		expect(get(documentWorkspace).openPaths).toEqual(['/migration', '/content/Test.md']);

		closeActiveDocument();
		expect(get(documentWorkspace).activePath).toBe('/migration');
		expect(get(documentWorkspace).openPaths).toEqual(['/migration']);
	});

	it('creates unique untitled documents and records versions from edited content', () => {
		const first = createDocument('doc');
		const second = createDocument('doc');
		updateActiveContent('# Changed');
		saveActiveVersion();

		const state = get(documentWorkspace);
		const saved = state.documents.find((document) => document.path === state.activePath);

		expect(first.path).toBe('/content/Untitled.md');
		expect(second.path).not.toBe(first.path);
		expect(saved?.path).toBe(second.path);
		expect(saved?.dirty).toBe(false);
		expect(saved?.versions[0].content).toBe('# Changed');
	});

	it('renames and deletes only editable active documents', () => {
		const document = createDocument('doc');
		renameActiveDocument();

		const renamedPath = get(documentWorkspace).activePath;
		expect(renamedPath).toContain('Renamed');
		expect(renamedPath).not.toBe(document.path);

		deleteActiveDocument({ force: true });
		const state = get(documentWorkspace);
		expect(state.documents.some((item) => item.path === renamedPath)).toBe(false);
		expect(state.openPaths).toEqual(['/migration']);
		expect(state.activePath).toBe('/migration');
	});

	it('saves current document content without creating a version snapshot', () => {
		createDocument('doc');
		updateActiveContent('# Source save');
		saveActiveDocumentContent();

		const state = get(documentWorkspace);
		const saved = state.documents.find((document) => document.path === state.activePath);

		expect(saved?.dirty).toBe(false);
		expect(saved?.syncState).toBe('saved');
		expect(saved?.lastSavedContent).toBe('# Source save');
		expect(saved?.versions).toEqual([]);
	});

	it('creates documents inside folders and moves workspace documents in memory', () => {
		const folder = createDocumentInFolder('/content', 'folder');
		const document = createDocumentInFolder(folder.path, 'doc');

		expect(document.path).toBe(`${folder.path}/Untitled.md`);
		expect(moveWorkspaceDocument(document.path, '/content')).toBe(true);

		const state = get(documentWorkspace);
		expect(state.documents.some((item) => item.path === '/content/Untitled.md')).toBe(true);
		expect(state.activePath).toBe('/content/Untitled.md');
		expect(state.notice).toContain('Moved Untitled.md');
	});

	it('restores active content and preserves per-document source cursor and scroll state', () => {
		const document = createDocument('doc');
		updateDocumentViewState(document.path, {
			sourceSelection: {
				anchor: 3,
				head: 8,
			},
			sourceScrollTop: 144,
		});
		updateActiveContent('# Unsaved');
		saveActiveDocumentContent();
		updateActiveContent('# Dirty');
		discardActiveChanges();

		const state = get(documentWorkspace);
		const restored = state.documents.find((item) => item.path === document.path);

		expect(restored?.content).toBe('# Unsaved');
		expect(restored?.dirty).toBe(false);
		expect(restored?.viewState).toEqual({
			sourceSelection: {
				anchor: 3,
				head: 8,
			},
			sourceScrollTop: 144,
		});
	});

	it('preserves the selected document and open tabs when project files replace seed documents', () => {
		openDocument({ kind: 'doc', path: '/content/Welcome.md', title: 'Welcome.md' });
		openDocument({ kind: 'doc', path: '/content/Notes.md', title: 'Notes.md' });

		loadProjectDocuments([
			projectDocument('/content/Welcome.md', '# Welcome from disk'),
			projectDocument('/content/Notes.md', '# Notes from disk'),
			projectDocument('/content/New.md', '# New from disk'),
		]);

		const state = get(documentWorkspace);
		expect(state.activePath).toBe('/content/Notes.md');
		expect(state.openPaths).toContain('/content/Welcome.md');
		expect(state.openPaths).toContain('/content/Notes.md');
		expect(state.documents.some((item) => item.path === '/content/New.md')).toBe(true);
		expect(state.documents.some((item) => item.kind === 'migration')).toBe(true);
	});

	it('keeps unsaved editor state when the same path loads from the project', () => {
		openDocument({ kind: 'doc', path: '/content/Welcome.md', title: 'Welcome.md' });
		updateActiveContent('# Unsaved local edits');

		loadProjectDocuments([projectDocument('/content/Welcome.md', '# Disk content')]);

		const state = get(documentWorkspace);
		const document = state.documents.find((item) => item.path === '/content/Welcome.md');
		expect(state.activePath).toBe('/content/Welcome.md');
		expect(document?.content).toBe('# Unsaved local edits');
		expect(document?.dirty).toBe(true);
		expect(document?.syncState).toBe('dirty');
	});

	it('falls back to the migration board when project loading removes the selected document', () => {
		openDocument({ kind: 'doc', path: '/content/Seed.md', title: 'Seed.md' });
		loadProjectDocuments([projectDocument('/content/Other.md', '# Other')]);

		const state = get(documentWorkspace);
		expect(state.activePath).toBe('/migration');
		expect(state.openPaths).toEqual(['/migration']);
	});

	it('records and removes recent document paths when opening documents', () => {
		clearRecentDocuments();
		expect(get(recentDocumentPaths)).toEqual([]);

		openDocument({ kind: 'doc', path: '/content/Welcome.md', title: 'Welcome.md' });
		expect(get(recentDocumentPaths)).toContain('/content/Welcome.md');

		removeRecentDocument('/content/Welcome.md');
		expect(get(recentDocumentPaths)).not.toContain('/content/Welcome.md');
	});
});

