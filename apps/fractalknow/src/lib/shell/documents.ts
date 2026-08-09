import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import { readLocalStorage, writeLocalStorage } from './storage';
import { logLocalActivity } from './agent-sessions';
import type { DocumentTarget } from './types';

export const LARGE_DOCUMENT_SIZE = 250_000;

export type DocumentLoadState = 'idle' | 'loading' | 'loaded' | 'failed';
export type DocumentSyncState = 'idle' | 'dirty' | 'saving' | 'saved' | 'conflict' | 'failed';

export type DocumentVersion = {
	id: string;
	title: string;
	content: string;
	createdAt: string;
};

export type DocumentMetadata = {
	size: number;
	extension: string;
	mime: string;
	binary: boolean;
	large: boolean;
	updatedAt: string;
};

export type DocumentViewState = {
	sourceSelection?: {
		anchor: number;
		head: number;
	};
	sourceScrollTop?: number;
	richSelection?: {
		from: number;
		to: number;
	};
	richScrollTop?: number;
	/** TipTap/ProseMirror JSON snapshot used to restore undo-capable editor state. */
	richJson?: unknown;
};

export type WorkspaceDocument = DocumentTarget & {
	content: string;
	versions: DocumentVersion[];
	lastSavedContent?: string;
	loadState?: DocumentLoadState;
	syncState?: DocumentSyncState;
	loadError?: string | null;
	metadata?: DocumentMetadata;
	viewState?: DocumentViewState;
};

export type DocumentWorkspaceState = {
	documents: WorkspaceDocument[];
	openPaths: string[];
	activePath: string;
	pendingTarget: DocumentTarget | null;
	notice: string | null;
};

type CloseOptions = {
	force?: boolean;
};

type DeleteOptions = {
	force?: boolean;
};

type EnsureDocumentOptions = {
	loadState?: DocumentLoadState;
	syncState?: DocumentSyncState;
	loadError?: string | null;
};

const binaryExtensions = new Set([
	'avif',
	'gif',
	'jpg',
	'jpeg',
	'pdf',
	'png',
	'webp',
	'zip',
]);

const seedDocuments: WorkspaceDocument[] = [
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
		metadata: createMetadata('/migration', 'Task-wise Tauri + SvelteKit migration plan.'),
	},
	{
		kind: 'doc',
		path: '/content/Welcome.md',
		title: 'Welcome.md',
		content:
			'# Welcome\n\nThis is the first Svelte document context slice. Rich editing and source editing will mount against this store.',
		versions: [],
		lastSavedContent:
			'# Welcome\n\nThis is the first Svelte document context slice. Rich editing and source editing will mount against this store.',
		loadState: 'loaded',
		syncState: 'saved',
		loadError: null,
		metadata: createMetadata(
			'/content/Welcome.md',
			'# Welcome\n\nThis is the first Svelte document context slice. Rich editing and source editing will mount against this store.',
		),
	},
	{
		kind: 'doc',
		path: '/content/Architecture.md',
		title: 'Architecture.md',
		content:
			'# Architecture\n\nDesktop bridge, shell state, shared stores, and document surfaces are being separated into Svelte-native modules.',
		versions: [],
		lastSavedContent:
			'# Architecture\n\nDesktop bridge, shell state, shared stores, and document surfaces are being separated into Svelte-native modules.',
		loadState: 'loaded',
		syncState: 'saved',
		loadError: null,
		metadata: createMetadata(
			'/content/Architecture.md',
			'# Architecture\n\nDesktop bridge, shell state, shared stores, and document surfaces are being separated into Svelte-native modules.',
		),
	},
	{
		kind: 'asset',
		path: '/assets/hero.webp',
		title: 'hero.webp',
		content: '',
		versions: [],
		lastSavedContent: '',
		loadState: 'loaded',
		syncState: 'saved',
		loadError: null,
		metadata: createMetadata('/assets/hero.webp', ''),
	},
];

const initialState: DocumentWorkspaceState = {
	documents: seedDocuments,
	openPaths: ['/migration'],
	activePath: '/migration',
	pendingTarget: null,
	notice: null,
};

export const documentWorkspace = writable<DocumentWorkspaceState>(initialState);

export const workspaceDocuments = derived(documentWorkspace, ($workspace) => $workspace.documents);
export const openDocuments = derived(documentWorkspace, ($workspace) =>
	$workspace.openPaths
		.map((path) => $workspace.documents.find((document) => document.path === path))
		.filter((document): document is WorkspaceDocument => Boolean(document)),
);
export const activeDocument = derived(documentWorkspace, ($workspace) =>
	$workspace.documents.find((document) => document.path === $workspace.activePath),
);

