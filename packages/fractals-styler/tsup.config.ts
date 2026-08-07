import { defineConfig } from 'tsup';

export default defineConfig({
	entry: { index: 'src/index.ts', cli: 'src/cli.ts' },
	format: ['esm'],
	dts: { entry: ['src/index.ts'] },
	target: 'node18',
	clean: true,
	splitting: false,
	sourcemap: true,
	shims: true
});
