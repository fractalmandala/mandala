import { ideState } from '$lib/state/ide.svelte';
import { registerUndoDomain } from '$lib/state/undo.svelte';
import { UndoHistory, compositeUndoDomain } from '$lib/state/undoHistory.svelte';
import { workspaceLayout } from '$lib/state/workspaceLayout.svelte';
import type { SessionInfo } from '$lib/ipc';
import type { AiSessionMeta, AiSidebarTab, AiWorkTab } from '../types';

const LAYOUT_KEY = 'fractalengine:ai-workspace';
const META_KEY = 'ai:session-meta';

interface SessionMetaOverlay {
	kind: AiSidebarTab;
	pinned: boolean;
	title?: string;
	lastOpenedAt?: number;
}

interface AiLayoutSnapshot {
	sidebarCollapsed: boolean;
	sidebarWidth: number;
	workPanelCollapsed: boolean;
	workPanelWidth: number;
	sidebarTab: AiSidebarTab;
	workTab: AiWorkTab;
	openTabIds: string[];
	activeTabId: string | null;
	pinnedIds: string[];
	sessionMeta: Record<string, SessionMetaOverlay>;
}

function isSidebarTab(value: unknown): value is AiSidebarTab {
	return value === 'home' || value === 'code';
}

function isWorkTab(value: unknown): value is AiWorkTab {
	return value === 'files' || value === 'terminal' || value === 'browser';
}

function clampWorkPanelWidth(width: number): number {
	return Math.max(280, Math.min(720, width));
}

function clampSidebarWidth(width: number): number {
	return Math.max(220, Math.min(480, width));
}

export function parseSessionMetaOverlay(value: unknown): Record<string, SessionMetaOverlay> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
	const overlay: Record<string, SessionMetaOverlay> = {};
	for (const [id, raw] of Object.entries(value)) {
		if (!id || !raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
		const entry = raw as Record<string, unknown>;
		if (!isSidebarTab(entry.kind) || typeof entry.pinned !== 'boolean') continue;
		overlay[id] = {
			kind: entry.kind,
			pinned: entry.pinned,
			...(typeof entry.title === 'string' && entry.title.trim() ? { title: entry.title.trim() } : {}),
			...(typeof entry.lastOpenedAt === 'number' && Number.isFinite(entry.lastOpenedAt)
				? { lastOpenedAt: entry.lastOpenedAt }
				: {}),
		};
	}
	return overlay;
}

function readOverlay(): Record<string, SessionMetaOverlay> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(META_KEY);
		return raw ? parseSessionMetaOverlay(JSON.parse(raw)) : {};
	} catch {
		return {};
	}
}

function readLayout(): Partial<AiLayoutSnapshot> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(LAYOUT_KEY);
		if (!raw) return {};
		const value: unknown = JSON.parse(raw);
		return value && typeof value === 'object' && !Array.isArray(value)
			? value as Partial<AiLayoutSnapshot>
			: {};
	} catch {
		return {};
	}
}

function sessionTitle(session: SessionInfo): string {
	return session.title?.trim() || session.preview?.trim() || 'New chat';
}

export function mergeSessionMeta(
	kernelSessions: SessionInfo[],
	overlay: Record<string, SessionMetaOverlay>,
): AiSessionMeta[] {
	return kernelSessions.map(session => {
		const stored = overlay[session.id];
		return {
			id: session.id,
			title: stored?.title ?? sessionTitle(session),
			kind: stored?.kind ?? 'home',
			pinned: stored?.pinned ?? false,
			lastOpenedAt: stored?.lastOpenedAt ?? session.updatedAt ?? session.createdAt,
		};
	});
}

class AiWorkspaceState {
	sidebarCollapsed = $state(false);
	sidebarWidth = $state(260);
	workPanelCollapsed = $state(true);
	workPanelWidth = $state(400);
	sidebarTab = $state<AiSidebarTab>('home');
	workTab = $state<AiWorkTab>('files');
	openTabIds = $state<string[]>([]);
	activeTabId = $state<string | null>(null);
	sessions = $state<AiSessionMeta[]>([]);
	sessionsError = $state<string | null>(null);
	private history = new UndoHistory<AiLayoutSnapshot>({
		capture: () => this.snapshot(),
		restore: (snapshot) => this.restore(snapshot),
	});
	private sessionMeta: Record<string, SessionMetaOverlay> = {};

