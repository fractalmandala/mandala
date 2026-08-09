import { derived, get, writable } from 'svelte/store';
import type { Schema } from '@tiptap/pm/model';
import type { Doc as YDoc } from 'yjs';
import { documentWorkspace } from '$lib/shell/documents';
import { createBaseExtensions } from './extensions';
import { editorHtmlToMarkdown } from './serialization';

export type CollabConnectionStatus =
	| 'idle'
	| 'connecting'
	| 'connected'
	| 'synced'
	| 'offline'
	| 'reconnecting'
	/**
	 * Reserved for future server-reported divergence. Yjs CRDTs merge edits
	 * automatically, so there is no local conflict trigger — the former
	 * `markCollabConflict` helper was dead code and has been removed rather
	 * than wired to a heuristic that would cry wolf on normal merges.
	 */
	| 'conflict'
	| 'error'
	| 'disabled';

export type CollabRemoteUser = {
	clientId: number;
	name: string;
	color: string;
};

export type CollabState = {
	status: CollabConnectionStatus;
	documentPath: string | null;
	serverUrl: string | null;
	error: string | null;
	offlineCached: boolean;
	remoteUsers: CollabRemoteUser[];
	lastSyncedAt: string | null;
	reconnectAttempts: number;
};

export type CollabSession = {
	doc: YDoc;
	provider: {
		destroy: () => void;
		awareness?: {
			setLocalStateField: (field: string, value: unknown) => void;
			getStates: () => Map<number, Record<string, unknown>>;
			on: (event: string, cb: () => void) => void;
			off: (event: string, cb: () => void) => void;
		};
		on: (event: string, cb: (...args: unknown[]) => void) => void;
		off: (event: string, cb: (...args: unknown[]) => void) => void;
	} | null;
	fragmentName: string;
};

const initialState: CollabState = {
	status: 'idle',
	documentPath: null,
	serverUrl: null,
	error: null,
	offlineCached: false,
	remoteUsers: [],
	lastSyncedAt: null,
	reconnectAttempts: 0,
};

export const collabState = writable<CollabState>(initialState);
export const collabStatus = derived(collabState, ($state) => $state.status);
export const collabRemoteUsers = derived(collabState, ($state) => $state.remoteUsers);

const sessions = new Map<string, CollabSession>();
const USER_COLORS = ['#0f766e', '#7c3aed', '#b45309', '#be123c', '#0369a1', '#4d7c0f'];

/**
 * Pending debounced store syncs per document path. Y.Doc updates arrive in
 * bursts; coalesce before converting the fragment to Markdown.
 */
const pendingSyncs = new Map<string, ReturnType<typeof setTimeout>>();
const STORE_SYNC_DEBOUNCE_MS = 25;

let workspaceWatcherStarted = false;
let watchedOpenPaths: string[] | null = null;
let collabSchemaPromise: Promise<Schema> | null = null;

function getCollabSchema(): Promise<Schema> {
	if (!collabSchemaPromise) {
		collabSchemaPromise = Promise.all([import('@tiptap/core'), createBaseExtensions()]).then(
			([core, extensions]) => core.getSchema(extensions),
		);
	}
	return collabSchemaPromise;
}

/**
 * Convert a session's Y.XmlFragment to canonical Markdown headlessly (no
 * mounted editor) via y-prosemirror → schema DOM serialization → MD bridge.
 */
async function fragmentToMarkdown(session: CollabSession): Promise<string | null> {
	const fragment = session.doc.getXmlFragment(session.fragmentName);
	if (fragment.length === 0) return null;
	if (typeof document === 'undefined') return null;
	try {
		const [{ DOMSerializer }, { yXmlFragmentToProseMirrorRootNode }, schema] = await Promise.all([
			import('@tiptap/pm/model'),
			import('y-prosemirror'),
			getCollabSchema(),
		]);
		const pmNode = yXmlFragmentToProseMirrorRootNode(fragment, schema);
		const serialized = DOMSerializer.fromSchema(schema).serializeFragment(pmNode.content);
		const host = document.createElement('div');
		host.appendChild(serialized);
		return editorHtmlToMarkdown(host.innerHTML);
	} catch {
		return null;
	}
}

/**
 * Push the current fragment content into the document workspace store. This
 * is the persistence bridge for updates that land on cached sessions whose
 * rich editor is not mounted (previously those updates never reached the
 * store, so disk persistence silently missed them).
 */
async function syncSessionToDocumentStore(documentPath: string): Promise<void> {
	const session = sessions.get(documentPath);
	if (!session) return;
	const markdown = await fragmentToMarkdown(session);
	if (markdown === null) return;
	documentWorkspace.update((workspace) => {
		const index = workspace.documents.findIndex((entry) => entry.path === documentPath);
		if (index === -1) return workspace;
		const current = workspace.documents[index];
		// Guard: identical content must not churn the store (also breaks the
		// potential echo loop with the mounted editor's own onUpdate path).
		if (!current || current.content === markdown) return workspace;
		const documents = workspace.documents.slice();
		documents[index] = {
			...current,
			content: markdown,
			syncState:
				current.syncState === 'saved' || current.syncState === 'idle' || !current.syncState
					? 'dirty'
					: current.syncState,
		};
		return { ...workspace, documents };
	});
}

function scheduleDocumentSync(documentPath: string): void {
	if (pendingSyncs.has(documentPath)) return;
	pendingSyncs.set(
		documentPath,
		setTimeout(() => {
			pendingSyncs.delete(documentPath);
			void syncSessionToDocumentStore(documentPath);
		}, STORE_SYNC_DEBOUNCE_MS),
	);
}

