import type { DocsContentSource, DocsSourceConfig } from '@docs-kit/core';

import { githubReleasesSource } from './github-releases.js';
import { githubSource } from './github.js';
import { localSource } from './local.js';
import { notionSource } from './notion.js';
import { remoteMarkdownSource } from './remote-markdown.js';
import { sanitySource } from './sanity.js';

export interface DocsSourceFactoryOptions {
	/** Environment used to resolve `tokenEnv`. Defaults to `process.env`. */
	env?: Record<string, string | undefined>;
}

function resolveToken(
	config: DocsSourceConfig,
	env: Record<string, string | undefined>
): string | undefined {
	const tokenEnv = config['tokenEnv'];
	if (typeof tokenEnv === 'string') {
		const value = env[tokenEnv];
		if (!value) {
			throw new Error(
				`Source "${config.id}" expects the credential in environment variable ${tokenEnv}, which is not set.`
			);
		}
		return value;
	}

	return typeof config['token'] === 'string' ? config['token'] : undefined;
}

function commonOptions(config: DocsSourceConfig): {
	id: string;
	priority?: number;
	namespace?: string;
	version?: string;
	locale?: string;
} {
	return {
		id: config.id,
		...(typeof config.priority === 'number' ? { priority: config.priority } : {}),
		...(typeof config.namespace === 'string' ? { namespace: config.namespace } : {}),
		...(typeof config['version'] === 'string' ? { version: config['version'] } : {}),
		...(typeof config['locale'] === 'string' ? { locale: config['locale'] } : {})
	};
}

function requireString(config: DocsSourceConfig, key: string): string {
	const value = config[key];
	if (typeof value !== 'string' || value.trim() === '') {
		throw new Error(`Source "${config.id}" requires a "${key}" option.`);
	}
	return value;
}

function optionalString(config: DocsSourceConfig, key: string): Record<string, string> {
	const value = config[key];
	return typeof value === 'string' && value !== '' ? { [key]: value } : {};
}

/**
 * Builds a source adapter from serializable configuration.
 *
 * Credentials are read from the environment through `tokenEnv` so they stay out of the
 * configuration file and out of every generated artifact.
 */
export function createDocsSource(
	config: DocsSourceConfig,
	options: DocsSourceFactoryOptions = {}
): DocsContentSource {
	const env = options.env ?? (process.env as Record<string, string | undefined>);
	const token = resolveToken(config, env);
	const shared = commonOptions(config);

	switch (config.type) {
		case 'local':
			return localSource({ ...shared, root: requireString(config, 'root') });
		case 'remote-markdown':
			return remoteMarkdownSource({
				...shared,
				documents: Array.isArray(config['documents'])
					? (config['documents'] as { url: string; path: string }[])
					: []
			});
		case 'github':
			return githubSource({
				...shared,
				repository: requireString(config, 'repository'),
				...optionalString(config, 'ref'),
				...optionalString(config, 'directory'),
				...optionalString(config, 'apiUrl'),
				...(token === undefined ? {} : { token })
			});
		case 'github-releases':
			return githubReleasesSource({
				...shared,
				repository: requireString(config, 'repository'),
				...optionalString(config, 'directory'),
				...(typeof config['limit'] === 'number' ? { limit: config['limit'] } : {}),
				...(token === undefined ? {} : { token })
			});
		case 'notion':
			if (token === undefined) {
				throw new Error(`Source "${config.id}" requires a "tokenEnv" or "token" option.`);
			}
			return notionSource({
				...shared,
				token,
				...optionalString(config, 'databaseId'),
				...optionalString(config, 'directory'),
				...(Array.isArray(config['pageIds'])
					? { pageIds: config['pageIds'] as string[] }
					: {})
			});
		case 'sanity':
			return sanitySource({
				...shared,
				projectId: requireString(config, 'projectId'),
				dataset: requireString(config, 'dataset'),
				...optionalString(config, 'query'),
				...optionalString(config, 'directory'),
				...(token === undefined ? {} : { token })
			});
		default:
			throw new Error(`Unknown docs source type "${config.type}" for source "${config.id}".`);
	}
}
