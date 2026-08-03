import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['src'];
const allowedExtensions = /\.(ts|svelte|sass|json|md)$/;
const legacy = /beui\.dev|\bbeUI\b/g;
const violations: string[] = [];

async function walk(directory: string): Promise<string[]> {
	const result: string[] = [];
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = resolve(directory, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === 'ports' || entry.name === 'internal') continue;
			result.push(...(await walk(path)));
		} else if (allowedExtensions.test(entry.name)) result.push(path);
	}
	return result;
}

for (const directory of roots) {
	for (const file of await walk(resolve(root, directory))) {
		const content = await readFile(file, 'utf8');
		if (legacy.test(content)) violations.push(relative(root, file));
		legacy.lastIndex = 0;
	}
}
if (violations.length) throw new Error(`Legacy public branding found in: ${violations.join(', ')}`);
console.log('Public content check passed: no legacy branding outside internal snapshots');
