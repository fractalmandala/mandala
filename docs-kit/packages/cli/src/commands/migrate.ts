import {
	migrateDocs,
	writeMigration,
	type MigrationSourceId
} from '@docs-kit/migration';

import { booleanOption, report, stringOption, type DocsCliCommand } from '../runtime.js';

const sourceIds: MigrationSourceId[] = [
	'svocs',
	'blume',
	'fumadocs',
	'starlight',
	'docusaurus',
	'vitepress',
	'mkdocs',
	'mdbook'
];

/** `docs migrate` — converts another documentation framework into a docs-kit project. */
export const migrateCommand: DocsCliCommand = {
	name: 'migrate',
	summary: 'Convert an existing documentation project into docs-kit sources.',
	usage: `docs migrate [--from <${sourceIds.join('|')}>] [--out <dir>] [--write] [--force] [--json]`,
	async run(args, context) {
		const from = stringOption(args, 'from');
		if (from !== undefined && !sourceIds.includes(from as MigrationSourceId)) {
			context.writeError(`Unknown migration source "${from}". Expected one of: ${sourceIds.join(', ')}.`);
			return 1;
		}

		const result = await migrateDocs({
			cwd: context.cwd,
			...(from === undefined ? {} : { source: from as MigrationSourceId }),
			...(stringOption(args, 'content') === undefined
				? {}
				: { contentDirectory: stringOption(args, 'content') as string })
		});

		const outDir = stringOption(args, 'out') ?? 'docs-kit-migration';
		const shouldWrite = booleanOption(args, 'write');
		const summary = shouldWrite
			? await writeMigration(result, {
					cwd: context.cwd,
					outDir,
					force: booleanOption(args, 'force')
				})
			: undefined;
		const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error');

		report(
			context,
			args,
			{
				source: result.source,
				files: result.files.map((file) => file.path),
				diagnostics: result.diagnostics,
				...(summary === undefined ? { written: false } : summary)
			},
			[
				`Detected ${result.label}`,
				`${result.files.length} file(s) prepared`,
				...(summary === undefined
					? [`Dry run. Re-run with --write --out ${outDir} to write them.`]
					: [
							`Wrote ${summary.written.length} file(s) to ${summary.outDir}`,
							...(summary.skipped.length > 0
								? [`Skipped ${summary.skipped.length} existing file(s); pass --force to replace them.`]
								: [])
						]),
				`${errors.length} error(s), ${result.diagnostics.filter((entry) => entry.severity === 'warning').length} warning(s)`,
				'Review MIGRATION-REPORT.md for everything that needs manual attention.'
			]
		);

		return errors.length > 0 ? 1 : 0;
	}
};
