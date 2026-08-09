export type OkDesktopMode = 'editor' | 'navigator' | 'terminal';

export type OkThemeSource = 'system' | 'light' | 'dark';

export type OkMenuAction =
	| 'new-doc'
	| 'new-folder'
	| 'new-from-template'
	| 'new-project'
	| 'clone-project'
	| 'publish-project'
	| 'choose-template'
	| 'rename'
	| 'duplicate'
	| 'move-to-trash'
	| 'reveal-in-finder'
	| 'copy-full-path'
	| 'copy-relative-path'
	| 'delete'
	| 'close-active-tab-or-window'
	| 'open-folder'
	| 'open-file'
	| 'switch-project'
	| 'open-github'
	| 'settings'
	| 'settings-validation'
	| 'toggle-validate-on-save'
	| 'toggle-link-validation'
	| 'toggle-metadata-validation'
	| 'show-activity'
	| 'show-diagnostics'
	| 'toggle-sidebar'
	| 'toggle-source'
	| 'toggle-doc-panel'
	| 'toggle-show-hidden-files'
	| 'toggle-show-ok-folders'
	| 'toggle-show-only-markdown-files'
	| 'toggle-show-skills-section'
	| 'expand-all-tree'
	| 'collapse-all-tree'
	| 'save-version'
	| 'version-history'
	| 'focus-search'
	| 'focus-command-palette'
	| 'navigate-back'
	| 'navigate-forward'
	| 'toggle-terminal'
	| 'new-terminal'
	| 'kill-terminal'
	| 'report-bug'
	| 'send-feedback';

export type OkUnsubscribe = () => void;

export type OkDeepLinkEvent = {
	url: string;
	receivedAt: string;
};

export type OkUpdateStatusEvent = {
	status: 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';
	version: string | null;
	message: string | null;
	checkedAt: string;
};

export type OkServerStatusEvent = {
	status: 'stopped' | 'starting' | 'running' | 'error';
	url: string | null;
	message: string | null;
	changedAt: string;
};

export type OkCrashInviteEvent = {
	id: string;
	reason: string;
	reportPath: string | null;
	createdAt: string;
};

export type OkConsentScope =
	| 'telemetry'
	| 'updates'
	| 'collaboration'
	| 'filesystem'
	| 'bug-reports'
	| 'local-server'
	| (string & {});

export type OkConsentRequiredEvent = {
	scope: OkConsentScope;
	message: string;
	requiredAt: string;
};

export type UnsupportedDesktopFeature = {
	ok: false;
	reason: 'not-implemented' | 'unsupported-platform' | 'missing-backend';
	feature: string;
	message?: string;
};

export type BridgeOk = {
	ok: true;
};

export type BridgeResult = BridgeOk | UnsupportedDesktopFeature;

export type ProtocolDetection = {
	installed: boolean;
	displayName?: string;
};

export type OkDesktopConfig = {
	readonly collabUrl: string;
	readonly apiOrigin: string;
	readonly projectPath: string;
	readonly projectName: string;
	readonly mode: OkDesktopMode;
	readonly e2eSmoke: boolean;
	readonly singleFile: boolean;
	readonly initialDoc: string | null;
	readonly freshlyCreated: boolean;
	readonly startupTraceparent?: string;
	readonly ptyAvailable: boolean;
};

export type AppInfo = {
	name: string;
	desktopRuntime: string;
	frontendRuntime: string;
	styling: string;
	os: string;
	arch: string;
	appVersion: string;
};

export type OkThemeAppliedOptions = {
	reducedTransparency?: boolean;
};

export type OkRecentProject = {
	path: string;
	name: string;
	source: 'desktop-config' | 'folder-picker' | 'browser-preview';
	openedAt: string;
};

export type OkBugReportCapture = {
	id: string;
	reportPath: string | null;
	createdAt: string;
};

export type OkFeedbackHandoff = {
	target: 'external-url' | 'native-share' | 'unsupported';
	url: string | null;
};

export type TerminalStartOptions = {
	id: string;
	cwd?: string;
	shell?: string;
	cols?: number;
	rows?: number;
};

export type OkTerminalDataEvent = {
	id: string;
	data: string;
};

export type OkTerminalExitEvent = {
	id: string;
	code: number | null;
};

export type TerminalWriteOptions = {
	id: string;
	data: string;
};

export type TerminalStopOptions = {
	id: string;
};

export type ProjectCreateOptions = {
	path: string;
	name: string;
};

export type ServerConfigInput = {
	command: string;
	args: string[];
	env: Record<string, string>;
	healthUrl: string | null;
	healthTimeoutMs: number | null;
	cwd: string | null;
};

export type MenuEnablementMap = Record<string, boolean>;

