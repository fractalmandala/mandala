const STORAGE_KEY = 'fractaldesign:native';
export type NativeLayout = 'sidebar' | 'rightbar'

interface PersistedLayout {
	sidebarCollapsed: boolean;
	rightbarCollapsed: boolean;
	sidebarExpanded: number;
	rightbarExpanded: number;
}

function loadPersisted(): Partial<PersistedLayout> {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as Partial<PersistedLayout>) : {};
	} catch {
		return {};
	}
}

class NativeState {
	sidebarCollapsed = $state(false);
	rightbarCollapsed = $state(false);
	sidebarExpanded = $state(240);
	rightbarExpanded = $state(280);

	constructor() {
		const p = loadPersisted();
		this.sidebarCollapsed = p.sidebarCollapsed ?? false;
		this.rightbarCollapsed = p.rightbarCollapsed ?? false;
		if (typeof p.sidebarExpanded === 'number') this.sidebarExpanded = p.sidebarExpanded;
		if (typeof p.rightbarExpanded === 'number') this.rightbarExpanded = p.rightbarExpanded;
	}

	setCollapsed(panel: NativeLayout, collapsed: boolean): void {
		if (panel === 'sidebar') this.sidebarCollapsed = collapsed;
		else if (panel === 'rightbar') this.rightbarCollapsed = collapsed;
		this.persist();
	}

	toggleSidebar(): void {
		this.sidebarCollapsed = !this.sidebarCollapsed;
		this.persist();
	}

	toggleRightbar(): void {
		this.rightbarCollapsed = !this.rightbarCollapsed;
		this.persist();
	}

	persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const snapshot: PersistedLayout = {
				sidebarCollapsed: this.sidebarCollapsed,
				rightbarCollapsed: this.rightbarCollapsed,
				sidebarExpanded: this.sidebarExpanded,
				rightbarExpanded: this.rightbarExpanded,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {
			// Ignore storage failures.
		}
	}
}

export const native = new NativeState();
