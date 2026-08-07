/**
 * Typed typography adapter for designer block style records.
 *
 * Rich typography is stored under `_typography` so the persisted scene remains
 * backwards-compatible with the existing CSS-style record. `writeTypography`
 * also mirrors values to CSS keys, keeping canvas rendering and export honest.
 */

export type TextSizingMode = 'auto-width' | 'auto-height' | 'fixed';
export type TextVerticalAlign = 'top' | 'middle' | 'bottom';
export type TextDecoration = 'none' | 'underline' | 'line-through';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface Typography {
	fontFamily: string;
	fontWeight: string;
	fontStyle: 'normal' | 'italic';
	fontSize: string;
	lineHeight: string;
	letterSpacing: string;
	paragraphSpacing: string;
	textAlign: TextAlign;
	verticalAlign: TextVerticalAlign;
	sizingMode: TextSizingMode;
	textDecoration: TextDecoration;
	textTransform: TextTransform;
	truncate: boolean;
}

export const CURATED_FONT_FAMILIES = [
	'Google Sans Flex',
	'Inter',
	'Roboto',
	'Arial',
	'Helvetica Neue',
	'Georgia',
	'Times New Roman',
	'JetBrains Mono',
	'SF Mono',
	'monospace'
] as const;

const KEY = '_typography';
const ALIGNMENTS: readonly TextAlign[] = ['left', 'center', 'right', 'justify'];
const VERTICAL_ALIGNS: readonly TextVerticalAlign[] = ['top', 'middle', 'bottom'];
const SIZING_MODES: readonly TextSizingMode[] = ['auto-width', 'auto-height', 'fixed'];
const DECORATIONS: readonly TextDecoration[] = ['none', 'underline', 'line-through'];
const TRANSFORMS: readonly TextTransform[] = ['none', 'uppercase', 'lowercase', 'capitalize'];

function member<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
	return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? value as T : fallback;
}

function cssValue(style: Record<string, string | number>, key: string): string {
	const value = style[key];
	return value == null ? '' : String(value);
}

export function defaultTypography(): Typography {
	return {
		fontFamily: '', fontWeight: '', fontStyle: 'normal', fontSize: '', lineHeight: '', letterSpacing: '',
		paragraphSpacing: '', textAlign: 'left', verticalAlign: 'top', sizingMode: 'fixed',
		textDecoration: 'none', textTransform: 'none', truncate: false
	};
}

/** Reads rich data if present, otherwise migrates the legacy CSS keys in memory. */
export function readTypography(style: Record<string, string | number>): Typography {
	let parsed: Partial<Typography> = {};
	const raw = style[KEY];
	if (typeof raw === 'string') {
		try {
			const candidate = JSON.parse(raw);
			if (candidate && typeof candidate === 'object') parsed = candidate as Partial<Typography>;
		} catch { /* fall back to legacy keys */ }
	}
	const decoration = String(parsed.textDecoration ?? cssValue(style, 'text-decoration')).replace('line-through', 'line-through');
	return {
		fontFamily: typeof parsed.fontFamily === 'string' ? parsed.fontFamily : cssValue(style, 'font-family'),
		fontWeight: typeof parsed.fontWeight === 'string' ? parsed.fontWeight : cssValue(style, 'font-weight'),
		fontStyle: parsed.fontStyle === 'italic' || cssValue(style, 'font-style') === 'italic' ? 'italic' : 'normal',
		fontSize: typeof parsed.fontSize === 'string' ? parsed.fontSize : cssValue(style, 'font-size'),
		lineHeight: typeof parsed.lineHeight === 'string' ? parsed.lineHeight : cssValue(style, 'line-height'),
		letterSpacing: typeof parsed.letterSpacing === 'string' ? parsed.letterSpacing : cssValue(style, 'letter-spacing'),
		paragraphSpacing: typeof parsed.paragraphSpacing === 'string' ? parsed.paragraphSpacing : cssValue(style, 'margin-bottom'),
		textAlign: member(parsed.textAlign ?? cssValue(style, 'text-align'), ALIGNMENTS, 'left'),
		verticalAlign: member(parsed.verticalAlign, VERTICAL_ALIGNS, 'top'),
		sizingMode: member(parsed.sizingMode, SIZING_MODES, 'fixed'),
		textDecoration: member(parsed.textDecoration ?? decoration, DECORATIONS, 'none'),
		textTransform: member(parsed.textTransform ?? cssValue(style, 'text-transform'), TRANSFORMS, 'none'),
		truncate: typeof parsed.truncate === 'boolean' ? parsed.truncate : cssValue(style, 'text-overflow') === 'ellipsis'
	};
}

/** Persists semantic data and mirrors it to declarative CSS style values. */
export function writeTypography(style: Record<string, string | number>, typography: Typography): void {
	style[KEY] = JSON.stringify(typography);
	const set = (key: string, value: string) => { if (value) style[key] = value; else delete style[key]; };
	set('font-family', typography.fontFamily);
	set('font-weight', typography.fontWeight);
	set('font-style', typography.fontStyle === 'italic' ? 'italic' : '');
	set('font-size', typography.fontSize);
	set('line-height', typography.lineHeight);
	set('letter-spacing', typography.letterSpacing);
	set('margin-bottom', typography.paragraphSpacing);
	set('text-align', typography.textAlign === 'left' ? '' : typography.textAlign);
	set('text-decoration', typography.textDecoration === 'none' ? '' : typography.textDecoration);
	set('text-transform', typography.textTransform === 'none' ? '' : typography.textTransform);
	if (typography.truncate) {
		style.overflow = 'hidden'; style['text-overflow'] = 'ellipsis'; style['white-space'] = 'nowrap';
	} else {
		delete style['text-overflow']; delete style['white-space'];
	}
}

/** CSS declarations that need semantic treatment beyond the direct style map. */
export function typographyStyleToDecls(style: Record<string, string | number>): string[] {
	const typography = readTypography(style);
	const decls: string[] = [];
	if (typography.verticalAlign !== 'top') {
		decls.push('display: flex', `align-items: ${typography.verticalAlign === 'middle' ? 'center' : 'flex-end'}`);
	}
	if (typography.sizingMode === 'auto-width') decls.push('width: fit-content', 'white-space: nowrap');
	if (typography.sizingMode === 'auto-height') decls.push('height: auto');
	return decls;
}

/** Returns a local notice when a requested font is not available in the browser. */
export async function isFontAvailable(fontFamily: string): Promise<boolean> {
	if (!fontFamily || typeof document === 'undefined' || !('fonts' in document)) return true;
	try { return document.fonts.check(`12px "${fontFamily.replace(/"/g, '')}"`); } catch { return true; }
}
