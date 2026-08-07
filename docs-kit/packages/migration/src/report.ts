export type MigrationSeverity = 'error' | 'warning' | 'info';

export type MigrationCode =
	| 'CONFIG_CONVERTED'
	| 'CONFIG_NEEDS_REVIEW'
	| 'CONTENT_CONVERTED'
	| 'FRONTMATTER_UNMAPPED'
	| 'UNSUPPORTED_SYNTAX'
	| 'NAVIGATION_EXTRACTED'
	| 'NAVIGATION_NEEDS_REVIEW'
	| 'SOURCE_NOT_DETECTED';

export interface MigrationDiagnostic {
	severity: MigrationSeverity;
	code: MigrationCode;
	/** Path relative to the source project. */
	file?: string;
	/** 1-based line number when the finding points at specific syntax. */
	line?: number;
	message: string;
	/** The original text, so nothing a migration could not convert is ever lost silently. */
	snippet?: string;
}

/** Collects diagnostics in the order they were found. */
export class MigrationReport {
	readonly diagnostics: MigrationDiagnostic[] = [];

	add(diagnostic: MigrationDiagnostic): void {
		this.diagnostics.push(diagnostic);
	}

	get errors(): MigrationDiagnostic[] {
		return this.diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
	}

	get warnings(): MigrationDiagnostic[] {
		return this.diagnostics.filter((diagnostic) => diagnostic.severity === 'warning');
	}

	/** Renders the human-readable review report a migration always produces. */
	render(title: string): string {
		const lines = [
			`# ${title}`,
			'',
			`- ${this.errors.length} error(s)`,
			`- ${this.warnings.length} warning(s)`,
			`- ${this.diagnostics.length - this.errors.length - this.warnings.length} note(s)`,
			''
		];

		for (const diagnostic of this.diagnostics) {
			const location = diagnostic.file
				? `${diagnostic.file}${diagnostic.line === undefined ? '' : `:${diagnostic.line}`}`
				: '(project)';
			lines.push(`## ${diagnostic.severity.toUpperCase()} ${diagnostic.code} — ${location}`);
			lines.push('');
			lines.push(diagnostic.message);
			if (diagnostic.snippet) {
				lines.push('', '```', diagnostic.snippet, '```');
			}
			lines.push('');
		}

		return lines.join('\n');
	}
}
