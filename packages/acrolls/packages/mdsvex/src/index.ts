import remarkGfm from 'remark-gfm';
import { mdsvex } from 'mdsvex';
import { compile as compileSvelte } from 'svelte/compiler';
import { Parser } from 'acorn';
import { tsPlugin } from '@sveltejs/acorn-typescript';
import rehypeSlug from 'rehype-slug';
import { createAcrollsHighlighter, type HighlightOptions } from './highlighter.js';
import { rehypeAcrollsTableWrap } from './rehype-table-wrap.js';
import { rehypeAcrollsHeadingAnchors } from './rehype-heading-anchors.js';
import { remarkAcrollsMermaidGuard } from './remark-mermaid-guard.js';
import { normalizeAcrollsMarkdown } from './source-safety.js';
import {
	compileDiagnostic,
	diagnosticError,
	renderInvalidDocumentModule,
	safetyFindingDiagnostic,
	type AcrollsDocumentDiagnostic,
	type AcrollsInvalidDocumentPolicy
} from './document-diagnostics.js';

export { parseFenceMeta, parseRangeList } from './code-meta.js';
export { createAcrollsHighlighter } from './highlighter.js';
export type { HighlightOptions } from './highlighter.js';
export { rehypeAcrollsTableWrap } from './rehype-table-wrap.js';
export { rehypeAcrollsHeadingAnchors } from './rehype-heading-anchors.js';
export { rehypeAcrollsCode } from './rehype-code.js';
export { remarkAcrollsCodeMeta } from './remark-code-meta.js';
export { remarkAcrollsMermaidGuard } from './remark-mermaid-guard.js';
export {
	normalizeAcrollsMarkdown,
	type AcrollsSafetyFinding,
	type AcrollsSafetyFindingKind,
	type AcrollsSourceSafetyResult
} from './source-safety.js';
export {
	compileDiagnostic,
	diagnosticError,
	renderInvalidDocumentModule,
	safetyFindingDiagnostic
} from './document-diagnostics.js';
export type {
	AcrollsDocumentDiagnostic,
	AcrollsDocumentMode,
	AcrollsDocumentStatus,
	AcrollsInvalidDocumentPolicy
} from './document-diagnostics.js';
export { renderAcrollsArticleHtml } from './render-html.js';
export type { RenderHtmlResult } from './render-html.js';
export { splitFrontmatter, renderBannerHtml } from './frontmatter.js';
export type { Frontmatter } from './frontmatter.js';

export type AcrollsMdsvexOptions = HighlightOptions & {
  /** Path to Publication layout (host or package). */
	layout?: string | Record<string, string>;
	extensions?: string[];
	/** What to do when a Markdown document cannot compile. */
	onInvalidDocument?: AcrollsInvalidDocumentPolicy;
	/** Receive source and compiler diagnostics without changing the default behavior. */
	onDiagnostic?: (diagnostic: AcrollsDocumentDiagnostic) => void;
};

/**
 * Options object for mdsvex(...).
 * Layout should point at a Svelte component that wraps slot content in Publication.
 */
export function createAcrollsMdsvexOptions(options: AcrollsMdsvexOptions = {}) {
  const {
    strict = false,
    layout,
    extensions = ['.svx', '.md']
  } = options;

  return {
    extensions,
    layout,
    remarkPlugins: [remarkGfm, remarkAcrollsMermaidGuard],
    rehypePlugins: [rehypeSlug, rehypeAcrollsHeadingAnchors, rehypeAcrollsTableWrap],
    highlight: {
      highlighter: createAcrollsHighlighter({ strict })
    }
  };
}

/**
 * Preprocessor for hosts that want source-safety normalization to run before
 * mdsvex parses Markdown. `.svx` sources remain available for intentional
 * Svelte components; only `.md` prose is normalized.
 */
export function createAcrollsMdsvexPreprocessor(options: AcrollsMdsvexOptions = {}) {
	const processor = mdsvex(createAcrollsMdsvexOptions(options) as never);
	const onInvalidDocument = options.onInvalidDocument ?? 'fail';
	return {
		name: 'acrolls-mdsvex',
		async markup(args: { content: string; filename?: string }) {
			const normalized = normalizeAcrollsMarkdown(args.content, { filename: args.filename });
			for (const finding of normalized.findings) {
				options.onDiagnostic?.(safetyFindingDiagnostic(finding, args.filename));
			}

			const handleInvalid = (error: unknown) => {
				const diagnostic = compileDiagnostic(error, args.filename);
				options.onDiagnostic?.(diagnostic);
				if (onInvalidDocument === 'error-page' && isMarkdownDocument(args.filename)) {
					return { code: renderInvalidDocumentModule(diagnostic) };
				}
				throw diagnosticError(diagnostic);
			};

			let result;
			try {
				result = await processor.markup({ ...args, content: normalized.source });
			} catch (error) {
				return handleInvalid(error);
			}
			if (!result || !isMarkdownFilename(args.filename)) return result;

			let output: typeof result;
			try {
				output = {
					...result,
					code: ensureMetadataExport(result.code)
				};
			} catch (error) {
				return handleInvalid(error);
			}

			try {
				compileSvelte(output.code, { filename: args.filename });
			} catch (error) {
				return handleInvalid(error);
			}
			return output;
		}
	};
}

