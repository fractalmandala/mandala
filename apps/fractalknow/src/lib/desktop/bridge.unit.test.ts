import { describe, expect, it, vi } from 'vitest';
import { createDesktopBridge, desktopBridgeNormalizers } from './bridge';

describe('desktop bridge normalizers', () => {
	it('normalizes Tauri config, app info, and protocol payloads into the app-facing shape', () => {
		// snake_case legacy / test fixtures
		expect(
			desktopBridgeNormalizers.config({
				collab_url: 'http://127.0.0.1:3000',
				api_origin: 'https://api.example.test',
				project_path: '/tmp/fractalknow',
				project_name: 'fractalknow',
				mode: 'editor',
				e2e_smoke: true,
				single_file: false,
				initial_doc: '/content/Welcome.md',
				freshly_created: true,
				startup_traceparent: '00-trace',
				pty_available: true,
			}),
		).toEqual({
			collabUrl: 'http://127.0.0.1:3000',
			apiOrigin: 'https://api.example.test',
			projectPath: '/tmp/fractalknow',
			projectName: 'fractalknow',
			mode: 'editor',
			e2eSmoke: true,
			singleFile: false,
			initialDoc: '/content/Welcome.md',
			freshlyCreated: true,
			startupTraceparent: '00-trace',
			ptyAvailable: true,
		});

		// camelCase is what Rust serde rename_all emits at runtime
		expect(
			desktopBridgeNormalizers.config({
				collabUrl: 'http://127.0.0.1:3000',
				apiOrigin: 'https://api.example.test',
				projectPath: '/tmp/fractalknow',
				projectName: 'fractalknow',
				mode: 'editor',
				e2eSmoke: true,
				singleFile: false,
				initialDoc: '/content/Welcome.md',
				freshlyCreated: true,
				startupTraceparent: '00-trace',
				ptyAvailable: true,
			}),
		).toEqual({
			collabUrl: 'http://127.0.0.1:3000',
			apiOrigin: 'https://api.example.test',
			projectPath: '/tmp/fractalknow',
			projectName: 'fractalknow',
			mode: 'editor',
			e2eSmoke: true,
			singleFile: false,
			initialDoc: '/content/Welcome.md',
			freshlyCreated: true,
			startupTraceparent: '00-trace',
			ptyAvailable: true,
		});

		expect(
			desktopBridgeNormalizers.appInfo({
				name: 'FractalKnow',
				desktop_runtime: 'Tauri v2',
				frontend_runtime: 'SvelteKit SPA',
				styling: 'tab-indented Sass',
				os: 'macos',
				arch: 'aarch64',
				app_version: '0.1.0',
			}),
		).toEqual({
			name: 'FractalKnow',
			desktopRuntime: 'Tauri v2',
			frontendRuntime: 'SvelteKit SPA',
			styling: 'tab-indented Sass',
			os: 'macos',
			arch: 'aarch64',
			appVersion: '0.1.0',
		});

		expect(
			desktopBridgeNormalizers.appInfo({
				name: 'FractalKnow',
				desktopRuntime: 'Tauri v2',
				frontendRuntime: 'SvelteKit SPA',
				styling: 'tab-indented Sass',
				os: 'macos',
				arch: 'aarch64',
				appVersion: '0.1.0',
			}),
		).toEqual({
			name: 'FractalKnow',
			desktopRuntime: 'Tauri v2',
			frontendRuntime: 'SvelteKit SPA',
			styling: 'tab-indented Sass',
			os: 'macos',
			arch: 'aarch64',
			appVersion: '0.1.0',
		});

		expect(desktopBridgeNormalizers.protocolDetection({ installed: true, display_name: 'Claude' })).toEqual({
			installed: true,
			displayName: 'Claude',
		});
		expect(desktopBridgeNormalizers.protocolDetection({ installed: true, displayName: 'Claude' })).toEqual({
			installed: true,
			displayName: 'Claude',
		});
	});

	it('normalizes desktop event payloads with snake_case or missing fields', () => {
		expect(
			desktopBridgeNormalizers.deepLinkEvent({
				url: 'fractalknow://open?path=/content/Welcome.md',
				received_at: '2026-07-30T00:00:00.000Z',
			}),
		).toEqual({
			url: 'fractalknow://open?path=/content/Welcome.md',
			receivedAt: '2026-07-30T00:00:00.000Z',
		});

		expect(
			desktopBridgeNormalizers.updateStatusEvent({
				status: 'available',
				version: '0.2.0',
				message: 'Ready',
				checked_at: '2026-07-30T00:00:01.000Z',
			}),
		).toEqual({
			status: 'available',
			version: '0.2.0',
			message: 'Ready',
			checkedAt: '2026-07-30T00:00:01.000Z',
		});

		expect(desktopBridgeNormalizers.serverStatusEvent({ status: 'running', url: '' })).toMatchObject({
			status: 'running',
			url: null,
			message: null,
		});

		expect(desktopBridgeNormalizers.crashInviteEvent({ reason: 'Recovered', report_path: '' })).toMatchObject({
			reason: 'Recovered',
			reportPath: null,
		});

		expect(desktopBridgeNormalizers.consentRequiredEvent({ message: 'Allow updates?' })).toMatchObject({
			scope: 'filesystem',
			message: 'Allow updates?',
		});
	});

	it('filters invalid recent-project payloads and preserves unsupported feature responses', () => {
		expect(
			desktopBridgeNormalizers.recentProjects([
				{
					path: '/tmp/one',
					name: 'One',
					source: 'folder-picker',
					opened_at: '2026-07-30T00:00:00.000Z',
				},
				{ path: '/tmp/missing-name' },
				null,
			]),
		).toEqual([
			{
				path: '/tmp/one',
				name: 'One',
				source: 'folder-picker',
				openedAt: '2026-07-30T00:00:00.000Z',
			},
		]);

		expect(
			desktopBridgeNormalizers.isUnsupportedFeature({
				ok: false,
				reason: 'not-implemented',
				feature: 'terminal.start',
			}),
		).toBe(true);

		expect(desktopBridgeNormalizers.bugReportCapture({ report_path: '/tmp/report.zip' })).toMatchObject({
			reportPath: '/tmp/report.zip',
		});

		expect(desktopBridgeNormalizers.feedbackHandoff({ target: 'native-share' })).toEqual({
			target: 'native-share',
			url: null,
		});
	});
});

