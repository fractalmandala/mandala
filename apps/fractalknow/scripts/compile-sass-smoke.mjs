#!/usr/bin/env node
import { compile, compileString } from 'sass';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const styles = join(root, 'src/lib/styles');
let failed = false;

try {
	const globalCss = compile(join(styles, 'global.sass'), {
		style: 'expanded',
		loadPaths: [styles],
	}).css;
	if (!globalCss.includes(':root') || !globalCss.includes('--fk-ink')) {
		console.error('global.sass missing expected theme variables');
		failed = true;
	} else {
		console.log(`ok global.sass (${globalCss.length} bytes)`);
	}
} catch (error) {
	console.error('global.sass failed:', error instanceof Error ? error.message : error);
	failed = true;
}

// Indented Sass synthetic component style block.
const synthetic = `@use "tokens" as t
@use "mixins" as m

.smoke
\tcolor: t.$ink
\tbackground: t.$panel
\t@include m.focus-ring
`;

try {
	const css = compileString(synthetic, {
		style: 'expanded',
		loadPaths: [styles],
		syntax: 'indented',
	}).css;
	if (!css.includes('color:') || !css.includes('outline')) {
		console.error('synthetic styles missing expected rules');
		failed = true;
	} else {
		console.log(`ok synthetic component styles (${css.length} bytes)`);
	}
} catch (error) {
	console.error('synthetic compile failed:', error instanceof Error ? error.message : error);
	failed = true;
}

if (failed) process.exit(1);
console.log('SASS compile smoke passed.');
