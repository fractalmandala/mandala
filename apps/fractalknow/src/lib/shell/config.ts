import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import type { OkThemeSource } from '$lib/desktop';
import { readLocalStorage, writeLocalStorage } from './storage';

const STORAGE_KEY = 'fractalknow:app-config';
const CONFIG_VERSION = 1;

export type AppearanceDensity = 'comfortable' | 'compact';
export type PreviewMode = 'document' | 'split' | 'source';
export type SyncMode = 'off' | 'pull' | 'full';
export type AgentProvider = 'codex' | 'claude' | 'custom';
export type ConfigPersistenceStatus = 'idle' | 'pending' | 'synced' | 'local-only' | 'error';

export type ProjectConfigState = {
	version: number;
	project: {
		name: string;
		path: string;
		apiOrigin: string;
		collabUrl: string;
		singleFile: boolean;
		/** Worktree root when using git worktree workflows (from use-worktrees inventory). */
		worktreeRoot: string;
	};
	appearance: {
		themeSource: OkThemeSource;
		reducedTransparency: boolean;
		density: AppearanceDensity;
		previewMode: PreviewMode;
		showLineNumbers: boolean;
	};
	validation: {
		validateOnSave: boolean;
		markdownLint: boolean;
		frontmatterValidation: boolean;
		frontmatterSeverity: 'error' | 'warning' | 'info';
		linkValidation: boolean;
		linkSeverity: 'error' | 'warning' | 'info';
		headingStructureValidation: boolean;
		headingSeverity: 'error' | 'warning' | 'info';
		trailingWhitespaceValidation: boolean;
		trailingWhitespaceSeverity: 'error' | 'warning' | 'info';
		/** File-specific lint rule browser toggle (from useLintConfigViewMode). */
		showLintRuleBrowser: boolean;
		fileTreeIndicators: boolean;
	};
	syncCollaboration: {
		mode: SyncMode;
		autoSync: boolean;
		collaborationEnabled: boolean;
		serverUrl: string;
		/** Local presence label for collaboration awareness. */
		presenceName: string;
	};
	agentTools: {
		defaultProvider: AgentProvider;
		enabledProviders: AgentProvider[];
		allowTerminalTools: boolean;
		allowFilesystemTools: boolean;
		/** Installed-agent discovery toggle (from useInstalledAgents). */
		discoverInstalledAgents: boolean;
		overrides?: Record<string, { enabled: boolean; launchCommand: string }>;
	};
};

export type ConfigValidationIssue = {
	path: string;
	message: string;
	severity: 'error' | 'warning';
};

export type ConfigPersistenceState = {
	status: ConfigPersistenceStatus;
	lastSyncedAt: string | null;
	error: string | null;
};

type ConfigPersistCommand = (
	config: ProjectConfigState,
) => Promise<{ ok: true } | { ok: false; error?: string } | undefined>;

const defaults: ProjectConfigState = {
	version: CONFIG_VERSION,
	project: {
		name: 'fractalknow',
		path: '',
		apiOrigin: '',
		collabUrl: '',
		singleFile: false,
		worktreeRoot: '',
	},
	appearance: {
		themeSource: 'system',
		reducedTransparency: false,
		density: 'comfortable',
		previewMode: 'document',
		showLineNumbers: true,
	},
	validation: {
		validateOnSave: true,
		markdownLint: true,
		frontmatterValidation: true,
		frontmatterSeverity: 'error',
		linkValidation: true,
		linkSeverity: 'info',
		headingStructureValidation: true,
		headingSeverity: 'error',
		trailingWhitespaceValidation: true,
		trailingWhitespaceSeverity: 'warning',
		showLintRuleBrowser: false,
		fileTreeIndicators: true,
	},
	syncCollaboration: {
		mode: 'off',
		autoSync: false,
		collaborationEnabled: false,
		serverUrl: '',
		presenceName: 'Local user',
	},
	agentTools: {
		defaultProvider: 'codex',
		enabledProviders: ['codex'],
		allowTerminalTools: false,
		allowFilesystemTools: true,
		discoverInstalledAgents: true,
	},
};

const persistence = writable<ConfigPersistenceState>({
	status: 'idle',
	lastSyncedAt: null,
	error: null,
});

let persistCommand: ConfigPersistCommand | null = null;
let writeQueued = false;
let lastValidConfig: ProjectConfigState = defaults;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function pickString(value: unknown, fallback: string): string {
	return typeof value === 'string' ? value : fallback;
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
	return typeof value === 'boolean' ? value : fallback;
}

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
	return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback;
}

