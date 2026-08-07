import {
	listDirectory,
	readFile,
	writeFile,
	isTauri,
	selectDownloadDirectory,
	selectSaveFile,
	selectOpenFile,
	selectFile,
	runLocalModel,
	runApiModel,
	downloadModel,
	installSkill,
	cancelAiStream,
	rebuildDocsIndex,
	registerAiStreamListeners,
	onDownloadProgress,
	onDownloadDone,
	onDownloadError,
	saveApiKey,
	applyApiKeyChanges,
	restoreApiKeyRevision,
	closeAppWindow,
	openBrowserWindow,
	openProjectMemory,
	appendMessage,
	listSessions,
	loadSession,
	createCheckpoint,
	restoreCheckpoint,
	readEnvProviders,
	runEnvModel,
	pathExists,
	terminalOpen,
	terminalWrite,
	terminalResize,
	terminalClose,
	onTerminalEvent,
	type TerminalPtyEvent,
	type FileEntry,
	type SessionInfo,
	type EnvProvider,
	type TokenUsage
} from '../ipc';
import { maxContextTokensFor, type ModelGroup } from '../data/modelContextWindows';
import { AI_PROVIDER_DEFINITIONS, isAiProvider, type AiProvider } from '../data/aiProviders';
import { canvas, type Tile, type Viewport } from './canvas.svelte';
import { errorMessage } from '../errors';
import { UndoHistory } from './undoHistory.svelte';

export type { AiProvider } from '../data/aiProviders';

// Shape of a `.fractal-workspace` file written by saveWorkspaceToFile / read by
// openWorkspaceFromFile. Kept loosely optional since it's user-editable JSON on disk.
interface WorkspaceFileData {
	rootPath: string;
	openFiles?: { path: string; name: string }[];
	activeFilePath?: string | null;
	canvas?: {
		viewport?: Viewport;
		tiles?: Tile[];
		activeTemplateId?: string;
	};
}

function isWorkspaceFileData(value: unknown): value is WorkspaceFileData {
	if (!value || typeof value !== 'object') return false;
	const data = value as Record<string, unknown>;
	if (typeof data.rootPath !== 'string' || !data.rootPath.trim()) return false;
	if (data.activeFilePath !== undefined && data.activeFilePath !== null && typeof data.activeFilePath !== 'string') return false;
	if (data.openFiles !== undefined && (!Array.isArray(data.openFiles) || !data.openFiles.every(file =>
		file && typeof file === 'object'
		&& typeof (file as Record<string, unknown>).path === 'string'
		&& typeof (file as Record<string, unknown>).name === 'string'
	))) return false;
	return data.canvas === undefined || (data.canvas !== null && typeof data.canvas === 'object');
}

function isFileReference(value: unknown): value is { path: string; name: string } {
	if (!value || typeof value !== 'object') return false;
	const file = value as Record<string, unknown>;
	return typeof file.path === 'string' && !!file.path && typeof file.name === 'string' && !!file.name;
}

function isWorkspace(value: unknown): value is Workspace {
	if (!value || typeof value !== 'object') return false;
	const workspace = value as Partial<Workspace>;
	return typeof workspace.name === 'string' && !!workspace.name.trim()
		&& typeof workspace.rootPath === 'string' && !!workspace.rootPath
		&& Array.isArray(workspace.openFiles) && workspace.openFiles.every(isFileReference)
		&& (workspace.activeFilePath === null || typeof workspace.activeFilePath === 'string');
}

export interface ConsoleLog {
	id: string;
	time: string;
	type: 'info' | 'error' | 'success' | 'input' | 'warn';
	message: string;
}

export interface IdeTerminalSession {
	id: string;
	nativeId: string | null;
	title: string;
	cwd: string;
	output: string;
	starting: boolean;
	exited: boolean;
	createdAt: number;
}

export interface ActiveFile {
	path: string;
	name: string;
	content: string;
	originalContent: string;
	isDirty: boolean;
}

export interface Workspace {
	name: string;
	rootPath: string;
	openFiles: Array<{ path: string; name: string }>;
	activeFilePath: string | null;
}

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	reasoning?: string;
	timestamp: string;
	// Set when this "assistant" message is actually a surfaced backend failure
	// (bad API key, unreachable host, model crash) rather than a real reply —
	// lets the chat UI style it distinctly and skip Retry/Checkpoint actions.
	isError?: boolean;
}

export interface GgufModel {
	id: string;
	name: string;
	repo: string;
	filename: string;
	size: string;
	downloaded: boolean;
	localPath?: string;
	optimizedForM3Pro: boolean;
}

export interface LocalModelConfig {
	id: string;
	name: string;
	path: string;
	mmprojPath?: string;
}

export interface SkillEntry {
	name: string;
	description: string;
	url: string;
	installed: boolean;
}

export interface CustomModelConfig {
	id: string;
	name: string;
	// Informational only (display/bookkeeping) — nothing branches on this value, so it's kept
	// as a free-form string rather than a literal union that would drift from the provider
	// dropdown's actual labels (e.g. "Z.ai" -> "z.ai" isn't in any fixed provider-id set).
	provider: string;
	modelId: string;
	// Keychain account name. The secret itself must never be persisted with this config.
	credentialId: string;
	// Legacy-only migration field. loadSettings() immediately moves this value into the
	// keychain and removes it before the configuration is persisted again.
	apiKey?: string;
	baseUrl?: string;
	apiFormat: 'openai' | 'anthropic' | 'gemini' | 'ollama';
	isMultimodal: boolean;
	isFullUrl?: boolean;
}

export interface IDEStateSnapshot {
	rootPath: string;
	fileEntries: string;
	expandedFolders: string;
	expandedFolderPaths: string;
	openFiles: string;
	openFileBuffers: string;
	savedWorkspaces: string;
	leftSidebarCollapsed: boolean;
	rightSidebarCollapsed: boolean;
	terminalCollapsed: boolean;
	terminalLocation: 'bottom' | 'left' | 'right';
	browserCollapsed: boolean;
	leftSidebarWidth: number;
	rightSidebarWidth: number;
	terminalHeight: number;
	activeFilePath: string | null;
	activeFileContent: string | null;
	activeFileOriginalContent: string | null;
	activeLeftTab: 'files';
	activeRightTab: 'ai';
	browserUrl: string;
	browserWidth: number;
	editorFontSize: number;
	editorFontFamily: string;
	editorLineWrapping: boolean;
	aiProvider: AiProvider;
	aiBaseUrlOpenAI: string;
	aiBaseUrlAnthropic: string;
	aiBaseUrlGemini: string;
	aiBaseUrlDeepSeek: string;
	aiBaseUrlXAI: string;
	aiBaseUrlZAi: string;
	aiBaseUrlOllama: string;
	activeApiModel: string;
	customOpenAiModels: string;
	customAnthropicModels: string;
	customGeminiModels: string;
	customDeepSeekModels: string;
	customXAiModels: string;
	customZAiModels: string;
	customOllamaModels: string;
	attachedFiles: string;
	localGgufModelPath: string;
	localMmprojPath: string;
	localMlxModelPath: string;
	localModels: string;
	customModels: string;
	currentVaultName: string | null;
	currentVaultRoots: string;   // JSON-serialized VaultRoot[]
	savedVaults: string;         // JSON-serialized SavedVault[]
	credentialRevision: number;
}

function parseStoredStringArray(value: string | null, fallback: string[]): string[] {
	if (!value) return fallback;
	const parsed: unknown = JSON.parse(value);
	if (!Array.isArray(parsed) || !parsed.every(item => typeof item === 'string')) {
		throw new Error('Expected a string array');
	}
	return [...new Set(parsed.map(item => item.trim()).filter(Boolean))];
}

function isStoredCustomModel(value: unknown): value is CustomModelConfig {
	if (!value || typeof value !== 'object') return false;
	const model = value as Partial<CustomModelConfig>;
	return typeof model.id === 'string' && typeof model.name === 'string' &&
		typeof model.provider === 'string' && typeof model.modelId === 'string' &&
		typeof model.credentialId === 'string' &&
		['openai', 'anthropic', 'gemini', 'ollama'].includes(model.apiFormat ?? '') &&
		typeof model.isMultimodal === 'boolean';
}

function parseStoredCustomModels(value: string | null): CustomModelConfig[] {
	if (!value) return [];
	const parsed: unknown = JSON.parse(value);
	if (!Array.isArray(parsed) || !parsed.every(isStoredCustomModel)) {
		throw new Error('Expected valid custom model records');
	}
	return parsed.map(model => ({ ...model }));
}

function parseStoredLocalModels(value: string | null): LocalModelConfig[] {
	if (!value) return [];
	const parsed: unknown = JSON.parse(value);
	if (!Array.isArray(parsed) || !parsed.every(model => model && typeof model === 'object'
		&& typeof (model as LocalModelConfig).id === 'string'
		&& typeof (model as LocalModelConfig).name === 'string'
		&& typeof (model as LocalModelConfig).path === 'string')) {
		throw new Error('Expected valid local model records');
	}
	return parsed.map(model => ({ ...(model as LocalModelConfig) }));
}

function storedHttpUrl(value: string | null, fallback: string): string {
	if (!value) return fallback;
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:' ? value : fallback;
	} catch {
		return fallback;
	}
}

export const MODEL_REGISTRY_STORAGE_KEY = 'ide:settings:model-registry@v2';
const USER_MODEL_PROVIDER_IDS = ['openai', 'anthropic', 'gemini', 'deepseek', 'xai', 'zai', 'ollama'] as const;
type UserModelProviderId = typeof USER_MODEL_PROVIDER_IDS[number];

export interface StoredModelRegistry {
	version: 2;
	activeModel: { providerId: AiProvider; id: string } | null;
	baseUrls: Partial<Record<UserModelProviderId, string>>;
	userModels: Partial<Record<UserModelProviderId, string[]>>;
	customModels: CustomModelConfig[];
	localModels: LocalModelConfig[];
	localGgufModelPath: string;
	localMmprojPath: string;
	localMlxModelPath: string;
	recommendedLocalPaths: Record<string, string>;
}

function isStoredModelRegistry(value: unknown): value is StoredModelRegistry {
	if (!value || typeof value !== 'object') return false;
	const registry = value as Partial<StoredModelRegistry>;
	if (registry.version !== 2 || !registry.baseUrls || !registry.userModels || !Array.isArray(registry.customModels)
		|| !Array.isArray(registry.localModels) || !registry.recommendedLocalPaths) return false;
	if (registry.activeModel !== null && (!registry.activeModel || !isAiProvider(registry.activeModel.providerId)
		|| typeof registry.activeModel.id !== 'string')) return false;
	return registry.customModels.every(isStoredCustomModel) && registry.localModels.every(model => model
		&& typeof model.id === 'string' && typeof model.name === 'string' && typeof model.path === 'string');
}

export function readStoredModelRegistry(storage: Pick<Storage, 'getItem'>): StoredModelRegistry | null {
	const raw = storage.getItem(MODEL_REGISTRY_STORAGE_KEY);
	if (!raw) return null;
	const parsed: unknown = JSON.parse(raw);
	if (!isStoredModelRegistry(parsed)) throw new Error('Expected a valid model registry');
	return parsed;
}

export interface VaultBridge {
	capture(): { currentVaultName: string | null; currentVaultRoots: string; savedVaults: string };
	restore(fields: { currentVaultName: string | null; currentVaultRoots: string; savedVaults: string }): void;
	loadSavedVaults(): void;
	restoreCurrentVault(): Promise<void>;
}

class IDEState {
	private vaultBridge: VaultBridge | null = null;
	credentialRevision = $state(0);
	private credentialRestoreQueue: Promise<void> = Promise.resolve();
	// --- Layout States ---
	leftSidebarCollapsed = $state(false);
	rightSidebarCollapsed = $state(false);
	terminalCollapsed = $state(true);
	terminalLocation = $state<'bottom' | 'left' | 'right'>('bottom');
	browserCollapsed = $state(true);
	
	activeLeftTab = $state<'files'>('files');
	activeRightTab = $state<'ai'>('ai');
	
	// Draggable sizes (in pixels)
	leftSidebarWidth = $state(260);
	rightSidebarWidth = $state(400);
	terminalHeight = $state(240);

	// --- In-App Browser States (legacy standalone window; vault lives in modules/browser) ---
	browserWidth = $state(650);
	browserUrl = $state('https://www.google.com');

