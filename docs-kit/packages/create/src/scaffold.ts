import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

import { createStandaloneTemplate, type StandaloneFile } from './templates.js';

export interface ScaffoldStandaloneOptions {
	/** Directory the application is generated into, relative to `cwd` or absolute. */
	directory: string;
	cwd?: string;
	name?: string;
	siteTitle?: string;
	siteDescription?: string;
	basePath?: string;
	/** Content directory relative to the generated application. */
	contentDirectory?: string;
	dependencyVersion?: string;
	starterContent?: boolean;
	/** Overwrite existing files. Defaults to false. */
	force?: boolean;
}

export interface ScaffoldSummary {
	directory: string;
	files: StandaloneFile[];
	written: string[];
	skipped: string[];
	/** True when the target directory already contained files. */
	intoExistingProject: boolean;
}

function projectName(directory: string): string {
	const segments = directory.split(/[\\/]/).filter(Boolean);
	const name = segments.at(-1) ?? 'docs';
	return name.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'docs';
}

/** Renders the standalone application without writing anything. */
export function planStandaloneProject(
	options: ScaffoldStandaloneOptions
): StandaloneFile[] {
	const name = options.name ?? projectName(options.directory);

	return createStandaloneTemplate({
		name,
		siteTitle: options.siteTitle ?? name,
		...(options.siteDescription === undefined ? {} : { siteDescription: options.siteDescription }),
		basePath: options.basePath ?? '/docs',
		contentDirectory: options.contentDirectory ?? 'src/lib/docs',
		...(options.dependencyVersion === undefined
			? {}
			: { dependencyVersion: options.dependencyVersion }),
		...(options.starterContent === undefined ? {} : { starterContent: options.starterContent })
	});
}

async function isEmptyDirectory(path: string): Promise<boolean> {
	try {
		return (await readdir(path)).length === 0;
	} catch {
		return true;
	}
}

/**
 * Generates a standalone documentation application.
 *
 * The result is an ordinary SvelteKit project the user owns: there is no eject step
 * because there is nothing hidden to eject from.
 */
export async function scaffoldStandaloneProject(
	options: ScaffoldStandaloneOptions
): Promise<ScaffoldSummary> {
	const cwd = options.cwd ?? process.cwd();
	const directory = isAbsolute(options.directory)
		? options.directory
		: resolve(cwd, options.directory);

	const files = planStandaloneProject(options);
	const intoExistingProject = !(await isEmptyDirectory(directory));
	const written: string[] = [];
	const skipped: string[] = [];

	for (const file of files) {
		const target = join(directory, file.path);
		let existing: string | undefined;

		try {
			existing = await readFile(target, 'utf8');
		} catch {
			existing = undefined;
		}

		if (existing !== undefined && !options.force) {
			skipped.push(file.path);
			continue;
		}

		await mkdir(dirname(target), { recursive: true });
		const temporaryPath = `${target}.tmp`;
		await writeFile(temporaryPath, file.content, 'utf8');
		await rename(temporaryPath, target);
		written.push(file.path);
	}

	return { directory, files, written, skipped, intoExistingProject };
}

export interface StandaloneWorkspaceOptions {
	/** The user's content directory. It is read in place and never copied. */
	content: string;
	cwd?: string;
	/** Where the generated application lives. Defaults to `.docs-kit/standalone`. */
	outDir?: string;
	siteTitle?: string;
	basePath?: string;
	dependencyVersion?: string;
	force?: boolean;
}

/**
 * Prepares the generated application `docs dev <content>` runs.
 *
 * The user's Markdown stays where it is; the generated app points its content root at it,
 * so the same compiler, routes, and manifest serve both modes.
 */
export async function prepareStandaloneWorkspace(
	options: StandaloneWorkspaceOptions
): Promise<ScaffoldSummary> {
	const cwd = options.cwd ?? process.cwd();
	const outDir = resolve(cwd, options.outDir ?? '.docs-kit/standalone');
	const contentRoot = resolve(cwd, options.content);
	const contentDirectory = relative(outDir, contentRoot).replace(/\\/g, '/');

	return scaffoldStandaloneProject({
		cwd,
		directory: outDir,
		contentDirectory,
		starterContent: false,
		force: options.force ?? true,
		...(options.siteTitle === undefined ? {} : { siteTitle: options.siteTitle }),
		...(options.basePath === undefined ? {} : { basePath: options.basePath }),
		...(options.dependencyVersion === undefined
			? {}
			: { dependencyVersion: options.dependencyVersion })
	});
}
