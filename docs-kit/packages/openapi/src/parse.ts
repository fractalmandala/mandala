import {
	apiSlug,
	type DocsApiBody,
	type DocsApiDiagnostic,
	type DocsApiDocument,
	type DocsApiMethod,
	type DocsApiOperation,
	type DocsApiParameter,
	type DocsApiParseResult,
	type DocsApiResponse,
	type DocsApiSchema,
	type DocsApiSchemaProperty,
	type DocsApiSecurityScheme,
	type DocsApiServer,
	type DocsApiTag
} from './model.js';

type Json = Record<string, unknown>;

const httpMethods: DocsApiMethod[] = [
	'get',
	'put',
	'post',
	'delete',
	'options',
	'head',
	'patch',
	'trace'
];

function isObject(value: unknown): value is Json {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

/** Parses JSON or YAML. YAML is loaded lazily so JSON-only projects never pay for it. */
export async function parseApiSource(source: string): Promise<{ value?: unknown; error?: string }> {
	const trimmed = source.trim();

	if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
		try {
			return { value: JSON.parse(trimmed) };
		} catch (error) {
			return { error: error instanceof Error ? error.message : String(error) };
		}
	}

	try {
		const { parse } = await import('yaml');
		return { value: parse(trimmed) };
	} catch (error) {
		return { error: error instanceof Error ? error.message : String(error) };
	}
}

/**
 * Resolves local `$ref` pointers.
 *
 * Only same-document references are followed: fetching remote schemas at build time would
 * make generation non-deterministic and network-dependent.
 */
function createResolver(root: Json, diagnostics: DocsApiDiagnostic[]) {
	const seen = new Set<string>();

	return function resolve(value: unknown, depth = 0): unknown {
		if (!isObject(value) || depth > 20) {
			return value;
		}

		const reference = readString(value['$ref']);
		if (reference === undefined) {
			return value;
		}

		if (!reference.startsWith('#/')) {
			if (!seen.has(reference)) {
				seen.add(reference);
				diagnostics.push({
					severity: 'warning',
					code: 'UNRESOLVED_REFERENCE',
					message: `External reference "${reference}" was not followed; only same-document refs are resolved.`,
					pointer: reference
				});
			}
			return value;
		}

		let current: unknown = root;
		for (const segment of reference.slice(2).split('/')) {
			const key = segment.replace(/~1/g, '/').replace(/~0/g, '~');
			current = isObject(current) ? current[key] : undefined;
		}

		if (current === undefined) {
			diagnostics.push({
				severity: 'warning',
				code: 'UNRESOLVED_REFERENCE',
				message: `Reference "${reference}" does not resolve inside the document.`,
				pointer: reference
			});
			return value;
		}

		return resolve(current, depth + 1);
	};
}

/** Renders a schema as a short, readable type expression. */
export function schemaTypeName(schema: unknown, resolve: (value: unknown) => unknown): string {
	// A named reference is reported by its name, so `Pet[]` reads better than `object[]`.
	const reference = isObject(schema) ? readString(schema['$ref']) : undefined;
	if (reference !== undefined && reference.startsWith('#/')) {
		return reference.split('/').at(-1) ?? 'unknown';
	}

	const resolved = resolve(schema);
	if (!isObject(resolved)) {
		return 'unknown';
	}
	if (reference !== undefined) {
		return reference.split('/').at(-1) ?? 'unknown';
	}

	for (const key of ['oneOf', 'anyOf', 'allOf'] as const) {
		const variants = resolved[key];
		if (Array.isArray(variants)) {
			const joiner = key === 'allOf' ? ' & ' : ' | ';
			return variants.map((variant) => schemaTypeName(variant, resolve)).join(joiner);
		}
	}

	const type = resolved['type'];
	if (type === 'array') {
		return `${schemaTypeName(resolved['items'], resolve)}[]`;
	}
	if (Array.isArray(type)) {
		return type.join(' | ');
	}

	const format = readString(resolved['format']);
	const base = readString(type) ?? (isObject(resolved['properties']) ? 'object' : 'unknown');
	return format ? `${base} (${format})` : base;
}

