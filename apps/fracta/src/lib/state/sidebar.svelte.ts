const STORAGE_KEY = 'fractasidebar'

export const SIDEBAR_WIDTH = {
	collapsed: 48,
	expanded: 320
} as const

interface PersistedLayout {
	sidebarCollapsed: boolean
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

class LayoutState {
	sidebarCollapsed = $state(false)

	constructor() {
		const p = loadPersisted();
		this.sidebarCollapsed = p.sidebarCollapsed === true
	}

	get sidebarWidth(): number {
		return this.sidebarCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;
	}

	toggleSidebar(): void {
		this.sidebarCollapsed = !this.sidebarCollapsed;
		this.persist();
	}

	private persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const snapshot: PersistedLayout = {
				sidebarCollapsed: this.sidebarCollapsed
			}
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {

		}
	}
}

export const layout = new LayoutState();