function untitledPath(kind: WorkspaceDocument['kind'], documents: WorkspaceDocument[]): string {
	const base = kind === 'folder' ? '/content/Untitled Folder' : '/content/Untitled.md';
	if (!documents.some((document) => document.path === base)) return base;

	let index = 2;
	while (documents.some((document) => document.path === `${base.replace(/(\.[^.]+)?$/, '')} ${index}.md`)) {
		index += 1;
	}
	return `${base.replace(/(\.[^.]+)?$/, '')} ${index}.md`;
}

function titleFromPath(path: string): string {
	return path.split('/').filter(Boolean).at(-1) ?? path;
}

function parentPath(path: string): string {
	const parent = path.split('/').filter(Boolean).slice(0, -1).join('/');
	return parent ? `/${parent}` : '/';
}

function joinPath(folderPath: string, title: string): string {
	return `${folderPath.replace(/\/$/, '')}/${title}`.replace(/^\/+/, '/');
}

function extensionFromPath(path: string): string {
	return path.split('.').at(-1)?.toLowerCase() ?? '';
}

function byteSize(content: string): number {
	return new TextEncoder().encode(content).length;
}

function mimeFromPath(path: string): string {
	const extension = extensionFromPath(path);
	if (extension === 'md' || extension === 'mdx') return 'text/markdown';
	if (extension === 'json') return 'application/json';
	if (extension === 'svg') return 'image/svg+xml';
	if (extension === 'png') return 'image/png';
	if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
	if (extension === 'webp') return 'image/webp';
	if (extension === 'gif') return 'image/gif';
	if (extension === 'pdf') return 'application/pdf';
	return binaryExtensions.has(extension) ? 'application/octet-stream' : 'text/plain';
}

function createMetadata(path: string, content: string): DocumentMetadata {
	const extension = extensionFromPath(path);
	const size = byteSize(content);
	return {
		size,
		extension,
		mime: mimeFromPath(path),
		binary: binaryExtensions.has(extension),
		large: size > LARGE_DOCUMENT_SIZE,
		updatedAt: new Date().toISOString(),
	};
}

function normalizeDocument(
	document: WorkspaceDocument,
	options: EnsureDocumentOptions = {},
): WorkspaceDocument {
	const metadata = createMetadata(document.path, document.content);
	const loadState =
		options.loadState ?? (metadata.large && !metadata.binary ? 'failed' : (document.loadState ?? 'loaded'));
	const loadError =
		options.loadError ??
		(metadata.large && !metadata.binary
			? `Large file guard: ${metadata.size.toLocaleString()} bytes exceeds ${LARGE_DOCUMENT_SIZE.toLocaleString()} bytes.`
			: (document.loadError ?? null));

	return {
		...document,
		metadata,
		loadState,
		syncState: options.syncState ?? document.syncState ?? (document.dirty ? 'dirty' : 'saved'),
		loadError,
	};
}

function ensureDocument(
	target: DocumentTarget,
	documents: WorkspaceDocument[],
	options: EnsureDocumentOptions = {},
): WorkspaceDocument {
	const existing = documents.find((document) => document.path === target.path);
	if (existing) return normalizeDocument({ ...existing, ...target }, options);

	const content =
		target.kind === 'folder'
			? ''
			: target.kind === 'asset'
				? ''
				: `# ${target.title}\n\nDraft content for ${target.path}.`;
	const document: WorkspaceDocument = {
		...target,
		content,
		versions: [],
		lastSavedContent: content,
		loadState: options.loadState ?? 'loaded',
		syncState: options.syncState ?? 'saved',
		loadError: options.loadError ?? null,
		metadata: createMetadata(target.path, content),
	};
	return normalizeDocument(document, options);
}

export function openDocument(target: DocumentTarget): boolean {
	const currentState = get(documentWorkspace);
	const active = currentState.documents.find((document) => document.path === currentState.activePath);
	if (active?.dirty && active.path !== target.path) {
		documentWorkspace.update((state) => ({
			...state,
			pendingTarget: target,
			notice: `Unsaved changes in ${active.title}. Save or discard before opening ${target.title}.`,
		}));
		return false;
	}

	documentWorkspace.update((state) => {
		const document = ensureDocument(target, state.documents);
		const documents = state.documents.some((item) => item.path === document.path)
			? state.documents.map((item) => (item.path === document.path ? document : item))
			: [...state.documents, document];
		const openPaths = state.openPaths.includes(document.path)
			? state.openPaths
			: [...state.openPaths, document.path];

		return {
			...state,
			documents,
			openPaths,
			activePath: document.path,
			pendingTarget: null,
			notice: `Opened ${document.title}`,
		};
	});
	recordRecentDocument(target.path);
	return true;
}