function pickEnumList<T extends string>(
	value: unknown,
	allowed: readonly T[],
	fallback: readonly T[],
): T[] {
	if (!Array.isArray(value)) return [...fallback];
	const values = value.filter((entry): entry is T => allowed.includes(entry as T));
	return values.length > 0 ? values : [...fallback];
}

export function normalizeAppConfig(raw: unknown): ProjectConfigState {
	const source = isRecord(raw) ? raw : {};
	const project = isRecord(source.project) ? source.project : {};
	const appearance = isRecord(source.appearance) ? source.appearance : {};
	const validation = isRecord(source.validation) ? source.validation : {};
	const syncCollaboration = isRecord(source.syncCollaboration) ? source.syncCollaboration : {};
	const agentTools = isRecord(source.agentTools) ? source.agentTools : {};

	return {
		version: CONFIG_VERSION,
		project: {
			name: pickString(project.name, defaults.project.name),
			path: pickString(project.path, defaults.project.path),
			apiOrigin: pickString(project.apiOrigin, defaults.project.apiOrigin),
			collabUrl: pickString(project.collabUrl, defaults.project.collabUrl),
			singleFile: pickBoolean(project.singleFile, defaults.project.singleFile),
			worktreeRoot: pickString(project.worktreeRoot, defaults.project.worktreeRoot),
		},
		appearance: {
			themeSource: pickEnum(appearance.themeSource, ['system', 'light', 'dark'], defaults.appearance.themeSource),
			reducedTransparency: pickBoolean(
				appearance.reducedTransparency,
				defaults.appearance.reducedTransparency,
			),
			density: pickEnum(
				appearance.density,
				['comfortable', 'compact'],
				defaults.appearance.density,
			),
			previewMode: pickEnum(
				appearance.previewMode,
				['document', 'split', 'source'],
				defaults.appearance.previewMode,
			),
			showLineNumbers: pickBoolean(appearance.showLineNumbers, defaults.appearance.showLineNumbers),
		},
		validation: {
			validateOnSave: pickBoolean(validation.validateOnSave, defaults.validation.validateOnSave),
			markdownLint: pickBoolean(validation.markdownLint, defaults.validation.markdownLint),
			frontmatterValidation: pickBoolean(
				validation.frontmatterValidation,
				defaults.validation.frontmatterValidation,
			),
			frontmatterSeverity: pickEnum(
				validation.frontmatterSeverity,
				['error', 'warning', 'info'],
				defaults.validation.frontmatterSeverity,
			),
			linkValidation: pickBoolean(validation.linkValidation, defaults.validation.linkValidation),
			linkSeverity: pickEnum(
				validation.linkSeverity,
				['error', 'warning', 'info'],
				defaults.validation.linkSeverity,
			),
			headingStructureValidation: pickBoolean(
				validation.headingStructureValidation,
				defaults.validation.headingStructureValidation,
			),
			headingSeverity: pickEnum(
				validation.headingSeverity,
				['error', 'warning', 'info'],
				defaults.validation.headingSeverity,
			),
			trailingWhitespaceValidation: pickBoolean(
				validation.trailingWhitespaceValidation,
				defaults.validation.trailingWhitespaceValidation,
			),
			trailingWhitespaceSeverity: pickEnum(
				validation.trailingWhitespaceSeverity,
				['error', 'warning', 'info'],
				defaults.validation.trailingWhitespaceSeverity,
			),
			showLintRuleBrowser: pickBoolean(
				validation.showLintRuleBrowser,
				defaults.validation.showLintRuleBrowser,
			),
			fileTreeIndicators: pickBoolean(
				validation.fileTreeIndicators,
				defaults.validation.fileTreeIndicators,
			),
		},
		syncCollaboration: {
			mode: pickEnum(syncCollaboration.mode, ['off', 'pull', 'full'], defaults.syncCollaboration.mode),
			autoSync: pickBoolean(syncCollaboration.autoSync, defaults.syncCollaboration.autoSync),
			collaborationEnabled: pickBoolean(
				syncCollaboration.collaborationEnabled,
				defaults.syncCollaboration.collaborationEnabled,
			),
			serverUrl: pickString(syncCollaboration.serverUrl, defaults.syncCollaboration.serverUrl),
			presenceName: pickString(syncCollaboration.presenceName, defaults.syncCollaboration.presenceName),
		},
		agentTools: {
			defaultProvider: pickEnum(
				agentTools.defaultProvider,
				['codex', 'claude', 'custom'],
				defaults.agentTools.defaultProvider,
			),
			enabledProviders: pickEnumList(
				agentTools.enabledProviders,
				['codex', 'claude', 'custom'],
				defaults.agentTools.enabledProviders,
			),
			allowTerminalTools: pickBoolean(
				agentTools.allowTerminalTools,
				defaults.agentTools.allowTerminalTools,
			),
			allowFilesystemTools: pickBoolean(
				agentTools.allowFilesystemTools,
				defaults.agentTools.allowFilesystemTools,
			),
			discoverInstalledAgents: pickBoolean(
				agentTools.discoverInstalledAgents,
				defaults.agentTools.discoverInstalledAgents,
			),
			overrides: isRecord(agentTools.overrides) ? (agentTools.overrides as any) : undefined,
		},
	};
}

