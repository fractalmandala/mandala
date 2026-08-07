export interface DocsMathOptions {
	/** Render math at build time. Defaults to true. */
	enabled?: boolean;
	/** Throw on invalid TeX instead of rendering the error inline. Defaults to false. */
	strict?: boolean;
	/** Extra KaTeX options merged last. */
	katex?: Record<string, unknown>;
}

/** A math expression found in a document. */
export interface DocsMathExpression {
	tex: string;
	display: boolean;
}

const blockPattern = /\$\$([\s\S]+?)\$\$/g;
// Inline math needs at least one non-space character and must not be a currency amount.
const inlinePattern = /(?<![\\$])\$(?!\s)((?:[^$\n\\]|\\.)+?)(?<!\s)\$(?!\d)/g;

type Renderer = (tex: string, options: Record<string, unknown>) => string;

let renderer: Promise<Renderer> | undefined;

async function loadRenderer(): Promise<Renderer> {
	renderer ??= import('katex').then((katex) => {
		const render = (katex as unknown as { default?: { renderToString?: Renderer } }).default
			?.renderToString;
		if (typeof render !== 'function') {
			throw new Error('KaTeX did not expose renderToString.');
		}
		return render;
	});

	return renderer;
}

/** Svelte would evaluate braces in the generated markup, so they are escaped. */
function escapeSvelte(value: string): string {
	return value.replace(/[{}]/g, (character) => (character === '{' ? '&#123;' : '&#125;'));
}

/**
 * Finds `$…$` and `$$…$$` expressions outside code.
 *
 * Fenced blocks and inline code spans are skipped, so a shell snippet containing `$PATH`
 * or a price in prose is never mistaken for math.
 */
export function findDocsMath(source: string): DocsMathExpression[] {
	const found: DocsMathExpression[] = [];

	transformMathSegments(source, (segment) => {
		for (const match of segment.matchAll(blockPattern)) {
			found.push({ tex: (match[1] ?? '').trim(), display: true });
		}

		// Inline code is skipped here exactly as it is when rendering, so what the finder
		// reports and what gets rendered can never disagree.
		for (const line of segment.replace(blockPattern, '').split('\n')) {
			replaceOutsideCodeSpans(line, (part) => {
				for (const match of part.matchAll(inlinePattern)) {
					found.push({ tex: (match[1] ?? '').trim(), display: false });
				}
				return part;
			});
		}

		return segment;
	});

	return found;
}

/** Applies `transform` to every part of the source that is not code. */
function transformMathSegments(source: string, transform: (segment: string) => string): string {
	const lines = source.split('\n');
	const output: string[] = [];
	let fenceMarker: string | undefined;
	let buffer: string[] = [];

	const flush = (): void => {
		if (buffer.length > 0) {
			output.push(transform(buffer.join('\n')));
			buffer = [];
		}
	};

	for (const line of lines) {
		const fence = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1]?.[0];

		if (fence) {
			flush();
			output.push(line);
			fenceMarker = fenceMarker === undefined ? fence : fenceMarker === fence ? undefined : fenceMarker;
			continue;
		}

		if (fenceMarker !== undefined) {
			output.push(line);
			continue;
		}

		buffer.push(line);
	}

	flush();
	return output.join('\n');
}

/** Splits a line into code spans and prose, so inline code is left alone. */
function replaceOutsideCodeSpans(text: string, replace: (part: string) => string): string {
	return text
		.split(/(`+[^`]*`+)/g)
		.map((part) => (part.startsWith('`') ? part : replace(part)))
		.join('');
}

/**
 * Renders math to HTML at build time.
 *
 * KaTeX runs during compilation, so a page with math ships no math library to the browser —
 * only the stylesheet is needed, and the markup is server-rendered like everything else.
 */
export async function renderDocsMath(
	source: string,
	options: DocsMathOptions = {}
): Promise<string> {
	if (options.enabled === false || findDocsMath(source).length === 0) {
		return source;
	}

	const render = await loadRenderer();
	const katexOptions = {
		throwOnError: options.strict === true,
		errorColor: '#c23400',
		output: 'html',
		...(options.katex ?? {})
	};

	const renderOne = (tex: string, display: boolean): string => {
		const html = render(tex, { ...katexOptions, displayMode: display });
		return escapeSvelte(
			display ? `<div class="docs-math docs-math--block">${html}</div>` : `<span class="docs-math">${html}</span>`
		);
	};

	return transformMathSegments(source, (segment) =>
		segment
			.replace(blockPattern, (_match, tex: string) => renderOne(tex.trim(), true))
			.split('\n')
			.map((line) =>
				replaceOutsideCodeSpans(line, (part) =>
					part.replace(inlinePattern, (_match, tex: string) => renderOne(tex.trim(), false))
				)
			)
			.join('\n')
	);
}
