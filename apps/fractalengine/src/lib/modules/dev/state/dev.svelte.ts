import { registerUndoDomain } from '$lib/state/undo.svelte';
import { UndoHistory, compositeUndoDomain } from '$lib/state/undoHistory.svelte';
import { workspaceLayout } from '$lib/state/workspaceLayout.svelte';

const STORAGE_KEY = 'fractalengine:devarea';
export type DevLayout = 'sidebar1' | 'sidebar2';
export type DevItem = 'item1' | 'item2' | 'item3' | 'item4';

interface PersistedLayout {
	sidebar1Collapsed: boolean;
	sidebar2Collapsed: boolean;
	sidebar1Expanded: number;
	sidebar2Expanded: number;
	selectedItem?: number;
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

class DevState {
	sidebar1Collapsed = $state(false);
	sidebar2Collapsed = $state(false);
	sidebar1Expanded = $state(180);
	sidebar2Expanded = $state(160);
	selectedItem = $state(0);
	private history = new UndoHistory<PersistedLayout>({
		capture: () => this.layoutSnapshot(),
		restore: (s) => this.restoreLayout(s),
		capacity: 100,
	});

	constructor() {
		const p = loadPersisted();
		const persistedSelectedItem = p.selectedItem;
		this.sidebar1Collapsed = typeof p.sidebar1Collapsed === 'boolean' ? p.sidebar1Collapsed : false;
		this.sidebar2Collapsed = typeof p.sidebar2Collapsed === 'boolean' ? p.sidebar2Collapsed : false;
		this.selectedItem = typeof persistedSelectedItem === 'number' && Number.isInteger(persistedSelectedItem) && persistedSelectedItem >= 0
			? persistedSelectedItem
			: 0;
		if (Number.isFinite(p.sidebar1Expanded)) this.sidebar1Expanded = Math.max(50, Math.min(240, p.sidebar1Expanded!));
		if (Number.isFinite(p.sidebar2Expanded)) this.sidebar2Expanded = Math.max(120, Math.min(240, p.sidebar2Expanded!));
	}

	setCollapsed(panel: DevLayout, collapsed: boolean): void {
		this.history.transact(() => {
			if (panel === 'sidebar1') this.sidebar1Collapsed = collapsed;
			else if (panel === 'sidebar2') this.sidebar2Collapsed = collapsed;
			this.persist();
		});
	}

	toggleSidebar1(): void {
		this.history.transact(() => {
			this.sidebar1Collapsed = !this.sidebar1Collapsed;
			this.persist();
		});
	}

	toggleSidebar2(): void {
		this.history.transact(() => {
			this.sidebar2Collapsed = !this.sidebar2Collapsed;
			this.persist();
		});
	}

	selectAndOpenItem(newItem: number, inspectorCollapsed?: boolean): void {
		this.history.transact(() => {
			this.selectedItem = newItem;
			if (inspectorCollapsed !== undefined) this.sidebar2Collapsed = inspectorCollapsed;
			this.persist();
		})
	}

	setSidebarWidth(panel: DevLayout, width: number): void {
		if (!Number.isFinite(width)) return;
		if (panel === 'sidebar1') this.sidebar1Expanded = Math.max(50, Math.min(240, width));
		else if (panel === 'sidebar2') this.sidebar2Expanded = Math.max(120, Math.min(240, width));
		this.persist();
	}

	private layoutSnapshot(): PersistedLayout {
		return {
			sidebar1Collapsed: this.sidebar1Collapsed,
			sidebar2Collapsed: this.sidebar2Collapsed,
			sidebar1Expanded: this.sidebar1Expanded,
			sidebar2Expanded: this.sidebar2Expanded,
			selectedItem: this.selectedItem
		};
	}

	private restoreLayout(snapshot: PersistedLayout): void {
		Object.assign(this, snapshot);
		this.persist();
	}

	pushUndo(): void {
		this.history.push();
	}

	beginLayoutGesture(): void {
		this.history.beginGesture();
	}

	endLayoutGesture(): void {
		this.history.endGesture();
	}

	undo(): void {
		this.history.undo();
	}

	redo(): void {
		this.history.redo();
	}

	get historyForUndo(): UndoHistory<PersistedLayout> {
		return this.history;
	}

	/**
	 * Compute the vault-relative docId for a note file path.
	 * Returns the relative path from the first matching vault root, or the basename if no root matches.
	 */


	persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const snapshot = this.layoutSnapshot();
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {
			// Ignore storage failures.
		}
	}
}

export const dev = new DevState();

registerUndoDomain(compositeUndoDomain('dev', [dev.historyForUndo, workspaceLayout.historyForUndo('dev')], dev.historyForUndo));
