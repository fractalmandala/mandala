/**
 * engine/paint.ts — Paint & effects model for the designer module.
 *
 * Defines the typed Paint union (solid, gradient, image), stroke model,
 * corner model, effects stack, and blend modes. Provides (de)serialization
 * to/from the block `style: Record<string, string | number>` map so that
 * DesignBlock.svelte can render everything via inline CSS and codegen can
 * emit equivalent stylesheets.
 *
 * Backwards compatibility: legacy blocks that only have `background`,
 * `border`, `border-radius`, `box-shadow`, and `opacity` in their style map
 * are read as-if they were a single solid fill / simple stroke, etc. The
 * migration is lossy-readonly — the first write via the paint API upgrades
 * the block to the rich format (_fills / _strokes / _effects keys).
 *
 * Layout of the style map keys used by this module:
 *   - `_fills`    → JSON string of Paint[]     (managed)
 *   - `_strokes`  → JSON string of StrokeData[] (managed)
 *   - `_corners`  → JSON string of Corners      (managed)
 *   - `_effects`  → JSON string of Effect[]     (managed)
 *   - `mix-blend-mode` → CSS string             (passthrough)
 *   - `opacity`   → CSS number (0-1)            (passthrough)
 *   - Legacy keys read on migration:
 *       `background` → single solid Paint
 *       `border`     → single StrokeData
 *       `border-radius` → uniform Corners
 *       `box-shadow` → single drop-shadow Effect
 */

// ---------------------------------------------------------------------------
// Paint types
// ---------------------------------------------------------------------------

export type PaintType = 'solid' | 'linear-gradient' | 'radial-gradient' | 'image';

export interface GradientStop {
	position: number; // 0-1
	color: string;
	opacity: number;
}

export interface SolidPaint {
	type: 'solid';
	color: string;
	opacity: number;
	visible: boolean;
}

export interface LinearGradientPaint {
	type: 'linear-gradient';
	angle: number; // degrees, 0-360
	stops: GradientStop[];
	opacity: number;
	visible: boolean;
}

export interface RadialGradientPaint {
	type: 'radial-gradient';
	cx: number; // 0-1
	cy: number;
	stops: GradientStop[];
	opacity: number;
	visible: boolean;
}

export type ImageFillMode = 'fill' | 'fit' | 'crop' | 'tile';

export interface ImagePaint {
	type: 'image';
	src: string;
	mode: ImageFillMode;
	opacity: number;
	visible: boolean;
}

export type Paint = SolidPaint | LinearGradientPaint | RadialGradientPaint | ImagePaint;

// ---------------------------------------------------------------------------
// Stroke types
// ---------------------------------------------------------------------------

export type StrokeAlign = 'inside' | 'center' | 'outside';
export type StrokeCap = 'butt' | 'round' | 'square';
export type StrokeJoin = 'miter' | 'round' | 'bevel';
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

export interface StrokeData {
	color: string;
	weight: number;
	align: StrokeAlign;
	style: StrokeStyle;
	dashPattern: number[]; // [dash, gap] — empty for solid
	cap: StrokeCap;
	join: StrokeJoin;
	visible: boolean;
	/** Per-side overrides for box blocks. Only top is used when uniform. */
	side?: 'all' | 'top' | 'right' | 'bottom' | 'left';
	/** Arrowhead for line/arrow blocks */
	arrowStart?: boolean;
	arrowEnd?: boolean;
}

// ---------------------------------------------------------------------------
// Corner types
// ---------------------------------------------------------------------------

export interface Corners {
	topLeft: number;
	topRight: number;
	bottomRight: number;
	bottomLeft: number;
	linked: boolean;
}

// ---------------------------------------------------------------------------
// Effect types
// ---------------------------------------------------------------------------

export type EffectType = 'drop-shadow' | 'inner-shadow' | 'layer-blur' | 'background-blur';

export interface DropShadowEffect {
	type: 'drop-shadow';
	visible: boolean;
	offsetX: number;
	offsetY: number;
	radius: number;
	spread: number;
	color: string;
}

