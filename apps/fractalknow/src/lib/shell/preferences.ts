import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import type { OkThemeSource } from '$lib/desktop';
import { setAppearanceConfig, setValidationConfig } from './config';
import { readLocalStorage, writeLocalStorage } from './storage';
import type { DocumentTarget, DocumentTargetKind, EditorMode, RightPanelView, ShellPanel } from './types';

const STORAGE_KEY = 'fractalknow:shell-preferences';

// Sidebar width bounds match the documented design tokens:
// $shell-sidebar-min-width = 14.625rem (≈234px at 16px root)
// $shell-sidebar-max-width = 32rem    (512px)
const SIDEBAR_MIN_WIDTH = 234;
const SIDEBAR_MAX_WIDTH = 512;
const SIDEBAR_DEFAULT_WIDTH = 288;

export type ShellPreferences = {
	locale: string;
	themeSource: OkThemeSource;
	editorMode: EditorMode;
	sidebarOpen: boolean;
	sidebarPinned: boolean;
	sidebarWidth: number;
	sidebarSection: SidebarSection;
	sidebarQuery: string;
	sidebarKindFilter: SidebarKindFilter;
	sidebarShowHidden: boolean;
	settingsSection: SettingsSection;
	settingsQuery: string;
	terminalOpen: boolean;
	terminalHeight: number;
	terminalTabs: TerminalTab[];
	activeTerminalTabId: string;
	terminalEnabled: boolean;
	autoApproveOkTools: boolean;
	terminalFontSize: number;
	terminalFontFamily: string;
	terminalScrollback: number;
	terminalCursorStyle: 'block' | 'underline' | 'bar';
	terminalCursorBlink: boolean;
	terminalShellPath: string;
	documentPanelWidth: number;
	rightPanelOpen: boolean;
	rightPanelView: RightPanelView;
	rightPanelWidth: number;
	activePanel: ShellPanel;
	activeTarget: DocumentTarget | null;
	telemetryEnabled: boolean;
	reducedTransparency: boolean;
	validateOnSave: boolean;
	validateLinksOnSave: boolean;
	validateMetadataOnSave: boolean;
	syncEnabled: boolean;
	collaborationPresence: boolean;
	agentToolsEnabled: boolean;
};

export type SidebarKindFilter = 'all' | Exclude<DocumentTargetKind, 'migration'>;
export type SidebarSection = 'files' | 'skills' | 'docs' | 'recent-projects';
export type SettingsSection =
	| 'terminal'
	| 'project'
	| 'editor'
	| 'appearance'
	| 'validation'
	| 'sync'
	| 'agents'
	| 'templates'
	| 'skills'
	| 'ignore-patterns'
	| 'runtime';
export type TerminalTabStatus = 'idle' | 'pending' | 'unsupported';

export type TerminalTab = {
	id: string;
	title: string;
	cwd: string;
	status: TerminalTabStatus;
	openedAt: string;
};

const defaultTerminalTab: TerminalTab = {
	id: 'terminal-1',
	title: 'Terminal 1',
	cwd: '~',
	status: 'unsupported',
	openedAt: '2026-07-30T00:00:00.000Z',
};

export const defaultPreferences: ShellPreferences = {
	locale: 'en-US',
	themeSource: 'system',
	editorMode: 'rich',
	sidebarOpen: true,
	sidebarPinned: true,
	sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
	sidebarSection: 'files',
	sidebarQuery: '',
	sidebarKindFilter: 'all',
	sidebarShowHidden: false,
	settingsSection: 'project',
	settingsQuery: '',
	terminalOpen: false,
	terminalHeight: 180,
	terminalTabs: [defaultTerminalTab],
	activeTerminalTabId: defaultTerminalTab.id,
	terminalEnabled: true,
	autoApproveOkTools: true,
	terminalFontSize: 13,
	terminalFontFamily: 'Menlo, Monaco, "Courier New", monospace',
	terminalScrollback: 1000,
	terminalCursorStyle: 'block',
	terminalCursorBlink: true,
	terminalShellPath: '',
	documentPanelWidth: 340,
	rightPanelOpen: false,
	rightPanelView: 'activity',
	rightPanelWidth: 352,
	activePanel: 'migration',
	activeTarget: null,
	telemetryEnabled: false,
	reducedTransparency: false,
	validateOnSave: true,
	validateLinksOnSave: true,
	validateMetadataOnSave: true,
	syncEnabled: false,
	collaborationPresence: false,
	agentToolsEnabled: false,
};

function readPreferences(): ShellPreferences {
	if (!browser) return defaultPreferences;

	try {
		const value = readLocalStorage(STORAGE_KEY);
		if (!value) return defaultPreferences;
		return normalizePreferences({ ...defaultPreferences, ...JSON.parse(value) } as ShellPreferences);
	} catch {
		return defaultPreferences;
	}
}