export type OkDesktopBridge = {
	readonly config: OkDesktopConfig;
	readonly runtime: 'tauri' | 'browser-preview';
	appInfo(): Promise<AppInfo>;
	onProjectSwitched(cb: (next: OkDesktopConfig) => void): OkUnsubscribe;
	onMenuAction(cb: (action: OkMenuAction) => void): OkUnsubscribe;
	onDeepLink(cb: (event: OkDeepLinkEvent) => void): OkUnsubscribe;
	onUpdateStatus(cb: (event: OkUpdateStatusEvent) => void): OkUnsubscribe;
	onServerStatus(cb: (event: OkServerStatusEvent) => void): OkUnsubscribe;
	onCrashInvite(cb: (event: OkCrashInviteEvent) => void): OkUnsubscribe;
	onConsentRequired(cb: (event: OkConsentRequiredEvent) => void): OkUnsubscribe;
	onTerminalData(cb: (event: OkTerminalDataEvent) => void): OkUnsubscribe;
	onTerminalExit(cb: (event: OkTerminalExitEvent) => void): OkUnsubscribe;
	setThemeSource(source: OkThemeSource): Promise<BridgeOk | UnsupportedDesktopFeature>;
	signalThemeApplied(opts?: OkThemeAppliedOptions): Promise<BridgeResult>;
	setMenuEnablement(items: MenuEnablementMap): Promise<BridgeResult>;
	getMenuEnablement(): Promise<MenuEnablementMap>;
	updater: {
		checkStatus(): Promise<OkUpdateStatusEvent | UnsupportedDesktopFeature>;
		installUpdate(): Promise<BridgeResult>;
	};
	terminal: {
		start(opts: TerminalStartOptions): Promise<BridgeResult>;
		write(opts: TerminalWriteOptions): Promise<BridgeResult>;
		stop(opts: TerminalStopOptions): Promise<BridgeResult>;
	};
	projects: {
		create(opts: ProjectCreateOptions): Promise<BridgeResult>;
		readRecent(): Promise<OkRecentProject[] | UnsupportedDesktopFeature>;
		writeRecent(projects: OkRecentProject[]): Promise<BridgeResult>;
		setProjectPath(path: string): Promise<BridgeResult>;
	};
	appConfig: {
		read(): Promise<unknown | UnsupportedDesktopFeature>;
		write(config: unknown): Promise<BridgeResult>;
	};
	feedback: {
		captureBugReport(): Promise<OkBugReportCapture | UnsupportedDesktopFeature>;
		submitFeedback(message?: string): Promise<OkFeedbackHandoff | UnsupportedDesktopFeature>;
	};
	dialog: {
		openFolder(opts?: { defaultPath?: string }): Promise<string | null>;
		openFile(opts?: { defaultPath?: string }): Promise<string | null>;
	};
	shell: {
		openExternal(url: string): Promise<void>;
		detectProtocol(scheme: string): Promise<ProtocolDetection | UnsupportedDesktopFeature>;
	};
	consent: {
		request(scope: OkConsentRequiredEvent['scope'], message: string): Promise<boolean>;
		grant(scope: OkConsentRequiredEvent['scope'], granted: boolean): Promise<BridgeResult>;
	};
	server: {
		start(config: ServerConfigInput): Promise<OkServerStatusEvent | UnsupportedDesktopFeature>;
		stop(): Promise<OkServerStatusEvent | UnsupportedDesktopFeature>;
		status(): Promise<OkServerStatusEvent | UnsupportedDesktopFeature>;
	};
	crash: {
		simulatePanic(): Promise<BridgeResult>;
		listReports(): Promise<string[]>;
		readReport(id: string): Promise<string | null>;
	};
};

/** Wire shapes from Tauri may be camelCase (serde rename_all) or snake_case. */
export type TauriProtocolDetection = {
	installed: boolean;
	displayName?: string | null;
	display_name?: string | null;
};

export type TauriDesktopConfig = {
	collabUrl?: string;
	collab_url?: string;
	apiOrigin?: string;
	api_origin?: string;
	projectPath?: string;
	project_path?: string;
	projectName?: string;
	project_name?: string;
	mode: OkDesktopMode;
	e2eSmoke?: boolean;
	e2e_smoke?: boolean;
	singleFile?: boolean;
	single_file?: boolean;
	initialDoc?: string | null;
	initial_doc?: string | null;
	freshlyCreated?: boolean;
	freshly_created?: boolean;
	startupTraceparent?: string | null;
	startup_traceparent?: string | null;
	ptyAvailable?: boolean;
	pty_available?: boolean;
};

export type TauriAppInfo = {
	name: string;
	desktopRuntime?: string;
	desktop_runtime?: string;
	frontendRuntime?: string;
	frontend_runtime?: string;
	styling: string;
	os: string;
	arch: string;
	appVersion?: string;
	app_version?: string;
};

export type TauriRecentProject = {
	path: string;
	name: string;
	source: OkRecentProject['source'];
	openedAt?: string;
	opened_at?: string;
};
