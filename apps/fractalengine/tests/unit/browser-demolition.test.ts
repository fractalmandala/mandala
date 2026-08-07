import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Browser-module demolition guard (BROWSER-MODULE-PLAN §1b.1, §6 deletion ledger).
 *
 * The AI layer rotted because new code shipped while old state paths stayed alive. This test
 * makes zombie browser code unrepresentable: every forbidden legacy symbol below fails the
 * suite if it reappears anywhere in `src/` or `src-tauri/src/`. The list is SEEDED with the
 * P0 (vault-extraction) dead symbols and GROWS at every phase — when a phase replaces
 * something, its old identifiers are appended in the same PR that lands the replacement
 * (§1b.1). P6's closing audit walks this list against the §6 ledger for 1:1 coverage.
 *
 * `scope: 'anywhere'`  — the marker must not appear in any scanned file.
 * `scope: 'outside-module'` — the marker may exist inside `src/lib/modules/browser/`
 *   (its new home) but nowhere else; the old god-object / shim call sites are what we forbid.
 *
 * Streams A and B submit their own dead symbols to this file as their demolitions land.
 */

type Scope = 'anywhere' | 'outside-module';

interface ForbiddenSymbol {
	marker: string;
	scope: Scope;
	phase: string;
	note: string;
}

const MODULE_DIR = 'src/lib/modules/browser/';

// ── P0 — vault extraction & shim removal ──────────────────────────────────────
const FORBIDDEN: ForbiddenSymbol[] = [
	{ marker: 'browserState', scope: 'anywhere', phase: 'P0',
		note: 'state/browser.svelte.ts re-export shim deleted — callers use ideState / vault directly' },
	{ marker: 'state/browser.svelte', scope: 'outside-module', phase: 'P0',
		note: 'the shim module path; the browser module owns its own state/ internally' },
	{ marker: 'passwordsList', scope: 'outside-module', phase: 'P0',
		note: 'vault entry list moved off ideState → vault.entries' },
	{ marker: 'matchingLogins', scope: 'outside-module', phase: 'P0',
		note: 'domain matching moved off ideState → vault.matchesFor(url)' },
	{ marker: 'vaultTotpCount', scope: 'outside-module', phase: 'P0',
		note: 'moved off ideState → vault.totpCount' },
	{ marker: 'importBitwardenFile', scope: 'outside-module', phase: 'P0',
		note: 'moved off ideState → vault.importFromBitwarden()' },
	{ marker: 'loadPasswords', scope: 'outside-module', phase: 'P0',
		note: 'ideState.loadPasswords() removed — vault.load()/ensureLoaded()' },
	{ marker: 'savePasswords', scope: 'outside-module', phase: 'P0',
		note: 'ideState.savePasswords() removed — vault.save()' },
	{ marker: 'clearPasswords', scope: 'outside-module', phase: 'P0',
		note: 'ideState.clearPasswords() removed — vault.clear()' },

	// ── P4 — bookmarks are app-level data, not a storage-prefixed or module-coupled API ──
	{ marker: 'storage_list_bookmarks', scope: 'anywhere', phase: 'P4',
		note: 'superseded by module-neutral bookmark_list / bookmarkList' },
	{ marker: 'storage_add_bookmark', scope: 'anywhere', phase: 'P4',
		note: 'superseded by module-neutral bookmark_add / bookmarkAdd' },
	{ marker: 'storage_update_bookmark', scope: 'anywhere', phase: 'P4',
		note: 'superseded by module-neutral bookmark_update / bookmarkUpdate' },
	{ marker: 'storage_delete_bookmark', scope: 'anywhere', phase: 'P4',
		note: 'superseded by module-neutral bookmark_delete / bookmarkDelete' },

	// ── P1 — native engine ─────────────────────────────────────────────────────
	{ marker: 'browserSetContentBounds', scope: 'anywhere', phase: 'P1',
		note: 'replaced by tab-addressed browserSetViewportBounds' },
	{ marker: 'onNativeBrowserEvent', scope: 'anywhere', phase: 'P1',
		note: 'replaced by typed onBrowserEvent' },
	{ marker: 'NativeBrowserEvent', scope: 'anywhere', phase: 'P1',
		note: 'single-window event shape replaced by BrowserEvent' },
	// ── P2 — chrome UI (Stream B appends: components/Browser.svelte, browser-iframe,
	//    allow-same-origin, "(Simulated)", native confirm( in modules/browser) ──
	{ marker: 'components/Browser.svelte', scope: 'anywhere', phase: 'P2',
		note: 'deleted in B5 — replaced by BrowserLauncherCard + standalone browser route' },
	{ marker: 'browser-iframe', scope: 'anywhere', phase: 'P2',
		note: 'deleted in B5 — replaced by MockTabEngine-driven chrome' },
	{ marker: '"Simulated"', scope: 'outside-module', phase: 'P2',
		note: 'old iframe simulation text replaced by native MockTabEngine' },
	{ marker: 'native confirm(', scope: 'outside-module', phase: 'P2',
		note: 'browser module must use showConfirm() from BrowserConfirm.svelte' },
];

