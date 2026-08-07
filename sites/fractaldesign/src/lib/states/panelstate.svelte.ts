const STORAGE_KEY = 'fractaldesign:canvas';
export type canvasLayout = 'sidebarL' | 'sidebarR' | 'agent'

export const PANEL_DEFAULTS: Record<canvasLayout, number> = {
	sidebarL: 240,
	sidebarR: 240,
	agent: 360
}

export const PANEL_CLAMPS: Record<canvasLayout, { min: number; max: number }> = {
	sidebarL: { min: 120, max: 360 },
	sidebarR: { min: 120, max: 360 },
	agent: { min: 200, max: 560 }
};

interface PersistedLayout {
	sidebarLW: number,
	sidebarRW: number;
	agentW: number;
	sidebarLCollapsed: boolean;
	sidebarRCollapsed: boolean;
	agentCollapsed: boolean;
}

function clamp(panel: canvasLayout, width: number): number {
	const { min, max } = PANEL_CLAMPS[panel];
	return Math.round(Math.min(max, Math.max(min, width)));
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

class CanvasState {
	sidebarLW = $state(PANEL_DEFAULTS.sidebarL);
	sidebarRW = $state(PANEL_DEFAULTS.sidebarR);
	agentW = $state(PANEL_DEFAULTS.agent);
	sidebarLCollapsed = $state(false);
	sidebarRCollapsed = $state(true);
	agentCollapsed = $state(true);

	constructor() {
		const p = loadPersisted();
		if (typeof p.sidebarLW === 'number') this.sidebarLW = clamp('sidebarL', p.sidebarLW);
		if (typeof p.sidebarRW === 'number') this.sidebarRW = clamp('sidebarR', p.sidebarRW);
		if (typeof p.agentW === 'number') this.agentW = clamp('agent', p.agentW);
		this.sidebarLCollapsed = p.sidebarLCollapsed === false;
		this.sidebarRCollapsed = p.sidebarRCollapsed === false;
		this.agentCollapsed = p.agentCollapsed === true;
	}

	resize(panel: canvasLayout, width: number): void {
		const next = clamp(panel, width);
		if (panel === 'sidebarL') this.sidebarLW = next;
		else if (panel === 'sidebarR') this.sidebarRW = next;
		else if (panel === 'agent') this.agentW = next;
		this.persist();
	}

	resetWidth(panel: canvasLayout): void {
		this.resize(panel, PANEL_DEFAULTS[panel]);
	}

	toggleSidebarL(): void {
		this.sidebarLCollapsed = !this.sidebarLCollapsed;
		this.persist();
	}

	toggleSidebarR(): void {
		this.sidebarRCollapsed = !this.sidebarRCollapsed;
		this.persist();
	}

	toggleAgent(): void {
		this.agentCollapsed = !this.agentCollapsed;
		this.persist();
	}

	private persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const snapshot: PersistedLayout = {
				sidebarLW: this.sidebarLW,
				sidebarRW: this.sidebarRW,
				agentW: this.agentW,
				sidebarLCollapsed: this.sidebarLCollapsed,
				sidebarRCollapsed: this.sidebarRCollapsed,
				agentCollapsed: this.agentCollapsed,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {
			// Ignore storage failures.
		}
	}
}

export const surface = new CanvasState();
