import type {
	AppInfo,
	BridgeResult,
	MenuEnablementMap,
	OkConsentRequiredEvent,
	OkCrashInviteEvent,
	OkDeepLinkEvent,
	OkDesktopBridge,
	OkDesktopConfig,
	OkMenuAction,
	OkRecentProject,
	OkServerStatusEvent,
	OkTerminalDataEvent,
	OkTerminalExitEvent,
	OkThemeSource,
	OkUnsubscribe,
	OkUpdateStatusEvent,
	ProjectCreateOptions,
	ServerConfigInput,
	TerminalStartOptions,
	TerminalStopOptions,
	TerminalWriteOptions,
	UnsupportedDesktopFeature,
} from './types';

const fallbackConfig: OkDesktopConfig = {
	collabUrl: '',
	apiOrigin: '',
	projectPath: '',
	projectName: 'fractalknow',
	mode: 'navigator',
	e2eSmoke: false,
	singleFile: false,
	initialDoc: null,
	freshlyCreated: false,
	ptyAvailable: false,
};

const fallbackAppInfo: AppInfo = {
	name: 'FractalKnow',
	desktopRuntime: 'browser preview',
	frontendRuntime: 'SvelteKit SPA',
	styling: 'tab-indented Sass',
	os: 'browser',
	arch: 'unknown',
	appVersion: '0.0.0',
};

const initialUpdateStatus: OkUpdateStatusEvent = {
	status: 'idle',
	version: null,
	message: 'Updater bridge is waiting for native updater integration.',
	checkedAt: new Date().toISOString(),
};

const initialServerStatus: OkServerStatusEvent = {
	status: 'stopped',
	url: null,
	message: 'Local collaboration server is not started yet.',
	changedAt: new Date().toISOString(),
};

function unsupported(feature: string): UnsupportedDesktopFeature {
	return { ok: false, reason: 'not-implemented', feature };
}

function normalizeConfig(config: unknown): OkDesktopConfig {
	// Tauri serde uses rename_all = "camelCase"; tests and older payloads may use snake_case.
	const mode = valueFromRecord<OkDesktopConfig['mode']>(config, 'mode') ?? 'navigator';
	const startupTraceparent = nullableString(
		valueFromRecord(config, 'startupTraceparent', 'startup_traceparent'),
	);
	return {
		collabUrl: valueFromRecord<string>(config, 'collabUrl', 'collab_url') ?? '',
		apiOrigin: valueFromRecord<string>(config, 'apiOrigin', 'api_origin') ?? '',
		projectPath: valueFromRecord<string>(config, 'projectPath', 'project_path') ?? '',
		projectName: valueFromRecord<string>(config, 'projectName', 'project_name') ?? 'fractalknow',
		mode,
		e2eSmoke: Boolean(valueFromRecord(config, 'e2eSmoke', 'e2e_smoke')),
		singleFile: Boolean(valueFromRecord(config, 'singleFile', 'single_file')),
		initialDoc: nullableString(valueFromRecord(config, 'initialDoc', 'initial_doc')),
		freshlyCreated: Boolean(valueFromRecord(config, 'freshlyCreated', 'freshly_created')),
		...(startupTraceparent ? { startupTraceparent } : {}),
		ptyAvailable: Boolean(valueFromRecord(config, 'ptyAvailable', 'pty_available')),
	};
}

function normalizeAppInfo(info: unknown): AppInfo {
	return {
		name: valueFromRecord<string>(info, 'name') ?? 'FractalKnow',
		desktopRuntime: valueFromRecord<string>(info, 'desktopRuntime', 'desktop_runtime') ?? 'Tauri v2',
		frontendRuntime:
			valueFromRecord<string>(info, 'frontendRuntime', 'frontend_runtime') ?? 'SvelteKit SPA',
		styling: valueFromRecord<string>(info, 'styling') ?? 'tab-indented Sass',
		os: valueFromRecord<string>(info, 'os') ?? 'unknown',
		arch: valueFromRecord<string>(info, 'arch') ?? 'unknown',
		appVersion: valueFromRecord<string>(info, 'appVersion', 'app_version') ?? '0.0.0',
	};
}