function exampleOf(value: unknown, resolve: (value: unknown) => unknown): string | undefined {
	const resolved = resolve(value);
	if (!isObject(resolved)) {
		return undefined;
	}

	const example =
		resolved['example'] ??
		(isObject(resolved['examples'])
			? Object.values(resolved['examples'] as Json)
					.map((entry) => (isObject(entry) ? entry['value'] : entry))
					.find((entry) => entry !== undefined)
			: undefined);

	return example === undefined ? undefined : JSON.stringify(example, null, '\t');
}

function parseParameters(
	raw: unknown,
	resolve: (value: unknown) => unknown
): DocsApiParameter[] {
	if (!Array.isArray(raw)) {
		return [];
	}

	return raw.flatMap((entry): DocsApiParameter[] => {
		const parameter = resolve(entry);
		if (!isObject(parameter)) {
			return [];
		}

		const name = readString(parameter['name']);
		const location = readString(parameter['in']);
		if (name === undefined || location === undefined) {
			return [];
		}

		return [
			{
				name,
				in: location as DocsApiParameter['in'],
				...(readString(parameter['description']) === undefined
					? {}
					: { description: readString(parameter['description']) as string }),
				required: parameter['required'] === true || location === 'path',
				type: schemaTypeName(parameter['schema'], resolve),
				...(parameter['deprecated'] === true ? { deprecated: true } : {})
			}
		];
	});
}

function parseBody(raw: unknown, resolve: (value: unknown) => unknown): DocsApiBody | undefined {
	const body = resolve(raw);
	if (!isObject(body) || !isObject(body['content'])) {
		return undefined;
	}

	const [mediaType, media] = Object.entries(body['content'] as Json)[0] ?? [];
	if (mediaType === undefined) {
		return undefined;
	}

	const resolvedMedia = resolve(media);
	const schema = isObject(resolvedMedia) ? resolvedMedia['schema'] : undefined;
	const example = isObject(resolvedMedia)
		? (exampleOf(resolvedMedia, resolve) ?? exampleOf(schema, resolve))
		: undefined;

	return {
		mediaType,
		type: schemaTypeName(schema, resolve),
		...(readString(body['description']) === undefined
			? {}
			: { description: readString(body['description']) as string }),
		required: body['required'] === true,
		...(example === undefined ? {} : { example })
	};
}

function parseResponses(raw: unknown, resolve: (value: unknown) => unknown): DocsApiResponse[] {
	if (!isObject(raw)) {
		return [];
	}

	return Object.entries(raw).flatMap(([status, value]): DocsApiResponse[] => {
		const response = resolve(value);
		if (!isObject(response)) {
			return [];
		}

		const content = isObject(response['content']) ? (response['content'] as Json) : undefined;
		const [mediaType, media] = content ? (Object.entries(content)[0] ?? []) : [];
		const resolvedMedia = media === undefined ? undefined : resolve(media);
		const schema = isObject(resolvedMedia) ? resolvedMedia['schema'] : undefined;
		const example = resolvedMedia
			? (exampleOf(resolvedMedia, resolve) ?? exampleOf(schema, resolve))
			: undefined;

		return [
			{
				status,
				...(readString(response['description']) === undefined
					? {}
					: { description: readString(response['description']) as string }),
				...(mediaType === undefined ? {} : { mediaType }),
				...(schema === undefined ? {} : { type: schemaTypeName(schema, resolve) }),
				...(example === undefined ? {} : { example })
			}
		];
	});
}

function parseSchemas(
	components: unknown,
	resolve: (value: unknown) => unknown
): DocsApiSchema[] {
	const schemas = isObject(components) ? components['schemas'] : undefined;
	if (!isObject(schemas)) {
		return [];
	}

	return Object.entries(schemas).map(([name, value]): DocsApiSchema => {
		const schema = resolve(value);
		const properties = isObject(schema) && isObject(schema['properties']) ? (schema['properties'] as Json) : {};
		const required = Array.isArray(isObject(schema) ? schema['required'] : undefined)
			? ((schema as Json)['required'] as string[])
			: [];
		const example = exampleOf(schema, resolve);

		return {
			name,
			slug: apiSlug(name),
			...(isObject(schema) && readString(schema['description']) !== undefined
				? { description: readString(schema['description']) as string }
				: {}),
			type: schemaTypeName(schema, resolve),
			properties: Object.entries(properties).map(([propertyName, propertyValue]): DocsApiSchemaProperty => {
				const property = resolve(propertyValue);
				const values = isObject(property) && Array.isArray(property['enum'])
					? (property['enum'] as unknown[]).map((entry) => JSON.stringify(entry))
					: undefined;

				return {
					name: propertyName,
					// The unresolved value is passed so a `$ref` keeps its schema name.
					type: schemaTypeName(propertyValue, resolve),
					...(isObject(property) && readString(property['description']) !== undefined
						? { description: readString(property['description']) as string }
						: {}),
					required: required.includes(propertyName),
					...(values === undefined ? {} : { values })
				};
			}),
			...(example === undefined ? {} : { example })
		};
	});
}

