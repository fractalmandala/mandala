export { createCommandItems, filterCommands, runCommandById } from './commands';
export type { CommandRunResult } from './commands';
export {
	collectCommandTags,
	filterTagList,
	formatTagQuery,
	parseTagPaletteQuery,
	TAG_QUERY_PREFIX,
} from './command-palette-tags';
export type { TagPaletteMode } from './command-palette-tags';
export { runWithToast } from './run-with-toast';
export {
	clearCommandStatus,
	clearRecentCommands,
	commandStatus,
	recentCommandIds,
	recordCommandFailed,
	recordCommandLoading,
	recordCommandStarted,
	recordCommandSucceeded,
	recordCommandWarming,
	removeRecentCommand,
} from './command-history';
export type { CommandStatus } from './command-history';
export {
	clearToasts,
	currentToasts,
	dismissToast,
	pushToast,
	toastHistory,
	toasts,
} from './toasts';
export type { Toast, ToastInput, ToastKind } from './toasts';
export {
	agentToolConfig,
	appearanceConfig,
	appConfig,
	configRollbackState,
	configPersistence,
	configValidationIssues,
	connectAppConfigBridge,
	hydrateAppConfig,
	invalidConfigState,
	normalizeAppConfig,
	projectConfigState,
	resetAppConfig,
	rollbackAppConfig,
	setAgentToolConfig,
	setAppearanceConfig,
	setConfigPersistCommand,
	setProjectConfig,
	setSyncCollaborationConfig,
	setValidationConfig,
	syncCollaborationConfig,
	updateAppConfig,
	validateAppConfig,
	validationConfig,
} from './config';
export type {
	AgentProvider,
	AppearanceDensity,
	ConfigPersistenceState,
	ConfigPersistenceStatus,
	ConfigValidationIssue,
	PreviewMode,
	ProjectConfigState,
	SyncMode,
} from './config';
export {
	consentRequired,
	crashInvite,
	deepLink,
	desktopEventHistory,
	desktopEvents,
	lastMenuAction,
	projectConfig,
	recordConsentRequired,
	recordCrashInvite,
	recordDeepLink,
	recordMenuAction,
	recordProjectConfig,
	recordServerStatus,
	recordUpdateStatus,
	serverStatus,
	updateStatus,
} from './desktop-events';
export type { DesktopEventHistoryEntry, DesktopEventKind } from './desktop-events';
export {
	hookMigrationInventory,
	hookMigrationSummary,
	hooksByKind,
	hooksByOwner,
} from './hook-classification';
export type {
	HookMigrationEntry,
	HookMigrationKind,
	HookMigrationOwner,
	HookMigrationStatus,
} from './hook-classification';
export {
	appProviders,
	featureFlags,
	hydrateProjectConfig,
	initializeFeatureFlags,
	initializeI18nProvider,
	initializeTelemetryProvider,
	markDesktopListenersReady,
	markProviderFailed,
	markProviderReady,
	recordTelemetryEvent,
	telemetryEvents,
} from './providers';
export type {
	FeatureFlagState,
	ProviderEntry,
	ProviderKey,
	ProviderStatus,
	TelemetryEvent,
} from './providers';
export {
	resetRichEditorStatus,
	richEditorStatus,
	setRichEditorStatus,
} from './editor-status';
export {
	activeDocument,
	closeActiveDocument,
	clearPendingTarget,
	confirmPendingTarget,
	createDocument,
	createDocumentInFolder,
	deleteActiveDocument,
	discardActiveChanges,
	documentWorkspace,
	isDiffableDocument,
	isSkillDocument,
	loadProjectDocuments,
	moveWorkspaceDocument,
	openDocument,
	openDocuments,
	reconcileExternalFileChanges,
	reloadActiveDocument,
	renameActiveDocument,
	saveActiveDocumentContent,
	saveActiveVersion,
	showVersionHistory,
	updateActiveContent,
	updateDocumentViewState,
	workspaceDocuments,
} from './documents';
export { handleMenuAction } from './menu-actions';

