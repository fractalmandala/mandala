import { describe, expect, it } from 'vitest';
import {
	readFills, writeFills, defaultSolidPaint,
	readStrokes, writeStrokes, defaultStroke,
	readCorners, writeCorners, defaultCorners,
	readEffects, writeEffects,
	setBlendMode, readBlendMode,
	migrateLegacyStyle, paintStyleToDecls,
} from '$lib/modules/designer/engine/paint';

// ── Helpers ────────────────────────────────────────────────────────────────

function emptyStyle(): Record<string, string | number> {
	return {};
}

// ── Backwards compatibility (legacy CSS keys) ──────────────────────────────

describe('Legacy backwards compatibility', () => {

	it('reads a plain background color as a solid fill', () => {
		const style = { background: '#ff0000' };
		const fills = readFills(style);
		expect(fills).toHaveLength(1);
		expect(fills[0].type).toBe('solid');
		expect((fills[0] as any).color).toBe('#ff0000');
	});

	it('reads "transparent" background as default fill', () => {
		const style = { background: 'transparent' };
		const fills = readFills(style);
		expect(fills).toHaveLength(1);
		expect(fills[0].type).toBe('solid');
	});

	it('reads "none" background as default fill', () => {
		const style = { background: 'none' };
		const fills = readFills(style);
		expect(fills).toHaveLength(1);
		expect(fills[0].type).toBe('solid');
	});

	it('prefers _fills over legacy background', () => {
		const style = { _fills: JSON.stringify([{ type: 'solid', color: '#00ff00', opacity: 1, visible: true }]), background: '#ff0000' };
		const fills = readFills(style);
		expect(fills).toHaveLength(1);
		expect((fills[0] as any).color).toBe('#00ff00');
	});

	it('reads legacy border shorthand as a stroke', () => {
		const style = { border: '2px solid #0000ff' };
		const strokes = readStrokes(style);
		expect(strokes).toHaveLength(1);
		expect(strokes[0].weight).toBe(2);
		expect(strokes[0].style).toBe('solid');
		expect(strokes[0].color).toBe('#0000ff');
	});

	it('reads legacy uniform border-radius as corners', () => {
		const style = { 'border-radius': '8px' };
		const corners = readCorners(style);
		expect(corners.topLeft).toBe(8);
		expect(corners.topRight).toBe(8);
		expect(corners.bottomRight).toBe(8);
		expect(corners.bottomLeft).toBe(8);
		expect(corners.linked).toBe(true);
	});

	it('reads legacy box-shadow as drop shadow effect', () => {
		const style = { 'box-shadow': '2px 4px 8px 0 rgba(0,0,0,0.2)' };
		const effects = readEffects(style);
		expect(effects).toHaveLength(1);
		expect(effects[0].type).toBe('drop-shadow');
		if (effects[0].type === 'drop-shadow') {
			expect(effects[0].offsetX).toBe(2);
			expect(effects[0].offsetY).toBe(4);
			expect(effects[0].radius).toBe(8);
			expect(effects[0].spread).toBe(0);
		}
	});

	it('reads inset box-shadow as inner shadow effect', () => {
		const style = { 'box-shadow': 'inset 0 2px 4px 0 rgba(0,0,0,0.2)' };
		const effects = readEffects(style);
		expect(effects).toHaveLength(1);
		expect(effects[0].type).toBe('inner-shadow');
	});

	it('migrateLegacyStyle upgrades all legacy keys in-place', () => {
		const style: Record<string, string | number> = {
			background: '#ff0000',
			border: '1px solid #000',
			'border-radius': '4px',
			'box-shadow': '1px 1px 3px rgba(0,0,0,0.3)',
		};
		migrateLegacyStyle(style);
		expect(style._fills).toBeDefined();
		expect(style._strokes).toBeDefined();
		expect(style._corners).toBeDefined();
		expect(style._effects).toBeDefined();
	});

	it('migrateLegacyStyle is idempotent', () => {
		const style: Record<string, string | number> = { background: '#ff0000' };
		migrateLegacyStyle(style);
		const fillsFirst = style._fills;
		migrateLegacyStyle(style);
		expect(style._fills).toBe(fillsFirst);
	});

	it('handles malformed _fills JSON gracefully', () => {
		const style = { _fills: 'NOT JSON', background: '#ff0000' };
		const fills = readFills(style);
		expect(fills).toHaveLength(1);
		expect(fills[0].type).toBe('solid');
	});
});

// ── Round-trip tests ──────────────────────────────────────────────────────

