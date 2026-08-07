import { scaffoldStandaloneProject } from '@docs-kit/create';

import { booleanOption, report, stringOption, type DocsCliCommand } from '../runtime.js';

/** `docs create` — generates a standalone documentation application. */
export const createCommand: DocsCliCommand = {
	name: 'create',
	summary: 'Generate a standalone SvelteKit documentation application.',
	usage: 'docs create <directory> [--title <name>] [--base-path /docs] [--content <dir>] [--force] [--json]',
	async run(args, context) {
		const directory = args.positional[0];
		if (directory === undefined) {
			context.writeError('docs create requires a target directory.');
			return 1;
		}

		const summary = await scaffoldStandaloneProject({
			cwd: context.cwd,
			directory,
			force: booleanOption(args, 'force'),
			...(stringOption(args, 'title') === undefined
				? {}
				: { siteTitle: stringOption(args, 'title') as string }),
			...(stringOption(args, 'base-path') === undefined
				? {}
				: { basePath: stringOption(args, 'base-path') as string }),
			...(stringOption(args, 'content') === undefined
				? {}
				: { contentDirectory: stringOption(args, 'content') as string }),
			...(stringOption(args, 'dependency-version') === undefined
				? {}
				: { dependencyVersion: stringOption(args, 'dependency-version') as string })
		});

		report(
			context,
			args,
			{ directory: summary.directory, written: summary.written, skipped: summary.skipped },
			[
				`Created ${summary.written.length} file(s) in ${summary.directory}`,
				...summary.skipped.map((path) => `  skipped ${path} (pass --force to replace)`),
				'',
				'Next steps:',
				`  cd ${directory}`,
				'  pnpm install',
				'  pnpm dev'
			]
		);

		return 0;
	}
};
