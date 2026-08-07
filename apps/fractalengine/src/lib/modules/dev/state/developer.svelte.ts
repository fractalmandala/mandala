const STORAGE_KEY = 'fractalengine:developer';

// Keep PanelId as the type for resizable panels.
export type PanelId = 'sidebar1' | 'sidebar2' | 'sidebar3' | 'sidebar4';
export type VerticalPanelId = 'terminal';

// Keep in sync with the var fallbacks in styles/_sections.sass.
export const PANEL_DEFAULTS: Record<PanelId, number> = {
    sidebar1: 160,
    sidebar2: 300,
    sidebar3: 220,
    sidebar4: 160
};

export const SIDEBAR3_DEFAULTS = 280;
export const PANEL_CLAMPS: Record<PanelId, { min: number; max: number }> = {
    sidebar1: { min: 120, max: 560 },
    sidebar2: { min: 240, max: 480 },
    sidebar3: { min: 120, max: 560 },
    sidebar4: { min: 120, max: 320 }
};
export const VERTICAL_PANEL_DEFAULTS: Record<VerticalPanelId, number> = {
    terminal: 220
};
export const VERTICAL_PANEL_CLAMPS: Record<VerticalPanelId, { min: number; max: number }> = {
    terminal: { min: 120, max: 520 }
};

interface PersistedLayout {
    sidebar1W: number;
    sidebar2W: number;
    sidebar3W: number;
    sidebar4W: number;
    terminalH: number;
    sidebar1Collapsed: boolean;
    sidebar2Collapsed: boolean;
    sidebar3Collapsed: boolean;
    sidebar4Collapsed: boolean;
    terminalOpen: boolean
}

function clamp(panel: PanelId, width: number): number {
    const { min, max } = PANEL_CLAMPS[panel];
    return Math.round(Math.min(max, Math.max(min, width)));
}

function clampVertical(panel: VerticalPanelId, height: number): number {
    const { min, max } = VERTICAL_PANEL_CLAMPS[panel];
    return Math.round(Math.min(max, Math.max(min, height)));
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
    sidebar3W = $state(PANEL_DEFAULTS.sidebar3);
    sidebar4W = $state(PANEL_DEFAULTS.sidebar4);
    terminalH = $state(VERTICAL_PANEL_DEFAULTS.terminal);
    sidebar1Collapsed = $state(false);
    sidebar2Collapsed = $state(false);
    sidebar3Collapsed = $state(true);
    sidebar4Collapsed = $state(true);
    terminalOpen = $state(false);

    constructor() {
        const p = loadPersisted();
        if (typeof p.sidebar1W === 'number') this.sidebar1W = clamp('sidebar1', p.sidebar1W);
        if (typeof p.sidebar2W === 'number') this.sidebar2W = clamp('sidebar1', p.sidebar2W);
        if (typeof p.sidebar3W === 'number') this.sidebar3W = clamp('sidebar1', p.sidebar3W);
        if (typeof p.sidebar4W === 'number') this.sidebar4W = clamp('sidebar1', p.sidebar4W);
        if (typeof p.terminalH === 'number') this.terminalH = clampVertical('terminal', p.terminalH);
        this.sidebar1Collapsed = p.sidebar1Collapsed === true;
        this.sidebar2Collapsed = p.sidebar2Collapsed === true;
        this.sidebar3Collapsed = p.sidebar3Collapsed === true;
        this.sidebar4Collapsed = p.sidebar4Collapsed === true;
        this.terminalOpen = p.terminalOpen === true;
    }

    resize(panel: PanelId, width: number): void {
        const next = clamp(panel, width);
        if (panel === 'sidebar1') this.sidebar1W = next;
        else if (panel === 'sidebar2') this.sidebar2W = next;
        else if (panel === 'sidebar3') this.sidebar3W = next;
        else if (panel === 'sidebar4') this.sidebar4W = next;
        this.persist();
    }

    resetWidth(panel: PanelId): void {
        this.resize(panel, PANEL_DEFAULTS[panel]);
    }

    resizeTerminal(height: number): void {
        this.terminalH = clampVertical('terminal', height);
        this.persist();
    }

    resetTerminalHeight(): void {
        this.resizeTerminal(VERTICAL_PANEL_DEFAULTS.terminal);
    }

    toggleSidebar1(): void {
        this.sidebar1Collapsed = !this.sidebar1Collapsed;
        this.persist();
    }

    toggleSidebar2(): void {
        this.sidebar2Collapsed = !this.sidebar2Collapsed;
        this.persist();
    }

    toggleSidebar3(): void {
        this.sidebar3Collapsed = !this.sidebar3Collapsed;
        this.persist();
    }

    toggleSidebar4(): void {
        this.sidebar4Collapsed = !this.sidebar4Collapsed;
        this.persist();
    }

    toggleTerminal(): void {
        this.terminalOpen = !this.terminalOpen;
        this.persist();
    }

    private persist(): void {
        if (typeof localStorage === 'undefined') return;
        try {
            const snapshot: PersistedLayout = {
                sidebar1W: this.sidebar1W,
                sidebar2W: this.sidebar2W,
                sidebar3W: this.sidebar3W,
                sidebar4W: this.sidebar4W,
                terminalH: this.terminalH,
                sidebar1Collapsed: this.sidebar1Collapsed,
                sidebar2Collapsed: this.sidebar2Collapsed,
                sidebar3Collapsed: this.sidebar3Collapsed,
                sidebar4Collapsed: this.sidebar4Collapsed,
                terminalOpen: this.terminalOpen
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
        } catch {
            // Ignore storage failures.
        }
    }
}

export const layout = new LayoutState();