describe('Paint round-trips', () => {

	it('write then read fills returns equivalent data', () => {
		const style = emptyStyle();
		const fills = [
			{ type: 'solid' as const, color: '#ff0000', opacity: 0.8, visible: true },
			{ type: 'linear-gradient' as const, angle: 180, stops: [
				{ position: 0, color: '#000', opacity: 1 },
				{ position: 1, color: '#fff', opacity: 1 }
			], opacity: 1, visible: false },
		];
		writeFills(style, fills);
		const read = readFills(style);
		expect(read).toHaveLength(2);
		expect(read[0].type).toBe('solid');
		expect((read[0] as any).color).toBe('#ff0000');
		expect((read[0] as any).opacity).toBe(0.8);
		// Second fill — invisible fills are still persisted in _fills
		expect(read[1].type).toBe('linear-gradient');
	});

	it('write then read strokes returns equivalent data', () => {
		const style = emptyStyle();
		const strokes = [{ color: '#000', weight: 2, align: 'center' as const, style: 'dashed' as const, dashPattern: [4, 2], cap: 'round' as const, join: 'round' as const, visible: true, side: 'all' as const }];
		writeStrokes(style, strokes);
		const read = readStrokes(style);
		expect(read).toHaveLength(1);
		expect(read[0].weight).toBe(2);
		expect(read[0].style).toBe('dashed');
	});

	it('write then read corners returns equivalent data', () => {
		const style = emptyStyle();
		const corners = { topLeft: 4, topRight: 8, bottomRight: 12, bottomLeft: 16, linked: false };
		writeCorners(style, corners);
		const read = readCorners(style);
		expect(read.topLeft).toBe(4);
		expect(read.topRight).toBe(8);
		expect(read.bottomRight).toBe(12);
		expect(read.bottomLeft).toBe(16);
		expect(read.linked).toBe(false);
	});

	it('write then read effects returns equivalent data', () => {
		const style = emptyStyle();
		const effects = [
			{ type: 'drop-shadow' as const, visible: true, offsetX: 2, offsetY: 4, radius: 8, spread: 0, color: 'rgba(0,0,0,0.2)' },
			{ type: 'layer-blur' as const, visible: true, blur: 10 },
		];
		writeEffects(style, effects);
		const read = readEffects(style);
		expect(read).toHaveLength(2);
		expect(read[0].type).toBe('drop-shadow');
		if (read[0].type === 'drop-shadow') {
			expect(read[0].offsetX).toBe(2);
		}
		expect(read[1].type).toBe('layer-blur');
		if (read[1].type === 'layer-blur') {
			expect(read[1].blur).toBe(10);
		}
	});
});

// ── CSS generation tests ──────────────────────────────────────────────────

describe('paintStyleToDecls', () => {

	it('generates background for solid fill', () => {
		const style = { _fills: JSON.stringify([{ type: 'solid', color: '#ff0000', opacity: 1, visible: true }]), background: '#ff0000' };
		const decls = paintStyleToDecls(style);
		expect(decls.some(d => d.startsWith('background:'))).toBe(true);
	});

	it('generates border for stroke', () => {
		const style = { _strokes: JSON.stringify([{ color: '#000', weight: 2, align: 'center', style: 'solid', dashPattern: [], cap: 'round', join: 'round', visible: true, side: 'all' }]), border: '2px solid #000' };
		const decls = paintStyleToDecls(style);
		expect(decls.some(d => d.startsWith('border:'))).toBe(true);
	});

	it('generates border-radius for corners', () => {
		const style = { _corners: JSON.stringify({ topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8, linked: true }) };
		const decls = paintStyleToDecls(style);
		expect(decls.some(d => d.startsWith('border-radius:'))).toBe(true);
	});

	it('generates box-shadow for effects', () => {
		const style = { _effects: JSON.stringify([{ type: 'drop-shadow', visible: true, offsetX: 2, offsetY: 2, radius: 4, spread: 0, color: 'rgba(0,0,0,0.2)' }]) };
		const decls = paintStyleToDecls(style);
		expect(decls.some(d => d.startsWith('box-shadow:'))).toBe(true);
	});

	it('generates mix-blend-mode', () => {
		const style = { 'mix-blend-mode': 'multiply' };
		const decls = paintStyleToDecls(style);
		expect(decls.some(d => d.startsWith('mix-blend-mode:'))).toBe(true);
	});
});

// ── Blend mode tests ──────────────────────────────────────────────────────

describe('Blend mode', () => {

	it('sets and reads blend mode', () => {
		const style = emptyStyle();
		const next = setBlendMode(style, 'multiply');
		expect(readBlendMode(next)).toBe('multiply');
	});

	it('removes blend mode key when set to normal or empty', () => {
		const style = { 'mix-blend-mode': 'multiply' };
		const next1 = setBlendMode(style, 'normal');
		expect('mix-blend-mode' in next1).toBe(false);
		const next2 = setBlendMode(style, '');
		expect('mix-blend-mode' in next2).toBe(false);
	});

	it('returns normal for unset blend mode', () => {
		expect(readBlendMode(emptyStyle())).toBe('normal');
	});
});

// ── Degenerate / edge input tests ─────────────────────────────────────────

describe('Edge cases', () => {

	it('empty style returns default fill', () => {
		const fills = readFills(emptyStyle());
		expect(fills).toHaveLength(1);
		expect(fills[0].type).toBe('solid');
	});

	it('empty style returns empty strokes', () => {
		const strokes = readStrokes(emptyStyle());
		expect(strokes).toHaveLength(0);
	});

	it('empty style returns default corners', () => {
		const corners = readCorners(emptyStyle());
		expect(corners.topLeft).toBe(0);
		expect(corners.linked).toBe(true);
	});

	it('empty style returns empty effects', () => {
		const effects = readEffects(emptyStyle());
		expect(effects).toHaveLength(0);
	});

	it('handles numeric border-radius string', () => {
		const style = { 'border-radius': '8' as any };
		const corners = readCorners(style);
		expect(corners.topLeft).toBe(8);
		expect(corners.linked).toBe(true);
	});
});
