import { maxContextTokensFor, type ModelGroup } from '$lib/data/modelContextWindows';
import { AI_PROVIDER_DEFINITIONS, isAiProvider, providerDefinition, type AiProvider } from '$lib/data/aiProviders';
import { applyApiKeyChanges, listOllamaModels, readFile, restoreApiKeyRevision, searchWorkspaceFiles as searchWorkspaceFilesIpc } from '$lib/ipc';
import { errorMessage } from '$lib/errors';
import { ideState, type CustomModelConfig } from '$lib/state/ide.svelte';
import skillsCatalogSeed from '$lib/data/skillsCatalog.json';
import type {
	ApiFormat,
	FileHit,
	ModelRecord,
	ModelRegistryApi,
	SearchWorkspaceFiles,
	SettingsBridgeApi,
	SettingsDraft,
	SkillsApi,
} from './modelRegistry.contract';

const USER_MODEL_FIELDS = {
	openai: 'customOpenAiModels',
	anthropic: 'customAnthropicModels',
	gemini: 'customGeminiModels',
	deepseek: 'customDeepSeekModels',
	xai: 'customXAiModels',
	zai: 'customZAiModels',
	ollama: 'customOllamaModels',
} as const;

type UserModelProvider = keyof typeof USER_MODEL_FIELDS;

function isUserModelProvider(providerId: AiProvider): providerId is UserModelProvider {
	return providerId in USER_MODEL_FIELDS;
}

function isApiFormat(value: string): value is ApiFormat {
	return ['openai', 'anthropic', 'gemini', 'ollama'].includes(value);
}

function localRecord(id: string, label: string, runnable: boolean, unavailableReason?: string): ModelRecord {
	return {
		providerId: 'sidecar',
		id,
		label,
		modelId: id,
		source: 'local',
		contextWindow: maxContextTokensFor(id),
		isMultimodal: false,
		runnable,
		...(unavailableReason ? { unavailableReason } : {}),
	};
}

function modelRecordFromGroup(
	providerId: AiProvider,
	id: string,
	label: string,
): ModelRecord {
	if (providerId === 'sidecar') {
		if (id === 'custom-local-gguf') {
			return localRecord(id, label, !!ideState.localGgufModelPath, 'Choose a GGUF model in Settings');
		}
		if (id === 'custom-local-mlx') {
			return localRecord(id, label, !!ideState.localMlxModelPath, 'Choose an MLX model in Settings');
		}
		const model = ideState.recommendedModels.find(candidate => candidate.id === id);
		return localRecord(id, label, !!model?.localPath, 'Not downloaded');
	}

	if (providerId === 'custom') {
		const config = ideState.customModels.find(candidate => candidate.id === id);
		return {
			providerId,
			id,
			label,
			modelId: config?.modelId ?? id,
			source: 'custom',
			...(config && isApiFormat(config.apiFormat) ? { apiFormat: config.apiFormat } : {}),
			...(config?.baseUrl ? { baseUrl: config.baseUrl } : {}),
			...(config?.credentialId ? { credentialId: config.credentialId } : {}),
			contextWindow: maxContextTokensFor(config?.modelId ?? id),
			isMultimodal: config?.isMultimodal ?? false,
			runnable: !!config,
			...(!config ? { unavailableReason: 'Model configuration is missing' } : {}),
		};
	}

	if (providerId === 'env') {
		const provider = ideState.envProviders.find(candidate => candidate.provider === id);
		return {
			providerId,
			id,
			label,
			modelId: provider?.model ?? id,
			source: 'env',
			...(provider?.apiFormat ? { apiFormat: provider.apiFormat } : {}),
			...(provider?.baseUrl ? { baseUrl: provider.baseUrl } : {}),
			contextWindow: maxContextTokensFor(provider?.model ?? id),
			isMultimodal: false,
			runnable: !!provider?.model,
			...(!provider?.model ? { unavailableReason: `Set API_MODEL_${id.toUpperCase()} in .env` } : {}),
		};
	}

	return {
		providerId,
		id,
		label,
		modelId: id,
		source: 'user',
		contextWindow: maxContextTokensFor(id),
		isMultimodal: false,
		runnable: true,
	};
}

