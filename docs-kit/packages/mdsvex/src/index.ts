import type { MdsvexOptions } from 'mdsvex';

import {
	transformDocsMarkdown,
	type DocsDirectiveComponents
} from './directives.js';
import { rehypeDocsHeadings, type DocsHeadingOptions } from './headings.js';
import { createDocsHighlighter, type DocsHighlightOptions } from './highlight.js';
import { renderDocsMath, type DocsMathOptions } from './math.js';

export {
	defaultDirectiveComponents,
	transformDocsDirectives,
	transformDocsMarkdown,
	type DocsDirectiveComponents,
	type TransformDocsDirectivesOptions,
	type TransformedDocsMarkdown
} from './directives.js';
export { rehypeDocsHeadings, type DocsHeadingOptions } from './headings.js';
export { findDocsMath, renderDocsMath, type DocsMathExpression, type DocsMathOptions } from './math.js';
export {
	createDocsHighlighter,
	parseCodeMeta,
	type DocsHighlightOptions,
	type ParsedCodeMeta
} from './highlight.js';

export interface DocsMdsvexOptions {
	/** Directive → component mapping overrides. */
	components?: DocsDirectiveComponents;
	/** Heading anchor behaviour. */
	headings?: DocsHeadingOptions;
	/** Syntax highlighting themes and options. Pass `false` to keep mdsvex's default. */
	syntaxHighlighting?: DocsHighlightOptions | false;
	/** Module the directive components are imported from. */
	componentsModule?: string;
	/** Build-time math rendering. Pass `false` to leave `$…$` untouched. */
	math?: DocsMathOptions | false;
}

export interface DocsMdsvexPipeline {
	remarkPlugins: NonNullable<MdsvexOptions['remarkPlugins']>;
	rehypePlugins: NonNullable<MdsvexOptions['rehypePlugins']>;
	highlight?: { highlighter: (code: string, lang?: string, meta?: string) => Promise<string> };
}

/** A Svelte preprocessor, as consumed by `svelte.config.js`. */
export interface DocsMarkdownPreprocessor {
	name: string;
	markup(input: {
		content: string;
		filename?: string;
	}): Promise<{ code: string } | undefined> | { code: string } | undefined;
}

const documentPattern = /\.(md|svx)$/i;

const frontmatterPattern = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;
const instanceScriptPattern = /<script(?![^>]*\bmodule\b)(?![^>]*context=["']module["'])[^>]*>/;

/**
 * Injects the imports a transformed document needs.
 *
 * Explicit imports are used instead of mdsvex's layout-export mechanism, which only
 * rewrites parsed element nodes and therefore misses the raw markup a directive produces.
 */
function injectComponentImports(
	code: string,
	components: readonly string[],
	module: string
): string {
	if (components.length === 0) {
		return code;
	}

	const statement = `\timport { ${components.join(', ')} } from '${module}';`;
	const existing = instanceScriptPattern.exec(code);

	if (existing?.index !== undefined) {
		const insertAt = existing.index + existing[0].length;
		return `${code.slice(0, insertAt)}\n${statement}${code.slice(insertAt)}`;
	}

	const frontmatter = frontmatterPattern.exec(code);
	const offset = frontmatter ? frontmatter[0].length : 0;
	return `${code.slice(0, offset)}<script>\n${statement}\n</script>\n\n${code.slice(offset)}`;
}

/**
 * Rewrites the directive grammar before mdsvex parses a document, and imports the
 * components the result references.
 *
 * It must run *before* `mdsvex()` in the preprocessor list, and it only touches Markdown
 * and mdsvex files, so ordinary Svelte components are never rewritten.
 */
export function docsMarkdown(options: DocsMdsvexOptions = {}): DocsMarkdownPreprocessor {
	const module = options.componentsModule ?? '@docs-kit/components';

	return {
		name: 'docs-kit-markdown',
		async markup({ content, filename }) {
			if (filename === undefined || !documentPattern.test(filename)) {
				return undefined;
			}

			const withMath =
				options.math === false
					? content
					: await renderDocsMath(content, options.math ?? {});
			const transformed = transformDocsMarkdown(withMath, {
				...(options.components === undefined ? {} : { components: options.components })
			});

			return {
				code: injectComponentImports(transformed.code, transformed.components, module)
			};
		}
	};
}

/**
 * Returns the docs Markdown pipeline for direct use in `mdsvex()`.
 *
 * Heading ids and permalinks come from a rehype plugin; code rendering comes from a Shiki
 * highlighter that emits both colour schemes in one pass.
 */
export function docsMdsvex(options: DocsMdsvexOptions = {}): DocsMdsvexPipeline {
	return {
		remarkPlugins: [],
		rehypePlugins: [[rehypeDocsHeadings, options.headings ?? {}]] as NonNullable<
			MdsvexOptions['rehypePlugins']
		>,
		...(options.syntaxHighlighting === false
			? {}
			: { highlight: { highlighter: createDocsHighlighter(options.syntaxHighlighting ?? {}) } })
	};
}
