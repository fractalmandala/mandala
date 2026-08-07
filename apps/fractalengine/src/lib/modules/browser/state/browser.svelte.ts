import { onBrowserEvent, browserWindowState, browserTabCreate, browserTabClose, browserTabActivate, browserTabReorder, browserTabReopenClosed, browserNavigateTab, browserReloadTab, browserStop, browserGoBackTab, browserGoForwardTab, browserWindowClose } from '$lib/ipc';
import type { BrowserEvent, BrowserEventType, Tab, BrowserTabCreateParams, BrowserNavigateParams, BrowserTabParams } from '../types';

export type { Tab };

function deriveTitle(url: string): string {
	try {
		const u = new URL(url);
		// Strip www. and use hostname as a reasonable default
		let title = u.hostname.replace(/^www\./, '');
		// If path is non-trivial, show a shorter path segment
		if (u.pathname && u.pathname !== '/') {
			const segs = u.pathname.split('/').filter(Boolean);
			if (segs.length > 0) title = segs[segs.length - 1].replace(/[-_]/g, ' ') + ' — ' + title;
		}
		return decodeURIComponent(title);
	} catch {
		return url;
	}
}

function defaultFavicon(url: string): string {
	try {
		return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=16`;
	} catch {
		return '';
	}
}

interface InternalTab {
	id: string;
	url: string;
	title: string;
	favicon_url: string;
	can_go_back: boolean;
	can_go_forward: boolean;
	loading: boolean;
	nav_epoch: number;
}

export class BrowserWindowState {
	readonly windowId: string;
	tabs = $state<InternalTab[]>([]);
	activeTabId = $state<string>('');
	private unlisten: (() => void) | null = null;
	private nextEpoch = 1;

	constructor(windowId: string) {
		this.windowId = windowId;
	}

	subscribe(): void {
		this.unlisten = onBrowserEvent((event: BrowserEvent) => {
			if (event.payload.windowId !== this.windowId) return;
			this.handleEvent(event);
		});
		// The engine created this window (and its initial tab) before the chrome webview
		// loaded, so those events are gone — seed from a one-shot snapshot, then follow events.
		void this.seedFromEngine();
	}

	private async seedFromEngine(): Promise<void> {
		try {
			const info = await browserWindowState(this.windowId);
			if (!info) return;
			// Events that raced ahead of the snapshot win: only fill in tabs we don't know.
			const known = new Set(this.tabs.map(t => t.id));
			const seeded = info.tabs
				.filter(t => !known.has(t.id))
				.map(t => ({
					id: t.id,
					url: t.url,
					title: t.title || (t.url ? deriveTitle(t.url) : 'New Tab'),
					favicon_url: t.favicon_url || (t.url ? defaultFavicon(t.url) : ''),
					can_go_back: t.can_go_back,
					can_go_forward: t.can_go_forward,
					loading: t.loading,
					nav_epoch: t.nav_epoch,
				}));
			if (seeded.length > 0) this.tabs = [...this.tabs, ...seeded];
			if (!this.activeTabId && info.active_tab_id) this.activeTabId = info.active_tab_id;
		} catch {
			// Unknown window / engine not ready — the event stream remains the fallback.
		}
	}

	destroy(): void {
		this.unlisten?.();
		this.unlisten = null;
	}

	private handleEvent(event: BrowserEvent): void {
		const { tabId, navEpoch } = event.payload;

		switch (event.type) {
			case 'tab-created': {
				const tab: InternalTab = {
					id: tabId,
					url: event.url || '',
					title: event.title || 'New Tab',
					favicon_url: event.url ? defaultFavicon(event.url) : '',
					can_go_back: false,
					can_go_forward: false,
					loading: false,
					nav_epoch: navEpoch,
				};
				this.tabs = [...this.tabs, tab];
				break;
			}
			case 'tab-closed': {
				this.tabs = this.tabs.filter(t => t.id !== tabId);
				if (this.activeTabId === tabId) {
					this.activeTabId = this.tabs[this.tabs.length - 1]?.id || '';
				}
				break;
			}
			case 'tab-activated': {
				this.activeTabId = tabId;
				break;
			}
			case 'nav-started': {
				this.updateTab(tabId, navEpoch, (tab) => {
					tab.loading = true;
					if (event.url) tab.url = event.url;
				});
				break;
			}
			case 'nav-committed': {
				this.updateTab(tabId, navEpoch, (tab) => {
					tab.loading = false;
					if (event.url) {
						tab.url = event.url;
						if (!event.title) tab.title = deriveTitle(event.url);
						tab.favicon_url = defaultFavicon(event.url);
					}
					if (event.title) tab.title = event.title;
				});
				break;
			}
			case 'title-changed': {
				this.updateTab(tabId, navEpoch, (tab) => {
					if (event.title) tab.title = event.title;
				});
				break;
			}
			case 'favicon-changed': {
				this.updateTab(tabId, navEpoch, (tab) => {
					if (event.url) tab.favicon_url = event.url;
				});
				break;
			}
			case 'load-finished':
			case 'load-failed': {
				this.updateTab(tabId, navEpoch, (tab) => { tab.loading = false; });
				break;
			}
		}
	}

	private updateTab(tabId: string, navEpoch: number, updater: (tab: InternalTab) => void): void {
		this.tabs = this.tabs.map(tab => {
			if (tab.id !== tabId || navEpoch < tab.nav_epoch) return tab;
			const updated = { ...tab };
			updater(updated);
			if (navEpoch > updated.nav_epoch) updated.nav_epoch = navEpoch;
			return updated;
		});
	}

	// ── Derived state ──

	activeTab = $derived(this.tabs.find(tab => tab.id === this.activeTabId) || null);
	activeUrl = $derived(this.activeTab?.url || '');

	async createTab(url?: string, background?: boolean): Promise<void> {
		await browserTabCreate({ windowId: this.windowId, url: url ?? null, background });
	}

	async closeTab(tabId: string): Promise<void> {
		await browserTabClose({ windowId: this.windowId, tabId });
	}

	async selectTab(tabId: string): Promise<void> {
		await browserTabActivate({ windowId: this.windowId, tabId });
	}

	async navigate(tabId: string, url: string): Promise<void> {
		await browserNavigateTab({ windowId: this.windowId, tabId, url });
	}

	/**
	 * Navigate the tab the native engine currently marks active.
	 *
	 * Chrome may receive user input before its event mirror has finished seeding after a
	 * standalone browser window opens. Resolve the tab from the engine at the action boundary
	 * so address-bar navigation never depends on that startup race.
	 */
	async navigateActive(url: string): Promise<void> {
		const info = await browserWindowState(this.windowId);
		const tabId = info?.active_tab_id || this.activeTabId;
		if (!tabId) {
			await this.createTab(url);
			return;
		}
		await this.navigate(tabId, url);
	}

	async reload(tabId: string): Promise<void> {
		await browserReloadTab({ windowId: this.windowId, tabId });
	}

	async stop(tabId: string): Promise<void> {
		await browserStop({ windowId: this.windowId, tabId });
	}

	async goBack(tabId: string): Promise<void> {
		await browserGoBackTab({ windowId: this.windowId, tabId });
	}

	async goForward(tabId: string): Promise<void> {
		await browserGoForwardTab({ windowId: this.windowId, tabId });
	}

	async reopenClosedTab(): Promise<void> {
		await browserTabReopenClosed(this.windowId);
	}

	async closeWindow(): Promise<void> {
		await browserWindowClose(this.windowId);
	}

	// ── Per-window instance cache ──
	private static instances = new Map<string, BrowserWindowState>();

	static forWindow(windowId: string): BrowserWindowState {
		let instance = BrowserWindowState.instances.get(windowId);
		if (!instance) {
			instance = new BrowserWindowState(windowId);
			BrowserWindowState.instances.set(windowId, instance);
			instance.subscribe();
		}
		return instance;
	}

	static destroyWindow(windowId: string): void {
		const instance = BrowserWindowState.instances.get(windowId);
		if (instance) {
			instance.destroy();
			BrowserWindowState.instances.delete(windowId);
		}
	}
}