function isMarkdownFilename(filename?: string): boolean {
	return filename?.endsWith('.md') === true || filename?.endsWith('.svx') === true;
}

function isMarkdownDocument(filename?: string): boolean {
	return filename?.endsWith('.md') === true;
}

/**
 * mdsvex omits its named `metadata` export when a document has no frontmatter.
 * Hosts commonly build navigation with an eager named-export glob, and bundlers
 * reject that glob if even one document lacks the export. Add an empty export to
 * the generated module script while leaving real or author-defined metadata alone.
 */
function ensureMetadataExport(code: string): string {
	const moduleScriptPattern =
		/<script\b(?=[^>]*(?:\scontext\s*=\s*["']module["']|\smodule(?:\s|(?=>))))[^>]*>/i;
	const moduleScript = moduleScriptPattern.exec(code);

	if (!moduleScript) {
		return `<script context="module">\n\texport const metadata = {};\n</script>\n\n${code}`;
	}

	const bodyStart = moduleScript.index + moduleScript[0].length;
	const bodyEnd = code.indexOf('</script>', bodyStart);
	if (bodyEnd === -1) return code;

	const moduleBody = code.slice(bodyStart, bodyEnd);
	const metadata = analyzeMetadataBinding(moduleBody);
	if (metadata.exported) return code;

	const declaration = metadata.bound
		? '\n\texport { metadata };'
		: '\n\texport const metadata = {};';

	return `${code.slice(0, bodyEnd)}${declaration}${code.slice(bodyEnd)}`;
}

type AstName = {
	type: string;
	name?: string;
	value?: unknown;
	left?: AstName;
	argument?: AstName;
	elements?: Array<AstName | null>;
	properties?: Array<{ type: string; value?: AstName; argument?: AstName }>;
};

type AstStatement = {
	type: string;
	id?: AstName | null;
	declaration?: AstStatement | null;
	declarations?: Array<{ id: AstName }>;
	specifiers?: Array<{ local?: AstName; exported?: AstName }>;
};

type AstProgram = { body: AstStatement[] };

const TypeScriptModuleParser = Parser.extend(tsPlugin());

function analyzeMetadataBinding(source: string): { bound: boolean; exported: boolean } {
	const program = TypeScriptModuleParser.parse(source, {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}) as unknown as AstProgram;

	let bound = false;
	let exported = false;

	for (const statement of program.body) {
		if (statementBindsMetadata(statement)) bound = true;
		if (statementExportsMetadata(statement)) exported = true;
	}

	return { bound, exported };
}

function statementBindsMetadata(statement: AstStatement): boolean {
	if (statement.type === 'ExportNamedDeclaration' && statement.declaration) {
		return statementBindsMetadata(statement.declaration);
	}

	if (statement.type === 'VariableDeclaration') {
		return statement.declarations?.some(({ id }) => patternBindsMetadata(id)) === true;
	}

	if (statement.type === 'FunctionDeclaration' || statement.type === 'ClassDeclaration') {
		return statement.id?.name === 'metadata';
	}

	if (statement.type === 'ImportDeclaration') {
		return statement.specifiers?.some(({ local }) => local?.name === 'metadata') === true;
	}

	return false;
}

function statementExportsMetadata(statement: AstStatement): boolean {
	if (statement.type !== 'ExportNamedDeclaration') return false;

	if (statement.declaration && statementBindsMetadata(statement.declaration)) return true;

	return statement.specifiers?.some(({ exported }) => astName(exported) === 'metadata') === true;
}

function patternBindsMetadata(pattern: AstName | undefined): boolean {
	if (!pattern) return false;
	if (pattern.type === 'Identifier') return pattern.name === 'metadata';
	if (pattern.type === 'AssignmentPattern') return patternBindsMetadata(pattern.left);
	if (pattern.type === 'RestElement') return patternBindsMetadata(pattern.argument);
	if (pattern.type === 'ArrayPattern') {
		return pattern.elements?.some((element) => patternBindsMetadata(element ?? undefined)) === true;
	}
	if (pattern.type === 'ObjectPattern') {
		return pattern.properties?.some((property) =>
			property.type === 'RestElement'
				? patternBindsMetadata(property.argument)
				: patternBindsMetadata(property.value)
		) === true;
	}
	return false;
}

function astName(name: AstName | undefined): string | undefined {
	if (name?.type === 'Identifier') return name.name;
	return typeof name?.value === 'string' ? name.value : undefined;
}
