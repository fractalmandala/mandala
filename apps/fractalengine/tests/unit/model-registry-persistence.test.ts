import { describe, expect, it } from 'vitest';
import {
	MODEL_REGISTRY_STORAGE_KEY,
	readStoredModelRegistry,
	type StoredModelRegistry,
} from '$lib/state/ide.svelte';

function storageFrom(entries: Record<string, string>): Pick<Storage, 'getItem'> {
	return {
		getItem: key => entries[key] ?? null,
	};
}

function emptyRegistry(): StoredModelRegistry {
	return {
		version: 2,
		activeModel: null,
		baseUrls: {},
		userModels: {},
		customModels: [],
		localModels: [],
		localGgufModelPath: '',
		localMmprojPath: '',
		localMlxModelPath: '',
		recommendedLocalPaths: {},
	};
}

describe('model registry persistence', () => {
	it('reads the v2 registry', () => {
		const registry = emptyRegistry();
		expect(readStoredModelRegistry(storageFrom({
			[MODEL_REGISTRY_STORAGE_KEY]: JSON.stringify(registry),
		}))).toEqual(registry);
	});

	it('does not import contaminated v1 or scattered seeded model keys', () => {
		const legacyRegistry = {
			...emptyRegistry(),
			version: 1,
			userModels: { openai: ['gpt-4o'], deepseek: ['deepseek-chat'] },
		};
		const storage = storageFrom({
			'ide:settings:model-registry@v1': JSON.stringify(legacyRegistry),
			'ide:settings:models-openai': JSON.stringify(['gpt-4o', 'gpt-4o-mini']),
			'ide:settings:custom-models': JSON.stringify([{ name: 'OpenCode' }]),
		});

		expect(readStoredModelRegistry(storage)).toBeNull();
	});

	it('rejects a malformed v2 record instead of partially applying it', () => {
		expect(() => readStoredModelRegistry(storageFrom({
			[MODEL_REGISTRY_STORAGE_KEY]: JSON.stringify({ version: 2, userModels: {} }),
		}))).toThrow('Expected a valid model registry');
	});
});