const RECENT_DOCS_KEY = 'fractalknow:recent-documents';
const MAX_RECENT_DOCS = 12;

function readRecentDocumentPaths(): string[] {
	if (!browser) return [];
	try {
		const val = readLocalStorage(RECENT_DOCS_KEY);
		if (!val) return [];
		return (JSON.parse(val) as string[]).filter((p) => typeof p === 'string' && p.length > 0);
	} catch {
		return [];
	}
}

export const recentDocumentPaths = writable<string[]>(readRecentDocumentPaths());

if (browser) {
	recentDocumentPaths.subscribe((paths) => {
		writeLocalStorage(RECENT_DOCS_KEY, JSON.stringify(paths));
	});
}

export function recordRecentDocument(path: string): void {
	if (!path || path === '/migration') return;
	recentDocumentPaths.update((paths) => [path, ...paths.filter((p) => p !== path)].slice(0, MAX_RECENT_DOCS));
}

export function removeRecentDocument(path: string): void {
	recentDocumentPaths.update((paths) => paths.filter((p) => p !== path));
}

export function clearRecentDocuments(): void {
	recentDocumentPaths.set([]);
}

export function confirmPendingTarget(): void {
	const pendingTarget = get(documentWorkspace).pendingTarget;
	if (!pendingTarget) return;
	discardActiveChanges();
	openDocument(pendingTarget);
}

export function clearPendingTarget(): void {
	documentWorkspace.update((state) => ({ ...state, pendingTarget: null, notice: 'Navigation cancelled' }));
}

export function createDocument(kind: WorkspaceDocument['kind'] = 'doc'): WorkspaceDocument {
	const state = get(documentWorkspace);
	const path = untitledPath(kind, state.documents);
	const title = titleFromPath(path);
	const content = kind === 'folder' ? '' : `# ${title}\n\nStart writing here.`;
	const document: WorkspaceDocument = {
		kind,
		path,
		title,
		dirty: true,
		content,
		versions: [],
		lastSavedContent: '',
		loadState: 'loaded',
		syncState: 'dirty',
		loadError: null,
		metadata: createMetadata(path, content),
	};
	documentWorkspace.update((current) => ({
		...current,
		documents: [...current.documents, document],
		openPaths: [...current.openPaths, document.path],
		activePath: document.path,
		pendingTarget: null,
		notice: `Created ${title}`,
	}));
	void import('$lib/editor/project-files').then(({ createProjectPath }) => {
		void createProjectPath(path, kind === 'folder' ? 'folder' : 'file', content);
	});
	logLocalActivity('edit', `Created ${title}`, [path]);
	return document;
}

export function createDocumentInFolder(
	folderPath: string,
	kind: WorkspaceDocument['kind'] = 'doc',
): WorkspaceDocument {
	const state = get(documentWorkspace);
	const baseTitle = kind === 'folder' ? 'Untitled Folder' : 'Untitled.md';
	let title = baseTitle;
	let path = joinPath(folderPath, title);
	let index = 2;
	while (state.documents.some((document) => document.path === path)) {
		title = kind === 'folder' ? `${baseTitle} ${index}` : `Untitled ${index}.md`;
		path = joinPath(folderPath, title);
		index += 1;
	}

	const content = kind === 'folder' ? '' : `# ${title}\n\nStart writing here.`;
	const document: WorkspaceDocument = {
		kind,
		path,
		title,
		dirty: true,
		content,
		versions: [],
		lastSavedContent: '',
		loadState: 'loaded',
		syncState: 'dirty',
		loadError: null,
		metadata: createMetadata(path, content),
	};
	documentWorkspace.update((current) => ({
		...current,
		documents: [...current.documents, document],
		openPaths: [...current.openPaths, document.path],
		activePath: document.path,
		pendingTarget: null,
		notice: `Created ${title}`,
	}));
	void import('$lib/editor/project-files').then(({ createProjectPath }) => {
		void createProjectPath(path, kind === 'folder' ? 'folder' : 'file', content);
	});
	logLocalActivity('edit', `Created ${title} in ${folderPath}`, [path]);
	return document;
}