export function validateAppConfig(config: ProjectConfigState): ConfigValidationIssue[] {
	const issues: ConfigValidationIssue[] = [];
	const urlFields = [
		['project.apiOrigin', config.project.apiOrigin],
		['project.collabUrl', config.project.collabUrl],
		['syncCollaboration.serverUrl', config.syncCollaboration.serverUrl],
	] as const;

	for (const [path, value] of urlFields) {
		if (!value) continue;
		try {
			new URL(value);
		} catch {
			issues.push({ path, message: 'Must be an absolute URL.', severity: 'error' });
		}
	}

	if (!config.agentTools.enabledProviders.includes(config.agentTools.defaultProvider)) {
		issues.push({
			path: 'agentTools.defaultProvider',
			message: 'Default provider must also be enabled.',
			severity: 'error',
		});
	}

	if (config.syncCollaboration.autoSync && config.syncCollaboration.mode === 'off') {
		issues.push({
			path: 'syncCollaboration.autoSync',
			message: 'Auto sync is ignored while sync mode is off.',
			severity: 'warning',
		});
	}

	if (config.syncCollaboration.collaborationEnabled && !config.syncCollaboration.serverUrl) {
		issues.push({
			path: 'syncCollaboration.serverUrl',
			message: 'Collaboration requires a server URL.',
			severity: 'error',
		});
	}

	return issues;
}

function readConfig(): ProjectConfigState {
	if (!browser) return defaults;

	try {
		const value = readLocalStorage(STORAGE_KEY);
		return value ? normalizeAppConfig(JSON.parse(value)) : defaults;
	} catch {
		return defaults;
	}
}

function writeLocalConfig(config: ProjectConfigState): void {
	if (!browser) return;
	writeLocalStorage(STORAGE_KEY, JSON.stringify(config));
}

