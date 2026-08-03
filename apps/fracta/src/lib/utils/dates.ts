/** Shared date formatting for sidebar, organize, and daily helpers. */

const shortDate = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: '2-digit',
	year: '2-digit'
});

const longDate = new Intl.DateTimeFormat(undefined, {
	month: 'long',
	day: 'numeric',
	year: 'numeric'
});

export function formatShortDate(timestamp: number): string {
	if (!timestamp) return 'Unknown';
	return shortDate.format(new Date(timestamp));
}

export function formatLongDate(timestamp: number = Date.now()): string {
	return longDate.format(new Date(timestamp));
}

/** "2026-07-31" in local time — stable id stem for daily notes. */
export function localDateKey(date: Date = new Date()): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function formatRelative(timestamp: number): string {
	if (!timestamp) return 'Unknown';
	const elapsed = Math.max(0, Date.now() - timestamp);
	const units = [
		{ label: 'Year', ms: 365 * 24 * 60 * 60 * 1000 },
		{ label: 'Month', ms: 30 * 24 * 60 * 60 * 1000 },
		{ label: 'Week', ms: 7 * 24 * 60 * 60 * 1000 },
		{ label: 'Day', ms: 24 * 60 * 60 * 1000 },
		{ label: 'Hour', ms: 60 * 60 * 1000 },
		{ label: 'Minute', ms: 60 * 1000 }
	] as const;
	const unit = units.find((item) => elapsed >= item.ms);
	if (!unit) return 'Just now';
	const value = Math.floor(elapsed / unit.ms);
	return `${value} ${unit.label}${value === 1 ? '' : 's'}`;
}

/** Compact when label for library rows (Today / Yesterday / short date). */
export function formatWhen(timestamp: number): string {
	if (!timestamp) return '—';
	const now = new Date();
	const then = new Date(timestamp);
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const startOfThen = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime();
	const dayMs = 24 * 60 * 60 * 1000;
	const diffDays = Math.round((startOfToday - startOfThen) / dayMs);
	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	if (diffDays > 1 && diffDays < 7) {
		return then.toLocaleDateString(undefined, { weekday: 'long' });
	}
	return shortDate.format(then);
}
