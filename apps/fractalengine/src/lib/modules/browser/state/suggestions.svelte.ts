// Omnibox suggestions — merged history + bookmarks (§3.2/B6)
//
// Merges results from history and bookmarks, ranks bookmarks above history,
// keyboard-navigable. Debounced to avoid slamming the IPC on every keystroke.
//
// Singleton used by BrowserShell to pass suggestions to Omnibox.

import { historyRecent } from '$lib/ipc';
import { bookmarks } from './bookmarks.svelte';

export interface SuggestionItem {
	type: 'bookmark' | 'history';
	url: string;
	title: string;
	faviconUrl: string | null;
}

let _query = $state('');
let _results = $state<SuggestionItem[]>([]);
let _loading = $state(false);
let _debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function searchHistory(query: string): Promise<SuggestionItem[]> {
	try {
		const entries = await historyRecent(50);
		const q = query.toLowerCase();
		return entries
			.filter(e => e.url.toLowerCase().includes(q) || e.title.toLowerCase().includes(q))
			.slice(0, 5)
			.map(e => ({ type: 'history' as const, url: e.url, title: e.title, faviconUrl: e.faviconUrl }));
	} catch {
		return [];
	}
}

function searchBookmarks(query: string): SuggestionItem[] {
	const q = query.toLowerCase();
	return bookmarks.entries
		.filter(b => b.url.toLowerCase().includes(q) || b.title.toLowerCase().includes(q))
		.slice(0, 5)
		.map(b => ({ type: 'bookmark' as const, url: b.url, title: b.title, faviconUrl: b.faviconUrl }));
}

async function refresh(query: string): Promise<void> {
	if (!query.trim()) {
		_results = [];
		_loading = false;
		return;
	}
	_loading = true;
	const bookmarkItems = searchBookmarks(query);
	const historyItems = await searchHistory(query);
	// Bookmarks ranked above history, deduplicated by URL
	const seen = new Set<string>();
	_results = [];
	for (const item of [...bookmarkItems, ...historyItems]) {
		const key = item.url;
		if (!seen.has(key)) {
			seen.add(key);
			_results.push(item);
		}
	}
	_loading = false;
}

export function updateQuery(query: string): void {
	_query = query;
	if (_debounceTimer) clearTimeout(_debounceTimer);
	_debounceTimer = setTimeout(() => { void refresh(query); }, 150);
}

export function getResults(): SuggestionItem[] {
	return _results;
}

export function isLoading(): boolean {
	return _loading;
}
