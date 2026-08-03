/** @type {import("prettier").Config} */
const config = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	// Keep `>` on the last attribute line when tags wrap (not on its own line).
	bracketSameLine: true,
	// Svelte components are treated as inline by default, which produces
	// `><Child /></Tag\n>` noise. Ignore whitespace so children block-format.
	htmlWhitespaceSensitivity: 'ignore',
	plugins: ['prettier-plugin-svelte'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }]
};

export default config;
