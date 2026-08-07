// Cross-stream contract for the unified model registry (AI-LAYER-REMEDIATION-PLAN).
// FROZEN: Stream A implements, Stream B consumes. Do not rename exports.
import type { ModelGroup } from '$lib/data/modelContextWindows';
import type { AiProvider } from '$lib/data/aiProviders';
import type { SkillEntry } from '$lib/state/ide.svelte';

export type ModelSource = 'preset' | 'user' | 'custom' | 'env' | 'local';
export type ApiFormat = 'openai' | 'anthropic' | 'gemini' | 'ollama';

// One selectable row in the model picker / settings. Identity = (providerId, id).
export interface ModelRecord {
	providerId: AiProvider;
	id: string;
	label: string;
	modelId: string;
	source: ModelSource;
	apiFormat?: ApiFormat;
	baseUrl?: string;
	credentialId?: string;
	contextWindow: number;
	isMultimodal: boolean;
	runnable: boolean;
	unavailableReason?: string;
}

export interface CustomModelDraft {
	name: string;
	provider: string;
	modelId: string;
	baseUrl?: string;
	apiFormat: ApiFormat;
	isMultimodal: boolean;
	isFullUrl?: boolean;
}

// Read API + kernel mutators. Mutators are one atomic undo entry each (Rule 9).
export interface ModelRegistryApi {
	records(): ModelRecord[];
	groups(): ModelGroup[];
	active(): ModelRecord | null;
	setActive(providerId: string, id: string): void;
	addUserModel(providerId: AiProvider, modelId: string): void;
	removeUserModel(providerId: AiProvider, modelId: string): void;
	refreshOllamaModels(): Promise<void>;
	contextWindowFor(providerId: string, id: string): number;
}

// Transactional settings save: SettingsDialog edits a draft copy and commits once.
// commit = pushUndo → apply → saveSettings → applyApiKeyChanges → rollback on error.
export interface SettingsDraft {
	aiProvider: AiProvider;
	activeModel: { providerId: string; id: string } | null;
	baseUrls: Partial<Record<AiProvider, string>>;
	userModels: Partial<Record<AiProvider, string[]>>;
	customModels: Array<CustomModelDraft & { id: string; credentialId: string }>;
	localGgufModelPath: string;
	localMmprojPath: string;
	localMlxModelPath: string;
	// credentialId → plaintext key, held only in component memory until commit
	pendingCredentials: Record<string, string>;
}

export interface SettingsBridgeApi {
	captureSettingsDraft(): SettingsDraft;
	commitSettingsDraft(draft: SettingsDraft): Promise<void>;
}

export interface SkillsApi {
	catalog(): SkillEntry[];
	loadCatalog(): Promise<void>;
	install(skill: SkillEntry): Promise<void>;
}

export interface FileHit {
	path: string;
	name: string;
}

export type SearchWorkspaceFiles = (query: string, limit?: number) => Promise<FileHit[]>;
