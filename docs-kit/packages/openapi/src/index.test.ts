import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { detectApiKind, parseAsyncApi } from './asyncapi.js';
import { generateApiDocs } from './generate.js';
import { generateApiPages } from './pages.js';
import { parseOpenApi, schemaTypeName } from './parse.js';
import { createApiReferenceConfiguration, describeApiDocument } from './scalar.js';

import type { DocsApiDocument } from './model.js';

const temporaryRoots: string[] = [];

afterEach(async () => {
	await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function temporaryDirectory(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), 'docs-kit-openapi-'));
	temporaryRoots.push(root);
	return root;
}

const petstore = {
	openapi: '3.1.0',
	info: { title: 'Petstore', version: '2.1.0', description: 'A small pet store API.' },
	servers: [{ url: 'https://api.petstore.dev/v2', description: 'Production' }],
	tags: [{ name: 'pets', description: 'Everything about pets.' }],
	security: [{ apiKey: [] }],
	paths: {
		'/pets': {
			parameters: [
				{ name: 'limit', in: 'query', schema: { type: 'integer', format: 'int32' }, description: 'Page size.' }
			],
			get: {
				operationId: 'listPets',
				summary: 'List pets',
				description: 'Returns every pet.\nPaginated.',
				tags: ['pets'],
				responses: {
					'200': {
						description: 'A list of pets.',
						content: {
							'application/json': {
								schema: { type: 'array', items: { $ref: '#/components/schemas/Pet' } },
								example: [{ id: 1, name: 'Rex' }]
							}
						}
					},
					'429': { description: 'Too many requests.' }
				}
			},
			post: {
				operationId: 'createPet',
				summary: 'Create a pet',
				tags: ['pets'],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: { $ref: '#/components/schemas/Pet' },
							example: { name: 'Rex' }
						}
					}
				},
				responses: { '201': { description: 'Created.' } }
			}
		},
		'/pets/{petId}': {
			delete: {
				summary: 'Delete a pet',
				deprecated: true,
				tags: ['pets'],
				parameters: [{ name: 'petId', in: 'path', required: true, schema: { type: 'string' } }],
				responses: { '204': { description: 'Deleted.' } }
			}
		}
	},
	components: {
		schemas: {
			Pet: {
				type: 'object',
				description: 'A pet.',
				required: ['id', 'name'],
				properties: {
					id: { type: 'integer', description: 'Identifier.' },
					name: { type: 'string' },
					status: { type: 'string', enum: ['available', 'sold'] },
					tag: { $ref: '#/components/schemas/Tag' }
				},
				example: { id: 1, name: 'Rex' }
			},
			Tag: { type: 'object', properties: { name: { type: 'string' } } }
		},
		securitySchemes: {
			apiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key', description: 'Your API key.' }
		}
	}
};

