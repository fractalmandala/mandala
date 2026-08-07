/**
 * Browser history — frontend query state (C3).
 *
 * History is app-level data owned by the SQLite store (module-neutral `history_*` IPC); this
 * class is only the browser's *view* of it for the HistoryPanel and omnibox. Deliberately NOT
 * an undo domain (§3 principle 8): visits are captured Rust-side and deletion is a confirmed,
 * non-undoable action. Any module may read history via the same IPC without importing this.
 */
import {
	historySearch,
	historyRecent,
	historyDeleteUrl,
	historyClearRange,
	type HistoryEntry,
} from '$lib/ipc';

/** A day-grouped bucket for the HistoryPanel's grouped list. */
export interface HistoryDayGroup {
	/** Local date key `YYYY-MM-DD`. */
	day: string;
	/** Human label (`Today` / `Yesterday` / locale date). */
	label: string;
	entries: HistoryEntry[];
}

function startOfDay(ts: number): number {
	const d = new Date(ts);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}

function dayKey(ts: number): string {
	const d = new Date(ts);
	const m = `${d.getMonth() + 1}`.padStart(2, '0');
	const day = `${d.getDate()}`.padStart(2, '0');
	return `${d.getFullYear()}-${m}-${day}`;
}

function dayLabel(ts: number, now: number): string {
	const today = startOfDay(now);
	const that = startOfDay(ts);
	const dayMs = 86_400_000;
	if (that === today) return 'Today';
	if (that === today - dayMs) return 'Yesterday';
	return new Date(ts).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/** Group entries (already newest-first) into day buckets, preserving order. */
export function groupByDay(entries: HistoryEntry[], now = Date.now()): HistoryDayGroup[] {
	const groups: HistoryDayGroup[] = [];
	const index = new Map<string, HistoryDayGroup>();
	for (const entry of entries) {
		const key = dayKey(entry.lastVisitAt);
		let group = index.get(key);
		if (!group) {
			group = { day: key, label: dayLabel(entry.lastVisitAt, now), entries: [] };
			index.set(key, group);
			groups.push(group);
		}
		group.entries.push(entry);
	}
	return groups;
}

class HistoryState {
	/** Current result set — recent list, or search results when `query` is non-empty. */
	entries = $state<HistoryEntry[]>([]);
	query = $state('');
	loading = $state(false);
	error = $state<string | null>(null);

	private requestSeq = 0;

	/** Result set grouped by day for the panel. */
	get grouped(): HistoryDayGroup[] {
		return groupByDay(this.entries);
	}

	/** Load the most-recent visits (query cleared). */
	async loadRecent(limit = 100): Promise<void> {
		this.query = '';
		await this.run(() => historyRecent(limit));
	}

	/** Search history; empty/whitespace query falls back to recent. */
	async search(query: string, limit = 100): Promise<void> {
		this.query = query;
		const trimmed = query.trim();
		if (!trimmed) {
			await this.run(() => historyRecent(limit));
			return;
		}
		await this.run(() => historySearch(trimmed, limit));
	}

	/** Delete one URL and its visits, then optimistically drop it from the view. */
	async deleteUrl(id: number): Promise<void> {
		this.error = null;
		try {
			await historyDeleteUrl(id);
			this.entries = this.entries.filter(e => e.id !== id);
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to delete history entry';
			throw e;
		}
	}

	/** Clear a time range (both bounds optional; both absent = clear all), then refresh. */
	async clearRange(from?: number, to?: number): Promise<void> {
		this.error = null;
		try {
			await historyClearRange(from, to);
			if (this.query.trim()) await this.search(this.query);
			else await this.loadRecent();
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'Failed to clear history';
			throw e;
		}
	}

	/** Run a query with last-write-wins guarding against out-of-order responses. */
	private async run(fetcher: () => Promise<HistoryEntry[]>): Promise<void> {
		const seq = ++this.requestSeq;
		this.loading = true;
		this.error = null;
		try {
			const rows = await fetcher();
			if (seq !== this.requestSeq) return; // superseded by a newer query
			this.entries = rows;
		} catch (e) {
			if (seq !== this.requestSeq) return;
			this.error = e instanceof Error ? e.message : 'Failed to load history';
		} finally {
			if (seq === this.requestSeq) this.loading = false;
		}
	}
}

export const history = new HistoryState();
