import type { AiStreamListeners, DictationEvent, FileEntry, SessionInfo, StoredMessage, EnvProvider, TokenUsage, Bookmark, BookmarkInput, BookmarkFolder, BookmarkFolderInput, IndexDocument, SearchHit, SearchQuery, SearchSource, HistoryEntry, HistoryVisitInput } from './ipc';
import type { SharedAnnotation, SharedAnnotationInput } from './modules/annotations/types';
import type { BrowserAutofillParams, BrowserEvent, BrowserEventType, BrowserNavigateParams, BrowserTabCreateParams, BrowserTabParams, BrowserTabReorderParams, BrowserViewportRect, BrowserWindowInfo, Tab } from './modules/browser/types';

// Simple in-memory virtual filesystem for browser preview mode
const mockFiles: Record<string, { content?: string; isDir: boolean }> = {
	'/workspace': { isDir: true },
	'/workspace/src': { isDir: true },
	'/workspace/src/main.ts': {
		content: `// Welcome to Svelte 5 + Tauri IDE!
import { add } from './utils';

const result = add(5, 7);
console.log('Result of addition:', result);

export function hello() {
	return 'Hello from Svelte 5 Runes!';
}`,
		isDir: false
	},
	'/workspace/src/utils.ts': {
		content: `export function add(a: number, b: number): number {
	return a + b;
}

export function subtract(a: number, b: number): number {
	return a - b;
}`,
		isDir: false
	},
	'/workspace/package.json': {
		content: `{
	"name": "mock-project",
	"version": "1.0.0",
	"dependencies": {
		"svelte": "^5.0.0"
	}
}`,
		isDir: false
	},
	'/workspace/docs': { isDir: true },
	'/workspace/docs/INDEX.md': {
		content: `# Mock Workspace Documentation

This browser preview uses an in-memory workspace. Open a local project in FractalEngine to browse that project's full documentation tree.

## Available preview documents

- [Getting started](getting-started.md)
`,
		isDir: false
	},
	'/workspace/docs/getting-started.md': {
		content: `# Getting started

The FractalDocs preview is working. Documentation from an opened local workspace replaces these mock files in the desktop app.
`,
		isDir: false
	},
	'/workspace/README.md': {
		content: `# Mock IDE Workspace

This is an in-memory virtual workspace. You can:
1. Browse directories on the left sidebar.
2. Select and edit files in the middle editor pane.
3. Collapse sidebars and the terminal.
4. Drag-and-drop the terminal to dock it in either sidebar or back to the bottom.
5. Save files (changes persist in memory during the session).
6. Run mock terminal commands like \`help\`, \`ls\`, \`cat\`, and \`run\`.`,
		isDir: false
	}
};

function normalizedMockPath(path: string): string {
	const parts: string[] = [];
	for (const part of path.replaceAll('\\', '/').split('/')) {
		if (!part || part === '.') continue;
		if (part === '..') parts.pop();
		else parts.push(part);
	}
	const normalized = '/' + parts.join('/');
	if (normalized !== '/workspace' && !normalized.startsWith('/workspace/')) {
		throw new Error('Path is outside the folders selected by the user');
	}
	return normalized;
}

function validateMockLeafName(name: string): string {
	const trimmed = name.trim();
	if (!trimmed || trimmed === '.' || trimmed === '..' || trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('\0')) {
		throw new Error('Name must be a single file or folder name');
	}
	return trimmed;
}

export async function listDirectory(path: string): Promise<FileEntry[]> {
	await delay(100);
	path = normalizedMockPath(path);
	const targetPath = path.endsWith('/') ? path.slice(0, -1) : path;
	
	const entries: FileEntry[] = [];
	
	for (const [filePath, info] of Object.entries(mockFiles)) {
		// Find direct children of targetPath
		if (filePath.startsWith(targetPath) && filePath !== targetPath) {
			const relative = filePath.substring(targetPath.length + 1);
			if (!relative.includes('/')) {
				entries.push({
					name: relative,
					path: filePath,
					isDir: info.isDir,
					size: info.content ? info.content.length : 0
				});
			}
		}
	}
	
	if (entries.length === 0 && !mockFiles[targetPath]) {
		throw new Error(`Directory not found: ${path}`);
	}

	// Sort directories first
	return entries.sort((a, b) => {
		if (a.isDir !== b.isDir) {
			return b.isDir ? 1 : -1;
		}
		return a.name.localeCompare(b.name);
	});
}

export async function readFile(path: string): Promise<string> {
	await delay(150);
	path = normalizedMockPath(path);
	const file = mockFiles[path];
	if (!file || file.isDir || file.content === undefined) {
		throw new Error(`File not found: ${path}`);
	}
	return file.content;
}

export async function writeFile(path: string, content: string): Promise<void> {
	await delay(100);
	path = normalizedMockPath(path);
	// lib.rs's write_file does fs::create_dir_all(parent) before writing, so a file
	// written into a not-yet-existing nested folder still shows up correctly in that
	// folder's listing. listDirectory() only lists entries whose relative path has no
	// further '/', so without an explicit intermediate entry here a file written to a
	// brand-new subfolder would be invisible when listing its parent.
	const segments = path.split('/').filter(Boolean);
	let current = '';
	for (const segment of segments.slice(0, -1)) {
		current += '/' + segment;
		if (!mockFiles[current]) {
			mockFiles[current] = { isDir: true };
		}
	}
	mockFiles[path] = {
		content,
		isDir: false
	};
}

export async function createFile(path: string, content: string): Promise<void> {
	path = normalizedMockPath(path);
	if (mockFiles[path]) throw new Error('A file with that name already exists');
	await writeFile(path, content);
}

type MockTerminalEvent = {
	sessionId: string;
	kind: 'data' | 'exit' | 'error';
	data: string;
};

const mockTerminalListeners = new Set<(event: MockTerminalEvent) => void>();
const mockTerminalSessions = new Set<string>();

function emitMockTerminal(event: MockTerminalEvent): void {
	for (const listener of mockTerminalListeners) listener(event);
}

export async function terminalOpen(cwd: string, _cols: number, _rows: number): Promise<string> {
	const sessionId = `mock-term-${Math.random().toString(36).slice(2)}`;
	const normalizedCwd = normalizedMockPath(cwd || '/workspace');
	mockTerminalSessions.add(sessionId);
	queueMicrotask(() => emitMockTerminal({
		sessionId,
		kind: 'data',
		data: `Real terminal sessions require the native Tauri app.\r\nBrowser preview cannot spawn a PTY for ${normalizedCwd}.\r\n`
	}));
	return sessionId;
}

export async function terminalWrite(sessionId: string, data: string): Promise<void> {
	if (!mockTerminalSessions.has(sessionId)) throw new Error('Terminal session is not active');
	if (data.trim()) {
		emitMockTerminal({
			sessionId,
			kind: 'data',
			data: '\r\nNo browser mock command was run. Start FractalEngine in Tauri mode for a real terminal.\r\n'
		});
	}
}

export async function terminalResize(_sessionId: string, _cols: number, _rows: number): Promise<void> {}

export async function terminalClose(sessionId: string): Promise<void> {
	if (mockTerminalSessions.delete(sessionId)) {
		emitMockTerminal({ sessionId, kind: 'exit', data: '' });
	}
}

export function onTerminalEvent(callback: (event: MockTerminalEvent) => void): () => void {
	mockTerminalListeners.add(callback);
	return () => mockTerminalListeners.delete(callback);
}

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// The Vite development server owns this SQLite-backed endpoint, so independent browser
// contexts at localhost share exactly the same annotations. The in-memory fallback keeps
// isolated unit tests and static previews functional when no development server is present.
const mockAnnotations = new Map<string, SharedAnnotation>();
const ANNOTATIONS_ENDPOINT = '/__fractal/annotations';

async function annotationRequest<T>(path = '', init?: RequestInit): Promise<T | null> {
	try {
		const response = await fetch(`${ANNOTATIONS_ENDPOINT}${path}`, init);
		if (!response.ok) throw new Error(`Annotation relay returned ${response.status}`);
		return await response.json() as T;
	} catch {
		return null;
	}
}

export async function listAnnotations(_projectPath: string): Promise<SharedAnnotation[]> {
	const shared = await annotationRequest<SharedAnnotation[]>();
	return shared ?? [...mockAnnotations.values()];
}

export async function upsertAnnotation(_projectPath: string, annotation: SharedAnnotationInput): Promise<SharedAnnotation> {
	const shared = await annotationRequest<SharedAnnotation>('', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(annotation)
	});
	if (shared) return shared;
	const existing = mockAnnotations.get(annotation.id);
	const now = new Date().toISOString();
	const saved: SharedAnnotation = { ...annotation, createdAt: existing?.createdAt ?? now, updatedAt: now };
	mockAnnotations.set(saved.id, saved);
	return saved;
}