describe('parseOpenApi', () => {
	it('normalizes operations, parameters, bodies, responses, and schemas', async () => {
		const { document, diagnostics } = await parseOpenApi(JSON.stringify(petstore));

		expect(document).toBeDefined();
		expect(document?.title).toBe('Petstore');
		expect(document?.operations.map((operation) => operation.id)).toEqual([
			'listPets',
			'createPet',
			'delete-pets-petid'
		]);

		const list = document?.operations[0];
		expect(list?.parameters).toEqual([
			{ name: 'limit', in: 'query', description: 'Page size.', required: false, type: 'integer (int32)' }
		]);
		expect(list?.responses[0]).toMatchObject({ status: '200', type: 'Pet[]' });
		expect(list?.security).toEqual(['apiKey']);

		const create = document?.operations[1];
		expect(create?.requestBody).toMatchObject({
			mediaType: 'application/json',
			type: 'Pet',
			required: true
		});

		expect(document?.schemas[0]?.properties.map((property) => property.name)).toEqual([
			'id',
			'name',
			'status',
			'tag'
		]);
		expect(document?.schemas[0]?.properties[2]?.values).toEqual(['"available"', '"sold"']);
		expect(document?.schemas[0]?.properties[3]?.type).toBe('Tag');
		expect(document?.security[0]).toMatchObject({ name: 'apiKey', type: 'apiKey' });
		expect(diagnostics.filter((entry) => entry.severity === 'error')).toEqual([]);
	});

	it('parses YAML as well as JSON', async () => {
		const yaml = [
			'openapi: 3.0.3',
			'info:',
			'  title: Minimal',
			'  version: 1.0.0',
			'paths:',
			'  /ping:',
			'    get:',
			'      operationId: ping',
			'      responses:',
			"        '200':",
			'          description: pong'
		].join('\n');

		const { document } = await parseOpenApi(yaml);
		expect(document?.title).toBe('Minimal');
		expect(document?.operations[0]?.id).toBe('ping');
	});

	it('reports malformed documents instead of throwing', async () => {
		expect((await parseOpenApi('{ not json')).diagnostics[0]).toMatchObject({
			severity: 'error',
			code: 'INVALID_DOCUMENT'
		});
		expect((await parseOpenApi('{}')).diagnostics[0]).toMatchObject({ code: 'UNSUPPORTED_VERSION' });
		expect(
			(await parseOpenApi(JSON.stringify({ swagger: '2.0' }))).diagnostics[0]?.message
		).toContain('Swagger 2.0 is not supported');
		expect(
			(await parseOpenApi(JSON.stringify({ openapi: '4.0.0' }))).diagnostics[0]?.message
		).toContain('Unsupported OpenAPI version');
	});

	it('warns about missing info, empty paths, duplicate ids, and external refs', async () => {
		const { document, diagnostics } = await parseOpenApi(
			JSON.stringify({
				openapi: '3.0.0',
				paths: {
					'/a': {
						get: { operationId: 'same', responses: {} },
						post: {
							operationId: 'same',
							requestBody: { content: { 'application/json': { schema: { $ref: 'other.yaml#/Pet' } } } },
							responses: {}
						}
					}
				}
			})
		);

		const codes = diagnostics.map((entry) => entry.code);
		expect(codes).toContain('MISSING_INFO');
		expect(codes).toContain('DUPLICATE_OPERATION_ID');
		expect(codes).toContain('UNRESOLVED_REFERENCE');
		expect(document?.operations.map((operation) => operation.id)).toEqual(['same', 'same-2']);

		expect((await parseOpenApi(JSON.stringify({ openapi: '3.0.0', paths: {} }))).diagnostics.map((entry) => entry.code)).toContain(
			'EMPTY_DOCUMENT'
		);
	});

	it('renders readable type names', () => {
		const identity = (value: unknown) => value;

		expect(schemaTypeName({ type: 'string', format: 'date-time' }, identity)).toBe(
			'string (date-time)'
		);
		expect(schemaTypeName({ oneOf: [{ type: 'string' }, { type: 'number' }] }, identity)).toBe(
			'string | number'
		);
		expect(schemaTypeName(undefined, identity)).toBe('unknown');
	});
});

