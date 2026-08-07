import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { loadDocsConfig } from '../config-file.js';
import { report, stringOption, type DocsCliCommand, type DocsCliContext } from '../runtime.js';
import { resolveContentRoots } from './validate.js';

export type DoctorStatus = 'pass' | 'warn' | 'fail';

export interface DoctorCheck {
	name: string;
	status: DoctorStatus;
	message: string;
	/** What to do about it, when there is something to do. */
	fix?: string;
}

/** Minimum versions the framework is developed against. */
export const requiredVersions: Record<string, string> = {
	svelte: '5',
	'@sveltejs/kit': '2',
	vite: '8',
	mdsvex: '0.12'
};

async function readJson(path: string): Promise<Record<string, unknown> | undefined> {
	try {
		return JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>;
	} catch {
		return undefined;
	}
}

async function readText(path: string): Promise<string | undefined> {
	try {
		return await readFile(path, 'utf8');
	} catch {
		return undefined;
	}
}

function majorOf(range: string): string {
	return (/(\d+)/.exec(range)?.[1] ?? '').trim();
}

function dependencyVersion(
	packageJson: Record<string, unknown> | undefined,
	name: string
): string | undefined {
	for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
		const group = packageJson?.[field];
		if (group !== null && typeof group === 'object' && name in (group as object)) {
			return (group as Record<string, string>)[name];
		}
	}

	return undefined;
}

/** Finds the documentation catch-all route in a SvelteKit project. */
async function findDocsRoute(cwd: string, basePath: string): Promise<string | undefined> {
	const segments = basePath.split('/').filter(Boolean);
	const routeDir = resolve(cwd, 'src/routes', ...segments);

	try {
		const entries = await readdir(routeDir, { withFileTypes: true });
		const catchAll = entries.find(
			(entry) => entry.isDirectory() && /^\[\.\.\..+\]$/.test(entry.name)
		);
		return catchAll ? join(routeDir, catchAll.name) : undefined;
	} catch {
		return undefined;
	}
}

export interface RunDoctorOptions {
	cwd: string;
	configFile?: string;
}

/**
 * Inspects a project's setup.
 *
 * Every check reports what to do about a problem, because a doctor that only says
 * something is wrong makes the user do the diagnosis twice.
 */
