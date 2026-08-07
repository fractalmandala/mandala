import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { resolveDocsConfig, type DocsConfig, type DocsResolvedConfig } from '@docs-kit/core';

/** Configuration file names searched in order when none is supplied. */
export const docsConfigFileNames = [
	'docs.config.ts',
	'docs.config.js',
	'docs.config.mjs',
	'docs.config.json'
] as const;

export interface LoadDocsConfigOptions {
	cwd?: string;
	/** Explicit configuration path, relative to `cwd` or absolute. */
	configFile?: string;
	/** Injected module loader, used by tests. */
	importModule?: (url: string) => Promise<unknown>;
}

export interface LoadedDocsConfig {
	path: string;
	config: DocsResolvedConfig;
}

async function exists(path: string): Promise<boolean> {
	try {
		return (await stat(path)).isFile();
	} catch {
		return false;
	}
}

async function findConfigFile(cwd: string, configFile: string | undefined): Promise<string> {
	if (configFile) {
		const path = resolve(cwd, configFile);
		if (!(await exists(path))) {
			throw new Error(`Configuration file not found: ${path}`);
		}
		return path;
	}

	for (const name of docsConfigFileNames) {
		const path = resolve(cwd, name);
		if (await exists(path)) {
			return path;
		}
	}

	throw new Error(
		`No documentation configuration found in ${cwd}. Expected one of: ${docsConfigFileNames.join(', ')}.`
	);
}

/** Loads and validates the documentation configuration for a project. */
export async function loadDocsConfig(
	options: LoadDocsConfigOptions = {}
): Promise<LoadedDocsConfig> {
	const cwd = options.cwd ?? process.cwd();
	const path = await findConfigFile(cwd, options.configFile);
	const importModule = options.importModule ?? ((url: string) => import(url));
	let module: unknown;

	try {
		module = path.endsWith('.json')
			? JSON.parse(await readFile(path, 'utf8'))
			: await importModule(pathToFileURL(path).href);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const hint = path.endsWith('.ts')
			? ' TypeScript configuration requires a Node.js build with type stripping enabled, or use docs.config.js.'
			: '';
		throw new Error(`Could not load ${path}: ${message}${hint}`);
	}

	const exported =
		module !== null && typeof module === 'object' && 'default' in module
			? (module as { default: unknown }).default
			: module;

	return { path, config: resolveDocsConfig(exported as DocsConfig) };
}