	// --- Command Palette & Settings States ---
	showSettings = $state(false);
	showCommandPalette = $state(false);
	showSearchOverlay = $state(false);
	dockOpen = $state(false);
	
	// --- General Editor Settings ---
	editorFontSize = $state(16);
	editorFontFamily = $state("'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace");
	editorLineWrapping = $state(true);

	// --- AI Providers States ---
	aiProvider = $state<AiProvider>('env');
	aiBaseUrlOpenAI = $state('');
	aiBaseUrlAnthropic = $state('');
	aiBaseUrlGemini = $state('');
	aiBaseUrlDeepSeek = $state('');
	aiBaseUrlXAI = $state('');
	aiBaseUrlZAi = $state('');
	aiBaseUrlOllama = $state('http://localhost:11434');
	activeApiModel = $state('');
	customOpenAiModels = $state<string[]>([]);
	customAnthropicModels = $state<string[]>([]);
	customGeminiModels = $state<string[]>([]);
	customDeepSeekModels = $state<string[]>([]);
	customXAiModels = $state<string[]>([]);
	customZAiModels = $state<string[]>([]);
	customOllamaModels = $state<string[]>([]);
	customModels = $state<CustomModelConfig[]>([]);
	
	// --- Local Models Selected Files Paths ---
	localGgufModelPath = $state('');
	localMmprojPath = $state('');
	localMlxModelPath = $state('');
	localModels = $state<LocalModelConfig[]>([]);

	// --- File Attachments States ---
	attachedFiles = $state<Array<{ path: string; name: string; content?: string }>>([]);

	// --- AI & Copilot States ---
	chatMessages = $state<ChatMessage[]>([]);
	selectedModelId = $state('');
	isAiStreaming = $state(false);
	streamingText = $state('');
	streamingReasoning = $state('');

	// --- ADR-011 Phase 1: per-project memory / sessions ---
	currentSessionId = $state<string | null>(null);
	sessions = $state<SessionInfo[]>([]);
	envProviders = $state<EnvProvider[]>([]);
	lastUsage = $state<TokenUsage | null>(null);
	
	// --- Marketplace & Downloads States ---
	localModelsDownloadDir = $state('');
	downloadingModelId = $state<string | null>(null);
	downloadProgress = $state(0);

	// --- File System States ---
	rootPath = $state(isTauri() ? '' : '/workspace');
	fileEntries = $state<FileEntry[]>([]);
	// Tree expansion state — which folder paths are expanded, and cached children for each
	expandedFolders = $state<string[]>([]);
	expandedFolderPaths = $state<Record<string, FileEntry[]>>({});
	activeFile = $state<ActiveFile | null>(null);
	openFiles = $state<Array<{ path: string; name: string }>>([]);
	isWorkspaceInitializing = $state(false);
	// Buffers unsaved edits per open tab. openFile() used to unconditionally re-read from
	// disk on every switch, which silently discarded any unsaved edit to the file being
	// switched to (or back to) — this cache is checked first so a tab's in-memory content
	// survives switching away and back, same as any other editor.
	private openFileBuffers = new Map<string, { content: string; originalContent: string; isDirty: boolean }>();
	private openFileRequestId = 0;
	private directoryRequestId = 0;
	private projectContextRequestId = 0;
	private chatSessionRequestId = 0;
	private aiTurnRequestId = 0;
	private aiFirstByteTimeout: ReturnType<typeof setTimeout> | null = null;
	private workspaceInitialized = false;
	private aiListenersInitialized = false;

	registerVaultBridge(bridge: VaultBridge): void {
		this.vaultBridge = bridge;
	}

	// --- Tree Selection & Clipboard States ---
	selectedFiles = $state<Set<string>>(new Set());
	clipboardFiles = $state<{ action: 'cut' | 'copy'; paths: string[] } | null>(null);
	filesPendingPaste = $state<string[] | null>(null);

	// --- Terminal States ---
	consoleLogs = $state<ConsoleLog[]>([]);
	terminalInput = $state('');
	terminalSessions = $state<IdeTerminalSession[]>([]);
	activeTerminalId = $state<string | null>(null);
	private terminalUnlisten: (() => void) | null = null;
	private terminalOpenPromises = new Map<string, Promise<string | null>>();
	private pendingTerminalInput = new Map<string, string[]>();
	private terminalGeneration = 0;
	private terminalSequence = 0;

	// --- Workspace States ---
	savedWorkspaces = $state<Workspace[]>([]);

	// --- Undo/Redo ---
	private history = new UndoHistory<string>({
		capture: () => JSON.stringify(this.takeSnapshot()),
		restore: (snapshot) => this.restoreSnapshot(JSON.parse(snapshot)),
		capacity: 50,
		equals: (a, b) => a === b,
	});

	recommendedModels = $state<GgufModel[]>([
		{
			id: 'qwen-2.5-7b',
			name: 'Qwen 2.5 Coder 7B Instruct',
			repo: 'Qwen/Qwen2.5-Coder-7B-Instruct-GGUF',
			filename: 'qwen2.5-coder-7b-instruct-q4_k_m.gguf',
			size: '4.7 GB',
			downloaded: false,
			optimizedForM3Pro: true
		},
		{
			id: 'llama-3-8b',
			name: 'Llama 3 8B Instruct',
			repo: 'QuantFactory/Meta-Llama-3-8B-Instruct-GGUF',
			filename: 'Meta-Llama-3-8B-Instruct.Q4_K_M.gguf',
			size: '4.8 GB',
			downloaded: false,
			optimizedForM3Pro: true
		},
		{
			id: 'gemma-2-9b',
			name: 'Gemma 2 9B It',
			repo: 'lmstudio-community/gemma-2-9b-it-GGUF',
			filename: 'gemma-2-9b-it-Q4_K_M.gguf',
			size: '5.5 GB',
			downloaded: false,
			optimizedForM3Pro: true
		},
		{
			id: 'deepseek-1.5b',
			name: 'DeepSeek Coder 1.5B Instruct',
			repo: 'QuantFactory/deepseek-coder-1.5b-instruct-GGUF',
			filename: 'deepseek-coder-1.5b-instruct.Q8_0.gguf',
			size: '1.6 GB',
			downloaded: false,
			optimizedForM3Pro: true
		}
	]);

	constructor() {
		// Initialize terminal with system greeting
		this.addLog('FractalEngine Shell v0.2.0 initialized.', 'success');
		if (!isTauri()) {
			this.addLog('Running in BROWSER mode. Using virtual in-memory filesystem.', 'info');
		} else {
			this.addLog('Running in TAURI mode. Local system access enabled.', 'success');
		}
		this.addLog('Type "help" to see available commands.', 'info');
	}

	// --- Helper: Generate State Snapshot for Undo/Redo ---
	private takeSnapshot(): IDEStateSnapshot {
		return {
			rootPath: this.rootPath,
			fileEntries: JSON.stringify(this.fileEntries),
			expandedFolders: JSON.stringify(this.expandedFolders),
			expandedFolderPaths: JSON.stringify(this.expandedFolderPaths),
			openFiles: JSON.stringify(this.openFiles),
			openFileBuffers: JSON.stringify([...this.openFileBuffers.entries()]),
			savedWorkspaces: JSON.stringify(this.savedWorkspaces),
			leftSidebarCollapsed: this.leftSidebarCollapsed,
			rightSidebarCollapsed: this.rightSidebarCollapsed,
			terminalCollapsed: this.terminalCollapsed,
			terminalLocation: this.terminalLocation,
			browserCollapsed: this.browserCollapsed,
			leftSidebarWidth: this.leftSidebarWidth,
			rightSidebarWidth: this.rightSidebarWidth,
			terminalHeight: this.terminalHeight,
			activeFilePath: this.activeFile?.path ?? null,
			activeFileContent: this.activeFile?.content ?? null,
			activeFileOriginalContent: this.activeFile?.originalContent ?? null,
			activeLeftTab: this.activeLeftTab,
			activeRightTab: this.activeRightTab,
			browserUrl: this.browserUrl,
			browserWidth: this.browserWidth,
			editorFontSize: this.editorFontSize,
			editorFontFamily: this.editorFontFamily,
			editorLineWrapping: this.editorLineWrapping,
			aiProvider: this.aiProvider,
			aiBaseUrlOpenAI: this.aiBaseUrlOpenAI,
			aiBaseUrlAnthropic: this.aiBaseUrlAnthropic,
			aiBaseUrlGemini: this.aiBaseUrlGemini,
			aiBaseUrlDeepSeek: this.aiBaseUrlDeepSeek,
			aiBaseUrlXAI: this.aiBaseUrlXAI,
			aiBaseUrlZAi: this.aiBaseUrlZAi,
			aiBaseUrlOllama: this.aiBaseUrlOllama,
			activeApiModel: this.activeApiModel,
			customOpenAiModels: JSON.stringify(this.customOpenAiModels),
			customAnthropicModels: JSON.stringify(this.customAnthropicModels),
			customGeminiModels: JSON.stringify(this.customGeminiModels),
			customDeepSeekModels: JSON.stringify(this.customDeepSeekModels),
			customXAiModels: JSON.stringify(this.customXAiModels),
			customZAiModels: JSON.stringify(this.customZAiModels),
			customOllamaModels: JSON.stringify(this.customOllamaModels),
			attachedFiles: JSON.stringify(this.attachedFiles),
			localGgufModelPath: this.localGgufModelPath,
			localMmprojPath: this.localMmprojPath,
			localMlxModelPath: this.localMlxModelPath,
			localModels: JSON.stringify(this.localModels),
			customModels: JSON.stringify(this.customModels.map(({ apiKey: _apiKey, ...config }) => config)),
			...(this.vaultBridge?.capture() ?? {
				currentVaultName: null,
				currentVaultRoots: '[]',
				savedVaults: '[]'
			}),
			credentialRevision: this.credentialRevision
		};
	}