export interface InnerShadowEffect {
	type: 'inner-shadow';
	visible: boolean;
	offsetX: number;
	offsetY: number;
	radius: number;
	spread: number;
	color: string;
}

export interface LayerBlurEffect {
	type: 'layer-blur';
	visible: boolean;
	blur: number; // px
}

export interface BackgroundBlurEffect {
	type: 'background-blur';
	visible: boolean;
	blur: number; // px
}

export type Effect = DropShadowEffect | InnerShadowEffect | LayerBlurEffect | BackgroundBlurEffect;

// ---------------------------------------------------------------------------
// Blend mode
// ---------------------------------------------------------------------------

export const BLEND_MODES = [
	'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
	'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference',
	'exclusion', 'hue', 'saturation', 'color', 'luminosity'
] as const;

export type BlendMode = (typeof BLEND_MODES)[number];

export function isBlendMode(v: string): v is BlendMode {
	return (BLEND_MODES as readonly string[]).includes(v);
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export function defaultSolidPaint(color = '#cccccc'): SolidPaint {
	return { type: 'solid', color, opacity: 1, visible: true };
}

export function defaultStroke(): StrokeData {
	return { color: '#000000', weight: 1, align: 'center', style: 'solid', dashPattern: [], cap: 'round', join: 'round', visible: true, side: 'all' };
}

export function defaultCorners(): Corners {
	return { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, linked: true };
}

// ---------------------------------------------------------------------------
// Serialization helpers — style map <-> typed model
// ---------------------------------------------------------------------------

const FILLS_KEY = '_fills';
const STROKES_KEY = '_strokes';
const CORNERS_KEY = '_corners';
const EFFECTS_KEY = '_effects';

/** Read paints from a style record, with legacy fallback. Never returns an
 *  empty array — at minimum returns [defaultSolidPaint()]. */
export function readFills(style: Record<string, string | number>): Paint[] {
	const raw = style[FILLS_KEY];
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw) as Paint[];
			if (Array.isArray(parsed) && parsed.length > 0) return parsed;
		} catch { /* fall through */ }
	}
	// Legacy: single `background` key
	const bg = style.background;
	if (bg && typeof bg === 'string' && bg !== 'none' && bg !== 'transparent') {
		const paint = parseLegacyBackground(bg);
		if (paint) return [paint];
	}
	return [defaultSolidPaint('transparent')];
}

/** Write paints into a style record (mutates in-place). Also sets the
 *  `background` key to the CSS value of the first visible solid fill for
 *  backwards compat — other uses should read from `_fills`. */
export function writeFills(style: Record<string, string | number>, fills: Paint[]): void {
	// Store all fills (visible + invisible) so the UI can toggle visibility.
	style[FILLS_KEY] = JSON.stringify(fills);

	// Set `background` to the CSS value of visible fills for backwards compat.
	const visible = fills.filter((f) => f.visible);
	const firstSolid = visible.find((f): f is SolidPaint => f.type === 'solid' && f.color !== 'transparent');
	if (firstSolid) {
		style.background = firstSolid.color;
	} else if (visible.length > 0) {
		// Try to render as CSS background-image
		style.background = paintsToCssBackground(visible);
	} else {
		style.background = 'transparent';
	}
}

/** Convert an array of Paint to a CSS `background` value. */
function paintsToCssBackground(paints: Paint[]): string {
	if (paints.length === 0) return 'transparent';
	// For a single solid, return the color
	if (paints.length === 1 && paints[0].type === 'solid') {
		return paints[0].color;
	}
	// Stack multiple paints as CSS background layers (last is bottom)
	const layers = paints.map((p) => paintToCssValue(p)).filter(Boolean);
	return layers.reverse().join(', ');
}