function parseSecuritySchemes(components: unknown): DocsApiSecurityScheme[] {
	const schemes = isObject(components) ? components['securitySchemes'] : undefined;
	if (!isObject(schemes)) {
		return [];
	}

	return Object.entries(schemes).flatMap(([name, value]): DocsApiSecurityScheme[] => {
		if (!isObject(value)) {
			return [];
		}

		const type = readString(value['type']) ?? 'unknown';
		const detail = [
			readString(value['scheme']),
			readString(value['in']) === undefined ? undefined : `in ${readString(value['in'])}`,
			readString(value['name']),
			isObject(value['flows']) ? Object.keys(value['flows'] as Json).join(', ') : undefined
		]
			.filter(Boolean)
			.join(' · ');

		return [
			{
				name,
				type,
				...(readString(value['description']) === undefined
					? {}
					: { description: readString(value['description']) as string }),
				...(detail === '' ? {} : { detail })
			}
		];
	});
}

function operationSecurity(raw: unknown, fallback: unknown): string[] {
	const list = Array.isArray(raw) ? raw : Array.isArray(fallback) ? fallback : [];
	return [...new Set(list.flatMap((entry) => (isObject(entry) ? Object.keys(entry) : [])))];
}

function parseOperations(
	paths: unknown,
	resolve: (value: unknown) => unknown,
	diagnostics: DocsApiDiagnostic[],
	documentSecurity: unknown,
	usedIds: Set<string>
): DocsApiOperation[] {
	if (!isObject(paths)) {
		return [];
	}

	const operations: DocsApiOperation[] = [];

	for (const [path, pathItemValue] of Object.entries(paths)) {
		const pathItem = resolve(pathItemValue);
		if (!isObject(pathItem)) {
			continue;
		}

		const sharedParameters = parseParameters(pathItem['parameters'], resolve);

		for (const method of httpMethods) {
			const raw = pathItem[method];
			if (!isObject(raw)) {
				continue;
			}

			const declaredId = readString(raw['operationId']);
			if (declaredId === undefined) {
				diagnostics.push({
					severity: 'info',
					code: 'MISSING_OPERATION_ID',
					message: `${method.toUpperCase()} ${path} has no operationId; one was derived from the path.`,
					pointer: `#/paths/${path.replace(/\//g, '~1')}/${method}`
				});
			}

			let id = declaredId ?? `${method}-${apiSlug(path)}`;
			if (usedIds.has(id)) {
				diagnostics.push({
					severity: 'warning',
					code: 'DUPLICATE_OPERATION_ID',
					message: `Duplicate operationId "${id}"; the second occurrence was renamed.`,
					pointer: `#/paths/${path.replace(/\//g, '~1')}/${method}`
				});

				let counter = 2;
				while (usedIds.has(`${id}-${counter}`)) {
					counter += 1;
				}
				id = `${id}-${counter}`;
			}
			usedIds.add(id);

			const body = parseBody(raw['requestBody'], resolve);

			operations.push({
				id,
				slug: apiSlug(id),
				method,
				path,
				...(readString(raw['summary']) === undefined
					? {}
					: { summary: readString(raw['summary']) as string }),
				...(readString(raw['description']) === undefined
					? {}
					: { description: readString(raw['description']) as string }),
				tags: Array.isArray(raw['tags'])
					? (raw['tags'] as unknown[]).filter((tag): tag is string => typeof tag === 'string')
					: [],
				deprecated: raw['deprecated'] === true,
				parameters: [...sharedParameters, ...parseParameters(raw['parameters'], resolve)],
				...(body === undefined ? {} : { requestBody: body }),
				responses: parseResponses(raw['responses'], resolve),
				security: operationSecurity(raw['security'], documentSecurity)
			});
		}
	}

	return operations;
}

