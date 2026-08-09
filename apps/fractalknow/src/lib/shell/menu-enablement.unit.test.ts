import { describe, expect, it, beforeEach } from 'vitest';
import {
	allMenuActions,
	applyMenuEnablement,
	buildMenuEnablement,
	resetMenuEnablementCache,
} from './menu-enablement';
import type { OkDesktopBridge, OkMenuAction } from '$lib/desktop';

const allActions: OkMenuAction[] = allMenuActions();

function createFakeBridge(): {
	bridge: OkDesktopBridge;
	calls: { setMenuEnablement: unknown[]; getMenuEnablement: unknown[] };
} {
	const calls = { setMenuEnablement: [] as unknown[], getMenuEnablement: [] as unknown[] };
	const bridge: OkDesktopBridge = {
		config: {} as never,
		runtime: 'browser-preview',
		appInfo: async () => ({
			name: 'test',
			desktopRuntime: 'browser',
			frontendRuntime: 'svelte',
			styling: 'sass',
			os: 'browser',
			arch: 'unknown',
			appVersion: '0.0.0',
		}),
		onProjectSwitched: () => () => {},
		onMenuAction: () => () => {},
		onDeepLink: () => () => {},
		onUpdateStatus: () => () => {},
		onServerStatus: () => () => {},
		onCrashInvite: () => () => {},
		onConsentRequired: () => () => {},
		onTerminalData: () => () => {},
		onTerminalExit: () => () => {},
		setThemeSource: async () => ({ ok: true }),
		signalThemeApplied: async () => ({ ok: true }),
		setMenuEnablement: async (items) => {
			calls.setMenuEnablement.push(items);
			return { ok: true };
		},
		getMenuEnablement: async () => {
			calls.getMenuEnablement.push(true);
			return {};
		},
		appConfig: {
			read: async () => ({ ok: false } as never),
			write: async () => ({ ok: true }),
		},
		updater: {
			checkStatus: async () => ({ status: 'idle', version: null, message: null, checkedAt: '' }),
			installUpdate: async () => ({ ok: true }),
		},
		terminal: {
			start: async () => ({ ok: true }),
			write: async () => ({ ok: true }),
			stop: async () => ({ ok: true }),
		},
		projects: {
			create: async () => ({ ok: true }),
			readRecent: async () => ({ ok: true } as never),
			writeRecent: async () => ({ ok: true }),
			setProjectPath: async () => ({ ok: true }),
		},
		feedback: {
			captureBugReport: async () => ({ id: 'x', reportPath: null, createdAt: '' }),
			submitFeedback: async () => ({ target: 'external-url', url: null }),
		},
		dialog: {
			openFolder: async () => null,
			openFile: async () => null,
		},
		shell: {
			openExternal: async () => {},
			detectProtocol: async () => ({ ok: false } as never),
		},
		consent: {
			request: async () => false,
			grant: async () => ({ ok: true }),
		},
		server: {
			start: async () => ({ ok: false } as never),
			stop: async () => ({ ok: false } as never),
			status: async () => ({ ok: false } as never),
		},
		crash: {
			simulatePanic: async () => ({ ok: true }),
			listReports: async () => [],
			readReport: async () => null,
		},
	};
	return { bridge, calls };
}

describe('menu-enablement', () => {
	beforeEach(() => {
		resetMenuEnablementCache();
	});

	it('exposes every menu action the shell can dispatch', () => {
		expect(allActions.length).toBeGreaterThanOrEqual(20);
		expect(allActions).toContain('new-doc');
		expect(allActions).toContain('report-bug');
		expect(allActions).toContain('send-feedback');
	});

	it('disables document-scoped commands when no document is active', () => {
		const enablement = buildMenuEnablement({ activeDocument: null });
		expect(enablement['save-version']).toBe(false);
		expect(enablement['rename']).toBe(false);
		expect(enablement['delete']).toBe(false);
	});

	it('enables document-scoped commands when a document is active', () => {
		const enablement = buildMenuEnablement({ activeDocument: 'welcome.md' });
		expect(enablement['save-version']).toBe(true);
		expect(enablement['rename']).toBe(true);
		expect(enablement['delete']).toBe(true);
	});

	it('enables navigate-back/forward only when history stacks are non-empty', () => {
		const empty = buildMenuEnablement({ activeDocument: 'welcome.md' });
		expect(empty['navigate-back']).toBe(false);
		expect(empty['navigate-forward']).toBe(false);

		const withHistory = buildMenuEnablement({
			activeDocument: 'welcome.md',
			canNavigateBack: true,
			canNavigateForward: true,
		});
		expect(withHistory['navigate-back']).toBe(true);
		expect(withHistory['navigate-forward']).toBe(true);
	});

	it('disables kill-terminal when no terminal tab is open', () => {
		const enablement = buildMenuEnablement({ activeTerminal: null });
		expect(enablement['kill-terminal']).toBe(false);
		expect(enablement['toggle-terminal']).toBe(true);
		expect(enablement['new-terminal']).toBe(true);
	});

	it('enables kill-terminal when a terminal is active', () => {
		const enablement = buildMenuEnablement({ activeTerminal: 'term-1' });
		expect(enablement['kill-terminal']).toBe(true);
	});

	it('keeps navigation and shell commands enabled regardless of context', () => {
		const enablement = buildMenuEnablement();
		expect(enablement['focus-command-palette']).toBe(true);
		expect(enablement['settings']).toBe(true);
		expect(enablement['report-bug']).toBe(true);
		expect(enablement['send-feedback']).toBe(true);
		expect(enablement['new-project']).toBe(true);
	});

	it('applies the enablement map to the native menu via the bridge', async () => {
		const { bridge, calls } = createFakeBridge();
		await applyMenuEnablement(bridge, { activeDocument: 'welcome.md' });
		expect(calls.setMenuEnablement.length).toBe(1);
		const first = calls.setMenuEnablement[0] as Record<string, boolean>;
		expect(first['save-version']).toBe(true);
	});

	it('deduplicates repeated enablement updates with the same context', async () => {
		const { bridge, calls } = createFakeBridge();
		await applyMenuEnablement(bridge, { activeDocument: 'a.md' });
		await applyMenuEnablement(bridge, { activeDocument: 'a.md' });
		expect(calls.setMenuEnablement.length).toBe(1);
		await applyMenuEnablement(bridge, { activeDocument: null });
		expect(calls.setMenuEnablement.length).toBe(2);
		await applyMenuEnablement(bridge, { activeDocument: null, activeTerminal: 't1' });
		expect(calls.setMenuEnablement.length).toBe(3);
	});

	it('is a no-op when no bridge is supplied', async () => {
		await expect(applyMenuEnablement(null, {})).resolves.toBeUndefined();
	});
});