function normalizeProtocolDetection(result: unknown) {
	const displayName = nullableString(
		valueFromRecord(result, 'displayName', 'display_name'),
	);
	return {
		installed: Boolean(valueFromRecord(result, 'installed')),
		...(displayName ? { displayName } : {}),
	};
}

function valueFromRecord<T>(payload: unknown, ...keys: string[]): T | undefined {
	if (!payload || typeof payload !== 'object') return undefined;
	const record = payload as Record<string, unknown>;
	for (const key of keys) {
		const value = record[key];
		if (value !== undefined) return value as T;
	}
	return undefined;
}

function timestamp(value: unknown): string {
	return typeof value === 'string' && value.length > 0 ? value : new Date().toISOString();
}

function nullableString(value: unknown): string | null {
	return typeof value === 'string' && value.length > 0 ? value : null;
}

function normalizeDeepLinkEvent(payload: unknown): OkDeepLinkEvent {
	return {
		url: valueFromRecord<string>(payload, 'url') ?? '',
		receivedAt: timestamp(valueFromRecord(payload, 'receivedAt', 'received_at')),
	};
}

function normalizeUpdateStatusEvent(payload: unknown): OkUpdateStatusEvent {
	const status = valueFromRecord<OkUpdateStatusEvent['status']>(payload, 'status') ?? 'idle';
	return {
		status,
		version: nullableString(valueFromRecord(payload, 'version')),
		message: nullableString(valueFromRecord(payload, 'message')),
		checkedAt: timestamp(valueFromRecord(payload, 'checkedAt', 'checked_at')),
	};
}

function normalizeServerStatusEvent(payload: unknown): OkServerStatusEvent {
	const status = valueFromRecord<OkServerStatusEvent['status']>(payload, 'status') ?? 'stopped';
	return {
		status,
		url: nullableString(valueFromRecord(payload, 'url')),
		message: nullableString(valueFromRecord(payload, 'message')),
		changedAt: timestamp(valueFromRecord(payload, 'changedAt', 'changed_at')),
	};
}

function normalizeCrashInviteEvent(payload: unknown): OkCrashInviteEvent {
	return {
		id: valueFromRecord<string>(payload, 'id') ?? `crash-${Date.now()}`,
		reason: valueFromRecord<string>(payload, 'reason') ?? 'Crash report available',
		reportPath: nullableString(valueFromRecord(payload, 'reportPath', 'report_path')),
		createdAt: timestamp(valueFromRecord(payload, 'createdAt', 'created_at')),
	};
}

function normalizeConsentRequiredEvent(payload: unknown): OkConsentRequiredEvent {
	const rawScope = valueFromRecord<string>(payload, 'scope');
	return {
		// Preserve native scopes (bug-reports, local-server, etc.); only default when missing.
		scope: rawScope && rawScope.length > 0 ? rawScope : 'filesystem',
		message: valueFromRecord<string>(payload, 'message') ?? 'Consent is required.',
		requiredAt: timestamp(valueFromRecord(payload, 'requiredAt', 'required_at')),
	};
}

function normalizeTerminalDataEvent(payload: unknown): OkTerminalDataEvent {
	return {
		id: valueFromRecord<string>(payload, 'id') ?? '',
		data: valueFromRecord<string>(payload, 'data') ?? '',
	};
}

function normalizeTerminalExitEvent(payload: unknown): OkTerminalExitEvent {
	const code = valueFromRecord<number>(payload, 'code');
	return {
		id: valueFromRecord<string>(payload, 'id') ?? '',
		code: typeof code === 'number' ? code : null,
	};
}

function normalizeRecentProject(payload: unknown): OkRecentProject | null {	const path = valueFromRecord<string>(payload, 'path');
	const name = valueFromRecord<string>(payload, 'name');
	if (!path || !name) return null;
	return {
		path,
		name,
		source: valueFromRecord<OkRecentProject['source']>(payload, 'source') ?? 'desktop-config',
		openedAt: timestamp(valueFromRecord(payload, 'openedAt', 'opened_at')),
	};
}

function normalizeRecentProjects(payload: unknown): OkRecentProject[] {
	return Array.isArray(payload)
		? payload.map(normalizeRecentProject).filter((project): project is OkRecentProject => Boolean(project))
		: [];
}