describe('browser-preview desktop bridge fallback', () => {
	it('returns browser metadata and explicit unsupported results for native-only commands', async () => {
		const bridge = await createDesktopBridge();

		expect(bridge.runtime).toBe('browser-preview');
		await expect(bridge.appInfo()).resolves.toMatchObject({
			desktopRuntime: 'browser preview',
			styling: 'tab-indented Sass',
		});
		await expect(bridge.updater.checkStatus()).resolves.toMatchObject({
			ok: false,
			feature: 'updater.checkStatus',
		});
		await expect(bridge.terminal.start({ id: 'terminal-1' })).resolves.toMatchObject({
			ok: false,
			feature: 'terminal.start',
		});
		await expect(bridge.projects.readRecent()).resolves.toMatchObject({
			ok: false,
			feature: 'projects.readRecent',
		});
		await expect(bridge.feedback.submitFeedback('hello')).resolves.toEqual({
			target: 'external-url',
			url: 'https://github.com/inkeep/open-knowledge/issues?body=hello',
		});
		await expect(bridge.dialog.openFolder()).resolves.toBeNull();
	});

	it('emits browser fallback events and returns unsubscribe functions', async () => {
		window.history.replaceState(null, '', '/?deep_link=fractalknow%3A%2F%2Fopen%3Fpath%3D%2Fcontent%2FWelcome.md');
		const bridge = await createDesktopBridge();
		const onDeepLink = vi.fn();
		const onUpdate = vi.fn();
		const onServer = vi.fn();

		const unsubscribeDeepLink = bridge.onDeepLink(onDeepLink);
		const unsubscribeUpdate = bridge.onUpdateStatus(onUpdate);
		const unsubscribeServer = bridge.onServerStatus(onServer);

		expect(unsubscribeDeepLink).toBeTypeOf('function');
		expect(unsubscribeUpdate).toBeTypeOf('function');
		expect(unsubscribeServer).toBeTypeOf('function');

		await new Promise<void>((resolve) => queueMicrotask(() => resolve()));

		expect(onDeepLink).toHaveBeenCalledWith(
			expect.objectContaining({
				url: 'fractalknow://open?path=/content/Welcome.md',
			}),
		);
		expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: 'idle' }));
		expect(onServer).toHaveBeenCalledWith(expect.objectContaining({ status: 'stopped' }));

		unsubscribeDeepLink();
		unsubscribeUpdate();
		unsubscribeServer();
	});
});

