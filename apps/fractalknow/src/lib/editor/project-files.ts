import type { OkDesktopBridge, UnsupportedDesktopFeature } from '$lib/desktop';
import {
	loadProjectDocuments,
	type WorkspaceDocument,
} from '$lib/shell/documents';
import { get, writable } from 'svelte/store';
import { projectState } from '$lib/shell/projects';

export type WorkspaceLoadState = 'idle' | 'loading' | 'error';

/** Load state of the project-backed workspace tree, consumed by the sidebar
 *  per-section loading-skeleton and error visuals. */
export const workspaceLoadState = writable<{ state: WorkspaceLoadState; error: string | null }>({
	state: 'idle',
	error: null,
});

export type ProjectFileEntry = {
	path: string;
	name: string;
	kind: 'file' | 'folder' | string;
	size: number;
	extension: string;
	binary: boolean;
	modifiedAt?: string | null;
};

export type ProjectFileContent = {
	path: string;
	content: string;
	size: number;
	binary: boolean;
	encoding: string;
	modifiedAt?: string | null;
};

export type ProjectVersionEntry = {
	id: string;
	title: string;
	createdAt: string;
	size: number;
};

export type ProjectFilesChangedEvent = {
	root: string;
	paths: string[];
	kind: string;
	changedAt: string;
};

type FilesBridge = {
	list(): Promise<ProjectFileEntry[] | UnsupportedDesktopFeature>;
	read(path: string): Promise<ProjectFileContent | UnsupportedDesktopFeature>;
	write(path: string, content: string): Promise<ProjectFileContent | UnsupportedDesktopFeature>;
	create(path: string, kind: 'file' | 'folder', content?: string): Promise<ProjectFileEntry | UnsupportedDesktopFeature>;
	rename(from: string, to: string): Promise<ProjectFileEntry | UnsupportedDesktopFeature>;
	remove(path: string): Promise<{ ok: true } | UnsupportedDesktopFeature>;
	listVersions(path: string): Promise<ProjectVersionEntry[] | UnsupportedDesktopFeature>;
	saveVersion(path: string, content: string, title?: string): Promise<ProjectVersionEntry | UnsupportedDesktopFeature>;
	restoreVersion(path: string, versionId: string): Promise<ProjectFileContent | UnsupportedDesktopFeature>;
	watch(): Promise<{ ok: true } | UnsupportedDesktopFeature>;
	stopWatch(): Promise<{ ok: true } | UnsupportedDesktopFeature>;
	setProjectPath?(path: string): Promise<{ ok: true } | UnsupportedDesktopFeature>;
	syncBundledSkills?(): Promise<BundleSyncReport>;
};

export type BundleSyncReport = {
	version: number;
	filesCopied: number;
	skipped: boolean;
	reason: string | null;
};

const browserVirtualFs = new Map<string, string>();

function isUnsupported(value: unknown): value is UnsupportedDesktopFeature {
	return Boolean(
		value
			&& typeof value === 'object'
			&& (value as { ok?: unknown }).ok === false
			&& typeof (value as { feature?: unknown }).feature === 'string',
	);
}

function virtualList(): ProjectFileEntry[] {
	const folders = new Set<string>();
	const files: ProjectFileEntry[] = [];
	for (const path of browserVirtualFs.keys()) {
		const parts = path.split('/').filter(Boolean);
		for (let i = 1; i < parts.length; i += 1) {
			folders.add(`/${parts.slice(0, i).join('/')}`);
		}
		const name = parts.at(-1) ?? path;
		const extension = name.includes('.') ? (name.split('.').at(-1) ?? '') : '';
		files.push({
			path,
			name,
			kind: 'file',
			size: new TextEncoder().encode(browserVirtualFs.get(path) ?? '').length,
			extension,
			binary: false,
			modifiedAt: new Date().toISOString(),
		});
	}
	for (const folder of folders) {
		files.push({
			path: folder,
			name: folder.split('/').filter(Boolean).at(-1) ?? folder,
			kind: 'folder',
			size: 0,
			extension: '',
			binary: false,
			modifiedAt: null,
		});
	}
	return files.sort((a, b) => a.path.localeCompare(b.path));
}

function seedVirtualProject(): void {
	if (browserVirtualFs.size > 0) return;
	browserVirtualFs.set(
		'/content/Welcome.md',
		'# Welcome\n\nProject-backed browser preview content.\n\n```mermaid\ngraph TD\n  A[Markdown] --> B[TipTap AST]\n```\n',
	);
	browserVirtualFs.set(
		'/content/Architecture.md',
		'# Architecture\n\nMarkdown is the canonical disk format.\n\n- Dual-layer serialization\n- Yjs collaboration\n- Project filesystem bridge\n',
	);
	browserVirtualFs.set(
		'/.ok/skills/example/SKILL.md',
		'---\nname: example\ndescription: Demo skill for FractalKnow\n---\n\n# Example skill\n\nThis skill file is rendered by the skill viewer.\n',
	);
}

