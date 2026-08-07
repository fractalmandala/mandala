import { UndoHistory } from '$lib/state/undoHistory.svelte';

const STORAGE_KEY = 'fractalengine:design';
export type DesignLayout = 'sidebar' | 'aichat'

interface PersistedLayout {
	sidebarCollapsed: boolean;
	aichatCollapsed: boolean;
	sidebarExpanded: number;
	aichatExpanded: number;
}

function loadPersisted(): Partial<PersistedLayout> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const value: unknown = JSON.parse(raw);
		return value && typeof value === 'object' ? value as Partial<PersistedLayout> : {};
	} catch {
		return {};
	}
}

class DesignState {
	sidebarCollapsed = $state(false);
	rightbarCollapsed = $state(false);
	aichatCollapsed = $state(true);
	sidebarExpanded = $state(300);
	aichatExpanded = $state(400);
	history = new UndoHistory<PersistedLayout>({
		capture: () => this.snapshot(),
		restore: (s) => this.restore(s),
		capacity: 100,
	});

	constructor() {
		const p = loadPersisted();
		this.sidebarCollapsed = typeof p.sidebarCollapsed === 'boolean' ? p.sidebarCollapsed : false;
		this.aichatCollapsed = typeof p.aichatCollapsed === 'boolean' ? p.aichatCollapsed : true;
		if (Number.isFinite(p.sidebarExpanded)) this.sidebarExpanded = Math.max(160, Math.min(400, p.sidebarExpanded!));
		if (Number.isFinite(p.aichatExpanded)) this.aichatExpanded = Math.max(200, Math.min(700, p.aichatExpanded!));
	}

	setCollapsed(panel: DesignLayout, collapsed: boolean): void {
		this.history.transact(() => {
			if (panel === 'sidebar') this.sidebarCollapsed = collapsed;
			else if (panel === 'aichat') this.aichatCollapsed = collapsed;
			this.persist();
		});
	}

	toggleSidebar(): void {
		this.history.transact(() => {
			this.sidebarCollapsed = !this.sidebarCollapsed;
			this.persist();
		});
	}

	toggleAichat(): void {
		this.history.transact(() => {
			this.aichatCollapsed = !this.aichatCollapsed;
			this.persist();
		});
	}

	private snapshot(): PersistedLayout {
		return {
			sidebarCollapsed: this.sidebarCollapsed,
			aichatCollapsed: this.aichatCollapsed,
			sidebarExpanded: this.sidebarExpanded,
			aichatExpanded: this.aichatExpanded
		};
	}

	private restore(snapshot: PersistedLayout): void {
		this.sidebarCollapsed = snapshot.sidebarCollapsed;
		this.aichatCollapsed = snapshot.aichatCollapsed;
		this.sidebarExpanded = snapshot.sidebarExpanded;
		this.aichatExpanded = snapshot.aichatExpanded;
		this.persist();
	}

	get canUndo(): boolean { return this.history.canUndo; }
	get canRedo(): boolean { return this.history.canRedo; }
	get nextUndoOrder(): number { return this.history.nextUndoOrder; }
	get nextRedoOrder(): number { return this.history.nextRedoOrder; }

	pushUndo(): void {
		this.history.push();
	}

	beginLayoutGesture(): void { this.history.beginGesture(); }

	endLayoutGesture(): void {
		this.history.endGesture();
		this.persist();
	}

	setPanelWidth(panel: DesignLayout, width: number): void {
		if (!Number.isFinite(width)) return;
		if (panel === 'sidebar') this.sidebarExpanded = Math.max(160, Math.min(400, width));
		else this.aichatExpanded = Math.max(200, Math.min(700, width));
		this.persist();
	}

	undo(): void {
		this.history.undo();
	}

	redo(): void {
		this.history.redo();
	}

	persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const snapshot: PersistedLayout = {
				sidebarCollapsed: this.sidebarCollapsed,
				aichatCollapsed: this.aichatCollapsed,
				sidebarExpanded: this.sidebarExpanded,
				aichatExpanded: this.aichatExpanded
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {
			// Ignore storage failures.
		}
	}
}

export const design = new DesignState();
