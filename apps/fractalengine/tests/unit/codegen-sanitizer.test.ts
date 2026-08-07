// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { sanitizeImportedHtml } from '../../src/lib/modules/designer/engine/codegen';

describe('sanitizeImportedHtml', () => {
	it('removes executable markup regardless of quoting or namespace', () => {
		const result = sanitizeImportedHtml('<script>alert(1)</script><img src=x onerror=alert(1)><svg><circle onload="alert(2)" /></svg><a href="javascript:alert(3)">unsafe</a>');
		expect(result).not.toMatch(/script|onerror|onload|javascript:/i);
	});

	it('preserves ordinary layout markup and styles for import measurement', () => {
		const result = sanitizeImportedHtml('<section class="hero" style="display:flex"><h1>Hello</h1></section>');
		expect(result).toContain('class="hero"');
		expect(result).toMatch(/display:\s*flex/);
		expect(result).toContain('<h1>Hello</h1>');
	});

	it('prevents imported markup from fetching remote subresources', () => {
		const result = sanitizeImportedHtml('<style>@import "https://evil.test/a.css"</style><link rel="stylesheet" href="https://evil.test/b.css"><img src="https://evil.test/pixel" srcset="//evil.test/two 2x"><div style="background-image:url(https://evil.test/bg)">Safe</div>');
		expect(result).not.toMatch(/evil\.test|<style|<link/i);
		expect(result).not.toContain('background-image');
		expect(result).toContain('Safe');
	});

	it('removes relative, SVG, and CSS-escaped resource references while retaining data images', () => {
		const result = sanitizeImportedHtml('<img src="/tracking.gif"><img src="data:image/png;base64,AA=="><svg><image href="/remote.svg" /></svg><div style="background-image:url(h\\74 tps://evil.test/a.png);color:red">Safe</div>');
		expect(result).not.toContain('/tracking.gif');
		expect(result).not.toContain('/remote.svg');
		expect(result).not.toMatch(/background-image|evil\.test/i);
		expect(result).toContain('data:image/png');
		expect(result).toContain('color: red');
	});
});