export function createBrowserFilesBridge(): FilesBridge {
	seedVirtualProject();
	return {
		async list() {
			return virtualList();
		},
		async read(path) {
			const normalized = path.startsWith('/') ? path : `/${path}`;
			const content = browserVirtualFs.get(normalized);
			if (content === undefined) {
				return { ok: false, reason: 'missing-backend', feature: 'files.read', message: 'Not found' };
			}
			return {
				path: normalized,
				content,
				size: new TextEncoder().encode(content).length,
				binary: false,
				encoding: 'utf-8',
				modifiedAt: new Date().toISOString(),
			};
		},
		async write(path, content) {
			const normalized = path.startsWith('/') ? path : `/${path}`;
			browserVirtualFs.set(normalized, content);
			return {
				path: normalized,
				content,
				size: new TextEncoder().encode(content).length,
				binary: false,
				encoding: 'utf-8',
				modifiedAt: new Date().toISOString(),
			};
		},
		async create(path, kind, content = '') {
			const normalized = path.startsWith('/') ? path : `/${path}`;
			if (kind === 'file') browserVirtualFs.set(normalized, content);
			const name = normalized.split('/').filter(Boolean).at(-1) ?? normalized;
			return {
				path: normalized,
				name,
				kind,
				size: new TextEncoder().encode(content).length,
				extension: name.includes('.') ? (name.split('.').at(-1) ?? '') : '',
				binary: false,
				modifiedAt: new Date().toISOString(),
			};
		},
		async rename(from, to) {
			const source = from.startsWith('/') ? from : `/${from}`;
			const target = to.startsWith('/') ? to : `/${to}`;
			const content = browserVirtualFs.get(source) ?? '';
			browserVirtualFs.delete(source);
			browserVirtualFs.set(target, content);
			const name = target.split('/').filter(Boolean).at(-1) ?? target;
			return {
				path: target,
				name,
				kind: 'file',
				size: new TextEncoder().encode(content).length,
				extension: name.includes('.') ? (name.split('.').at(-1) ?? '') : '',
				binary: false,
				modifiedAt: new Date().toISOString(),
			};
		},
		async remove(path) {
			const normalized = path.startsWith('/') ? path : `/${path}`;
			browserVirtualFs.delete(normalized);
			return { ok: true };
		},
		async listVersions() {
			return [];
		},
		async saveVersion() {
			return {
				id: `v-${Date.now()}`,
				title: 'Browser version',
				createdAt: new Date().toISOString(),
				size: 0,
			};
		},
		async restoreVersion() {
			return {
				path: '/content/Welcome.md',
				content: browserVirtualFs.get('/content/Welcome.md') ?? '',
				size: 0,
				binary: false,
				encoding: 'utf-8',
			};
		},
		async watch() {
			return { ok: true };
		},
		async stopWatch() {
			return { ok: true };
		},
	};
}

export function createTauriFilesBridge(invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>): FilesBridge {
	return {
		list: () => invoke('list_project_files'),
		read: (path) => invoke('read_project_file', { path }),
		write: (path, content) => invoke('write_project_file', { opts: { path, content } }),
		create: (path, kind, content) =>
			invoke('create_project_entry', { opts: { path, kind, content } }),
		rename: (from, to) => invoke('rename_project_entry', { opts: { from, to } }),
		remove: (path) => invoke('delete_project_entry', { opts: { path } }),
		listVersions: (path) => invoke('list_document_versions', { path }),
		saveVersion: (path, content, title) =>
			invoke('save_document_version', { opts: { path, content, title } }),
		restoreVersion: (path, versionId) =>
			invoke('restore_document_version', { opts: { path, versionId } }),
		watch: () => invoke('watch_project_files'),
		stopWatch: () => invoke('stop_watch_project_files'),
		setProjectPath: (path) => invoke('set_project_path', { path }),
		syncBundledSkills: () => invoke('sync_bundled_skills'),
	};
}

let filesBridge: FilesBridge = createBrowserFilesBridge();
let watchUnsub: (() => void) | null = null;

export function getFilesBridge(): FilesBridge {
	return filesBridge;
}

export async function connectProjectFilesBridge(bridge: OkDesktopBridge): Promise<void> {
	if (bridge.runtime === 'tauri') {
		try {
			const core = await import('@tauri-apps/api/core');
			if (typeof core.invoke !== 'function') {
				throw new Error('Tauri invoke unavailable');
			}
			filesBridge = createTauriFilesBridge((command, args) => core.invoke(command, args));
			const projectPath = get(projectState).path || bridge.config.projectPath;
			if (projectPath && filesBridge.setProjectPath) {
				await filesBridge.setProjectPath(projectPath);
			}
			// Materialize the bundled skills/agents/commands into the project
			// before the first listing so the pipeline surfaces them immediately.
			// Never throws (browser runtime / sync failure degrade to state only).
			const { syncBundledSkillsPipeline } = await import('$lib/shell/skills');
			await syncBundledSkillsPipeline(filesBridge);
			// Connect the agent-activity log (T045b): project-local .ok/activity
			// JSONL store backing the right-panel Agent sessions view.
			// Never throws (browser runtime degrades to 'unavailable' state).
			const { connectActivityBridgeFromRuntime } = await import('$lib/shell/agent-sessions');
			await connectActivityBridgeFromRuntime();
			await filesBridge.watch();
			await refreshProjectDocumentsFromDisk();
			await attachProjectFileWatcher();
			return;
		} catch {
			// Fall through to browser virtual FS when the native bridge is mocked/unavailable.
		}
	}

	filesBridge = createBrowserFilesBridge();
	await refreshProjectDocumentsFromDisk();
}

