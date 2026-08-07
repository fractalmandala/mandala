import { describe, expect, it } from 'vitest';
import { defaultTypography, readTypography, typographyStyleToDecls, writeTypography } from '$lib/modules/designer/engine/typography';
import { exportHtmlCss } from '$lib/modules/designer/engine/codegen';

describe('designer typography model', () => {
	it('reads legacy CSS text styles without requiring migration', () => {
		const typography = readTypography({ 'font-family': 'Inter', 'font-size': '16px', 'text-align': 'justify', 'text-overflow': 'ellipsis' });
		expect(typography.fontFamily).toBe('Inter');
		expect(typography.fontSize).toBe('16px');
		expect(typography.textAlign).toBe('justify');
		expect(typography.truncate).toBe(true);
	});

	it('round-trips the complete typed model to the style record', () => {
		const style: Record<string, string | number> = {};
		const typography = { ...defaultTypography(), fontFamily: 'JetBrains Mono', fontWeight: '700', fontStyle: 'italic' as const, fontSize: '18px', lineHeight: '1.4', letterSpacing: '0.2px', paragraphSpacing: '8px', textAlign: 'center' as const, verticalAlign: 'middle' as const, sizingMode: 'auto-height' as const, textDecoration: 'underline' as const, textTransform: 'uppercase' as const, truncate: true };
		writeTypography(style, typography);
		expect(readTypography(style)).toEqual(typography);
		expect(style['text-overflow']).toBe('ellipsis');
	});

	it('falls back safely from malformed persisted typography', () => {
		const typography = readTypography({ _typography: '{oops', 'font-weight': '600' });
		expect(typography.fontWeight).toBe('600');
		expect(typography.sizingMode).toBe('fixed');
	});

	it('adds export declarations for semantic box alignment and sizing', () => {
		const style: Record<string, string | number> = {};
		writeTypography(style, { ...defaultTypography(), verticalAlign: 'bottom', sizingMode: 'auto-width' });
		expect(typographyStyleToDecls(style)).toEqual(expect.arrayContaining(['display: flex', 'align-items: flex-end', 'width: fit-content']));
	});

	it('emits mirrored and semantic typography CSS during export', () => {
		const style: Record<string, string | number> = {};
		writeTypography(style, { ...defaultTypography(), fontFamily: 'Inter', textDecoration: 'underline', textTransform: 'uppercase', verticalAlign: 'middle', sizingMode: 'auto-height', truncate: true });
		const result = exportHtmlCss([{ id: 'text-1', name: 'Headline', type: 'text', x: 0, y: 0, w: 200, h: 40, rotation: 0, parentId: null, children: [], props: { text: 'Hello' }, style, hidden: false, locked: false }]);
		expect(result.css).toContain('font-family: Inter');
		expect(result.css).toContain('text-decoration: underline');
		expect(result.css).toContain('align-items: center');
		expect(result.css).toContain('height: auto');
	});
});
