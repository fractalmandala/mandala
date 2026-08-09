import { addCommand } from './commands/add.js';
import { cleanCommand } from './commands/clean.js';
import { createCommand } from './commands/create.js';
import { doctorCommand } from './commands/doctor.js';
import { generateCommand } from './commands/generate.js';
import { initCommand } from './commands/init.js';
import { devCommand } from './commands/dev.js';
import { migrateCommand } from './commands/migrate.js';
import { syncCommand } from './commands/sync.js';
import { validateCommand } from './commands/validate.js';
import { parseCliArgs, type DocsCliCommand, type DocsCliContext } from './runtime.js';

export { loadDocsConfig, docsConfigFileNames, type LoadedDocsConfig } from './config-file.js';
export {
	booleanOption,
	parseCliArgs,
	report,
	stringOption,
	type DocsCliArgs,
	type DocsCliCommand,
	type DocsCliContext
} from './runtime.js';
export { addCommand, docsFrameworkVersion } from './commands/add.js';
export { cleanCommand, collectDocsCleanTargets, type DocsCleanTarget } from './commands/clean.js';
export { createCommand } from './commands/create.js';
export {
	generateCommand,
	generateDocsArtifacts,
	type GenerateArtifactsOptions,
	type GenerateArtifactsResult
} from './commands/generate.js';
export {
	createDocsInitPlan,
	detectPackageManager,
	initCommand,
	installCommand,
	type DocsInitFile,
	type DocsInitPatch,
	type DocsInitPlanOptions,
	type PackageManager
} from './commands/init.js';
export {
	doctorCommand,
	requiredVersions,
	runDoctorChecks,
	type DoctorCheck,
	type DoctorStatus
} from './commands/doctor.js';
export { devCommand } from './commands/dev.js';
export { migrateCommand } from './commands/migrate.js';
export { syncCommand } from './commands/sync.js';
export { resolveContentRoots, validateCommand } from './commands/validate.js';

/** Every command the CLI can dispatch. */
export const docsCliCommands: DocsCliCommand[] = [
	initCommand,
	generateCommand,
	syncCommand,
	validateCommand,
	doctorCommand,
	migrateCommand,
	addCommand,
	createCommand,
	devCommand,
	cleanCommand
];

function usage(commands: readonly DocsCliCommand[]): string[] {
	return [
		'Usage: docs <command> [options]',
		'',
		'Commands:',
		...commands.map((command) => `  ${command.name.padEnd(10)} ${command.summary}`),
		'',
		'Run `docs <command> --help` for command usage.'
	];
}

export interface RunDocsCliOptions {
	commands?: readonly DocsCliCommand[];
	context?: Partial<DocsCliContext>;
}

/** Dispatches one CLI invocation and returns its exit code. */
export async function runDocsCli(
	argv: readonly string[],
	options: RunDocsCliOptions = {}
): Promise<number> {
	const commands = options.commands ?? docsCliCommands;
	const context: DocsCliContext = {
		cwd: options.context?.cwd ?? process.cwd(),
		env: options.context?.env ?? (process.env as Record<string, string | undefined>),
		write: options.context?.write ?? ((line) => console.log(line)),
		writeError: options.context?.writeError ?? ((line) => console.error(line))
	};

	const [name, ...rest] = argv;
	if (name === undefined || name === '--help' || name === '-h' || name === 'help') {
		for (const line of usage(commands)) {
			context.write(line);
		}
		return name === undefined ? 1 : 0;
	}

	const command = commands.find((entry) => entry.name === name);
	if (!command) {
		context.writeError(`Unknown command "${name}".`);
		for (const line of usage(commands)) {
			context.writeError(line);
		}
		return 1;
	}

	const args = parseCliArgs(rest);
	if (args.options['help'] === true) {
		context.write(command.usage);
		return 0;
	}

	try {
		return await command.run(args, context);
	} catch (error) {
		context.writeError(error instanceof Error ? error.message : String(error));
		return 1;
	}
}