function collectTags(document: Json, operations: readonly DocsApiOperation[]): DocsApiTag[] {
	const declared = Array.isArray(document['tags']) ? (document['tags'] as unknown[]) : [];
	const tags = new Map<string, DocsApiTag>();

	for (const entry of declared) {
		if (!isObject(entry)) {
			continue;
		}
		const name = readString(entry['name']);
		if (name === undefined) {
			continue;
		}

		tags.set(name, {
			name,
			...(readString(entry['description']) === undefined
				? {}
				: { description: readString(entry['description']) as string }),
			operations: []
		});
	}

	for (const operation of operations) {
		for (const name of operation.tags.length > 0 ? operation.tags : ['Default']) {
			const tag = tags.get(name) ?? { name, operations: [] };
			tag.operations.push(operation.id);
			tags.set(name, tag);
		}
	}

	return [...tags.values()].filter((tag) => tag.operations.length > 0);
}

/**
 * Parses an OpenAPI 3 document into the normalized model.
 *
 * A malformed document yields diagnostics rather than a thrown error, so a build can report
 * every problem at once instead of failing on the first.
 */
export async function parseOpenApi(source: string): Promise<DocsApiParseResult> {
	const diagnostics: DocsApiDiagnostic[] = [];
	const parsed = await parseApiSource(source);

	if (parsed.error !== undefined) {
		return {
			diagnostics: [
				{
					severity: 'error',
					code: 'INVALID_DOCUMENT',
					message: `The document could not be parsed: ${parsed.error}`
				}
			]
		};
	}

	if (!isObject(parsed.value)) {
		return {
			diagnostics: [
				{ severity: 'error', code: 'INVALID_DOCUMENT', message: 'The document is not an object.' }
			]
		};
	}

	const root = parsed.value;
	const specVersion = readString(root['openapi']);

	if (specVersion === undefined) {
		return {
			diagnostics: [
				{
					severity: 'error',
					code: 'UNSUPPORTED_VERSION',
					message: root['swagger']
						? 'Swagger 2.0 is not supported. Convert the document to OpenAPI 3 first.'
						: 'Missing `openapi` version field; only OpenAPI 3 documents are supported.'
				}
			]
		};
	}

	if (!specVersion.startsWith('3.')) {
		return {
			diagnostics: [
				{
					severity: 'error',
					code: 'UNSUPPORTED_VERSION',
					message: `Unsupported OpenAPI version "${specVersion}"; expected 3.x.`
				}
			]
		};
	}

	const resolve = createResolver(root, diagnostics);
	const info = isObject(root['info']) ? (root['info'] as Json) : undefined;
	const title = readString(info?.['title']);

	if (title === undefined) {
		diagnostics.push({
			severity: 'warning',
			code: 'MISSING_INFO',
			message: 'The document has no `info.title`; a placeholder was used.',
			pointer: '#/info/title'
		});
	}

	const usedIds = new Set<string>();
	const operations = parseOperations(
		root['paths'],
		resolve,
		diagnostics,
		root['security'],
		usedIds
	);
	const webhooks = parseOperations(root['webhooks'], resolve, diagnostics, root['security'], usedIds);

	if (operations.length === 0 && webhooks.length === 0) {
		diagnostics.push({
			severity: 'warning',
			code: 'EMPTY_DOCUMENT',
			message: 'The document declares no operations.'
		});
	}

	const servers = Array.isArray(root['servers'])
		? (root['servers'] as unknown[]).flatMap((entry): DocsApiServer[] =>
				isObject(entry) && readString(entry['url']) !== undefined
					? [
							{
								url: readString(entry['url']) as string,
								...(readString(entry['description']) === undefined
									? {}
									: { description: readString(entry['description']) as string })
							}
						]
					: []
			)
		: [];

	return {
		document: {
			kind: 'openapi',
			specVersion,
			title: title ?? 'API reference',
			version: readString(info?.['version']) ?? '0.0.0',
			...(readString(info?.['description']) === undefined
				? {}
				: { description: readString(info?.['description']) as string }),
			servers,
			tags: collectTags(root, operations),
			operations,
			schemas: parseSchemas(root['components'], resolve),
			security: parseSecuritySchemes(root['components']),
			webhooks
		},
		diagnostics
	};
}