/** Convert a single Paint to its CSS value. */
function paintToCssValue(paint: Paint): string {
	switch (paint.type) {
		case 'solid':
			return paint.color;
		case 'linear-gradient': {
			const stops = paint.stops.map((s) => `${s.color} ${Math.round(s.position * 100)}%`).join(', ');
			return `linear-gradient(${paint.angle}deg, ${stops})`;
		}
		case 'radial-gradient': {
			const stops = paint.stops.map((s) => `${s.color} ${Math.round(s.position * 100)}%`).join(', ');
			return `radial-gradient(circle at ${Math.round(paint.cx * 100)}% ${Math.round(paint.cy * 100)}%, ${stops})`;
		}
		case 'image':
			return `url(${paint.src})`;
	}
}

/** Parse a legacy CSS background value into a Paint, if possible. */
function parseLegacyBackground(bg: string): Paint | null {
	if (!bg || bg === 'none' || bg === 'transparent') return null;
	// Check for gradient
	if (bg.startsWith('linear-gradient(')) {
		return parseCssLinearGradient(bg);
	}
	if (bg.startsWith('radial-gradient(')) {
		return parseCssRadialGradient(bg);
	}
	if (bg.startsWith('url(')) {
		const src = bg.slice(4, -1);
		return { type: 'image', src, mode: 'fill', opacity: 1, visible: true };
	}
	// Assume color
	return { type: 'solid', color: bg, opacity: 1, visible: true };
}

