import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog } from '../src/lib/catalog/index.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8')) as {
	exports: Record<string, unknown>;
};
const missing: string[] = [];
for (const entry of catalog.filter((item) => item.status === 'ready')) {
	if (!entry.exportPath || !(entry.exportPath in pkg.exports)) missing.push(entry.slug);
}
if (missing.length)
	throw new Error(`Ready components missing package exports: ${missing.join(', ')}`);
console.log(
	`Package export check passed: ${catalog.filter((entry) => entry.status === 'ready').length} ready components exported`
);
