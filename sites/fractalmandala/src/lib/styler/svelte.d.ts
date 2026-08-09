// Ambient declaration so plain `tsc` resolves `.svelte` single-file components
// during `pnpm check`. No Svelte types are required at check time.
declare module '*.svelte' {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const component: any;
	export default component;
}