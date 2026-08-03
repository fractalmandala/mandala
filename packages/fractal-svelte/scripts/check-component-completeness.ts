import { access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog } from '../src/lib/catalog/index.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const planned = catalog.filter((entry) => entry.status === 'planned');
for (const entry of catalog.filter((item) => item.status === 'ready')) {
	if (
		!entry.files.some((file) => file.endsWith('.svelte')) ||
		!entry.files.some((file) => file.endsWith('index.ts'))
	) {
		throw new Error(`${entry.slug} is ready without Svelte and index source files`);
	}
	for (const file of entry.files) await access(resolve(root, file));
}
if (planned.length)
	console.log(
		`Planned components (${planned.length}): ${planned.map((entry) => entry.slug).join(', ')}`
	);
if (process.argv.includes('--require-ready') && planned.length)
	throw new Error(`${planned.length} catalog entries are not ready`);
console.log(
	`Component completeness check passed: ${catalog.length - planned.length} ready, ${planned.length} planned`
);
