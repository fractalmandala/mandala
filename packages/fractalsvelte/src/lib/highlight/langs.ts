/**
 * Lazy language loaders for the shared highlighter.
 * Keep this list intentional — every entry costs download/parse on first use.
 */
export const bundledLanguages = {
	bash: () => import('@shikijs/langs/bash'),
	css: () => import('@shikijs/langs/css'),
	diff: () => import('@shikijs/langs/diff'),
	html: () => import('@shikijs/langs/html'),
	javascript: () => import('@shikijs/langs/javascript'),
	json: () => import('@shikijs/langs/json'),
	jsx: () => import('@shikijs/langs/jsx'),
	markdown: () => import('@shikijs/langs/markdown'),
	python: () => import('@shikijs/langs/python'),
	svelte: () => import('@shikijs/langs/svelte'),
	tsx: () => import('@shikijs/langs/tsx'),
	typescript: () => import('@shikijs/langs/typescript'),
	yaml: () => import('@shikijs/langs/yaml')
} as const;

export type SupportedLanguage = keyof typeof bundledLanguages;

/** Common aliases used in docs fences and AI replies. */
const ALIASES: Record<string, SupportedLanguage> = {
	js: 'javascript',
	mjs: 'javascript',
	cjs: 'javascript',
	ts: 'typescript',
	mts: 'typescript',
	cts: 'typescript',
	tsx: 'tsx',
	jsx: 'jsx',
	py: 'python',
	sh: 'bash',
	shell: 'bash',
	zsh: 'bash',
	console: 'bash',
	md: 'markdown',
	mdx: 'markdown',
	text: 'markdown',
	txt: 'markdown',
	yml: 'yaml',
	sass: 'css',
	scss: 'css',
	htm: 'html',
	svg: 'html',
	xml: 'html'
};

export function resolveLanguage(lang?: string | null): SupportedLanguage {
	if (!lang) return 'typescript';
	const key = lang.trim().toLowerCase();
	if (key in bundledLanguages) return key as SupportedLanguage;
	return ALIASES[key] ?? 'markdown';
}