/**
 * Watch open document tabs and stop per-path sessions when their tab closes.
 * Only *transitions* (previously open, now closed) reap a session — sessions
 * for never-opened paths are left alone.
 */
function ensureWorkspaceWatcher(): void {
	if (workspaceWatcherStarted) return;
	workspaceWatcherStarted = true;
	documentWorkspace.subscribe((workspace) => {
		const openPaths = workspace.openPaths;
		const previous = watchedOpenPaths;
		watchedOpenPaths = [...openPaths];
		if (!previous) return;
		for (const closedPath of previous.filter((path) => !openPaths.includes(path))) {
			if (sessions.has(closedPath)) void stopCollabSession(closedPath);
		}
	});
}

function colorFor(name: string): string {
	let hash = 0;
	for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i) * 17) % USER_COLORS.length;
	return USER_COLORS[hash] ?? USER_COLORS[0];
}

export function getCollabUser(): { name: string; color: string } {
	const name =
		(typeof localStorage !== 'undefined' && localStorage.getItem('fractalknow:collab-name')) ||
		'Local user';
	return { name, color: colorFor(name) };
}

/**
 * Start (or reuse) a collaboration session for a document path.
 * When `serverUrl` is empty, runs offline-only with IndexedDB persistence.
 */
export async function startCollabSession(
	documentPath: string,
	serverUrl: string | null,
): Promise<CollabSession> {
	ensureWorkspaceWatcher();
	const existing = sessions.get(documentPath);
	if (existing) {
		collabState.update((state) => ({
			...state,
			documentPath,
			serverUrl,
			status: serverUrl ? state.status : 'offline',
		}));
		return existing;
	}

	collabState.set({
		...initialState,
		documentPath,
		serverUrl,
		status: serverUrl ? 'connecting' : 'offline',
	});

	const Y = await import('yjs');
	const doc = new Y.Doc();
	const fragmentName = 'default';
	let provider: CollabSession['provider'] = null;
	let offlineCached = false;

	if (typeof indexedDB !== 'undefined') {
		try {
			const { IndexeddbPersistence } = await import('y-indexeddb');
			const persistence = new IndexeddbPersistence(`fractalknow:${documentPath}`, doc);
			await new Promise<void>((resolve) => {
				persistence.once('synced', () => {
					offlineCached = true;
					resolve();
				});
				// Offline bootstrap should not hang forever.
				setTimeout(() => resolve(), 250);
			});
		} catch {
			// IndexedDB may be unavailable in some test environments.
		}
	}

	if (serverUrl) {
		try {
			const { HocuspocusProvider } = await import('@hocuspocus/provider');
			const room = documentPath.replace(/^\//, '') || 'document';
			const hocus = new HocuspocusProvider({
				url: serverUrl,
				name: room,
				document: doc,
			});
			provider = hocus as unknown as CollabSession['provider'];

			const onStatus = (payload: { status?: string }) => {
				const status = payload?.status ?? 'connecting';
				collabState.update((state) => ({
					...state,
					status:
						status === 'connected'
							? 'connected'
							: status === 'connecting'
								? 'connecting'
								: 'reconnecting',
					error: null,
				}));
			};
			const onSynced = () => {
				collabState.update((state) => ({
					...state,
					status: 'synced',
					lastSyncedAt: new Date().toISOString(),
					reconnectAttempts: 0,
					offlineCached: true,
				}));
			};
			const onDisconnect = () => {
				collabState.update((state) => ({
					...state,
					status: 'reconnecting',
					reconnectAttempts: state.reconnectAttempts + 1,
				}));
			};
			const onAwareness = () => {
				const users: CollabRemoteUser[] = [];
				const states = hocus.awareness?.getStates?.() ?? new Map();
				for (const [clientId, value] of states) {
					const user = (value as { user?: { name?: string; color?: string } }).user;
					if (!user?.name) continue;
					users.push({
						clientId: Number(clientId),
						name: user.name,
						color: user.color ?? colorFor(user.name),
					});
				}
				collabState.update((state) => ({ ...state, remoteUsers: users }));
			};

			hocus.on('status', onStatus);
			hocus.on('synced', onSynced);
			hocus.on('disconnect', onDisconnect);
			hocus.awareness?.setLocalStateField('user', getCollabUser());
			hocus.awareness?.on('change', onAwareness);
		} catch (error) {
			collabState.update((state) => ({
				...state,
				status: 'error',
				error: error instanceof Error ? error.message : String(error),
			}));
		}
	} else {
		collabState.update((state) => ({
			...state,
			status: 'offline',
			offlineCached,
		}));
	}

	const session: CollabSession = { doc, provider, fragmentName };
	// Bridge every Y.Doc update (local or remote, mounted or not) into the
	// document store so Markdown/disk persistence never misses cached sessions.
	doc.on('update', () => scheduleDocumentSync(documentPath));
	sessions.set(documentPath, session);
	return session;
}

export async function stopCollabSession(documentPath: string | null = null): Promise<void> {
	const targets = documentPath ? [documentPath] : [...sessions.keys()];
	for (const path of targets) {
		const session = sessions.get(path);
		if (!session) continue;
		const pending = pendingSyncs.get(path);
		if (pending) {
			clearTimeout(pending);
			pendingSyncs.delete(path);
		}
		try {
			session.provider?.destroy();
		} catch {
			// ignore
		}
		session.doc.destroy();
		sessions.delete(path);
	}
	if (sessions.size === 0) {
		collabState.set(initialState);
	}
}

export function getActiveCollabSession(documentPath: string): CollabSession | null {
	return sessions.get(documentPath) ?? null;
}

export function resetCollabState(): void {
	void stopCollabSession();
	collabState.set(initialState);
}

export function readCollabSnapshot(): CollabState {
	return get(collabState);
}
