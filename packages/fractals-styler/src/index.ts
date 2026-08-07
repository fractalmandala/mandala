import type { Plugin, ViteDevServer } from 'vite';
import { scanFiles } from './scanner.js';
import { generateCss } from './generate.js';
import { createStylerBuilderMiddleware } from './builder/middleware.js';

export interface FractalsStylerOptions {
	/** Glob patterns (relative to the Vite project root) to scan for utility classes
	 * and `--pxN` variable usage. Defaults cover the common SvelteKit source tree. */
	content?: string[];
	/** Unit format for dynamic numeric utilities ('px' | 'rem'). Defaults to 'px'. */
	unit?: 'px' | 'rem';
}

const VIRTUAL_ID = 'virtual:fractals-styler.css';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

const DEFAULT_CONTENT = ['src/**/*.{svelte,html,js,ts,jsx,tsx,mjs}'];

const WATCHED_EXT_RE = /\.(svelte|html|js|ts|jsx|tsx|mjs)$/;

/** Vite plugin that JIT-generates `virtual:fractals-styler.css` — the numeric spacing/size
 * utilities (`gap24`, `padtop16`, ...), their breakpoint-suffixed variants, and breakpoint
 * variants of the package's own static utility classes (`box-sm`, `text-lg-xl`, ...).
 *
 * Import the virtual module once, anywhere in the app (typically the root layout):
 *   import 'virtual:fractals-styler.css'
 */
export default function fractalsStyler(options: FractalsStylerOptions = {}): Plugin {
	const content = options.content ?? DEFAULT_CONTENT;
	const unit = options.unit ?? 'px';
	let root = process.cwd();

	async function build(): Promise<string> {
		const result = await scanFiles(content, root);
		return generateCss(result, { unit });
	}

	return {
		name: 'fractals-styler',
		// Our virtual id ends in `.css`, so Vite's own built-in `vite:css`/`vite:css-post`
		// plugins also match it via their `cssLangRE` check. Without `enforce: 'pre'` they
		// run before us in the default plugin order and try to read the id straight off
		// disk (not recognizing our `\0` virtual-module marker), which crashes during SSR.
		enforce: 'pre',

		configResolved(config) {
			root = config.root;
		},

		resolveId(id) {
			// Vite's own CSS pipeline appends query suffixes (e.g. `?inline` when inlining
			// CSS for SSR) before re-resolving — match those too, preserving the suffix, or
			// the id falls through to Vite's default file-path resolution and chokes on the
			// `\0` virtual-module marker (not a real path).
			if (id === VIRTUAL_ID) return RESOLVED_ID;
			if (id.startsWith(VIRTUAL_ID + '?')) return '\0' + id;
			if (id === RESOLVED_ID || id.startsWith(RESOLVED_ID + '?')) return id;
		},

		async load(id) {
			if (id === RESOLVED_ID || id.startsWith(RESOLVED_ID + '?')) return build();
		},

		configureServer(server: ViteDevServer) {
			server.middlewares.use(createStylerBuilderMiddleware(root));

			server.watcher.on('all', (_event, file) => {
				if (!WATCHED_EXT_RE.test(file)) return;
				const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
				if (!mod) return;
				server.moduleGraph.invalidateModule(mod);
				server.ws.send({ type: 'full-reload' });
			});
		}
	};
}

export { fractalsStyler };
export { generateCss } from './generate.js';
export { scanFiles } from './scanner.js';
export { resolveDeclarations, BREAKPOINTS, DYNAMIC_PREFIXES, STATIC_UTILITIES } from './registry.js';
export * from './builder/types.js';
export * from './builder/nodes.js';
export * from './builder/generator.js';
export * from './builder/middleware.js';