/**
 * Replace seed documents with project-backed documents loaded from a real
 * project folder. The currently selected document, open tabs, unsaved edits,
 * versions, and per-document view state are preserved whenever their paths
 * still exist in the incoming project file set.
 */
export function loadProjectDocuments(projectDocuments: WorkspaceDocument[]): void {
	documentWorkspace.update((state) => {
		const incomingPaths = new Set(projectDocuments.map((document) => document.path));
		const kept = state.documents.filter(
			(document) => document.kind === 'migration' || (document.dirty && !incomingPaths.has(document.path)),
		);
		const incoming = projectDocuments.map((document) => {
			const existing = state.documents.find((item) => item.path === document.path);
			if (existing?.dirty) {
				// Never clobber unsaved editor state when the same path loads from disk.
				return normalizeDocument({
					...document,
					content: existing.content,
					dirty: true,
					syncState: 'dirty',
					versions: existing.versions,
					viewState: existing.viewState,
				});
			}
			return normalizeDocument({
				...document,
				versions: existing?.versions ?? document.versions,
				viewState: existing?.viewState ?? document.viewState,
			});
		});

		const documents = [...kept, ...incoming];
		const paths = new Set(documents.map((document) => document.path));
		const openPaths = state.openPaths.filter((path) => paths.has(path));
		const activePath = paths.has(state.activePath)
			? state.activePath
			: (openPaths.at(-1) ?? '/migration');

		return {
			...state,
			documents,
			openPaths: openPaths.length > 0 ? openPaths : ['/migration'],
			activePath,
			pendingTarget: null,
			notice: `Loaded ${incoming.length} project ${incoming.length === 1 ? 'file' : 'files'}`,
		};
	});
}

export function moveWorkspaceDocument(sourcePath: string, targetFolderPath: string): boolean {
	let moved = false;
	documentWorkspace.update((state) => {
		const source = state.documents.find((document) => document.path === sourcePath);
		if (!source || source.kind === 'migration') return { ...state, notice: 'No movable document selected' };
		if (targetFolderPath === sourcePath || targetFolderPath.startsWith(`${sourcePath}/`)) {
			return { ...state, notice: 'Cannot move a folder into itself' };
		}

		const sourceParent = parentPath(source.path);
		const title = titleFromPath(source.path);
		const nextPath = joinPath(targetFolderPath, title);
		if (nextPath === source.path) return { ...state, notice: `${source.title} is already in that folder` };
		if (state.documents.some((document) => document.path === nextPath)) {
			return { ...state, notice: `${title} already exists in ${targetFolderPath}` };
		}

		moved = true;
		const documents = state.documents.map((document) => {
			if (document.path === source.path || document.path.startsWith(`${source.path}/`)) {
				const path = `${nextPath}${document.path.slice(source.path.length)}`;
				return normalizeDocument({ ...document, path, title: titleFromPath(path), dirty: true });
			}
			return document;
		});
		const openPaths = state.openPaths.map((path) =>
			path === source.path || path.startsWith(`${source.path}/`) ? `${nextPath}${path.slice(source.path.length)}` : path,
		);
		const activePath =
			state.activePath === source.path || state.activePath.startsWith(`${source.path}/`)
				? `${nextPath}${state.activePath.slice(source.path.length)}`
				: state.activePath;

		return {
			...state,
			documents,
			openPaths,
			activePath,
			notice: `Moved ${title} from ${sourceParent} to ${targetFolderPath}`,
		};
	});
	if (moved) {
		const nextPath = joinPath(targetFolderPath, titleFromPath(sourcePath));
		void import('$lib/editor/project-files').then(({ renameProjectPath }) => {
			void renameProjectPath(sourcePath, nextPath);
		});
	}
	return moved;
}

export function closeActiveDocument(options: CloseOptions = {}): void {
	documentWorkspace.update((state) => {
		if (state.activePath === '/migration') return { ...state, notice: 'Migration board remains open' };

		const document = state.documents.find((item) => item.path === state.activePath);
		if (document?.dirty && !options.force) {
			return {
				...state,
				notice: `Unsaved changes in ${document.title}. Save or discard before closing.`,
			};
		}

		const openPaths = state.openPaths.filter((path) => path !== state.activePath);
		const activePath = openPaths.at(-1) ?? '/migration';
		return {
			...state,
			openPaths: openPaths.length > 0 ? openPaths : ['/migration'],
			activePath,
			pendingTarget: null,
			notice: 'Closed active tab',
		};
	});
}