describe('Tauri desktop bridge command smoke tests', () => {
	it('invokes Tauri commands with the app-facing facade payloads', async () => {
		vi.resetModules();
		const invoke = vi.fn(async (command: string, args?: Record<string, unknown>) => {
			if (command === 'desktop_config') {
				return {
					collab_url: '',
					api_origin: '',
					project_path: '/tmp/fractalknow',
					project_name: 'fractalknow',
					mode: 'navigator',
					e2e_smoke: false,
					single_file: false,
					initial_doc: null,
					freshly_created: false,
					pty_available: false,
				};
			}
			if (command === 'app_info') {
				return {
					name: 'FractalKnow',
					desktop_runtime: 'Tauri v2',
					frontend_runtime: 'SvelteKit SPA',
					styling: 'tab-indented Sass',
					os: 'macos',
					arch: 'aarch64',
					app_version: '0.1.0',
				};
			}
			if (command === 'check_update_status') {
				return {
					ok: false,
					reason: 'missing-backend',
					feature: 'updater.checkStatus',
				};
			}
			if (command === 'read_recent_projects') {
				return [
					{
						path: '/tmp/fractalknow',
						name: 'fractalknow',
						source: 'desktop-config',
						opened_at: '2026-07-31T00:00:00.000Z',
					},
				];
			}
			if (command === 'submit_feedback') {
				return {
					target: 'external-url',
					url: 'https://github.com/inkeep/open-knowledge/issues',
				};
			}
			if (command === 'get_menu_enablement') {
				return {};
			}
			if (command === 'list_crash_reports') {
				return [];
			}
			if (command === 'read_crash_report') {
				return null;
			}
			if (command === 'request_consent') {
				return false;
			}
			if (command === 'grant_consent') {
				return { ok: true };
			}
			if (
				command === 'start_local_server' ||
				command === 'stop_local_server' ||
				command === 'local_server_status'
			) {
				return { ok: false, reason: 'not-implemented', feature: command };
			}
			if (command === 'simulate_panic') {
				return { ok: true };
			}
			return { ok: true };
		});
		const listen = vi.fn(async () => vi.fn());

		vi.doMock('@tauri-apps/api/core', () => ({ invoke }));
		vi.doMock('@tauri-apps/api/event', () => ({ listen }));

		const { createDesktopBridge: createTauriDesktopBridge } = await import('./bridge');
		const bridge = await createTauriDesktopBridge();

		await expect(bridge.appInfo()).resolves.toMatchObject({
			desktopRuntime: 'Tauri v2',
		});
		await expect(bridge.updater.checkStatus()).resolves.toMatchObject({
			ok: false,
			feature: 'updater.checkStatus',
		});
		await bridge.setThemeSource('dark');
		await bridge.signalThemeApplied({ reducedTransparency: true });
		await bridge.terminal.start({ id: 'terminal-1', cwd: '/tmp/fractalknow', shell: 'zsh' });
		await bridge.terminal.write({ id: 'terminal-1', data: 'pwd\n' });
		await bridge.terminal.stop({ id: 'terminal-1' });
		await bridge.projects.create({ path: '/tmp/fractalknow', name: 'fractalknow' });
		await expect(bridge.projects.readRecent()).resolves.toEqual([
			{
				path: '/tmp/fractalknow',
				name: 'fractalknow',
				source: 'desktop-config',
				openedAt: '2026-07-31T00:00:00.000Z',
			},
		]);
		await bridge.projects.writeRecent([
			{
				path: '/tmp/fractalknow',
				name: 'fractalknow',
				source: 'desktop-config',
				openedAt: '2026-07-31T00:00:00.000Z',
			},
		]);
		await bridge.feedback.captureBugReport();
		await bridge.feedback.submitFeedback('bridge smoke');
		await bridge.shell.detectProtocol('fractalknow');
		await bridge.setMenuEnablement({ 'save-version': true, 'kill-terminal': false });
		await expect(bridge.getMenuEnablement()).resolves.toEqual({});
		await expect(bridge.crash.listReports()).resolves.toEqual([]);
		await expect(bridge.crash.readReport('missing')).resolves.toBeNull();
		await expect(bridge.consent.request('updates', 'Allow updates?')).resolves.toBe(false);
		await bridge.consent.grant('updates', true);
		await expect(
			bridge.server.start({
				command: 'echo',
				args: ['hello'],
				env: {},
				healthUrl: null,
				healthTimeoutMs: null,
				cwd: null,
			}),
		).resolves.toMatchObject({ ok: false });
		await expect(bridge.server.stop()).resolves.toMatchObject({ ok: false });
		await expect(bridge.server.status()).resolves.toMatchObject({ ok: false });
		await bridge.crash.simulatePanic();

		expect(invoke).toHaveBeenCalledWith('desktop_config', undefined);
		expect(invoke).toHaveBeenCalledWith('set_theme_source', { source: 'dark' });
		expect(invoke).toHaveBeenCalledWith('theme_applied', {
			opts: { reducedTransparency: true },
		});
		expect(invoke).toHaveBeenCalledWith('terminal_start', {
			opts: { id: 'terminal-1', cwd: '/tmp/fractalknow', shell: 'zsh' },
		});
		expect(invoke).toHaveBeenCalledWith('terminal_write', {
			opts: { id: 'terminal-1', data: 'pwd\n' },
		});
		expect(invoke).toHaveBeenCalledWith('terminal_stop', { opts: { id: 'terminal-1' } });
		expect(invoke).toHaveBeenCalledWith('create_project', {
			opts: { path: '/tmp/fractalknow', name: 'fractalknow' },
		});
		expect(invoke).toHaveBeenCalledWith('write_recent_projects', {
			projects: [
				{
					path: '/tmp/fractalknow',
					name: 'fractalknow',
					source: 'desktop-config',
					openedAt: '2026-07-31T00:00:00.000Z',
				},
			],
		});
		expect(invoke).toHaveBeenCalledWith('submit_feedback', { message: 'bridge smoke' });
		expect(invoke).toHaveBeenCalledWith('detect_protocol', { scheme: 'fractalknow' });
		expect(invoke).toHaveBeenCalledWith('set_menu_enablement', {
			items: { 'save-version': true, 'kill-terminal': false },
		});
		expect(invoke).toHaveBeenCalledWith('get_menu_enablement', undefined);
		expect(invoke).toHaveBeenCalledWith('list_crash_reports', undefined);
		expect(invoke).toHaveBeenCalledWith('read_crash_report', { id: 'missing' });
		expect(invoke).toHaveBeenCalledWith('request_consent', {
			scope: 'updates',
			message: 'Allow updates?',
		});
		expect(invoke).toHaveBeenCalledWith('grant_consent', { scope: 'updates', granted: true });
		expect(invoke).toHaveBeenCalledWith('start_local_server', {
			config: {
				command: 'echo',
				args: ['hello'],
				env: {},
				healthUrl: null,
				healthTimeoutMs: null,
				cwd: null,
			},
		});
		expect(invoke).toHaveBeenCalledWith('stop_local_server', undefined);
		expect(invoke).toHaveBeenCalledWith('local_server_status', undefined);
		expect(invoke).toHaveBeenCalledWith('simulate_panic', undefined);

		const unsubscribe = bridge.onMenuAction(vi.fn());
		expect(unsubscribe).toBeTypeOf('function');
		await vi.waitFor(() => {
			expect(listen).toHaveBeenCalledWith('ok:menu-action', expect.any(Function));
		});
		expect(listen).toHaveBeenCalledWith('ok:menu-action', expect.any(Function));
		unsubscribe();

		vi.doUnmock('@tauri-apps/api/core');
		vi.doUnmock('@tauri-apps/api/event');
		vi.resetModules();
	});
});