function normalizePreferences(preferences: ShellPreferences): ShellPreferences {
	const terminalTabs = preferences.terminalTabs.filter((tab) => tab.id && tab.title);
	const nextTabs = terminalTabs.length > 0 ? terminalTabs : [defaultTerminalTab];
	const activeTerminalTabId = nextTabs.some((tab) => tab.id === preferences.activeTerminalTabId)
		? preferences.activeTerminalTabId
		: nextTabs[0].id;
	const sidebarSection: SidebarSection =
		preferences.sidebarSection === 'skills' ||
		preferences.sidebarSection === 'docs' ||
		preferences.sidebarSection === 'recent-projects' ||
		preferences.sidebarSection === 'files'
			? preferences.sidebarSection
			: 'files';
	const rightPanelView: RightPanelView =
		preferences.rightPanelView === 'diagnostics' ||
		preferences.rightPanelView === 'version-history' ||
		preferences.rightPanelView === 'document' ||
		preferences.rightPanelView === 'activity'
			? preferences.rightPanelView
			: 'activity';
	const rightPanelWidth = clampWidth(preferences.rightPanelWidth ?? 352, 240, 640);
	const sidebarPinned = typeof preferences.sidebarPinned === 'boolean' ? preferences.sidebarPinned : true;

	return {
		...preferences,
		terminalTabs: nextTabs,
		activeTerminalTabId,
		sidebarSection,
		rightPanelView,
		rightPanelWidth,
		sidebarPinned,
	};
}

function clampWidth(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) return min;
	return Math.min(Math.max(Math.round(value), min), max);
}

export const shellPreferences = writable<ShellPreferences>(readPreferences());

if (browser) {
	shellPreferences.subscribe((preferences) => {
		writeLocalStorage(STORAGE_KEY, JSON.stringify(preferences));
	});
}

export const themeSource = derived(shellPreferences, ($preferences) => $preferences.themeSource);
export const locale = derived(shellPreferences, ($preferences) => $preferences.locale);
export const activeTerminalTab = derived(shellPreferences, ($preferences) =>
	$preferences.terminalTabs.find((tab) => tab.id === $preferences.activeTerminalTabId) ?? $preferences.terminalTabs[0],
);

export function setThemeSource(themeSource: OkThemeSource): void {
	setAppearanceConfig({ themeSource });
	shellPreferences.update((preferences) => ({ ...preferences, themeSource }));
}

export function setLocale(locale: string): void {
	const nextLocale = locale.trim() || 'en-US';
	shellPreferences.update((preferences) => ({ ...preferences, locale: nextLocale }));
}

export function setPreferredEditorMode(editorMode: EditorMode): void {
	shellPreferences.update((preferences) => ({ ...preferences, editorMode }));
}

export function setPreferredSidebarOpen(sidebarOpen: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, sidebarOpen }));
}

export function setPreferredSidebarPinned(sidebarPinned: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, sidebarPinned }));
}

export function setPreferredSidebarWidth(sidebarWidth: number): void {
	const nextWidth = Math.min(Math.max(Math.round(sidebarWidth), SIDEBAR_MIN_WIDTH), SIDEBAR_MAX_WIDTH);
	shellPreferences.update((preferences) => ({ ...preferences, sidebarWidth: nextWidth }));
}

export const sidebarMinWidth = SIDEBAR_MIN_WIDTH;
export const sidebarMaxWidth = SIDEBAR_MAX_WIDTH;
export const sidebarDefaultWidth = SIDEBAR_DEFAULT_WIDTH;

export function setPreferredSidebarSection(sidebarSection: SidebarSection): void {
	shellPreferences.update((preferences) => ({ ...preferences, sidebarSection }));
}

export function setSidebarQuery(sidebarQuery: string): void {
	shellPreferences.update((preferences) => ({ ...preferences, sidebarQuery }));
}

export function setSidebarKindFilter(sidebarKindFilter: SidebarKindFilter): void {
	shellPreferences.update((preferences) => ({ ...preferences, sidebarKindFilter }));
}

export function setSidebarShowHidden(sidebarShowHidden: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, sidebarShowHidden }));
}

export function setSettingsSection(settingsSection: SettingsSection): void {
	shellPreferences.update((preferences) => ({ ...preferences, settingsSection }));
}

export function setSettingsQuery(settingsQuery: string): void {
	shellPreferences.update((preferences) => ({ ...preferences, settingsQuery }));
}

export function setPreferredTerminalOpen(terminalOpen: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, terminalOpen }));
}

export function setPreferredTerminalHeight(terminalHeight: number): void {
	const nextHeight = Math.min(Math.max(Math.round(terminalHeight), 120), 360);
	shellPreferences.update((preferences) => ({ ...preferences, terminalHeight: nextHeight }));
}

export function setPreferredRightPanelOpen(rightPanelOpen: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, rightPanelOpen }));
}

export function setPreferredRightPanelView(rightPanelView: RightPanelView): void {
	shellPreferences.update((preferences) => ({ ...preferences, rightPanelView }));
}

