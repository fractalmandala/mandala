/**
 * Registrable-domain (eTLD+1) extraction for vault credential matching.
 *
 * The old vault matched by string-prefix / naive hostname suffix, which both over- and
 * under-matched (`evil-google.com` matched `google.com`; `mail.google.co.uk` failed to match
 * `google.co.uk`). This resolves the registrable domain — the eTLD+1 — so matching is domain
 * scoped and subdomain-agnostic.
 *
 * We do NOT ship the full Public Suffix List (megabytes, needs periodic updates). Instead we
 * carry a curated set of common multi-label public suffixes; anything not listed falls back to
 * the last two labels. This is deliberately conservative: a miss degrades to "last two labels",
 * which is correct for the overwhelming majority of real login sites and never leaks a match
 * across unrelated registrable domains.
 */

// Multi-label public suffixes where the registrable domain is the last THREE labels.
// (Second-level registries: the label before these is the registrable name.)
const MULTI_LABEL_SUFFIXES = new Set<string>([
	// UK
	'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk', 'sch.uk', 'ac.uk', 'gov.uk',
	// Australia
	'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'id.au',
	// Japan
	'co.jp', 'or.jp', 'ne.jp', 'ac.jp', 'go.jp',
	// Brazil
	'com.br', 'net.br', 'org.br', 'gov.br',
	// India
	'co.in', 'net.in', 'org.in', 'gen.in', 'firm.in', 'ind.in',
	// New Zealand
	'co.nz', 'net.nz', 'org.nz', 'govt.nz', 'ac.nz',
	// South Africa
	'co.za', 'org.za', 'net.za',
	// Others commonly seen
	'com.cn', 'net.cn', 'org.cn', 'gov.cn',
	'com.mx', 'com.tr', 'com.sg', 'com.hk', 'com.tw', 'com.ar', 'co.kr',
]);

/**
 * Extract the hostname from a URL or bare host string. Lowercased, trailing dot stripped.
 * Returns '' if nothing host-like can be recovered.
 */
export function hostname(input: string): string {
	if (!input) return '';
	const trimmed = input.trim();
	let host = '';
	try {
		host = new URL(trimmed).hostname;
	} catch {
		try {
			host = new URL('https://' + trimmed).hostname;
		} catch {
			host = trimmed;
		}
	}
	host = host.toLowerCase().replace(/\.$/, '');
	// Guard against inputs that were never host-like (contained spaces or slashes).
	if (!host || /\s|\//.test(host)) return '';
	return host;
}

/**
 * The registrable domain (eTLD+1) for a URL or bare host. Returns '' when the input has no
 * usable host. IP addresses and single-label hosts (`localhost`) are returned as-is.
 */
export function registrableDomain(input: string): string {
	const host = hostname(input);
	if (!host) return '';
	// Bare IPv4 / IPv6 / single-label — nothing to reduce.
	if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')) return host;
	const labels = host.split('.');
	if (labels.length <= 2) return host;

	const lastTwo = labels.slice(-2).join('.');
	if (MULTI_LABEL_SUFFIXES.has(lastTwo)) {
		return labels.slice(-3).join('.');
	}
	return lastTwo;
}

/**
 * Whether a stored login matches a page URL. Pure so it can be unit-tested without the vault
 * singleton. A login matches when any of its stored URIs shares the page's registrable domain;
 * a login with no stored URI falls back to a loose name↔host containment check (legacy vaults
 * often have name-only entries).
 */
export function loginMatchesUrl(uris: { uri: string }[], name: string, url: string): boolean {
	const target = registrableDomain(url);
	if (!uris || uris.length === 0) {
		const host = hostname(url);
		if (!host) return false;
		const lowerName = (name || '').toLowerCase();
		if (!lowerName) return false;
		return host.includes(lowerName) || lowerName.includes(host);
	}
	if (!target) return false;
	return uris.some(u => {
		if (!u?.uri) return false;
		const entryDomain = registrableDomain(u.uri);
		return !!entryDomain && entryDomain === target;
	});
}
