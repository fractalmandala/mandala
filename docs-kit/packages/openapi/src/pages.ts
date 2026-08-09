import type {
	DocsApiDocument,
	DocsApiOperation,
	DocsApiSchema,
	DocsApiTag
} from './model.js';

export interface DocsApiPage {
	/** Path relative to the generated content root, always `.md`. */
	relativePath: string;
	/** Markdown with frontmatter, ready for the ordinary compiler. */
	content: string;
	kind: 'overview' | 'tag' | 'operation' | 'schema' | 'authentication';
	title: string;
}

export interface GenerateApiPagesOptions {
	/** Directory the generated pages live under, relative to the content root. */
	directory?: string;
	/**
	 * Route the content root is mounted at, for example `/docs`.
	 *
	 * Generated pages link to each other, so they need to know where they will be served
	 * from; without it the links would point at the site root.
	 */
	basePath?: string;
	/** Emit a page per schema. Defaults to true. */
	schemas?: boolean;
	/** Emit a page per tag listing its operations. Defaults to true. */
	tags?: boolean;
	/** Emit the authentication page when security schemes exist. Defaults to true. */
	authentication?: boolean;
	/** Sort weight of the generated section among hand-written pages. */
	order?: number;
	/** Include request and response examples. Defaults to true. */
	examples?: boolean;
}

function yamlString(value: string): string {
	return `'${value.replace(/'/g, "''")}'`;
}

function frontmatter(fields: Record<string, string | number | undefined>): string {
	const entries = Object.entries(fields).filter(([, value]) => value !== undefined && value !== '');
	if (entries.length === 0) {
		return '';
	}

	const lines = entries.map(([key, value]) =>
		typeof value === 'number' ? `${key}: ${value}` : `${key}: ${yamlString(String(value))}`
	);

	return `---\n${lines.join('\n')}\n---\n\n`;
}

/** Markdown tables are escaped so a pipe inside a description cannot break the row. */
function cell(value: string | undefined): string {
	return (value ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim() || '—';
}

function summarize(operation: DocsApiOperation): string {
	return operation.summary ?? `${operation.method.toUpperCase()} ${operation.path}`;
}

function operationBody(
	operation: DocsApiOperation,
	options: GenerateApiPagesOptions
): string[] {
	const lines: string[] = [
		`\`${operation.method.toUpperCase()}\` \`${operation.path}\``,
		''
	];

	if (operation.deprecated) {
		lines.push(':::warning{title="Deprecated"}', 'This operation is deprecated.', ':::', '');
	}

	if (operation.description) {
		lines.push(operation.description, '');
	}

	if (operation.security.length > 0) {
		lines.push(`Requires: ${operation.security.map((name) => `\`${name}\``).join(', ')}`, '');
	}

	if (operation.parameters.length > 0) {
		lines.push(
			'## Parameters',
			'',
			'| Name | In | Type | Required | Description |',
			'| --- | --- | --- | --- | --- |',
			...operation.parameters.map(
				(parameter) =>
					`| \`${parameter.name}\` | ${parameter.in} | \`${cell(parameter.type)}\` | ${
						parameter.required ? 'yes' : 'no'
					} | ${cell(parameter.description)} |`
			),
			''
		);
	}

	if (operation.requestBody) {
		lines.push(
			'## Request body',
			'',
			`\`${operation.requestBody.mediaType}\` · \`${operation.requestBody.type}\`${
				operation.requestBody.required ? ' · required' : ''
			}`,
			''
		);

		if (operation.requestBody.description) {
			lines.push(operation.requestBody.description, '');
		}
		if (operation.requestBody.example && options.examples !== false) {
			lines.push('```json title="Request"', operation.requestBody.example, '```', '');
		}
	}

	if (operation.responses.length > 0) {
		lines.push(
			'## Responses',
			'',
			'| Status | Type | Description |',
			'| --- | --- | --- |',
			...operation.responses.map(
				(response) =>
					`| \`${response.status}\` | \`${cell(response.type)}\` | ${cell(response.description)} |`
			),
			''
		);

		if (options.examples !== false) {
			for (const response of operation.responses) {
				if (response.example) {
					lines.push(`\`\`\`json title="Response ${response.status}"`, response.example, '```', '');
				}
			}
		}
	}

	return lines;
}

function operationPage(
	operation: DocsApiOperation,
	directory: string,
	options: GenerateApiPagesOptions
): DocsApiPage {
	const title = summarize(operation);

	return {
		relativePath: `${directory}/operations/${operation.slug}.md`,
		kind: 'operation',
		title,
		content: `${frontmatter({
			title,
			description: operation.description?.split('\n')[0],
			badge: operation.method.toUpperCase(),
			...(operation.deprecated ? { hidden: 'false' } : {})
		})}# ${title}\n\n${operationBody(operation, options).join('\n').trimEnd()}\n`
	};
}

/** Builds a link to a generated page from the mount point down. */
function apiLink(basePath: string, ...segments: string[]): string {
	return `/${[...basePath.split('/'), ...segments].filter(Boolean).join('/')}`;
}

