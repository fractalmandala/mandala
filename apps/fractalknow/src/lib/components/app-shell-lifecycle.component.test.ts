import { render, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OkDesktopBridge, OkUnsubscribe } from '$lib/desktop/types';
import AppShell from './AppShell.svelte';

const desktopBridgeStore = vi.hoisted(() => {
	type Subscriber = (value: unknown) => void;
	let value: unknown = { status: 'loading', bridge: null };
	const subscribers = new Set<Subscriber>();

	return {
		reset() {
			value = { status: 'loading', bridge: null };
			subscribers.clear();
		},
		set(next: unknown) {
			value = next;
			for (const subscriber of subscribers) subscriber(value);
		},
		subscribe(subscriber: Subscriber) {
			subscribers.add(subscriber);
			subscriber(value);
			return () => subscribers.delete(subscriber);
		},
	};
});

vi.mock('$lib/desktop', () => ({
	desktopBridge: desktopBridgeStore,
}));

type BridgeFixture = {
	bridge: OkDesktopBridge;
	unsubscribers: ReturnType<typeof vi.fn>[];
};

function ok() {
	return { ok: true } as const;
}

function unsupported(feature: string) {
	return { ok: false, reason: 'not-implemented', feature } as const;
}

function listener(unsubscribers: ReturnType<typeof vi.fn>[]) {
	return (_callback: (payload: never) => void): OkUnsubscribe => {
		const unsubscribe = vi.fn();
		unsubscribers.push(unsubscribe);
		return unsubscribe;
	};
}

function createBridgeFixture(projectName: string): BridgeFixture {
	const unsubscribers: ReturnType<typeof vi.fn>[] = [];
	const bridge: OkDesktopBridge = {
		runtime: 'tauri',
		config: {
			collabUrl: '',
			apiOrigin: '',
			projectPath: `/tmp/${projectName}`,
			projectName,
			mode: 'editor',
			e2eSmoke: false,
			singleFile: false,
			initialDoc: null,
			freshlyCreated: false,
			ptyAvailable: true,
		},
		appInfo: vi.fn(async () => ({
			name: 'FractalKnow',
			desktopRuntime: 'Tauri v2',
			frontendRuntime: 'SvelteKit SPA',
			styling: 'tab-indented Sass',
			os: 'macos',
			arch: 'aarch64',
			appVersion: '0.1.0',
		})),
		onProjectSwitched: listener(unsubscribers),
		onMenuAction: listener(unsubscribers),
		onDeepLink: listener(unsubscribers),
		onUpdateStatus: listener(unsubscribers),
		onServerStatus: listener(unsubscribers),
		onCrashInvite: listener(unsubscribers),
		onConsentRequired: listener(unsubscribers),
		onTerminalData: listener(unsubscribers),
		onTerminalExit: listener(unsubscribers),
		setThemeSource: vi.fn(async () => ok()),
		signalThemeApplied: vi.fn(async () => ok()),
		setMenuEnablement: vi.fn(async () => ok()),
		getMenuEnablement: vi.fn(async () => ({})),
		updater: {
			checkStatus: vi.fn(async () => unsupported('updater.checkStatus')),
			installUpdate: vi.fn(async () => unsupported('updater.installUpdate')),
		},
		terminal: {
			start: vi.fn(async () => unsupported('terminal.start')),
			write: vi.fn(async () => unsupported('terminal.write')),
			stop: vi.fn(async () => unsupported('terminal.stop')),
		},
		projects: {
			create: vi.fn(async () => unsupported('projects.create')),
			readRecent: vi.fn(async () => []),
			writeRecent: vi.fn(async () => ok()),
			setProjectPath: vi.fn(async () => ok()),
		},
		appConfig: {
			read: vi.fn(async () => unsupported('appConfig.read')),
			write: vi.fn(async () => ok()),
		},
		feedback: {
			captureBugReport: vi.fn(async () => unsupported('feedback.captureBugReport')),
			submitFeedback: vi.fn(async () => ({ target: 'external-url', url: 'https://example.test' } as const)),
		},
		dialog: {
			openFolder: vi.fn(async () => null),
			openFile: vi.fn(async () => null),
		},
		shell: {
			openExternal: vi.fn(async () => undefined),
			detectProtocol: vi.fn(async () => unsupported('shell.detectProtocol')),
		},
		consent: {
			request: vi.fn(async () => false),
			grant: vi.fn(async () => ok()),
		},
		server: {
			start: vi.fn(async () => unsupported('server.start')),
			stop: vi.fn(async () => unsupported('server.stop')),
			status: vi.fn(async () => unsupported('server.status')),
		},
		crash: {
			simulatePanic: vi.fn(async () => ok()),
			listReports: vi.fn(async () => []),
			readReport: vi.fn(async () => null),
		},
	};

	return { bridge, unsubscribers };
}

describe('AppShell desktop listener lifecycle', () => {
	beforeEach(() => {
		desktopBridgeStore.reset();
	});

	it('cleans up bridge subscriptions when the bridge changes and when the shell unmounts', async () => {
		const first = createBridgeFixture('first');
		const second = createBridgeFixture('second');

		desktopBridgeStore.set({ status: 'ready', bridge: first.bridge });
		const { unmount } = render(AppShell);

		await waitFor(() => expect(first.bridge.signalThemeApplied).toHaveBeenCalled());
		expect(first.unsubscribers).toHaveLength(9);

		desktopBridgeStore.set({ status: 'ready', bridge: second.bridge });

		await waitFor(() => expect(second.bridge.signalThemeApplied).toHaveBeenCalled());
		expect(first.unsubscribers.every((unsubscribe) => unsubscribe.mock.calls.length === 1)).toBe(true);
		expect(second.unsubscribers).toHaveLength(9);

		unmount();
		expect(second.unsubscribers.every((unsubscribe) => unsubscribe.mock.calls.length === 1)).toBe(true);
	});
});
