import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function walk(dir: string, extensions: Set<string>): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return walk(path, extensions);
		return extensions.has(name.slice(name.lastIndexOf('.'))) ? [path] : [];
	});
}

describe('style and asset contracts', () => {
	it('resolves every CSS custom-property consumer to a global or component producer', () => {
		const files = walk(join(root, 'src'), new Set(['.sass', '.svelte', '.ts']));
		const definitions = new Set<string>();
		const uses = new Map<string, string[]>();

		for (const file of files) {
			const source = readFileSync(file, 'utf8');
			for (const match of source.matchAll(/(--[\w-]+)\s*:/g)) definitions.add(match[1]);
			for (const match of source.matchAll(/var\((--[\w-]+)/g)) {
				uses.set(match[1], [...(uses.get(match[1]) ?? []), file.slice(root.length + 1)]);
			}
		}

		const unresolved = [...uses].filter(([name]) => !definitions.has(name));
		expect(unresolved, `Unresolved CSS custom properties: ${JSON.stringify(unresolved)}`).toEqual([]);
	});

	it('does not reference missing static icon assets', () => {
		const files = walk(join(root, 'src'), new Set(['.svelte', '.ts', '.sass']));
		const missing: string[] = [];
		for (const file of files) {
			const source = readFileSync(file, 'utf8');
			for (const match of source.matchAll(/\/iconset\/([^"'`{}]+\.svg)/g)) {
				if (!existsSync(join(root, 'static', 'iconset', match[1]))) {
					missing.push(`${file.slice(root.length + 1)}: ${match[0]}`);
				}
			}
		}
		expect(missing).toEqual([]);
	});
});
