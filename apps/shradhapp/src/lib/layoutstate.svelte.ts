const STORAGE_KEY = 'shradhapp:layout';

// Keep PanelId as the type for resizable panels.
export type PanelId = 'sidebar1' | 'sidebar2';

// Keep in sync with the var fallbacks in styles/_sections.sass.
export const PANEL_DEFAULTS: Record<PanelId, number> = {
    sidebar1: 160,
    sidebar2: 160
};

export const PANEL_CLAMPS: Record<PanelId, { min: number; max: number }> = {
    sidebar1: { min: 120, max: 480 },
    sidebar2: { min: 120, max: 480 }
};

interface PersistedLayout {
    sidebar1W: number;
    sidebar2W: number;
    sidebar1Collapsed: boolean;
    sidebar2Collapsed: boolean;
}

function clamp(panel: PanelId, width: number): number {
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

class LayoutState {
    sidebar1W = $state(PANEL_DEFAULTS.sidebar1);
    sidebar2W = $state(PANEL_DEFAULTS.sidebar2);
    sidebar1Collapsed = $state(false);
    sidebar2Collapsed = $state(false);

    constructor() {
        const p = loadPersisted();
        if (typeof p.sidebar1W === 'number') this.sidebar1W = clamp('sidebar1', p.sidebar1W);
        if (typeof p.sidebar2W === 'number') this.sidebar2W = clamp('sidebar2', p.sidebar2W);
        this.sidebar1Collapsed = p.sidebar1Collapsed === true;
        this.sidebar2Collapsed = p.sidebar2Collapsed === true;
    }

    resize(panel: PanelId, width: number): void {
        const next = clamp(panel, width);
        if (panel === 'sidebar1') this.sidebar1W = next;
        else if (panel === 'sidebar2') this.sidebar2W = next;
        this.persist();
    }

    resetWidth(panel: PanelId): void {
        this.resize(panel, PANEL_DEFAULTS[panel]);
    }

    toggleSidebar1(): void {
        this.sidebar1Collapsed = !this.sidebar1Collapsed;
        this.persist();
    }

    toggleSidebar2(): void {
        this.sidebar2Collapsed = !this.sidebar2Collapsed;
        this.persist();
    }

    private persist(): void {
        if (typeof localStorage === 'undefined') return;
        try {
            const snapshot: PersistedLayout = {
                sidebar1W: this.sidebar1W,
                sidebar2W: this.sidebar2W,
                sidebar1Collapsed: this.sidebar1Collapsed,
                sidebar2Collapsed: this.sidebar2Collapsed,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
        } catch {
            // Ignore storage failures.
        }
    }
}

export const layout = new LayoutState();