	constructor() {
		const layout = readLayout();
		this.sidebarCollapsed = typeof layout.sidebarCollapsed === 'boolean' ? layout.sidebarCollapsed : false;
		this.sidebarWidth = typeof layout.sidebarWidth === 'number' && Number.isFinite(layout.sidebarWidth)
			? clampSidebarWidth(layout.sidebarWidth)
			: 260;
		this.workPanelCollapsed = typeof layout.workPanelCollapsed === 'boolean' ? layout.workPanelCollapsed : true;
		this.workPanelWidth = typeof layout.workPanelWidth === 'number' && Number.isFinite(layout.workPanelWidth)
			? clampWorkPanelWidth(layout.workPanelWidth)
			: 400;
		this.sidebarTab = isSidebarTab(layout.sidebarTab) ? layout.sidebarTab : 'home';
		this.workTab = isWorkTab(layout.workTab) ? layout.workTab : 'files';
		this.openTabIds = Array.isArray(layout.openTabIds)
			? [...new Set(layout.openTabIds.filter((id): id is string => typeof id === 'string' && !!id))]
			: [];
		this.activeTabId = typeof layout.activeTabId === 'string' && this.openTabIds.includes(layout.activeTabId)
			? layout.activeTabId
			: null;
		this.sessionMeta = readOverlay();
	}

	toggleSidebar(): void { this.history.transact(() => { this.sidebarCollapsed = !this.sidebarCollapsed; this.persist(); }); }
	toggleWorkPanel(): void { this.history.transact(() => { this.workPanelCollapsed = !this.workPanelCollapsed; this.persist(); }); }
	setWorkPanelWidth(width: number): void {
		if (!Number.isFinite(width)) return;
		this.workPanelWidth = clampWorkPanelWidth(width);
		this.persist();
	}
	setSidebarWidth(width: number): void {
		if (!Number.isFinite(width)) return;
		this.sidebarWidth = clampSidebarWidth(width);
		this.persist();
	}
	setSidebarTab(tab: AiSidebarTab): void { this.history.transact(() => { this.sidebarTab = tab; this.persist(); }); }
	setWorkTab(tab: AiWorkTab): void { this.history.transact(() => { this.workTab = tab; this.persist(); }); }
	beginResizeGesture(): void { this.history.beginGesture(); }
	endResizeGesture(): void { this.history.endGesture(); }

	async refreshSessions(): Promise<void> {
		this.sessionsError = null;
		try {
			await ideState.refreshSessions();
			// Open tabs count as live even when the kernel doesn't list them yet: a fresh
			// session has no persisted message, so listSessions omits it until the first turn.
			const liveIds = new Set(ideState.sessions.map(session => session.id));
			for (const id of this.openTabIds) liveIds.add(id);
			this.sessionMeta = Object.fromEntries(
				Object.entries(this.sessionMeta).filter(([id]) => liveIds.has(id)),
			);
			this.sessions = this.withDraftSessions(mergeSessionMeta(ideState.sessions, this.sessionMeta));
			if (this.activeTabId && !liveIds.has(this.activeTabId)) this.activeTabId = null;
			this.persist();
		} catch (error) {
			this.sessions = [];
			this.sessionsError = error instanceof Error ? error.message : String(error);
		}
	}

	async newSession(): Promise<void> {
		ideState.newChatSession();
		const id = ideState.ensureSession();
		this.updateMeta(id, { kind: this.sidebarTab, lastOpenedAt: Date.now() });
		if (!this.openTabIds.includes(id)) this.openTabIds = [...this.openTabIds, id];
		this.activeTabId = id;
		this.sessions = this.withDraftSessions(this.sessions);
		this.persist();
	}

	// Sessions that exist only as open tabs (no persisted message yet) still need list
	// entries so the tab strip and sidebar can render them.
	private withDraftSessions(merged: AiSessionMeta[]): AiSessionMeta[] {
		const known = new Set(merged.map(session => session.id));
		const drafts = this.openTabIds.filter(id => !known.has(id)).map(id => {
			const stored = this.sessionMeta[id];
			return {
				id,
				title: stored?.title ?? 'New chat',
				kind: stored?.kind ?? 'home',
				pinned: stored?.pinned ?? false,
				lastOpenedAt: stored?.lastOpenedAt ?? Date.now(),
			};
		});
		return drafts.length > 0 ? [...merged, ...drafts] : merged;
	}

	async openSession(id: string): Promise<void> {
		if (!this.sessions.some(session => session.id === id)) return;
		await ideState.loadChatSession(id);
		if (ideState.currentSessionId !== id) return;
		if (!this.openTabIds.includes(id)) this.openTabIds = [...this.openTabIds, id];
		this.activeTabId = id;
		this.updateMeta(id, { lastOpenedAt: Date.now() });
		this.syncMergedSessions();
		this.persist();
	}

