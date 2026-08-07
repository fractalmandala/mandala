#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(HERE, '..', 'templates');

function printUsage(): void {
	console.log(`fractals-styler init [dest]

Copies the static SASS partials (_tokens.sass, _globals.sass, _primitives.sass,
_typography.sass, index.sass, _mixins.sass) into [dest] so you can edit and
theme them directly in your project.

  dest      Destination directory (default: src/lib/styles)
  --force   Overwrite files that already exist at the destination
`);
}

function init(destArg: string | undefined, force: boolean): void {
	const dest = destArg ?? 'src/lib/styles';
	mkdirSync(dest, { recursive: true });

	const files = readdirSync(TEMPLATES_DIR);
	let copied = 0;
	let skipped = 0;

	for (const file of files) {
		const target = join(dest, file);
		if (existsSync(target) && !force) {
			console.log(`skip   ${target} (already exists, use --force to overwrite)`);
			skipped++;
			continue;
		}
		copyFileSync(join(TEMPLATES_DIR, file), target);
		console.log(`create ${target}`);
		copied++;
	}

	console.log(`\n${copied} file(s) written, ${skipped} skipped.`);
	console.log(`
Next steps:
  1. In your Vite config:
       import fractalsStyler from 'fractals-styler';
       export default { plugins: [sveltekit(), fractalsStyler()] };

  2. In your root layout (once, globally):
       import '$lib/styles/index.sass';
       import 'virtual:fractals-styler.css';
`);
}

const [command, ...rest] = process.argv.slice(2);
const force = rest.includes('--force');
const positional = rest.filter((a) => !a.startsWith('--'));

if (command === 'init') {
	init(positional[0], force);
} else {
	printUsage();
	process.exit(command ? 1 : 0);
}
