import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

import { discoverLocalContent } from '@docs-kit/core/discovery';
import type { DocsContentSource, DocsSourceDocument } from '@docs-kit/core';

export interface LocalSourceOptions {
	/** Stable source id. Defaults to `local`. */
	id?: string;
	/** Content directory, absolute or relative to the load context's `cwd`. */
	root: string;
	version?: string;
	locale?: string;
	priority?: number;
	namespace?: string;
	includeHiddenDirectories?: boolean;
}

/**
 * The reference source adapter: local Markdown and mdsvex files.
 * Local content is trusted, so it keeps its original extension and is not sanitized.
 */
export function localSource(options: LocalSourceOptions): DocsContentSource {
	return {
		id: options.id ?? 'local',
		type: 'local',
		...(options.priority === undefined ? {} : { priority: options.priority }),
		...(options.namespace === undefined ? {} : { namespace: options.namespace }),
		async load(context) {
			const root = isAbsolute(options.root) ? options.root : resolve(context.cwd, options.root);
			const discovered = await discoverLocalContent({
				root,
				...(options.includeHiddenDirectories === undefined
					? {}
					: { includeHiddenDirectories: options.includeHiddenDirectories }),
				...(options.version === undefined ? {} : { version: options.version }),
				...(options.locale === undefined ? {} : { locale: options.locale })
			});

			return Promise.all(
				discovered.map(async (entry): Promise<DocsSourceDocument> => {
					const content = await readFile(entry.sourcePath, 'utf8');

					return {
						relativePath: entry.relativePath,
						content,
						origin: { path: entry.relativePath },
						...(options.version === undefined ? {} : { version: options.version }),
						...(options.locale === undefined ? {} : { locale: options.locale })
					};
				})
			);
		}
	};
}