export {
	allMenuActions,
	applyMenuEnablement,
	buildMenuEnablement,
	resetMenuEnablementCache,
} from './menu-enablement';
export type { MenuContext, MenuSurface } from './menu-enablement';
export {
	activeTerminalTab,
	closeTerminalTab,
	createTerminalTab,
	defaultPreferences,
	setPreferredDocumentPanelWidth,
	setPreferredEditorMode,
	setPreferredActivePanel,
	setPreferredActiveTarget,
	setPreferredRightPanelOpen,
	setPreferredRightPanelView,
	setPreferredRightPanelWidth,
	setPreferredSidebarOpen,
	setPreferredSidebarPinned,
	setPreferredSidebarSection,
	setPreferredSidebarWidth,
	setPreferredTerminalHeight,
	setPreferredTerminalOpen,
	setReducedTransparency,
	setActiveTerminalTab,
	setLocale,
	setSettingsQuery,
	setSettingsSection,
	setSidebarKindFilter,
	setSidebarQuery,
	setSidebarShowHidden,
	setTelemetryEnabled,
	setThemeSource,
	setAgentToolsEnabled,
	setCollaborationPresence,
	setSyncEnabled,
	setValidateLinksOnSave,
	setValidateMetadataOnSave,
	setValidateOnSave,
	setAutoApproveOkTools,
	setTerminalCursorBlink,
	setTerminalCursorStyle,
	setTerminalEnabled,
	setTerminalFontFamily,
	setTerminalFontSize,
	setTerminalScrollback,
	setTerminalShellPath,
	locale,
	shellPreferences,
	themeSource,
} from './preferences';
export {
	clearRecentProjects,
	connectRecentProjectsBridge,
	openRecentProject,
	projectState,
	recentProjects,
	removeRecentProject,
	setProjectFromConfig,
	setProjectFromFolder,
} from './projects';
export {
	buildSidebarNodes,
	docsDocuments,
	documentsForSection,
	isDocsPath,
	isSkillPath,
	sidebarNodes,
	skillDocuments,
} from './sidebar-data';
export {
	resolveShellShortcutCommand,
	SHORTCUT_COMMANDS,
	SHORTCUT_CATEGORY_LABELS,
	SHORTCUT_CATEGORY_ORDER,
	chordId,
	parseChordId,
	formatChord,
	chordFromEvent,
	detectShortcutConflicts,
} from './shortcuts';
export type {
	ShortcutKeyboardEventLike,
	ShortcutTargetLike,
	Chord,
	ShortcutCategory,
	ShortcutCommand,
} from './shortcuts';
export {
	shortcutOverrides,
	shortcutBindings,
	shortcutConflicts,
	rebindShortcut,
	resetShortcut,
	resetAllShortcuts,
	currentShortcutBindings,
} from './shortcut-store';
export type { ShortcutOverrides } from './shortcut-store';
export {
	bindTerminalBridge,
	resetTerminalSessions,
	startTerminalSession,
	stopTerminalSession,
	terminalSessions,
	unbindTerminalBridge,
	writeToTerminal,
} from './terminal';
export type { TerminalSession, TerminalSessionStatus } from './terminal';
export {
	activeDialog,
	activePanel,
	activeTarget,
	closeAllOverlays,
	closeCommandPalette,
	closeDialog,
	closeRightPanel,
	navigateBack,
	navigateForward,
	navigateToDeepLink,
	navigateToHash,
	navigateToInitialDocument,
	navigationState,
	openCommandPalette,
	openDialog,
	openRightPanel,
	openTarget,
	rightPanelOpen,
	rightPanelView,
	rightPanelWidth,
	setActivePanel,
	setCommandSearch,
	setEditorMode,
	setRightPanelView,
	setRightPanelWidth,
	setSidebarOpen,
	setSidebarPartition,
	setSidebarPinned,
	setTerminalOpen,
	shellState,
	toggleEditorMode,
	toggleRightPanel,
	toggleSidebar,
	toggleTerminal,
} from './store';
export {
	LEFT_COLLAPSE_THRESHOLD,
	RIGHT_COLLAPSE_THRESHOLD,
	readPins as readSidebarPins,
	resolveEffectiveState as resolveSidebarEffectiveState,
	resolvePartition as resolveSidebarPartition,
	smartDefault as sidebarSmartDefault,
} from './sidebar-pins';
export type {
	SidebarPartition,
	SidebarPinState,
	SidebarSide,
	StoredSidebarPins,
} from './sidebar-pins';
export type {
	CommandGroup,
	CommandItem,
	DialogKind,
	DocumentTarget,
	DocumentTargetKind,
	EditorMode,
	RightPanelView,
	ShellPanel,
	ShellState,
	SidebarNode,
} from './types';
export {
	clearRecentDocuments,
	recentDocumentPaths,
	recordRecentDocument,
	removeRecentDocument,
} from './documents';
export type {
	DocumentLoadState,
	DocumentMetadata,
	DocumentSyncState,
	DocumentVersion,
	DocumentViewState,
	DocumentWorkspaceState,
	WorkspaceDocument,
} from './documents';
export type { RichEditorStatus } from './editor-status';
export type {
	SettingsSection,
	SidebarKindFilter,
	SidebarSection,
	TerminalTab,
	TerminalTabStatus,
} from './preferences';
export type { ProjectSource, ProjectState, RecentProject } from './projects';
export { clearTrashFailures, recordTrashFailures, trashFailures } from './trash';
export type { TrashFailure } from './trash';
export {
	agentDetection,
	BUILTIN_AGENT_TOOLS,
	clearToolOverride,
	detectAgentTool,
	getToolState,
	parseProtocolDetection,
	refreshAgentDetections,
	setToolOverride,
} from './ai-tools';
export type { AgentDetectionMap, AgentToolId, AgentToolSpec, ToolConfigOverride } from './ai-tools';
export {
	createTemplate,
	defaultTemplates,
	deleteTemplate,
	loadProjectTemplates,
	parseTemplateFiles,
	parseTemplateTitle,
	projectTemplates,
	renameTemplate,
	sanitizeTemplateName,
} from './templates';
export type { ProjectTemplateItem } from './templates';
export {
	BUNDLED_SKILLS,
	bundleSyncState,
	bundledAgentDocuments,
	bundledCommandDocuments,
	bundledSkillDocuments,
	parseBundledSkillsFromDocs,
	parseProjectSkillsFromDocs,
	skillsStore,
	skillTargetsStore,
	syncBundledSkillsPipeline,
	syncSkillsPipeline,
	toggleSkillEnabled,
	toggleSkillTarget,
} from './skills';
export type { BundleSyncState, SkillEntry, SkillScope, SkillTargetEditor } from './skills';
export {
	appendPattern,
	checkHeuristicWarnings,
	classifyLine,
	countMatches,
	defaultOkignoreText,
	editPatternAt,
	findPatternIndex,
	isPathIgnored,
	listPatterns,
	loadOkignore,
	okignorePatterns,
	okignoreText,
	parseOkignoreDoc,
	removePatternAt,
	reorderPatterns,
	saveOkignore,
	serializeOkignoreDoc,
} from './okignore';
export type { Line, MetaLine, OkignoreWarning, OkignoreWarningCode, ParsedDoc, PatternLine } from './okignore';
export { formatShortcut } from './shortcuts';
export {
	appendAgentActivity,
	closeAgentSession,
	connectActivityBridge,
	connectActivityBridgeFromRuntime,
	openAgentSession,
	refreshAgentSessions,
	agentSessionCount,
	agentSessions,
	agentSessionsState,
	sessionDetailState,
} from './agent-sessions';
export type {
	ActivityBridge,
	ActivityEvent,
	ActivitySessionPage,
	ActivitySessionSummary,
	AgentSessionsState,
	AgentSessionsStatus,
	SessionDetailState,
} from './agent-sessions';