	// --- Helper: Restore State Snapshot ---
	private restoreSnapshot(snapshot: IDEStateSnapshot) {
		const previousRootPath = this.rootPath;
		const restoredRootPath = snapshot.rootPath ?? previousRootPath;
		const rootChanged = restoredRootPath !== previousRootPath;
		if (rootChanged) {
			this.stopAiStreaming();
			this.directoryRequestId += 1;
			this.projectContextRequestId += 1;
			this.newChatSession();
			this.sessions = [];
			this.envProviders = [];
			this.selectedFiles = new Set();
			this.clipboardFiles = null;
			this.filesPendingPaste = null;
		}
		this.openFileRequestId += 1;
		this.rootPath = restoredRootPath;
		try { this.fileEntries = JSON.parse(snapshot.fileEntries || '[]'); } catch { this.fileEntries = []; }
		try { this.expandedFolders = JSON.parse(snapshot.expandedFolders || '[]'); } catch { this.expandedFolders = []; }
		try { this.expandedFolderPaths = JSON.parse(snapshot.expandedFolderPaths || '{}'); } catch { this.expandedFolderPaths = {}; }
		try { this.openFiles = JSON.parse(snapshot.openFiles || '[]'); } catch { this.openFiles = []; }
		try {
			this.openFileBuffers = new Map(JSON.parse(snapshot.openFileBuffers || '[]'));
		} catch {
			this.openFileBuffers = new Map();
		}
		try { this.savedWorkspaces = JSON.parse(snapshot.savedWorkspaces || '[]'); } catch { this.savedWorkspaces = []; }
		if (typeof localStorage !== 'undefined') localStorage.setItem('ide:workspaces', JSON.stringify(this.savedWorkspaces));
		if (snapshot.credentialRevision !== undefined && snapshot.credentialRevision !== this.credentialRevision) {
			this.credentialRevision = snapshot.credentialRevision;
			const revision = snapshot.credentialRevision;
			this.credentialRestoreQueue = this.credentialRestoreQueue
				.catch(() => undefined)
				.then(() => restoreApiKeyRevision(revision))
				.catch(error => {
					this.addLog(`Failed to restore credential history: ${errorMessage(error)}`, 'error');
				});
		}
		this.leftSidebarCollapsed = snapshot.leftSidebarCollapsed ?? false;
		this.rightSidebarCollapsed = snapshot.rightSidebarCollapsed ?? false;
		this.terminalCollapsed = snapshot.terminalCollapsed ?? true;
		this.terminalLocation = snapshot.terminalLocation ?? 'bottom';
		this.browserCollapsed = snapshot.browserCollapsed ?? true;
		this.leftSidebarWidth = snapshot.leftSidebarWidth;
		this.rightSidebarWidth = snapshot.rightSidebarWidth;
		this.terminalHeight = snapshot.terminalHeight;
		this.activeLeftTab = snapshot.activeLeftTab || 'files';
		this.activeRightTab = snapshot.activeRightTab || 'ai';

		this.browserUrl = snapshot.browserUrl ?? 'https://www.google.com';
		this.browserWidth = snapshot.browserWidth ?? 650;

		this.editorFontSize = snapshot.editorFontSize ?? 16;
		this.editorFontFamily = snapshot.editorFontFamily ?? "'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace";
		this.editorLineWrapping = snapshot.editorLineWrapping ?? true;
		this.aiProvider = snapshot.aiProvider ?? 'sidecar';
		this.aiBaseUrlOpenAI = snapshot.aiBaseUrlOpenAI ?? '';
		this.aiBaseUrlAnthropic = snapshot.aiBaseUrlAnthropic ?? '';
		this.aiBaseUrlGemini = snapshot.aiBaseUrlGemini ?? '';
		this.aiBaseUrlDeepSeek = snapshot.aiBaseUrlDeepSeek ?? '';
		this.aiBaseUrlXAI = snapshot.aiBaseUrlXAI ?? '';
		this.aiBaseUrlZAi = snapshot.aiBaseUrlZAi ?? '';
		this.aiBaseUrlOllama = snapshot.aiBaseUrlOllama ?? 'http://localhost:11434';
		this.activeApiModel = snapshot.activeApiModel ?? '';

		try { this.customOpenAiModels = parseStoredStringArray(snapshot.customOpenAiModels, []); } catch (error) { this.addLog(`Could not restore OpenAI models: ${errorMessage(error)}`, 'error'); }
		try { this.customAnthropicModels = parseStoredStringArray(snapshot.customAnthropicModels, []); } catch (error) { this.addLog(`Could not restore Anthropic models: ${errorMessage(error)}`, 'error'); }
		try { this.customGeminiModels = parseStoredStringArray(snapshot.customGeminiModels, []); } catch (error) { this.addLog(`Could not restore Gemini models: ${errorMessage(error)}`, 'error'); }
		try { this.customDeepSeekModels = parseStoredStringArray(snapshot.customDeepSeekModels, []); } catch (error) { this.addLog(`Could not restore DeepSeek models: ${errorMessage(error)}`, 'error'); }
		try { this.customXAiModels = parseStoredStringArray(snapshot.customXAiModels, []); } catch (error) { this.addLog(`Could not restore xAI models: ${errorMessage(error)}`, 'error'); }
		try { this.customZAiModels = parseStoredStringArray(snapshot.customZAiModels, []); } catch (error) { this.addLog(`Could not restore Z.ai models: ${errorMessage(error)}`, 'error'); }
		try { this.customOllamaModels = parseStoredStringArray(snapshot.customOllamaModels, []); } catch (error) { this.addLog(`Could not restore Ollama models: ${errorMessage(error)}`, 'error'); }
		try { this.attachedFiles = JSON.parse(snapshot.attachedFiles || '[]'); } catch (error) { this.attachedFiles = []; this.addLog(`Could not restore attachments: ${errorMessage(error)}`, 'error'); }
		this.localGgufModelPath = snapshot.localGgufModelPath ?? '';
		this.localMmprojPath = snapshot.localMmprojPath ?? '';
		this.localMlxModelPath = snapshot.localMlxModelPath ?? '';
		try { this.localModels = parseStoredLocalModels(snapshot.localModels); } catch (error) { this.localModels = []; this.addLog(`Could not restore local models: ${errorMessage(error)}`, 'error'); }
		try { this.customModels = parseStoredCustomModels(snapshot.customModels); } catch (error) { this.customModels = []; this.addLog(`Could not restore custom models: ${errorMessage(error)}`, 'error'); }

		this.vaultBridge?.restore({
			currentVaultName: snapshot.currentVaultName ?? null,
			currentVaultRoots: snapshot.currentVaultRoots || '[]',
			savedVaults: snapshot.savedVaults || '[]'
		});

		if (snapshot.activeFilePath && snapshot.activeFileContent !== null) {
			const path = snapshot.activeFilePath;
			const name = path.split('/').pop() || '';
			const originalContent = snapshot.activeFileOriginalContent ?? snapshot.activeFileContent;
			if (!this.openFiles.some((file) => file.path === path)) {
				this.openFiles = [...this.openFiles, { path, name }];
			}
			this.activeFile = {
				path,
				name,
				content: snapshot.activeFileContent,
				originalContent,
				isDirty: snapshot.activeFileContent !== originalContent
			};
			this.openFileBuffers.set(path, {
				content: snapshot.activeFileContent,
				originalContent,
				isDirty: snapshot.activeFileContent !== originalContent
			});
		} else {
			this.activeFile = null;
		}
		this.persistWorkspaceContext();
		if (rootChanged) void this.initProjectMemory(restoredRootPath);
	}

	public pushUndo() { this.history.push(); }

	public captureSnapshot(): IDEStateSnapshot {
		return this.takeSnapshot();
	}

	public rollbackToSnapshot(snapshot: IDEStateSnapshot): void {
		this.restoreSnapshot(snapshot);
		this.history.clear();
		this.saveSettings(false);
	}

	public undo() {
		if (!this.history.canUndo) {
			this.addLog('Nothing to undo.', 'error');
			return;
		}

		this.history.undo();
		this.saveSettings(false);
		
		this.addLog('Undone last action.', 'info');
	}

	public redo() {
		if (!this.history.canRedo) {
			this.addLog('Nothing to redo.', 'error');
			return;
		}

		this.history.redo();
		this.saveSettings(false);

		this.addLog('Redone action.', 'info');
	}

	// --- Layout actions ---
	toggleLeftSidebar() {
		this.pushUndo();
		this.leftSidebarCollapsed = !this.leftSidebarCollapsed;
	}

	toggleRightSidebar() {
		this.pushUndo();
		this.rightSidebarCollapsed = !this.rightSidebarCollapsed;
	}

	toggleTerminal() {
		this.pushUndo();
		this.terminalCollapsed = !this.terminalCollapsed;
	}

	toggleBrowser() {
		this.pushUndo();
		this.browserCollapsed = !this.browserCollapsed;
	}

	setTerminalLocation(loc: 'bottom' | 'left' | 'right') {
		this.pushUndo();
		this.terminalLocation = loc;
	}

	// --- File Actions ---
	async initWorkspace() {
		if (this.workspaceInitialized || this.isWorkspaceInitializing) return;
		this.isWorkspaceInitializing = true;
		this.loadSettings();
		await this.migrateLegacyApiKeys();
		await this.migrateCustomModelCredentials();
		this.loadSavedWorkspaces();
		this.vaultBridge?.loadSavedVaults();

		await this.loadModelsCache();
		await this.initAiListeners();
		this.initDocsIndexWatcher();
		// Password vault is now lazy-loaded by modules/browser/state/vault on first browser use.
		// Restore the last open workspace vault (if any).
		await this.vaultBridge?.restoreCurrentVault();
		try {
			const ctx = this.restoreWorkspaceContext();
			if (ctx && ctx.rootPath && ctx.rootPath !== '/' && ctx.rootPath !== '') {
				// Restore last session's workspace context
				await this.loadDirectory(ctx.rootPath);
				this.openFiles = ctx.openFiles.map(f => ({ path: f.path, name: f.name }));
				if (ctx.activeFilePath) {
					const active = ctx.openFiles.find(f => f.path === ctx.activeFilePath);
					if (active) {
						await this.openFile(active.path, active.name, { recordHistory: false });
					}
				}
			} else {
				if (isTauri()) {
					this.rootPath = '/';
				}
				await this.loadDirectory(this.rootPath);
				const readme = this.fileEntries.find(e => e.name.toLowerCase() === 'readme.md');
				if (readme) {
					await this.openFile(readme.path, readme.name, { recordHistory: false });
				}
			}
		} catch (error: unknown) {
			this.addLog(`Failed to initialize workspace: ${errorMessage(error)}`, 'error');
		} finally {
			this.isWorkspaceInitializing = false;
		}

		// Only safe to load the canvas layout now that rootPath
		// is finally settled — canvas.loadLayout() reads from <rootPath>/canvas_layout.json in
		// Tauri, and rootPath was still '' a moment ago. This used to be called from
		// Canvas.svelte's onMount instead, racing ahead of
		// this function and silently falling back to a stale generic localStorage key instead
		// of the per-project file, which is why the last-used template (e.g. Notes) never stuck
		// across reloads and it kept landing back on whatever that stale fallback held.
		await canvas.loadLayout();
		this.workspaceInitialized = true;
	}

	async loadDirectory(path: string) {
		const requestId = ++this.directoryRequestId;
		try {
			const entries = await listDirectory(path);
			if (requestId !== this.directoryRequestId) return;
			const rootChanged = path !== this.rootPath;
			if (rootChanged) {
				this.stopAiStreaming();
				this.closeAllTerminalSessions();
				this.newChatSession();
				this.sessions = [];
				this.envProviders = [];
				this.attachedFiles = [];
				this.selectedFiles = new Set();
				this.clipboardFiles = null;
				this.filesPendingPaste = null;
			}
			this.fileEntries = entries;
			this.rootPath = path;
			// Reset tree expansion when loading a new root
			this.expandedFolders = [];
			this.expandedFolderPaths = {};
			this.persistWorkspaceContext();
			// ADR-011: open this project's memory DB and ingest its .env providers.
			void this.initProjectMemory(path);
			this.addLog(`Loaded folder: ${path}`, 'success');
		} catch (error: unknown) {
			if (requestId !== this.directoryRequestId) return;
			this.addLog(`Failed to read folder "${path}": ${errorMessage(error)}`, 'error');
			throw error;
		}
	}

	async toggleFolderExpanded(path: string) {
		if (this.expandedFolders.includes(path)) {
			// Collapse
			this.expandedFolders = this.expandedFolders.filter(p => p !== path);
		} else {
			const rootPath = this.rootPath;
			// Load children if not yet cached
			if (!this.expandedFolderPaths[path]) {
				const children = await listDirectory(path);
				// A folder read may finish after the user opens another workspace. Never
				// merge the old workspace's tree state into the new one.
				if (rootPath !== this.rootPath) return;
				this.expandedFolderPaths = { ...this.expandedFolderPaths, [path]: children };
			}
			// A rapid second click may have collapsed the row while the read was in
			// flight. Avoid duplicate entries and respect that newer interaction.
			if (!this.expandedFolders.includes(path)) {
				this.expandedFolders = [...this.expandedFolders, path];
			}
		}
	}

	async refreshExplorerFolder(path: string) {
		const rootPath = this.rootPath;
		if (!rootPath) return;
		try {
			const entries = await listDirectory(path);
			if (rootPath !== this.rootPath) return;
			if (path === rootPath) this.fileEntries = entries;
			else this.expandedFolderPaths = { ...this.expandedFolderPaths, [path]: entries };
		} catch (error) {
			if (rootPath === this.rootPath) {
				this.addLog(`Failed to refresh folder "${path}": ${errorMessage(error)}`, 'error');
			}
		}
	}

	reconcileRenamedPath(oldPath: string, newPath: string) {
		this.openFileRequestId += 1;
		const remap = (path: string) => path === oldPath
			? newPath
			: path.startsWith(oldPath + '/') ? newPath + path.slice(oldPath.length) : path;
		const remapEntry = (entry: FileEntry): FileEntry => {
			const path = remap(entry.path);
			return path === entry.path ? entry : { ...entry, path, name: path.split('/').pop() || entry.name };
		};

		this.openFiles = this.openFiles.map(file => {
			const path = remap(file.path);
			return path === file.path ? file : { path, name: path.split('/').pop() || file.name };
		});
		const remappedBuffers = new Map<string, { content: string; originalContent: string; isDirty: boolean }>();
		for (const [path, buffer] of this.openFileBuffers) remappedBuffers.set(remap(path), buffer);
		this.openFileBuffers = remappedBuffers;
		if (this.activeFile) {
			const path = remap(this.activeFile.path);
			if (path !== this.activeFile.path) this.activeFile = { ...this.activeFile, path, name: path.split('/').pop() || this.activeFile.name };
		}
		this.selectedFiles = new Set([...this.selectedFiles].map(remap));
		this.expandedFolders = this.expandedFolders.map(remap);
		this.expandedFolderPaths = Object.fromEntries(
			Object.entries(this.expandedFolderPaths).map(([path, entries]) => [remap(path), entries.map(remapEntry)])
		);
		if (this.clipboardFiles) this.clipboardFiles = { ...this.clipboardFiles, paths: this.clipboardFiles.paths.map(remap) };
		this.attachedFiles = this.attachedFiles.map(file => {
			const path = remap(file.path);
			return path === file.path ? file : { ...file, path, name: path.split('/').pop() || file.name };
		});
		this.persistWorkspaceContext();
	}

