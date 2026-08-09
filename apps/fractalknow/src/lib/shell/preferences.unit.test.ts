import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import {
	activeTerminalTab,
	closeTerminalTab,
	createTerminalTab,
	setActiveTerminalTab,
	setAutoApproveOkTools,
	setPreferredDocumentPanelWidth,
	setPreferredSidebarWidth,
	setPreferredTerminalHeight,
	setTerminalCursorBlink,
	setTerminalCursorStyle,
	setTerminalEnabled,
	setTerminalFontFamily,
	setTerminalFontSize,
	setTerminalScrollback,
	setTerminalShellPath,
	shellPreferences,
} from './preferences';

function resetPreferences(): void {
	shellPreferences.set({
		locale: 'en-US',
		themeSource: 'system',
		editorMode: 'rich',
		sidebarOpen: true,
		sidebarPinned: true,
		sidebarWidth: 280,
		sidebarSection: 'files',
		sidebarQuery: '',
		sidebarKindFilter: 'all',
		sidebarShowHidden: false,
		settingsSection: 'project',
		settingsQuery: '',
		terminalOpen: false,
		terminalHeight: 180,
		terminalTabs: [
			{
				id: 'terminal-1',
				title: 'Terminal 1',
				cwd: '~',
				status: 'unsupported',
				openedAt: '2026-07-30T00:00:00.000Z',
			},
		],
		activeTerminalTabId: 'terminal-1',
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
	});
}

describe('shell preferences', () => {
	it('clamps resizable shell dimensions to supported ranges', () => {
		resetPreferences();

		setPreferredSidebarWidth(50);
		setPreferredTerminalHeight(999);
		setPreferredDocumentPanelWidth(120);

		expect(get(shellPreferences).sidebarWidth).toBe(234);
		expect(get(shellPreferences).terminalHeight).toBe(360);
		expect(get(shellPreferences).documentPanelWidth).toBe(280);

		setPreferredSidebarWidth(999);
		setPreferredTerminalHeight(50);
		setPreferredDocumentPanelWidth(999);

		expect(get(shellPreferences).sidebarWidth).toBe(512);
		expect(get(shellPreferences).terminalHeight).toBe(120);
		expect(get(shellPreferences).documentPanelWidth).toBe(560);
	});

	it('creates, selects, and closes persisted terminal tabs without losing the fallback tab', () => {
		resetPreferences();

		const secondTab = createTerminalTab();
		expect(get(shellPreferences).terminalOpen).toBe(true);
		expect(get(shellPreferences).terminalTabs).toHaveLength(2);
		expect(get(activeTerminalTab)?.id).toBe(secondTab.id);

		setActiveTerminalTab('terminal-1');
		expect(get(activeTerminalTab)?.id).toBe('terminal-1');

		expect(closeTerminalTab('terminal-1')).toBe(true);
		expect(get(activeTerminalTab)?.id).toBe(secondTab.id);

		expect(closeTerminalTab(secondTab.id)).toBe(false);
		expect(get(shellPreferences).terminalOpen).toBe(false);
		expect(get(shellPreferences).terminalTabs).toHaveLength(1);
		expect(get(activeTerminalTab)?.id).toBe('terminal-1');
	});

	it('updates terminal configuration preferences and clamps numeric inputs', () => {
		resetPreferences();

		setTerminalEnabled(false);
		setAutoApproveOkTools(false);
		setTerminalFontSize(4);
		setTerminalFontFamily('Fira Code');
		setTerminalScrollback(50);
		setTerminalCursorStyle('underline');
		setTerminalCursorBlink(false);
		setTerminalShellPath('/bin/zsh');

		let current = get(shellPreferences);
		expect(current.terminalEnabled).toBe(false);
		expect(current.autoApproveOkTools).toBe(false);
		expect(current.terminalFontSize).toBe(8);
		expect(current.terminalFontFamily).toBe('Fira Code');
		expect(current.terminalScrollback).toBe(100);
		expect(current.terminalCursorStyle).toBe('underline');
		expect(current.terminalCursorBlink).toBe(false);
		expect(current.terminalShellPath).toBe('/bin/zsh');

		setTerminalFontSize(40);
		setTerminalScrollback(999999);
		current = get(shellPreferences);
		expect(current.terminalFontSize).toBe(32);
		expect(current.terminalScrollback).toBe(50000);
	});
});
