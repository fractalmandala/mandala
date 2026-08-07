// Browser Module — Type Definitions (§3.1 contract freeze)
//
// A1 frozen at S0. Changes require joint agreement at a checkpoint.

export interface Tab {
	id: string;
	url: string;
	title: string;
	favicon_url: string;
	can_go_back: boolean;
	can_go_forward: boolean;
	loading: boolean;
	nav_epoch: number;
}

export interface BrowserWindowInfo {
	window_id: string;
	tabs: Tab[];
	active_tab_id: string;
}

export interface BrowserViewportRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

// Parameter interfaces carry [key: string] index sig for Tauri invoke() compatibility.
export interface BrowserTabCreateParams {
	[key: string]: unknown;
	windowId: string;
	url?: string | null;
	background?: boolean;
}

export interface BrowserTabParams {
	[key: string]: unknown;
	windowId: string;
	tabId: string;
}

export interface BrowserTabReorderParams {
	[key: string]: unknown;
	windowId: string;
	tabId: string;
	toIndex: number;
}

export interface BrowserNavigateParams {
	[key: string]: unknown;
	windowId: string;
	tabId: string;
	url: string;
}

export interface BrowserAutofillParams {
	[key: string]: unknown;
	windowId: string;
	tabId: string;
	entryId: string;
}

export type BrowserEventType =
	| 'tab-created'
	| 'tab-closed'
	| 'tab-activated'
	| 'nav-started'
	| 'nav-committed'
	| 'title-changed'
	| 'favicon-changed'
	| 'load-finished'
	| 'load-failed'
	| 'window-closed';

export interface BrowserEventPayload {
	windowId: string;
	tabId: string;
	navEpoch: number;
}

export interface BrowserEvent {
	type: BrowserEventType;
	payload: BrowserEventPayload;
	url?: string;
	title?: string;
}

export interface Suggestion {
	type: 'history' | 'bookmark';
	url: string;
	title: string;
}
