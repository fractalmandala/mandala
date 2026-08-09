import { beforeEach, describe, expect, it, vi } from 'vitest';

// Matches Rust serde rename_all = "camelCase" on DesktopConfig.
const tauriConfig = {
	collabUrl: 'http://127.0.0.1:3000',
	apiOrigin: 'https://api.example.test',
	projectPath: '/tmp/fractalknow',
	projectName: 'fractalknow',
	mode: 'editor',
	e2eSmoke: false,
	singleFile: false,
	initialDoc: '/content/Welcome.md',
	freshlyCreated: false,
	startupTraceparent: null,
	ptyAvailable: true,
};

describe('desktop bridge runtime selection', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.restoreAllMocks();
	});

	it('uses browser-preview fallbacks when Tauri APIs are unavailable', async () => {
		vi.doMock('@tauri-apps/api/core', () => ({
			invoke: vi.fn(async () => {
				throw new Error('missing tauri runtime');
			}),
		}));

		const { createDesktopBridge } = await import('./bridge');
		const bridge = await createDesktopBridge();

		expect(bridge.runtime).toBe('browser-preview');
		await expect(bridge.projects.create({ path: '/tmp/new', name: 'New' })).resolves.toMatchObject({
			ok: false,
			feature: 'projects.create',
		});
		await expect(bridge.shell.detectProtocol('fractalknow')).resolves.toMatchObject({
			ok: false,
			feature: 'shell.detectProtocol',
		});
	});

	it('uses Tauri commands and normalizes listener payloads when Tauri APIs are available', async () => {
		const invoke = vi.fn(async (command: string) => {
			if (command === 'desktop_config') return tauriConfig;
			if (command === 'app_info') {
				return {
					name: 'FractalKnow',
					desktopRuntime: 'Tauri v2',
					frontendRuntime: 'SvelteKit SPA',
					styling: 'tab-indented Sass',
					os: 'macos',
					arch: 'aarch64',
					appVersion: '0.1.0',
				};
			}
			if (command === 'startup_deep_link') return 'fractalknow://open?path=/content/Welcome.md';
			if (command === 'read_recent_projects') {
				return [
					{
						path: '/tmp/fractalknow',
						name: 'fractalknow',
						source: 'desktop-config',
						openedAt: '2026-07-31T00:00:00.000Z',
					},
				];
			}
			return { ok: true };
		});
		const stopListening = vi.fn();
		const listen = vi.fn(async (_eventName: string, callback: (event: { payload: unknown }) => void) => {
			callback({
				payload: {
					status: 'running',
					url: 'http://127.0.0.1:3000',
					changed_at: '2026-07-31T00:00:00.000Z',
				},
			});
			return stopListening;
		});
		const open = vi.fn(async () => '/tmp/project');
		const openUrl = vi.fn(async () => undefined);

		vi.doMock('@tauri-apps/api/core', () => ({ invoke }));
		vi.doMock('@tauri-apps/api/event', () => ({ listen }));
		vi.doMock('@tauri-apps/plugin-dialog', () => ({ open }));
		vi.doMock('@tauri-apps/plugin-opener', () => ({ openUrl }));

		const { createDesktopBridge } = await import('./bridge');
		const bridge = await createDesktopBridge();

		expect(bridge.runtime).toBe('tauri');
		expect(bridge.config).toMatchObject({ projectName: 'fractalknow', ptyAvailable: true });
		await expect(bridge.appInfo()).resolves.toMatchObject({ desktopRuntime: 'Tauri v2' });
		await expect(bridge.projects.readRecent()).resolves.toEqual([
			expect.objectContaining({ path: '/tmp/fractalknow', openedAt: '2026-07-31T00:00:00.000Z' }),
		]);
		await expect(bridge.dialog.openFolder({ defaultPath: '/tmp' })).resolves.toBe('/tmp/project');
		await bridge.shell.openExternal('https://example.test');

		const onServerStatus = vi.fn();
		const unsubscribe = bridge.onServerStatus(onServerStatus);
		await vi.waitFor(() => {
			expect(onServerStatus).toHaveBeenCalledWith(expect.objectContaining({ status: 'running' }));
		});

		expect(invoke).toHaveBeenCalledWith('desktop_config', undefined);
		expect(open).toHaveBeenCalledWith({ directory: true, multiple: false, defaultPath: '/tmp' });
		expect(openUrl).toHaveBeenCalledWith('https://example.test');
		expect(onServerStatus).toHaveBeenCalledWith(expect.objectContaining({ status: 'running' }));

		unsubscribe();
		expect(stopListening).toHaveBeenCalled();
	});
});
