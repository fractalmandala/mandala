import { derived, writable } from 'svelte/store';

/**
 * Local AI agent sessions & history (T045b B2).
 *
 * Svelte store over the Tauri activity-log commands (B1,
 * `src-tauri/src/activity_log.rs`): project-local JSONL per session at
 * `.ok/activity/<session-id>.jsonl`. Browser runtime has no activity log —
 * the store degrades to `unavailable` instead of throwing.
 */

export type ActivityEvent = {
	ts: string;
	sessionId: string;
	agent: string;
	kind: 'prompt' | 'edit' | 'command' | 'note' | 'error' | string;
	summary: string;
	paths: string[];
	meta: Record<string, unknown>;
};

export type ActivitySessionSummary = {
	sessionId: string;
	agent: string;
	startedAt: string | null;
	lastEventAt: string | null;
	eventCount: number;
	sizeBytes: number;
};

export type ActivitySessionPage = {
	sessionId: string;
	events: ActivityEvent[];
	offset: number;
	limit: number;
	total: number;
};

export type AgentSessionsStatus = 'unavailable' | 'idle' | 'loading' | 'ready' | 'error';

export type AgentSessionsState = {
	status: AgentSessionsStatus;
	sessions: ActivitySessionSummary[];
	error: string | null;
};

export type SessionDetailState = {
	sessionId: string | null;
	page: ActivitySessionPage | null;
	loading: boolean;
	error: string | null;
};

export const agentSessionsState = writable<AgentSessionsState>({
	status: 'idle',
	sessions: [],
	error: null,
});

export const sessionDetailState = writable<SessionDetailState>({
	sessionId: null,
	page: null,
	loading: false,
	error: null,
});

export type ActivityBridge = {
	listActivitySessions(): Promise<ActivitySessionSummary[]>;
	readActivitySession(sessionId: string, offset: number, limit: number): Promise<ActivitySessionPage>;
	appendActivityEvent(event: {
		sessionId: string;
		agent: string;
		kind: string;
		summary: string;
		paths?: string[];
		meta?: Record<string, unknown>;
	}): Promise<ActivityEvent>;
	pruneActivitySessions(): Promise<{ removedSessions: number; freedBytes: number }>;
};

function createTauriActivityBridge(
	invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>,
): ActivityBridge {
	return {
		listActivitySessions: () => invoke('list_activity_sessions'),
		readActivitySession: (sessionId, offset, limit) =>
			invoke('read_activity_session', { sessionId, offset, limit }),
		appendActivityEvent: (event) => invoke('append_activity_event', { event }),
		pruneActivitySessions: () => invoke('prune_activity_sessions'),
	};
}

let activityBridge: ActivityBridge | null = null;

/** Wire the store to a bridge. Called once on desktop connect; tests inject a mock. */
export function connectActivityBridge(bridge: ActivityBridge | null): void {
	activityBridge = bridge;
	if (!bridge) {
		agentSessionsState.set({ status: 'unavailable', sessions: [], error: null });
		sessionDetailState.set({ sessionId: null, page: null, loading: false, error: null });
	}
}

/** Auto-connect from the Tauri runtime. No-op (stays unavailable) in browser. */
export async function connectActivityBridgeFromRuntime(): Promise<void> {
	try {
		const core = await import('@tauri-apps/api/core');
		if (typeof core.invoke !== 'function') return;
		connectActivityBridge(createTauriActivityBridge((cmd, args) => core.invoke(cmd, args)));
	} catch {
		// Browser runtime — no activity log.
	}
}

export async function refreshAgentSessions(bridge: ActivityBridge | null = activityBridge): Promise<void> {
	if (!bridge) {
		agentSessionsState.set({ status: 'unavailable', sessions: [], error: null });
		return;
	}
	agentSessionsState.update((s) => ({ ...s, status: 'loading', error: null }));
	try {
		const sessions = await bridge.listActivitySessions();
		agentSessionsState.set({ status: 'ready', sessions, error: null });
	} catch (error) {
		agentSessionsState.update((s) => ({
			...s,
			status: 'error',
			error: error instanceof Error ? error.message : String(error),
		}));
	}
}

export async function openAgentSession(
	sessionId: string,
	offset = 0,
	limit = 100,
	bridge: ActivityBridge | null = activityBridge,
): Promise<void> {
	if (!bridge) return;
	sessionDetailState.set({ sessionId, page: null, loading: true, error: null });
	try {
		const page = await bridge.readActivitySession(sessionId, offset, limit);
		sessionDetailState.set({ sessionId, page, loading: false, error: null });
	} catch (error) {
		sessionDetailState.set({
			sessionId,
			page: null,
			loading: false,
			error: error instanceof Error ? error.message : String(error),
		});
	}
}

export function closeAgentSession(): void {
	sessionDetailState.set({ sessionId: null, page: null, loading: false, error: null });
}

/** Append an event and keep the open views fresh. Used by B3 wiring. */
export async function appendAgentActivity(
	event: Parameters<ActivityBridge['appendActivityEvent']>[0],
	bridge: ActivityBridge | null = activityBridge,
): Promise<ActivityEvent | null> {
	if (!bridge) return null;
	const appended = await bridge.appendActivityEvent(event);
	await refreshAgentSessions(bridge);
	return appended;
}

export const agentSessionCount = derived(agentSessionsState, ($s) => $s.sessions.length);

/** Sessions grouped for display: most recent first (backend already sorts). */
export const agentSessions = derived(agentSessionsState, ($s) => $s.sessions);

/**
 * B3: local app session identity. All document/bundle events recorded during
 * this app run share one session id so the Activity view groups them.
 */
const localSessionId = `local-${new Date().toISOString().replace(/[:.]/g, '-')}`;

/**
 * Record a local document/pipeline event. Fire-and-forget: never throws,
 * no-ops in the browser runtime (no bridge connected).
 */
export function logLocalActivity(kind: string, summary: string, paths: string[] = []): void {
	void appendAgentActivity(
		{ sessionId: localSessionId, agent: 'fractalknow', kind, summary, paths },
	).catch(() => {
		// Activity logging must never break the underlying action.
	});
}
