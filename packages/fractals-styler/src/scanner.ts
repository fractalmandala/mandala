import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';

const CLASS_TOKEN_RE = /[A-Za-z_][A-Za-z0-9_-]*/g;
const PX_VAR_RE = /--px(\d+)\b/g;

export interface ScanResult {
	classTokens: Set<string>;
	pxVars: Set<number>;
}

/** Scans every file matching `patterns` for candidate class names and `--pxN` variable
 * references. Deliberately broad (regexes the whole file, not just class attributes) —
 * false positives just generate a few bytes of unused CSS, same trade-off Tailwind's JIT
 * scanner makes, and it keeps this framework-agnostic (works in .svelte, .ts, .html...). */
export async function scanFiles(patterns: string[], cwd: string): Promise<ScanResult> {
	const files = await fg(patterns, {
		cwd,
		absolute: true,
		ignore: ['**/node_modules/**', '**/dist/**', '**/.svelte-kit/**', '**/build/**']
	});

	const classTokens = new Set<string>();
	const pxVars = new Set<number>();

	await Promise.all(
		files.map(async (file) => {
			let content: string;
			try {
				content = await readFile(file, 'utf-8');
			} catch {
				return;
			}

			for (const match of content.matchAll(CLASS_TOKEN_RE)) {
				classTokens.add(match[0]);
			}
			for (const match of content.matchAll(PX_VAR_RE)) {
				pxVars.add(Number(match[1]));
			}
		})
	);

	return { classTokens, pxVars };
}