export async function deleteAnnotation(_projectPath: string, id: string): Promise<void> {
	const shared = await annotationRequest<{ ok: boolean }>(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
	if (!shared) mockAnnotations.delete(id);
}

// --- File Management Mocks ---

export async function renameFile(oldPath: string, newName: string): Promise<void> {
	await delay(50);
	oldPath = normalizedMockPath(oldPath);
	newName = validateMockLeafName(newName);
	const parent = oldPath.substring(0, oldPath.lastIndexOf('/'));
	const newPath = parent + '/' + newName;
	if (mockFiles[newPath]) throw new Error('Target already exists');
	if (!mockFiles[oldPath]) throw new Error('Source not found');
	const isDir = mockFiles[oldPath].isDir;
	mockFiles[newPath] = mockFiles[oldPath];
	delete mockFiles[oldPath];

	// mockFiles is a flat map keyed by full path — renaming a directory only moved the
	// one entry above; every descendant path still pointed at the old prefix, unlike
	// fs::rename in lib.rs which moves the whole subtree. Relocate them too.
	if (isDir) {
		const prefix = oldPath + '/';
		for (const key of Object.keys(mockFiles)) {
			if (key.startsWith(prefix)) {
				const suffix = key.substring(prefix.length);
				mockFiles[newPath + '/' + suffix] = mockFiles[key];
				delete mockFiles[key];
			}
		}
	}
}

export async function deleteFile(path: string): Promise<void> {
	await delay(50);
	path = normalizedMockPath(path);
	if (!mockFiles[path]) throw new Error('Not found');
	// Remove path and any paths nested under it
	for (const key of Object.keys(mockFiles)) {
		if (key === path || key.startsWith(path + '/')) {
			delete mockFiles[key];
		}
	}
}

export async function duplicateFile(path: string): Promise<void> {
	await delay(50);
	path = normalizedMockPath(path);
	const src = mockFiles[path];
	if (!src) throw new Error('Not found');
	const dot = path.lastIndexOf('.');
	const base = dot > path.lastIndexOf('/') ? path.substring(0, dot) : path;
	const ext = dot > path.lastIndexOf('/') ? path.substring(dot) : '';
	let copyName = base + ' (copy)' + ext;
	let n = 2;
	while (mockFiles[copyName]) {
		copyName = base + ` (copy ${n})` + ext;
		n++;
	}
	mockFiles[copyName] = { ...src };

	// Same flat-map gap as renameFile: a directory's children are separate entries and
	// don't get duplicated just because the parent key was copied. lib.rs's duplicate_file
	// recurses via copy_dir_recursive — mirror that here.
	if (src.isDir) {
		const prefix = path + '/';
		for (const key of Object.keys(mockFiles)) {
			if (key.startsWith(prefix)) {
				const suffix = key.substring(prefix.length);
				mockFiles[copyName + '/' + suffix] = { ...mockFiles[key] };
			}
		}
	}
}

// Like duplicateFile, but to a caller-chosen destination path instead of an auto-generated
// "(copy)" name alongside the source — mirrors lib.rs's copy_path (fs::copy for a file,
// copy_dir_recursive for a directory). Used by the file tree's copy/cut-paste flow.
export async function copyPath(source: string, dest: string): Promise<void> {
	await delay(50);
	source = normalizedMockPath(source);
	dest = normalizedMockPath(dest);
	const src = mockFiles[source];
	if (!src) throw new Error('Source does not exist');

	const segments = dest.split('/').filter(Boolean);
	let current = '';
	for (const segment of segments.slice(0, -1)) {
		current += '/' + segment;
		if (!mockFiles[current]) {
			mockFiles[current] = { isDir: true };
		}
	}
	mockFiles[dest] = { ...src };

	if (src.isDir) {
		const prefix = source + '/';
		for (const key of Object.keys(mockFiles)) {
			if (key.startsWith(prefix)) {
				const suffix = key.substring(prefix.length);
				mockFiles[dest + '/' + suffix] = { ...mockFiles[key] };
			}
		}
	}
}

// --- Mock AI and Marketplace Handlers ---

const mockChunkListeners = new Set<(chunk: string) => void>();
const mockDoneListeners = new Set<() => void>();
const mockErrorListeners = new Set<(message: string) => void>();
const mockDictationListeners = new Set<(event: DictationEvent) => void>();
let mockDictationTimer: ReturnType<typeof setTimeout> | null = null;
const mockProgressListeners = new Set<(progress: number) => void>();
const mockDownloadDoneListeners = new Set<(targetPath: string) => void>();
const mockDownloadErrorListeners = new Set<(message: string) => void>();
const mockUsageListeners = new Set<(usage: TokenUsage) => void>();

// Mirrors the generation-counter pattern used on the real Tauri backend: each
// runLocalModel/runApiModel call captures the current value, and every scheduled
// timer checks it's still current before emitting anything. cancelAiStream bumps
// the counter (invalidating whatever's in flight) and clears the pending timers
// directly, so the mock streaming actually stops instead of just being ignored.
let mockAiGeneration = 0;
let mockAiTimers: ReturnType<typeof setTimeout>[] = [];
let mockAuthorizedPaths = ['/workspace'];

export function isFilesystemAccessDenied(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	return message.startsWith('FS_ACCESS_DENIED:');
}

export async function listAuthorizedPaths(): Promise<string[]> {
	return [...mockAuthorizedPaths];
}

export async function revokeAuthorizedPath(path: string): Promise<boolean> {
	const before = mockAuthorizedPaths.length;
	mockAuthorizedPaths = mockAuthorizedPaths.filter(root => root !== path);
	return mockAuthorizedPaths.length !== before;
}

export async function requestDirectoryAccess(requestedPath = ''): Promise<string | null> {
	const selected = requestedPath || '/workspace';
	if (!mockAuthorizedPaths.includes(selected)) mockAuthorizedPaths.push(selected);
	return selected;
}

export async function cancelAiStream(): Promise<void> {
	mockAiGeneration++;
	for (const id of mockAiTimers) clearInterval(id);
	mockAiTimers = [];
}

export async function selectDownloadDirectory(_title = 'Select Folder'): Promise<string | null> {
	await delay(200);
	// This command doubles as a generic "pick a folder" native dialog (see
	// openVaultFromFolder/addFolderToVault in ide.svelte.ts, which reuse it for vault
	// folder selection, not just model downloads) — the mock used to return a path that
	// was never registered in mockFiles, so anything built on top of it (e.g. loadVaultTree)
	// failed with "Directory not found" in browser/dev mode. Point at a real mock directory.
	return '/workspace';
}

export async function runLocalModel(modelPath: string, mmprojPath: string | null | undefined, prompt: string): Promise<void> {
	await delay(100);

	const myGeneration = ++mockAiGeneration;

	// Choose a mock response based on trigger keywords in prompt
	let responseText = "Hello! I am a local GGUF model executing natively on your Apple M3 Pro chip inside FractalEngine Studio. How can I assist you with your coding today?";
	let reasoningText = "Analyzing prompt...\nRunning token prediction using llama.cpp sidecar...\nRetrieving context from referenced files...";

	if (prompt.includes('run') || prompt.includes('build')) {
		responseText = "To execute your build pipeline, you can run the `run` command in the terminal or press the 'Run Build' button in the header strip. Let me know if you encounter any compilation flags!";
	} else if (prompt.includes('theme')) {
		responseText = "I see you are interested in custom visual layouts. You can change themes instantly via the dropdown menu in the footer strip. There are over 100 VS Code-compatible themes built-in.";
	}

	// Stream reasoning first
	mockAiTimers.push(setTimeout(() => {
		if (myGeneration !== mockAiGeneration) return;
		for (const cb of mockChunkListeners) {
			cb("<thought>\n" + reasoningText + "\n</thought>\n\n");
		}
	}, 100));

	// Stream response chunks
	const words = responseText.split(' ');
	let i = 0;

	const interval = setInterval(() => {
		if (myGeneration !== mockAiGeneration) {
			clearInterval(interval);
			return;
		}
		if (i < words.length) {
			const chunk = words[i] + " ";
			for (const cb of mockChunkListeners) {
				cb(chunk);
			}
			i++;
		} else {
			clearInterval(interval);
			emitMockUsage(prompt, responseText);
			for (const cb of mockDoneListeners) {
				cb();
			}
		}
	}, 60);
	mockAiTimers.push(interval);
}

export async function downloadModel(url: string, targetPath: string): Promise<void> {
	let progress = 0;
	const interval = setInterval(() => {
		progress += 10;
		if (progress <= 100) {
			for (const cb of mockProgressListeners) {
				cb(progress);
			}
		} else {
			clearInterval(interval);
			for (const cb of mockDownloadDoneListeners) {
				cb(targetPath);
			}
		}
	}, 150);
}

export async function installSkill(url: string, name: string, workspacePath: string): Promise<void> {
	await delay(500);
	// We can write a simulated skill MD to mock filesystem
	mockFiles[`${workspacePath}/agents/skills/${name}/SKILL.md`] = {
		content: `# Simulated Skill: ${name}\n\nDownloaded successfully from ${url}.`,
		isDir: false
	};
}

export function onAiChunk(callback: (chunk: string) => void): () => void {
	mockChunkListeners.add(callback);
	return () => {
		mockChunkListeners.delete(callback);
	};
}

export function onAiDone(callback: () => void): () => void {
	mockDoneListeners.add(callback);
	return () => {
		mockDoneListeners.delete(callback);
	};
}

// The mock streaming functions always "succeed" (they're simulated), so nothing currently emits
// to this — it exists purely so the mock keeps API parity with the real Tauri ai-error event.
export function onAiError(callback: (message: string) => void): () => void {
	mockErrorListeners.add(callback);
	return () => {
		mockErrorListeners.delete(callback);
	};
}

function emitMockDictation(event: DictationEvent): void {
	for (const listener of mockDictationListeners) listener(event);
}

export async function startDictation(_locale: string): Promise<void> {
	if (mockDictationTimer) clearTimeout(mockDictationTimer);
	emitMockDictation({ type: 'state', phase: 'listening' });
	mockDictationTimer = setTimeout(() => {
		emitMockDictation({ type: 'partial', text: 'This is a simulated dictation' });
	}, 180);
}

export async function stopDictation(): Promise<void> {
	if (mockDictationTimer) clearTimeout(mockDictationTimer);
	mockDictationTimer = null;
	emitMockDictation({ type: 'final', text: 'This is a simulated dictation.' });
	emitMockDictation({ type: 'state', phase: 'idle' });
}

export async function cancelDictation(): Promise<void> {
	if (mockDictationTimer) clearTimeout(mockDictationTimer);
	mockDictationTimer = null;
	emitMockDictation({ type: 'state', phase: 'idle' });
}

export function onDictationEvent(callback: (event: DictationEvent) => void): () => void {
	mockDictationListeners.add(callback);
	return () => mockDictationListeners.delete(callback);
}

export async function registerAiStreamListeners(listeners: AiStreamListeners): Promise<() => void> {
	const unlistens = [
		onAiChunk(listeners.onChunk),
		onAiDone(listeners.onDone),
		onAiError(listeners.onError),
		onAiUsage(listeners.onUsage),
	];
	return () => unlistens.forEach(unlisten => unlisten());
}

export function onAiUsage(callback: (usage: TokenUsage) => void): () => void {
	mockUsageListeners.add(callback);
	return () => {
		mockUsageListeners.delete(callback);
	};
}

function emitMockUsage(prompt: string, response: string) {
	const usage: TokenUsage = {
		inputTokens: Math.max(1, Math.round(prompt.length / 4)),
		outputTokens: Math.max(1, Math.round(response.length / 4))
	};
	for (const cb of mockUsageListeners) {
		cb(usage);
	}
}

export function onDownloadProgress(callback: (progress: number) => void): () => void {
	mockProgressListeners.add(callback);
	return () => {
		mockProgressListeners.delete(callback);
	};
}

export function onDownloadDone(callback: (targetPath: string) => void): () => void {
	mockDownloadDoneListeners.add(callback);
	return () => {
		mockDownloadDoneListeners.delete(callback);
	};
}

export function onDownloadError(callback: (message: string) => void): () => void {
	mockDownloadErrorListeners.add(callback);
	return () => {
		mockDownloadErrorListeners.delete(callback);
	};
}

// No native application menu exists in browser dev mode, so there's nothing to subscribe
// to — matches onMenuEvent's signature so call sites don't need an isTauri() branch.
export function onMenuEvent(_callback: (action: string) => void): () => void {
	return () => {};
}

export async function loadPasswordDatabase(): Promise<string> {
	await delay(100);
	const localData = localStorage.getItem('ide:passwords');
	if (localData) {
		return localData;
	}
	
	const mockDb = {
		encrypted: false,
		folders: [],
		items: [
			{
				id: '00000000-0000-4000-8000-000000000001',
				type: 1,
				name: 'example.com',
				login: {
					uris: [{ uri: 'https://example.com/login' }],
					username: 'mock.user@example.com',
					password: 'MOCK_PASSWORD_PLACEHOLDER_1'
				}
			},
			{
				id: '00000000-0000-4000-8000-000000000002',
				type: 1,
				name: 'sample.test',
				login: {
					uris: [{ uri: 'https://sample.test/account' }],
					username: 'demo.user',
					password: 'MOCK_PASSWORD_PLACEHOLDER_2'
				}
			},
			{
				id: '00000000-0000-4000-8000-000000000003',
				type: 1,
				name: 'fixture.invalid',
				login: {
					uris: [{ uri: 'https://fixture.invalid/signin' }],
					username: 'test.user@fixture.invalid',
					password: 'MOCK_PASSWORD_PLACEHOLDER_3'
				}
			},
			{
				id: '00000000-0000-4000-8000-000000000004',
				type: 1,
				name: 'auth.fixture.invalid',
				login: {
					uris: [{ uri: 'https://auth.fixture.invalid' }],
					username: 'test.user@fixture.invalid',
					password: 'MOCK_PASSWORD_PLACEHOLDER_4',
					totp: 'JBSWY3DPEHPK3PXP'
				}
			}
		]
	};
	const content = JSON.stringify(mockDb);
	localStorage.setItem('ide:passwords', content);
	return content;
}

export async function savePasswordDatabase(content: string): Promise<void> {
	await delay(50);
	localStorage.setItem('ide:passwords', content);
}

export async function saveApiKey(provider: string, key: string): Promise<void> {
	await delay(20);
	if (key) {
		localStorage.setItem(`ide:apikey:${provider}`, key);
	} else {
		localStorage.removeItem(`ide:apikey:${provider}`);
	}
}

interface MockApiKeyRevision {
	before: Array<[string, string | null]>;
	after: Array<[string, string]>;
}

const mockApiKeyHistory: MockApiKeyRevision[] = [];
let mockApiKeyRevision = 0;

function writeMockApiKey(credentialId: string, key: string | null): void {
	if (key) localStorage.setItem(`ide:apikey:${credentialId}`, key);
	else localStorage.removeItem(`ide:apikey:${credentialId}`);
}

function writeMockApiKeySet(
	values: Array<[string, string | null]>,
	rollback: Array<[string, string | null]>
): void {
	let completed = 0;
	try {
		for (const [credentialId, key] of values) {
			writeMockApiKey(credentialId, key);
			completed += 1;
		}
	} catch (error) {
		for (const [credentialId, key] of rollback.slice(0, completed)) writeMockApiKey(credentialId, key);
		throw error;
	}
}

export async function applyApiKeyChanges(changes: Array<{ credentialId: string; key: string }>): Promise<number> {
	await delay(20);
	if (changes.length === 0) return mockApiKeyRevision;
	const previous = new Map(
		changes.map(change => [change.credentialId, localStorage.getItem(`ide:apikey:${change.credentialId}`)])
	);
	try {
		for (const change of changes) {
			if (change.key) localStorage.setItem(`ide:apikey:${change.credentialId}`, change.key);
			else localStorage.removeItem(`ide:apikey:${change.credentialId}`);
			const stored = localStorage.getItem(`ide:apikey:${change.credentialId}`) ?? '';
			if (stored !== change.key) throw new Error(`Credential verification failed for ${change.credentialId}`);
		}
	} catch (error) {
		for (const [credentialId, key] of previous) {
			if (key === null) localStorage.removeItem(`ide:apikey:${credentialId}`);
			else localStorage.setItem(`ide:apikey:${credentialId}`, key);
		}
		throw error;
	}
	mockApiKeyHistory.splice(mockApiKeyRevision);
	mockApiKeyHistory.push({
		before: [...previous.entries()],
		after: changes.map(change => [change.credentialId, change.key])
	});
	mockApiKeyRevision += 1;
	return mockApiKeyRevision;
}

export async function restoreApiKeyRevision(revision: number): Promise<void> {
	await delay(20);
	if (!Number.isInteger(revision) || revision < 0 || revision > mockApiKeyHistory.length) {
		throw new Error('Unknown API key revision');
	}
	while (mockApiKeyRevision > revision) {
		const entry = mockApiKeyHistory[mockApiKeyRevision - 1];
		writeMockApiKeySet(entry.before, entry.after);
		mockApiKeyRevision -= 1;
	}
	while (mockApiKeyRevision < revision) {
		const entry = mockApiKeyHistory[mockApiKeyRevision];
		writeMockApiKeySet(entry.after, entry.before);
		mockApiKeyRevision += 1;
	}
}

export async function openBrowserWindow(url: string): Promise<void> {
	window.open(`/browser?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer,width=800,height=600');
}

export async function closeAppWindow(): Promise<void> {
	window.close();
}

// ── MockTabEngine — in-memory browser simulation (Stream B) ──────────────
//
// Maintains windows/tabs in memory, emits instant navigation events with
// URL-derived titles. Everything works synchronously in pnpm dev.

let nextId = 1;
function uid(): string { return `mock-${nextId++}`; }

function deriveTitle(url: string): string {
	try {
		const u = new URL(url);
		let title = u.hostname.replace(/^www\./, '');
		if (u.pathname && u.pathname !== '/') {
			const segs = u.pathname.split('/').filter(Boolean);
			if (segs.length > 0) title = segs[segs.length - 1].replace(/[-_]/g, ' ') + ' — ' + title;
		}
		return decodeURIComponent(title);
	} catch {
		return url;
	}
}

function defaultFavicon(url: string): string {
	try {
		return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=16`;
	} catch {
		return '';
	}
}

interface MockTab {
	id: string;
	url: string;
	title: string;
	favicon_url: string;
	can_go_back: boolean;
	can_go_forward: boolean;
	loading: boolean;
	nav_epoch: number;
	// Internal history stack for back/forward
	history: string[];
	historyIndex: number;
}

interface MockWindow {
	id: string;
	tabs: MockTab[];
	activeTabId: string;
	closedStack: MockTab[];
}

const mockWindows = new Map<string, MockWindow>();
const mockEventListeners = new Set<(event: BrowserEvent) => void>();
let mockSessionRestoreEnabled = false;

function mockEmit(type: BrowserEventType, windowId: string, tabId: string, navEpoch: number, extra?: { url?: string; title?: string }): void {
	const event: BrowserEvent = {
		type,
		payload: { windowId, tabId, navEpoch },
		url: extra?.url,
		title: extra?.title,
	};
	for (const cb of mockEventListeners) cb(event);
}

function mockFindTab(windowId: string, tabId: string): MockTab | undefined {
	return mockWindows.get(windowId)?.tabs.find(t => t.id === tabId);
}

function mockNewTab(windowId: string, url?: string | null): MockTab {
	const win = mockWindows.get(windowId);
	if (!win) throw new Error(`Mock window ${windowId} not found`);
	const epoch = 1;
	const resolvedUrl = url || 'about:blank';
	const tab: MockTab = {
		id: uid(),
		url: resolvedUrl,
		title: resolvedUrl === 'about:blank' ? 'New Tab' : deriveTitle(resolvedUrl),
		favicon_url: resolvedUrl === 'about:blank' ? '' : defaultFavicon(resolvedUrl),
		can_go_back: false,
		can_go_forward: false,
		loading: false,
		nav_epoch: epoch,
		history: resolvedUrl === 'about:blank' ? [] : [resolvedUrl],
		historyIndex: resolvedUrl === 'about:blank' ? -1 : 0,
	};
	win.tabs.push(tab);
	win.activeTabId = tab.id;
	return tab;
}

function mockNavigate(win: MockWindow, tab: MockTab, url: string): void {
	const epoch = tab.nav_epoch + 1;
	tab.nav_epoch = epoch;
	tab.loading = true;
	mockEmit('nav-started', win.id, tab.id, epoch, { url });

	// Simulate instant navigation
	tab.url = url;
	tab.title = deriveTitle(url);
	tab.favicon_url = defaultFavicon(url);
	tab.loading = false;
	tab.can_go_back = tab.historyIndex > 0;
	tab.can_go_forward = false;

	// Truncate forward history
	if (tab.historyIndex < tab.history.length - 1) {
		tab.history = tab.history.slice(0, tab.historyIndex + 1);
	}
	tab.history.push(url);
	tab.historyIndex = tab.history.length - 1;

	mockEmit('nav-committed', win.id, tab.id, epoch, { url, title: tab.title });
}

// ── Implementation ──

export async function browserWindowOpen(url?: string): Promise<BrowserWindowInfo> {
	await delay(50);
	const windowId = uid();
	const win: MockWindow = { id: windowId, tabs: [], activeTabId: '', closedStack: [] };
	mockWindows.set(windowId, win);
	const tab = mockNewTab(windowId, url || 'https://www.google.com');
	mockEmit('tab-created', windowId, tab.id, tab.nav_epoch, { url: tab.url, title: tab.title });
	mockEmit('tab-activated', windowId, tab.id, tab.nav_epoch);
	return { window_id: windowId, tabs: win.tabs.map(t => toTab(t)), active_tab_id: tab.id };
}

/** Browser-preview equivalent of the native chrome webview label lookup. */
export async function browserCurrentWindowId(): Promise<string | null> {
	if (typeof window === 'undefined') return null;
	return new URLSearchParams(window.location.search).get('win');
}

/**
 * Chrome-bootstrap snapshot. Native returns null for unknown windows; the mock instead
 * CREATES the window (with one fresh tab) so `pnpm dev`'s /browser?win=<id> route works
 * without anything having called browserWindowOpen first.
 */
export async function browserWindowState(windowId: string): Promise<BrowserWindowInfo | null> {
	let win = mockWindows.get(windowId);
	if (!win) {
		win = { id: windowId, tabs: [], activeTabId: '', closedStack: [] };
		mockWindows.set(windowId, win);
		mockNewTab(windowId, 'https://www.google.com');
	}
	return { window_id: win.id, tabs: win.tabs.map(t => toTab(t)), active_tab_id: win.activeTabId };
}

export async function browserWindowClose(windowId: string): Promise<void> {
	const win = mockWindows.get(windowId);
	if (win) {
		mockEmit('window-closed', windowId, '', 0);
		mockWindows.delete(windowId);
	}
}

export async function browserSessionRestoreEnabled(): Promise<boolean> {
	return mockSessionRestoreEnabled;
}

export async function browserSetSessionRestore(enabled: boolean): Promise<void> {
	mockSessionRestoreEnabled = enabled;
}

export async function browserToggleFocus(): Promise<void> {
	// No-op in mock mode
}

export async function browserTabCreate(params: BrowserTabCreateParams): Promise<Tab> {
	await delay(30);
	const win = mockWindows.get(params.windowId);
	if (!win) throw new Error(`Mock window ${params.windowId} not found`);
	const tab = mockNewTab(params.windowId, params.url ?? null);
	// Background tabs don't auto-activate
	if (params.background) {
		win.activeTabId = tab.id; // In mock, new tab is always active
	}
	mockEmit('tab-created', win.id, tab.id, tab.nav_epoch, { url: tab.url, title: tab.title });
	mockEmit('tab-activated', win.id, tab.id, tab.nav_epoch);
	return toTab(tab);
}

export async function browserTabClose(params: BrowserTabParams): Promise<void> {
	const win = mockWindows.get(params.windowId);
	if (!win) return;
	const idx = win.tabs.findIndex(t => t.id === params.tabId);
	if (idx === -1) return;
	const [closed] = win.tabs.splice(idx, 1);
	win.closedStack.push(closed);
	mockEmit('tab-closed', win.id, params.tabId, closed.nav_epoch);
	// Select the next tab
	if (win.activeTabId === params.tabId) {
		const nextIdx = Math.min(idx, win.tabs.length - 1);
		win.activeTabId = win.tabs[nextIdx]?.id || '';
		if (win.activeTabId) {
			mockEmit('tab-activated', win.id, win.activeTabId, 0);
		}
	}
}

export async function browserTabActivate(params: BrowserTabParams): Promise<void> {
	const win = mockWindows.get(params.windowId);
	if (!win) return;
	if (mockFindTab(params.windowId, params.tabId)) {
		win.activeTabId = params.tabId;
		mockEmit('tab-activated', win.id, params.tabId, 0);
	}
}

export async function browserTabReorder(params: BrowserTabReorderParams): Promise<void> {
	const win = mockWindows.get(params.windowId);
	if (!win) return;
	const idx = win.tabs.findIndex(t => t.id === params.tabId);
	if (idx === -1) return;
	const [tab] = win.tabs.splice(idx, 1);
	win.tabs.splice(Math.min(params.toIndex, win.tabs.length), 0, tab);
}

export async function browserTabReopenClosed(windowId: string): Promise<Tab | null> {
	const win = mockWindows.get(windowId);
	if (!win || win.closedStack.length === 0) return null;
	const tab = win.closedStack.pop()!;
	win.tabs.push(tab);
	win.activeTabId = tab.id;
	mockEmit('tab-created', win.id, tab.id, tab.nav_epoch, { url: tab.url, title: tab.title });
	mockEmit('tab-activated', win.id, tab.id, tab.nav_epoch);
	return toTab(tab);
}

export async function browserNavigateTab(params: BrowserNavigateParams): Promise<void> {
	await delay(20);
	const win = mockWindows.get(params.windowId);
	if (!win) return;
	const tab = mockFindTab(params.windowId, params.tabId);
	if (!tab) return;
	mockNavigate(win, tab, params.url);
}

export async function browserReloadTab(params: BrowserTabParams): Promise<void> {
	const tab = mockFindTab(params.windowId, params.tabId);
	if (!tab) return;
	const epoch = tab.nav_epoch + 1;
	tab.nav_epoch = epoch;
	tab.loading = true;
	mockEmit('nav-started', params.windowId, params.tabId, epoch, { url: tab.url });
	await delay(50);
	tab.loading = false;
	mockEmit('nav-committed', params.windowId, params.tabId, epoch, { url: tab.url, title: tab.title });
	mockEmit('load-finished', params.windowId, params.tabId, epoch);
}

export async function browserStop(params: BrowserTabParams): Promise<void> {
	const tab = mockFindTab(params.windowId, params.tabId);
	if (!tab) return;
	tab.loading = false;
}

export async function browserGoBackTab(params: BrowserTabParams): Promise<void> {
	const win = mockWindows.get(params.windowId);
	if (!win) return;
	const tab = mockFindTab(params.windowId, params.tabId);
	if (!tab || tab.historyIndex <= 0) return;
	tab.historyIndex--;
	const url = tab.history[tab.historyIndex];
	tab.can_go_back = tab.historyIndex > 0;
	tab.can_go_forward = true;
	mockNavigate(win, tab, url);
}

export async function browserGoForwardTab(params: BrowserTabParams): Promise<void> {
	const win = mockWindows.get(params.windowId);
	if (!win) return;
	const tab = mockFindTab(params.windowId, params.tabId);
	if (!tab || tab.historyIndex >= tab.history.length - 1) return;
	tab.historyIndex++;
	const url = tab.history[tab.historyIndex];
	tab.can_go_back = true;
	tab.can_go_forward = tab.historyIndex < tab.history.length - 1;
	mockNavigate(win, tab, url);
}

export async function browserSetViewportBounds(_windowId: string, _rect: BrowserViewportRect): Promise<void> {
	// No-op in mock mode — viewport tracking is a native concept
}

export async function browserSetChromeOverlay(_windowId: string, _open: boolean): Promise<void> {
	// No-op in mock mode — overlay z-ordering is a native concept
}

export async function browserAutofill(_params: BrowserAutofillParams): Promise<void> {
	// No-op in mock mode — autofill requires a real webview
}

export function onBrowserEvent(callback: (event: BrowserEvent) => void): () => void {
	mockEventListeners.add(callback);
	return () => { mockEventListeners.delete(callback); };
}

function toTab(t: MockTab): Tab {
	return {
		id: t.id,
		url: t.url,
		title: t.title,
		favicon_url: t.favicon_url,
		can_go_back: t.can_go_back,
		can_go_forward: t.can_go_forward,
		loading: t.loading,
		nav_epoch: t.nav_epoch,
	};
}

export async function selectFile(_title?: string): Promise<string | null> {
	await delay(200);
	const simulatedPaths = [
		'/workspace/src/main.ts',
		'/workspace/src/utils.ts',
		'/workspace/package.json',
		'/workspace/README.md'
	];
	return simulatedPaths[Math.floor(Math.random() * simulatedPaths.length)];
}

export async function pathExists(path: string): Promise<boolean> {
	return !!mockFiles[normalizedMockPath(path)];
}

export async function searchWorkspaceFiles(root: string, query: string, limit = 8): Promise<FileEntry[]> {
	const normalizedRoot = normalizedMockPath(root);
	const normalizedQuery = query.trim().toLowerCase();
	return Object.entries(mockFiles)
		.filter(([path, entry]) => !entry.isDir && path.startsWith(`${normalizedRoot}/`))
		.filter(([path]) => path.split('/').pop()?.toLowerCase().includes(normalizedQuery))
		.slice(0, Math.max(1, Math.min(50, limit)))
		.map(([path, entry]) => ({ name: path.split('/').pop() || path, path, isDir: false, size: entry.content?.length ?? 0 }));
}

export async function listOllamaModels(_baseUrl: string): Promise<string[]> {
	return ['qwen2.5-coder:7b', 'llama3.2:3b'];
}

export async function runApiModel(
	provider: string,
	credentialId: string | null,
	model: string,
	prompt: string,
	systemPrompt?: string,
	baseUrl?: string,
	_isFullUrl = false
): Promise<void> {
	await delay(100);
	// Browser development has no secure bridge to the host keychain or workspace .env.
	// Built-in provider previews remain deterministic without a secret, but a saved BYOK
	// model must obey the native contract: its exact credential id has to exist. Otherwise
	// browser tests would mask the dangling-model failure that Tauri users see.
	const storedKey = credentialId ? localStorage.getItem(`ide:apikey:${credentialId}`) : null;
	if (credentialId?.startsWith('custom-model-') && !storedKey) {
		throw new Error(`No keychain credential found for ${credentialId}`);
	}
	const apiKey = storedKey || 'browser-mock-key';

	const myGeneration = ++mockAiGeneration;

	let responseText = `Hello! This is a mock streaming response from **${provider}** using model **${model}**.
API base URL: \`${baseUrl || "default"}\`.

Here is a summary of the input received:
* **Prompt**: "${prompt}"
* **System Instruction**: "${systemPrompt || "none"}"
* **API Key Length**: ${apiKey.length} characters.

How else can I assist you with settings or command configurations?`;

	let reasoningText = "Contacting mock API server...\nValidating provider payload details...\nStarting stream chunk generation...";

	// Stream reasoning first
	mockAiTimers.push(setTimeout(() => {
		if (myGeneration !== mockAiGeneration) return;
		for (const cb of mockChunkListeners) {
			cb("<thought>\n" + reasoningText + "\n</thought>\n\n");
		}
	}, 100));

	// Stream response chunks
	const words = responseText.split(' ');
	let i = 0;

	const interval = setInterval(() => {
		if (myGeneration !== mockAiGeneration) {
			clearInterval(interval);
			return;
		}
		if (i < words.length) {
			const chunk = words[i] + " ";
			for (const cb of mockChunkListeners) {
				cb(chunk);
			}
			i++;
		} else {
			clearInterval(interval);
			emitMockUsage(prompt, responseText);
			for (const cb of mockDoneListeners) {
				cb();
			}
		}
	}, 60);
	mockAiTimers.push(interval);
}

export async function selectSaveFile(title: string, defaultName: string, extension: string): Promise<string | null> {
	await delay(200);
	const filename = prompt(`${title}\nDefault: ${defaultName}\n(Enter filename to save)`, defaultName);
	if (!filename) return null;
	return `/mock/workspace/${filename.endsWith('.' + extension) ? filename : filename + '.' + extension}`;
}

export async function selectOpenFile(title: string, extension: string): Promise<string | null> {
	await delay(200);
	const filename = prompt(`${title}\n(Enter name of workspace file to load, e.g. project.fractal-workspace)`);
	if (!filename) return null;
	return `/mock/workspace/${filename.endsWith('.' + extension) ? filename : filename + '.' + extension}`;
}

// --- Mock ADR-011 Phase 1 memory storage (localStorage-backed so it survives reload) ---

interface MockMemoryStore {
	sessions: Record<string, { id: string; title: string | null; createdAt: number; updatedAt: number; model?: string | null }>;
	messages: Array<{ id: string; sessionId: string; role: string; content: string; createdAt: number }>;
}

function memStoreKey(projectPath: string): string {
	return `ide:mock-memory:${projectPath}`;
}

function loadMemStore(projectPath: string): MockMemoryStore {
	if (typeof localStorage !== 'undefined') {
		try {
			const raw = localStorage.getItem(memStoreKey(projectPath));
			if (raw) return JSON.parse(raw);
		} catch {
			// fall through to empty store
		}
	}
	return { sessions: {}, messages: [] };
}

function saveMemStore(projectPath: string, store: MockMemoryStore) {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(memStoreKey(projectPath), JSON.stringify(store));
	}
}

