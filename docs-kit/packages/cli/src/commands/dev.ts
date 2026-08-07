import { spawn } from 'node:child_process';

import { prepareStandaloneWorkspace } from '@docs-kit/create';

import { booleanOption, report, stringOption, type DocsCliCommand } from '../runtime.js';

/**
 * `docs dev` — serves a content directory through a generated standalone application.
 *
 * The generated application is written to disk rather than kept in memory, so `--eject`
 * is simply keeping it: standalone and embedded modes run the same code.
 */
export const devCommand: DocsCliCommand = {
	name: 'dev',
	summary: 'Serve a content directory through a generated standalone application.',
	usage: 'docs dev [content] [--out <dir>] [--base-path /docs] [--title <name>] [--eject] [--no-run] [--json]',
	async run(args, context) {
		const content = args.positional[0] ?? 'docs';
		const outDir = stringOption(args, 'out') ?? (booleanOption(args, 'eject') ? 'docs-app' : '.docs-kit/standalone');

		const summary = await prepareStandaloneWorkspace({
			cwd: context.cwd,
			content,
			outDir,
			force: !booleanOption(args, 'eject'),
			...(stringOption(args, 'title') === undefined
				? {}
				: { siteTitle: stringOption(args, 'title') as string }),
			...(stringOption(args, 'base-path') === undefined
				? {}
				: { basePath: stringOption(args, 'base-path') as string }),
			...(stringOption(args, 'dependency-version') === undefined
				? {}
				: { dependencyVersion: stringOption(args, 'dependency-version') as string })
		});

		const shouldRun = !booleanOption(args, 'no-run') && !booleanOption(args, 'eject');
		report(
			context,
			args,
			{
				directory: summary.directory,
				content,
				written: summary.written,
				skipped: summary.skipped,
				running: shouldRun
			},
			[
				`Prepared a standalone application in ${summary.directory}`,
				`Serving content from ${content}`,
				...(shouldRun
					? ['Starting the development server…']
					: [
							'',
							'Next steps:',
							`  cd ${summary.directory}`,
							'  pnpm install',
							'  pnpm dev'
						])
			]
		);

		if (!shouldRun) {
			return 0;
		}

		return new Promise<number>((resolveExit) => {
			const child = spawn('pnpm', ['dev'], {
				cwd: summary.directory,
				stdio: 'inherit',
				env: context.env as NodeJS.ProcessEnv
			});

			child.on('error', (error) => {
				context.writeError(
					`Could not start the development server: ${error.message}. Run it manually in ${summary.directory}.`
				);
				resolveExit(1);
			});
			child.on('exit', (code) => resolveExit(code ?? 0));
		});
	}
};
