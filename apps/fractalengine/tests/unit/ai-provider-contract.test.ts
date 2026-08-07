import { describe, expect, it } from 'vitest';
import * as ipc from '$lib/ipc-mock';
import { AI_PROVIDER_DEFINITIONS } from '$lib/data/aiProviders';

describe('workspace environment provider contract', () => {
	it('ships no built-in selectable model presets', () => {
		expect(AI_PROVIDER_DEFINITIONS.every(provider => !('presetModels' in provider))).toBe(true);
	});

	it('discovers an explicit API format and retains safe provider defaults', async () => {
		await ipc.writeFile('/workspace/.env', [
			'API_KEY_GEMINI=test-key',
			'API_LINK_GEMINI=https://generativelanguage.googleapis.com',
			'API_MODEL_GEMINI=gemini-test',
			'API_KEY_ROUTER=test-key',
			'API_LINK_ROUTER=https://router.example.test/v1',
			'API_MODEL_ROUTER=router-test',
			'API_FORMAT_ROUTER=anthropic',
		].join('\n'));

		await expect(ipc.readEnvProviders('/workspace')).resolves.toEqual([
			{
				provider: 'gemini',
				baseUrl: 'https://generativelanguage.googleapis.com',
				model: 'gemini-test',
				apiFormat: 'gemini',
			},
			{
				provider: 'router',
				baseUrl: 'https://router.example.test/v1',
				model: 'router-test',
				apiFormat: 'anthropic',
			},
		]);
	});

	it('streams a browser-preview response without a real provider credential', async () => {
		const chunks: string[] = [];
		const unlisten = await ipc.registerAiStreamListeners({
			onChunk: chunk => chunks.push(chunk),
			onDone: () => {},
			onError: () => {},
			onUsage: () => {},
		});

		try {
			await expect(ipc.runApiModel('deepseek', 'deepseek', 'deepseek-v4-flash-free', 'hi')).resolves.toBeUndefined();
			await new Promise(resolve => setTimeout(resolve, 180));
			expect(chunks.join('')).toContain('Hello!');
		} finally {
			await ipc.cancelAiStream();
			unlisten();
		}
	});
});
