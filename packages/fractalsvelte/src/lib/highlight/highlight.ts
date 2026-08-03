import type { HighlighterCore, ShikiTransformer } from 'shiki';
import createDOMPurify from 'dompurify';
import { DARK_THEME, LIGHT_THEME, highlighterPromise } from './highlighter.js';
import { resolveLanguage, type SupportedLanguage } from './langs.js';

export type HighlightOptions = {
	/** Source language id or alias (js, ts, svelte, …). */
	lang?: string | null;
	/**
	 * When true, skip adding the `line-numbers` class (docs CodeBlock).
	 * AI Code adds line numbers by default via transformers.
	 */
	hideLines?: boolean;
	/** 1-based line numbers or inclusive ranges to mark as highlighted. */
	highlightLines?: (number | [number, number])[];
	/** Extra Shiki transformers (merged after built-in ones). */
	transformers?: ShikiTransformer[];
	/** Sanitize HTML with DOMPurify in the browser (default true). */
	sanitize?: boolean;
};

const DOMPurify = typeof window !== 'undefined' ? createDOMPurify(window) : null;

function within(line: number, ranges: HighlightOptions['highlightLines']) {
	if (!ranges?.length) return false;
	for (const r of ranges) {
		if (typeof r === 'number') {
			if (line === r) return true;
			continue;
		}
		if (r[0] <= line && line <= r[1]) return true;
	}
	return false;
}

function escapeHtml(text: string) {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

/** Plain fallback used before the highlighter loads or if highlighting fails. */
export function plainCodeHtml(code: string, lang?: string | null) {
	const resolved = resolveLanguage(lang);
	return `<pre class="shiki" data-language="${resolved}"><code>${escapeHtml(code)}</code></pre>`;
}

/**
 * Highlight `code` with dual light/dark themes.
 * Returns sanitized HTML (browser) suitable for `{@html}`.
 */
export async function highlightCode(
	code: string,
	options: HighlightOptions = {}
): Promise<string> {
	const lang = resolveLanguage(options.lang);
	const hideLines = options.hideLines ?? true;
	const sanitize = options.sanitize ?? true;

	let hl: HighlighterCore;
	try {
		hl = await highlighterPromise;
	} catch {
		return plainCodeHtml(code, lang);
	}

	// Load language on demand if somehow missing (should already be registered).
	const loaded = hl.getLoadedLanguages();
	if (!loaded.includes(lang)) {
		try {
			// no-op if already registered via createHighlighterCore langs
		} catch {
			/* ignore */
		}
	}

	const transformers: ShikiTransformer[] = [
		{
			pre(el) {
				// Drop inline background so our tokens control the surface.
				el.properties.style = '';
				el.properties['data-language'] = lang;
				const cls = String(el.properties.class ?? '');
				if (!hideLines && !cls.includes('line-numbers')) {
					el.properties.class = `${cls} line-numbers`.trim();
				}
				return el;
			},
			line(node, line) {
				if (within(line, options.highlightLines)) {
					const cls = String(node.properties.class ?? '');
					node.properties.class = `${cls} line--highlighted`.trim();
				}
				return node;
			}
		},
		...(options.transformers ?? [])
	];

	let html = '';
	try {
		html = hl.codeToHtml(code, {
			lang,
			themes: {
				light: LIGHT_THEME,
				dark: DARK_THEME
			},
			defaultColor: false,
			transformers
		});
	} catch {
		// Unknown / unloadable language — retry as markdown/text.
		try {
			html = hl.codeToHtml(code, {
				lang: 'markdown',
				themes: { light: LIGHT_THEME, dark: DARK_THEME },
				defaultColor: false,
				transformers
			});
		} catch {
			return plainCodeHtml(code, lang);
		}
	}

	if (sanitize && DOMPurify) {
		return DOMPurify.sanitize(html);
	}
	return html;
}

export type { SupportedLanguage };
