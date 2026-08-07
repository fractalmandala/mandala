import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import * as mockIpc from './ipc-mock';
import type {
	BrowserAutofillParams,
	BrowserEvent,
	BrowserNavigateParams,
	BrowserTabCreateParams,
	BrowserTabParams,
	BrowserTabReorderParams,
	BrowserViewportRect,
	BrowserWindowInfo,
	Tab
} from './modules/browser/types';
import type {
	MediaFolder,
	MediaFsEvent,
	MediaImportMode,
	MediaImportProgress,
	MediaItem,
	MediaLibraryInfo,
	MediaQuery,
	MediaTag
} from './modules/media/types';
import type { SharedAnnotation, SharedAnnotationInput } from './modules/annotations/types';

// Helper to check if running inside Tauri webview
export function isTauri(): boolean {
	return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function safeListen<T>(eventName: string, callback: (payload: T) => void): () => void {
	const unlistenPromise = listen<T>(eventName, event => callback(event.payload)).catch(error => {
		console.error(`Could not register native event listener ${eventName}:`, error);
		return null;
	});
	return () => {
		void unlistenPromise.then(unlisten => unlisten?.()).catch(error => {
			console.error(`Could not remove native event listener ${eventName}:`, error);
		});
	};
}

export interface FileEntry {
	name: string;
	path: string;
	isDir: boolean;
	size: number;
}

export interface TerminalPtyEvent {
	sessionId: string;
	kind: 'data' | 'exit' | 'error';
	data: string;
}

export function isFilesystemAccessDenied(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	return message.startsWith('FS_ACCESS_DENIED:');
}

export async function listAuthorizedPaths(): Promise<string[]> {
	if (isTauri()) return invoke<string[]>('list_authorized_paths');
	return mockIpc.listAuthorizedPaths();
}

export async function revokeAuthorizedPath(path: string): Promise<boolean> {
	if (isTauri()) return invoke<boolean>('revoke_authorized_path', { path });
	return mockIpc.revokeAuthorizedPath(path);
}

export async function requestDirectoryAccess(requestedPath = ''): Promise<string | null> {
	if (isTauri()) return invoke<string | null>('request_directory_access', { requestedPath });
	return mockIpc.requestDirectoryAccess(requestedPath);
}

export async function listDirectory(path: string): Promise<FileEntry[]> {
	if (isTauri()) {
		try {
			const entries = await invoke<FileEntry[]>('list_directory', { path });
			return entries.map(e => ({
				name: e.name,
				path: e.path,
				isDir: e.isDir,
				size: e.size
			}));
		} catch (error) {
			console.error('Tauri listDirectory error:', error);
			throw error;
		}
	} else {
		return mockIpc.listDirectory(path);
	}
}

export async function readFile(path: string): Promise<string> {
	if (isTauri()) {
		return invoke<string>('read_file', { path });
	} else {
		return mockIpc.readFile(path);
	}
}

export async function writeFile(path: string, content: string): Promise<void> {
	if (isTauri()) {
		return invoke<void>('write_file', { path, content });
	} else {
		return mockIpc.writeFile(path, content);
	}
}

export async function createFile(path: string, content: string): Promise<void> {
	if (isTauri()) {
		return invoke<void>('create_file', { path, content });
	}
	return mockIpc.createFile(path, content);
}

export async function terminalOpen(cwd: string, cols: number, rows: number): Promise<string> {
	if (isTauri()) return invoke<string>('terminal_open', { cwd, cols, rows });
	return mockIpc.terminalOpen(cwd, cols, rows);
}

export async function terminalWrite(sessionId: string, data: string): Promise<void> {
	if (isTauri()) return invoke<void>('terminal_write', { sessionId, data });
	return mockIpc.terminalWrite(sessionId, data);
}

export async function terminalResize(sessionId: string, cols: number, rows: number): Promise<void> {
	if (isTauri()) return invoke<void>('terminal_resize', { sessionId, cols, rows });
	return mockIpc.terminalResize(sessionId, cols, rows);
}

export async function terminalClose(sessionId: string): Promise<void> {
	if (isTauri()) return invoke<void>('terminal_close', { sessionId });
	return mockIpc.terminalClose(sessionId);
}

export function onTerminalEvent(callback: (event: TerminalPtyEvent) => void): () => void {
	if (isTauri()) return safeListen<TerminalPtyEvent>('terminal://event', callback);
	return mockIpc.onTerminalEvent(callback);
}

// --- New AI & Marketplace IPC Gateways (Rule 7 Gateway Module) ---

export async function selectDownloadDirectory(title = 'Select Folder'): Promise<string | null> {
	if (isTauri()) {
		return invoke<string | null>('select_download_directory', { title });
	} else {
		return mockIpc.selectDownloadDirectory(title);
	}
}

export async function runLocalModel(modelPath: string, mmprojPath: string | null | undefined, prompt: string): Promise<void> {
	if (isTauri()) {
		return invoke<void>('run_local_model', { modelPath, mmprojPath: mmprojPath || null, prompt });
	} else {
		return mockIpc.runLocalModel(modelPath, mmprojPath, prompt);
	}
}

export async function downloadModel(url: string, targetPath: string): Promise<void> {
	if (isTauri()) {
		return invoke<void>('download_model', { url, targetPath });
	} else {
		return mockIpc.downloadModel(url, targetPath);
	}
}

export async function installSkill(url: string, name: string, workspacePath: string): Promise<void> {
	if (isTauri()) {
		return invoke<void>('install_skill', { url, name, workspacePath });
	} else {
		return mockIpc.installSkill(url, name, workspacePath);
	}
}

// --- Event Listeners Subscriptions (Rules 4 & 7 Gateway) ---

export function onAiChunk(callback: (chunk: string) => void): () => void {
	if (isTauri()) {
		return safeListen('ai-chunk', callback);
	} else {
		return mockIpc.onAiChunk(callback);
	}
}

export function onAiDone(callback: () => void): () => void {
	if (isTauri()) {
		return safeListen('ai-done', callback);
	} else {
		return mockIpc.onAiDone(callback);
	}
}

// Fires when a stream fails server-side (bad API key, unreachable host, model process crash,
// etc.) instead of silently going nowhere — the payload is a human-readable error message.
export function onAiError(callback: (message: string) => void): () => void {
	if (isTauri()) {
		return safeListen('ai-error', callback);
	} else {
		return mockIpc.onAiError(callback);
	}
}

export type DictationEvent = {
	type: 'state' | 'partial' | 'final' | 'error';
	phase?: 'idle' | 'listening';
	text?: string;
	code?: string;
	detail?: string;
};

export async function startDictation(locale: string): Promise<void> {
	if (isTauri()) return invoke<void>('start_dictation', { locale });
	return mockIpc.startDictation(locale);
}

export async function stopDictation(): Promise<void> {
	if (isTauri()) return invoke<void>('stop_dictation');
	return mockIpc.stopDictation();
}

export async function cancelDictation(): Promise<void> {
	if (isTauri()) return invoke<void>('cancel_dictation');
	return mockIpc.cancelDictation();
}

export function onDictationEvent(callback: (event: DictationEvent) => void): () => void {
	if (isTauri()) return safeListen<DictationEvent>('dictation://event', callback);
	return mockIpc.onDictationEvent(callback);
}

export interface AiStreamListeners {
	onChunk(chunk: string): void;
	onDone(): void;
	onError(message: string): void;
	onUsage(usage: TokenUsage): void;
}

// Unlike the convenience listeners above, this is awaited by the AI kernel before it
// enables sending. A failed native registration is therefore retryable instead of leaving
// the UI in a permanent "streaming" state with no terminal-event listener.
export async function registerAiStreamListeners(listeners: AiStreamListeners): Promise<() => void> {
	if (!isTauri()) return mockIpc.registerAiStreamListeners(listeners);
	const unlistens = await Promise.all([
		listen<string>('ai-chunk', event => listeners.onChunk(event.payload)),
		listen<void>('ai-done', () => listeners.onDone()),
		listen<string>('ai-error', event => listeners.onError(event.payload)),
		listen<TokenUsage>('ai-usage', event => listeners.onUsage(event.payload)),
	]);
	return () => {
		for (const unlisten of unlistens) void unlisten();
	};
}

// Cancels whatever AI stream is currently in flight (local sidecar or API provider).
// The backend stops emitting ai-chunk/ai-done for that stream as soon as it notices —
// immediately for the local sidecar (its process gets killed), at the next chunk/line
// for an API provider.
export async function cancelAiStream(): Promise<void> {
	if (isTauri()) {
		return invoke<void>('cancel_ai_stream');
	} else {
		return mockIpc.cancelAiStream();
	}
}

export function onDownloadProgress(callback: (progress: number) => void): () => void {
	if (isTauri()) {
		return safeListen('download-progress', callback);
	} else {
		return mockIpc.onDownloadProgress(callback);
	}
}

export function onDownloadDone(callback: (targetPath: string) => void): () => void {
	if (isTauri()) {
		return safeListen('download-done', callback);
	} else {
		return mockIpc.onDownloadDone(callback);
	}
}

export function onDownloadError(callback: (message: string) => void): () => void {
	if (isTauri()) {
		return safeListen('download-error', callback);
	} else {
		return mockIpc.onDownloadError(callback);
	}
}

// Native application menu events (File > Open, Cmd+Z from the native Window menu, etc.).
// Wrapped here rather than calling `@tauri-apps/api/event` directly from a route/component,
// per the single-IPC-gateway rule — that direct-import pattern used to throw under `pnpm
// dev` (no `__TAURI_INTERNALS__` bridge in a plain browser) since it bypassed isTauri().
export function onMenuEvent(callback: (action: string) => void): () => void {
	if (isTauri()) {
		return safeListen('menu-event', callback);
	} else {
		return mockIpc.onMenuEvent(callback);
	}
}

export async function closeAppWindow(): Promise<void> {
	if (isTauri()) {
		const { getCurrentWindow } = await import('@tauri-apps/api/window');
		await getCurrentWindow().close();
	} else {
		mockIpc.closeAppWindow();
	}
}

export function onAppCloseRequested(callback: () => Promise<boolean>): () => void {
	if (!isTauri()) return () => {};
	let disposed = false;
	let unlistenPromise = import('@tauri-apps/api/window').then(async ({ getCurrentWindow }) => {
		const appWindow = getCurrentWindow();
		// The /browser route shares the root layout, but its native window must use the
		// platform traffic lights directly. Register the unsaved-work guard only for the
		// primary app window; otherwise this listener prevents the browser red button.
		if (appWindow.label !== 'main') return () => {};
		return appWindow.onCloseRequested(async event => {
			event.preventDefault();
			if (disposed) return;
			try {
				if (await callback()) await appWindow.destroy();
			} catch (error) {
				console.error('Could not complete the close safety checks:', error);
			}
		});
	}).catch(error => {
		console.error('Could not register the native close listener:', error);
		return () => {};
	});
	return () => {
		disposed = true;
		void unlistenPromise.then(unlisten => unlisten()).catch(error => {
			console.error('Could not remove the native close listener:', error);
		});
	};
}

export async function loadPasswordDatabase(): Promise<string> {
	if (isTauri()) {
		return invoke<string>('load_password_database');
	} else {
		return mockIpc.loadPasswordDatabase();
	}
}

export async function savePasswordDatabase(content: string): Promise<void> {
	if (isTauri()) {
		return invoke<void>('save_password_database', { content });
	} else {
		return mockIpc.savePasswordDatabase(content);
	}
}

// Provider API keys go straight into the OS keychain (Tauri) or a dedicated localStorage
// namespace (mock/browser dev). API execution receives only the credential id; raw keys
// are resolved inside the IPC implementation and never round-trip back to app state.
export async function saveApiKey(provider: string, key: string): Promise<void> {
	if (isTauri()) {
		return invoke<void>('save_api_key', { provider, key });
	} else {
		return mockIpc.saveApiKey(provider, key);
	}
}

export interface ApiKeyChange {
	credentialId: string;
	key: string;
}

export async function applyApiKeyChanges(changes: ApiKeyChange[]): Promise<number> {
	if (isTauri()) {
		return invoke<number>('apply_api_key_changes', { changes });
	}
	return mockIpc.applyApiKeyChanges(changes);
}

export async function restoreApiKeyRevision(revision: number): Promise<void> {
	if (isTauri()) return invoke<void>('restore_api_key_revision', { revision });
	return mockIpc.restoreApiKeyRevision(revision);
}

export async function openBrowserWindow(url: string): Promise<void> {
	// Transitional launcher adapter: old shell callers still open the new tab-addressed
	// engine. It does not preserve the removed native `open_browser_window` command.
	await browserWindowOpen(url);
}

// ── Browser module v2 (tab-addressed native engine) ───────────────────────────

export async function browserWindowOpen(url?: string): Promise<BrowserWindowInfo> {
	if (isTauri()) return invoke<BrowserWindowInfo>('browser_window_open', { url: url ?? null });
	return mockIpc.browserWindowOpen(url);
}

/**
 * Identifies the current standalone browser chrome webview.
 *
 * A browser chrome URL is only a routing hint. The native webview label is authoritative:
 * Rust creates it as `browser-chrome-<windowId>`, which remains available while the route
 * is loading and cannot be lost to client-side routing or a development-server rewrite.
 */
export async function browserCurrentWindowId(): Promise<string | null> {
	if (!isTauri()) return mockIpc.browserCurrentWindowId();
	const { getCurrentWebview } = await import('@tauri-apps/api/webview');
	const label = getCurrentWebview().label;
	const prefix = 'browser-chrome-';
	return label.startsWith(prefix) ? label.slice(prefix.length) : null;
}

/**
 * Snapshot of one window's current tabs for chrome bootstrap — the chrome loads after the
 * engine's initial events fired, so the mirror seeds from this once, then follows events.
 * Returns null for an unknown window.
 */
export async function browserWindowState(windowId: string): Promise<BrowserWindowInfo | null> {
	if (isTauri()) return invoke<BrowserWindowInfo | null>('browser_window_state', { windowId });
	return mockIpc.browserWindowState(windowId);
}

export async function browserWindowClose(windowId: string): Promise<void> {
	if (isTauri()) return invoke<void>('browser_window_close', { windowId });
	return mockIpc.browserWindowClose(windowId);
}

export async function browserSessionRestoreEnabled(): Promise<boolean> {
	if (isTauri()) return invoke<boolean>('browser_session_restore_enabled');
	return mockIpc.browserSessionRestoreEnabled();
}

export async function browserSetSessionRestore(enabled: boolean): Promise<void> {
	if (isTauri()) return invoke<void>('browser_set_session_restore', { enabled });
	return mockIpc.browserSetSessionRestore(enabled);
}

export async function browserToggleFocus(): Promise<void> {
	if (isTauri()) return invoke<void>('browser_toggle_focus');
	return mockIpc.browserToggleFocus();
}

export async function browserTabCreate(params: BrowserTabCreateParams): Promise<Tab> {
	if (isTauri()) return invoke<Tab>('browser_tab_create', params);
	return mockIpc.browserTabCreate(params);
}

export async function browserTabClose(params: BrowserTabParams): Promise<void> {
	if (isTauri()) return invoke<void>('browser_tab_close', params);
	return mockIpc.browserTabClose(params);
}

export async function browserTabActivate(params: BrowserTabParams): Promise<void> {
	if (isTauri()) return invoke<void>('browser_tab_activate', params);
	return mockIpc.browserTabActivate(params);
}

export async function browserTabReorder(params: BrowserTabReorderParams): Promise<void> {
	if (isTauri()) return invoke<void>('browser_tab_reorder', params);
	return mockIpc.browserTabReorder(params);
}

export async function browserTabReopenClosed(windowId: string): Promise<Tab | null> {
	if (isTauri()) return invoke<Tab | null>('browser_tab_reopen_closed', { windowId });
	return mockIpc.browserTabReopenClosed(windowId);
}

export async function browserNavigateTab(params: BrowserNavigateParams): Promise<void> {
	if (isTauri()) return invoke<void>('browser_navigate', params);
	return mockIpc.browserNavigateTab(params);
}

export async function browserReloadTab(params: BrowserTabParams): Promise<void> {
	if (isTauri()) return invoke<void>('browser_reload', params);
	return mockIpc.browserReloadTab(params);
}

export async function browserStop(params: BrowserTabParams): Promise<void> {
	if (isTauri()) return invoke<void>('browser_stop', params);
	return mockIpc.browserStop(params);
}

export async function browserGoBackTab(params: BrowserTabParams): Promise<void> {
	if (isTauri()) return invoke<void>('browser_go_back', params);
	return mockIpc.browserGoBackTab(params);
}

export async function browserGoForwardTab(params: BrowserTabParams): Promise<void> {
	if (isTauri()) return invoke<void>('browser_go_forward', params);
	return mockIpc.browserGoForwardTab(params);
}

export async function browserSetViewportBounds(windowId: string, rect: BrowserViewportRect): Promise<void> {
	if (isTauri()) return invoke<void>('browser_set_viewport_bounds', { windowId, rect });
	return mockIpc.browserSetViewportBounds(windowId, rect);
}

export async function browserSetChromeOverlay(windowId: string, open: boolean): Promise<void> {
	if (isTauri()) return invoke<void>('browser_set_chrome_overlay', { windowId, open });
	return mockIpc.browserSetChromeOverlay(windowId, open);
}

export async function browserAutofill(params: BrowserAutofillParams): Promise<void> {
	if (isTauri()) return invoke<void>('browser_autofill', params);
	return mockIpc.browserAutofill(params);
}

export function onBrowserEvent(callback: (event: BrowserEvent) => void): () => void {
	if (isTauri()) return safeListen('browser:event', callback);
	return mockIpc.onBrowserEvent(callback);
}

export async function toggleWindowMaximize(): Promise<void> {
	if (isTauri()) {
		try {
			const { getCurrentWindow } = await import('@tauri-apps/api/window');
			const appWindow = getCurrentWindow();
			const isMaximized = await appWindow.isMaximized();
			if (isMaximized) {
				await appWindow.unmaximize();
			} else {
				await appWindow.maximize();
			}
		} catch (error) {
			console.error('Tauri toggleWindowMaximize error:', error);
		}
	} else {
		return;
	}
}

export async function selectFile(title?: string): Promise<string | null> {
	if (isTauri()) {
		return invoke<string | null>('select_file', { title: title ?? null });
	} else {
		return mockIpc.selectFile(title);
	}
}

export async function pathExists(path: string): Promise<boolean> {
	if (isTauri()) return invoke<boolean>('path_exists', { path });
	return mockIpc.pathExists(path);
}

export async function searchWorkspaceFiles(root: string, query: string, limit = 8): Promise<FileEntry[]> {
	if (isTauri()) return invoke<FileEntry[]>('search_workspace_files', { root, query, limit });
	return mockIpc.searchWorkspaceFiles(root, query, limit);
}

export async function listOllamaModels(baseUrl: string): Promise<string[]> {
	if (isTauri()) return invoke<string[]>('list_ollama_models', { baseUrl });
	return mockIpc.listOllamaModels(baseUrl);
}

export async function runApiModel(
	provider: string,
	credentialId: string | null,
	model: string,
	prompt: string,
	systemPrompt?: string,
	baseUrl?: string,
	isFullUrl = false
): Promise<void> {
	if (isTauri()) {
		return invoke<void>('run_api_model', {
			provider,
			credentialId,
			model,
			prompt,
			systemPrompt,
			baseUrl,
			isFullUrl
		});
	} else {
		return mockIpc.runApiModel(provider, credentialId, model, prompt, systemPrompt, baseUrl, isFullUrl);
	}
}

export async function selectSaveFile(title: string, defaultName: string, extension: string): Promise<string | null> {
	if (isTauri()) {
		return invoke<string | null>('select_save_file', { title, defaultName, extension });
	} else {
		return mockIpc.selectSaveFile(title, defaultName, extension);
	}
}

export async function selectOpenFile(title: string, extension: string): Promise<string | null> {
	if (isTauri()) {
		return invoke<string | null>('select_open_file', { title, extension });
	} else {
		return mockIpc.selectOpenFile(title, extension);
	}
}

/**
 * Syncs the Window menu's template checkmark with the frontend's active template id.
 * Maps `home` → `tpl_home`, `code` → `tpl_code`, `notes` → `tpl_notes`, `design` → `tpl_design`, `blank` → `tpl_blank`.
 * Unknown ids leave every template unchecked. No-op outside Tauri.
 */
export function templateIdToMenuId(templateId: string | null): string | null {
	if (!templateId) return null;
	return `tpl_${templateId}`;
}

export async function setActiveTemplateMenu(templateId: string | null): Promise<void> {
	if (!isTauri()) return;
	const menuId = templateIdToMenuId(templateId);
	if (!menuId) return;
	return invoke<void>('set_active_template_menu', { templateId: menuId });
}

// --- ADR-011 Phase 1: per-project memory storage (Rule 7 Gateway) ---

export interface SessionInfo {
	id: string;
	title: string | null;
	createdAt: number;
	updatedAt: number;
	messageCount: number;
	preview: string | null;
	model: string | null;
}

export interface StoredMessage {
	id: string;
	role: string;
	content: string;
	createdAt: number;
}

export interface EnvProvider {
	provider: string;
	baseUrl?: string | null;
	model?: string | null;
	apiFormat: 'openai' | 'anthropic' | 'gemini' | 'ollama';
}

export interface TokenUsage {
	inputTokens: number;
	outputTokens: number;
	reasoningTokens?: number;
	cachedInputTokens?: number;
}

export async function openProjectMemory(projectPath: string): Promise<void> {
	if (isTauri()) {
		return invoke<void>('open_project_memory', { projectPath });
	} else {
		return mockIpc.openProjectMemory(projectPath);
	}
}

export async function appendMessage(projectPath: string, sessionId: string, messageId: string, role: string, content: string, model?: string | null): Promise<void> {
	if (isTauri()) {
		return invoke<void>('append_message', { projectPath, sessionId, messageId, role, content, model: model ?? null });
	} else {
		return mockIpc.appendMessage(projectPath, sessionId, messageId, role, content, model ?? null);
	}
}

export async function listSessions(projectPath: string): Promise<SessionInfo[]> {
	if (isTauri()) {
		return invoke<SessionInfo[]>('list_sessions', { projectPath });
	} else {
		return mockIpc.listSessions(projectPath);
	}
}

export async function loadSession(projectPath: string, sessionId: string): Promise<StoredMessage[]> {
	if (isTauri()) {
		return invoke<StoredMessage[]>('load_session', { projectPath, sessionId });
	} else {
		return mockIpc.loadSession(projectPath, sessionId);
	}
}

export async function createCheckpoint(projectPath: string, sessionId: string, messageId: string, label: string): Promise<void> {
	if (isTauri()) {
		return invoke<void>('create_checkpoint', { projectPath, sessionId, messageId, label });
	} else {
		return mockIpc.createCheckpoint(projectPath, sessionId, messageId, label);
	}
}

export async function restoreCheckpoint(projectPath: string, sessionId: string, messageId: string): Promise<void> {
	if (isTauri()) {
		return invoke<void>('restore_checkpoint', { projectPath, sessionId, messageId });
	} else {
		return mockIpc.restoreCheckpoint(projectPath, sessionId, messageId);
	}
}

export async function readEnvProviders(projectPath: string): Promise<EnvProvider[]> {
	if (isTauri()) {
		return invoke<EnvProvider[]>('read_env_providers', { projectPath });
	} else {
		return mockIpc.readEnvProviders(projectPath);
	}
}

export async function runEnvModel(
	projectPath: string,
	provider: string,
	prompt: string,
	systemPrompt?: string
): Promise<void> {
	if (isTauri()) {
		return invoke<void>('run_env_model', { projectPath, provider, prompt, systemPrompt });
	}
	return mockIpc.runEnvModel(projectPath, provider, prompt, systemPrompt);
}

export interface DocsIndexReport {
	adrCount: number;
	designCount: number;
	routingCount: number;
	areasCount: number;
	guidesCount: number;
	plansCount: number;
	archiveCount: number;
	skillCount: number;
	agentCount: number;
	missingFrontmatter: string[];
	unregisteredSkillsOrAgents: string[];
}

// Mechanically rebuilds docs/INDEX.md from existing frontmatter — no-ops if rootPath isn't this
// repo. Called only by the idle-triggered docs-index watcher in ide.svelte.ts, never on app load.
export async function rebuildDocsIndex(rootPath: string): Promise<DocsIndexReport> {
	if (isTauri()) {
		return invoke<DocsIndexReport>('rebuild_docs_index', { rootPath });
	} else {
		return mockIpc.rebuildDocsIndex(rootPath);
	}
}

export function onAiUsage(callback: (usage: TokenUsage) => void): () => void {
	if (isTauri()) {
		return safeListen('ai-usage', callback);
	} else {
		return mockIpc.onAiUsage(callback);
	}
}

// --- File Management ---

export async function renameFile(oldPath: string, newName: string): Promise<void> {
	if (isTauri()) {
		return invoke('rename_file', { oldPath, newName });
	} else {
		return mockIpc.renameFile(oldPath, newName);
	}
}

export async function deleteFile(path: string): Promise<void> {
	if (isTauri()) {
		return invoke('delete_file', { path });
	} else {
		return mockIpc.deleteFile(path);
	}
}

export async function duplicateFile(path: string): Promise<void> {
	if (isTauri()) {
		return invoke('duplicate_file', { path });
	} else {
		return mockIpc.duplicateFile(path);
	}
}

// Copies a file or directory to an explicit destination path — unlike duplicateFile, which
// always copies alongside the source with a generated "(copy)" name. Used by the file tree's
// copy/cut-paste flow.
export async function copyPath(source: string, dest: string): Promise<void> {
	if (isTauri()) {
		return invoke('copy_path', { source, dest });
	} else {
		return mockIpc.copyPath(source, dest);
	}
}

// ── Data layer (app-global SQLite store; see DATA-LAYER-PLAN.md / ADR-027) ──────────

export type SearchSource = 'note' | 'bookmark' | 'session' | 'media'; // 'session' reserved, not indexed in v1

export interface SearchHit {
	source: SearchSource;
	docId: string;        // note: vault-relative file path · bookmark: bookmark id
	title: string;
	snippet: string;      // plain text, match regions wrapped in «»
	score: number;        // higher = better; mock may approximate
	path: string | null;  // filesystem path for notes, url for bookmarks
	updatedAt: number;
}

export interface SearchQuery {
	query: string;
	sources?: SearchSource[];   // default: all indexed sources
	limit?: number;             // default 50, max 200
	offset?: number;            // default 0
}

export interface IndexDocument {
	source: SearchSource;
	docId: string;
	title: string;
	body: string;
	path: string | null;
	updatedAt: number;
}

export interface Bookmark {
	id: string;
	url: string;
	title: string;
	description: string;
	faviconUrl: string | null;
	tags: string[];
	folderId: string | null;
	position: number;
	createdAt: number;
	updatedAt: number;
}

export interface BookmarkInput {
	url: string;
	title: string;
	description?: string;
	faviconUrl?: string | null;
	tags?: string[];
	folderId?: string | null;
	position?: number;
}

export interface BookmarkFolder {
	id: string;
	name: string;
	position: number;
	createdAt: number;
	updatedAt: number;
}

export interface BookmarkFolderInput {
	name: string;
	position?: number;
}

export async function searchAll(query: SearchQuery): Promise<SearchHit[]> {
	if (isTauri()) {
		return invoke('storage_search_all', { query });
	} else {
		return mockIpc.searchAll(query);
	}
}

export async function indexDocuments(docs: IndexDocument[]): Promise<void> {
	if (isTauri()) {
		return invoke('storage_index_documents', { docs });
	} else {
		return mockIpc.indexDocuments(docs);
	}
}

export async function removeIndexedDocuments(source: SearchSource, docIds: string[]): Promise<void> {
	if (isTauri()) {
		return invoke('storage_remove_documents', { source, docIds });
	} else {
		return mockIpc.removeIndexedDocuments(source, docIds);
	}
}

/** App-level bookmark store. This deliberately has no browser-module dependency. */
export async function bookmarkList(folderId?: string | null): Promise<Bookmark[]> {
	if (isTauri()) {
		return invoke('bookmark_list', { folderId: folderId ?? null });
	} else {
		return mockIpc.bookmarkList(folderId);
	}
}

export async function bookmarkForUrl(url: string): Promise<Bookmark | null> {
	if (isTauri()) {
		return invoke('bookmark_for_url', { url });
	} else {
		return mockIpc.bookmarkForUrl(url);
	}
}

export async function bookmarkAdd(input: BookmarkInput): Promise<Bookmark> {
	if (isTauri()) {
		return invoke('bookmark_add', { input });
	} else {
		return mockIpc.bookmarkAdd(input);
	}
}

export async function bookmarkUpdate(id: string, input: BookmarkInput): Promise<Bookmark> {
	if (isTauri()) {
		return invoke('bookmark_update', { id, input });
	} else {
		return mockIpc.bookmarkUpdate(id, input);
	}
}

export async function bookmarkDelete(id: string): Promise<void> {
	if (isTauri()) {
		return invoke('bookmark_delete', { id });
	} else {
		return mockIpc.bookmarkDelete(id);
	}
}

export async function bookmarkFolderList(): Promise<BookmarkFolder[]> {
	if (isTauri()) return invoke('bookmark_folder_list');
	return mockIpc.bookmarkFolderList();
}

export async function bookmarkFolderAdd(input: BookmarkFolderInput): Promise<BookmarkFolder> {
	if (isTauri()) return invoke('bookmark_folder_add', { input });
	return mockIpc.bookmarkFolderAdd(input);
}

export async function bookmarkFolderUpdate(id: string, input: BookmarkFolderInput): Promise<BookmarkFolder> {
	if (isTauri()) return invoke('bookmark_folder_update', { id, input });
	return mockIpc.bookmarkFolderUpdate(id, input);
}

export async function bookmarkFolderDelete(id: string): Promise<void> {
	if (isTauri()) return invoke('bookmark_folder_delete', { id });
	return mockIpc.bookmarkFolderDelete(id);
}

// ── History (module-neutral `history_*`; browser is primary writer, §3.3) ──────────

export interface HistoryEntry {
	id: number;
	url: string;
	title: string;
	faviconUrl: string | null;
	visitCount: number;
	lastVisitAt: number;
}

export interface HistoryVisitInput {
	url: string;
	title?: string;
	faviconUrl?: string | null;
	transition?: string;
}

/**
 * Record a visit. Capture is single-writer: in the native app A7's browser/history.rs calls this
 * on nav-committed / title-changed. The mock's tab engine uses it to populate dev history.
 */
export async function historyRecordVisit(input: HistoryVisitInput): Promise<HistoryEntry> {
	if (isTauri()) {
		return invoke('history_record_visit', { input });
	} else {
		return mockIpc.historyRecordVisit(input);
	}
}

export async function historySearch(query: string, limit?: number): Promise<HistoryEntry[]> {
	if (isTauri()) {
		return invoke('history_search', { query, limit: limit ?? null });
	} else {
		return mockIpc.historySearch(query, limit);
	}
}

export async function historyRecent(limit?: number): Promise<HistoryEntry[]> {
	if (isTauri()) {
		return invoke('history_recent', { limit: limit ?? null });
	} else {
		return mockIpc.historyRecent(limit);
	}
}

export async function historyDeleteUrl(id: number): Promise<void> {
	if (isTauri()) {
		return invoke('history_delete_url', { id });
	} else {
		return mockIpc.historyDeleteUrl(id);
	}
}

export async function historyClearRange(from?: number, to?: number): Promise<void> {
	if (isTauri()) {
		return invoke('history_clear_range', { from: from ?? null, to: to ?? null });
	} else {
		return mockIpc.historyClearRange(from, to);
	}
}

// ── fractalMedia (owned library; see docs/plans/media-module-plan.md) ────────────

// mediaAssetUrl is synchronous per the contract, so the native branch needs the
// library base path without an IPC round-trip. Every library-info-returning call
// refreshes this cache; asset URLs are only requested after the library loads.
let nativeMediaBasePath: string | null = null;

function cacheMediaBase(info: MediaLibraryInfo | null): MediaLibraryInfo | null {
	nativeMediaBasePath = info?.basePath ?? null;
	return info;
}

export async function mediaGetLibrary(): Promise<MediaLibraryInfo | null> {
	if (isTauri()) {
		return cacheMediaBase(await invoke('media_get_library'));
	} else {
		return mockIpc.mediaGetLibrary();
	}
}

export async function mediaInitLibrary(): Promise<MediaLibraryInfo | null> {
	if (isTauri()) {
		return cacheMediaBase(await invoke('media_init_library'));
	} else {
		return mockIpc.mediaInitLibrary();
	}
}

export async function mediaRelocateLibrary(): Promise<MediaLibraryInfo | null> {
	if (isTauri()) {
		const info = await invoke<MediaLibraryInfo | null>('media_relocate_library');
		if (info) cacheMediaBase(info);
		return info;
	} else {
		return mockIpc.mediaRelocateLibrary();
	}
}

export async function mediaListTree(): Promise<MediaFolder> {
	if (isTauri()) {
		return invoke('media_list_tree');
	} else {
		return mockIpc.mediaListTree();
	}
}

export async function mediaListItems(query: MediaQuery): Promise<MediaItem[]> {
	if (isTauri()) {
		return invoke('media_list_items', { query });
	} else {
		return mockIpc.mediaListItems(query);
	}
}

export async function mediaListAllTags(): Promise<MediaTag[]> {
	if (isTauri()) {
		return invoke('media_list_all_tags');
	} else {
		return mockIpc.mediaListAllTags();
	}
}

export async function mediaImport(sourcePaths: string[], destFolderPath: string, mode: MediaImportMode): Promise<string> {
	if (isTauri()) {
		return invoke('media_import', { sourcePaths, destFolderPath, mode });
	} else {
		return mockIpc.mediaImport(sourcePaths, destFolderPath, mode);
	}
}

export async function mediaCancelImport(importId: string): Promise<void> {
	if (isTauri()) {
		return invoke('media_cancel_import', { importId });
	} else {
		return mockIpc.mediaCancelImport(importId);
	}
}

export async function mediaCreateFolder(parentPath: string, name: string): Promise<void> {
	if (isTauri()) {
		return invoke('media_create_folder', { parentPath, name });
	} else {
		return mockIpc.mediaCreateFolder(parentPath, name);
	}
}

export async function mediaRenameEntry(relPath: string, newName: string): Promise<string> {
	if (isTauri()) {
		return invoke('media_rename_entry', { relPath, newName });
	} else {
		return mockIpc.mediaRenameEntry(relPath, newName);
	}
}

export async function mediaMoveEntries(relPaths: string[], destFolderPath: string): Promise<void> {
	if (isTauri()) {
		return invoke('media_move_entries', { relPaths, destFolderPath });
	} else {
		return mockIpc.mediaMoveEntries(relPaths, destFolderPath);
	}
}

export async function mediaTrashEntries(relPaths: string[]): Promise<void> {
	if (isTauri()) {
		return invoke('media_trash_entries', { relPaths });
	} else {
		return mockIpc.mediaTrashEntries(relPaths);
	}
}

export async function mediaSetTags(itemIds: string[], addTags: string[], removeTags: string[]): Promise<void> {
	if (isTauri()) {
		return invoke('media_set_tags', { itemIds, addTags, removeTags });
	} else {
		return mockIpc.mediaSetTags(itemIds, addTags, removeTags);
	}
}

export async function mediaSetPinned(itemIds: string[], pinned: boolean): Promise<void> {
	if (isTauri()) {
		return invoke('media_set_pinned', { itemIds, pinned });
	} else {
		return mockIpc.mediaSetPinned(itemIds, pinned);
	}
}

export async function mediaGetThumbnail(itemId: string, maxEdge: number): Promise<string> {
	if (isTauri()) {
		// Rust returns the cache file's absolute path; the webview needs an asset URL.
		return convertFileSrc(await invoke<string>('media_get_thumbnail', { itemId, maxEdge }));
	} else {
		return mockIpc.mediaGetThumbnail(itemId, maxEdge);
	}
}

export async function mediaSaveVideoThumbnail(itemId: string, jpegBase64: string): Promise<string> {
	if (isTauri()) {
		return convertFileSrc(await invoke<string>('media_save_video_thumbnail', { itemId, jpegBase64 }));
	} else {
		return mockIpc.mediaSaveVideoThumbnail(itemId, jpegBase64);
	}
}

export async function mediaSetVideoProbe(itemId: string, width: number, height: number, durationMs: number): Promise<void> {
	if (isTauri()) {
		return invoke('media_set_video_probe', { itemId, width, height, durationMs });
	} else {
		return mockIpc.mediaSetVideoProbe(itemId, width, height, durationMs);
	}
}

export function mediaAssetUrl(relPath: string): string {
	if (isTauri()) {
		if (!nativeMediaBasePath) {
			throw new Error('MEDIA_LIBRARY_NOT_INITIALIZED');
		}
		return convertFileSrc(`${nativeMediaBasePath}/${relPath.replace(/^\/+/, '')}`);
	} else {
		return mockIpc.mediaAssetUrl(relPath);
	}
}

// Contract amendment 2026-07-17 (operator-approved): source picker for the header
// Import… flow. kind is required because rfd cannot mix files+folders in one dialog.
export async function mediaPickImportSources(kind: 'files' | 'folder'): Promise<string[] | null> {
	if (isTauri()) {
		return invoke('media_pick_import_sources', { kind });
	} else {
		return mockIpc.mediaPickImportSources(kind);
	}
}

export function onMediaImportProgress(callback: (progress: MediaImportProgress) => void): () => void {
	if (isTauri()) {
		return safeListen('media://import-progress', callback);
	} else {
		return mockIpc.onMediaImportProgress(callback);
	}
}

export function onMediaFsEvent(callback: (event: MediaFsEvent) => void): () => void {
	if (isTauri()) {
		return safeListen('media://fs-event', callback);
	} else {
		return mockIpc.onMediaFsEvent(callback);
	}
}

// ── Shared visual annotations ───────────────────────────────────────────────────

export async function listAnnotations(projectPath: string): Promise<SharedAnnotation[]> {
	if (isTauri()) return invoke<SharedAnnotation[]>('annotations_list', { projectPath });
	return mockIpc.listAnnotations(projectPath);
}

export async function upsertAnnotation(projectPath: string, annotation: SharedAnnotationInput): Promise<SharedAnnotation> {
	if (isTauri()) return invoke<SharedAnnotation>('annotations_upsert', { projectPath, annotation });
	return mockIpc.upsertAnnotation(projectPath, annotation);
}

export async function deleteAnnotation(projectPath: string, id: string): Promise<void> {
	if (isTauri()) return invoke<void>('annotations_delete', { projectPath, id });
	return mockIpc.deleteAnnotation(projectPath, id);
}

// ── IpcApi contract interface ────────────────────────────────────────────────────
// Every gateway function's exact signature, mechanically extracted.
// Both ipc.ts and ipc-mock.ts enforce conformance via `satisfies`.

export interface IpcApi {
	isTauri(): boolean;
	listDirectory(path: string): Promise<FileEntry[]>;
	listAuthorizedPaths(): Promise<string[]>;
	revokeAuthorizedPath(path: string): Promise<boolean>;
	requestDirectoryAccess(requestedPath?: string): Promise<string | null>;
	readFile(path: string): Promise<string>;
	writeFile(path: string, content: string): Promise<void>;
	createFile(path: string, content: string): Promise<void>;
	terminalOpen(cwd: string, cols: number, rows: number): Promise<string>;
	terminalWrite(sessionId: string, data: string): Promise<void>;
	terminalResize(sessionId: string, cols: number, rows: number): Promise<void>;
	terminalClose(sessionId: string): Promise<void>;
	onTerminalEvent(callback: (event: TerminalPtyEvent) => void): () => void;
	selectDownloadDirectory(title?: string): Promise<string | null>;
	runLocalModel(modelPath: string, mmprojPath: string | null | undefined, prompt: string): Promise<void>;
	downloadModel(url: string, targetPath: string): Promise<void>;
	installSkill(url: string, name: string, workspacePath: string): Promise<void>;
	onAiChunk(callback: (chunk: string) => void): () => void;
	onAiDone(callback: () => void): () => void;
	onAiError(callback: (message: string) => void): () => void;
	startDictation(locale: string): Promise<void>;
	stopDictation(): Promise<void>;
	cancelDictation(): Promise<void>;
	onDictationEvent(callback: (event: DictationEvent) => void): () => void;
	registerAiStreamListeners(listeners: AiStreamListeners): Promise<() => void>;
	cancelAiStream(): Promise<void>;
	onDownloadProgress(callback: (progress: number) => void): () => void;
	onDownloadDone(callback: (targetPath: string) => void): () => void;
	onDownloadError(callback: (message: string) => void): () => void;
	onMenuEvent(callback: (action: string) => void): () => void;
	closeAppWindow(): Promise<void>;
	onAppCloseRequested(callback: () => Promise<boolean>): () => void;
	loadPasswordDatabase(): Promise<string>;
	savePasswordDatabase(content: string): Promise<void>;
	saveApiKey(provider: string, key: string): Promise<void>;
	applyApiKeyChanges(changes: ApiKeyChange[]): Promise<number>;
	restoreApiKeyRevision(revision: number): Promise<void>;
	openBrowserWindow(url: string): Promise<void>;
	browserWindowOpen(url?: string): Promise<BrowserWindowInfo>;
	browserCurrentWindowId(): Promise<string | null>;
	browserWindowState(windowId: string): Promise<BrowserWindowInfo | null>;
	browserWindowClose(windowId: string): Promise<void>;
	browserSessionRestoreEnabled(): Promise<boolean>;
	browserSetSessionRestore(enabled: boolean): Promise<void>;
	browserToggleFocus(): Promise<void>;
	browserTabCreate(params: BrowserTabCreateParams): Promise<Tab>;
	browserTabClose(params: BrowserTabParams): Promise<void>;
	browserTabActivate(params: BrowserTabParams): Promise<void>;
	browserTabReorder(params: BrowserTabReorderParams): Promise<void>;
	browserTabReopenClosed(windowId: string): Promise<Tab | null>;
	browserNavigateTab(params: BrowserNavigateParams): Promise<void>;
	browserReloadTab(params: BrowserTabParams): Promise<void>;
	browserStop(params: BrowserTabParams): Promise<void>;
	browserGoBackTab(params: BrowserTabParams): Promise<void>;
	browserGoForwardTab(params: BrowserTabParams): Promise<void>;
	browserSetViewportBounds(windowId: string, rect: BrowserViewportRect): Promise<void>;
	browserSetChromeOverlay(windowId: string, open: boolean): Promise<void>;
	browserAutofill(params: BrowserAutofillParams): Promise<void>;
	onBrowserEvent(callback: (event: BrowserEvent) => void): () => void;
	toggleWindowMaximize(): Promise<void>;
	selectFile(title?: string): Promise<string | null>;
	pathExists(path: string): Promise<boolean>;
	searchWorkspaceFiles(root: string, query: string, limit?: number): Promise<FileEntry[]>;
	listOllamaModels(baseUrl: string): Promise<string[]>;
	runApiModel(provider: string, credentialId: string | null, model: string, prompt: string, systemPrompt?: string, baseUrl?: string, isFullUrl?: boolean): Promise<void>;
	selectSaveFile(title: string, defaultName: string, extension: string): Promise<string | null>;
	selectOpenFile(title: string, extension: string): Promise<string | null>;
	templateIdToMenuId(templateId: string | null): string | null;
	setActiveTemplateMenu(templateId: string | null): Promise<void>;
	openProjectMemory(projectPath: string): Promise<void>;
	appendMessage(projectPath: string, sessionId: string, messageId: string, role: string, content: string, model?: string | null): Promise<void>;
	listSessions(projectPath: string): Promise<SessionInfo[]>;
	loadSession(projectPath: string, sessionId: string): Promise<StoredMessage[]>;
	createCheckpoint(projectPath: string, sessionId: string, messageId: string, label: string): Promise<void>;
	restoreCheckpoint(projectPath: string, sessionId: string, messageId: string): Promise<void>;
	readEnvProviders(projectPath: string): Promise<EnvProvider[]>;
	runEnvModel(projectPath: string, provider: string, prompt: string, systemPrompt?: string): Promise<void>;
	rebuildDocsIndex(rootPath: string): Promise<DocsIndexReport>;
	onAiUsage(callback: (usage: TokenUsage) => void): () => void;
	renameFile(oldPath: string, newName: string): Promise<void>;
	deleteFile(path: string): Promise<void>;
	duplicateFile(path: string): Promise<void>;
	copyPath(source: string, dest: string): Promise<void>;
	searchAll(query: SearchQuery): Promise<SearchHit[]>;
	indexDocuments(docs: IndexDocument[]): Promise<void>;
	removeIndexedDocuments(source: SearchSource, docIds: string[]): Promise<void>;
	bookmarkList(folderId?: string | null): Promise<Bookmark[]>;
	bookmarkForUrl(url: string): Promise<Bookmark | null>;
	bookmarkAdd(input: BookmarkInput): Promise<Bookmark>;
	bookmarkUpdate(id: string, input: BookmarkInput): Promise<Bookmark>;
	bookmarkDelete(id: string): Promise<void>;
	bookmarkFolderList(): Promise<BookmarkFolder[]>;
	bookmarkFolderAdd(input: BookmarkFolderInput): Promise<BookmarkFolder>;
	bookmarkFolderUpdate(id: string, input: BookmarkFolderInput): Promise<BookmarkFolder>;
	bookmarkFolderDelete(id: string): Promise<void>;
	historyRecordVisit(input: HistoryVisitInput): Promise<HistoryEntry>;
	historySearch(query: string, limit?: number): Promise<HistoryEntry[]>;
	historyRecent(limit?: number): Promise<HistoryEntry[]>;
	historyDeleteUrl(id: number): Promise<void>;
	historyClearRange(from?: number, to?: number): Promise<void>;
	// fractalMedia — FROZEN Phase 0 contract (docs/plans/media-module-plan.md §4.2)
	mediaGetLibrary(): Promise<MediaLibraryInfo | null>;
	mediaInitLibrary(): Promise<MediaLibraryInfo | null>;
	mediaRelocateLibrary(): Promise<MediaLibraryInfo | null>;
	mediaListTree(): Promise<MediaFolder>;
	mediaListItems(query: MediaQuery): Promise<MediaItem[]>;
	mediaListAllTags(): Promise<MediaTag[]>;
	mediaImport(sourcePaths: string[], destFolderPath: string, mode: MediaImportMode): Promise<string>;
	mediaCancelImport(importId: string): Promise<void>;
	mediaCreateFolder(parentPath: string, name: string): Promise<void>;
	mediaRenameEntry(relPath: string, newName: string): Promise<string>;
	mediaMoveEntries(relPaths: string[], destFolderPath: string): Promise<void>;
	mediaTrashEntries(relPaths: string[]): Promise<void>;
	mediaSetTags(itemIds: string[], addTags: string[], removeTags: string[]): Promise<void>;
	mediaSetPinned(itemIds: string[], pinned: boolean): Promise<void>;
	mediaGetThumbnail(itemId: string, maxEdge: number): Promise<string>;
	mediaSaveVideoThumbnail(itemId: string, jpegBase64: string): Promise<string>;
	mediaSetVideoProbe(itemId: string, width: number, height: number, durationMs: number): Promise<void>;
	mediaAssetUrl(relPath: string): string;
	mediaPickImportSources(kind: 'files' | 'folder'): Promise<string[] | null>;
	onMediaImportProgress(callback: (progress: MediaImportProgress) => void): () => void;
	onMediaFsEvent(callback: (event: MediaFsEvent) => void): () => void;
	listAnnotations(projectPath: string): Promise<SharedAnnotation[]>;
	upsertAnnotation(projectPath: string, annotation: SharedAnnotationInput): Promise<SharedAnnotation>;
	deleteAnnotation(projectPath: string, id: string): Promise<void>;
}

// Satisfies check — ensures every IpcApi member is present (or natively delegated)
const _ipcApiCheck: IpcApi = {
	isTauri,
	listDirectory,
	listAuthorizedPaths,
	revokeAuthorizedPath,
	requestDirectoryAccess,
	readFile,
	writeFile,
	createFile,
	terminalOpen,
	terminalWrite,
	terminalResize,
	terminalClose,
	onTerminalEvent,
	selectDownloadDirectory,
	runLocalModel,
	downloadModel,
	installSkill,
	onAiChunk,
	onAiDone,
	onAiError,
	startDictation,
	stopDictation,
	cancelDictation,
	onDictationEvent,
	registerAiStreamListeners,
	cancelAiStream,
	onDownloadProgress,
	onDownloadDone,
	onDownloadError,
	onMenuEvent,
	closeAppWindow,
	onAppCloseRequested,
	loadPasswordDatabase,
	savePasswordDatabase,
	saveApiKey,
	applyApiKeyChanges,
	restoreApiKeyRevision,
	openBrowserWindow,
	browserWindowOpen,
	browserCurrentWindowId,
	browserWindowState,
	browserWindowClose,
	browserSessionRestoreEnabled,
	browserSetSessionRestore,
	browserToggleFocus,
	browserTabCreate,
	browserTabClose,
	browserTabActivate,
	browserTabReorder,
	browserTabReopenClosed,
	browserNavigateTab,
	browserReloadTab,
	browserStop,
	browserGoBackTab,
	browserGoForwardTab,
	browserSetViewportBounds,
	browserSetChromeOverlay,
	browserAutofill,
	onBrowserEvent,
	toggleWindowMaximize,
	selectFile,
	pathExists,
	searchWorkspaceFiles,
	listOllamaModels,
	runApiModel,
	selectSaveFile,
	selectOpenFile,
	templateIdToMenuId,
	setActiveTemplateMenu,
	openProjectMemory,
	appendMessage,
	listSessions,
	loadSession,
	createCheckpoint,
	restoreCheckpoint,
	readEnvProviders,
	runEnvModel,
	rebuildDocsIndex,
	onAiUsage,
	renameFile,
	deleteFile,
	duplicateFile,
	copyPath,
	searchAll,
	indexDocuments,
	removeIndexedDocuments,
	bookmarkList,
	bookmarkForUrl,
	bookmarkAdd,
	bookmarkUpdate,
	bookmarkDelete,
	bookmarkFolderList,
	bookmarkFolderAdd,
	bookmarkFolderUpdate,
	bookmarkFolderDelete,
	historyRecordVisit,
	historySearch,
	historyRecent,
	historyDeleteUrl,
	historyClearRange,
	mediaGetLibrary,
	mediaInitLibrary,
	mediaRelocateLibrary,
	mediaListTree,
	mediaListItems,
	mediaListAllTags,
	mediaImport,
	mediaCancelImport,
	mediaCreateFolder,
	mediaRenameEntry,
	mediaMoveEntries,
	mediaTrashEntries,
	mediaSetTags,
	mediaSetPinned,
	mediaGetThumbnail,
	mediaSaveVideoThumbnail,
	mediaSetVideoProbe,
	mediaAssetUrl,
	mediaPickImportSources,
	onMediaImportProgress,
	onMediaFsEvent,
	listAnnotations,
	upsertAnnotation,
	deleteAnnotation,
};
