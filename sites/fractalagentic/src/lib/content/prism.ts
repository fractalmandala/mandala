import Prism from 'prismjs';
// Third-party grammar: extends markup with Svelte template syntax. Registers
// `svelte` (and `sv`) on import — it lives outside prismjs/components, so it
// stays a static side-effect import.
import 'prism-svelte';

/**
 * Grammars are loaded on demand — each of these is its own lazy chunk,
 * pulled in on first use (mirroring mdsvex's on-demand behavior, instead of
 * bundling every grammar into the client). The list is curated to the
 * languages actually used by the package content. Core languages
 * (markup/css/clike/javascript) ship with prismjs itself. Order matters for
 * grammars that extend others, so the list is sorted dependency-first:
 * turtle before sparql, jsx+typescript before tsx.
 */
// Relative to this file (src/lib/content/) → the site's hoisted prismjs copy.
// Literal paths only: Vite requires statically analyzable glob patterns.
const grammarLoaders = import.meta.glob([
	'../../../node_modules/prismjs/components/prism-bash.js',
	'../../../node_modules/prismjs/components/prism-diff.js',
	'../../../node_modules/prismjs/components/prism-docker.js',
	'../../../node_modules/prismjs/components/prism-go.js',
	'../../../node_modules/prismjs/components/prism-hcl.js',
	'../../../node_modules/prismjs/components/prism-ini.js',
	'../../../node_modules/prismjs/components/prism-java.js',
	'../../../node_modules/prismjs/components/prism-json.js',
	'../../../node_modules/prismjs/components/prism-jsx.js',
	'../../../node_modules/prismjs/components/prism-kotlin.js',
	'../../../node_modules/prismjs/components/prism-lua.js',
	'../../../node_modules/prismjs/components/prism-markdown.js',
	'../../../node_modules/prismjs/components/prism-prolog.js',
	'../../../node_modules/prismjs/components/prism-python.js',
	'../../../node_modules/prismjs/components/prism-rust.js',
	'../../../node_modules/prismjs/components/prism-sass.js',
	'../../../node_modules/prismjs/components/prism-scss.js',
	'../../../node_modules/prismjs/components/prism-sql.js',
	'../../../node_modules/prismjs/components/prism-swift.js',
	'../../../node_modules/prismjs/components/prism-toml.js',
	'../../../node_modules/prismjs/components/prism-turtle.js',
	'../../../node_modules/prismjs/components/prism-sparql.js',
	'../../../node_modules/prismjs/components/prism-typescript.js',
	'../../../node_modules/prismjs/components/prism-tsx.js',
	'../../../node_modules/prismjs/components/prism-yaml.js'
]);

function grammarLoader(name: string): (() => Promise<unknown>) | undefined {
	return grammarLoaders[`../../../node_modules/prismjs/components/prism-${name}.js`];
}

/**
 * Fence-info aliases → Prism grammar names. The keys are the languages used
 * across the package content (docs, skills, agents, commands, bosses). Empty
 * values mean "no grammar — render as plain text". Unmapped names fall back
 * to themselves, so a Prism grammar registered under the same name still
 * highlights (e.g. `json`), while unknown ones degrade to plain text.
 */
const ALIASES: Record<string, string> = {
	sh: 'bash',
	shell: 'bash',
	js: 'javascript',
	ts: 'typescript',
	md: 'markdown',
	yml: 'yaml',
	jsonc: 'json',
	json5: 'json',
	jsonl: 'json',
	html: 'markup',
	xml: 'markup',
	vue: 'markup',
	dockerfile: 'docker',
	terraform: 'hcl',
	svx: 'svelte',
	sv: 'svelte',
	// No grammar in Prism (plain text):
	text: '',
	txt: '',
	dot: '',
	gitignore: '',
	prisma: ''
};

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * Split a fence's info string (`sh filename="deploy.sh"`) into language +
 * optional filename, matching the annotation the old mdsvex highlighter
 * supported. A first token that's already a key=value pair (`` `filename="x"` ``)
 * means there's no language at all.
 */
