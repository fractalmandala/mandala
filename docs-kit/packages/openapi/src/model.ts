/** The normalized API model every generator and renderer works from. */
export interface DocsApiDocument {
	/** `openapi` or `asyncapi`. */
	kind: 'openapi' | 'asyncapi';
	/** Specification version, as declared by the document. */
	specVersion: string;
	title: string;
	version: string;
	description?: string;
	servers: DocsApiServer[];
	tags: DocsApiTag[];
	operations: DocsApiOperation[];
	schemas: DocsApiSchema[];
	security: DocsApiSecurityScheme[];
	/** Webhooks (OpenAPI 3.1) and AsyncAPI channels, kept separate from paths. */
	webhooks: DocsApiOperation[];
}

export interface DocsApiServer {
	url: string;
	description?: string;
}

export interface DocsApiTag {
	name: string;
	description?: string;
	/** Operation ids belonging to this tag, in document order. */
	operations: string[];
}

export type DocsApiMethod =
	| 'get'
	| 'put'
	| 'post'
	| 'delete'
	| 'options'
	| 'head'
	| 'patch'
	| 'trace'
	/** AsyncAPI channel operations. */
	| 'publish'
	| 'subscribe';

export interface DocsApiParameter {
	name: string;
	in: 'path' | 'query' | 'header' | 'cookie';
	description?: string;
	required: boolean;
	type: string;
	deprecated?: boolean;
}

export interface DocsApiBody {
	mediaType: string;
	type: string;
	description?: string;
	required: boolean;
	/** Example serialized as JSON, when the document supplies one. */
	example?: string;
}

export interface DocsApiResponse {
	status: string;
	description?: string;
	mediaType?: string;
	type?: string;
	example?: string;
}

export interface DocsApiOperation {
	/** Stable identity: `operationId`, or method plus path. */
	id: string;
	slug: string;
	method: DocsApiMethod;
	path: string;
	summary?: string;
	description?: string;
	tags: string[];
	deprecated: boolean;
	parameters: DocsApiParameter[];
	requestBody?: DocsApiBody;
	responses: DocsApiResponse[];
	security: string[];
	/** Present for AsyncAPI channel operations. */
	channel?: string;
}

export interface DocsApiSchemaProperty {
	name: string;
	type: string;
	description?: string;
	required: boolean;
	/** Enumerated values, formatted for display. */
	values?: string[];
}

export interface DocsApiSchema {
	name: string;
	slug: string;
	description?: string;
	type: string;
	properties: DocsApiSchemaProperty[];
	/** Example serialized as JSON, when the document supplies one. */
	example?: string;
}

export interface DocsApiSecurityScheme {
	name: string;
	type: string;
	description?: string;
	/** `in`/`scheme`/`flows` summarized for display. */
	detail?: string;
}

export type DocsApiDiagnosticCode =
	| 'INVALID_DOCUMENT'
	| 'UNSUPPORTED_VERSION'
	| 'MISSING_INFO'
	| 'MISSING_OPERATION_ID'
	| 'DUPLICATE_OPERATION_ID'
	| 'UNRESOLVED_REFERENCE'
	| 'EMPTY_DOCUMENT';

export interface DocsApiDiagnostic {
	severity: 'error' | 'warning' | 'info';
	code: DocsApiDiagnosticCode;
	message: string;
	/** JSON pointer into the source document, when the finding has a location. */
	pointer?: string;
}

export interface DocsApiParseResult {
	document?: DocsApiDocument;
	diagnostics: DocsApiDiagnostic[];
}

/** Converts an arbitrary string into the slug segment used in generated routes. */
export function apiSlug(value: string): string {
	return (
		value
			.replace(/\{([^}]+)\}/g, '$1')
			.replace(/[^\p{Letter}\p{Number}]+/gu, '-')
			.replace(/^-+|-+$/g, '')
			.toLowerCase() || 'operation'
	);
}
