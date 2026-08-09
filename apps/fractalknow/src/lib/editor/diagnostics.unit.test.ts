import { describe, expect, it } from 'vitest';
import { lintMarkdownSource } from './diagnostics';

describe('lintMarkdownSource diagnostics engine rule configuration & severity mapping', () => {
	const sampleSource = `---
title: Test
####### Heading level 7
Trailing space   
https://example.com
`;

	it('produces default diagnostics when all rules are active', () => {
		const result = lintMarkdownSource(sampleSource);
		expect(result).toHaveLength(4);

		const headingErr = result.find((d) => d.id.startsWith('heading-depth'));
		expect(headingErr?.severity).toBe('error');

		const trailingWarn = result.find((d) => d.id.startsWith('trailing-space'));
		expect(trailingWarn?.severity).toBe('warning');

		const linkInfo = result.find((d) => d.id.startsWith('bare-url'));
		expect(linkInfo?.severity).toBe('info');

		const frontmatterErr = result.find((d) => d.id === 'frontmatter-unclosed');
		expect(frontmatterErr?.severity).toBe('error');
	});

	it('respects rule toggles and disables specific rules when configured', () => {
		const result = lintMarkdownSource(sampleSource, {
			headingStructureValidation: false,
			trailingWhitespaceValidation: false,
		});

		expect(result.some((d) => d.id.startsWith('heading-depth'))).toBe(false);
		expect(result.some((d) => d.id.startsWith('trailing-space'))).toBe(false);
		expect(result.some((d) => d.id.startsWith('bare-url'))).toBe(true);
	});

	it('maps custom severities correctly from config', () => {
		const result = lintMarkdownSource(sampleSource, {
			headingSeverity: 'warning',
			trailingWhitespaceSeverity: 'error',
			linkSeverity: 'error',
		});

		const headingErr = result.find((d) => d.id.startsWith('heading-depth'));
		expect(headingErr?.severity).toBe('warning');

		const trailingWarn = result.find((d) => d.id.startsWith('trailing-space'));
		expect(trailingWarn?.severity).toBe('error');

		const linkInfo = result.find((d) => d.id.startsWith('bare-url'));
		expect(linkInfo?.severity).toBe('error');
	});
});
