import { describe, expect, it } from 'vitest';
import { registrableDomain, hostname, loginMatchesUrl } from '$lib/modules/browser/state/registrableDomain';
import { generatePassword, isBitwardenImportItem, toPasswordEntry } from '$lib/modules/browser/state/vault.svelte';

/**
 * Vault v2 — registrable-domain matching (C2) and Bitwarden fixture validation (C1/C2).
 * Covers subdomain, eTLD (multi-label suffix), malformed, legacy name-only, and boundary cases.
 */

describe('hostname()', () => {
	it('extracts host from full URLs, bare hosts, and lowercases', () => {
		expect(hostname('https://www.Example.com/login?x=1')).toBe('www.example.com');
		expect(hostname('example.com')).toBe('example.com');
		expect(hostname('http://sub.example.co.uk')).toBe('sub.example.co.uk');
	});
	it('strips trailing dot', () => {
		expect(hostname('https://example.com.')).toBe('example.com');
	});
	it('returns empty for non-host-like input', () => {
		expect(hostname('')).toBe('');
		expect(hostname('   ')).toBe('');
		expect(hostname('a search query with spaces')).toBe('');
	});
});

describe('registrableDomain()', () => {
	it('reduces subdomains to eTLD+1', () => {
		expect(registrableDomain('https://mail.google.com')).toBe('google.com');
		expect(registrableDomain('https://a.b.c.example.com')).toBe('example.com');
		expect(registrableDomain('example.com')).toBe('example.com');
	});
	it('handles multi-label public suffixes (eTLD)', () => {
		expect(registrableDomain('https://www.google.co.uk')).toBe('google.co.uk');
		expect(registrableDomain('https://shop.myshop.com.au')).toBe('myshop.com.au');
		expect(registrableDomain('https://a.b.example.co.jp')).toBe('example.co.jp');
	});
	it('passes through IPs and single-label hosts', () => {
		expect(registrableDomain('http://127.0.0.1:8080')).toBe('127.0.0.1');
		expect(registrableDomain('http://localhost:3000')).toBe('localhost');
	});
	it('returns empty for junk', () => {
		expect(registrableDomain('')).toBe('');
		expect(registrableDomain('not a url')).toBe('');
	});
});

describe('loginMatchesUrl() — with stored URIs', () => {
	const uris = [{ uri: 'https://login.example.com/auth' }];
	it('matches across subdomains of the same registrable domain', () => {
		expect(loginMatchesUrl(uris, 'Example', 'https://www.example.com/page')).toBe(true);
		expect(loginMatchesUrl(uris, 'Example', 'https://example.com')).toBe(true);
	});
	it('does NOT match a lookalike registrable domain (no prefix bleed)', () => {
		// The old string-prefix matcher wrongly matched these.
		expect(loginMatchesUrl(uris, 'Example', 'https://evil-example.com')).toBe(false);
		expect(loginMatchesUrl(uris, 'Example', 'https://example.com.attacker.net')).toBe(false);
	});
	it('respects multi-label eTLD boundaries', () => {
		const ukUris = [{ uri: 'https://www.bank.co.uk' }];
		expect(loginMatchesUrl(ukUris, 'Bank', 'https://secure.bank.co.uk')).toBe(true);
		// Different registrable name under same suffix must not match.
		expect(loginMatchesUrl(ukUris, 'Bank', 'https://other.co.uk')).toBe(false);
	});
	it('ignores empty/garbage URIs among the list', () => {
		const mixed = [{ uri: '' }, { uri: 'not a url' }, { uri: 'https://example.com' }];
		expect(loginMatchesUrl(mixed, 'X', 'https://example.com')).toBe(true);
		expect(loginMatchesUrl(mixed, 'X', 'https://nope.org')).toBe(false);
	});
});

describe('loginMatchesUrl() — legacy name-only entries (no URI)', () => {
	it('falls back to loose name↔host containment', () => {
		expect(loginMatchesUrl([], 'github.com', 'https://github.com/login')).toBe(true);
		expect(loginMatchesUrl([], 'github', 'https://github.com')).toBe(true);
	});
	it('does not match when name is empty or unrelated', () => {
		expect(loginMatchesUrl([], '', 'https://github.com')).toBe(false);
		expect(loginMatchesUrl([], 'gitlab', 'https://github.com')).toBe(false);
	});
	it('does not match against junk urls', () => {
		expect(loginMatchesUrl([], 'github', 'a search query')).toBe(false);
	});
});

describe('isBitwardenImportItem() — malformed / legacy / boundary fixtures', () => {
	const valid = { id: 'abc', type: 1, name: 'X', login: { username: 'u', password: 'p', totp: '', uris: [{ uri: 'https://x.com' }] } };

	it('accepts a well-formed login item', () => {
		expect(isBitwardenImportItem(valid)).toBe(true);
	});
	it('accepts an item with no login block (folders/notes)', () => {
		expect(isBitwardenImportItem({ id: 'x', type: 2 })).toBe(true);
	});
	it('rejects missing/empty id', () => {
		expect(isBitwardenImportItem({ type: 1 })).toBe(false);
		expect(isBitwardenImportItem({ id: '', type: 1 })).toBe(false);
	});
	it('rejects non-numeric or non-finite type', () => {
		expect(isBitwardenImportItem({ id: 'x', type: '1' })).toBe(false);
		expect(isBitwardenImportItem({ id: 'x', type: NaN })).toBe(false);
	});
	it('rejects malformed login sub-fields', () => {
		expect(isBitwardenImportItem({ id: 'x', type: 1, login: { password: 123 } })).toBe(false);
		expect(isBitwardenImportItem({ id: 'x', type: 1, login: { uris: [{ nope: 'y' }] } })).toBe(false);
	});
	it('rejects primitives and null', () => {
		expect(isBitwardenImportItem(null)).toBe(false);
		expect(isBitwardenImportItem('str')).toBe(false);
		expect(isBitwardenImportItem(42)).toBe(false);
	});
});

describe('toPasswordEntry() — normalization & boundaries', () => {
	it('fills defaults for missing optional fields', () => {
		const e = toPasswordEntry({ id: 'x', type: 1 });
		expect(e.name).toBe('Unnamed Login');
		expect(e.login.uris).toEqual([]);
		expect(e.login.username).toBe('');
		expect(typeof e.creationDate).toBe('string');
		expect(typeof e.revisionDate).toBe('string');
	});
	it('preserves provided fields', () => {
		const e = toPasswordEntry({ id: 'y', type: 1, name: 'GitHub', login: { username: 'me', password: 'pw', totp: 'SEED', uris: [{ uri: 'https://github.com' }] }, creationDate: '2020-01-01', revisionDate: '2021-01-01' });
		expect(e.name).toBe('GitHub');
		expect(e.login.totp).toBe('SEED');
		expect(e.login.uris[0].uri).toBe('https://github.com');
		expect(e.creationDate).toBe('2020-01-01');
	});
});

describe('generatePassword() — secure vault generator defaults', () => {
	it('uses the requested bounded length and avoids visually ambiguous glyphs', () => {
		const password = generatePassword({ length: 32, symbols: false });
		expect(password).toHaveLength(32);
		expect(password).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789]+$/);
	});

	it('clamps unsafe lengths to a usable password-manager range', () => {
		expect(generatePassword({ length: 1 })).toHaveLength(12);
		expect(generatePassword({ length: 1000 })).toHaveLength(128);
	});
});
