import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Hostile-HTML Boundary guard test.
 *
 * Every `{@html}` expression in a .svelte file must import its sanitized
 * output from `$lib/sanitizeHtml` (or be in the explicit ALLOWLIST below).
 * A new `{@html}` anywhere else fails with "route it through sanitizeHtml
 * — see ADR-028".
 */

// Files that contain `{@html}` and ARE allowed because they import from
// $lib/sanitizeHtml (or are otherwise justified — comment per entry).
const ALLOWLIST: { file: string; justification: string }[] = [
	{
		file: 'src/lib/components/ai-elements/Mermaid.svelte',
		justification: 'Sanitized via sanitizeHtml.svg() — see ADR-028',
	},
	{
		file: 'src/lib/components/ai-elements/Response.svelte',
		justification: 'Sanitized via sanitizeHtml.markdown() — see ADR-028',
	},
	{
		file: 'src/lib/modules/fractaldocs/components/DocsContent.svelte',
		justification: 'Sanitized via sanitizeHtml.markdown() — see ADR-028',
	},
];

describe('HTML boundary — {@html} routing', () => {
	const srcDir = path.resolve(__dirname, '../../src');

	function collectSvelteFiles(dir: string): string[] {
		const files: string[] = [];
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				files.push(...collectSvelteFiles(fullPath));
			} else if (entry.name.endsWith('.svelte')) {
				files.push(fullPath);
			}
		}
		return files;
	}

	const svelteFiles = collectSvelteFiles(srcDir);
	const allowlistSet = new Set(ALLOWLIST.map(e => e.file));

	it('every file using {@html} is in the allowlist', () => {
		const violations: { file: string; lines: number[] }[] = [];

		for (const filePath of svelteFiles) {
			const content = fs.readFileSync(filePath, 'utf-8');
			const lines = content.split('\n');
			const violatingLines: number[] = [];

			for (let i = 0; i < lines.length; i++) {
				// Skip comments
				if (lines[i].trim().startsWith('//') || lines[i].trim().startsWith('<!--')) continue;
				if (lines[i].includes('{@html')) {
					violatingLines.push(i + 1);
				}
			}

			if (violatingLines.length > 0) {
				// Compute relative path for matching
				const relPath = path.relative(path.resolve(__dirname, '../..'), filePath);
				if (!allowlistSet.has(relPath)) {
					violations.push({ file: relPath, lines: violatingLines });
				}
			}
		}

		expect(violations).toEqual([]);
	});

	it('every allowlist entry is still on disk', () => {
		for (const entry of ALLOWLIST) {
			const fullPath = path.resolve(__dirname, '../..', entry.file);
			expect(fs.existsSync(fullPath), `ALLOWLIST entry not found: ${entry.file}`).toBe(true);
		}
	});
});