function normalizeBugReportCapture(payload: unknown) {
	return {
		id: valueFromRecord<string>(payload, 'id') ?? `bug-${Date.now()}`,
		reportPath: nullableString(valueFromRecord(payload, 'reportPath', 'report_path')),
		createdAt: timestamp(valueFromRecord(payload, 'createdAt', 'created_at')),
	};
}

function normalizeFeedbackHandoff(payload: unknown) {
	return {
		target: valueFromRecord<'external-url' | 'native-share' | 'unsupported'>(payload, 'target') ?? 'unsupported',
		url: nullableString(valueFromRecord(payload, 'url')),
	};
}

function isUnsupportedFeature(payload: unknown): payload is UnsupportedDesktopFeature {
	return Boolean(
		payload
			&& typeof payload === 'object'
			&& (payload as Record<string, unknown>).ok === false
			&& typeof (payload as Record<string, unknown>).feature === 'string',
	);
}

export const desktopBridgeNormalizers = {
	config: normalizeConfig,
	appInfo: normalizeAppInfo,
	protocolDetection: normalizeProtocolDetection,
	deepLinkEvent: normalizeDeepLinkEvent,
	updateStatusEvent: normalizeUpdateStatusEvent,
	serverStatusEvent: normalizeServerStatusEvent,
	crashInviteEvent: normalizeCrashInviteEvent,
	consentRequiredEvent: normalizeConsentRequiredEvent,
	recentProjects: normalizeRecentProjects,
	terminalDataEvent: normalizeTerminalDataEvent,
	terminalExitEvent: normalizeTerminalExitEvent,
	bugReportCapture: normalizeBugReportCapture,
	feedbackHandoff: normalizeFeedbackHandoff,
	isUnsupportedFeature,
};

async function tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
	const { invoke } = await import('@tauri-apps/api/core');
	return invoke<T>(command, args);
}

