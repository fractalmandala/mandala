import { createDocsSource, syncDocsSources } from '@docs-kit/sources';

import { loadDocsConfig } from '../config-file.js';
import {
	booleanOption,
	report,
	stringOption,
	type DocsCliCommand
} from '../runtime.js';

/** `docs sync` — refreshes every configured content source into the local cache. */
export const syncCommand: DocsCliCommand = {
	name: 'sync',
	summary: 'Refresh remote content sources into the local cache.',
	usage: 'docs sync [--config <file>] [--source <id>] [--offline] [--json]',
	async run(args, context) {
		const { path, config } = await loadDocsConfig({
			cwd: context.cwd,
			...(stringOption(args, 'config') === undefined
				? {}
				: { configFile: stringOption(args, 'config') as string })
		});
		const only = stringOption(args, 'source');
		const entries = config.sources.entries.filter((entry) => only === undefined || entry.id === only);

		if (entries.length === 0) {
			context.writeError(
				only === undefined
					? `No sources are configured in ${path}.`
					: `No source with id "${only}" is configured in ${path}.`
			);
			return 1;
		}

		const result = await syncDocsSources({
			cwd: context.cwd,
			cacheDir: config.sources.cacheDir,
			onConflict: config.sources.onConflict,
			offline: booleanOption(args, 'offline'),
			sources: entries.map((entry) => createDocsSource(entry, { env: context.env }))
		});

		const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
		report(
			context,
			args,
			{
				status: result.status,
				cacheDir: result.cacheDir,
				sources: result.sources,
				pages: result.content.length,
				diagnostics: result.diagnostics
			},
			[
				`Synced ${result.sources.length} source(s) into ${result.cacheDir}`,
				...result.sources.map((source) => {
					const counts = `${source.written.length} written, ${source.unchanged.length} unchanged, ${source.deleted.length} removed`;
					return `  ${source.status.padEnd(8)} ${source.sourceId} — ${counts}${
						source.error ? ` (${source.error})` : ''
					}`;
				}),
				`${result.content.length} page(s) available`,
				...result.diagnostics.map(
					(diagnostic) => `  ${diagnostic.severity.toUpperCase()} ${diagnostic.code}: ${diagnostic.message}`
				)
			]
		);

		if (result.status === 'failed' || errors.length > 0) {
			return 1;
		}

		return 0;
	}
};
