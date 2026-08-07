import type { HighlighterGeneric } from 'shiki';

export interface DocsHighlightOptions {
	/** Shiki theme used in light mode. Defaults to `github-light`. */
	themeLight?: string;
	/** Shiki theme used in dark mode. Defaults to `github-dark`. */
	themeDark?: string;
	/** Render a copy button next to every code block. Defaults to true. */
	copyButton?: boolean;
	/** Languages preloaded at startup. Others load on first use. */
	langs?: string[];
}

export interface ParsedCodeMeta {
	title?: string;
	/** 1-based line numbers to highlight, expanded from `{1,3-5}`. */
	highlightedLines: number[];
	showLineNumbers: boolean;
}

/** Parses the meta string of a fence, as in ```` ```ts title="a.ts" {1,3-4} showLineNumbers ````. */
export function parseCodeMeta(meta: string | undefined): ParsedCodeMeta {
	const text = meta ?? '';
	const title = /(?:title|file)\s*=\s*(?:"([^"]*)"|'([^']*)')/.exec(text);
	const ranges = /\{([\d,\s-]+)\}/.exec(text)?.[1] ?? '';
	const highlightedLines: number[] = [];

	for (const part of ranges.split(',')) {
		const range = /^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(part);
		const single = /^\s*(\d+)\s*$/.exec(part);

		if (range?.[1] && range[2]) {
			const start = Number(range[1]);
			const end = Number(range[2]);
			for (let line = Math.min(start, end); line <= Math.max(start, end); line += 1) {
				highlightedLines.push(line);
			}
		} else if (single?.[1]) {
			highlightedLines.push(Number(single[1]));
		}
	}

	return {
		...(title?.[1] ?? title?.[2] ? { title: (title[1] ?? title[2]) as string } : {}),
		highlightedLines: [...new Set(highlightedLines)].sort((left, right) => left - right),
		showLineNumbers: /\b(showLineNumbers|lineNumbers)\b/.test(text)
	};
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Svelte would evaluate braces and `@`/`#` blocks inside markup, so they are escaped. */
function escapeSvelte(value: string): string {
	return value
		.replace(/[{}]/g, (character) => (character === '{' ? '&#123;' : '&#125;'))
		.replace(/`/g, '&#96;');
}

type Highlighter = HighlighterGeneric<string, string>;

const highlighters = new Map<string, Promise<Highlighter>>();

async function getHighlighter(options: DocsHighlightOptions): Promise<Highlighter> {
	const themeLight = options.themeLight ?? 'github-light';
	const themeDark = options.themeDark ?? 'github-dark';
	const key = `${themeLight}|${themeDark}`;
	const existing = highlighters.get(key);
	if (existing) {
		return existing;
	}

	const created = import('shiki').then((shiki) =>
		shiki.createHighlighter({
			themes: [themeLight, themeDark],
			langs: options.langs ?? ['bash', 'json', 'markdown', 'svelte', 'ts', 'js']
		})
	) as Promise<Highlighter>;
	highlighters.set(key, created);
	return created;
}

async function resolveLanguage(
	highlighter: Highlighter,
	lang: string | undefined
): Promise<string> {
	const language = (lang ?? '').trim().toLowerCase();
	if (language === '' || language === 'text' || language === 'plaintext') {
		return 'text';
	}
	if (highlighter.getLoadedLanguages().includes(language)) {
		return language;
	}

	try {
		await highlighter.loadLanguage(language as never);
		return language;
	} catch {
		// An unknown language renders as plain text rather than failing the build.
		return 'text';
	}
}

/**
 * Builds the mdsvex highlighter.
 *
 * Both themes are emitted as CSS variables in one pass, so switching colour scheme is a
 * CSS change with no re-render and no layout shift. Markup is produced at build time; the
 * only client code a code block needs is the copy button.
 */
export function createDocsHighlighter(
	options: DocsHighlightOptions = {}
): (code: string, lang?: string, meta?: string) => Promise<string> {
	const themeLight = options.themeLight ?? 'github-light';
	const themeDark = options.themeDark ?? 'github-dark';

	return async (code, lang, meta) => {
		const highlighter = await getHighlighter(options);
		const language = await resolveLanguage(highlighter, lang);
		const parsed = parseCodeMeta(meta);
		const html = highlighter.codeToHtml(code, {
			lang: language,
			themes: { light: themeLight, dark: themeDark },
			defaultColor: false,
			transformers: [
				{
					pre(node) {
						// Shiki marks the block focusable; give it a matching role so the markup
						// satisfies accessibility linting and screen readers announce it as a region.
						node.properties['role'] = 'region';
						node.properties['aria-label'] = `${language} code block`;
					},
					line(node, line) {
						const classes = ['docs-code__line'];
						if (parsed.highlightedLines.includes(line)) {
							classes.push('docs-code__line--highlighted');
						}
						// A diff block marks changed lines structurally, so colour is not the
						// only signal and copying the block keeps its +/- markers.
						if (language === 'diff') {
							const text = code.split('\n')[line - 1] ?? '';
							if (text.startsWith('+')) {
								classes.push('docs-code__line--added');
							} else if (text.startsWith('-')) {
								classes.push('docs-code__line--removed');
							}
						}
						node.properties['class'] = classes.join(' ');
						node.properties['data-line'] = String(line);
					}
				}
			]
		});

		const attributes = [
			'class="docs-code"',
			`data-language="${escapeHtml(language)}"`,
			parsed.showLineNumbers ? 'data-line-numbers="true"' : '',
			parsed.title ? `data-title="${escapeHtml(parsed.title)}"` : ''
		]
			.filter(Boolean)
			.join(' ');

		return [
			// Shiki makes the scrollable block focusable, which is the accessible behaviour for a
			// scroll region even though Svelte's linter flags a tabindex on a non-interactive role.
			'<!-- svelte-ignore a11y_no_noninteractive_tabindex -->',
			`<div ${attributes}>`,
			parsed.title ? `<div class="docs-code__title">${escapeHtml(parsed.title)}</div>` : '',
			options.copyButton === false
				? ''
				: `<button class="docs-code__copy" type="button" data-docs-copy aria-label="Copy code">Copy</button>`,
			escapeSvelte(html),
			'</div>'
		]
			.filter(Boolean)
			.join('\n');
	};
}
