import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import type { Registry, RegistryItem } from './types.js';
import { satisfiesFrameworkVersion } from './version.js';

export interface InstallPlanOptions {
	registry: Registry;
	/** Item names requested by the user. */
	names: readonly string[];
	/** Framework version the host is running, used for compatibility checks. */
	frameworkVersion: string;
	/** Install root for `lib` files, relative to the project. */
	libDir?: string;
	/** Install root for `route` files, relative to the project. */
	routesDir?: string;
	/** Install root for `static` files, relative to the project. */
	staticDir?: string;
}

export interface InstallFile {
	item: string;
	path: string;
	content: string;
}

export interface InstallPlan {
	/** Requested items plus their registry dependencies, in dependency order. */
	items: RegistryItem[];
	files: InstallFile[];
	/** npm packages the host must install; the registry never installs them itself. */
	dependencies: string[];
	docs: Array<{ item: string; docs: string }>;
}

const defaultLibDir = 'src/lib/docs-kit';
const defaultRoutesDir = 'src/routes';
const defaultStaticDir = 'static';

/**
 * Resolves requested items and their dependencies into a deterministic install plan.
 *
 * Resolution order is stable, cycles are rejected, and incompatible items fail loudly so a
 * host never ends up with a component built for a different framework version.
 */
export function createInstallPlan(options: InstallPlanOptions): InstallPlan {
	const byName = new Map(options.registry.items.map((item) => [item.name, item]));
	const ordered: RegistryItem[] = [];
	const seen = new Set<string>();
	const visiting = new Set<string>();

	const visit = (name: string, requestedBy: string | undefined): void => {
		if (seen.has(name)) {
			return;
		}
		if (visiting.has(name)) {
			throw new Error(`Registry dependency cycle detected at "${name}".`);
		}

		const item = byName.get(name);
		if (!item) {
			throw new Error(
				requestedBy === undefined
					? `Unknown registry item "${name}".`
					: `Registry item "${requestedBy}" depends on unknown item "${name}".`
			);
		}
		if (!satisfiesFrameworkVersion(options.frameworkVersion, item.frameworkVersion)) {
			throw new Error(
				`Registry item "${name}" requires docs-kit ${item.frameworkVersion}, but this project runs ${options.frameworkVersion}.`
			);
		}

		visiting.add(name);
		for (const dependency of [...(item.registryDependencies ?? [])].sort()) {
			visit(dependency, name);
		}
		visiting.delete(name);
		seen.add(name);
		ordered.push(item);
	};

	for (const name of options.names) {
		visit(name, undefined);
	}

	const libDir = options.libDir ?? defaultLibDir;
	const routesDir = options.routesDir ?? defaultRoutesDir;
	const staticDir = options.staticDir ?? defaultStaticDir;
	const files: InstallFile[] = [];

	for (const item of ordered) {
		for (const file of item.files) {
			const root = file.target === 'route' ? routesDir : file.target === 'static' ? staticDir : libDir;
			files.push({ item: item.name, path: `${root}/${file.path}`, content: file.content });
		}
	}

	const dependencies = [...new Set(ordered.flatMap((item) => item.dependencies ?? []))].sort();

	return {
		items: ordered,
		files: files.sort((left, right) => left.path.localeCompare(right.path)),
		dependencies,
		docs: ordered
			.filter((item) => item.docs !== undefined)
			.map((item) => ({ item: item.name, docs: item.docs as string }))
	};
}

export interface ApplyInstallOptions {
	cwd?: string;
	/** Overwrite files that already exist. Defaults to false. */
	force?: boolean;
}

export interface InstallSummary {
	written: string[];
	skipped: string[];
	unchanged: string[];
}

/**
 * Writes an install plan into the host project.
 *
 * Identical files are left alone and modified files are skipped unless `force` is set, so
 * running `docs add` twice never destroys a customized component.
 */
export async function applyInstallPlan(
	plan: InstallPlan,
	options: ApplyInstallOptions = {}
): Promise<InstallSummary> {
	const cwd = options.cwd ?? process.cwd();
	const written: string[] = [];
	const skipped: string[] = [];
	const unchanged: string[] = [];

	for (const file of plan.files) {
		const target = resolve(cwd, file.path);
		let existing: string | undefined;

		try {
			existing = await readFile(target, 'utf8');
		} catch {
			existing = undefined;
		}

		if (existing === file.content) {
			unchanged.push(file.path);
			continue;
		}
		if (existing !== undefined && !options.force) {
			skipped.push(file.path);
			continue;
		}

		await mkdir(dirname(target), { recursive: true });
		const temporaryPath = join(dirname(target), `.${target.split('/').pop()}.tmp`);
		await writeFile(temporaryPath, file.content, 'utf8');
		await rename(temporaryPath, target);
		written.push(file.path);
	}

	return { written, skipped, unchanged };
}
