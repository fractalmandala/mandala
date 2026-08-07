/** Styler Preview — registry + persistence + undo.
 *
 * Framework-agnostic core for the `StylerPreview` showcase. It holds no token
 * *values* of its own — only the *names* and *shape* of the tokens to render —
 * and resolves them live off the mounted page, so it always reflects whatever
 * the consuming app compiled from fractals-styler's templates.
 *
 * Ships as raw source; the consumer's Svelte/Vite compiles it. No Svelte or
 * other runtime imports here — runs anywhere a browser is present.
 */

export const STORAGE_KEY = 'fractals-styler:overrides';

export interface TokenLevel {
	/** CSS custom property, e.g. `--text-xl`. */
	var: string;
	/** Class used to render a live sample (`text-xl`). */
	class: string;
	/** Human label shown in the UI. */
	label: string;
}

export interface ColorGroup {
	title: string;
	tokens: string[];
}

export type Overrides = Record<string, string>;

/* ------------------------------------------------------------------ */
/* Registries — ground truth for what the showcase renders             */
/* ------------------------------------------------------------------ */

/** Typography scale from `_typography.sass` (`--text-xs` .. `--text-5xl`). */
export const TYPE_LEVELS: TokenLevel[] = (() => {
	const levels: TokenLevel[] = [];
	for (const k of ['xs', 'sm', 'md', 'bs', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']) {
		const cls = 'text-' + k;
		levels.push({ var: '--' + cls, class: cls, label: '--' + cls });
	}
	return levels;
})();

/** The slider-backed scaling proxy from `_typography.sass`. */
export const SCALING_VAR = '--text-scaling';

/** Editing range for the scaling proxy (default 1.2). */
export const SCALING_RANGE = { min: 1.0, max: 3.0, step: 0.01, default: 1.2 };

/** Slate steps present in `_tokens.sass` (`--slate-50` .. `--slate-950`). */
export const SLATE_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

/** Editable semantic color groups from `_tokens.sass`. (Hex-native only; `--bg-overlay`
 * keeps alpha, so it's excluded from the pickers.) */
export const SEMANTIC_GROUPS: ColorGroup[] = [
	{ title: 'Backgrounds', tokens: ['--bg-app', '--bg-surface', '--bg-raised', '--bg-subtle'] },
	{ title: 'Text', tokens: ['--text-primary', '--text-secondary', '--text-muted', '--text-inverse'] },
	{ title: 'Borders', tokens: ['--border', '--border-secondary', '--border-focus', '--ring'] },
	{ title: 'Brand', tokens: ['--brand', '--brand-hover', '--brand-active'] },
	{ title: 'Feedback', tokens: ['--feedback-danger', '--feedback-warning', '--feedback-success', '--feedback-info'] },
];

/** Base text-colour samples, keyed by the `_typography.sass` utility class. */
export const TEXT_SAMPLES: { var: string; class: string; label: string; inverse?: boolean }[] = [
	{ var: '--text-primary', class: 'prim', label: 'Primary' },
	{ var: '--text-secondary', class: 'sec', label: 'Secondary' },
	{ var: '--text-muted', class: 'muted', label: 'Muted' },
	{ var: '--text-inverse', class: 'inverse', label: 'Inverse', inverse: true },
];

/* ------------------------------------------------------------------ */
/* Reading resolved values off the live document                       */
/* ------------------------------------------------------------------ */

const root = (): HTMLElement | null =>
	typeof document !== 'undefined' ? document.documentElement : null;

/** Raw custom-property string on the root — may be a `var()` chain. */
export function readVar(name: string): string {
	const el = root();
	return (el && getComputedStyle(el).getPropertyValue(name).trim()) || '';
}

/** True when the already-serialised value is a hex literal. */
export function isHex(raw: string): boolean {
	return /^#[0-9a-f]{3,8}$/i.test(raw.trim());
}

/** Normalise a raw var() expression to a hex literal when possible; else return nul1. */
export function rawOrHex(name: string): string | null {
	const raw = readVar(name);
	if (!raw) return null;
	if (isHex(raw)) return raw.trim();
	return null;
}

/** Resolve a var() chain to a concrete colour by rendering a probe element
 * whose `color` is set to `var(...)` and reading its computed value. */
export function resolveVar(name: string): string {
	if (typeof document === 'undefined') return '#000000';
	const probe = document.createElement('span');
	probe.style.display = 'inline';
	probe.style.color = `var(${name})`;
	document.body.appendChild(probe);
	const c = getComputedStyle(probe).color;
	probe.remove();
	return c && c !== 'transparent' && !c.includes('var(') ? toHex(c) : '#000000';
}

/** Convert any CSS color value to `#rrggbb` (or `#rrggbbaa`). */
export function toHex(color: string): string {
	const m = color.match(/\d+(\.\d+)?/g);
	if (!m) return '#000000';
	const [r, g, b] = m.slice(0, 3).map(Number);
	if (m.length >= 4) {
		const a = Math.round(Number(m[3]) * 255);
		return '#' + [r, g, b, a].map(n => n.toString(16).padStart(2, '0')).join('');
	}
	return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

export function loadOverrides(): Overrides {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Overrides;
		return typeof raw === 'object' && raw ? raw : {};
	} catch {
		return {};
	}
}

export function persistOverrides(o: Overrides): void {
	if (typeof localStorage === 'undefined') return;
	try { localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); } catch { /* noop */ }
}

export function clearOverrides(): void {
	if (typeof localStorage === 'undefined') return;
	try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}

/* ------------------------------------------------------------------ */
/* Live application                                                     */
/* ------------------------------------------------------------------ */

/** Apply a full overrides map to the root inline style. */
export function applyOverrides(o: Overrides): void {
	const el = root();
	if (!el) return;
	for (const [k, v] of Object.entries(o)) el.style.setProperty(k, v);
}

/** Gather every CSS custom property token the showcase reads/writes. */
export function allTokens(): string[] {
	const set = new Set<string>();
	for (const lvl of TYPE_LEVELS) set.add(lvl.var);
	set.add(SCALING_VAR);
	for (const step of SLATE_STEPS) set.add(`--slate-${step}`);
	for (const g of SEMANTIC_GROUPS) for (const t of g.tokens) set.add(t);
	for (const s of TEXT_SAMPLES) set.add(s.var);
	return [...set];
}

/** Remove every known token override from the root inline style. */
export function removeAllOverrides(): void {
	const el = root();
	if (!el) return;
	for (const token of allTokens()) el.style.removeProperty(token);
}

/* ------------------------------------------------------------------ */
/* Undo history (commit-per-gesture, capped)                           */
/* ------------------------------------------------------------------ */

export interface HistoryEntry {
	token: string;
	before: string | null; // value to restore (null => remove override)
	after: string;         // value that was set
}

export class OverrideHistory {
	private stack: HistoryEntry[] = [];
	private limit: number;
	constructor(limit = 50) { this.limit = limit; }

	canUndo(): boolean { return this.stack.length > 0; }

	size(): number { return this.stack.length; }

	pushOverride(token: string, before: string | null, after: string): void {
		if (before === after) return;
		this.stack.push({ token, before, after });
		if (this.stack.length > this.limit) this.stack.shift();
	}

	popEntry(): HistoryEntry | undefined { return this.stack.pop(); }

	clearHistory(): void { this.stack = []; }
}

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */

export type Theme = 'light' | 'dark';

export function currentTheme(): Theme {
	return typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light'
		? 'light'
		: 'dark';
}

export function setTheme(t: Theme): void {
	document.documentElement.dataset.theme = t;
}