describe('generateApiPages', () => {
	it('produces an overview, tag, operation, schema, and authentication pages', async () => {
		const { document } = await parseOpenApi(JSON.stringify(petstore));
		const pages = generateApiPages(document as DocsApiDocument, { directory: 'api' });
		const paths = pages.map((page) => page.relativePath);

		expect(paths).toEqual([
			'api/authentication.md',
			'api/index.md',
			'api/operations/createpet.md',
			'api/operations/delete-pets-petid.md',
			'api/operations/listpets.md',
			'api/pets.md',
			'api/schemas/pet.md',
			'api/schemas/tag.md'
		]);

		const operation = pages.find((page) => page.relativePath.endsWith('listpets.md'));
		expect(operation?.content).toContain("title: 'List pets'");
		expect(operation?.content).toContain("badge: 'GET'");
		expect(operation?.content).toContain('`GET` `/pets`');
		expect(operation?.content).toContain('| `limit` | query | `integer (int32)` | no | Page size. |');
		expect(operation?.content).toContain('```json title="Response 200"');

		const deprecated = pages.find((page) => page.relativePath.endsWith('delete-pets-petid.md'));
		expect(deprecated?.content).toContain(':::warning{title="Deprecated"}');

		expect(pages.find((page) => page.relativePath === 'api/pets.md')?.content).toContain(
			'[List pets](/api/operations/listpets)'
		);
		expect(pages.find((page) => page.relativePath.endsWith('schemas/pet.md'))?.content).toContain(
			'| `status` | `string` | no | One of: "available", "sold" |'
		);
		expect(pages.find((page) => page.relativePath === 'api/authentication.md')?.content).toContain(
			'| `apiKey` | apiKey | in header · X-API-Key | Your API key. |'
		);
	});

	it('can omit schemas, tags, and examples', async () => {
		const { document } = await parseOpenApi(JSON.stringify(petstore));
		const pages = generateApiPages(document as DocsApiDocument, {
			directory: 'reference',
			schemas: false,
			tags: false,
			examples: false
		});

		expect(pages.some((page) => page.relativePath.includes('schemas/'))).toBe(false);
		expect(pages.some((page) => page.kind === 'tag')).toBe(false);
		expect(pages.every((page) => !page.content.includes('```json'))).toBe(true);
		expect(pages[0]?.relativePath.startsWith('reference/')).toBe(true);
	});

	it('escapes pipes so a description cannot break a table', async () => {
		const { document } = await parseOpenApi(
			JSON.stringify({
				openapi: '3.0.0',
				info: { title: 'A', version: '1' },
				paths: {
					'/a': {
						get: {
							operationId: 'a',
							parameters: [
								{ name: 'q', in: 'query', description: 'one | two', schema: { type: 'string' } }
							],
							responses: {}
						}
					}
				}
			})
		);

		const page = generateApiPages(document as DocsApiDocument).find((entry) =>
			entry.relativePath.endsWith('operations/a.md')
		);
		expect(page?.content).toContain('one \\| two');
	});
});

describe('parseAsyncApi', () => {
	const events = {
		asyncapi: '2.6.0',
		info: { title: 'Pet events', version: '1.0.0' },
		servers: { production: { url: 'wss://events.petstore.dev', description: 'Live' } },
		channels: {
			'pet/created': {
				parameters: { petId: { description: 'The pet id.' } },
				subscribe: {
					operationId: 'onPetCreated',
					summary: 'A pet was created',
					message: { name: 'PetCreated' }
				}
			}
		}
	};

	it('models channels as operations that generate pages', async () => {
		const { document, diagnostics } = await parseAsyncApi(JSON.stringify(events));

		expect(document?.kind).toBe('asyncapi');
		expect(document?.operations[0]).toMatchObject({
			id: 'onPetCreated',
			method: 'subscribe',
			channel: 'pet/created'
		});
		expect(document?.operations[0]?.responses[0]?.type).toBe('PetCreated');
		expect(diagnostics.filter((entry) => entry.severity === 'error')).toEqual([]);

		const pages = generateApiPages(document as DocsApiDocument, { directory: 'events' });
		expect(pages.map((page) => page.relativePath)).toContain('events/operations/onpetcreated.md');
	});

	it('detects the specification kind and reports unsupported ones', async () => {
		expect(await detectApiKind(JSON.stringify(petstore))).toBe('openapi');
		expect(await detectApiKind(JSON.stringify(events))).toBe('asyncapi');
		expect(await detectApiKind('{}')).toBeUndefined();
		expect((await parseAsyncApi(JSON.stringify({ asyncapi: '3.0.0' }))).diagnostics[0]?.code).toBe(
			'UNSUPPORTED_VERSION'
		);
	});
});