export function renameActiveDocument(): void {
	const state = get(documentWorkspace);
	const document = state.documents.find((item) => item.path === state.activePath);
	if (!document || document.kind === 'migration') {
		documentWorkspace.update((current) => ({ ...current, notice: 'No editable document selected' }));
		return;
	}

	const extension = document.title.includes('.') ? '' : '.md';
	const title = document.title.startsWith('Renamed ') ? document.title : `Renamed ${document.title}${extension}`;
	const path = `${document.path.split('/').slice(0, -1).join('/')}/${title}`;
	const from = document.path;

	documentWorkspace.update((current) => ({
		...current,
		documents: current.documents.map((item) =>
			item.path === document.path ? { ...item, path, title, dirty: true } : item,
		),
		openPaths: current.openPaths.map((openPath) => (openPath === document.path ? path : openPath)),
		activePath: path,
		notice: `Renamed to ${title}`,
	}));

	void import('$lib/editor/project-files').then(({ renameProjectPath }) => {
		void renameProjectPath(from, path);
	});
	logLocalActivity('edit', `Renamed ${from} → ${title}`, [from, path]);
}

export function deleteActiveDocument(options: DeleteOptions = {}): void {
	const state = get(documentWorkspace);
	if (state.activePath === '/migration') {
		documentWorkspace.update((current) => ({ ...current, notice: 'Migration board cannot be deleted' }));
		return;
	}

	const document = state.documents.find((item) => item.path === state.activePath);
	if (document?.dirty && !options.force) {
		documentWorkspace.update((current) => ({
			...current,
			notice: `Unsaved changes in ${document.title}. Save or discard before deleting.`,
		}));
		return;
	}

	const deletedPath = state.activePath;
	const documents = state.documents.filter((item) => item.path !== state.activePath);
	const openPaths = state.openPaths.filter((path) => path !== state.activePath);
	const activePath = openPaths.at(-1) ?? '/migration';

	documentWorkspace.update((current) => ({
		...current,
		documents,
		openPaths: openPaths.length > 0 ? openPaths : ['/migration'],
		activePath,
		pendingTarget: null,
		notice: 'Deleted active document',
	}));

	logLocalActivity('edit', `Deleted ${deletedPath}`, [deletedPath]);
	void import('$lib/editor/project-files').then(async ({ deleteProjectPath }) => {
		const ok = await deleteProjectPath(deletedPath);
		if (!ok) {
			const { recordTrashFailures } = await import('./trash');
			const { openDialog } = await import('./store');
			recordTrashFailures([
				{
					path: deletedPath,
					message: 'Delete failed on disk. The path may be locked, missing, or permission-denied.',
					code: 'EDELETE',
				},
			]);
			openDialog('trash-failure');
		}
	});
}

export function saveActiveVersion(): void {
	const state = get(documentWorkspace);
	const document = state.documents.find((item) => item.path === state.activePath);
	if (!document || document.kind === 'migration') {
		documentWorkspace.update((current) => ({ ...current, notice: 'No document version saved' }));
		return;
	}

	const version: DocumentVersion = {
		id: `${document.path}:${document.versions.length + 1}`,
		title: `Version ${document.versions.length + 1}`,
		content: document.content,
		createdAt: new Date().toISOString(),
	};

	documentWorkspace.update((current) => ({
		...current,
		documents: current.documents.map((item) =>
			item.path === document.path
				? normalizeDocument({
						...item,
						dirty: false,
						lastSavedContent: item.content,
						syncState: 'saved',
						versions: [version, ...item.versions],
					})
				: item,
		),
		notice: `Saved ${version.title}`,
	}));

	void import('$lib/editor/project-files').then(({ saveDiskVersion, writeDocumentToDisk }) => {
		void writeDocumentToDisk(document.path, document.content);
		void saveDiskVersion(document.path, document.content, version.title);
	});
}

