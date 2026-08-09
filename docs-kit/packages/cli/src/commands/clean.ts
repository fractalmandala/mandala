import { existsSync } from 'node:fs';
import { readdir, rm, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

import type { DocsResolvedConfig } from '@docs-kit/core';

import { loadDocsConfig } from '../config-file.js';
import { booleanOption, report, stringOption, type DocsCliCommand } from '../runtime.js';

export interface DocsCleanTarget {
	/** Path relative to the project root. */
	path: string;
	/** What generated it, so the user can see why it is safe to remove. */
	reason: string;
	exists: boolean;
}

export interface CollectCleanTargetsOptions {
	config: DocsResolvedConfig;
	cwd: string;
	staticDir?: string;
	/** Include artifacts written into the static directory. Defaults to true. */
	includeStatic?: boolean;
}

/**
 * Lists what `docs clean` would remove.
 *
 * Only paths the framework itself writes are listed, and a static directory is inspected
 * before it is offered: `static/og` is removed only when it carries the cache file the
 * card generator writes, so a hand-made directory of the same name is never deleted.
 */
export async function collectDocsCleanTargets(
	options: CollectCleanTargetsOptions
): Promise<DocsCleanTarget[]> {
	const { config, cwd } = options;
	const staticDir = options.staticDir ?? 'static';
	const targets: DocsCleanTarget[] = [
		{
			path: config.outDir,
			reason: 'generated manifests, caches, and API pages',
			exists: existsSync(resolve(cwd, config.outDir))
		}
	];

	if (options.includeStatic === false) {
		return targets;
	}

	const ogDir = resolve(cwd, staticDir, 'og');
	targets.push({
		path: join(staticDir, 'og'),
		reason: 'generated Open Graph cards',
		exists: existsSync(join(ogDir, 'cache.json'))
	});

	for (const file of ['sitemap.xml', 'robots.txt']) {
		targets.push({
			path: join(staticDir, file),
			reason: 'generated discovery artifact',
			exists: existsSync(resolve(cwd, staticDir, file))
		});
	}

	return targets;
}

async function isEmpty(path: string): Promise<boolean> {
	try {
		return (await stat(path)).isDirectory() && (await readdir(path)).length === 0;
	} catch {
		return false;
	}
}

/** `docs clean` — removes generated state. */
export const cleanCommand: DocsCliCommand = {
	name: 'clean',
	summary: 'Remove generated manifests, caches, and discovery artifacts.',
	usage: 'docs clean [--config <file>] [--static <dir>] [--keep-static] [--dry-run] [--json]',
	async run(args, context) {
		const { config } = await loadDocsConfig({
			cwd: context.cwd,
			...(stringOption(args, 'config') === undefined
				? {}
				: { configFile: stringOption(args, 'config') as string })
		});

		const targets = await collectDocsCleanTargets({
			config,
			cwd: context.cwd,
			includeStatic: !booleanOption(args, 'keep-static'),
			...(stringOption(args, 'static') === undefined
				? {}
				: { staticDir: stringOption(args, 'static') as string })
		});

		const dryRun = booleanOption(args, 'dry-run');
		const removed: string[] = [];

		for (const target of targets.filter((entry) => entry.exists)) {
			const absolute = resolve(context.cwd, target.path);

			// A path that escaped the project would be a bug, not a cleanup.
			if (relative(context.cwd, absolute).startsWith('..')) {
				context.writeError(`Refusing to remove a path outside the project: ${target.path}`);
				return 1;
			}

			if (!dryRun) {
				await rm(absolute, { recursive: true, force: true });

				// A static directory left empty by cleanup is removed too.
				const parent = resolve(absolute, '..');
				if (await isEmpty(parent)) {
					await rm(parent, { recursive: true, force: true });
				}
			}

			removed.push(target.path);
		}

		report(
			context,
			args,
			{ dryRun, removed, targets },
			[
				removed.length === 0
					? 'Nothing to clean.'
					: dryRun
						? `Would remove ${removed.length} path(s):`
						: `Removed ${removed.length} path(s):`,
				...targets
					.filter((target) => target.exists)
					.map((target) => `  ${target.path} — ${target.reason}`),
				...targets
					.filter((target) => !target.exists)
					.map((target) => `  (absent) ${target.path}`)
			]
		);

		return 0;
	}
};
