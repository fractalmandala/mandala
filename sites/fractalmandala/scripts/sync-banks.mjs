#!/usr/bin/env node
/**
 * Sync markdown content from the local vault into the fractalmandala site.
 *
 * The site owns its own publish config at src/lib/data/routes-config.json. Each entry is a "bank" with a name and a list of "content links" —
 * paths under <vault>/10wiki/. This script copies every .md file from those
 * folders into src/content/<bank-name>/<first-link-segment>/..., using only
 * the first segment of each content link (e.g. "wiki", "raw") as the
 * destination. The trailing segments are dropped on purpose: the bank name
 * already identifies the topic, so "/wiki/10-sveltekit" lands under
 * <bank-name>/wiki/, not <bank-name>/wiki/10-sveltekit/.
 *
 * Run before committing, then push — Vercel picks up the rebuild automatically.
 *
 * Overrides (env):
 *   BANK_VAULT_PATH   defaults to /Users/amrit/100cabinet
 *   BANK_OUT          defaults to src/content (relative to this package)
 *
 * Example routes-config.json (at src/lib/data/):
 *   [
 *     { "bank name": "Cabinet",  "content links": ["wiki"] },
 *     { "bank name": "Writings", "content links": ["wiki", "raw"] }
 *   ]
 */

import {
	existsSync,
	readFileSync,
	readdirSync,
	mkdirSync,
	rmSync,
	copyFileSync
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, '..');

const VAULT_PATH = process.env.BANK_VAULT_PATH ?? '/Users/amrit/100cabinet';
const OUT_REL = process.env.BANK_OUT ?? 'src/content';
const OUT_DIR = resolve(SITE_ROOT, OUT_REL);
const CONFIG_PATH = join(SITE_ROOT, 'src/lib/data/routes-config.json');

function die(msg) {
	console.error(`\n  ✗ ${msg}\n`);
	process.exit(1);
}

if (!existsSync(VAULT_PATH)) {
	die(`Vault not found: ${VAULT_PATH}  (set BANK_VAULT_PATH to override)`);
}
if (!existsSync(CONFIG_PATH)) {
	die(
		`Publish config not found: ${CONFIG_PATH}\n` +
			`  Create a JSON array of { "bank name", "content links" } entries.`
	);
}

let config;
try {
	config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
} catch (e) {
	die(`Publish config is not valid JSON: ${e.message}`);
}
if (!Array.isArray(config)) {
	die('Publish config must be a JSON array.');
}

const safeName = (s) => {
	const cleaned = String(s ?? '').trim().replace(/[\\/:*?"<>|]+/g, '-');
	return cleaned || 'untitled';
};

const collectMds = (dir) => {
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
};

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

let totalCopied = 0;
const seen = new Set();
const lines = [];

for (const entry of config) {
	if (!entry || typeof entry !== 'object') continue;
	const name = safeName(entry['bank name']);
	const links = Array.isArray(entry['content links']) ? entry['content links'] : [];
	if (links.length === 0) continue;

	const bankOut = join(OUT_DIR, name);
	mkdirSync(bankOut, { recursive: true });
	lines.push(`• ${name}`);

	for (const link of links) {
		const cleanLink = String(link).replace(/^\/+/, '');
		const linkSegment = cleanLink.split('/')[0] || cleanLink;
		const key = `${name}/${linkSegment}`;
		if (seen.has(key)) {
			lines.push(`    ↳ ${cleanLink}  (same destination as a previous link, skipped)`);
			continue;
		}
		seen.add(key);

		const src = join(VAULT_PATH, '10wiki', cleanLink);
		if (!existsSync(src)) {
			lines.push(`    ↳ ${cleanLink}  (missing in vault, skipped)`);
			continue;
		}

		const dest = join(bankOut, linkSegment);
		mkdirSync(dest, { recursive: true });
		const mds = collectMds(src);
		for (const md of mds) {
			const rel = relative(src, md);
			const target = join(dest, rel);
			mkdirSync(dirname(target), { recursive: true });
			copyFileSync(md, target);
			totalCopied++;
		}
		lines.push(`    ↳ ${cleanLink}  (${mds.length} .md)`);
	}
}

if (totalCopied === 0) {
	console.log(`\n  No markdown files were synced.\n  Check your config and vault.\n`);
} else {
	console.log(`\n  Synced ${totalCopied} markdown files into ${OUT_REL}/\n`);
	for (const line of lines) console.log(`  ${line}`);
	console.log('');
}
