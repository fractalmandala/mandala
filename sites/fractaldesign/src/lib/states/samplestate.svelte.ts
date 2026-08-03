const STORAGE_KEY = 'fractaldesign:sample';
export type SampleLayout = 'sidebar' | 'tray' | 'rightbar'

interface PersistedLayout {
	sidebarCollapsed: boolean;
	trayCollapsed: boolean;
	rightbarCollapsed: boolean;
	sidebarExpanded: number;
	trayExpanded: number;
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

class SampleState {
	sidebarCollapsed = $state(false);
	trayCollapsed = $state(true);
	rightbarCollapsed = $state(true);
	sidebarExpanded = $state(20);
	trayExpanded = $state(15);
	rightbarExpanded = $state(20);

	constructor() {
		const p = loadPersisted();
		this.sidebarCollapsed = p.sidebarCollapsed ?? false;
		this.trayCollapsed = p.trayCollapsed ?? true;
		this.rightbarCollapsed = p.rightbarCollapsed ?? true;
		if (typeof p.sidebarExpanded === 'number') this.sidebarExpanded = p.sidebarExpanded;
		if (typeof p.trayExpanded === 'number') this.trayExpanded = p.trayExpanded;
		if (typeof p.rightbarExpanded === 'number') this.rightbarExpanded = p.rightbarExpanded;
	}

	setCollapsed(panel: SampleLayout, collapsed: boolean): void {
		if (panel === 'sidebar') this.sidebarCollapsed = collapsed;
		else if (panel === 'tray') this.trayCollapsed = collapsed;
		else if (panel === 'rightbar') this.rightbarCollapsed = collapsed;
		this.persist();
	}

	toggleSidebar(): void {
		this.sidebarCollapsed = !this.sidebarCollapsed;
		this.persist();
	}

	toggleTray(): void {
		this.trayCollapsed = !this.trayCollapsed;
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
				trayCollapsed: this.trayCollapsed,
				rightbarCollapsed: this.rightbarCollapsed,
				sidebarExpanded: this.sidebarExpanded,
				trayExpanded: this.trayExpanded,
				rightbarExpanded: this.rightbarExpanded,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {
			// Ignore storage failures.
		}
	}
}

export const sample = new SampleState();
