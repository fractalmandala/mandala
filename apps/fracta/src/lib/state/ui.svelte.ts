// Transient view state — modes and panels that are not worth persisting to disk.

export type AppMode = 'capture' | 'organize' | 'workspace';
export type OrganizeTab = 'tags' | 'bookmarks' | 'categories';

const STORAGE_KEY = 'fracta:ui';

interface PersistedUI {
	mode?: AppMode;
	organizeTab?: OrganizeTab;
}

function load(): PersistedUI {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as PersistedUI) : {};
	} catch {
		return {};
	}
}

class UI {
	/** Primary shell mode. */
	mode = $state<AppMode>('workspace');

	/** Active tab inside organize mode. */
	organizeTab = $state<OrganizeTab>('tags');

	/** Title / category / tags strip under the editor. */
	metadataOpen = $state(false);

	/** Source-app auto-tag rules modal. */
	rulesOpen = $state(false);

	/** Provider / API key / model settings modal. */
	agentOpen = $state(false);

	/** Application, editor, and workspace settings. */
	settingsOpen = $state(false);

	/** Agent column over the capture surface. */
	askOpen = $state(false);

	/** Focus token for the sidebar search field. */
	searchFocusToken = $state(0);

	constructor() {
		const p = load();
		if (p.organizeTab === 'tags' || p.organizeTab === 'bookmarks' || p.organizeTab === 'categories') this.organizeTab = p.organizeTab;
	}

	setMode(mode: AppMode) {
		this.mode = mode;
		if (mode === 'organize') this.askOpen = false;
		this.#persist();
	}

	setOrganizeTab(tab: OrganizeTab) {
		this.organizeTab = tab;
		this.#persist();
	}

	toggleMetadata() {
		this.metadataOpen = !this.metadataOpen;
	}

	toggleRules() {
		this.rulesOpen = !this.rulesOpen;
	}

	toggleAgent() {
		this.agentOpen = !this.agentOpen;
	}

	toggleSettings() {
		this.settingsOpen = !this.settingsOpen;
	}

	openSettings() {
		this.settingsOpen = true;
	}

	openAgent() {
		this.agentOpen = true;
	}

	toggleAsk() {
		this.askOpen = !this.askOpen;
		if (this.askOpen && this.mode !== 'workspace') this.mode = 'capture';
	}

	openAsk() {
		if (this.mode !== 'workspace') this.mode = 'capture';
		this.askOpen = true;
	}

	closeAsk() {
		this.askOpen = false;
	}

	focusSearch() {
		this.mode = 'capture';
		this.searchFocusToken++;
	}

	closeOverlays() {
		this.rulesOpen = false;
		this.agentOpen = false;
		this.settingsOpen = false;
		this.metadataOpen = false;
		this.askOpen = false;
	}

	#persist() {
		if (typeof localStorage === 'undefined') return;
		try {
			const snapshot: PersistedUI = {
				mode: this.mode,
				organizeTab: this.organizeTab
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
		} catch {
			// ignore quota / private mode
		}
	}
}

export const ui = new UI();