export async function runDoctorChecks(options: RunDoctorOptions): Promise<DoctorCheck[]> {
	const checks: DoctorCheck[] = [];
	const { cwd } = options;
	const packageJson = await readJson(join(cwd, 'package.json'));

	let config;
	try {
		const loaded = await loadDocsConfig({
			cwd,
			...(options.configFile === undefined ? {} : { configFile: options.configFile })
		});
		config = loaded.config;
		checks.push({
			name: 'configuration',
			status: 'pass',
			message: `Loaded ${loaded.path.replace(`${cwd}/`, '')}.`
		});
	} catch (error) {
		checks.push({
			name: 'configuration',
			status: 'fail',
			message: error instanceof Error ? error.message : String(error),
			fix: 'Create a docs.config.js exporting `defineDocsConfig({ site: { title } })`.'
		});
		return checks;
	}

	for (const [name, expected] of Object.entries(requiredVersions)) {
		const range = dependencyVersion(packageJson, name);

		if (range === undefined) {
			checks.push({
				name,
				status: name === 'mdsvex' ? 'warn' : 'fail',
				message: `${name} is not a dependency of this project.`,
				fix: `Install it: pnpm add -D ${name}`
			});
			continue;
		}

		const major = majorOf(range);
		checks.push({
			name,
			status: major === '' || major >= majorOf(expected) ? 'pass' : 'fail',
			message: `${name} ${range}`,
			...(major !== '' && major < majorOf(expected)
				? { fix: `Upgrade to ${name} ${expected} or later.` }
				: {})
		});
	}

	const contentRoots = resolveContentRoots(config, cwd);
	const missingRoots = contentRoots.filter((entry) => !existsSync(entry.root));
	checks.push({
		name: 'content',
		status: missingRoots.length === 0 ? 'pass' : 'fail',
		message:
			missingRoots.length === 0
				? `Found ${contentRoots.length} content root(s).`
				: `Missing content root(s): ${missingRoots.map((entry) => entry.root.replace(`${cwd}/`, '')).join(', ')}`,
		...(missingRoots.length === 0
			? {}
			: { fix: 'Create the directory or update `content.directory` in your configuration.' })
	});

	const viteConfig =
		(await readText(join(cwd, 'vite.config.ts'))) ?? (await readText(join(cwd, 'vite.config.js')));
	if (viteConfig === undefined) {
		checks.push({
			name: 'vite plugin',
			status: 'fail',
			message: 'No vite.config.ts found.',
			fix: 'Add the docs plugin before sveltekit(): plugins: [docs({ content }), sveltekit()]'
		});
	} else {
		const hasPlugin = /docs\s*\(/.test(viteConfig) && viteConfig.includes('@docs-kit/vite');
		const docsIndex = viteConfig.indexOf('docs(');
		const kitIndex = viteConfig.indexOf('sveltekit(');
		const orderedCorrectly = docsIndex !== -1 && kitIndex !== -1 && docsIndex < kitIndex;

		checks.push({
			name: 'vite plugin',
			status: hasPlugin ? (orderedCorrectly ? 'pass' : 'warn') : 'fail',
			message: hasPlugin
				? orderedCorrectly
					? 'The documentation plugin runs before sveltekit().'
					: 'The documentation plugin appears after sveltekit().'
				: 'The documentation plugin is not registered.',
			...(hasPlugin && orderedCorrectly
				? {}
				: { fix: 'Use plugins: [docs({ content: ... }), sveltekit()] — docs must come first.' })
		});
	}

	const svelteConfig = await readText(join(cwd, 'svelte.config.js'));
	if (svelteConfig === undefined) {
		checks.push({
			name: 'mdsvex',
			status: 'fail',
			message: 'No svelte.config.js found.',
			fix: 'Add mdsvex() with the docs pipeline and extensions: [".svelte", ".md", ".svx"].'
		});
	} else {
		const mdsvexCalls = svelteConfig.match(/\bmdsvex\s*\(/g)?.length ?? 0;
		const hasExtensions = /extensions\s*:/.test(svelteConfig) && svelteConfig.includes('.md');
		const hasPreprocessor = svelteConfig.includes('docsMarkdown');
		const problems = [
			mdsvexCalls === 0 ? 'mdsvex() is not configured' : '',
			mdsvexCalls > 1 ? 'mdsvex() is registered more than once' : '',
			hasExtensions ? '' : 'Markdown extensions are not registered',
			hasPreprocessor ? '' : 'docsMarkdown() is missing, so directives will not compile'
		].filter(Boolean);

		checks.push({
			name: 'mdsvex',
			status: problems.length === 0 ? 'pass' : mdsvexCalls === 0 ? 'fail' : 'warn',
			message: problems.length === 0 ? 'Markdown pipeline configured.' : problems.join('; '),
			...(problems.length === 0
				? {}
				: {
						fix: 'preprocess: [vitePreprocess(), docsMarkdown(), mdsvex({ extensions, remarkPlugins, rehypePlugins, highlight })]'
					})
		});
	}

	const routeDir = await findDocsRoute(cwd, config.routing.basePath);
	checks.push({
		name: 'route',
		status: routeDir === undefined ? 'fail' : 'pass',
		message:
			routeDir === undefined
				? `No catch-all route found under src/routes${config.routing.basePath}.`
				: `Documentation route: ${routeDir.replace(`${cwd}/`, '')}`,
		...(routeDir === undefined
			? { fix: `Create src/routes${config.routing.basePath}/[...slug]/+page.ts and +page.svelte.` }
			: {})
	});

	const gitignore = (await readText(join(cwd, '.gitignore'))) ?? '';
	const ignoresOutDir = gitignore.split('\n').some((line) => line.trim().startsWith(config.outDir));
	checks.push({
		name: 'gitignore',
		status: ignoresOutDir ? 'pass' : 'warn',
		message: ignoresOutDir
			? `${config.outDir} is ignored.`
			: `${config.outDir} is not in .gitignore; generated artifacts would be committed.`,
		...(ignoresOutDir ? {} : { fix: `Add "${config.outDir}" to .gitignore.` })
	});

	const cacheDir = resolve(cwd, config.sources.cacheDir);
	if (config.sources.entries.length > 0) {
		const synced = existsSync(join(cacheDir, 'index.json'));
		checks.push({
			name: 'sources',
			status: synced ? 'pass' : 'warn',
			message: synced
				? `${config.sources.entries.length} source(s) configured and synced.`
				: `${config.sources.entries.length} source(s) configured but never synced.`,
			...(synced ? {} : { fix: 'Run `docs sync` to populate the cache.' })
		});
	}

	return checks;
}

const statusLabel: Record<DoctorStatus, string> = { pass: 'ok  ', warn: 'warn', fail: 'FAIL' };

/** `docs doctor` — checks that the project is wired up correctly. */
export const doctorCommand: DocsCliCommand = {
	name: 'doctor',
	summary: 'Check versions, plugin order, routes, and project wiring.',
	usage: 'docs doctor [--config <file>] [--json]',
	async run(args, context: DocsCliContext) {
		const checks = await runDoctorChecks({
			cwd: context.cwd,
			...(stringOption(args, 'config') === undefined
				? {}
				: { configFile: stringOption(args, 'config') as string })
		});
		const failures = checks.filter((check) => check.status === 'fail');
		const warnings = checks.filter((check) => check.status === 'warn');

		report(context, args, { checks, failures: failures.length, warnings: warnings.length }, [
			...checks.flatMap((check) => [
				`${statusLabel[check.status]} ${check.name.padEnd(16)} ${check.message}`,
				...(check.fix ? [`     → ${check.fix}`] : [])
			]),
			'',
			`${failures.length} problem(s), ${warnings.length} warning(s)`
		]);

		return failures.length > 0 ? 1 : 0;
	}
};
