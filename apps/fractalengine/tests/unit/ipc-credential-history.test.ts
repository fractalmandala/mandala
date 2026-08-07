import { beforeEach, describe, expect, it } from 'vitest';
import { applyApiKeyChanges, restoreApiKeyRevision, runApiModel } from '../../src/lib/ipc-mock';

const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
	configurable: true,
	value: {
		clear: () => values.clear(),
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value),
		removeItem: (key: string) => values.delete(key)
	}
});

describe('mock credential revision history', () => {
	beforeEach(() => localStorage.clear());

	it('restores secrets for undo and redo without returning them through IPC', async () => {
		localStorage.setItem('ide:apikey:openai', 'old-secret');
		const revision = await applyApiKeyChanges([{ credentialId: 'openai', key: 'new-secret' }]);
		expect(revision).toBe(1);
		expect(localStorage.getItem('ide:apikey:openai')).toBe('new-secret');

		await restoreApiKeyRevision(0);
		expect(localStorage.getItem('ide:apikey:openai')).toBe('old-secret');

		await restoreApiKeyRevision(revision);
		expect(localStorage.getItem('ide:apikey:openai')).toBe('new-secret');
	});

	it('rejects a custom model whose credential was not persisted', async () => {
		await expect(runApiModel(
			'openai',
			'custom-model-missing-credential',
			'test-model',
			'hello',
		)).rejects.toThrow('No keychain credential found for custom-model-missing-credential');
	});
});
