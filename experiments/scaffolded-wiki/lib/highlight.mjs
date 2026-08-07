// @ts-nocheck — plain-JS config helper consumed by svelte.config.js.
//
// Shiki-based syntax highlighting for mdsvex. The highlighter must return
// Svelte-template-safe HTML (curlies/backticks escaped, injected via
// `{@html \`...\`}`) — exactly the contract mdsvex's default Prism
// highlighter follows, so highlighted code containing `{`, `}` or backticks
// never trips the Svelte compiler.

import { createHighlighter } from 'shiki';

/** GitHub repo for linking referenced source files (`blob/main/<path>`). */
export const GITHUB_BLOB_BASE = 'https://github.com/fractalmandala/mandala/blob/main';

/** Map the wiki's fence languages to Shiki's canonical language ids. */
const LANG_ALIASES = {
	ts: 'typescript',
	typescript: 'typescript',
	js: 'javascript',
	jsx: 'javascript',
	javascript: 'javascript',
	sh: 'shellscript',
	bash: 'shellscript',
	shell: 'shellscript',
	zsh: 'shellscript',
	md: 'markdown',
	markdown: 'markdown',
	mdx: 'markdown',
	svx: 'markdown',
	txt: 'plaintext',
	text: 'plaintext',
	plaintext: 'plaintext',
	json: 'json',
	yaml: 'yaml',
	yml: 'yaml',
	css: 'css',
	scss: 'sass',
	sass: 'sass',
	svelte: 'svelte',
	python: 'python',
	py: 'python',
	go: 'go',
	rust: 'rust',
	rs: 'rust',
	toml: 'toml',
	html: 'html',
	xml: 'xml',
	sql: 'sql',
	graphql: 'graphql',
	diff: 'diff',
	dockerfile: 'dockerfile',
	// Mermaid fences are diagrams, not code — keep them as plain text.
	mermaid: 'plaintext'
};

/** Languages preloaded into the highlighter. */
const LOADED_LANGS = [
	'typescript',
	'javascript',
	'shellscript',
	'markdown',
	'plaintext',
	'json',
	'yaml',
	'css',
	'sass',
	'svelte',
	'python',
	'go',
	'rust',
	'toml',
	'html',
	'xml',
	'sql',
	'graphql',
	'diff',
	'dockerfile'
];

let highlighterPromise;

/** Lazily create the (expensive) Shiki highlighter once per process. */
function getHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			langs: LOADED_LANGS,
			themes: ['github-dark', 'github-light']
		});
	}
	return highlighterPromise;
}

/** Mirror mdsvex's `escape_svelty` so the output survives Svelte compilation. */
function escapeSvelty(str) {
	return str
		.replace(/[{}`]/g, (c) => ({ '{': '&#123;', '}': '&#125;', '`': '&#96;' }[c]))
		.replace(/\\([trn])/g, '&#92;$1');
}

/**
 * mdsvex `highlight.highlighter` — `(code, lang, meta, filename, optimise)`
 * → HTML string. Wraps Shiki's output the same way the default Prism
 * highlighter does (`<pre class="language-x">{@html \`…\`}</pre>`), with
 * curlies/backticks escaped so the Svelte compiler never parses highlighted
 * code as template syntax.
 */	export async function shikiHighlighter(code, lang, _meta, _filename, optimise) {
	const rawLang = String(lang ?? '').toLowerCase();
	const normalised = rawLang || 'text';

	// Mermaid fences are diagrams, not code: emit the raw source inside a
	// `pre.mermaid` that the client renders into an SVG (mermaid.run).
	// Escaped with escapeSvelty so braces/backticks survive Svelte compile;
	// the browser decodes the entities back before mermaid reads textContent.
	if (normalised === 'mermaid') {
		const escaped = escapeSvelty(escapeHtml(code));
		return `<pre class="mermaid">${escaped}</pre>`;
	}

	const target = LANG_ALIASES[normalised] || 'plaintext';

	let inner;
	try {
		const highlighter = await getHighlighter();
		const html = highlighter.codeToHtml(code, {
			lang: target,
			themes: { dark: 'github-dark', light: 'github-light' },
			defaultColor: false // colors come from CSS vars, matching the site theme
		});
		// Shiki returns `<pre class="shiki …"><code>…tokens…</code></pre>`;
		// keep the token HTML inside its `<code>` so we can wrap it once in
		// our own pre/code (with per-token CSS vars intact).
		const codeMatch = /<code[^>]*>([\s\S]*?)<\/code>/.exec(html);
		inner = codeMatch ? codeMatch[1] : html;
	} catch {
		// Unknown language / Shiki failure — fall back to escaped plain text.
		inner = escapeHtml(code);
	}

	const escaped = escapeSvelty(inner);
	const htmlClass = `language-${normalised} shiki`;
	const codeEl = `<code class="language-${normalised} shiki-code">${escaped}</code>`;
	const body = optimise === false
		? `<pre class="${htmlClass}">${codeEl}</pre>`
		: `<pre class="${htmlClass}">{@html \`${codeEl}\`}</pre>`;

	// Frame each block with a language label + copy button.
	const label = rawLang || 'text';
	return `<figure class="code-block"><div class="code-block-head"><span class="code-lang">${escapeHtml(label)}</span><button type="button" class="copy-btn" aria-label="Copy code">Copy</button></div>${body}</figure>`;
}

function escapeHtml(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
