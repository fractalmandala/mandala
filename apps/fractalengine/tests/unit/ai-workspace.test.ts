import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { SessionInfo } from '$lib/ipc';

const { ideState } = vi.hoisted(() => {
	(globalThis as unknown as { $state: <T>(value: T) => T }).$state = <T>(value: T) => value;
	return {
		ideState: {
			sessions: [] as SessionInfo[],
			currentSessionId: null as string | null,
			refreshSessions: vi.fn().mockResolvedValue(undefined),
			newChatSession: vi.fn(),
			loadChatSession: vi.fn().mockResolvedValue(undefined),
		}
	};
});

vi.mock('$lib/state/ide.svelte', () => ({ ideState }));
vi.mock('$lib/state/undo.svelte', () => ({ registerUndoDomain: vi.fn() }));

import { aiWorkspace, mergeSessionMeta, parseSessionMetaOverlay } from '$lib/modules/ai/state/ai.svelte';

const kernelSessions: SessionInfo[] = [
	{ id: 'session-a', title: 'Kernel title', createdAt: 10, updatedAt: 20, messageCount: 1, preview: null, model: null },
	{ id: 'session-b', title: null, createdAt: 30, updatedAt: 40, messageCount: 1, preview: 'Preview title', model: null },
];

describe('AI workspace session state', () => {
	it('merges kernel sessions with the local metadata overlay', () => {
		const sessions = mergeSessionMeta(kernelSessions, {
			'session-a': { kind: 'code', pinned: true, title: 'Renamed', lastOpenedAt: 99 },
		});

		expect(sessions).toEqual([
			{ id: 'session-a', title: 'Renamed', kind: 'code', pinned: true, lastOpenedAt: 99 },
			{ id: 'session-b', title: 'Preview title', kind: 'home', pinned: false, lastOpenedAt: 40 },
		]);
	});

	it('rejects malformed metadata overlays without throwing', () => {
		expect(parseSessionMetaOverlay('{not-json')).toEqual({});
		expect(parseSessionMetaOverlay({
			valid: { kind: 'home', pinned: false },
			badKind: { kind: 'other', pinned: false },
			badPin: { kind: 'code', pinned: 'yes' },
		})).toEqual({ valid: { kind: 'home', pinned: false } });
	});

	it('merges shared IDE and design chat history into the AI workspace', async () => {
		const refreshSessions = vi.mocked(ideState.refreshSessions);
		refreshSessions.mockClear();
		ideState.sessions = [...kernelSessions];
		aiWorkspace.openTabIds = [];
		aiWorkspace.activeTabId = null;

		await aiWorkspace.refreshSessions();

		expect(refreshSessions).toHaveBeenCalledOnce();
		expect(aiWorkspace.sessions).toEqual([
			{ id: 'session-a', title: 'Kernel title', kind: 'home', pinned: false, lastOpenedAt: 20 },
			{ id: 'session-b', title: 'Preview title', kind: 'home', pinned: false, lastOpenedAt: 40 },
		]);
	});

	it('refreshes shared history when the AI layout mounts', () => {
		const layoutSource = readFileSync(
			resolve(process.cwd(), 'src/lib/modules/ai/components/AiLayout.svelte'),
			'utf8'
		);

		expect(layoutSource).toMatch(
			/onMount\(\(\) => \{\s*void aiWorkspace\.refreshSessions\(\);\s*\}\);/
		);
	});

	it('closes the active tab atomically and restores it with one undo', () => {
		const loadSession = vi.mocked(ideState.loadChatSession);
		loadSession.mockClear();
		aiWorkspace.sessions = mergeSessionMeta(kernelSessions, {});
		aiWorkspace.openTabIds = ['session-a', 'session-b'];
		aiWorkspace.activeTabId = 'session-a';

		aiWorkspace.closeTab('session-a');
		expect(aiWorkspace.openTabIds).toEqual(['session-b']);
		expect(aiWorkspace.activeTabId).toBe('session-b');
		expect(loadSession).toHaveBeenCalledWith('session-b');

		aiWorkspace.undo();
		expect(aiWorkspace.openTabIds).toEqual(['session-a', 'session-b']);
		expect(aiWorkspace.activeTabId).toBe('session-a');
		aiWorkspace.undo();
		expect(aiWorkspace.openTabIds).toEqual(['session-a', 'session-b']);
	});

	it('round-trips a pin mutation through undo and redo', () => {
		aiWorkspace.sessions = [{ id: 'session-pin-test', title: 'Pin test', kind: 'home', pinned: false, lastOpenedAt: 1 }];
		aiWorkspace.openTabIds = [];
		aiWorkspace.activeTabId = null;

		aiWorkspace.togglePin('session-pin-test');
		expect(aiWorkspace.sessions.find(session => session.id === 'session-pin-test')?.pinned).toBe(true);
		aiWorkspace.undo();
		expect(aiWorkspace.sessions.find(session => session.id === 'session-pin-test')?.pinned).toBe(false);
		aiWorkspace.redo();
		expect(aiWorkspace.sessions.find(session => session.id === 'session-pin-test')?.pinned).toBe(true);
		aiWorkspace.undo();
	});
});
