/**
 * Credits source of truth: repo-root `credits.json`.
 * Maps catalog kind + slug → attribution name and upstream source URL.
 */
import creditsData from '../../../../credits.json';
import type { CatalogKind, Credit } from './types';

type CreditKind = Exclude<CatalogKind, 'doc'>;

type CreditsFile = {
	description?: string;
	credits: Record<CreditKind, Record<string, Credit>>;
};

const data = creditsData as CreditsFile;

export function getCredit(kind: CreditKind, slug: string): Credit | null {
	const entry = data.credits[kind]?.[slug];
	if (!entry?.name || !entry?.source) return null;
	return { name: entry.name, source: entry.source };
}

export function listCredits(kind?: CreditKind): Array<Credit & { kind: CreditKind; slug: string }> {
	const kinds: CreditKind[] = kind ? [kind] : ['skill', 'agent', 'command'];
	const out: Array<Credit & { kind: CreditKind; slug: string }> = [];
	for (const k of kinds) {
		for (const [slug, credit] of Object.entries(data.credits[k] ?? {})) {
			out.push({ kind: k, slug, name: credit.name, source: credit.source });
		}
	}
	return out;
}