async function buildTauriBridge(): Promise<OkDesktopBridge> {
	const config = normalizeConfig(await tauriInvoke<unknown>('desktop_config'));

	return {
		config,
		runtime: 'tauri',
		appInfo: async () => normalizeAppInfo(await tauriInvoke<unknown>('app_info')),
		onProjectSwitched: subscribeTauriEvent<OkDesktopConfig>('ok:project:switched'),
		onMenuAction: subscribeTauriEvent<OkMenuAction>('ok:menu-action'),
		onDeepLink: subscribeTauriEvent('ok:deep-link', normalizeDeepLinkEvent, {
			load: async () => {
				const url = await tauriInvoke<string | null>('startup_deep_link');
				return url ? { url, receivedAt: new Date().toISOString() } : null;
			},
		}),
		onUpdateStatus: subscribeTauriEvent(
			'ok:update-status',
			normalizeUpdateStatusEvent,
			initialUpdateStatus,
		),
		onServerStatus: subscribeTauriEvent(
			'ok:server-status',
			normalizeServerStatusEvent,
			initialServerStatus,
		),
		onCrashInvite: subscribeTauriEvent('ok:crash-invite', normalizeCrashInviteEvent),
		onConsentRequired: subscribeTauriEvent('ok:consent-required', normalizeConsentRequiredEvent),
		onTerminalData: subscribeTauriEvent('ok:terminal-data', normalizeTerminalDataEvent),
		onTerminalExit: subscribeTauriEvent('ok:terminal-exit', normalizeTerminalExitEvent),
		setThemeSource: async (source: OkThemeSource) =>
			tauriInvoke<{ ok: true }>('set_theme_source', { source }),
		signalThemeApplied: async (opts) => tauriInvoke<BridgeResult>('theme_applied', { opts }),
		setMenuEnablement: async (items: MenuEnablementMap) =>
			// Rust command parameter is `items: HashMap<String, bool>`.
			tauriInvoke<BridgeResult>('set_menu_enablement', { items }),
		getMenuEnablement: async () =>
			(await tauriInvoke<MenuEnablementMap>('get_menu_enablement')) ?? {},
		updater: {
			checkStatus: async () => {
				const result = await tauriInvoke<unknown>('check_update_status');
				return isUnsupportedFeature(result) ? result : normalizeUpdateStatusEvent(result);
			},
			installUpdate: async () => tauriInvoke<BridgeResult>('install_update'),
		},
		terminal: {
			start: async (opts: TerminalStartOptions) => tauriInvoke<BridgeResult>('terminal_start', { opts }),
			write: async (opts: TerminalWriteOptions) => tauriInvoke<BridgeResult>('terminal_write', { opts }),
			stop: async (opts: TerminalStopOptions) => tauriInvoke<BridgeResult>('terminal_stop', { opts }),
		},
		projects: {
			create: async (opts: ProjectCreateOptions) => {
				// Native command returns CreatedProject metadata; facade keeps BridgeResult.
				const result = await tauriInvoke<unknown>('create_project', { opts });
				if (isUnsupportedFeature(result)) return result;
				return { ok: true as const };
			},
			readRecent: async () => {
				const result = await tauriInvoke<unknown>('read_recent_projects');
				return isUnsupportedFeature(result) ? result : normalizeRecentProjects(result);
			},
			writeRecent: async (projects: OkRecentProject[]) =>
				tauriInvoke<BridgeResult>('write_recent_projects', { projects }),
			setProjectPath: async (path: string) => tauriInvoke<BridgeResult>('set_project_path', { path }),
		},
		appConfig: {
			read: async () => tauriInvoke<unknown>('read_app_config'),
			write: async (config: unknown) => tauriInvoke<BridgeResult>('write_app_config', { config }),
		},
		feedback: {
			captureBugReport: async () => {
				const result = await tauriInvoke<unknown>('capture_bug_report');
				return isUnsupportedFeature(result) ? result : normalizeBugReportCapture(result);
			},
			submitFeedback: async (message?: string) => {
				const result = await tauriInvoke<unknown>('submit_feedback', { message });
				return isUnsupportedFeature(result) ? result : normalizeFeedbackHandoff(result);
			},
		},
		dialog: {
			openFolder: async (opts) => {
				const { open } = await import('@tauri-apps/plugin-dialog');
				const selected = await open({
					directory: true,
					multiple: false,
					defaultPath: opts?.defaultPath,
				});
				return typeof selected === 'string' ? selected : null;
			},
			openFile: async (opts) => {
				const { open } = await import('@tauri-apps/plugin-dialog');
				const selected = await open({
					directory: false,
					multiple: false,
					defaultPath: opts?.defaultPath,
				});
				return typeof selected === 'string' ? selected : null;
			},
		},
		shell: {
			openExternal: async (url: string) => {
				const { openUrl } = await import('@tauri-apps/plugin-opener');
				await openUrl(url);
			},
			detectProtocol: async (scheme: string) =>
				normalizeProtocolDetection(await tauriInvoke<unknown>('detect_protocol', { scheme })),
		},
		consent: {
			request: async (scope, message) =>
				tauriInvoke<boolean>('request_consent', { scope, message }),
			grant: async (scope, granted) =>
				tauriInvoke<BridgeResult>('grant_consent', { scope, granted }),
		},
		server: {
			start: async (config: ServerConfigInput) => {
				const result = await tauriInvoke<unknown>('start_local_server', { config });
				return isUnsupportedFeature(result) ? result : normalizeServerStatusEvent(result);
			},
			stop: async () => {
				const result = await tauriInvoke<unknown>('stop_local_server');
				return isUnsupportedFeature(result) ? result : normalizeServerStatusEvent(result);
			},
			status: async () => {
				const result = await tauriInvoke<unknown>('local_server_status');
				return isUnsupportedFeature(result) ? result : normalizeServerStatusEvent(result);
			},
		},
		crash: {
			simulatePanic: async () => tauriInvoke<BridgeResult>('simulate_panic'),
			listReports: async () => (await tauriInvoke<string[]>('list_crash_reports')) ?? [],
			readReport: async (id: string) =>
				await tauriInvoke<string | null>('read_crash_report', { id }),
		},
	};
}