	reconcileDeletedPaths(paths: string[]) {
		this.openFileRequestId += 1;
		const removed = (path: string) => paths.some(candidate => path === candidate || path.startsWith(candidate + '/'));
		this.openFiles = this.openFiles.filter(file => !removed(file.path));
		for (const path of [...this.openFileBuffers.keys()]) if (removed(path)) this.openFileBuffers.delete(path);
		if (this.activeFile && removed(this.activeFile.path)) {
			const fallback = this.openFiles.at(-1);
			const buffer = fallback ? this.openFileBuffers.get(fallback.path) : undefined;
			this.activeFile = fallback && buffer
				? { ...fallback, content: buffer.content, originalContent: buffer.originalContent, isDirty: buffer.isDirty }
				: null;
		}
		this.selectedFiles = new Set([...this.selectedFiles].filter(path => !removed(path)));
		this.expandedFolders = this.expandedFolders.filter(path => !removed(path));
		this.expandedFolderPaths = Object.fromEntries(
			Object.entries(this.expandedFolderPaths)
				.filter(([path]) => !removed(path))
				.map(([path, entries]) => [path, entries.filter(entry => !removed(entry.path))])
		);
		if (this.clipboardFiles) {
			const remaining = this.clipboardFiles.paths.filter(path => !removed(path));
			this.clipboardFiles = remaining.length ? { ...this.clipboardFiles, paths: remaining } : null;
		}
		this.attachedFiles = this.attachedFiles.filter(file => !removed(file.path));
		this.persistWorkspaceContext();
	}

	async selectAndLoadDirectory() {
		let before: IDEStateSnapshot | null = null;
		try {
			const path = await selectDownloadDirectory();
			if (path) {
				before = this.captureSnapshot();
				this.pushUndo();
				await this.loadDirectory(path);
			}
		} catch (error: unknown) {
			if (before) this.rollbackToSnapshot(before);
			this.addLog(`Failed to select folder: ${errorMessage(error)}`, 'error');
		}
	}

	async saveWorkspaceToFile() {
		try {
			const { appState } = await import('./app.svelte');
			const defaultName = this.rootPath !== '/' && this.rootPath !== ''
				? `${this.rootPath.split('/').pop() || 'workspace'}.fractal-workspace`
				: 'workspace.fractal-workspace';
				
			const path = await selectSaveFile("Save Workspace File", defaultName, "fractal-workspace");
			if (path) {
				const workspaceData = {
					rootPath: this.rootPath,
					openFiles: this.openFiles.map(f => ({ path: f.path, name: f.name })),
					activeFilePath: this.activeFile?.path || null,
					canvas: {
						viewport: {
							x: canvas.viewport.x,
							y: canvas.viewport.y,
							zoom: canvas.viewport.zoom
						},
						tiles: canvas.tiles.map(t => ({
							id: t.id,
							kind: t.kind,
							x: t.x,
							y: t.y,
							w: t.w,
							h: t.h,
							z: t.z,
							props: t.props || {},
							minimized: t.minimized || false
						})),
						activeTemplateId: appState.activeTemplateId
					}
				};
				
				await writeFile(path, JSON.stringify(workspaceData, null, 2));
				this.addLog(`Workspace saved to file: ${path.split('/').pop()}`, 'success');
			}
		} catch (error: unknown) {
			this.addLog(`Failed to save workspace file: ${errorMessage(error)}`, 'error');
		}
	}

	async openWorkspaceFromFile() {
		let before: IDEStateSnapshot | null = null;
		try {
			const { appState } = await import('./app.svelte');
			const path = await selectOpenFile("Open Workspace File", "fractal-workspace");
			if (path) {
				const content = await readFile(path);
				const parsed: unknown = JSON.parse(content);

				if (!isWorkspaceFileData(parsed)) {
					throw new Error("Invalid workspace file structure");
				}
				const data = parsed;
				if (data.canvas && !canvas.isPersistedLayout(data.canvas)) {
					throw new Error('Invalid canvas data in workspace file');
				}
				if (!this.confirmDiscardDirtyFiles('Loading this workspace will discard unsaved code changes. Continue?')) return;
				
				before = this.captureSnapshot();
				this.pushUndo();
				
				// Load directory
				await this.loadDirectory(data.rootPath);
				
				// Open files
				this.openFiles = [];
				this.openFileBuffers = new Map();
				if (Array.isArray(data.openFiles)) {
					for (const file of data.openFiles) {
						this.openFiles.push({ path: file.path, name: file.name });
					}
				}
				
				// Set active file
				if (data.activeFilePath) {
					const activeObj = data.openFiles?.find((f) => f.path === data.activeFilePath);
					if (!(await this.openFile(data.activeFilePath, activeObj?.name || data.activeFilePath.split('/').pop() || '', { recordHistory: false }))) {
						throw new Error('Could not open the workspace active file.');
					}
				} else {
					this.activeFile = null;
				}
				
				// Set canvas
				if (data.canvas) {
					canvas.restorePersistedLayout(data.canvas);
					if (data.canvas.activeTemplateId !== undefined) {
						appState.restoreFromLegacyTemplateId(data.canvas.activeTemplateId);
					}
					appState.closeTemplateGallery();
				}
				
				this.addLog(`Loaded workspace from file: ${path.split('/').pop()}`, 'success');
			}
		} catch (error: unknown) {
			if (before) this.rollbackToSnapshot(before);
			this.addLog(`Failed to load workspace file: ${errorMessage(error)}`, 'error');
		}
	}

	async addFolderToWorkspace() {
		try {
			const path = await selectDownloadDirectory();
			if (path) {
				const folderName = path.split('/').pop() || path;
				const entries = await listDirectory(path);
				const mapped = entries.map(e => ({
					...e,
					name: `[${folderName}] ${e.name}`
				}));
				this.pushUndo();
				this.fileEntries = [...this.fileEntries, ...mapped];
				this.addLog(`Added folder "${folderName}" to the current workspace.`, 'success');
			}
		} catch (error: unknown) {
			this.addLog(`Failed to add folder: ${errorMessage(error)}`, 'error');
		}
	}

	async closeWindow() {
		try {
			await closeAppWindow();
		} catch (error: unknown) {
			this.addLog(`Failed to close window: ${errorMessage(error)}`, 'error');
		}
	}

	get hasDirtyFiles(): boolean {
		return Boolean(this.activeFile?.isDirty) || Array.from(this.openFileBuffers.values()).some(buffer => buffer.isDirty);
	}

	confirmDiscardDirtyFiles(message = 'You have unsaved file changes. Discard them?'): boolean {
		return !this.hasDirtyFiles || (typeof window !== 'undefined' && window.confirm(message));
	}

	async openFile(path: string, name: string, options: { recordHistory?: boolean } = {}): Promise<boolean> {
		const requestId = ++this.openFileRequestId;
		try {
			const buffered = this.openFileBuffers.get(path);
			const content = buffered ? null : await readFile(path);
			if (requestId !== this.openFileRequestId) return false;
			if (options.recordHistory ?? true) this.pushUndo();
			if (!this.openFiles.some(file => file.path === path)) this.openFiles.push({ path, name });
			this.activeFile = buffered
				? { path, name, ...buffered }
				: { path, name, content: content!, originalContent: content!, isDirty: false };
			this.persistWorkspaceContext();
			this.addLog(`Opened file: ${name}`, 'info');
			return true;
		} catch (error: unknown) {
			if (requestId !== this.openFileRequestId) return false;
			this.addLog(`Failed to read file "${name}": ${errorMessage(error)}`, 'error');
			return false;
		}
	}

	async browseAndOpenFile() {
		try {
			const filePath = await selectFile();
			if (filePath) {
				const fileName = filePath.split('/').pop() || filePath;
				await this.openFile(filePath, fileName);
			}
		} catch (e: unknown) {
			this.addLog(`Failed to open file: ${errorMessage(e)}`, 'error');
		}
	}

	closeFile(path: string) {
		const index = this.openFiles.findIndex(file => file.path === path);
		if (index === -1) return false;
		const buffer = this.activeFile?.path === path ? this.activeFile : this.openFileBuffers.get(path);
		if (buffer?.isDirty && typeof window !== 'undefined' && !window.confirm(`Discard unsaved changes to ${path.split('/').pop() ?? path}?`)) {
			return false;
		}
		this.pushUndo();
		this.openFileBuffers.delete(path);
		this.openFiles.splice(index, 1);

		if (this.activeFile?.path === path) {
			if (this.openFiles.length > 0) {
				const nextFile = this.openFiles[Math.min(index, this.openFiles.length - 1)];
				this.activeFile = null;
				void this.openFile(nextFile.path, nextFile.name, { recordHistory: false });
			} else {
				this.activeFile = null;
			}
		}
		this.persistWorkspaceContext();
		return true;
	}

	updateActiveFileContent(newContent: string) {
		if (!this.activeFile) return;

		if (!this.activeFile.isDirty) {
			this.pushUndo();
		}

		this.activeFile.content = newContent;
		this.activeFile.isDirty = newContent !== this.activeFile.originalContent;
		this.openFileBuffers.set(this.activeFile.path, {
			content: this.activeFile.content,
			originalContent: this.activeFile.originalContent,
			isDirty: this.activeFile.isDirty
		});
	}

	async saveActiveFile() {
		if (!this.activeFile) return;
		const path = this.activeFile.path;
		const name = this.activeFile.name;
		const content = this.activeFile.content;
		try {
			await writeFile(path, content);
			this.pushUndo();
			const current = this.activeFile?.path === path ? this.activeFile : this.openFileBuffers.get(path);
			if (current) {
				current.originalContent = content;
				current.isDirty = current.content !== content;
				this.openFileBuffers.set(path, {
					content: current.content,
					originalContent: content,
					isDirty: current.content !== content
				});
			}
			this.addLog(`Saved file: ${name}`, 'success');
			await this.loadDirectory(this.rootPath);
		} catch (error: unknown) {
			this.addLog(`Failed to save file "${name}": ${errorMessage(error)}`, 'error');
		}
	}

	// --- Workspace Saving and Loading ---
	loadSavedWorkspaces() {
		if (typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem('ide:workspaces');
			if (saved) {
				try {
					const parsed: unknown = JSON.parse(saved);
					this.savedWorkspaces = Array.isArray(parsed) ? parsed.filter(isWorkspace) : [];
				} catch {
					this.savedWorkspaces = [];
				}
			}
		}
	}