function modelRecords(): ModelRecord[] {
	const records: ModelRecord[] = [];
	for (const providerId of Object.keys(USER_MODEL_FIELDS) as UserModelProvider[]) {
		for (const id of ideState[USER_MODEL_FIELDS[providerId]]) {
			records.push({ providerId, id, label: id, modelId: id, source: 'user', contextWindow: maxContextTokensFor(id), isMultimodal: false, runnable: true });
		}
	}
	for (const model of ideState.recommendedModels) {
		if (model.localPath) records.push(localRecord(model.id, model.name, true));
	}
	for (const model of ideState.localModels) records.push(localRecord(model.id, model.name, true));
	if (ideState.localGgufModelPath) records.push(localRecord('custom-local-gguf', 'Custom GGUF (Local)', true));
	if (ideState.localMlxModelPath) records.push(localRecord('custom-local-mlx', 'Custom MLX (Local)', true));
	for (const provider of ideState.envProviders) records.push(modelRecordFromGroup('env', provider.provider, `${provider.provider}${provider.model ? ` · ${provider.model}` : ''}`));
	for (const model of ideState.customModels) records.push(modelRecordFromGroup('custom', model.id, model.name));
	return records.filter((record, index, all) => all.findIndex(other => other.providerId === record.providerId && other.id === record.id) === index);
}

function groupsFromRecords(records: ModelRecord[]): ModelGroup[] {
	const groups = new Map<string, ModelGroup>();
	for (const record of records) {
		const label = record.providerId === 'sidecar' ? 'Local Sidecar'
			: record.providerId === 'env' ? '.env'
			: record.providerId === 'custom' ? 'Custom'
			: providerDefinition(record.providerId).label;
		const group = groups.get(label) ?? { label, options: [] };
		group.options.push({ id: record.id, label: record.label, provider: record.providerId });
		groups.set(label, group);
	}
	return [...groups.values()];
}

function baseUrls(): SettingsDraft['baseUrls'] {
	return {
		openai: ideState.aiBaseUrlOpenAI,
		anthropic: ideState.aiBaseUrlAnthropic,
		gemini: ideState.aiBaseUrlGemini,
		deepseek: ideState.aiBaseUrlDeepSeek,
		xai: ideState.aiBaseUrlXAI,
		zai: ideState.aiBaseUrlZAi,
		ollama: ideState.aiBaseUrlOllama,
	};
}

function userModels(): SettingsDraft['userModels'] {
	return {
		openai: [...ideState.customOpenAiModels],
		anthropic: [...ideState.customAnthropicModels],
		gemini: [...ideState.customGeminiModels],
		deepseek: [...ideState.customDeepSeekModels],
		xai: [...ideState.customXAiModels],
		zai: [...ideState.customZAiModels],
		ollama: [...ideState.customOllamaModels],
	};
}

function customModels(): SettingsDraft['customModels'] {
	return ideState.customModels.map(model => ({
		id: model.id,
		credentialId: model.credentialId,
		name: model.name,
		provider: model.provider,
		modelId: model.modelId,
		...(model.baseUrl ? { baseUrl: model.baseUrl } : {}),
		apiFormat: model.apiFormat,
		isMultimodal: model.isMultimodal,
		...(model.isFullUrl !== undefined ? { isFullUrl: model.isFullUrl } : {}),
	}));
}

function validateHttpUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}

