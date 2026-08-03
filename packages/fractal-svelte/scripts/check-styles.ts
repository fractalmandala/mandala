import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog } from '../src/lib/catalog/index.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const violations: string[] = [];
for (const entry of catalog.filter((item) => item.status === 'ready')) {
	const directory = resolve(root, 'src/lib/components', entry.componentPath);
	const names = await readdir(directory);
	const svelteContents = await Promise.all(
		names
			.filter((name) => name.endsWith('.svelte'))
			.map((name) => readFile(resolve(directory, name), 'utf8'))
	);
	for (const name of names.filter((item) => item.endsWith('.sass'))) {
		const content = await readFile(resolve(directory, name), 'utf8');
		if (/--beui\b/i.test(content)) violations.push(`${entry.slug}: ${name} contains --beui`);
		if (/#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/i.test(content))
			violations.push(`${entry.slug}: ${name} contains a literal color`);
		if (!svelteContents.some((source) => source.includes(`./${name}`)))
			violations.push(`${entry.slug}: ${name} is not imported by a colocated Svelte file`);
	}
}
if (violations.length) throw new Error(violations.join('\n'));
console.log(
	'Style check passed: no legacy tokens or literal colors; all colocated styles are imported'
);