	saveWorkspace(name: string) {
		if (!name.trim()) return;
		
		this.pushUndo();
		
		const newWS: Workspace = {
			name: name.trim(),
			rootPath: this.rootPath,
			openFiles: this.openFiles.map(f => ({ path: f.path, name: f.name })),
			activeFilePath: this.activeFile?.path ?? null
		};

		// Filter out duplicate names
		this.savedWorkspaces = this.savedWorkspaces.filter(ws => ws.name !== newWS.name);
		this.savedWorkspaces.push(newWS);

		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('ide:workspaces', JSON.stringify(this.savedWorkspaces));
		}
		this.addLog(`Workspace "${name}" saved successfully.`, 'success');
	}

	async loadWorkspace(name: string) {
		const ws = this.savedWorkspaces.find(w => w.name === name);
		if (!ws) {
			this.addLog(`Workspace "${name}" not found.`, 'error');
			return;
		}
		if (!this.confirmDiscardDirtyFiles('Loading this workspace will discard unsaved code changes. Continue?')) return;

		const before = this.captureSnapshot();
		this.pushUndo();
		try {
			await this.loadDirectory(ws.rootPath);
			this.openFiles = [...ws.openFiles];
			this.openFileBuffers = new Map();
			
			if (ws.activeFilePath) {
				const active = ws.openFiles.find(f => f.path === ws.activeFilePath);
				if (active) {
					if (!(await this.openFile(active.path, active.name, { recordHistory: false }))) {
						throw new Error('Could not open the workspace active file.');
					}
				} else {
					this.activeFile = null;
				}
			} else {
				this.activeFile = null;
			}
			this.persistWorkspaceContext(name);
			this.addLog(`Loaded workspace: ${name}`, 'success');
		} catch (e: unknown) {
			this.rollbackToSnapshot(before);
			this.addLog(`Failed to load workspace "${name}": ${errorMessage(e)}`, 'error');
		}
	}

	// --- Workspace Persistence across reloads ---
	persistWorkspaceContext(workspaceName?: string) {
		if (typeof localStorage === 'undefined') return;
		const ctx = {
			lastWorkspaceName: workspaceName || '',
			rootPath: this.rootPath,
			openFiles: this.openFiles.map(f => ({ path: f.path, name: f.name })),
			activeFilePath: this.activeFile?.path || null
		};
		localStorage.setItem('ide:workspace-context', JSON.stringify(ctx));
	}

	restoreWorkspaceContext(): { rootPath: string; openFiles: Array<{ path: string; name: string }>; activeFilePath: string | null } | null {
		if (typeof localStorage === 'undefined') return null;
		try {
			const raw = localStorage.getItem('ide:workspace-context');
			if (!raw) return null;
			const parsed: unknown = JSON.parse(raw);
			if (!parsed || typeof parsed !== 'object') return null;
			const context = parsed as Record<string, unknown>;
			if (typeof context.rootPath !== 'string' || !context.rootPath
				|| !Array.isArray(context.openFiles) || !context.openFiles.every(isFileReference)
				|| (context.activeFilePath !== null && typeof context.activeFilePath !== 'string')) return null;
			return {
				rootPath: context.rootPath,
				openFiles: context.openFiles,
				activeFilePath: context.activeFilePath,
			};
		} catch {
			return null;
		}
	}

	deleteWorkspace(name: string) {
		if (!this.savedWorkspaces.some(workspace => workspace.name === name)) return;
		this.pushUndo();
		this.savedWorkspaces = this.savedWorkspaces.filter(ws => ws.name !== name);
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('ide:workspaces', JSON.stringify(this.savedWorkspaces));
		}
		this.addLog(`Deleted workspace: ${name}`, 'info');
	}

	// --- Log Actions ---
	addLog(message: string, type: 'info' | 'error' | 'success' | 'input' | 'warn' = 'info') {
		const time = new Date().toLocaleTimeString();
		const id = Math.random().toString(36).substring(2, 9);
		this.consoleLogs.push({ id, time, type, message });
		
		if (this.consoleLogs.length > 1000) {
			this.consoleLogs.shift();
		}
	}

	clearLogs() {
		this.consoleLogs = [];
		this.addLog('Console logs cleared.', 'info');
	}

	// --- Terminal Shell Command Handler ---
	createTerminalSession(cols = 120, rows = 30): string {
		const localId = `terminal-${Date.now()}-${++this.terminalSequence}`;
		const title = `Terminal ${this.terminalSequence}`;
		const session: IdeTerminalSession = {
			id: localId,
			nativeId: null,
			title,
			cwd: this.rootPath || '',
			output: '',
			starting: true,
			exited: false,
			createdAt: Date.now()
		};
		this.terminalSessions = [...this.terminalSessions, session];
		this.activeTerminalId = localId;
		this.terminalCollapsed = false;
		void this.initTerminalSession(localId, cols, rows);
		return localId;
	}

	initTerminalSession(localId = this.activeTerminalId ?? '', cols = 120, rows = 30): Promise<string | null> {
		const session = this.getTerminalSession(localId);
		if (!session) return Promise.resolve(null);
		if (session.nativeId) return Promise.resolve(session.nativeId);
		const pendingOpen = this.terminalOpenPromises.get(localId);
		if (pendingOpen) return pendingOpen;
		if (!this.rootPath) {
			this.appendTerminalOutput(localId, 'Open a workspace folder before starting the terminal.\r\n');
			session.starting = false;
			return Promise.resolve(null);
		}
		session.starting = true;
		session.exited = false;
		session.cwd = this.rootPath;
		this.terminalUnlisten ??= onTerminalEvent((event) => this.handleTerminalEvent(event));
		const generation = this.terminalGeneration;
		const rootPath = this.rootPath;
		const openPromise = terminalOpen(this.rootPath, cols, rows)
			.then((nativeId) => {
				const current = this.getTerminalSession(localId);
				if (!current || generation !== this.terminalGeneration || rootPath !== this.rootPath) {
					void terminalClose(nativeId);
					return null;
				}
				current.nativeId = nativeId;
				current.starting = false;
				current.exited = false;
				this.flushPendingTerminalInput(localId, nativeId);
				return nativeId;
			})
			.catch((error) => {
				const current = this.getTerminalSession(localId);
				if (current) {
					current.starting = false;
					current.exited = true;
				}
				this.appendTerminalOutput(localId, `Terminal failed to start: ${errorMessage(error)}\r\n`);
				return null;
			})
			.finally(() => {
				this.terminalOpenPromises.delete(localId);
			});
		this.terminalOpenPromises.set(localId, openPromise);
		return openPromise;
	}

	selectTerminalSession(localId: string): void {
		if (!this.getTerminalSession(localId)) return;
		this.activeTerminalId = localId;
		this.terminalCollapsed = false;
	}

	private getTerminalSession(localId: string | null): IdeTerminalSession | null {
		if (!localId) return null;
		return this.terminalSessions.find(session => session.id === localId) ?? null;
	}

	private getTerminalSessionByNativeId(nativeId: string): IdeTerminalSession | null {
		return this.terminalSessions.find(session => session.nativeId === nativeId) ?? null;
	}

	private handleTerminalEvent(event: TerminalPtyEvent): void {
		const session = this.getTerminalSessionByNativeId(event.sessionId);
		if (!session) return;
		if (event.kind === 'data') {
			this.appendTerminalOutput(session.id, event.data);
			return;
		}
		if (event.kind === 'error') {
			this.appendTerminalOutput(session.id, `\r\n${event.data}\r\n`);
			return;
		}
		this.appendTerminalOutput(session.id, '\r\n[process exited]\r\n');
		session.nativeId = null;
		session.starting = false;
		session.exited = true;
		void terminalClose(event.sessionId);
	}

	private appendTerminalOutput(localId: string, data: string): void {
		const session = this.getTerminalSession(localId);
		if (!session) return;
		session.output += data;
		if (session.output.length > 200_000) {
			session.output = session.output.slice(-120_000);
		}
	}

	sendTerminalInput(data: string, localId = this.activeTerminalId ?? ''): void {
		const session = this.getTerminalSession(localId);
		if (!session) {
			const createdId = this.createTerminalSession();
			this.sendTerminalInput(data, createdId);
			return;
		}
		if (data === '\u000c') {
			session.output = '';
			return;
		}
		if (!session.nativeId) {
			const queued = this.pendingTerminalInput.get(localId) ?? [];
			queued.push(data);
			this.pendingTerminalInput.set(localId, queued);
			void this.initTerminalSession(localId);
			return;
		}
		this.writeTerminalInput(localId, session.nativeId, data);
	}

	private flushPendingTerminalInput(localId: string, nativeId: string): void {
		const queued = this.pendingTerminalInput.get(localId) ?? [];
		this.pendingTerminalInput.delete(localId);
		for (const data of queued) {
			this.writeTerminalInput(localId, nativeId, data);
		}
	}

	private writeTerminalInput(localId: string, nativeId: string, data: string): void {
		void terminalWrite(nativeId, data).catch((error) => {
			this.appendTerminalOutput(localId, `\r\nTerminal write failed: ${errorMessage(error)}\r\n`);
		});
	}

	resizeTerminal(cols: number, rows: number, localId = this.activeTerminalId ?? ''): void {
		const session = this.getTerminalSession(localId);
		if (!session?.nativeId) return;
		void terminalResize(session.nativeId, cols, rows).catch(() => {});
	}

	closeTerminalSession(localId = this.activeTerminalId ?? ''): void {
		const session = this.getTerminalSession(localId);
		if (!session) return;
		this.pendingTerminalInput.delete(localId);
		this.terminalOpenPromises.delete(localId);
		if (session.nativeId) void terminalClose(session.nativeId);
		this.terminalSessions = this.terminalSessions.filter(item => item.id !== localId);
		if (this.activeTerminalId === localId) {
			this.activeTerminalId = this.terminalSessions.at(-1)?.id ?? null;
		}
		if (this.terminalSessions.length === 0) {
			this.terminalUnlisten?.();
			this.terminalUnlisten = null;
		}
	}

	closeAllTerminalSessions(): void {
		this.terminalGeneration += 1;
		for (const session of this.terminalSessions) {
			if (session.nativeId) void terminalClose(session.nativeId);
		}
		this.terminalSessions = [];
		this.activeTerminalId = null;
		this.terminalOpenPromises.clear();
		this.pendingTerminalInput.clear();
		this.terminalUnlisten?.();
		this.terminalUnlisten = null;
	}

	async executeTerminalCommand(cmdString: string) {
		const trimmed = cmdString.trim();
		if (!trimmed) return;
		this.terminalCollapsed = false;
		if (!this.activeTerminalId) this.createTerminalSession();
		this.sendTerminalInput(`${trimmed}\r`);
	}

	// --- AI Assistant Actions ---

	// Shared by the normal ai-done event and a user-initiated stop: turns whatever
	// has streamed in so far into a finalized assistant message.
	private finalizeStreamingMessage(completionLog: string) {
		this.clearAiFirstByteTimeout();
		this.isAiStreaming = false;

		// Parse reasoning block out of streamingText
		let reasoning: string | undefined = undefined;
		let content = this.streamingText;

		const thoughtStart = content.indexOf('<thought>');
		const thoughtEnd = content.indexOf('</thought>');

		if (thoughtStart !== -1 && thoughtEnd !== -1) {
			reasoning = content.substring(thoughtStart + 9, thoughtEnd).trim();
			content = content.substring(thoughtEnd + 10).trim();
		}

		if (content.trim() || reasoning) {
			const assistantId = Math.random().toString(36).substring(7);
			this.chatMessages.push({
				id: assistantId,
				role: 'assistant',
				content,
				reasoning,
				timestamp: new Date().toLocaleTimeString()
			});
			// Persist the assistant turn (ADR-011 Phase 1) — fire-and-forget.
			this.persistMessage(assistantId, 'assistant', content);
		}

		this.streamingText = '';
		this.streamingReasoning = '';
		this.addLog(completionLog, 'success');
	}

	// Called from the Copilot prompt box's Stop button. Tells the backend to actually
	// cancel whatever is in flight (kills the local sidecar process, or stops an API
	// provider stream from emitting further chunks) and finalizes whatever text had
	// streamed in so far into a normal assistant message.
	stopAiStreaming() {
		if (!this.isAiStreaming) return;
		this.aiTurnRequestId += 1;
		cancelAiStream().catch((e) => console.error('Failed to cancel AI stream:', e));
		this.finalizeStreamingMessage('AI Copilot generation stopped by user.');
	}

	// A stream failed server-side (bad API key, unreachable host, model process crash, etc.).
	// These used to be dropped silently, leaving the chat stuck on "Thinking..." forever with
	// no way to tell what went wrong — surface it as a visible message in the chat itself, not
	// just the log panel, so there's no question about whether something happened.
	private handleStreamError(message: string) {
		this.clearAiFirstByteTimeout();
		this.isAiStreaming = false;
		this.streamingText = '';
		this.streamingReasoning = '';

		const id = Math.random().toString(36).substring(7);
		this.chatMessages.push({
			id,
			role: 'assistant',
			content: message,
			isError: true,
			timestamp: new Date().toLocaleTimeString()
		});
		this.addLog(`AI Copilot stream failed: ${message}`, 'error');
	}

	async initAiListeners() {
		if (this.aiListenersInitialized) return;
		await registerAiStreamListeners({
			onChunk: chunk => {
				if (!this.isAiStreaming) return;
				this.clearAiFirstByteTimeout();
				this.streamingText += chunk;
			},
			onDone: () => {
				if (this.isAiStreaming) this.finalizeStreamingMessage('AI Copilot response completed.');
			},
			onError: message => {
				if (this.isAiStreaming) this.handleStreamError(message);
			},
			onUsage: usage => { this.lastUsage = usage; },
		});
		this.aiListenersInitialized = true;

		onDownloadProgress((progress) => {
			this.downloadProgress = progress;
		});

		onDownloadDone((targetPath) => {
			if (this.downloadingModelId) {
				this.addLog(`Downloaded model to ${targetPath}`, 'success');
				this.downloadingModelId = null;
				this.downloadProgress = 0;
			}
		});

		onDownloadError((message) => {
			if (this.downloadingModelId) {
				this.addLog(`Model download failed: ${message}`, 'error');
				this.downloadingModelId = null;
				this.downloadProgress = 0;
			}
		});
	}

	private clearAiFirstByteTimeout(): void {
		if (this.aiFirstByteTimeout) {
			clearTimeout(this.aiFirstByteTimeout);
			this.aiFirstByteTimeout = null;
		}
	}

	private armAiFirstByteTimeout(turnRequestId: number): void {
		this.clearAiFirstByteTimeout();
		this.aiFirstByteTimeout = setTimeout(() => {
			if (!this.isAiStreaming || turnRequestId !== this.aiTurnRequestId) return;
			this.aiTurnRequestId += 1;
			void cancelAiStream();
			this.handleStreamError('The provider did not start streaming within 20 seconds. Check its API format, endpoint, model, and credentials.');
		}, 20_000);
	}

	private docsIndexWatcherStarted = false;
	private docsIndexLastActivityAt = Date.now();
	private docsIndexRebuildInFlight = false;

	// Lazily schedules a mechanical docs/INDEX.md rebuild (see rebuildDocsIndex in ipc.ts / Rust's
	// docs_index.rs). Registration here is free — just a handful of passive activity listeners and
	// one long setTimeout — no actual rebuild work runs at app load. The first real check only
	// happens after DOCS_INDEX_FIRST_CHECK_DELAY_MS of app uptime, and even then only proceeds if
	// the user has been idle for DOCS_INDEX_IDLE_THRESHOLD_MS; subsequent checks are a periodic
	// poll (DOCS_INDEX_CHECK_INTERVAL_MS), not a continuous filesystem watch. The rebuild itself
	// no-ops server-side unless the open workspace is this repo.
	initDocsIndexWatcher() {
		if (this.docsIndexWatcherStarted || typeof window === 'undefined') return;
		this.docsIndexWatcherStarted = true;

		const DOCS_INDEX_IDLE_THRESHOLD_MS = 2 * 60 * 1000;
		const DOCS_INDEX_FIRST_CHECK_DELAY_MS = 5 * 60 * 1000;
		const DOCS_INDEX_CHECK_INTERVAL_MS = 10 * 60 * 1000;

		const markActive = () => { this.docsIndexLastActivityAt = Date.now(); };
		for (const evt of ['mousemove', 'keydown', 'click', 'scroll', 'wheel']) {
			window.addEventListener(evt, markActive, { passive: true });
		}

		const maybeRebuild = async () => {
			if (this.docsIndexRebuildInFlight) return;
			if (!this.rootPath) return;
			if (Date.now() - this.docsIndexLastActivityAt < DOCS_INDEX_IDLE_THRESHOLD_MS) return;

			this.docsIndexRebuildInFlight = true;
			try {
				const report = await rebuildDocsIndex(this.rootPath);
				const total = report.adrCount + report.designCount + report.areasCount + report.guidesCount + report.plansCount + report.archiveCount + report.skillCount + report.agentCount;
				if (total > 0) {
					const staleNote = report.missingFrontmatter.length || report.unregisteredSkillsOrAgents.length
						? ` (${report.missingFrontmatter.length + report.unregisteredSkillsOrAgents.length} item(s) still need frontmatter/registry entries)`
						: '';
					this.addLog(`docs/INDEX.md refreshed during idle: ${total} entries indexed${staleNote}.`, 'info');
				}
			} catch (e: unknown) {
				console.error('Idle docs-index rebuild failed:', e);
			} finally {
				this.docsIndexRebuildInFlight = false;
			}
		};

		setTimeout(() => {
			maybeRebuild();
			setInterval(maybeRebuild, DOCS_INDEX_CHECK_INTERVAL_MS);
		}, DOCS_INDEX_FIRST_CHECK_DELAY_MS);
	}

	// Initialize downloaded model cache from localStorage
	async loadModelsCache() {
		if (typeof localStorage !== 'undefined') {
			this.localModelsDownloadDir = localStorage.getItem('ide:models-download-dir') || '';
		}
		const validated = await Promise.all(this.recommendedModels.map(async model => {
			if (!model.localPath || !(await pathExists(model.localPath))) {
				return { ...model, localPath: undefined, downloaded: false };
			}
			return model;
		}));
		this.recommendedModels = validated;
		this.saveSettings(false);
	}

	async selectModelsDirectory() {
		try {
			const path = await selectDownloadDirectory();
			if (path) {
				this.localModelsDownloadDir = path;
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('ide:models-download-dir', path);
				}
				this.addLog(`Selected models download folder: ${path}`, 'success');
			}
		} catch (e: unknown) {
			this.addLog(`Folder pick failed: ${errorMessage(e)}`, 'error');
		}
	}

	/** Kick off a download for a recommended GGUF model. Sets the
	 *  downloadingModelId state so the ModelMarketplace UI can render a
	 *  progress bar; the actual download runs through the `downloadModel`
	 *  IPC and reports progress via `onDownloadProgress`/`onDownloadDone`
	 *  listeners wired in the constructor. */
	async startDownload(modelId: string) {
		if (this.downloadingModelId) {
			this.addLog('A model download is already in progress.', 'warn');
			return;
		}
		if (!this.localModelsDownloadDir) {
			this.addLog('Select a download folder first.', 'warn');
			return;
		}
		const model = this.recommendedModels.find((m) => m.id === modelId);
		if (!model) {
			this.addLog(`Unknown model: ${modelId}`, 'error');
			return;
		}
		try {
			this.downloadingModelId = modelId;
			this.downloadProgress = 0;
			const url = `https://huggingface.co/${model.repo}/resolve/main/${model.filename}`;
			const targetPath = `${this.localModelsDownloadDir}/${model.filename}`;
			await downloadModel(url, targetPath);
			model.downloaded = true;
			model.localPath = targetPath;
			this.saveSettings(false);
			this.addLog(`Downloaded ${model.name} to ${targetPath}`, 'success');
		} catch (e: unknown) {
			this.addLog(`Download failed: ${errorMessage(e)}`, 'error');
		} finally {
			this.downloadingModelId = null;
			this.downloadProgress = 0;
		}
	}

	// ── Skills marketplace catalog ────────────────────────────────────────
	// Lazily-loaded catalog of skills.sh entries surfaced in the marketplace
	// panel. Hydrated on first access; the install path lives in
	// `installSkillFromMarketplace`.
	skillsCatalog = $state<SkillEntry[]>([]);

	async installSkillFromMarketplace(skill: SkillEntry) {
		this.addLog(`Installing skill: ${skill.name}...`, 'info');
		try {
			if (!this.rootPath) throw new Error('Open a workspace before installing a skill.');
			await installSkill(skill.url, skill.name, this.rootPath);
			skill.installed = true;
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem(`skill:installed:${skill.name}`, 'true');
			}
			this.addLog(`Skill "${skill.name}" installed successfully under agents/skills/${skill.name}/SKILL.md!`, 'success');
		} catch (e: unknown) {
			this.addLog(`Skill installation failed: ${errorMessage(e)}`, 'error');
		}
	}

	// The model label actually used for the in-flight/most recent turn — distinct from
	// activeModelValue (a UI-display convenience) because the 'custom' and 'env' provider
	// branches resolve to a different id than what's stored in activeApiModel (see
	// resolveActiveModelLabel). Read by persistMessage so History shows the real model.
	private lastTurnModelLabel = '';

	// The shell uses `/` as its pre-workspace file-browser placeholder in Tauri. Memory
	// deliberately treats that placeholder as the app-global scope, never as a filesystem root.
	private memoryProjectPath(): string {
		return this.rootPath === '/' ? '' : this.rootPath;
	}

	// Mirrors the model-resolution logic each provider branch in sendAiMessage uses for its
	// actual API call, so persisted sessions record what model was *really* used rather than
	// the raw activeApiModel field (which for 'custom'/'env' providers holds a config/provider
	// id, not the model name — e.g. "tokenrouter" instead of "MiniMax-M3").
	private resolveActiveModelLabel(): string {
		const activeProvider = this.aiProvider;
		if (activeProvider === 'sidecar') {
			return this.selectedModelId || '';
		}
		const activeModel = this.resolvedActiveModel;
		if (activeProvider === 'custom') {
			const config = this.customModels.find(m => m.id === activeModel || m.modelId === activeModel);
			return config?.modelId || activeModel;
		}
		if (activeProvider === 'env') {
			const p = this.envProviders.find(x => x.provider === activeModel);
			return p?.model || activeModel;
		}
		return activeModel;
	}

	// Dynamic contextual parser for AI prompt messages
	async sendAiMessage(promptText: string) {
		if (!promptText.trim() || this.isAiStreaming) return;
		const turnRequestId = ++this.aiTurnRequestId;
		const projectPath = this.rootPath;

		this.lastTurnModelLabel = this.resolveActiveModelLabel();

		const userMsgId = Math.random().toString(36).substring(7);
		this.chatMessages.push({
			id: userMsgId,
			role: 'user',
			content: promptText,
			timestamp: new Date().toLocaleTimeString()
		});
		// Persist the user turn (ADR-011 Phase 1) — fire-and-forget.
		this.persistMessage(userMsgId, 'user', promptText);

		this.isAiStreaming = true;
		this.streamingText = '';
		this.streamingReasoning = '';
		this.lastUsage = null;
		
		this.addLog('AI Copilot thinking...', 'info');

		// 1. Scan prompt for @file references
		let parsedPrompt = promptText;
		const fileRefs = promptText.match(/@\[([^\]]+)\]/g) || [];
		
		let contextStr = '';
		for (const ref of fileRefs) {
			// Extract basename/path inside @[basename]
			const cleanName = ref.slice(2, -1);
			// Find match in fileEntries
			const entry = this.fileEntries.find(e => e.name === cleanName || e.path.endsWith(cleanName));
			if (entry && !entry.isDir) {
				try {
					const content = await readFile(entry.path);
					if (turnRequestId !== this.aiTurnRequestId || projectPath !== this.rootPath) return;
					contextStr += `\n--- File: ${entry.name} ---\n${content}\n-----------------\n`;
				} catch (e) {
					console.error(`Failed to read file context for ${cleanName}:`, e);
				}
			}
		}

		// Add attached files context
		for (const file of this.attachedFiles) {
			if (file.content) {
				contextStr += `\n--- Attached File: ${file.name} (${file.path}) ---\n${file.content}\n-----------------\n`;
			}
		}
		
		if (contextStr) {
			parsedPrompt = `CONTEXT FILES PROVIDED BY USER:${contextStr}\n\nUSER PROMPT: ${parsedPrompt}`;
		}
		if (turnRequestId !== this.aiTurnRequestId || projectPath !== this.rootPath) return;

		// 3. Runs GGUF/MLX Sidecar or API Providers model
		const activeProvider = this.aiProvider;
		const activeModel = this.resolvedActiveModel;
		let requestStarted = false;
		
		if (activeProvider === 'sidecar') {
			let modelPath = '';
			let mmprojPath: string | null = null;
			
			if (this.selectedModelId === 'custom-local-gguf') {
				modelPath = this.localGgufModelPath;
				mmprojPath = this.localMmprojPath || null;
			} else if (this.selectedModelId === 'custom-local-mlx') {
				modelPath = this.localMlxModelPath;
			} else if (this.localModels.some(model => model.id === this.selectedModelId)) {
				const localModel = this.localModels.find(model => model.id === this.selectedModelId)!;
				modelPath = localModel.path;
				mmprojPath = localModel.mmprojPath || null;
			} else {
				modelPath = this.recommendedModels.find(model => model.id === this.selectedModelId)?.localPath || '';
			}
			
			if (!modelPath) {
				this.handleStreamError('No local model file is selected. Add one in Settings → Local Models.');
				return;
			}
			
			try {
				await runLocalModel(modelPath, mmprojPath || undefined, parsedPrompt);
				requestStarted = true;
			} catch (e: unknown) {
				this.handleStreamError(`Local model execution failed: ${errorMessage(e)}`);
			}
		} else if (activeProvider === 'custom') {
			// Find custom model config
			const config = this.customModels.find(m => m.id === activeModel || m.modelId === activeModel);
			if (!config) {
				this.handleStreamError(`The custom model configuration "${activeModel}" was not found.`);
				return;
			}
			
			try {
				await runApiModel(
					config.apiFormat,
					config.credentialId,
					config.modelId,
					parsedPrompt,
					"Begin.",
					config.baseUrl || undefined,
					config.isFullUrl ?? false
				);
				requestStarted = true;
			} catch (e: unknown) {
				const message = errorMessage(e);
				if (message.includes('No keychain credential found')) {
					this.handleStreamError(`The saved API key for “${config.name}” is missing. Remove this model in Settings → AI Models and add it again with its API key.`);
				} else {
					this.handleStreamError(`Custom provider request failed: ${message}`);
				}
			}
		} else if (activeProvider === 'env') {
			// Provider sourced from the project's .env (API_KEY_/API_LINK_/API_MODEL_).
			const p = this.envProviders.find(x => x.provider === activeModel);
			if (!p) {
				this.handleStreamError(`The .env provider "${activeModel}" was not found. Re-open the workspace to refresh it.`);
				return;
			}
			if (!p.model) {
				this.handleStreamError(`Set API_MODEL_${activeModel.toUpperCase()} in .env before using this provider.`);
				return;
			}
			try {
				await runEnvModel(projectPath, p.provider, parsedPrompt, "Begin.");
				requestStarted = true;
			} catch (e: unknown) {
				this.handleStreamError(`.env provider request failed: ${errorMessage(e)}`);
			}
		} else {
			let baseUrl = '';
			const credentialId = activeProvider === 'ollama' ? null : activeProvider;
			if (activeProvider === 'openai') {
				baseUrl = this.aiBaseUrlOpenAI;
			} else if (activeProvider === 'anthropic') {
				baseUrl = this.aiBaseUrlAnthropic;
			} else if (activeProvider === 'gemini') {
				baseUrl = this.aiBaseUrlGemini;
			} else if (activeProvider === 'deepseek') {
				baseUrl = this.aiBaseUrlDeepSeek;
			} else if (activeProvider === 'xai') {
				baseUrl = this.aiBaseUrlXAI;
			} else if (activeProvider === 'zai') {
				baseUrl = this.aiBaseUrlZAi;
			} else if (activeProvider === 'ollama') {
				baseUrl = this.aiBaseUrlOllama;
			}
			
			try {
				await runApiModel(activeProvider, credentialId, activeModel, parsedPrompt, "Begin.", baseUrl || undefined);
				requestStarted = true;
			} catch (e: unknown) {
				this.handleStreamError(`Provider request failed: ${errorMessage(e)}`);
			}
		}

		// A stop, new chat, or workspace change can supersede this turn while its IPC
		// invocation is pending. Do not clear attachments belonging to the newer context.
		if (requestStarted && turnRequestId === this.aiTurnRequestId && projectPath === this.rootPath) {
			this.armAiFirstByteTimeout(turnRequestId);
			this.attachedFiles = [];
		}
	}

	// --- ADR-011 Phase 1: project memory, sessions, .env providers, model groups ---

	private async persistMessage(messageId: string, role: 'user' | 'assistant', content: string) {
		try {
			const sessionId = this.ensureSession();
			// Only takes effect the first time a session is created (see append_message) —
			// records which model the chat started with, for the History list. Uses
			// lastTurnModelLabel (the actually-resolved model for this turn), not
			// activeModelValue, since 'custom'/'env' providers resolve to a different id.
			await appendMessage(this.memoryProjectPath(), sessionId, messageId, role, content, this.lastTurnModelLabel);
		} catch (e) {
			// Persistence is best-effort; never break the chat flow.
			console.error('persistMessage failed:', e);
		}
	}

	// Public so the AI module can materialize a session id at new-session time instead
	// of waiting for the first persisted message (ADR-011 creates ids lazily otherwise).
	ensureSession(): string {
		if (!this.currentSessionId) {
			this.currentSessionId = 'sess_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
		}
		return this.currentSessionId;
	}

	async initProjectMemory(projectPath = this.memoryProjectPath()) {
		projectPath = projectPath === '/' ? '' : projectPath;
		const requestId = ++this.projectContextRequestId;
		try {
			await openProjectMemory(projectPath);
			const [sessions, providers] = await Promise.all([
				listSessions(projectPath),
				projectPath ? readEnvProviders(projectPath) : Promise.resolve([]),
			]);
			if (requestId !== this.projectContextRequestId || projectPath !== this.memoryProjectPath()) return;
			this.sessions = sessions;
			this.envProviders = providers;
			if (providers.length > 0) this.addLog(`Detected ${providers.length} AI provider(s) from .env`, 'info');
		} catch (e) {
			if (requestId !== this.projectContextRequestId || projectPath !== this.memoryProjectPath()) return;
			this.sessions = [];
			this.envProviders = [];
			console.error('initProjectMemory failed:', e);
		}
	}

	async refreshSessions() {
		const projectPath = this.memoryProjectPath();
		try {
			const sessions = await listSessions(projectPath);
			if (projectPath === this.memoryProjectPath()) this.sessions = sessions;
		} catch (e) {
			if (projectPath === this.memoryProjectPath()) this.sessions = [];
			console.error('refreshSessions failed:', e);
		}
	}

	async refreshEnvProviders() {
		const projectPath = this.memoryProjectPath();
		if (!projectPath) { this.envProviders = []; return; }
		try {
			const providers = await readEnvProviders(projectPath);
			if (projectPath !== this.memoryProjectPath()) return;
			this.envProviders = providers;
			if (providers.length > 0) {
				this.addLog(`Detected ${providers.length} AI provider(s) from .env`, 'info');
			}
		} catch (e) {
			if (projectPath === this.memoryProjectPath()) this.envProviders = [];
			console.error('refreshEnvProviders failed:', e);
		}
	}

	newChatSession() {
		this.chatSessionRequestId += 1;
		this.aiTurnRequestId += 1;
		this.currentSessionId = null;
		this.chatMessages = [];
		this.streamingText = '';
		this.streamingReasoning = '';
		this.lastUsage = null;
	}

	async loadChatSession(sessionId: string) {
		if (this.isAiStreaming) this.stopAiStreaming();
		const requestId = ++this.chatSessionRequestId;
		const projectPath = this.memoryProjectPath();
		try {
			const msgs = await loadSession(projectPath, sessionId);
			if (requestId !== this.chatSessionRequestId || projectPath !== this.memoryProjectPath()) return;
			this.currentSessionId = sessionId;
			this.chatMessages = msgs.map(m => ({
				id: m.id,
				role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
				content: m.content,
				timestamp: new Date(m.createdAt).toLocaleTimeString()
			}));
		} catch (e: unknown) {
			if (requestId !== this.chatSessionRequestId || projectPath !== this.memoryProjectPath()) return;
			this.addLog(`Failed to load session: ${errorMessage(e)}`, 'error');
		}
	}

	async checkpointAt(messageId: string, label: string) {
		if (!this.currentSessionId) return;
		try {
			await createCheckpoint(this.memoryProjectPath(), this.currentSessionId, messageId, label);
			this.addLog(`Checkpoint created: ${label}`, 'success');
		} catch (e: unknown) {
			this.addLog(`Failed to create checkpoint: ${errorMessage(e)}`, 'error');
		}
	}

	async restoreToCheckpoint(messageId: string) {
		// Truncate the live chat to (and including) the checkpoint message.
		const idx = this.chatMessages.findIndex(m => m.id === messageId);
		if (idx >= 0) {
			this.chatMessages = this.chatMessages.slice(0, idx + 1);
		}
		if (this.currentSessionId) {
			try {
				await restoreCheckpoint(this.memoryProjectPath(), this.currentSessionId, messageId);
			} catch (e: unknown) {
				this.addLog(`Failed to restore checkpoint: ${errorMessage(e)}`, 'error');
			}
		}
	}

	get activeMaxContextTokens(): number {
		const modelId = this.aiProvider === 'sidecar' ? this.selectedModelId : (this.activeApiModel || '');
		return maxContextTokensFor(modelId);
	}

	// Aggregate all selectable models into grouped options for the model selector.
	buildModelGroups(): ModelGroup[] {
		const groups: ModelGroup[] = [];

		const sidecar = this.recommendedModels
			.filter(model => !!model.localPath)
			.map(model => ({ id: model.id, label: model.name, provider: 'sidecar' }));
		for (const model of this.localModels) sidecar.push({ id: model.id, label: model.name, provider: 'sidecar' });
		if (this.localGgufModelPath) sidecar.push({ id: 'custom-local-gguf', label: 'Custom GGUF (Local)', provider: 'sidecar' });
		if (this.localMlxModelPath) sidecar.push({ id: 'custom-local-mlx', label: 'Custom MLX (Local)', provider: 'sidecar' });
		groups.push({ label: 'Local Sidecar', options: sidecar });
		const standardModels: Record<string, string[]> = {
			openai: this.customOpenAiModels,
			anthropic: this.customAnthropicModels,
			gemini: this.customGeminiModels,
			deepseek: this.customDeepSeekModels,
			xai: this.customXAiModels,
			zai: this.customZAiModels,
			ollama: this.customOllamaModels
		};
		const named: Array<[string, string, string[]]> = AI_PROVIDER_DEFINITIONS
			.filter(definition => definition.id in standardModels)
			.map(definition => [definition.label, definition.id, standardModels[definition.id]]);
		for (const [label, provider, models] of named) {
			if (models.length > 0) {
				groups.push({ label, options: models.map(m => ({ id: m, label: m, provider })) });
			}
		}
		if (this.envProviders.length > 0) {
			groups.push({
				label: '.env',
				options: this.envProviders.map(p => ({
					id: p.provider,
					label: `${p.provider}${p.model ? ' · ' + p.model : ''}`,
					provider: 'env'
				}))
			});
		}
		if (this.customModels.length > 0) {
			groups.push({
				label: 'Custom',
				options: this.customModels.map(model => ({ id: model.id, label: model.name, provider: 'custom' }))
			});
		}

		return groups;
	}

	// The value the model selector should highlight as currently active.
	get activeModelValue(): string {
		if (this.aiProvider === 'sidecar') return this.selectedModelId;
		return this.resolvedActiveModel;
	}

	// Mirrors the old handleModelChange in AIChat: applies a (provider, modelId) selection.
	onSelectModel(provider: string, modelId: string) {
		if (!isAiProvider(provider)) {
			this.addLog(`Ignored unknown AI provider "${provider}"`, 'error');
			return;
		}
		this.pushUndo();
		this.aiProvider = provider;
		if (provider === 'sidecar') {
			this.selectedModelId = modelId;
		} else {
			this.activeApiModel = modelId;
		}
		this.saveSettings();
		this.addLog(`Switched active AI provider to ${provider} and model to ${modelId}`, 'info');
	}

	// --- settings and attachments methods ---
	get availableModels() {
		switch (this.aiProvider) {
			case 'sidecar':
				const list = this.recommendedModels.filter(model => !!model.localPath).map(model => model.id);
				list.push(...this.localModels.map(model => model.id));
				if (this.localGgufModelPath) list.push('custom-local-gguf');
				if (this.localMlxModelPath) list.push('custom-local-mlx');
				return list;
			case 'custom':
				return this.customModels.map(m => m.id);
			case 'env':
				return this.envProviders.map(p => p.provider);
			case 'openai': return this.customOpenAiModels;
			case 'anthropic': return this.customAnthropicModels;
			case 'gemini': return this.customGeminiModels;
			case 'deepseek': return this.customDeepSeekModels;
			case 'xai': return this.customXAiModels;
			case 'zai': return this.customZAiModels;
			case 'ollama': return this.customOllamaModels;
			default:
				return [];
		}
	}

	get resolvedActiveModel(): string {
		const models = this.availableModels;
		return models.includes(this.activeApiModel) ? this.activeApiModel : '';
	}

	private captureModelRegistry(): StoredModelRegistry {
		return {
			version: 2,
			activeModel: this.activeModelValue ? { providerId: this.aiProvider, id: this.activeModelValue } : null,
			baseUrls: {
				openai: this.aiBaseUrlOpenAI,
				anthropic: this.aiBaseUrlAnthropic,
				gemini: this.aiBaseUrlGemini,
				deepseek: this.aiBaseUrlDeepSeek,
				xai: this.aiBaseUrlXAI,
				zai: this.aiBaseUrlZAi,
				ollama: this.aiBaseUrlOllama,
			},
			userModels: {
				openai: [...this.customOpenAiModels],
				anthropic: [...this.customAnthropicModels],
				gemini: [...this.customGeminiModels],
				deepseek: [...this.customDeepSeekModels],
				xai: [...this.customXAiModels],
				zai: [...this.customZAiModels],
				ollama: [...this.customOllamaModels],
			},
			customModels: this.customModels.map(({ apiKey: _apiKey, ...model }) => model),
			localModels: [...this.localModels],
			localGgufModelPath: this.localGgufModelPath,
			localMmprojPath: this.localMmprojPath,
			localMlxModelPath: this.localMlxModelPath,
			recommendedLocalPaths: Object.fromEntries(this.recommendedModels
				.filter(model => !!model.localPath)
				.map(model => [model.id, model.localPath!])),
		};
	}

	private applyModelRegistry(registry: StoredModelRegistry): void {
		this.aiBaseUrlOpenAI = storedHttpUrl(registry.baseUrls.openai ?? null, '');
		this.aiBaseUrlAnthropic = storedHttpUrl(registry.baseUrls.anthropic ?? null, '');
		this.aiBaseUrlGemini = storedHttpUrl(registry.baseUrls.gemini ?? null, '');
		this.aiBaseUrlDeepSeek = storedHttpUrl(registry.baseUrls.deepseek ?? null, '');
		this.aiBaseUrlXAI = storedHttpUrl(registry.baseUrls.xai ?? null, '');
		this.aiBaseUrlZAi = storedHttpUrl(registry.baseUrls.zai ?? null, '');
		this.aiBaseUrlOllama = storedHttpUrl(registry.baseUrls.ollama ?? null, 'http://localhost:11434');
		this.customOpenAiModels = registry.userModels.openai ?? [];
		this.customAnthropicModels = registry.userModels.anthropic ?? [];
		this.customGeminiModels = registry.userModels.gemini ?? [];
		this.customDeepSeekModels = registry.userModels.deepseek ?? [];
		this.customXAiModels = registry.userModels.xai ?? [];
		this.customZAiModels = registry.userModels.zai ?? [];
		this.customOllamaModels = registry.userModels.ollama ?? [];
		this.customModels = registry.customModels.map(model => ({ ...model }));
		this.localModels = registry.localModels.map(model => ({ ...model }));
		this.localGgufModelPath = registry.localGgufModelPath;
		this.localMmprojPath = registry.localMmprojPath;
		this.localMlxModelPath = registry.localMlxModelPath;
		this.recommendedModels = this.recommendedModels.map(model => ({
			...model,
			localPath: registry.recommendedLocalPaths[model.id],
			downloaded: !!registry.recommendedLocalPaths[model.id],
		}));
		this.aiProvider = registry.activeModel?.providerId ?? 'env';
		this.selectedModelId = registry.activeModel?.providerId === 'sidecar' ? registry.activeModel.id : '';
		this.activeApiModel = registry.activeModel?.providerId && registry.activeModel.providerId !== 'sidecar'
			? registry.activeModel.id : '';
	}

	loadSettings() {
		if (typeof localStorage !== 'undefined') {
			const size = localStorage.getItem('ide:settings:font-size');
			if (size) {
				const parsedSize = Number(size);
				this.editorFontSize = Number.isFinite(parsedSize) ? Math.min(24, Math.max(10, Math.round(parsedSize))) : 16;
			}
			
			const family = localStorage.getItem('ide:settings:font-family');
			if (family) this.editorFontFamily = family;
			
			const wrapping = localStorage.getItem('ide:settings:line-wrapping');
			if (wrapping) this.editorLineWrapping = wrapping === 'true';
			
			try {
				const registry = readStoredModelRegistry(localStorage);
				if (registry) this.applyModelRegistry(registry);
				else localStorage.setItem(MODEL_REGISTRY_STORAGE_KEY, JSON.stringify(this.captureModelRegistry()));
			} catch (error) {
				this.addLog(`Invalid persisted model settings were reset: ${errorMessage(error)}`, 'error');
			}
		}
	}

	// Provider API keys live in the OS keychain (see ipc.ts saveApiKey/loadApiKey), not
	// localStorage — async, so it's a separate step from loadSettings() rather than folded
	// into it. Also migrates any key left over from before this split.
	async migrateLegacyApiKeys() {
		if (typeof localStorage === 'undefined') return;
		for (const provider of ['openai', 'anthropic', 'gemini', 'deepseek', 'xai', 'zai']) {
			const legacy = localStorage.getItem(`ide:settings:key-${provider}`);
			if (legacy) {
				await saveApiKey(provider, legacy);
				localStorage.removeItem(`ide:settings:key-${provider}`);
			}
		}
	}

	// Configurations created before credentialId existed embedded their API key in
	// localStorage. Migrate once on startup, then persist the scrubbed configuration.
	async migrateCustomModelCredentials() {
		let changed = false;
		const migrated: CustomModelConfig[] = [];
		for (const config of this.customModels) {
			const credentialId = config.credentialId || `custom-model-${config.id}`;
			if (config.apiKey) {
				await saveApiKey(credentialId, config.apiKey);
				changed = true;
			}
			migrated.push({
				...config,
				credentialId,
				apiKey: undefined
			});
			if (config.credentialId !== credentialId) changed = true;
		}
		if (changed) {
			this.customModels = migrated;
			this.saveSettings();
		}
	}

	async addCustomModel(
		config: Omit<CustomModelConfig, 'id' | 'credentialId' | 'apiKey'>,
		apiKey: string
	) {
		const id = crypto.randomUUID();
		const credentialId = `custom-model-${id}`;
		await saveApiKey(credentialId, apiKey);
		this.pushUndo();
		this.customModels = [...this.customModels, { ...config, id, credentialId }];
		this.saveSettings();
	}

	async deleteCustomModel(id: string) {
		this.pushUndo();
		this.customModels = this.customModels.filter((model) => model.id !== id);
		// Keep the keychain record while this deletion is recoverable through undo.
		// The renderer cannot restore a deleted secret because it never reads secrets
		// back from native storage (ADR-017).
		this.saveSettings();
	}

	// Destructive reset for a clean AI onboarding pass. It deliberately removes only
	// configuration and credentials; model files are user-owned files on disk and are
	// never deleted implicitly by application settings.
	async resetAiConfiguration(): Promise<void> {
		const credentialIds = [
			'openai', 'anthropic', 'gemini', 'deepseek', 'xai', 'zai',
			...this.customModels.map(model => model.credentialId),
		];
		await applyApiKeyChanges([...new Set(credentialIds)].map(credentialId => ({ credentialId, key: '' })));
		this.stopAiStreaming();
		this.aiProvider = 'env';
		this.activeApiModel = '';
		this.selectedModelId = '';
		this.aiBaseUrlOpenAI = '';
		this.aiBaseUrlAnthropic = '';
		this.aiBaseUrlGemini = '';
		this.aiBaseUrlDeepSeek = '';
		this.aiBaseUrlXAI = '';
		this.aiBaseUrlZAi = '';
		this.aiBaseUrlOllama = 'http://localhost:11434';
		this.customOpenAiModels = [];
		this.customAnthropicModels = [];
		this.customGeminiModels = [];
		this.customDeepSeekModels = [];
		this.customXAiModels = [];
		this.customZAiModels = [];
		this.customOllamaModels = [];
		this.customModels = [];
		this.localModels = [];
		this.localGgufModelPath = '';
		this.localMmprojPath = '';
		this.localMlxModelPath = '';
		this.recommendedModels = this.recommendedModels.map(model => ({ ...model, localPath: undefined, downloaded: false }));
		if (typeof localStorage !== 'undefined') localStorage.removeItem('ide:models-download-dir');
		this.localModelsDownloadDir = '';
		this.saveSettings(false);
		this.addLog('AI configuration, saved models, and provider credentials were reset.', 'success');
	}

	saveSettings(logSuccess = true) {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('ide:settings:font-size', this.editorFontSize.toString());
			localStorage.setItem('ide:settings:font-family', this.editorFontFamily);
			localStorage.setItem('ide:settings:line-wrapping', this.editorLineWrapping.toString());
			localStorage.setItem(MODEL_REGISTRY_STORAGE_KEY, JSON.stringify(this.captureModelRegistry()));
			
			if (logSuccess) this.addLog('Settings saved successfully.', 'success');
		}
	}

	async selectLocalGguf() {
		try {
			const path = await selectFile();
			if (path) {
				this.pushUndo();
				this.localGgufModelPath = path;
				this.saveSettings();
				this.addLog(`Selected local GGUF: ${path}`, 'success');
			}
		} catch (e: unknown) {
			this.addLog(`Failed to select GGUF: ${errorMessage(e)}`, 'error');
		}
	}

	addLocalModel(name: string, path: string, mmprojPath = '', makeActive = false): LocalModelConfig {
		const normalizedName = name.trim();
		const normalizedPath = path.trim();
		if (!normalizedName) throw new Error('Enter a name for the local model.');
		if (!normalizedPath.toLowerCase().endsWith('.gguf')) throw new Error('Choose a GGUF model file.');
		if (this.localModels.some(model => model.name.toLowerCase() === normalizedName.toLowerCase())) throw new Error('A local model already uses that name.');
		if (this.localModels.some(model => model.path === normalizedPath)) throw new Error('That local model file is already added.');
		const model: LocalModelConfig = { id: `local-${crypto.randomUUID()}`, name: normalizedName, path: normalizedPath, ...(mmprojPath ? { mmprojPath } : {}) };
		this.pushUndo();
		this.localModels = [...this.localModels, model];
		// Optional selection is part of the same undo entry so add+select reverts atomically.
		if (makeActive) {
			this.aiProvider = 'sidecar';
			this.selectedModelId = model.id;
		}
		this.saveSettings(false);
		this.addLog(`Added local model "${model.name}".`, 'success');
		return model;
	}

	removeLocalModel(id: string): void {
		if (!this.localModels.some(model => model.id === id)) return;
		this.pushUndo();
		this.localModels = this.localModels.filter(model => model.id !== id);
		if (this.selectedModelId === id) this.selectedModelId = '';
		this.saveSettings(false);
		this.addLog('Removed local model.', 'success');
	}

	async selectLocalMmproj() {
		try {
			const path = await selectFile();
			if (path) {
				this.pushUndo();
				this.localMmprojPath = path;
				this.saveSettings();
				this.addLog(`Selected local vision projector (mmproj): ${path}`, 'success');
			}
		} catch (e: unknown) {
			this.addLog(`Failed to select mmproj: ${errorMessage(e)}`, 'error');
		}
	}

	async selectLocalMlx() {
		try {
			const path = await selectFile();
			if (path) {
				this.pushUndo();
				this.localMlxModelPath = path;
				this.saveSettings();
				this.addLog(`Selected local MLX model: ${path}`, 'success');
			}
		} catch (e: unknown) {
			this.addLog(`Failed to select MLX model: ${errorMessage(e)}`, 'error');
		}
	}

	async attachFile() {
		try {
			const projectPath = this.rootPath;
			const filePath = await selectFile();
			if (filePath) {
				if (projectPath !== this.rootPath) return;
				const fileName = filePath.split('/').pop() || filePath;
				if (this.attachedFiles.some(f => f.path === filePath)) {
					this.addLog('File is already attached.', 'error');
					return;
				}
				const content = await readFile(filePath);
				if (projectPath !== this.rootPath) return;
				this.pushUndo();
				this.attachedFiles.push({ path: filePath, name: fileName, content });
				this.addLog(`Attached file: ${fileName}`, 'success');
			}
		} catch (e: unknown) {
			this.addLog(`File attachment failed: ${errorMessage(e)}`, 'error');
		}
	}

	removeAttachedFile(path: string) {
		this.pushUndo();
		this.attachedFiles = this.attachedFiles.filter(f => f.path !== path);
	}

	get historyForUndo(): UndoHistory<string> {
		return this.history;
	}
}

export const ideState = new IDEState();
