#!/usr/bin/env node
/**
 * Incremental sync: vault → src/content
 *
 * Pipeline:
 *   WIKI_VAULT_PATH (default: ../repowiki relative to this package)
 *     → WIKI_OUT (default: src/content)
 *     → Vite globs under /src/content in content-list / content-page
 *     → SvelteKit routes under src/routes/docs
 *     → postbuild pagefind indexes prerendered HTML
 *
 * - Copies new/changed .md files
 * - Removes orphan .md files no longer in the vault
 * - Does NOT delete the whole directory (safe for other files)
 * - Cleans empty directories left after orphan removal
 */
import {
	existsSync,
	readdirSync,
	mkdirSync,
	copyFileSync,
	statSync,
	unlinkSync,
	rmdirSync
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, '..');

/** Prefer monorepo-adjacent vault; override with WIKI_VAULT_PATH. */
const DEFAULT_VAULT = resolve(SITE_ROOT, '../repowiki');
const VAULT_PATH = resolve(process.env.WIKI_VAULT_PATH ?? DEFAULT_VAULT);
/** Site content mirror — must match content CONTENT_ROOT (`/src/content/`). */
const OUT_REL = process.env.WIKI_OUT ?? 'src/content';
const OUT_DIR = resolve(SITE_ROOT, OUT_REL);

function die(msg) {
	console.error(`\n ✗ ${msg}\n`);
	process.exit(1);
}

function collectMds(dir) {
	const out = [];
	if (!existsSync(dir)) return out;

	const walk = (current) => {
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			const full = join(current, entry.name);
			if (entry.isDirectory()) walk(full);
			else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) out.push(full);
		}
	};

	walk(dir);
	return out;
}

/** Remove empty directories under root (bottom-up). */
function cleanEmptyDirs(root) {
	if (!existsSync(root)) return;

	const walk = (current) => {
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			if (!entry.isDirectory()) continue;
			const full = join(current, entry.name);
			walk(full);
			try {
				if (readdirSync(full).length === 0) {
					rmdirSync(full);
				}
			} catch {
				// not empty or already gone — ignore
			}
		}
	};

	walk(root);
}

if (!existsSync(VAULT_PATH)) {
	die(
		`Vault not found: ${VAULT_PATH}\n` +
			`  Set WIKI_VAULT_PATH to your vault, or place repowiki at ${DEFAULT_VAULT}`
	);
}

mkdirSync(OUT_DIR, { recursive: true });

const vaultMds = collectMds(VAULT_PATH);
const vaultRelSet = new Set(vaultMds.map((f) => relative(VAULT_PATH, f)));

let copied = 0;
let skipped = 0;

for (const md of vaultMds) {
	const rel = relative(VAULT_PATH, md);
	const target = join(OUT_DIR, rel);

	mkdirSync(dirname(target), { recursive: true });

	// Skip if dest exists and is same size + mtime (cheap unchanged check)
	if (existsSync(target)) {
		const s = statSync(md);
		const t = statSync(target);
		if (s.size === t.size && s.mtimeMs <= t.mtimeMs) {
			skipped++;
			continue;
		}
	}

	copyFileSync(md, target);
	copied++;
}

// Remove orphan .md files in OUT that are no longer in the vault
const outMds = collectMds(OUT_DIR);
let removed = 0;

for (const md of outMds) {
	const rel = relative(OUT_DIR, md);
	if (!vaultRelSet.has(rel)) {
		unlinkSync(md);
		removed++;
	}
}

cleanEmptyDirs(OUT_DIR);

console.log(`\n Wiki sync → ${OUT_REL}/`);
console.log(`  vault:   ${VAULT_PATH}`);
console.log(`  copied:  ${copied}`);
console.log(`  skipped: ${skipped} (unchanged)`);
console.log(`  removed: ${removed} (orphans)\n`);
