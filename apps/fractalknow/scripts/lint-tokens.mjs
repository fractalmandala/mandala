#!/usr/bin/env node
/**
 * Fails when:
 *  1. hex / rgb( / hsl( color literals appear outside token/mixin files.
 *  2. a var(--ok-*) / var(--fk-*) reference points at a custom property that
 *     is never defined in global.sass (or any scanned style file).
 *  3. a .svelte style block consumes a compile-time Sass color constant
 *     (t.$ink, t.$line, t.$diff-*, ...) — those bake the light palette at
 *     build time and break dark / high-contrast themes (T044 F1).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const allowed = new Set([
	'src/lib/styles/_tokens.sass',
	'src/lib/styles/_mixins.sass',
]);
const colorPattern = /#(?:[0-9a-fA-F]{3,8})\b|rgba?\(|hsla?\(/g;
const varDefPattern = /(--(?:ok|fk)-[\w-]+)\s*:/g;
const varRefPattern = /var\(\s*(--(?:ok|fk)-[\w-]+)/g;
// Compile-time color constants banned inside .svelte style blocks.
// Lookahead keeps t.$ok from matching t.$ok-titlebar-* and t.$line from
// matching t.$line-height-*.
const sassColorPattern =
	/t\.\$(?:ink-inverse|muted-inverse|selection-inverse|diff-[\w-]+|overlay-scrim|overlay-shadow(?:-strong)?|focus-ring|highlight|selection|shadow-(?:sm|md|lg|xl)|success|surface|accent|danger|panel|muted|warn|line|ink|ok)(?![-\w])/g;
const violations = [];
const defined = new Set();
const references = [];

function walk(dir) {
	for (const entry of readdirSync(dir)) {
		if (entry === 'node_modules' || entry === 'build' || entry === '.svelte-kit') continue;
		const full = join(dir, entry);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			walk(full);
			continue;
		}
		if (!/\.(sass|scss|svelte|css)$/.test(entry)) continue;
		const rel = relative(root, full);
		const text = readFileSync(full, 'utf8');
		for (const match of text.matchAll(varDefPattern)) defined.add(match[1]);
		const lines = text.split('\n');
		lines.forEach((line, index) => {
			for (const match of line.matchAll(varRefPattern)) {
				references.push({ name: match[1], where: `${rel}:${index + 1}` });
			}
			if (entry.endsWith('.svelte')) {
				for (const match of line.matchAll(sassColorPattern)) {
					violations.push(
						`${rel}:${index + 1}: ${match[0]} bakes the light palette at build time — use var(--ok-*)`,
					);
				}
			}
			if (allowed.has(rel)) return;
			if (line.includes('data:image') || line.includes('--ok-')) return;
			const matches = line.match(colorPattern);
			if (!matches) return;
			// Allow transparent keyword usage only; rgb/hex still fail.
			violations.push(`${rel}:${index + 1}: ${matches.join(', ')}`);
		});
	}
}

walk(join(root, 'src'));

const unresolved = references.filter(({ name }) => !defined.has(name));
for (const { name, where } of unresolved) {
	violations.push(`${where}: var(${name}) is never defined`);
}

if (violations.length > 0) {
	console.error(`Token lint failed (${violations.length} violation(s)):`);
	for (const item of violations.slice(0, 40)) console.error(`  ${item}`);
	if (violations.length > 40) console.error(`  …and ${violations.length - 40} more`);
	process.exit(1);
}

console.log(
	`Token lint passed: no hard-coded colors outside token files; ${references.length} var(--ok-*/--fk-*) references all resolve.`,
);
