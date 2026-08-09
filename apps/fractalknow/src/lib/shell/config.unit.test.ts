import { get } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';
import {
	appConfig,
	configPersistence,
	configRollbackState,
	connectAppConfigBridge,
	hydrateAppConfig,
	resetAppConfig,
	rollbackAppConfig,
	setProjectConfig,
} from './config';

describe('app config rollback', () => {
	it('reverts invalid settings to the last valid config snapshot', () => {
		resetAppConfig();
		setProjectConfig({ apiOrigin: 'https://example.com' });
		expect(get(appConfig).project.apiOrigin).toBe('https://example.com');

		setProjectConfig({ apiOrigin: 'not a url' });
		expect(get(configRollbackState).available).toBe(true);

		rollbackAppConfig();
		expect(get(appConfig).project.apiOrigin).toBe('https://example.com');
		expect(get(configRollbackState).available).toBe(false);
	});
});

describe('native app-config persistence', () => {
	it('hydrates config from the native store and routes writes through the bridge', async () => {
		resetAppConfig();
		const written: unknown[] = [];
		const bridge = {
			runtime: 'tauri' as const,
			appConfig: {
				read: vi.fn(async () => ({
					project: { name: 'native-project', apiOrigin: 'https://native.example.com' },
				})),
				write: vi.fn(async (config: unknown) => {
					written.push(config);
					return { ok: true as const };
				}),
			},
		};

		await connectAppConfigBridge(bridge);

		expect(get(appConfig).project.name).toBe('native-project');
		expect(get(appConfig).project.apiOrigin).toBe('https://native.example.com');

		setProjectConfig({ apiOrigin: 'https://next.example.com' });
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(bridge.appConfig.write).toHaveBeenCalled();
		expect(written.length).toBeGreaterThan(0);
		expect(get(configPersistence).status).toBe('synced');
	});

	it('rejects invalid native payloads and keeps the current config', async () => {
		resetAppConfig();
		const before = get(appConfig);

		expect(hydrateAppConfig({ project: { apiOrigin: 'not a url' } })).toBe(false);
		expect(get(appConfig)).toEqual(before);

		const browserBridge = {
			runtime: 'browser-preview' as const,
			appConfig: {
				read: vi.fn(async () => ({ project: { name: 'should-not-load' } })),
				write: vi.fn(async () => ({ ok: true as const })),
			},
		};
		await connectAppConfigBridge(browserBridge);
		expect(browserBridge.appConfig.read).not.toHaveBeenCalled();
	});
});