export async function openProjectMemory(projectPath: string): Promise<void> {
	if (!projectPath) return;
	loadMemStore(projectPath);
}

export async function appendMessage(projectPath: string, sessionId: string, messageId: string, role: string, content: string, model?: string | null): Promise<void> {
	if (!projectPath || !sessionId) return;
	const store = loadMemStore(projectPath);
	const now = Date.now();
	if (!store.sessions[sessionId]) {
		store.sessions[sessionId] = { id: sessionId, title: null, createdAt: now, updatedAt: now, model: model ?? null };
	}
	store.sessions[sessionId].updatedAt = now;
	const idx = store.messages.findIndex(m => m.id === messageId);
	const msg = { id: messageId, sessionId, role, content, createdAt: now };
	if (idx >= 0) store.messages[idx] = msg;
	else store.messages.push(msg);
	saveMemStore(projectPath, store);
}

export async function listSessions(projectPath: string): Promise<SessionInfo[]> {
	if (!projectPath) return [];
	const store = loadMemStore(projectPath);
	return Object.values(store.sessions)
		.map(sess => {
			const msgs = store.messages.filter(m => m.sessionId === sess.id);
			return {
				id: sess.id,
				title: sess.title,
				createdAt: sess.createdAt,
				updatedAt: sess.updatedAt,
				messageCount: msgs.length,
				preview: msgs[0]?.content ?? null,
				model: sess.model ?? null
			};
		})
		.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function loadSession(projectPath: string, sessionId: string): Promise<StoredMessage[]> {
	if (!projectPath) return [];
	const store = loadMemStore(projectPath);
	return store.messages
		.filter(m => m.sessionId === sessionId)
		.map(m => ({ id: m.id, role: m.role, content: m.content, createdAt: m.createdAt }));
}

export async function createCheckpoint(_projectPath: string, _sessionId: string, _messageId: string, _label: string): Promise<void> {
	// Mock: checkpoint is just a marker the UI tracks; nothing to persist for restore-after semantics.
	return;
}

export async function restoreCheckpoint(projectPath: string, sessionId: string, messageId: string): Promise<void> {
	if (!projectPath) return;
	const store = loadMemStore(projectPath);
	const markerIdx = store.messages.findIndex(m => m.id === messageId);
	if (markerIdx < 0) return;
	// Delete every message of this session that comes after the marker (insertion order).
	store.messages = store.messages.filter((m, i) => !(m.sessionId === sessionId && i > markerIdx));
	saveMemStore(projectPath, store);
}

type MockEnvProviderConfig = {
	apiKey?: string;
	baseUrl?: string;
	model?: string;
	apiFormat?: EnvProvider['apiFormat'];
	isFullUrl?: boolean;
};

function defaultEnvApiFormat(provider: string): EnvProvider['apiFormat'] {
	switch (provider.toLowerCase()) {
		case 'anthropic':
		case 'claude': return 'anthropic';
		case 'gemini':
		case 'google': return 'gemini';
		case 'ollama': return 'ollama';
		default: return 'openai';
	}
}

function parseEnvProviderConfigs(projectPath: string): Record<string, MockEnvProviderConfig> {
	if (!projectPath) return {};
	const file = mockFiles[`${projectPath}/.env`] || mockFiles['/workspace/.env'];
	if (!file || !file.content) return {};
	const map: Record<string, MockEnvProviderConfig> = {};
	for (const raw of file.content.split('\n')) {
		const line = raw.trim();
		if (!line || line.startsWith('#')) continue;
		const eq = line.indexOf('=');
		if (eq < 0) continue;
		const key = line.slice(0, eq).trim();
		let val = line.slice(eq + 1).trim();
		if (val.length >= 2 && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
			val = val.slice(1, -1);
		}
		if (!val) continue;
		let m: RegExpMatchArray | null;
		if ((m = key.match(/^API_KEY_(.+)$/))) (map[m[1]] ??= {}).apiKey = val;
		else if ((m = key.match(/^API_LINK_(.+)$/))) (map[m[1]] ??= {}).baseUrl = val;
		else if ((m = key.match(/^API_MODEL_(.+)$/))) (map[m[1]] ??= {}).model = val;
		else if ((m = key.match(/^API_FORMAT_(.+)$/))) {
			const format = val.toLowerCase();
			if (format === 'openai' || format === 'anthropic' || format === 'gemini' || format === 'ollama') {
				(map[m[1]] ??= {}).apiFormat = format;
			}
		}
	}
	return map;
}

export async function readEnvProviders(projectPath: string): Promise<EnvProvider[]> {
	const map = parseEnvProviderConfigs(projectPath);
	return Object.entries(map)
		.filter(([, v]) => v.apiKey)
		.map(([provider, v]) => ({
			provider: provider.toLowerCase(),
			baseUrl: v.baseUrl ?? null,
			model: v.model ?? null,
			apiFormat: v.apiFormat ?? defaultEnvApiFormat(provider),
		}))
		.sort((a, b) => a.provider.localeCompare(b.provider));
}

export async function runEnvModel(projectPath: string, provider: string, prompt: string, systemPrompt?: string): Promise<void> {
	const config = parseEnvProviderConfigs(projectPath)[provider.toUpperCase()]
		?? Object.entries(parseEnvProviderConfigs(projectPath)).find(([name]) => name.toLowerCase() === provider.toLowerCase())?.[1];
	if (!config?.apiKey || !config.model) throw new Error(`Incomplete .env provider configuration: ${provider}`);
	const credentialId = `mock-env-${provider}`;
	localStorage.setItem(`ide:apikey:${credentialId}`, config.apiKey);
	try {
		return await runApiModel(
			config.apiFormat ?? defaultEnvApiFormat(provider),
			credentialId,
			config.model,
			prompt,
			systemPrompt,
			config.baseUrl,
			config.isFullUrl ?? false
		);
	} finally {
		localStorage.removeItem(`ide:apikey:${credentialId}`);
	}
}

// The mock workspace is a synthetic in-memory tree, not this repo's real filesystem — there's no
// real docs/INDEX.md to mechanically rebuild in web/mock dev mode, so this is a safe no-op.
export async function rebuildDocsIndex(_rootPath: string): Promise<{
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
}> {
	return {
		adrCount: 0,
		designCount: 0,
		routingCount: 0,
		areasCount: 0,
		guidesCount: 0,
		plansCount: 0,
		archiveCount: 0,
		skillCount: 0,
		agentCount: 0,
		missingFrontmatter: [],
		unregisteredSkillsOrAgents: []
	};
}

// ── Data layer — real in-memory engine (see DATA-LAYER-PLAN.md / ADR-027) ────────

interface MockSearchDoc {
	source: SearchSource;
	docId: string;
	title: string;
	body: string;
	path: string | null;
	updatedAt: number;
}

const mockSearchIndex = new Map<string, MockSearchDoc>();   // key: `${source}:${docId}`
const mockBookmarks = new Map<string, Bookmark>();
const mockBookmarkFolders = new Map<string, BookmarkFolder>();

function mockIndexKey(source: SearchSource, docId: string): string {
	return `${source}:${docId}`;
}

function generateBmId(): string {
	return `bm_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function generateBookmarkFolderId(): string {
	return `bf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

const MOCK_MAX_LIMIT = 200;
const MOCK_DEFAULT_LIMIT = 50;
const MOCK_SNIPPET_WINDOW = 12;

/**
 * Tokenize a string into lowercase words for naive matching.
 */
function tokenize(text: string): string[] {
	return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

/**
 * Find the first occurrence of any query term in the text and return a 12-word
 * window wrapped in «…» markers. Returns the full text (trimmed) if no match.
 */
function mockSnippet(text: string, queryTokens: string[]): string {
	const lower = text.toLowerCase();
	let firstIdx = -1;
	for (const tok of queryTokens) {
		const idx = lower.indexOf(tok);
		if (idx >= 0 && (firstIdx < 0 || idx < firstIdx)) firstIdx = idx;
	}
	if (firstIdx < 0) return text.substring(0, 200);

	// Count words before first match
	const before = text.substring(0, firstIdx);
	const beforeWords = before.split(/\s+/).filter(Boolean);
	const after = text.substring(firstIdx);
	const afterWords = after.split(/\s+/).filter(Boolean);

	const windowWords = [...beforeWords.slice(-MOCK_SNIPPET_WINDOW), ...afterWords.slice(0, MOCK_SNIPPET_WINDOW)];
	const joined = windowWords.join(' ').substring(0, 500);

	// Wrap the first matching token in «»
	const lowerJoined = joined.toLowerCase();
	let matchPos = -1;
	for (const tok of queryTokens) {
		const pos = lowerJoined.indexOf(tok);
		if (pos >= 0 && (matchPos < 0 || pos < matchPos)) matchPos = pos;
	}

	if (matchPos < 0) return joined;
	// Find which token matched at matchPos
	let matchedTok = '';
	for (const tok of queryTokens) {
		if (lowerJoined.indexOf(tok) === matchPos) { matchedTok = tok; break; }
	}
	if (!matchedTok) return joined;

	const beforeMatch = joined.substring(0, matchPos);
	const afterMatch = joined.substring(matchPos + matchedTok.length);
	return `${beforeMatch}«${matchedTok}»${afterMatch}`;
}

/**
 * Score a document by naive term frequency.
 */
function mockScore(title: string, body: string, queryTokens: string[]): number {
	const lower = `${title} ${body}`.toLowerCase();
	let score = 0;
	for (const tok of queryTokens) {
		let pos = 0;
		while (true) {
			pos = lower.indexOf(tok, pos);
			if (pos < 0) break;
			score++;
			pos += tok.length;
		}
	}
	return score;
}

export async function searchAll(query: SearchQuery): Promise<SearchHit[]> {
	const tokens = tokenize(query.query);
	if (tokens.length === 0) return [];

	const limit = Math.min(query.limit ?? MOCK_DEFAULT_LIMIT, MOCK_MAX_LIMIT);
	const offset = Math.max(query.offset ?? 0, 0);

	const hits: SearchHit[] = [];

	for (const doc of mockSearchIndex.values()) {
		// Filter by sources
		if (query.sources && query.sources.length > 0 && !query.sources.includes(doc.source)) continue;

		const docText = `${doc.title} ${doc.body}`;
		const lowerDoc = docText.toLowerCase();

		// AND matching: all query tokens must appear
		const allMatch = tokens.every(tok => lowerDoc.includes(tok));
		if (!allMatch) continue;

		const score = mockScore(doc.title, doc.body, tokens);
		const snippet = mockSnippet(`${doc.title} ${doc.body}`, tokens);

		hits.push({
			source: doc.source,
			docId: doc.docId,
			title: doc.title,
			snippet,
			score,
			path: doc.path,
			updatedAt: doc.updatedAt,
		});
	}

	// Sort by score descending
	hits.sort((a, b) => b.score - a.score);

	return hits.slice(offset, offset + limit);
}

export async function indexDocuments(docs: IndexDocument[]): Promise<void> {
	for (const doc of docs) {
		const key = mockIndexKey(doc.source, doc.docId);
		// Delete-then-insert (idempotent, reindex semantics)
		mockSearchIndex.delete(key);
		mockSearchIndex.set(key, {
			source: doc.source,
			docId: doc.docId,
			title: doc.title,
			body: doc.body,
			path: doc.path,
			updatedAt: doc.updatedAt,
		});
	}
}

export async function removeIndexedDocuments(source: SearchSource, docIds: string[]): Promise<void> {
	for (const docId of docIds) {
		mockSearchIndex.delete(mockIndexKey(source, docId));
	}
}

// ── Bookmarks (module-neutral `bookmark*` IPC surface, §3.4) ─────────────────────

function indexMockBookmark(bookmark: Bookmark): void {
	const body = `${bookmark.description} ${bookmark.tags.join(' ')}`.trim();
	mockSearchIndex.set(mockIndexKey('bookmark', bookmark.id), {
		source: 'bookmark', docId: bookmark.id, title: bookmark.title, body,
		path: bookmark.url, updatedAt: bookmark.updatedAt,
	});
}

function normaliseBookmarkInput(input: BookmarkInput): Required<Pick<BookmarkInput, 'url' | 'title'>> & Omit<BookmarkInput, 'url' | 'title'> {
	const url = input.url.trim();
	const title = input.title.trim();
	if (!url || !title) throw new Error('Bookmark URL and title are required');
	if (input.folderId && !mockBookmarkFolders.has(input.folderId)) throw new Error('Bookmark folder not found');
	return { ...input, url, title, tags: input.tags?.map(tag => tag.trim()).filter(Boolean) };
}

export async function bookmarkList(folderId?: string | null): Promise<Bookmark[]> {
	return [...mockBookmarks.values()]
		.filter(bookmark => folderId === undefined || bookmark.folderId === folderId)
		.sort((a, b) => a.position - b.position || b.updatedAt - a.updatedAt || b.id.localeCompare(a.id));
}

export async function bookmarkForUrl(url: string): Promise<Bookmark | null> {
	const normalised = url.trim();
	return [...mockBookmarks.values()].find(bookmark => bookmark.url === normalised) ?? null;
}

export async function bookmarkAdd(input: BookmarkInput): Promise<Bookmark> {
	const normalised = normaliseBookmarkInput(input);
	if (await bookmarkForUrl(normalised.url)) throw new Error('Bookmark URL already exists');
	const now = Date.now();
	const bookmark: Bookmark = {
		id: generateBmId(),
		url: normalised.url,
		title: normalised.title,
		description: normalised.description?.trim() ?? '',
		faviconUrl: normalised.faviconUrl?.trim() || null,
		tags: normalised.tags ?? [],
		folderId: normalised.folderId ?? null,
		position: normalised.position ?? 0,
		createdAt: now,
		updatedAt: now,
	};
	mockBookmarks.set(bookmark.id, bookmark);
	indexMockBookmark(bookmark);
	return bookmark;
}

export async function bookmarkUpdate(id: string, input: BookmarkInput): Promise<Bookmark> {
	const existing = mockBookmarks.get(id);
	if (!existing) throw new Error(`Bookmark not found: ${id}`);
	const normalised = normaliseBookmarkInput(input);
	const urlMatch = await bookmarkForUrl(normalised.url);
	if (urlMatch && urlMatch.id !== id) throw new Error('Bookmark URL already exists');

	const updated: Bookmark = {
		...existing,
		url: normalised.url,
		title: normalised.title,
		description: normalised.description?.trim() ?? existing.description,
		faviconUrl: normalised.faviconUrl === undefined ? existing.faviconUrl : normalised.faviconUrl?.trim() || null,
		tags: normalised.tags ?? existing.tags,
		folderId: normalised.folderId === undefined ? existing.folderId : normalised.folderId,
		position: normalised.position ?? existing.position,
		updatedAt: Date.now(),
	};
	mockBookmarks.set(id, updated);
	indexMockBookmark(updated);
	return updated;
}

export async function bookmarkDelete(id: string): Promise<void> {
	if (!mockBookmarks.has(id)) throw new Error(`Bookmark not found: ${id}`);
	mockBookmarks.delete(id);
	mockSearchIndex.delete(mockIndexKey('bookmark', id));
}

export async function bookmarkFolderList(): Promise<BookmarkFolder[]> {
	return [...mockBookmarkFolders.values()].sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));
}

export async function bookmarkFolderAdd(input: BookmarkFolderInput): Promise<BookmarkFolder> {
	const name = input.name.trim();
	if (!name) throw new Error('Bookmark folder name is required');
	if ([...mockBookmarkFolders.values()].some(folder => folder.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error('Bookmark folder already exists');
	const now = Date.now();
	const folder = { id: generateBookmarkFolderId(), name, position: input.position ?? 0, createdAt: now, updatedAt: now };
	mockBookmarkFolders.set(folder.id, folder);
	return folder;
}

export async function bookmarkFolderUpdate(id: string, input: BookmarkFolderInput): Promise<BookmarkFolder> {
	const current = mockBookmarkFolders.get(id);
	if (!current) throw new Error('Bookmark folder not found');
	const name = input.name.trim();
	if (!name) throw new Error('Bookmark folder name is required');
	if ([...mockBookmarkFolders.values()].some(folder => folder.id !== id && folder.name.toLocaleLowerCase() === name.toLocaleLowerCase())) throw new Error('Bookmark folder already exists');
	const updated = { ...current, name, position: input.position ?? current.position, updatedAt: Date.now() };
	mockBookmarkFolders.set(id, updated);
	return updated;
}

export async function bookmarkFolderDelete(id: string): Promise<void> {
	if (!mockBookmarkFolders.has(id)) throw new Error('Bookmark folder not found');
	mockBookmarkFolders.delete(id);
	for (const bookmark of mockBookmarks.values()) {
		if (bookmark.folderId === id) {
			const updated = { ...bookmark, folderId: null, updatedAt: Date.now() };
			mockBookmarks.set(bookmark.id, updated);
			indexMockBookmark(updated);
		}
	}
}

// ── History mock (mirrors storage.rs semantics: upsert, debounce, FTS-substring) ────

interface MockHistoryUrl extends HistoryEntry {}
interface MockHistoryVisit { urlId: number; visitedAt: number; transition: string; }

const mockHistoryUrls = new Map<number, MockHistoryUrl>();   // id → row
const mockHistoryVisits: MockHistoryVisit[] = [];
let mockHistoryNextId = 1;
const MOCK_HISTORY_DEBOUNCE_MS = 3_000;

/** Test/dev hook — reset the in-memory history store. */
function __resetMockHistory(): void {
	mockHistoryUrls.clear();
	mockHistoryVisits.length = 0;
	mockHistoryNextId = 1;
}

export async function historyRecordVisit(input: HistoryVisitInput): Promise<HistoryEntry> {
	const url = input.url.trim();
	if (!url) throw new Error('History visit requires a URL');
	const title = input.title ?? '';
	const favicon = input.faviconUrl && input.faviconUrl.trim() ? input.faviconUrl : null;
	const transition = input.transition ?? 'link';
	const now = Date.now();

	let existing = [...mockHistoryUrls.values()].find(u => u.url === url);
	if (existing) {
		const debounced = now - existing.lastVisitAt < MOCK_HISTORY_DEBOUNCE_MS;
		if (!debounced) {
			mockHistoryVisits.push({ urlId: existing.id, visitedAt: now, transition });
			existing.visitCount += 1;
		}
		if (title !== '') existing.title = title;
		if (favicon !== null) existing.faviconUrl = favicon;
		existing.lastVisitAt = now;
		return { ...existing };
	}
	const entry: MockHistoryUrl = {
		id: mockHistoryNextId++,
		url,
		title,
		faviconUrl: favicon,
		visitCount: 1,
		lastVisitAt: now,
	};
	mockHistoryUrls.set(entry.id, entry);
	mockHistoryVisits.push({ urlId: entry.id, visitedAt: now, transition });
	return { ...entry };
}

export async function historySearch(query: string, limit?: number): Promise<HistoryEntry[]> {
	const tokens = tokenize(query);
	if (tokens.length === 0) return [];
	const cap = Math.min(limit ?? MOCK_DEFAULT_LIMIT, MOCK_MAX_LIMIT);
	const hits = [...mockHistoryUrls.values()].filter(u => {
		const hay = `${u.url} ${u.title}`.toLowerCase();
		return tokens.every(tok => hay.includes(tok));
	});
	hits.sort((a, b) => b.lastVisitAt - a.lastVisitAt || b.visitCount - a.visitCount);
	return hits.slice(0, cap).map(u => ({ ...u }));
}

export async function historyRecent(limit?: number): Promise<HistoryEntry[]> {
	const cap = Math.min(limit ?? MOCK_DEFAULT_LIMIT, MOCK_MAX_LIMIT);
	return [...mockHistoryUrls.values()]
		.sort((a, b) => b.lastVisitAt - a.lastVisitAt || b.id - a.id)
		.slice(0, cap)
		.map(u => ({ ...u }));
}

export async function historyDeleteUrl(id: number): Promise<void> {
	mockHistoryUrls.delete(id);
	for (let i = mockHistoryVisits.length - 1; i >= 0; i--) {
		if (mockHistoryVisits[i].urlId === id) mockHistoryVisits.splice(i, 1);
	}
}

export async function historyClearRange(from?: number, to?: number): Promise<void> {
	for (let i = mockHistoryVisits.length - 1; i >= 0; i--) {
		const v = mockHistoryVisits[i];
		if ((from == null || v.visitedAt >= from) && (to == null || v.visitedAt <= to)) {
			mockHistoryVisits.splice(i, 1);
		}
	}
	for (const [id, row] of [...mockHistoryUrls.entries()]) {
		const visits = mockHistoryVisits.filter(v => v.urlId === id);
		if (visits.length === 0) {
			mockHistoryUrls.delete(id);
		} else {
			row.visitCount = visits.length;
			row.lastVisitAt = Math.max(...visits.map(v => v.visitedAt));
		}
	}
}

// ── Contract-completing mocks ────────────────────────────────────────────────────

// Helper to determine if running inside Tauri — always false in the mock.
export function isTauri(): boolean {
	return false;
}

// Pure function mapping template ids to menu ids (shared by ipc.ts and mock).
export function templateIdToMenuId(templateId: string | null): string | null {
	if (!templateId) return null;
	return `tpl_${templateId}`;
}

// ── fractalMedia — mock owned-library engine (stream B1) ─────────────────────────
// In-memory library seeded from static/media-fixtures/ on mediaInitLibrary.
// Matches ADR-027 conventions: in-memory Maps, no persistence across reloads —
// mediaGetLibrary starts null each load so the first-launch flow stays exercisable.
// See docs/plans/media-module-plan.md §7 B1.

import type {
	MediaFolder,
	MediaFsEvent,
	MediaImportMode,
	MediaImportProgress,
	MediaItem,
	MediaKind,
	MediaLibraryInfo,
	MediaQuery,
	MediaTag
} from './modules/media/types';
import { mediaKindForExtension } from './modules/media/types';

interface MockMediaSeed {
	relPath: string;
	size: number;
	width: number;
	height: number;
	durationMs?: number;
	tags?: string[];
	pinned?: boolean;
}

// Mirrors static/media-fixtures/ exactly (real byte sizes and dimensions).
// readme.txt is deliberately absent: it is the import-walker skip fixture, not media.
const MOCK_MEDIA_SEEDS: MockMediaSeed[] = [
	{ relPath: 'nature/aurora.gif', size: 87012, width: 160, height: 120, tags: ['gradient'] },
	{ relPath: 'nature/clip-gradient.webm', size: 59747, width: 320, height: 240, durationMs: 2000, tags: ['gradient'] },
	{ relPath: 'nature/closeups/cell-texture.png', size: 7338, width: 320, height: 240 },
	{ relPath: 'nature/dawn-gradient.jpg', size: 6907, width: 320, height: 480, tags: ['gradient', 'sky'] },
	{ relPath: 'nature/fractal-coast.png', size: 94933, width: 320, height: 320, pinned: true },
	{ relPath: 'nature/sunset-gradient.jpg', size: 6039, width: 480, height: 320, tags: ['gradient', 'sky'], pinned: true },
	{ relPath: 'shapes/clip-pattern.mp4', size: 70053, width: 320, height: 240, durationMs: 2000 },
	{ relPath: 'shapes/orbit.svg', size: 277, width: 200, height: 200, tags: ['vector'] },
	{ relPath: 'shapes/smpte-bars.jpg', size: 3782, width: 320, height: 240 },
	{ relPath: 'shapes/spinner.gif', size: 34318, width: 160, height: 120 },
	{ relPath: 'shapes/test-pattern.png', size: 13862, width: 400, height: 300 },
];

// Stand-in asset for items imported into the mock (which have no real file on disk).
const MOCK_MEDIA_STANDIN: Record<MediaKind, string> = {
	image: 'nature/sunset-gradient.jpg',
	gif: 'shapes/spinner.gif',
	video: 'shapes/clip-pattern.mp4',
};

let mockMediaLibrary: MediaLibraryInfo | null = null;
const mockMediaItems = new Map<string, MediaItem>();      // id → item
const mockMediaFolders = new Set<string>();               // explicit rel folder paths ('' excluded)
const mockMediaSeedPaths = new Set<string>();             // relPaths that exist as real fixture files
let mockMediaIdSeq = 1;
let mockMediaImportSeq = 1;
const mockMediaCancelledImports = new Set<string>();
const mockMediaFsListeners = new Set<(event: MediaFsEvent) => void>();
const mockMediaImportListeners = new Set<(progress: MediaImportProgress) => void>();

function emitMediaFsEvent(event: MediaFsEvent): void {
	for (const cb of mockMediaFsListeners) cb(event);
}

function emitMediaImportProgress(progress: MediaImportProgress): void {
	for (const cb of mockMediaImportListeners) cb(progress);
}

function assertMediaLibrary(): MediaLibraryInfo {
	if (!mockMediaLibrary) throw new Error('MEDIA_LIBRARY_NOT_INITIALIZED');
	return mockMediaLibrary;
}

/** Validate + normalize a library-relative path; rejects escapes ('' = library root).
 * Absolute paths are rejected outright (matching the Rust engine) — the contract
 * traffics exclusively in library-relative paths. */
function normalizeMediaRelPath(relPath: string): string {
	if (relPath.startsWith('/') || relPath.includes('\\')) {
		throw new Error(`MEDIA_PATH_ESCAPE:${relPath}`);
	}
	const trimmed = relPath.replace(/\/+$/g, '');
	if (trimmed === '') return '';
	const segments = trimmed.split('/');
	for (const seg of segments) {
		if (seg === '' || seg === '.' || seg === '..') {
			throw new Error(`MEDIA_PATH_ESCAPE:${relPath}`);
		}
	}
	return segments.join('/');
}

function mediaParentOf(relPath: string): string {
	const idx = relPath.lastIndexOf('/');
	return idx < 0 ? '' : relPath.substring(0, idx);
}

function mediaBasename(relPath: string): string {
	const idx = relPath.lastIndexOf('/');
	return idx < 0 ? relPath : relPath.substring(idx + 1);
}

function mediaExtOf(name: string): string {
	const idx = name.lastIndexOf('.');
	return idx <= 0 ? '' : name.substring(idx + 1).toLowerCase();
}

function mediaFolderExists(relPath: string): boolean {
	if (relPath === '') return true;
	if (mockMediaFolders.has(relPath)) return true;
	for (const folder of mockMediaFolders) {
		if (folder.startsWith(`${relPath}/`)) return true;
	}
	return false;
}

function mediaIndexItem(item: MediaItem): void {
	mockSearchIndex.set(mockIndexKey('media', item.id), {
		source: 'media',
		docId: item.id,
		title: item.name,
		body: item.tags.join(' '),
		path: item.relPath,
		updatedAt: item.modifiedMs,
	});
}

function mediaUnindexItem(itemId: string): void {
	mockSearchIndex.delete(mockIndexKey('media', itemId));
}

/** Registers an item (collision-suffixing its name within the folder) and indexes it. */
function mediaRegisterItem(folder: string, fileName: string, kind: MediaKind, seed?: MockMediaSeed): MediaItem {
	const ext = mediaExtOf(fileName);
	const stem = ext ? fileName.substring(0, fileName.length - ext.length - 1) : fileName;
	let candidate = fileName;
	let suffix = 2;
	const taken = new Set([...mockMediaItems.values()].map(i => i.relPath));
	while (taken.has(folder === '' ? candidate : `${folder}/${candidate}`)) {
		candidate = ext ? `${stem} ${suffix}.${ext}` : `${stem} ${suffix}`;
		suffix += 1;
	}
	const relPath = folder === '' ? candidate : `${folder}/${candidate}`;
	const now = Date.now();
	const item: MediaItem = {
		id: `med_${String(mockMediaIdSeq++).padStart(4, '0')}`,
		relPath,
		name: candidate,
		kind,
		ext,
		size: seed?.size ?? 40000 + Math.floor(Math.random() * 200000),
		addedMs: now,
		modifiedMs: now,
		width: seed?.width,
		height: seed?.height,
		durationMs: seed?.durationMs,
		tags: [...(seed?.tags ?? [])],
		pinned: seed?.pinned ?? false,
	};
	mockMediaItems.set(item.id, item);
	mediaIndexItem(item);
	return item;
}

export async function mediaGetLibrary(): Promise<MediaLibraryInfo | null> {
	return mockMediaLibrary;
}

export async function mediaInitLibrary(): Promise<MediaLibraryInfo | null> {
	if (mockMediaLibrary) return mockMediaLibrary;
	mockMediaLibrary = { basePath: '/Users/mock/Documents/Gallery/Fracta' };
	mockMediaFolders.add('nature');
	mockMediaFolders.add('nature/closeups');
	mockMediaFolders.add('shapes');
	const dayMs = 24 * 60 * 60 * 1000;
	MOCK_MEDIA_SEEDS.forEach((seed, i) => {
		mockMediaSeedPaths.add(seed.relPath);
		const item = mediaRegisterItem(mediaParentOf(seed.relPath), mediaBasename(seed.relPath),
			mediaKindForExtension(mediaExtOf(seed.relPath)) as MediaKind, seed);
		// Stagger timestamps so Recently Added and date sorts are meaningful:
		// half the seeds land inside the 7-day window, half outside.
		item.addedMs = Date.now() - i * 2 * dayMs;
		item.modifiedMs = item.addedMs;
		mediaIndexItem(item);
	});
	return mockMediaLibrary;
}

export async function mediaRelocateLibrary(): Promise<MediaLibraryInfo | null> {
	// Mock treats the relocation picker as reselecting the same folder.
	return mockMediaLibrary;
}

function buildMediaFolder(relPath: string, allFolders: Set<string>): MediaFolder {
	const children = [...allFolders]
		.filter(f => mediaParentOf(f) === relPath && f !== '')
		.sort()
		.map(f => buildMediaFolder(f, allFolders));
	let mediaCount = 0;
	for (const item of mockMediaItems.values()) {
		if (mediaParentOf(item.relPath) === relPath) mediaCount += 1;
	}
	return {
		path: relPath,
		name: relPath === '' ? mediaBasename(assertMediaLibrary().basePath) : mediaBasename(relPath),
		children,
		mediaCount,
	};
}

export async function mediaListTree(): Promise<MediaFolder> {
	assertMediaLibrary();
	const allFolders = new Set(mockMediaFolders);
	for (const item of mockMediaItems.values()) {
		let parent = mediaParentOf(item.relPath);
		while (parent !== '') {
			allFolders.add(parent);
			parent = mediaParentOf(parent);
		}
	}
	return buildMediaFolder('', allFolders);
}

const MEDIA_RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export async function mediaListItems(query: MediaQuery): Promise<MediaItem[]> {
	assertMediaLibrary();
	let items = [...mockMediaItems.values()];
	const scope = query.scope;
	if (scope.type === 'folder') {
		const folder = normalizeMediaRelPath(scope.path);
		items = items.filter(i => mediaParentOf(i.relPath) === folder);
	} else if (scope.type === 'tag') {
		items = items.filter(i => i.tags.includes(scope.tag));
	} else {
		switch (scope.section) {
			case 'all': break;
			case 'recent': items = items.filter(i => Date.now() - i.addedMs <= MEDIA_RECENT_WINDOW_MS); break;
			case 'untagged': items = items.filter(i => i.tags.length === 0); break;
			case 'pinned': items = items.filter(i => i.pinned); break;
		}
	}
	if (query.kinds && query.kinds.length > 0) {
		items = items.filter(i => query.kinds!.includes(i.kind));
	}
	const dir = query.descending ? -1 : 1;
	items.sort((a, b) => {
		switch (query.sort) {
			case 'name': return dir * a.name.localeCompare(b.name);
			case 'added': return dir * (a.addedMs - b.addedMs);
			case 'modified': return dir * (a.modifiedMs - b.modifiedMs);
			case 'size': return dir * (a.size - b.size);
			case 'kind': return dir * (a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
			default: return 0;
		}
	});
	return items.map(i => ({ ...i, tags: [...i.tags] }));
}

export async function mediaListAllTags(): Promise<MediaTag[]> {
	const counts = new Map<string, number>();
	for (const item of mockMediaItems.values()) {
		for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => a.tag.localeCompare(b.tag));
}

// copy vs move is indistinguishable in the mock — sources live outside the mock fs
export async function mediaImport(sourcePaths: string[], destFolderPath: string, _mode: MediaImportMode): Promise<string> {
	assertMediaLibrary();
	const dest = normalizeMediaRelPath(destFolderPath);
	if (!mediaFolderExists(dest)) throw new Error(`MEDIA_NO_SUCH_FOLDER:${destFolderPath}`);

	// Plan each media file to create; folder-looking sources (no extension)
	// synthesize a small batch plus one skipped non-media file.
	const planned: { name: string; kind: MediaKind }[] = [];
	let skipped = 0;
	for (const source of sourcePaths) {
		const name = mediaBasename(source.replace(/\\/g, '/'));
		const ext = mediaExtOf(name);
		if (ext === '') {
			planned.push(
				{ name: `${name}-photo-1.jpg`, kind: 'image' },
				{ name: `${name}-photo-2.png`, kind: 'image' },
				{ name: `${name}-clip.mp4`, kind: 'video' },
			);
			skipped += 1; // pretend the folder contained one non-media file
			continue;
		}
		const kind = mediaKindForExtension(ext);
		if (kind === null) { skipped += 1; continue; }
		planned.push({ name, kind });
	}

	const importId = `imp_${mockMediaImportSeq++}`;
	const total = planned.length;
	let done = 0;

	const tick = () => {
		if (mockMediaCancelledImports.has(importId)) {
			emitMediaImportProgress({ importId, done, total, skipped, currentName: '', finished: true, error: 'cancelled' });
			return;
		}
		if (done >= total) {
			emitMediaImportProgress({ importId, done, total, skipped, currentName: '', finished: true });
			return;
		}
		const next = planned[done];
		const item = mediaRegisterItem(dest, next.name, next.kind);
		done += 1;
		emitMediaImportProgress({ importId, done, total, skipped, currentName: item.name, finished: false });
		emitMediaFsEvent({ kind: 'created', relPath: item.relPath, isDirectory: false });
		setTimeout(tick, 60);
	};
	setTimeout(tick, 30);
	return importId;
}

export async function mediaCancelImport(importId: string): Promise<void> {
	mockMediaCancelledImports.add(importId);
}

export async function mediaCreateFolder(parentPath: string, name: string): Promise<void> {
	assertMediaLibrary();
	const parent = normalizeMediaRelPath(parentPath);
	if (!mediaFolderExists(parent)) throw new Error(`MEDIA_NO_SUCH_FOLDER:${parentPath}`);
	const relPath = normalizeMediaRelPath(parent === '' ? name : `${parent}/${name}`);
	if (mediaFolderExists(relPath)) throw new Error(`MEDIA_FOLDER_EXISTS:${relPath}`);
	mockMediaFolders.add(relPath);
	emitMediaFsEvent({ kind: 'created', relPath, isDirectory: true });
}

/** Shared machinery for rename + move: relocates a folder subtree or a single item. */
function mediaRelocate(fromRel: string, toRel: string): void {
	if (mockMediaFolders.has(fromRel) || [...mockMediaFolders].some(f => f.startsWith(`${fromRel}/`))) {
		// Folder: move the subtree.
		for (const folder of [...mockMediaFolders]) {
			if (folder === fromRel || folder.startsWith(`${fromRel}/`)) {
				mockMediaFolders.delete(folder);
				mockMediaFolders.add(toRel + folder.substring(fromRel.length));
			}
		}
		for (const item of mockMediaItems.values()) {
			if (item.relPath.startsWith(`${fromRel}/`)) {
				item.relPath = toRel + item.relPath.substring(fromRel.length);
				mediaIndexItem(item);
			}
		}
		emitMediaFsEvent({ kind: 'renamed', relPath: fromRel, newRelPath: toRel, isDirectory: true });
		return;
	}
	const item = [...mockMediaItems.values()].find(i => i.relPath === fromRel);
	if (!item) throw new Error(`MEDIA_NO_SUCH_ENTRY:${fromRel}`);
	item.relPath = toRel;
	item.name = mediaBasename(toRel);
	item.ext = mediaExtOf(item.name);
	item.modifiedMs = Date.now();
	mediaIndexItem(item);
	emitMediaFsEvent({ kind: 'renamed', relPath: fromRel, newRelPath: toRel, isDirectory: false });
}

export async function mediaRenameEntry(relPath: string, newName: string): Promise<string> {
	assertMediaLibrary();
	const from = normalizeMediaRelPath(relPath);
	if (from === '') throw new Error('MEDIA_CANNOT_RENAME_ROOT');
	if (newName.includes('/') || newName === '' || newName === '.' || newName === '..') {
		throw new Error(`MEDIA_INVALID_NAME:${newName}`);
	}
	const parent = mediaParentOf(from);
	const to = parent === '' ? newName : `${parent}/${newName}`;
	mediaRelocate(from, to);
	return to;
}

export async function mediaMoveEntries(relPaths: string[], destFolderPath: string): Promise<void> {
	assertMediaLibrary();
	const dest = normalizeMediaRelPath(destFolderPath);
	if (!mediaFolderExists(dest)) throw new Error(`MEDIA_NO_SUCH_FOLDER:${destFolderPath}`);
	for (const relPath of relPaths) {
		const from = normalizeMediaRelPath(relPath);
		if (from === '') throw new Error('MEDIA_CANNOT_MOVE_ROOT');
		if (dest === from || dest.startsWith(`${from}/`)) throw new Error(`MEDIA_MOVE_INTO_SELF:${relPath}`);
		const to = dest === '' ? mediaBasename(from) : `${dest}/${mediaBasename(from)}`;
		if (to !== from) mediaRelocate(from, to);
	}
}

export async function mediaTrashEntries(relPaths: string[]): Promise<void> {
	assertMediaLibrary();
	for (const relPath of relPaths) {
		const target = normalizeMediaRelPath(relPath);
		if (target === '') throw new Error('MEDIA_CANNOT_TRASH_ROOT');
		const isDirectory = mediaFolderExists(target) && ![...mockMediaItems.values()].some(i => i.relPath === target);
		for (const [id, item] of [...mockMediaItems.entries()]) {
			if (item.relPath === target || item.relPath.startsWith(`${target}/`)) {
				mockMediaItems.delete(id);
				mediaUnindexItem(id);
			}
		}
		for (const folder of [...mockMediaFolders]) {
			if (folder === target || folder.startsWith(`${target}/`)) mockMediaFolders.delete(folder);
		}
		emitMediaFsEvent({ kind: 'removed', relPath: target, isDirectory });
	}
}

export async function mediaSetTags(itemIds: string[], addTags: string[], removeTags: string[]): Promise<void> {
	for (const id of itemIds) {
		const item = mockMediaItems.get(id);
		if (!item) throw new Error(`MEDIA_NO_SUCH_ITEM:${id}`);
		const tags = new Set(item.tags);
		for (const tag of removeTags) tags.delete(tag);
		for (const tag of addTags) if (tag.trim() !== '') tags.add(tag.trim());
		item.tags = [...tags].sort();
		item.modifiedMs = Date.now();
		mediaIndexItem(item);
	}
}

export async function mediaSetPinned(itemIds: string[], pinned: boolean): Promise<void> {
	for (const id of itemIds) {
		const item = mockMediaItems.get(id);
		if (!item) throw new Error(`MEDIA_NO_SUCH_ITEM:${id}`);
		item.pinned = pinned;
	}
}

export async function mediaGetThumbnail(itemId: string, _maxEdge: number): Promise<string> {
	const item = mockMediaItems.get(itemId);
	if (!item) throw new Error(`MEDIA_NO_SUCH_ITEM:${itemId}`);
	return item.thumbnail ?? mediaAssetUrl(item.relPath);
}

export async function mediaSaveVideoThumbnail(itemId: string, jpegBase64: string): Promise<string> {
	const item = mockMediaItems.get(itemId);
	if (!item) throw new Error(`MEDIA_NO_SUCH_ITEM:${itemId}`);
	item.thumbnail = `data:image/jpeg;base64,${jpegBase64}`;
	return item.thumbnail;
}

export async function mediaSetVideoProbe(itemId: string, width: number, height: number, durationMs: number): Promise<void> {
	const item = mockMediaItems.get(itemId);
	if (!item) throw new Error(`MEDIA_NO_SUCH_ITEM:${itemId}`);
	item.width = width;
	item.height = height;
	item.durationMs = durationMs;
}

export function mediaAssetUrl(relPath: string): string {
	const normalized = normalizeMediaRelPath(relPath);
	if (mockMediaSeedPaths.has(normalized)) return `/media-fixtures/${normalized}`;
	// Imported mock items have no real file — serve a kind-matched stand-in fixture.
	const kind = mediaKindForExtension(mediaExtOf(mediaBasename(normalized)));
	if (normalized.toLowerCase().endsWith('.svg')) return `/media-fixtures/shapes/orbit.svg`;
	return `/media-fixtures/${MOCK_MEDIA_STANDIN[kind ?? 'image']}`;
}

// Contract amendment 2026-07-17: mock picker returns plausible externals — a folder
// for kind 'folder', a small mixed batch (incl. one non-media file, exercising the
// skip counter) for kind 'files'.
export async function mediaPickImportSources(kind: 'files' | 'folder'): Promise<string[] | null> {
	if (kind === 'folder') return ['/Users/mock/Downloads/holiday-photos'];
	return [
		'/Users/mock/Downloads/beach-day.jpg',
		'/Users/mock/Downloads/sunset-clip.mp4',
		'/Users/mock/Downloads/packing-list.txt',
	];
}

export function onMediaImportProgress(callback: (progress: MediaImportProgress) => void): () => void {
	mockMediaImportListeners.add(callback);
	return () => {
		mockMediaImportListeners.delete(callback);
	};
}

export function onMediaFsEvent(callback: (event: MediaFsEvent) => void): () => void {
	mockMediaFsListeners.add(callback);
	return () => {
		mockMediaFsListeners.delete(callback);
	};
}

// ── IpcApi conformance check ─────────────────────────────────────────────────────

import type { IpcApi } from './ipc';
type NativeOnly = 'onAppCloseRequested' | 'toggleWindowMaximize' | 'setActiveTemplateMenu';

const _mockApiCheck: Omit<IpcApi, NativeOnly> = {
	isTauri,
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
	selectFile,
	pathExists,
	searchWorkspaceFiles,
	listOllamaModels,
	runApiModel,
	selectSaveFile,
	selectOpenFile,
	templateIdToMenuId,
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
};