export function saveActiveDocumentContent(): void {
	const state = get(documentWorkspace);
	const document = state.documents.find((item) => item.path === state.activePath);
	if (!document || document.kind === 'migration') {
		documentWorkspace.update((current) => ({ ...current, notice: 'No document saved' }));
		return;
	}

	// Optimistically commit the buffer so source/rich save semantics stay snappy.
	documentWorkspace.update((current) => ({
		...current,
		documents: current.documents.map((item) =>
			item.path === document.path
				? normalizeDocument({
						...item,
						dirty: false,
						lastSavedContent: item.content,
						syncState: 'saved',
					})
				: item,
		),
		notice: `Saved ${document.title}`,
	}));

	void import('$lib/editor/project-files').then(async ({ writeDocumentToDisk }) => {
		const ok = await writeDocumentToDisk(document.path, document.content);
		if (ok) return;
		documentWorkspace.update((current) => ({
			...current,
			documents: current.documents.map((item) =>
				item.path === document.path
					? normalizeDocument({
							...item,
							dirty: true,
							syncState: 'failed',
						})
					: item,
			),
			notice: `Failed to persist ${document.title} to disk`,
		}));
	});
}

export function updateActiveContent(content: string): void {
	documentWorkspace.update((state) => ({
		...state,
		documents: state.documents.map((document) =>
			document.path === state.activePath
				? normalizeDocument({
						...document,
						content,
						dirty: true,
						syncState: 'dirty',
					})
				: document,
		),
		notice: 'Edited document',
	}));
}

export function updateDocumentViewState(path: string, viewState: DocumentViewState): void {
	documentWorkspace.update((state) => ({
		...state,
		documents: state.documents.map((document) =>
			document.path === path
				? {
						...document,
						viewState: {
							...document.viewState,
							...viewState,
						},
					}
				: document,
		),
	}));
}

export function reloadActiveDocument(): void {
	documentWorkspace.update((state) => {
		const document = state.documents.find((item) => item.path === state.activePath);
		if (!document || document.kind === 'migration') return { ...state, notice: 'No document reloaded' };

		return {
			...state,
			documents: state.documents.map((item) =>
				item.path === document.path
					? normalizeDocument({
							...item,
							content: item.lastSavedContent ?? item.content,
							dirty: false,
							syncState: 'saved',
							loadState: 'loaded',
							loadError: null,
						})
					: item,
			),
			notice: `Reloaded ${document.title}`,
		};
	});
}

export function discardActiveChanges(): void {
	reloadActiveDocument();
}

export function showVersionHistory(): void {
	documentWorkspace.update((state) => {
		const document = state.documents.find((item) => item.path === state.activePath);
		const count = document?.versions.length ?? 0;
		return { ...state, notice: count === 1 ? '1 saved version' : `${count} saved versions` };
	});
}

/**
 * Reconcile external file-watcher changes against dirty editor state.
 * Dirty documents are never clobbered; clean documents reload from disk.
 */
export async function reconcileExternalFileChanges(changedPaths: string[]): Promise<void> {
	if (changedPaths.length === 0) return;
	const { getFilesBridge } = await import('$lib/editor/project-files');
	const bridge = getFilesBridge();
	const state = get(documentWorkspace);

	for (const path of changedPaths) {
		const existing = state.documents.find((document) => document.path === path);
		if (existing?.dirty) {
			documentWorkspace.update((current) => ({
				...current,
				documents: current.documents.map((item) =>
					item.path === path
						? normalizeDocument({
								...item,
								syncState: 'conflict',
								loadError: 'Disk changed while this document has unsaved edits.',
							})
						: item,
				),
				notice: `Conflict: ${path} changed on disk`,
			}));
			continue;
		}

		try {
			const body = await bridge.read(path);
			if (!body || typeof body !== 'object' || !('content' in body)) continue;
			const content = (body as { content: string }).content;
			documentWorkspace.update((current) => {
				const has = current.documents.some((item) => item.path === path);
				if (!has) return current;
				return {
					...current,
					documents: current.documents.map((item) =>
						item.path === path
							? normalizeDocument({
									...item,
									content,
									lastSavedContent: content,
									dirty: false,
									syncState: 'saved',
									loadState: 'loaded',
									loadError: null,
								})
							: item,
					),
					notice: `Reloaded ${path} from disk`,
				};
			});
		} catch {
			// Path may have been deleted; refresh full tree.
			const { refreshProjectDocumentsFromDisk } = await import('$lib/editor/project-files');
			await refreshProjectDocumentsFromDisk();
			return;
		}
	}
}

export function isSkillDocument(document: WorkspaceDocument | null | undefined): boolean {
	if (!document) return false;
	return /(?:^|\/)SKILL\.md$/i.test(document.path) || document.path.includes('/.ok/skills/');
}

export function isDiffableDocument(document: WorkspaceDocument | null | undefined): boolean {
	if (!document) return false;
	return document.kind === 'doc' && Boolean(document.lastSavedContent !== undefined);
}