function parseCssLinearGradient(css: string): LinearGradientPaint {
	const stops: GradientStop[] = [];
	let angle = 180; // default top-to-bottom
	// Very basic parser — extract angle and stops
	const inner = css.slice('linear-gradient('.length, -1);
	// Try to match angle
	const angleMatch = inner.match(/^(-?\d+(?:\.\d+)?)(deg)\s*,\s*/);
	if (angleMatch) {
		angle = Number(angleMatch[1]);
	}
	const stopStr = angleMatch ? inner.slice(angleMatch[0].length) : inner;
	stopStr.split(',').forEach((part) => {
		const trimmed = part.trim();
		if (!trimmed) return;
		const m = trimmed.match(/^(#[a-fA-F0-9]+|[a-zA-Z]+\([^)]+\)|[a-zA-Z]+)\s*(\d+(?:\.\d+)?%)?/);
		if (m) {
			const pos = m[2] ? parseFloat(m[2]) / 100 : 0.5;
			stops.push({ position: Math.min(1, Math.max(0, pos)), color: m[1], opacity: 1 });
		}
	});
	if (stops.length === 0) {
		stops.push({ position: 0, color: '#000000', opacity: 1 }, { position: 1, color: '#ffffff', opacity: 1 });
	}
	return { type: 'linear-gradient', angle, stops, opacity: 1, visible: true };
}

function parseCssRadialGradient(css: string): RadialGradientPaint {
	const stops: GradientStop[] = [];
	const inner = css.slice('radial-gradient('.length, -1);
	// Very basic: just extract color stops
	inner.split(',').forEach((part) => {
		const trimmed = part.trim();
		if (!trimmed) return;
		const m = trimmed.match(/^(#[a-fA-F0-9]+|[a-zA-Z]+\([^)]+\)|[a-zA-Z]+)\s*(\d+(?:\.\d+)?%)?/);
		if (m) {
			const pos = m[2] ? parseFloat(m[2]) / 100 : 0.5;
			stops.push({ position: Math.min(1, Math.max(0, pos)), color: m[1], opacity: 1 });
		}
	});
	if (stops.length === 0) {
		stops.push({ position: 0, color: '#000000', opacity: 1 }, { position: 1, color: '#ffffff', opacity: 1 });
	}
	return { type: 'radial-gradient', cx: 0.5, cy: 0.5, stops, opacity: 1, visible: true };
}

// ---------------------------------------------------------------------------
// Stroke read/write
// ---------------------------------------------------------------------------

/** Read strokes from a style record, with legacy fallback. */
export function readStrokes(style: Record<string, string | number>): StrokeData[] {
	const raw = style[STROKES_KEY];
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw) as StrokeData[];
			if (Array.isArray(parsed) && parsed.length > 0) return parsed;
		} catch { /* fall through */ }
	}
	// Legacy: `border` shorthand
	const border = style.border;
	if (border && typeof border === 'string' && border !== 'none' && border !== '0') {
		const s = parseLegacyBorder(border);
		if (s) return [s];
	}
	return [];
}

/** Write strokes into a style record. Also sets `border` for backwards compat. */
export function writeStrokes(style: Record<string, string | number>, strokes: StrokeData[]): void {
	// Store all strokes so visibility can be toggled
	style[STROKES_KEY] = JSON.stringify(strokes);

	// Set `border` to the first visible stroke for CSS
	const visible = strokes.filter((s) => s.visible);
	const first = visible[0];
	if (first && first.side === 'all') {
		const dash = first.style === 'dashed' || first.style === 'dotted' ? '' : '';
		if (dash || first.dashPattern.length > 0) {
			// Use the shorthand with explicit dash array not supported in CSS shorthand
			style.border = `${first.weight}px ${first.style} ${first.color}`;
		} else {
			style.border = `${first.weight}px ${first.style} ${first.color}`;
		}
		if (first.align !== 'center' && first.weight > 0) {
			// store align hint in a separate key since CSS has no stroke-align
			style['_stroke-align'] = first.align;
		} else {
			delete style['_stroke-align'];
		}
	} else {
		// Per-side or no visible stroke
		if (!first) {
			delete style.border;
			delete style['_stroke-align'];
		}
	}
}

/** Parse a legacy CSS border shorthand. */
function parseLegacyBorder(border: string): StrokeData | null {
	const trimmed = border.trim();
	if (!trimmed || trimmed === 'none' || trimmed === '0') return null;
	const m = trimmed.match(/^([\d.]+)(px)?\s+(\w+)\s+(.+)$/);
	if (m) {
		const weight = parseFloat(m[1]) || 1;
		const style = m[3] as StrokeStyle;
		const color = m[4];
		return {
			color,
			weight: Number.isFinite(weight) ? weight : 1,
			align: 'center',
			style: ['solid', 'dashed', 'dotted'].includes(style) ? style : 'solid',
			dashPattern: [],
			cap: 'round',
			join: 'round',
			visible: true,
			side: 'all',
		};
	}
	return null;
}

// ---------------------------------------------------------------------------
// Corners read/write
// ---------------------------------------------------------------------------

/** Read corners from a style record, with legacy fallback. */
export function readCorners(style: Record<string, string | number>): Corners {
	const raw = style[CORNERS_KEY];
	if (typeof raw === 'string') {
		try {
			return JSON.parse(raw) as Corners;
		} catch { /* fall through */ }
	}
	// Legacy: uniform `border-radius`
	const br = style['border-radius'];
	if (br != null && br !== '' && br !== 'none' && br !== '0') {
		const val = parseFloat(String(br));
		if (Number.isFinite(val) && val > 0) {
			return { topLeft: val, topRight: val, bottomRight: val, bottomLeft: val, linked: true };
		}
	}
	return defaultCorners();
}

/** Write corners into a style record. Also sets `border-radius` for CSS. */
export function writeCorners(style: Record<string, string | number>, corners: Corners): void {
	style[CORNERS_KEY] = JSON.stringify(corners);
	// Set CSS border-radius
	if (corners.topLeft === corners.topRight && corners.topLeft === corners.bottomRight && corners.topLeft === corners.bottomLeft) {
		if (corners.topLeft > 0) {
			style['border-radius'] = `${corners.topLeft}px`;
		} else {
			delete style['border-radius'];
		}
	} else {
		style['border-radius'] = `${corners.topLeft}px ${corners.topRight}px ${corners.bottomRight}px ${corners.bottomLeft}px`;
	}
}

// ---------------------------------------------------------------------------
// Effects read/write
// ---------------------------------------------------------------------------

/** Read effects from a style record, with legacy fallback. */
export function readEffects(style: Record<string, string | number>): Effect[] {
	const raw = style[EFFECTS_KEY];
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw) as Effect[];
			if (Array.isArray(parsed)) return parsed;
		} catch { /* fall through */ }
	}
	// Legacy: single `box-shadow`
	const shadow = style['box-shadow'];
	if (shadow && typeof shadow === 'string' && shadow !== 'none' && shadow.trim() !== '') {
		const parsed = parseCssBoxShadow(shadow);
		if (parsed) return [parsed];
	}
	return [];
}

