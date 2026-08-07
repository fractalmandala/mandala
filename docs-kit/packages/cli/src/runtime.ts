/** Everything a command needs from its environment, so commands stay testable. */
export interface DocsCliContext {
	cwd: string;
	env: Record<string, string | undefined>;
	write: (line: string) => void;
	writeError: (line: string) => void;
}

export interface DocsCliArgs {
	/** Positional arguments after the command name. */
	positional: string[];
	/** `--flag value`, `--flag=value`, and boolean `--flag` options. */
	options: Record<string, string | boolean>;
}

export interface DocsCliCommand {
	name: string;
	summary: string;
	usage: string;
	run(args: DocsCliArgs, context: DocsCliContext): Promise<number>;
}

/** Parses arguments without a dependency, supporting `--flag`, `--flag=value`, and `--flag value`. */
export function parseCliArgs(argv: readonly string[]): DocsCliArgs {
	const positional: string[] = [];
	const options: Record<string, string | boolean> = {};

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === undefined) {
			continue;
		}
		if (!argument.startsWith('--')) {
			positional.push(argument);
			continue;
		}

		const body = argument.slice(2);
		const separator = body.indexOf('=');
		if (separator !== -1) {
			options[body.slice(0, separator)] = body.slice(separator + 1);
			continue;
		}

		const next = argv[index + 1];
		if (next !== undefined && !next.startsWith('--')) {
			options[body] = next;
			index += 1;
			continue;
		}

		options[body] = true;
	}

	return { positional, options };
}

/** Reads a string option, rejecting a bare boolean flag that needs a value. */
export function stringOption(
	args: DocsCliArgs,
	name: string
): string | undefined {
	const value = args.options[name];
	if (value === undefined) {
		return undefined;
	}
	if (typeof value !== 'string') {
		throw new Error(`Option --${name} requires a value.`);
	}
	return value;
}

export function booleanOption(args: DocsCliArgs, name: string): boolean {
	return args.options[name] === true || args.options[name] === 'true';
}

/** Emits either a human-readable report or the machine-readable `--json` payload. */
export function report(
	context: DocsCliContext,
	args: DocsCliArgs,
	payload: unknown,
	lines: readonly string[]
): void {
	if (booleanOption(args, 'json')) {
		context.write(JSON.stringify(payload, null, '\t'));
		return;
	}

	for (const line of lines) {
		context.write(line);
	}
}
