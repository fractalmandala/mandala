#!/usr/bin/env node
/**
 * Post-build Pagefind index.
 * Indexes prerendered HTML and writes `pagefind/` into adapter static outputs
 * so `/pagefind/pagefind.js` is available in production and local preview.
 */
import { existsSync, cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, '..');

const PRERENDER_CANDIDATES = [
	join(SITE_ROOT, '.svelte-kit/output/prerendered'),
	join(SITE_ROOT, 'build'),
	join(SITE_ROOT, '.vercel/output/static')
];

const OUTPUT_CANDIDATES = [
	join(SITE_ROOT, '.vercel/output/static/pagefind'),
	join(SITE_ROOT, '.svelte-kit/output/client/pagefind'),
	join(SITE_ROOT, 'static/pagefind')
];

function findPrerendered() {
	for (const dir of PRERENDER_CANDIDATES) {
		if (existsSync(dir)) return dir;
	}
	return null;
}

const pagefindBin = join(SITE_ROOT, 'node_modules', '.bin', 'pagefind');
if (!existsSync(pagefindBin)) {
	console.warn('\n ⚠ pagefind binary not found; skip indexing\n');
	process.exit(0);
}

const site = findPrerendered();
if (!site) {
	console.warn('\n ⚠ No prerendered output found; skip pagefind\n');
	console.warn('   Looked for:', PRERENDER_CANDIDATES.join(', '));
	process.exit(0);
}

const tmpOut = join(SITE_ROOT, '.pagefind-tmp');
if (existsSync(tmpOut)) rmSync(tmpOut, { recursive: true, force: true });

console.log(`\n Pagefind index ← ${site}`);

const result = spawnSync(
	pagefindBin,
	['--site', site, '--output-path', tmpOut, '--verbose'],
	{ stdio: 'inherit', cwd: SITE_ROOT }
);

if (result.status !== 0) {
	console.error('\n ✗ pagefind failed\n');
	process.exit(result.status ?? 1);
}

let copied = 0;
for (const dest of OUTPUT_CANDIDATES) {
	const parent = dirname(dest);
	// Only write into trees that already exist (except static/, which we create)
	if (!existsSync(parent) && !dest.includes(`${join('static', 'pagefind')}`)) {
		continue;
	}
	mkdirSync(parent, { recursive: true });
	if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
	cpSync(tmpOut, dest, { recursive: true });
	console.log(`  → ${dest.replace(SITE_ROOT + '/', '')}`);
	copied++;
}

rmSync(tmpOut, { recursive: true, force: true });

// Always also land under static/ so a subsequent preview can pick it up
const staticOut = join(SITE_ROOT, 'static/pagefind');
if (!OUTPUT_CANDIDATES.includes(staticOut) || !existsSync(staticOut)) {
	// already copied if static was in candidates and parent existed
}
if (copied === 0) {
	mkdirSync(dirname(staticOut), { recursive: true });
	console.warn('  ⚠ No build output dirs; writing static/pagefind only');
	const r2 = spawnSync(
		pagefindBin,
		['--site', site, '--output-path', staticOut],
		{ stdio: 'inherit', cwd: SITE_ROOT }
	);
	if (r2.status !== 0) process.exit(r2.status ?? 1);
	copied = 1;
}

console.log(`\n ✓ pagefind ready (${copied} location(s))\n`);