/** Write effects into a style record. Also sets `box-shadow` for CSS. */
export function writeEffects(style: Record<string, string | number>, effects: Effect[]): void {
	// Store all effects so visibility can be toggled
	style[EFFECTS_KEY] = JSON.stringify(effects);

	// Set `box-shadow` to the CSS value of visible drop/inner shadows
	const visible = effects.filter((e) => e.visible);
	const shadows = visible.filter((e): e is DropShadowEffect | InnerShadowEffect => e.type === 'drop-shadow' || e.type === 'inner-shadow');
	if (shadows.length > 0) {
		const cssValues = shadows.map((s) => {
			const inset = s.type === 'inner-shadow' ? 'inset ' : '';
			return `${inset}${s.offsetX}px ${s.offsetY}px ${s.radius}px ${s.spread}px ${s.color}`;
		});
		style['box-shadow'] = cssValues.join(', ');
	} else {
		delete style['box-shadow'];
	}
}

function parseCssBoxShadow(shadow: string): Effect | null {
	// Very basic parser — matches the simple format stored by this module
	const parts = shadow.trim().split(/\s+/);
	if (parts.length < 3) return null;
	// Check for inset
	const isInset = parts[0] === 'inset';
	const offset = isInset ? 1 : 0;
	const offsetX = parseFloat(parts[offset]) || 0;
	const offsetY = parseFloat(parts[offset + 1]) || 0;
	const radius = parseFloat(parts[offset + 2]) || 0;
	const spread = parts[offset + 3] ? parseFloat(parts[offset + 3]) || 0 : 0;
	const colorIdx = isInset ? (offset + 4) : (offset + (parts[offset + 3] ? 4 : 3));
	const color = parts[colorIdx] || '#000000';
	if (isInset) {
		return { type: 'inner-shadow', visible: true, offsetX, offsetY, radius, spread, color };
	}
	return { type: 'drop-shadow', visible: true, offsetX, offsetY, radius, spread, color };
}

// ---------------------------------------------------------------------------
// Full style migration (legacy -> rich)
// ---------------------------------------------------------------------------

/** Migrate a legacy style record to the rich paint model in-place. Idempotent —
 *  skips if any `_`-prefixed key already exists. */
export function migrateLegacyStyle(style: Record<string, string | number>): void {
	if (style[FILLS_KEY] !== undefined) return; // already migrated
	// Migrate fills
	const bg = style.background;
	if (bg && typeof bg === 'string' && bg !== 'none' && bg !== 'transparent') {
		const paint = parseLegacyBackground(bg);
		if (paint) {
			style[FILLS_KEY] = JSON.stringify([paint]);
		}
	}
	// Migrate strokes
	const border = style.border;
	if (border && typeof border === 'string' && border !== 'none' && border !== '0') {
		const s = parseLegacyBorder(border);
		if (s) {
			style[STROKES_KEY] = JSON.stringify([s]);
		}
	}
	// Migrate corners
	const br = style['border-radius'];
	if (br != null && br !== '' && br !== 'none') {
		const val = parseFloat(String(br));
		if (Number.isFinite(val) && val > 0) {
			style[CORNERS_KEY] = JSON.stringify({ topLeft: val, topRight: val, bottomRight: val, bottomLeft: val, linked: true });
		}
	}
	// Migrate effects
	const shadow = style['box-shadow'];
	if (shadow && typeof shadow === 'string' && shadow !== 'none' && shadow.trim() !== '') {
		const parsed = parseCssBoxShadow(shadow);
		if (parsed) {
			style[EFFECTS_KEY] = JSON.stringify([parsed]);
		}
	}
}