	closeTab(id: string): void {
		const index = this.openTabIds.indexOf(id);
		if (index < 0) return;
		this.history.transact(() => {
		const nextTabIds = this.openTabIds.filter(tabId => tabId !== id);
		const successor = this.activeTabId === id
			? nextTabIds[index] ?? nextTabIds[index - 1] ?? null
			: this.activeTabId;
		this.openTabIds = nextTabIds;
		this.activeTabId = successor;
		if (successor) void ideState.loadChatSession(successor);
		else if (ideState.currentSessionId === id) ideState.newChatSession();
		this.persist();
		});
	}

	togglePin(id: string): void {
		const session = this.sessions.find(item => item.id === id);
		if (!session) return;
		this.history.transact(() => {
		this.updateMeta(id, { kind: session.kind, pinned: !session.pinned });
		this.syncMergedSessions();
		this.persist();
		});
	}

	renameSession(id: string, title: string): void {
		const trimmed = title.trim();
		if (!trimmed || !this.sessions.some(session => session.id === id)) return;
		this.history.transact(() => {
		this.updateMeta(id, { title: trimmed });
		this.syncMergedSessions();
		this.persist();
		});
	}

	pushUndo(): void { this.history.push(); }
	undo(): void { this.history.undo(); }
	redo(): void { this.history.redo(); }

	private updateMeta(id: string, update: Partial<SessionMetaOverlay>): void {
		const existing = this.sessionMeta[id] ?? { kind: this.sidebarTab, pinned: false };
		this.sessionMeta = { ...this.sessionMeta, [id]: { ...existing, ...update } };
	}

	private syncMergedSessions(): void {
		this.sessions = this.sessions.map(session => {
			const stored = this.sessionMeta[session.id];
			return stored
				? { ...session, kind: stored.kind, pinned: stored.pinned, title: stored.title ?? session.title, lastOpenedAt: stored.lastOpenedAt ?? session.lastOpenedAt }
				: session;
		});
	}

	private snapshot(): AiLayoutSnapshot {
		return {
			sidebarCollapsed: this.sidebarCollapsed,
			sidebarWidth: this.sidebarWidth,
			workPanelCollapsed: this.workPanelCollapsed,
			workPanelWidth: this.workPanelWidth,
			sidebarTab: this.sidebarTab,
			workTab: this.workTab,
			openTabIds: [...this.openTabIds],
			activeTabId: this.activeTabId,
			pinnedIds: this.sessions.filter(session => session.pinned).map(session => session.id),
			sessionMeta: structuredClone(this.sessionMeta),
		};
	}

	private restore(snapshot: AiLayoutSnapshot): void {
		this.sidebarCollapsed = snapshot.sidebarCollapsed;
		this.sidebarWidth = Number.isFinite(snapshot.sidebarWidth) ? clampSidebarWidth(snapshot.sidebarWidth) : 260;
		this.workPanelCollapsed = snapshot.workPanelCollapsed;
		this.workPanelWidth = clampWorkPanelWidth(snapshot.workPanelWidth);
		this.sidebarTab = snapshot.sidebarTab;
		this.workTab = snapshot.workTab;
		this.openTabIds = [...snapshot.openTabIds];
		this.activeTabId = snapshot.activeTabId;
		this.sessionMeta = structuredClone(snapshot.sessionMeta);
		this.sessions = this.sessions.map(session => {
			const stored = this.sessionMeta[session.id];
			return {
				...session,
				kind: stored?.kind ?? session.kind,
				pinned: snapshot.pinnedIds.includes(session.id),
				title: stored?.title ?? session.title,
				lastOpenedAt: stored?.lastOpenedAt ?? session.lastOpenedAt,
			};
		});
		this.persist();
	}

	private persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(LAYOUT_KEY, JSON.stringify(this.snapshot()));
			localStorage.setItem(META_KEY, JSON.stringify(this.sessionMeta));
		} catch {
			// Persistence is best effort; the live workspace remains usable without it.
		}
	}

	get historyForUndo(): UndoHistory<AiLayoutSnapshot> {
		return this.history;
	}
}

export const aiWorkspace = new AiWorkspaceState();

registerUndoDomain(compositeUndoDomain('ai', [aiWorkspace.historyForUndo, workspaceLayout.historyForUndo('agent')], aiWorkspace.historyForUndo));
