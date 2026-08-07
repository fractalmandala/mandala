import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
	applyInstallPlan,
	builtinRegistry,
	createInstallPlan,
	parseRegistry,
	type Registry
} from '@docs-kit/registry';

import { booleanOption, report, stringOption, type DocsCliCommand } from '../runtime.js';

/** Framework version registry items are matched against. */
export const docsFrameworkVersion = '0.0.0';

async function loadRegistry(cwd: string, path: string | undefined): Promise<Registry> {
	if (path === undefined) {
		return builtinRegistry;
	}

	const content = await readFile(resolve(cwd, path), 'utf8');
	return parseRegistry(JSON.parse(content));
}

/** `docs add` — copies registry components and integrations into the host project. */
export const addCommand: DocsCliCommand = {
	name: 'add',
	summary: 'Copy registry components and integrations into this project.',
	usage: 'docs add <item...> [--list] [--registry <file>] [--dir <path>] [--dry-run] [--force] [--json]',
	async run(args, context) {
		const registry = await loadRegistry(context.cwd, stringOption(args, 'registry'));

		if (booleanOption(args, 'list') || args.positional.length === 0) {
			report(
				context,
				args,
				{ items: registry.items.map(({ files, ...item }) => ({ ...item, files: files.length })) },
				[
					'Available registry items:',
					...registry.items.map(
						(item) => `  ${item.name.padEnd(24)} ${item.type.padEnd(10)} ${item.description}`
					),
					'',
					'Install with: docs add <name> --write'
				]
			);
			return 0;
		}

		const plan = createInstallPlan({
			registry,
			names: args.positional,
			frameworkVersion: stringOption(args, 'framework-version') ?? docsFrameworkVersion,
			...(stringOption(args, 'dir') === undefined
				? {}
				: { libDir: stringOption(args, 'dir') as string })
		});

		if (booleanOption(args, 'dry-run')) {
			report(context, args, { dryRun: true, files: plan.files.map((file) => file.path) }, [
				`Would install ${plan.files.length} file(s):`,
				...plan.files.map((file) => `  ${file.path}`)
			]);
			return 0;
		}

		const summary = await applyInstallPlan(plan, {
			cwd: context.cwd,
			force: booleanOption(args, 'force')
		});

		report(
			context,
			args,
			{
				items: plan.items.map((item) => item.name),
				dependencies: plan.dependencies,
				...summary
			},
			[
				`Installed ${plan.items.map((item) => item.name).join(', ')}`,
				...summary.written.map((path) => `  added     ${path}`),
				...summary.unchanged.map((path) => `  unchanged ${path}`),
				...summary.skipped.map((path) => `  skipped   ${path} (pass --force to replace)`),
				...(plan.dependencies.length > 0
					? ['', `Install the required packages: ${plan.dependencies.join(' ')}`]
					: []),
				...plan.docs.flatMap((entry) => ['', `${entry.item}: ${entry.docs}`])
			]
		);

		return 0;
	}
};
