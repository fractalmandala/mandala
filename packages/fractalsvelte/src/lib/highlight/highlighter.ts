// Shared Shiki core — one highlighter for docs CodeBlock + AI Code element.
// Performance notes: https://shiki.style/guide/best-performance
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { bundledLanguages } from './langs.js';

export const LIGHT_THEME = 'github-light-default';
export const DARK_THEME = 'github-dark-default';

/** Preloaded dual-theme highlighter (lazy langs/themes via dynamic import). */
export const highlighterPromise = createHighlighterCore({
	themes: [
		import('@shikijs/themes/github-light-default'),
		import('@shikijs/themes/github-dark-default')
	],
	langs: Object.values(bundledLanguages),
	engine: createJavaScriptRegexEngine()
});
