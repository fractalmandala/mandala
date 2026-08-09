import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	agentSessions,
	agentSessionsState,
	appendAgentActivity,
	closeAgentSession,
	connectActivityBridge,
	openAgentSession,
	refreshAgentSessions,
	sessionDetailState,
	type ActivityBridge,
	type ActivitySessionPage,
	type ActivitySessionSummary,
} from './agent-sessions';

function summary(id: string, agent = 'claude'): ActivitySessionSummary {
	return {
		sessionId: id,
		agent,
		startedAt: '2026-07-31T10:00:00Z',
		lastEventAt: '2026-07-31T10:05:00Z',
		eventCount: 2,
		sizeBytes: 512,
	};
}

function page(sessionId: string, total = 2): ActivitySessionPage {
	return {
		sessionId,
		events: [
			{
				ts: '2026-07-31T10:00:00Z',
				sessionId,
				agent: 'claude',
				kind: 'prompt',
				summary: 'Started',
				paths: [],
				meta: {},
			},
		],
		offset: 0,
		limit: 100,
		total,
	};
}

function mockBridge(overrides: Partial<ActivityBridge> = {}): ActivityBridge {
	return {
		listActivitySessions: vi.fn().mockResolvedValue([summary('s2'), summary('s1')]),
		readActivitySession: vi.fn().mockImplementation((id: string) => Promise.resolve(page(id))),
		appendActivityEvent: vi.fn().mockImplementation((event) => Promise.resolve({ ts: '2026-07-31T10:06:00Z', paths: [], meta: {}, ...event })),
		pruneActivitySessions: vi.fn().mockResolvedValue({ removedSessions: 1, freedBytes: 128 }),
		...overrides,
	};
}

describe('agent sessions store (T045b B2)', () => {
	beforeEach(() => {
		connectActivityBridge(null);
	});

	it('is unavailable without a bridge (browser runtime)', async () => {
		await refreshAgentSessions();
		expect(get(agentSessionsState).status).toBe('unavailable');
		expect(get(agentSessions)).toEqual([]);
	});

	it('loads session summaries on refresh', async () => {
		const bridge = mockBridge();
		connectActivityBridge(bridge);
		await refreshAgentSessions();
		const state = get(agentSessionsState);
		expect(state.status).toBe('ready');
		expect(state.sessions.map((s) => s.sessionId)).toEqual(['s2', 's1']);
	});

	it('surfaces list errors without throwing', async () => {
		const bridge = mockBridge({
			listActivitySessions: vi.fn().mockRejectedValue(new Error('io error')),
		});
		connectActivityBridge(bridge);
		await refreshAgentSessions();
		const state = get(agentSessionsState);
		expect(state.status).toBe('error');
		expect(state.error).toBe('io error');
	});

	it('opens and closes a session detail page', async () => {
		const bridge = mockBridge();
		connectActivityBridge(bridge);
		await openAgentSession('s1');
		const detail = get(sessionDetailState);
		expect(detail.sessionId).toBe('s1');
		expect(detail.page?.total).toBe(2);
		expect(detail.loading).toBe(false);
		closeAgentSession();
		expect(get(sessionDetailState).sessionId).toBeNull();
	});

	it('append refreshes the session list', async () => {
		const bridge = mockBridge();
		connectActivityBridge(bridge);
		const appended = await appendAgentActivity({
			sessionId: 's1',
			agent: 'claude',
			kind: 'edit',
			summary: 'Edited Doc.md',
			paths: ['/content/Doc.md'],
		});
		expect(appended?.summary).toBe('Edited Doc.md');
		expect(bridge.listActivitySessions).toHaveBeenCalledOnce();
		expect(get(agentSessionsState).status).toBe('ready');
	});

	it('append is a no-op without a bridge', async () => {
		const result = await appendAgentActivity({
			sessionId: 's1',
			agent: 'claude',
			kind: 'note',
			summary: 'x',
		});
		expect(result).toBeNull();
	});
});

describe('logLocalActivity (T045b B3)', () => {
	it('appends under the local app session and never throws on bridge failure', async () => {
		const { logLocalActivity } = await import('./agent-sessions');
		const bridge = mockBridge();
		connectActivityBridge(bridge);
		logLocalActivity('edit', 'Created Untitled.md', ['/content/Untitled.md']);
		await vi.waitFor(() => expect(bridge.appendActivityEvent).toHaveBeenCalledOnce());
		expect(bridge.appendActivityEvent).toHaveBeenCalledWith(
			expect.objectContaining({ agent: 'fractalknow', kind: 'edit', summary: 'Created Untitled.md' }),
		);

		bridge.appendActivityEvent = vi.fn(async () => {
			throw new Error('disk full');
		});
		expect(() => logLocalActivity('edit', 'boom')).not.toThrow();
	});

	it('is a no-op without a bridge', async () => {
		const { logLocalActivity } = await import('./agent-sessions');
		connectActivityBridge(null);
		expect(() => logLocalActivity('note', 'x')).not.toThrow();
	});
});