function applyBaseUrls(urls: SettingsDraft['baseUrls']): void {
	if (urls.openai !== undefined) ideState.aiBaseUrlOpenAI = urls.openai;
	if (urls.anthropic !== undefined) ideState.aiBaseUrlAnthropic = urls.anthropic;
	if (urls.gemini !== undefined) ideState.aiBaseUrlGemini = urls.gemini;
	if (urls.deepseek !== undefined) ideState.aiBaseUrlDeepSeek = urls.deepseek;
	if (urls.xai !== undefined) ideState.aiBaseUrlXAI = urls.xai;
	if (urls.zai !== undefined) ideState.aiBaseUrlZAi = urls.zai;
	if (urls.ollama !== undefined) ideState.aiBaseUrlOllama = urls.ollama;
}

function applyUserModels(models: SettingsDraft['userModels']): void {
	for (const providerId of Object.keys(USER_MODEL_FIELDS) as UserModelProvider[]) {
		const modelsForProvider = models[providerId];
		if (modelsForProvider === undefined) continue;
		ideState[USER_MODEL_FIELDS[providerId]] = [...new Set(modelsForProvider.map(model => model.trim()).filter(Boolean))];
	}
}

function applyCustomModels(models: SettingsDraft['customModels']): void {
	ideState.customModels = models.map(model => ({
		id: model.id,
		credentialId: model.credentialId,
		name: model.name,
		provider: model.provider,
		modelId: model.modelId,
		...(model.baseUrl ? { baseUrl: model.baseUrl } : {}),
		apiFormat: model.apiFormat,
		isMultimodal: model.isMultimodal,
		...(model.isFullUrl !== undefined ? { isFullUrl: model.isFullUrl } : {}),
	} satisfies CustomModelConfig));
}

export const modelRegistry: ModelRegistryApi = {
	records: modelRecords,
	groups: (): ModelGroup[] => groupsFromRecords(modelRecords()),
	active: () => {
		const activeId = ideState.activeModelValue;
		return modelRecords().find(record =>
			record.providerId === ideState.aiProvider && record.id === activeId,
		) ?? null;
	},
	setActive: (providerId, id) => ideState.onSelectModel(providerId, id),
	addUserModel: (providerId, modelId) => {
		if (!isUserModelProvider(providerId)) return;
		const name = modelId.trim();
		if (!name) return;
		const field = USER_MODEL_FIELDS[providerId];
		if (ideState[field].includes(name)) return;
		ideState.pushUndo();
		ideState[field] = [...ideState[field], name];
		ideState.saveSettings();
	},
	removeUserModel: (providerId, modelId) => {
		if (!isUserModelProvider(providerId)) return;
		const field = USER_MODEL_FIELDS[providerId];
		if (!ideState[field].includes(modelId)) return;
		ideState.pushUndo();
		ideState[field] = ideState[field].filter(model => model !== modelId);
		ideState.saveSettings();
	},
	refreshOllamaModels: async () => {
		const models = await listOllamaModels(ideState.aiBaseUrlOllama || providerDefinition('ollama').defaultBaseUrl);
		const before = ideState.customOllamaModels.join('\n');
		const next = [...new Set(models.map(model => model.trim()).filter(Boolean))];
		if (before !== next.join('\n')) {
			ideState.pushUndo();
			ideState.customOllamaModels = next;
			ideState.saveSettings(false);
		}
	},
	contextWindowFor: (_providerId, id) => maxContextTokensFor(id),
};