export function setPreferredRightPanelWidth(rightPanelWidth: number): void {
	const nextWidth = clampWidth(rightPanelWidth, 240, 640);
	shellPreferences.update((preferences) => ({ ...preferences, rightPanelWidth: nextWidth }));
}

export function createTerminalTab(): TerminalTab {
	const preferences = get(shellPreferences);
	const title = `Terminal ${preferences.terminalTabs.length + 1}`;
	const tab: TerminalTab = {
		id: `terminal-${Date.now()}`,
		title,
		cwd: '~',
		status: 'unsupported',
		openedAt: new Date().toISOString(),
	};
	shellPreferences.update((current) => ({
		...current,
		terminalOpen: true,
		terminalTabs: [...current.terminalTabs, tab],
		activeTerminalTabId: tab.id,
	}));
	return tab;
}

export function setActiveTerminalTab(activeTerminalTabId: string): void {
	shellPreferences.update((preferences) => {
		if (!preferences.terminalTabs.some((tab) => tab.id === activeTerminalTabId)) return preferences;
		return { ...preferences, activeTerminalTabId };
	});
}

export function closeTerminalTab(tabId = get(shellPreferences).activeTerminalTabId): boolean {
	let terminalOpen = true;
	shellPreferences.update((preferences) => {
		const index = preferences.terminalTabs.findIndex((tab) => tab.id === tabId);
		if (index === -1) return preferences;
		const terminalTabs = preferences.terminalTabs.filter((tab) => tab.id !== tabId);
		if (terminalTabs.length === 0) {
			terminalOpen = false;
			return {
				...preferences,
				terminalTabs: [defaultTerminalTab],
				activeTerminalTabId: defaultTerminalTab.id,
				terminalOpen: false,
			};
		}
		terminalOpen = preferences.terminalOpen;
		const activeTerminalTabId =
			preferences.activeTerminalTabId === tabId
				? terminalTabs[Math.max(0, index - 1)].id
				: preferences.activeTerminalTabId;

		return {
			...preferences,
			terminalTabs,
			activeTerminalTabId,
		};
	});
	return terminalOpen;
}

export function setPreferredDocumentPanelWidth(documentPanelWidth: number): void {
	const nextWidth = Math.min(Math.max(Math.round(documentPanelWidth), 280), 560);
	shellPreferences.update((preferences) => ({ ...preferences, documentPanelWidth: nextWidth }));
}

export function setPreferredActivePanel(activePanel: ShellPanel): void {
	shellPreferences.update((preferences) => ({ ...preferences, activePanel }));
}

export function setPreferredActiveTarget(activeTarget: DocumentTarget): void {
	shellPreferences.update((preferences) => ({ ...preferences, activeTarget }));
}

export function setTelemetryEnabled(telemetryEnabled: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, telemetryEnabled }));
}

export function setReducedTransparency(reducedTransparency: boolean): void {
	setAppearanceConfig({ reducedTransparency });
	shellPreferences.update((preferences) => ({ ...preferences, reducedTransparency }));
}

export function setValidateOnSave(validateOnSave: boolean): void {
	setValidationConfig({ validateOnSave });
	shellPreferences.update((preferences) => ({ ...preferences, validateOnSave }));
}

export function setValidateLinksOnSave(validateLinksOnSave: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, validateLinksOnSave }));
}

export function setValidateMetadataOnSave(validateMetadataOnSave: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, validateMetadataOnSave }));
}

export function setSyncEnabled(syncEnabled: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, syncEnabled }));
}

export function setCollaborationPresence(collaborationPresence: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, collaborationPresence }));
}

export function setAgentToolsEnabled(agentToolsEnabled: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, agentToolsEnabled }));
}

export function setTerminalEnabled(terminalEnabled: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, terminalEnabled }));
}

export function setAutoApproveOkTools(autoApproveOkTools: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, autoApproveOkTools }));
}

export function setTerminalFontSize(terminalFontSize: number): void {
	const nextSize = Math.min(Math.max(Math.round(terminalFontSize), 8), 32);
	shellPreferences.update((preferences) => ({ ...preferences, terminalFontSize: nextSize }));
}

export function setTerminalFontFamily(terminalFontFamily: string): void {
	shellPreferences.update((preferences) => ({ ...preferences, terminalFontFamily }));
}

export function setTerminalScrollback(terminalScrollback: number): void {
	const nextScrollback = Math.min(Math.max(Math.round(terminalScrollback), 100), 50000);
	shellPreferences.update((preferences) => ({ ...preferences, terminalScrollback: nextScrollback }));
}

export function setTerminalCursorStyle(terminalCursorStyle: 'block' | 'underline' | 'bar'): void {
	shellPreferences.update((preferences) => ({ ...preferences, terminalCursorStyle }));
}

export function setTerminalCursorBlink(terminalCursorBlink: boolean): void {
	shellPreferences.update((preferences) => ({ ...preferences, terminalCursorBlink }));
}

export function setTerminalShellPath(terminalShellPath: string): void {
	shellPreferences.update((preferences) => ({ ...preferences, terminalShellPath }));
}