async function persistNativeConfig(config: ProjectConfigState): Promise<void> {
	if (!browser) return;
	if (!persistCommand) {
		persistence.set({
			status: 'local-only',
			lastSyncedAt: null,
			error: 'No Tauri config persistence command registered.',
		});
		return;
	}

	persistence.update((state) => ({ ...state, status: 'pending', error: null }));
	try {
		const result = await persistCommand(config);
		if (result?.ok === false) {
			persistence.set({
				status: 'error',
				lastSyncedAt: null,
				error: result.error ?? 'Tauri config persistence rejected the write.',
			});
			return;
		}
		persistence.set({ status: 'synced', lastSyncedAt: new Date().toISOString(), error: null });
	} catch (error) {
		persistence.set({
			status: 'error',
			lastSyncedAt: null,
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

function queueNativePersist(config: ProjectConfigState): void {
	if (writeQueued) return;
	writeQueued = true;
	queueMicrotask(() => {
		writeQueued = false;
		void persistNativeConfig(config);
	});
}

const initialConfig = readConfig();
lastValidConfig = validateAppConfig(initialConfig).some((issue) => issue.severity === 'error')
	? defaults
	: initialConfig;

export const appConfig = writable<ProjectConfigState>(initialConfig);
export const configPersistence = derived(persistence, ($state) => $state);
export const configValidationIssues = derived(appConfig, validateAppConfig);
export const invalidConfigState = derived(configValidationIssues, ($issues) => ({
	hasErrors: $issues.some((issue) => issue.severity === 'error'),
	hasWarnings: $issues.some((issue) => issue.severity === 'warning'),
	issues: $issues,
}));
export const configRollbackState = derived(
	[appConfig, configValidationIssues, configPersistence],
	([$config, $issues, $persistence]) => ({
		available:
			$issues.some((issue) => issue.severity === 'error') ||
			($persistence.status === 'error' && JSON.stringify($config) !== JSON.stringify(lastValidConfig)),
		lastValidConfig,
	}),
);
export const projectConfigState = derived(appConfig, ($config) => $config.project);
export const appearanceConfig = derived(appConfig, ($config) => $config.appearance);
export const validationConfig = derived(appConfig, ($config) => $config.validation);
export const syncCollaborationConfig = derived(appConfig, ($config) => $config.syncCollaboration);
export const agentToolConfig = derived(appConfig, ($config) => $config.agentTools);

if (browser) {
	appConfig.subscribe((config) => {
		writeLocalConfig(config);
		if (!validateAppConfig(config).some((issue) => issue.severity === 'error')) {
			lastValidConfig = config;
		}
		queueNativePersist(config);
	});
}

export function setConfigPersistCommand(command: ConfigPersistCommand | null): void {
	persistCommand = command;
}

/**
 * Hydrate the app config from the natively persisted Tauri config, when one
 * exists. Invalid native payloads are ignored so local/defaults stay active.
 */
export function hydrateAppConfig(raw: unknown): boolean {
	if (!isRecord(raw)) return false;
	const next = normalizeAppConfig(raw);
	if (validateAppConfig(next).some((issue) => issue.severity === 'error')) return false;
	appConfig.set(next);
	lastValidConfig = next;
	return true;
}

/**
 * Route config writes through the native Tauri app-config commands instead of
 * only localStorage, and hydrate from the native store when available.
 * Browser-preview bridges keep the localStorage-only behavior.
 */
export async function connectAppConfigBridge(bridge: {
	runtime: 'tauri' | 'browser-preview';
	appConfig: {
		read(): Promise<unknown>;
		write(config: unknown): Promise<{ ok: true } | { ok: false; message?: string }>;
	};
}): Promise<void> {
	if (bridge.runtime !== 'tauri') return;

	setConfigPersistCommand(async (config) => {
		const result = await bridge.appConfig.write(config);
		if (result.ok) return { ok: true };
		return { ok: false, error: result.message ?? 'Native app-config write was rejected.' };
	});

	try {
		const stored = await bridge.appConfig.read();
		if (hydrateAppConfig(stored)) {
			persistence.set({
				status: 'synced',
				lastSyncedAt: new Date().toISOString(),
				error: null,
			});
		}
	} catch (error) {
		persistence.set({
			status: 'error',
			lastSyncedAt: null,
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

export function updateAppConfig(updater: (config: ProjectConfigState) => ProjectConfigState): void {
	appConfig.update((config) => {
		const next = normalizeAppConfig(updater(config));
		if (!validateAppConfig(next).some((issue) => issue.severity === 'error')) {
			lastValidConfig = next;
		}
		return next;
	});
}

export function setProjectConfig(project: Partial<ProjectConfigState['project']>): void {
	updateAppConfig((config) => ({ ...config, project: { ...config.project, ...project } }));
}

export function setAppearanceConfig(appearance: Partial<ProjectConfigState['appearance']>): void {
	updateAppConfig((config) => ({
		...config,
		appearance: { ...config.appearance, ...appearance },
	}));
}

export function setValidationConfig(validation: Partial<ProjectConfigState['validation']>): void {
	updateAppConfig((config) => ({
		...config,
		validation: { ...config.validation, ...validation },
	}));
}

export function setSyncCollaborationConfig(
	syncCollaboration: Partial<ProjectConfigState['syncCollaboration']>,
): void {
	updateAppConfig((config) => ({
		...config,
		syncCollaboration: { ...config.syncCollaboration, ...syncCollaboration },
	}));
}

export function setAgentToolConfig(agentTools: Partial<ProjectConfigState['agentTools']>): void {
	updateAppConfig((config) => ({
		...config,
		agentTools: normalizeAppConfig({
			...config,
			agentTools: { ...config.agentTools, ...agentTools },
		}).agentTools,
	}));
}

export function resetAppConfig(): void {
	appConfig.set(defaults);
	lastValidConfig = defaults;
}

export function rollbackAppConfig(): void {
	const current = get(appConfig);
	if (JSON.stringify(current) === JSON.stringify(lastValidConfig)) return;
	appConfig.set(lastValidConfig);
	persistence.update((state) => ({
		...state,
		status: state.status === 'error' ? 'local-only' : state.status,
		error: null,
	}));
}
