import { parseApiSource } from './parse.js';
import {
	apiSlug,
	type DocsApiDiagnostic,
	type DocsApiOperation,
	type DocsApiParseResult,
	type DocsApiTag
} from './model.js';

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

/**
 * Parses an AsyncAPI 2.x document into the same model OpenAPI produces.
 *
 * This is groundwork: channels and their publish/subscribe operations are modelled so they
 * generate pages, but message payloads are summarized rather than expanded. Anything not
 * yet supported is reported instead of being silently dropped.
 */
export async function parseAsyncApi(source: string): Promise<DocsApiParseResult> {
	const diagnostics: DocsApiDiagnostic[] = [];
	const parsed = await parseApiSource(source);

	if (parsed.error !== undefined || !isObject(parsed.value)) {
		return {
			diagnostics: [
				{
					severity: 'error',
					code: 'INVALID_DOCUMENT',
					message: `The document could not be parsed: ${parsed.error ?? 'not an object'}`
				}
			]
		};
	}

	const root = parsed.value;
	const specVersion = readString(root['asyncapi']);

	if (specVersion === undefined) {
		return {
			diagnostics: [
				{
					severity: 'error',
					code: 'UNSUPPORTED_VERSION',
					message: 'Missing `asyncapi` version field.'
				}
			]
		};
	}

	if (!specVersion.startsWith('2.')) {
		diagnostics.push({
			severity: 'warning',
			code: 'UNSUPPORTED_VERSION',
			message: `AsyncAPI ${specVersion} is not fully supported yet; parsing as 2.x.`
		});
	}

	const info = isObject(root['info']) ? (root['info'] as Json) : undefined;
	const channels = isObject(root['channels']) ? (root['channels'] as Json) : {};
	const operations: DocsApiOperation[] = [];
	const tags = new Map<string, DocsApiTag>();

	for (const [channel, value] of Object.entries(channels)) {
		if (!isObject(value)) {
			continue;
		}

		for (const action of ['publish', 'subscribe'] as const) {
			const raw = value[action];
			if (!isObject(raw)) {
				continue;
			}

			const id = readString(raw['operationId']) ?? `${action}-${apiSlug(channel)}`;
			const message = isObject(raw['message']) ? (raw['message'] as Json) : undefined;
			const payloadType = message
				? (readString(message['name']) ?? readString(message['title']) ?? 'message')
				: 'message';
			const tagNames = Array.isArray(raw['tags'])
				? (raw['tags'] as unknown[]).flatMap((tag) =>
						isObject(tag) && readString(tag['name']) ? [readString(tag['name']) as string] : []
					)
				: [];

			operations.push({
				id,
				slug: apiSlug(id),
				method: action,
				path: channel,
				channel,
				...(readString(raw['summary']) === undefined
					? {}
					: { summary: readString(raw['summary']) as string }),
				...(readString(raw['description']) === undefined
					? {}
					: { description: readString(raw['description']) as string }),
				tags: tagNames,
				deprecated: raw['deprecated'] === true,
				parameters: Object.entries(isObject(value['parameters']) ? (value['parameters'] as Json) : {}).map(
					([name, parameter]) => ({
						name,
						in: 'path' as const,
						required: true,
						type: 'string',
						...(isObject(parameter) && readString(parameter['description']) !== undefined
							? { description: readString(parameter['description']) as string }
							: {})
					})
				),
				responses: [
					{
						status: 'message',
						...(payloadType === undefined ? {} : { type: payloadType }),
						description: `${action === 'publish' ? 'Published' : 'Received'} on \`${channel}\`.`
					}
				],
				security: []
			});

			for (const name of tagNames.length > 0 ? tagNames : ['Channels']) {
				const tag = tags.get(name) ?? { name, operations: [] };
				tag.operations.push(id);
				tags.set(name, tag);
			}
		}
	}

	if (operations.length === 0) {
		diagnostics.push({
			severity: 'warning',
			code: 'EMPTY_DOCUMENT',
			message: 'The document declares no channel operations.'
		});
	}

	const servers = isObject(root['servers'])
		? Object.entries(root['servers'] as Json).flatMap(([name, server]) =>
				isObject(server)
					? [
							{
								url: readString(server['url']) ?? name,
								...(readString(server['description']) === undefined
									? {}
									: { description: readString(server['description']) as string })
							}
						]
					: []
			)
		: [];

	return {
		document: {
			kind: 'asyncapi',
			specVersion,
			title: readString(info?.['title']) ?? 'Event API reference',
			version: readString(info?.['version']) ?? '0.0.0',
			...(readString(info?.['description']) === undefined
				? {}
				: { description: readString(info?.['description']) as string }),
			servers,
			tags: [...tags.values()],
			operations,
			schemas: [],
			security: [],
			webhooks: []
		},
		diagnostics
	};
}

/** Detects which specification a document declares, so callers can pick the parser. */
export async function detectApiKind(source: string): Promise<'openapi' | 'asyncapi' | undefined> {
	const parsed = await parseApiSource(source);
	if (!isObject(parsed.value)) {
		return undefined;
	}

	if (readString(parsed.value['openapi']) !== undefined) {
		return 'openapi';
	}

	return readString(parsed.value['asyncapi']) === undefined ? undefined : 'asyncapi';
}