/** Recursively collect scannable source files under a root. */
function collectFiles(dir: string): string[] {
	if (!fs.existsSync(dir)) return [];
	const files: string[] = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === 'node_modules' || entry.name === 'target') continue;
			files.push(...collectFiles(full));
		} else if (/\.(ts|svelte|rs|js)$/.test(entry.name)) {
			files.push(full);
		}
	}
	return files;
}

const repoRoot = path.resolve(__dirname, '../..');
const roots = ['src', 'src-tauri/src'].map(r => path.resolve(repoRoot, r));
const allFiles = roots.flatMap(collectFiles);

describe('browser-module demolition — forbidden legacy symbols', () => {
	const thisFile = path.resolve(__dirname, 'browser-demolition.test.ts');

	for (const sym of FORBIDDEN) {
		it(`[${sym.phase}] no "${sym.marker}" (${sym.scope}) — ${sym.note}`, () => {
			const offenders: string[] = [];
			for (const file of allFiles) {
				if (file === thisFile) continue;
				const rel = path.relative(repoRoot, file).replace(/\\/g, '/');
				if (rel.endsWith('healthgraph.svelte')) continue;
				if (sym.scope === 'outside-module' && rel.startsWith(MODULE_DIR)) continue;
				const content = fs.readFileSync(file, 'utf-8');
				const lines = content.split('\n');
				for (let i = 0; i < lines.length; i++) {
					if (lines[i].includes(sym.marker)) offenders.push(`${rel}:${i + 1}`);
				}
			}
			expect(offenders, `Forbidden symbol "${sym.marker}" still present`).toEqual([]);
		});
	}

	it('the forbidden list is non-empty and well-formed', () => {
		expect(FORBIDDEN.length).toBeGreaterThan(0);
		for (const sym of FORBIDDEN) {
			expect(sym.marker.length).toBeGreaterThan(0);
			expect(['anywhere', 'outside-module']).toContain(sym.scope);
		}
	});
});

describe('browser-module data dependency boundary', () => {
	it('[P4] browser internals never import the legacy bookmarks module', () => {
		const browserFiles = collectFiles(path.resolve(repoRoot, MODULE_DIR));
		const offenders = browserFiles.filter(file => fs.readFileSync(file, 'utf-8').includes('modules/bookmarks/'));
		expect(offenders.map(file => path.relative(repoRoot, file))).toEqual([]);
	});

	it('[P4] legacy bookmarks module never imports browser internals', () => {
		const bookmarkFiles = collectFiles(path.resolve(repoRoot, 'src/lib/modules/bookmarks'));
		const offenders = bookmarkFiles.filter(file => fs.readFileSync(file, 'utf-8').includes('modules/browser/'));
		expect(offenders.map(file => path.relative(repoRoot, file))).toEqual([]);
	});
});
