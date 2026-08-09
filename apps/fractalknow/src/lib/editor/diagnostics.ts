export type EditorDiagnosticSeverity = 'error' | 'warning' | 'info';

export type EditorDiagnostic = {
	id: string;
	from: number;
	to: number;
	line: number;
	message: string;
	severity: EditorDiagnosticSeverity;
	source: 'markdown-lint' | 'frontmatter' | 'link' | 'mdx';
};

export type ValidationRuleConfig = {
	frontmatterValidation?: boolean;
	frontmatterSeverity?: EditorDiagnosticSeverity;
	linkValidation?: boolean;
	linkSeverity?: EditorDiagnosticSeverity;
	headingStructureValidation?: boolean;
	headingSeverity?: EditorDiagnosticSeverity;
	trailingWhitespaceValidation?: boolean;
	trailingWhitespaceSeverity?: EditorDiagnosticSeverity;
};

/**
 * Lightweight source-mode diagnostics (no full markdownlint dependency).
 * Surfaces common structural issues as CodeMirror lint decorations.
 */
export function lintMarkdownSource(
	source: string,
	config?: ValidationRuleConfig,
): EditorDiagnostic[] {
	const diagnostics: EditorDiagnostic[] = [];
	const lines = source.split('\n');
	let offset = 0;

	const runHeadings = config?.headingStructureValidation !== false;
	const headingSev = config?.headingSeverity ?? 'error';

	const runTrailing = config?.trailingWhitespaceValidation !== false;
	const trailingSev = config?.trailingWhitespaceSeverity ?? 'warning';

	const runLinks = config?.linkValidation !== false;
	const linkSev = config?.linkSeverity ?? 'info';

	const runFrontmatter = config?.frontmatterValidation !== false;
	const frontmatterSev = config?.frontmatterSeverity ?? 'error';

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index] ?? '';
		const lineNumber = index + 1;

		if (runHeadings && /^#{7,}/.test(line)) {
			diagnostics.push({
				id: `heading-depth-${lineNumber}`,
				from: offset,
				to: offset + line.length,
				line: lineNumber,
				message: 'Heading level exceeds 6.',
				severity: headingSev,
				source: 'markdown-lint',
			});
		}

		if (runTrailing && /\s+$/.test(line) && line.trim().length > 0) {
			diagnostics.push({
				id: `trailing-space-${lineNumber}`,
				from: offset + line.trimEnd().length,
				to: offset + line.length,
				line: lineNumber,
				message: 'Trailing whitespace.',
				severity: trailingSev,
				source: 'markdown-lint',
			});
		}

		if (runLinks) {
			const bareUrl = line.match(/(?<![(\[])https?:\/\/\S+/);
			if (bareUrl && bareUrl.index !== undefined) {
				diagnostics.push({
					id: `bare-url-${lineNumber}`,
					from: offset + bareUrl.index,
					to: offset + bareUrl.index + bareUrl[0].length,
					line: lineNumber,
					message: 'Bare URL; prefer a Markdown link `[label](url)`.',
					severity: linkSev,
					source: 'link',
				});
			}
		}

		if (/^\s*(import|export)\s.+from\s+['"]/.test(line)) {
			diagnostics.push({
				id: `mdx-import-${lineNumber}`,
				from: offset,
				to: offset + line.length,
				line: lineNumber,
				message: 'MDX import/export is preserved as source; rich mode shows fallback.',
				severity: 'info',
				source: 'mdx',
			});
		}

		offset += line.length + 1;
	}

	if (runFrontmatter && source.startsWith('---')) {
		const end = source.indexOf('\n---', 3);
		if (end === -1) {
			diagnostics.push({
				id: 'frontmatter-unclosed',
				from: 0,
				to: Math.min(source.length, 3),
				line: 1,
				message: 'Unclosed YAML frontmatter fence.',
				severity: frontmatterSev,
				source: 'frontmatter',
			});
		}
	}

	return diagnostics;
}

export function formatDiagnosticSummary(diagnostics: EditorDiagnostic[]): string {
	const errors = diagnostics.filter((item) => item.severity === 'error').length;
	const warnings = diagnostics.filter((item) => item.severity === 'warning').length;
	if (errors === 0 && warnings === 0) return 'No diagnostics';
	return `${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}`;
}