function parseFenceInfo(info: string): { lang: string; filename?: string } {
	const trimmed = info.trim();
	if (!trimmed) return { lang: '' };
	const filename = trimmed.match(/filename="([^"]+)"/)?.[1];
	const first = trimmed.split(/\s+/)[0];
	const lang = /^[a-z0-9-]+=/i.test(first) ? '' : first.toLowerCase();
	return { lang, filename };
}

function highlight(code: string, grammarName: string): string {
	if (!Prism.languages[grammarName]) return escapeHtml(code);
	try {
		// Prism.highlight escapes the code itself before tokenizing.
		return Prism.highlight(code, Prism.languages[grammarName], grammarName);
	} catch {
		return escapeHtml(code);
	}
}

/**
 * Non-core grammars that extend another grammar from our set. A component
 * executes `Prism.languages.extend(...)` at module load time, so its
 * dependencies must be registered *first* — otherwise the extension silently
 * produces an empty/broken grammar (e.g. `tsx` alone → zero tokens). Core
 * languages (markup/css/clike/javascript) ship with prismjs itself and never
 * need preloading. Mirrors the `dependencies` field in prismjs/components.json.
 */
const GRAMMAR_DEPS: Record<string, string[]> = {
	tsx: ['jsx', 'typescript'],
	sparql: ['turtle']
};

async function preloadGrammar(name: string, seen: Set<string>): Promise<void> {
	if (seen.has(name) || Prism.languages[name]) return;
	seen.add(name);
	// Dependencies first, recursively — a component's extend() runs at import.
	for (const dep of GRAMMAR_DEPS[name] ?? []) await preloadGrammar(dep, seen);
	const loader = grammarLoader(name);
	if (!loader) return;
	try {
		await loader();
	} catch (error) {
		// Grammar failed to load — the renderer degrades to plain text. Warn so
		// a missing/ordering regression is visible in dev instead of silent.
		console.warn(`[prism] failed to load grammar ${name}`, error);
	}
}

/**
 * Load the grammars used by every fenced block in a markdown document, so the
 * (synchronous) renderer never has to wait on a chunk mid-parse. Only the
 * languages actually present in the document are fetched, each loads once and
 * stays cached — mdsvex-style on-demand loading.
 */
export async function preloadFenceLanguages(markdown: string): Promise<void> {
	const seen = new Set<string>();
	for (const match of markdown.matchAll(/^```([^\n`]*)/gm)) {
		const { lang } = parseFenceInfo(match[1] ?? '');
		if (!lang || lang === 'mermaid') continue;
		const grammarName = ALIASES[lang] ?? lang;
		if (!grammarName) continue;
		await preloadGrammar(grammarName, seen);
	}
}

/**
 * Render one fenced code block to the site's .code-frame markup with Prism
 * token spans. The structure matches what enhanceCodeBlocks() (the client-side
 * copy-button enhancer in the docs theme) targets: `.code-frame-body > pre`.
 * Call preloadFenceLanguages() on the source first so grammars are ready.
 */
export function highlightCodeBlock(code: string, info: string): string {
	const { lang, filename } = parseFenceInfo(info);

	// Mermaid ships as a bare <pre class="mermaid"> — the docs/armory layouts'
	// lazy client-side renderer swaps it for a diagram in place (same contract
	// the old mdsvex highlighter used).
	if (lang === 'mermaid') {
		return `<pre class="mermaid">${escapeHtml(code)}</pre>`;
	}

	const grammarName = ALIASES[lang] ?? lang;
	const body = grammarName ? highlight(code, grammarName) : escapeHtml(code);
	const langClass = grammarName ? ` class="language-${grammarName}"` : '';
	const header = filename
		? `<div class="code-frame-header"><span>${escapeHtml(filename)}</span></div>`
		: '';

	return (
		`<div class="code-frame">${header}<div class="code-frame-body">` +
		`<pre${filename ? ` data-filename="${escapeHtml(filename)}"` : ''}${langClass}>` +
		`<code${langClass}>${body}</code></pre></div></div>`
	);
}