export async function refreshProjectDocumentsFromDisk(): Promise<void> {
	workspaceLoadState.set({ state: 'loading', error: null });
	let listed: ProjectFileEntry[] | UnsupportedDesktopFeature;
	try {
		listed = await filesBridge.list();
	} catch (error) {
		workspaceLoadState.set({
			state: 'error',
			error: error instanceof Error ? error.message : String(error),
		});
		return;
	}
	if (isUnsupported(listed) || !Array.isArray(listed)) {
		workspaceLoadState.set({
			state: 'error',
			error: 'message' in listed && typeof listed.message === 'string' ? listed.message : 'The project file bridge is unavailable.',
		});
		return;
	}

	const documents: WorkspaceDocument[] = [];
	for (const entry of listed) {
		if (entry.kind === 'folder') {
			documents.push({
				kind: 'folder',
				path: entry.path,
				title: entry.name,
				content: '',
				versions: [],
				lastSavedContent: '',
				loadState: 'loaded',
				syncState: 'saved',
				loadError: null,
			});
			continue;
		}
		if (entry.binary) {
			documents.push({
				kind: 'asset',
				path: entry.path,
				title: entry.name,
				content: '',
				versions: [],
				lastSavedContent: '',
				loadState: 'loaded',
				syncState: 'saved',
				loadError: null,
			});
			continue;
		}
		const body = await filesBridge.read(entry.path);
		if (isUnsupported(body) || !('content' in body)) continue;
		const isSkill = /(?:^|\/)SKILL\.md$/i.test(entry.path) || entry.path.includes('/.ok/skills/');
		documents.push({
			kind: isSkill ? 'doc' : 'doc',
			path: entry.path,
			title: entry.name,
			content: body.content,
			versions: [],
			lastSavedContent: body.content,
			loadState: 'loaded',
			syncState: 'saved',
			loadError: null,
			metadata: {
				size: body.size,
				extension: entry.extension,
				mime: entry.extension === 'md' || entry.extension === 'mdx' ? 'text/markdown' : 'text/plain',
				binary: false,
				large: body.size > 250_000,
				updatedAt: body.modifiedAt ?? new Date().toISOString(),
			},
		});
	}

	loadProjectDocuments(documents);
}

export async function readProjectPath(path: string) {
	return filesBridge.read(path);
}

export async function writeProjectPath(path: string, content: string) {
	return filesBridge.write(path, content);
}

export async function listProjectFiles(): Promise<ProjectFileEntry[]> {
	const res = await filesBridge.list();
	return isUnsupported(res) ? [] : res;
}

export async function writeDocumentToDisk(path: string, content: string): Promise<boolean> {
	const result = await filesBridge.write(path, content);
	return !isUnsupported(result);
}

export async function createProjectPath(
	path: string,
	kind: 'file' | 'folder',
	content = '',
): Promise<boolean> {
	const result = await filesBridge.create(path, kind, content);
	if (isUnsupported(result)) return false;
	await refreshProjectDocumentsFromDisk();
	return true;
}

export async function renameProjectPath(from: string, to: string): Promise<boolean> {
	const result = await filesBridge.rename(from, to);
	if (isUnsupported(result)) return false;
	await refreshProjectDocumentsFromDisk();
	return true;
}

export async function deleteProjectPath(path: string): Promise<boolean> {
	const result = await filesBridge.remove(path);
	if (isUnsupported(result)) return false;
	await refreshProjectDocumentsFromDisk();
	return true;
}

export async function saveDiskVersion(path: string, content: string, title?: string) {
	return filesBridge.saveVersion(path, content, title);
}

export async function listDiskVersions(path: string) {
	const result = await filesBridge.listVersions(path);
	return isUnsupported(result) ? [] : result;
}

export async function restoreDiskVersion(path: string, versionId: string) {
	return filesBridge.restoreVersion(path, versionId);
}

async function attachProjectFileWatcher(): Promise<void> {
	watchUnsub?.();
	try {
		const { listen } = await import('@tauri-apps/api/event');
		const stop = await listen<ProjectFilesChangedEvent>('ok:project-files-changed', async (event) => {
			const { reconcileExternalFileChanges } = await import('$lib/shell/documents');
			await reconcileExternalFileChanges(event.payload.paths ?? []);
		});
		watchUnsub = () => {
			stop();
		};
	} catch {
		// Browser preview has no watcher events.
	}
}