export const settingsBridge: SettingsBridgeApi = {
	captureSettingsDraft: () => ({
		aiProvider: ideState.aiProvider,
		activeModel: ideState.activeModelValue
			? { providerId: ideState.aiProvider, id: ideState.activeModelValue }
			: null,
		baseUrls: baseUrls(),
		userModels: userModels(),
		customModels: customModels(),
		localGgufModelPath: ideState.localGgufModelPath,
		localMmprojPath: ideState.localMmprojPath,
		localMlxModelPath: ideState.localMlxModelPath,
		pendingCredentials: {},
	}),
	commitSettingsDraft: async draft => {
		const beforeSave = ideState.captureSnapshot();
		const beforeCredentialRevision = ideState.credentialRevision;
		let mutationStarted = false;
		let credentialMutationStarted = false;
		try {
			const configuredUrls = Object.values(draft.baseUrls).filter((url): url is string => !!url);
			if (configuredUrls.some(url => !validateHttpUrl(url))) {
				throw new Error('Provider URLs must use HTTP or HTTPS.');
			}

			// A model record must never become selectable before its keychain credential has
			// been written and verified by native code. The previous ordering persisted the
			// record first, so an interrupted or ineffective keychain write left a convincing
			// success UI around a permanently unusable model.
			const credentialRevision = await applyApiKeyChanges(
				Object.entries(draft.pendingCredentials).map(([credentialId, key]) => ({ credentialId, key })),
			);
			credentialMutationStarted = Object.keys(draft.pendingCredentials).length > 0;

			ideState.pushUndo();
			mutationStarted = true;
			ideState.aiProvider = draft.aiProvider;
			applyBaseUrls(draft.baseUrls);
			applyUserModels(draft.userModels);
			applyCustomModels(draft.customModels);
			ideState.localGgufModelPath = draft.localGgufModelPath;
			ideState.localMmprojPath = draft.localMmprojPath;
			ideState.localMlxModelPath = draft.localMlxModelPath;

			if (draft.activeModel) {
				if (!isAiProvider(draft.activeModel.providerId)) {
					throw new Error(`Unknown AI provider "${draft.activeModel.providerId}"`);
				}
				ideState.aiProvider = draft.activeModel.providerId;
				if (draft.activeModel.providerId === 'sidecar') {
					ideState.selectedModelId = draft.activeModel.id;
				} else {
					ideState.activeApiModel = draft.activeModel.id;
				}
			} else {
				ideState.activeApiModel = '';
				ideState.selectedModelId = '';
			}

			ideState.credentialRevision = credentialRevision;
			ideState.saveSettings(false);
		} catch (error) {
			if (mutationStarted) ideState.rollbackToSnapshot(beforeSave);
			// If renderer persistence fails after a successful native write, put the
			// keychain back exactly where it was. An orphaned credential is safer than a
			// selectable record with no credential, but this rollback avoids both states.
			if (credentialMutationStarted) {
				try {
					await restoreApiKeyRevision(beforeCredentialRevision);
					ideState.credentialRevision = beforeCredentialRevision;
				} catch (restoreError) {
					ideState.addLog(`Failed to roll back API credential changes: ${errorMessage(restoreError)}`, 'error');
				}
			}
			throw error;
		}
	},
};

export const skillsApi: SkillsApi = {
	catalog: () => ideState.skillsCatalog,
	loadCatalog: async () => {
		if (ideState.skillsCatalog.length > 0) return;
		const installed = new Set<string>();
		if (typeof localStorage !== 'undefined') {
			for (let index = 0; index < localStorage.length; index += 1) {
				const key = localStorage.key(index);
				if (key?.startsWith('skill:installed:') && localStorage.getItem(key) === 'true') installed.add(key.slice('skill:installed:'.length));
			}
		}
		const catalog = await Promise.all(skillsCatalogSeed.map(async skill => {
			let isInstalled = installed.has(skill.name);
			if (!isInstalled && ideState.rootPath) {
				try { await readFile(`${ideState.rootPath}/agents/skills/${skill.name}/SKILL.md`); isInstalled = true; } catch { /* absent skills are expected */ }
			}
			return { ...skill, installed: isInstalled };
		}));
		ideState.skillsCatalog = catalog;
	},
	install: skill => ideState.installSkillFromMarketplace(skill),
};

export const searchWorkspaceFiles: SearchWorkspaceFiles = async (query, limit = 8): Promise<FileHit[]> => {
	if (!ideState.rootPath) return [];
	const entries = await searchWorkspaceFilesIpc(ideState.rootPath, query, limit);
	return entries.map(entry => ({ path: entry.path, name: entry.name }));
};