describe('generateApiDocs', () => {
	it('writes pages, rewrites only what changed, and prunes removed operations', async () => {
		const cwd = await temporaryDirectory();
		await writeFile(join(cwd, 'openapi.json'), JSON.stringify(petstore), 'utf8');

		const first = await generateApiDocs({
			cwd,
			outDir: '.docs-kit/generated/api',
			sources: [{ id: 'api', source: 'openapi.json' }]
		});

		expect(first.written).toContain('api/operations/listpets.md');
		expect(first.removed).toEqual([]);
		expect(await readFile(join(cwd, '.docs-kit/generated/api/api/index.md'), 'utf8')).toContain(
			'Petstore'
		);

		const unchanged = await generateApiDocs({
			cwd,
			outDir: '.docs-kit/generated/api',
			sources: [{ id: 'api', source: 'openapi.json' }]
		});
		expect(unchanged.written).toEqual([]);
		expect(unchanged.unchanged.length).toBe(first.written.length);

		const trimmed = structuredClone(petstore) as typeof petstore;
		delete (trimmed.paths as Record<string, unknown>)['/pets/{petId}'];
		await writeFile(join(cwd, 'openapi.json'), JSON.stringify(trimmed), 'utf8');

		const pruned = await generateApiDocs({
			cwd,
			outDir: '.docs-kit/generated/api',
			sources: [{ id: 'api', source: 'openapi.json' }]
		});
		expect(pruned.removed).toEqual(['api/operations/delete-pets-petid.md']);
	});

	it('reports unreadable and malformed specifications without failing the run', async () => {
		const cwd = await temporaryDirectory();
		await writeFile(join(cwd, 'broken.json'), '{ not json', 'utf8');

		const result = await generateApiDocs({
			cwd,
			outDir: 'generated',
			sources: [
				{ id: 'missing', source: 'nope.json' },
				{ id: 'broken', source: 'broken.json' }
			]
		});

		expect(result.diagnostics.map((entry) => entry.sourceId)).toEqual(['missing', 'broken']);
		expect(result.documents).toEqual([]);
		expect(result.written).toEqual([]);
	});

	it('loads remote specifications over HTTPS only', async () => {
		const cwd = await temporaryDirectory();
		const result = await generateApiDocs({
			cwd,
			outDir: 'generated',
			sources: [
				{ id: 'remote', source: 'https://acme.com/openapi.json' },
				{ id: 'insecure', source: 'http://acme.com/openapi.json' }
			],
			fetch: async () => new Response(JSON.stringify(petstore))
		});

		expect(result.documents.map((entry) => entry.sourceId)).toEqual(['remote']);
		expect(result.diagnostics.find((entry) => entry.sourceId === 'insecure')?.message).toContain(
			'HTTPS'
		);
	});

	it('generates several specifications side by side', async () => {
		const cwd = await temporaryDirectory();
		await mkdir(join(cwd, 'specs'), { recursive: true });
		await writeFile(join(cwd, 'specs/rest.json'), JSON.stringify(petstore), 'utf8');
		await writeFile(
			join(cwd, 'specs/events.json'),
			JSON.stringify({
				asyncapi: '2.6.0',
				info: { title: 'Events', version: '1' },
				channels: { 'pet/created': { subscribe: { operationId: 'onCreated' } } }
			}),
			'utf8'
		);

		const result = await generateApiDocs({
			cwd,
			outDir: 'generated',
			sources: [
				{ id: 'api', source: 'specs/rest.json' },
				{ id: 'events', source: 'specs/events.json' }
			]
		});

		expect(result.documents.map((entry) => entry.document.kind)).toEqual(['openapi', 'asyncapi']);
		expect(result.written.some((path) => path.startsWith('api/'))).toBe(true);
		expect(result.written.some((path) => path.startsWith('events/'))).toBe(true);
	});
});

describe('Scalar integration', () => {
	it('builds a configuration and summarizes a document', async () => {
		const { document } = await parseOpenApi(JSON.stringify(petstore));

		expect(createApiReferenceConfiguration({ url: '/api/openapi.json' })).toMatchObject({
			spec: { url: '/api/openapi.json' },
			theme: 'none',
			hideDownloadButton: false
		});
		expect(() => createApiReferenceConfiguration({})).toThrow(/url.*content/);
		expect(describeApiDocument(document as DocsApiDocument)).toEqual({
			title: 'Petstore',
			version: '2.1.0',
			operationCount: 3,
			tagCount: 1,
			schemaCount: 2
		});
	});
});