function subscribeTauriEvent<T>(
	eventName: string,
	normalize: (payload: unknown) => T = (payload) => payload as T,
	initialEvent?: T | { load: () => Promise<T | null> },
) {
	return (cb: (payload: T) => void): OkUnsubscribe => {
		let unsubscribe: OkUnsubscribe | null = null;
		let disposed = false;
		if (initialEvent) {
			queueMicrotask(() => {
				if (typeof initialEvent === 'object' && initialEvent !== null && 'load' in initialEvent) {
					void initialEvent.load().then((event: T | null) => {
						if (!disposed && event) cb(event);
					});
					return;
				}
				if (!disposed) cb(initialEvent);
			});
		}
		void import('@tauri-apps/api/event').then(({ listen }) => {
			if (disposed) return;
			void listen<unknown>(eventName, (event) => cb(normalize(event.payload))).then((stop) => {
				if (disposed) {
					stop();
					return;
				}
				unsubscribe = stop;
			});
		});
		return () => {
			disposed = true;
			unsubscribe?.();
		};
	};
}

function initialBrowserDeepLink(): OkDeepLinkEvent | null {
	const params = new URLSearchParams(window.location.search);
	const url = params.get('deep_link') ?? params.get('deepLink');
	return url ? { url, receivedAt: new Date().toISOString() } : null;
}

function buildBrowserBridge(): OkDesktopBridge {
	return {
		config: fallbackConfig,
		runtime: 'browser-preview',
		appInfo: async () => fallbackAppInfo,
		onProjectSwitched: () => () => {},
		onMenuAction: () => () => {},
		onDeepLink: (cb) => {
			const deepLink = initialBrowserDeepLink();
			if (deepLink) queueMicrotask(() => cb(deepLink));
			return () => {};
		},
		onUpdateStatus: (cb) => {
			queueMicrotask(() => cb(initialUpdateStatus));
			return () => {};
		},
		onServerStatus: (cb) => {
			queueMicrotask(() => cb(initialServerStatus));
			return () => {};
		},
		onCrashInvite: () => () => {},
		onConsentRequired: () => () => {},
		onTerminalData: () => () => {},
		onTerminalExit: () => () => {},
		setThemeSource: async (_source: OkThemeSource) => unsupported('setThemeSource'),
		signalThemeApplied: async () => unsupported('themeApplied'),
		setMenuEnablement: async () => unsupported('setMenuEnablement'),
		getMenuEnablement: async () => ({}),
		updater: {
			checkStatus: async () => unsupported('updater.checkStatus'),
			installUpdate: async () => unsupported('updater.installUpdate'),
		},
		terminal: {
			start: async () => unsupported('terminal.start'),
			write: async () => unsupported('terminal.write'),
			stop: async () => unsupported('terminal.stop'),
		},
		projects: {
			create: async () => unsupported('projects.create'),
			readRecent: async () => unsupported('projects.readRecent'),
			writeRecent: async () => unsupported('projects.writeRecent'),
			setProjectPath: async () => unsupported('projects.setProjectPath'),
		},
		appConfig: {
			// Browser preview keeps app config in localStorage only.
			read: async () => unsupported('appConfig.read'),
			write: async () => unsupported('appConfig.write'),
		},
		feedback: {
			captureBugReport: async () => unsupported('feedback.captureBugReport'),
			submitFeedback: async (message?: string) => {
				const url =
					typeof message === 'string' && message.length > 0
						? `https://github.com/inkeep/open-knowledge/issues?body=${encodeURIComponent(message)}`
						: 'https://github.com/inkeep/open-knowledge/issues';
				return { target: 'external-url', url };
			},
		},
		dialog: {
			openFolder: async () => null,
			openFile: async () => null,
		},
		shell: {
			openExternal: async (url: string) => {
				window.open(url, '_blank', 'noopener,noreferrer');
			},
			detectProtocol: async (_scheme: string) => unsupported('shell.detectProtocol'),
		},
		consent: {
			request: async () => false,
			grant: async () => unsupported('consent.grant'),
		},
		server: {
			start: async () => unsupported('server.start'),
			stop: async () => unsupported('server.stop'),
			status: async () => initialServerStatus,
		},
		crash: {
			simulatePanic: async () => unsupported('crash.simulatePanic'),
			listReports: async () => [],
			readReport: async () => null,
		},
	};
}

export async function createDesktopBridge(): Promise<OkDesktopBridge> {
	if (typeof window === 'undefined') return buildBrowserBridge();

	try {
		return await buildTauriBridge();
	} catch {
		return buildBrowserBridge();
	}
}