function tagPage(
	tag: DocsApiTag,
	operations: readonly DocsApiOperation[],
	directory: string,
	basePath: string
): DocsApiPage {
	const rows = tag.operations
		.map((id) => operations.find((operation) => operation.id === id))
		.filter((operation): operation is DocsApiOperation => operation !== undefined)
		.map(
			(operation) =>
				`| \`${operation.method.toUpperCase()}\` | [${cell(summarize(operation))}](${apiLink(basePath, directory, 'operations', operation.slug)}) | \`${operation.path}\` |`
		);

	return {
		relativePath: `${directory}/${tag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`,
		kind: 'tag',
		title: tag.name,
		content: `${frontmatter({ title: tag.name, description: tag.description?.split('\n')[0] })}# ${tag.name}\n\n${
			tag.description ? `${tag.description}\n\n` : ''
		}| Method | Operation | Path |\n| --- | --- | --- |\n${rows.join('\n')}\n`
	};
}

function schemaPage(schema: DocsApiSchema, directory: string, options: GenerateApiPagesOptions): DocsApiPage {
	const rows = schema.properties.map(
		(property) =>
			`| \`${property.name}\` | \`${cell(property.type)}\` | ${property.required ? 'yes' : 'no'} | ${cell(
				property.values ? `${property.description ?? ''} One of: ${property.values.join(', ')}` : property.description
			)} |`
	);

	const lines = [
		`# ${schema.name}`,
		'',
		schema.description ?? '',
		schema.description ? '' : undefined,
		rows.length > 0 ? '| Property | Type | Required | Description |' : `Type: \`${schema.type}\``,
		rows.length > 0 ? '| --- | --- | --- | --- |' : '',
		...rows,
		''
	].filter((line): line is string => line !== undefined);

	if (schema.example && options.examples !== false) {
		lines.push('```json title="Example"', schema.example, '```', '');
	}

	return {
		relativePath: `${directory}/schemas/${schema.slug}.md`,
		kind: 'schema',
		title: schema.name,
		content: `${frontmatter({
			title: schema.name,
			description: schema.description?.split('\n')[0]
		})}${lines.join('\n').trimEnd()}\n`
	};
}

function authenticationPage(document: DocsApiDocument, directory: string): DocsApiPage {
	const rows = document.security.map(
		(scheme) =>
			`| \`${scheme.name}\` | ${cell(scheme.type)} | ${cell(scheme.detail)} | ${cell(scheme.description)} |`
	);

	return {
		relativePath: `${directory}/authentication.md`,
		kind: 'authentication',
		title: 'Authentication',
		content: `${frontmatter({ title: 'Authentication', order: 2 })}# Authentication\n\n| Scheme | Type | Detail | Description |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`
	};
}

function overviewPage(
	document: DocsApiDocument,
	directory: string,
	basePath: string,
	options: GenerateApiPagesOptions
): DocsApiPage {
	const lines = [
		`# ${document.title}`,
		'',
		document.description ?? '',
		document.description ? '' : undefined,
		`Version \`${document.version}\` · ${document.kind === 'openapi' ? 'OpenAPI' : 'AsyncAPI'} \`${document.specVersion}\``,
		''
	].filter((line): line is string => line !== undefined);

	if (document.servers.length > 0) {
		lines.push(
			'## Servers',
			'',
			...document.servers.map(
				(server) => `- \`${server.url}\`${server.description ? ` — ${server.description}` : ''}`
			),
			''
		);
	}

	if (document.tags.length > 0) {
		lines.push(
			'## Sections',
			'',
			...document.tags.map(
				(tag) =>
					`- [${tag.name}](${apiLink(basePath, directory, tag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}) — ${tag.operations.length} operation${tag.operations.length === 1 ? '' : 's'}`
			),
			''
		);
	}

	return {
		relativePath: `${directory}/index.md`,
		kind: 'overview',
		title: document.title,
		content: `${frontmatter({
			title: document.title,
			description: document.description?.split('\n')[0],
			...(options.order === undefined ? {} : { order: options.order })
		})}${lines.join('\n').trimEnd()}\n`
	};
}

/**
 * Turns an API document into ordinary Markdown pages.
 *
 * Generated pages are plain documents with frontmatter, which is what makes them
 * first-class: navigation, search, sitemap, Open Graph, and the AI outputs pick them up
 * with no special handling anywhere downstream.
 */
export function generateApiPages(
	document: DocsApiDocument,
	options: GenerateApiPagesOptions = {}
): DocsApiPage[] {
	const directory = (options.directory ?? 'api').replace(/^\/+|\/+$/g, '');
	const basePath = (options.basePath ?? '').replace(/^\/+|\/+$/g, '');
	const pages: DocsApiPage[] = [overviewPage(document, directory, basePath, options)];

	if (options.tags !== false) {
		for (const tag of document.tags) {
			pages.push(tagPage(tag, document.operations, directory, basePath));
		}
	}

	for (const operation of [...document.operations, ...document.webhooks]) {
		pages.push(operationPage(operation, directory, options));
	}

	if (options.authentication !== false && document.security.length > 0) {
		pages.push(authenticationPage(document, directory));
	}

	if (options.schemas !== false) {
		for (const schema of document.schemas) {
			pages.push(schemaPage(schema, directory, options));
		}
	}

	return pages.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}
