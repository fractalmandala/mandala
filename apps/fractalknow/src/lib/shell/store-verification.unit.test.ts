import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	activePanel,
	activeTarget,
	appConfig,
	configPersistence,
	configValidationIssues,
	defaultPreferences,
	desktopEventHistory,
	desktopEvents,
	invalidConfigState,
	navigateBack,
	navigateForward,
	navigationState,
	normalizeAppConfig,
	openTarget,
	recordServerStatus,
	recordUpdateStatus,
	resetAppConfig,
	setAgentToolConfig,
	setConfigPersistCommand,
	setPreferredDocumentPanelWidth,
	setPreferredSidebarWidth,
	setPreferredTerminalHeight,
	shellPreferences,
	shellState,
	updateStatus,
} from './index';

function resetShellStores(): void {
	shellPreferences.set(defaultPreferences);
	shellState.set({
		sidebarOpen: true,
		commandPaletteOpen: false,
		activeDialog: 'none',
		activePanel: 'migration',
		activeTarget: {
			kind: 'migration',
			path: '/migration',
			title: 'Migration Plan',
		},
		editorMode: 'rich',
		terminalOpen: false,
		searchQuery: '',
		rightPanelOpen: false,
		rightPanelView: 'activity',
		rightPanelWidth: 352,
	});
	navigationState.set({ backStack: [], forwardStack: [], lastAction: null });
	desktopEvents.set({
		lastMenuAction: null,
		projectConfig: null,
		deepLink: null,
		updateStatus: null,
		serverStatus: null,
		crashInvite: null,
		consentRequired: null,
		history: [],
		eventCount: 0,
	});
	resetAppConfig();
	setConfigPersistCommand(null);
}

async function flushMicrotasks(): Promise<void> {
	await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
	await Promise.resolve();
}

describe('shared shell stores', () => {
	beforeEach(resetShellStores);

	it('applies reducer-style shell updates and keeps derived navigation stores in sync', () => {
		openTarget({
			kind: 'doc',
			path: '/content/Welcome.md',
			title: 'Welcome.md',
		});
		openTarget({
			kind: 'asset',
			path: '/assets/hero.webp',
			title: 'hero.webp',
		});

		expect(get(activePanel)).toBe('editor');
		expect(get(activeTarget)).toMatchObject({ path: '/assets/hero.webp' });
		expect(get(navigationState)).toMatchObject({
			backStack: [
				expect.objectContaining({ path: '/migration' }),
				expect.objectContaining({ path: '/content/Welcome.md' }),
			],
			forwardStack: [],
			lastAction: 'open',
		});

		expect(navigateBack()).toBe(true);
		expect(get(activeTarget)).toMatchObject({ path: '/content/Welcome.md' });
		expect(get(navigationState)).toMatchObject({
			backStack: [expect.objectContaining({ path: '/migration' })],
			forwardStack: [expect.objectContaining({ path: '/assets/hero.webp' })],
			lastAction: 'back',
		});

		expect(navigateForward()).toBe(true);
		expect(get(activeTarget)).toMatchObject({ path: '/assets/hero.webp' });
		expect(get(navigationState).lastAction).toBe('forward');
	});

	it('clamps persisted dimension reducers and exposes derived desktop event state', () => {
		setPreferredSidebarWidth(10);
		setPreferredTerminalHeight(999);
		setPreferredDocumentPanelWidth(999);

		expect(get(shellPreferences)).toMatchObject({
			sidebarWidth: 234,
			terminalHeight: 360,
			documentPanelWidth: 560,
		});

		recordUpdateStatus({
			status: 'available',
			version: '0.2.0',
			message: 'Ready',
			checkedAt: '2026-07-31T00:00:00.000Z',
		});
		recordServerStatus({
			status: 'running',
			url: 'http://127.0.0.1:3000',
			message: null,
			changedAt: '2026-07-31T00:00:01.000Z',
		});

		expect(get(updateStatus)).toMatchObject({ status: 'available', version: '0.2.0' });
		expect(get(desktopEventHistory).map((event) => event.kind)).toEqual([
			'server-status',
			'update-status',
		]);
	});

	it('keeps event history bounded to the most recent diagnostics', () => {
		for (let index = 0; index < 35; index += 1) {
			recordServerStatus({
				status: 'running',
				url: `http://127.0.0.1:${3000 + index}`,
				message: null,
				changedAt: `2026-07-31T00:00:${String(index).padStart(2, '0')}.000Z`,
			});
		}

		const history = get(desktopEventHistory);
		expect(history).toHaveLength(30);
		expect(history[0].payload).toMatchObject({ url: 'http://127.0.0.1:3034' });
		expect(history.at(-1)?.payload).toMatchObject({ url: 'http://127.0.0.1:3005' });
	});

	it('normalizes localStorage-era config shapes to current defaults', () => {
		expect(
			normalizeAppConfig({
				project: { name: 'Docs', path: '/tmp/docs', singleFile: 'yes' },
				appearance: { themeSource: 'solarized', density: 'compact' },
				validation: { validateOnSave: false },
				syncCollaboration: { mode: 'full', collaborationEnabled: true },
				agentTools: { defaultProvider: 'custom', enabledProviders: ['unknown'] },
			}),
		).toMatchObject({
			version: 1,
			project: { name: 'Docs', path: '/tmp/docs', singleFile: false },
			appearance: { themeSource: 'system', density: 'compact' },
			validation: { validateOnSave: false, markdownLint: true },
			syncCollaboration: { mode: 'full', collaborationEnabled: true, serverUrl: '' },
			agentTools: { defaultProvider: 'custom', enabledProviders: ['codex'] },
		});
	});

	it('derives invalid config states and persists through native command hooks when registered', async () => {
		const persistCommand = vi.fn(async () => ({ ok: true as const }));
		setConfigPersistCommand(persistCommand);

		appConfig.update((config) => ({
			...config,
			project: { ...config.project, apiOrigin: 'not-a-url' },
			syncCollaboration: {
				...config.syncCollaboration,
				autoSync: true,
				collaborationEnabled: true,
				serverUrl: '',
			},
		}));
		setAgentToolConfig({ defaultProvider: 'claude', enabledProviders: ['codex'] });
		await flushMicrotasks();

		expect(get(configValidationIssues).map((issue) => issue.path)).toEqual([
			'project.apiOrigin',
			'agentTools.defaultProvider',
			'syncCollaboration.autoSync',
			'syncCollaboration.serverUrl',
		]);
		expect(get(invalidConfigState)).toMatchObject({ hasErrors: true, hasWarnings: true });
		expect(persistCommand).toHaveBeenCalled();
		expect(get(configPersistence).status).toBe('synced');
	});
});