// ---------------------------------------------------------------------------
// Style record update helpers (for use by DesignInspector)
// ---------------------------------------------------------------------------

/** Apply a fill change to a style record, returning the new style. */
export function setFills(style: Record<string, string | number>, fills: Paint[]): Record<string, string | number> {
	const next = { ...style };
	writeFills(next, fills);
	return next;
}

/** Apply a stroke change to a style record, returning the new style. */
export function setStrokes(style: Record<string, string | number>, strokes: StrokeData[]): Record<string, string | number> {
	const next = { ...style };
	writeStrokes(next, strokes);
	return next;
}

/** Apply a corner change to a style record, returning the new style. */
export function setCorners(style: Record<string, string | number>, corners: Corners): Record<string, string | number> {
	const next = { ...style };
	writeCorners(next, corners);
	return next;
}

/** Apply an effects change to a style record, returning the new style. */
export function setEffects(style: Record<string, string | number>, effects: Effect[]): Record<string, string | number> {
	const next = { ...style };
	writeEffects(next, effects);
	return next;
}

/** Set blend mode on a style record. */
export function setBlendMode(style: Record<string, string | number>, mode: BlendMode | ''): Record<string, string | number> {
	const next = { ...style };
	if (mode && mode !== 'normal') {
		next['mix-blend-mode'] = mode;
	} else {
		delete next['mix-blend-mode'];
	}
	return next;
}

/** Read blend mode from a style record. */
export function readBlendMode(style: Record<string, string | number>): string {
	const v = style['mix-blend-mode'];
	return typeof v === 'string' && v ? v : 'normal';
}

// ---------------------------------------------------------------------------
// CSS generation helpers (for codegen)
// ---------------------------------------------------------------------------

/** Generate CSS declarations for fills, strokes, corners, effects, blend mode
 *  from a style record. Returns an array of `property: value` strings. */
export function paintStyleToDecls(style: Record<string, string | number>): string[] {
	const decls: string[] = [];
	const fills = readFills(style);
	if (fills.length > 0) {
		const css = paintsToCssBackground(fills);
		if (css) decls.push(`background: ${css}`);
	}
	const strokes = readStrokes(style);
	if (strokes.length > 0) {
		const s = strokes[0];
		if (s.visible && s.side === 'all') {
			decls.push(`border: ${s.weight}px ${s.style} ${s.color}`);
		}
	}
	const corners = readCorners(style);
	if (corners.topLeft > 0 || corners.topRight > 0 || corners.bottomRight > 0 || corners.bottomLeft > 0) {
		if (corners.topLeft === corners.topRight && corners.topLeft === corners.bottomRight && corners.topLeft === corners.bottomLeft) {
			decls.push(`border-radius: ${corners.topLeft}px`);
		} else {
			decls.push(`border-radius: ${corners.topLeft}px ${corners.topRight}px ${corners.bottomRight}px ${corners.bottomLeft}px`);
		}
	}
	const effects = readEffects(style);
	const shadows = effects.filter((e): e is DropShadowEffect | InnerShadowEffect => (e.type === 'drop-shadow' || e.type === 'inner-shadow') && e.visible);
	if (shadows.length > 0) {
		const cssValues = shadows.map((s) => {
			const inset = s.type === 'inner-shadow' ? 'inset ' : '';
			return `${inset}${s.offsetX}px ${s.offsetY}px ${s.radius}px ${s.spread}px ${s.color}`;
		});
		decls.push(`box-shadow: ${cssValues.join(', ')}`);
	}
	const blend = readBlendMode(style);
	if (blend && blend !== 'normal') {
		decls.push(`mix-blend-mode: ${blend}`);
	}
	const opacity = style.opacity;
	if (opacity != null && Number(opacity) < 1) {
		decls.push(`opacity: ${opacity}`);
	}
	return decls;
}
