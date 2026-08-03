export type CatalogKind = 'skill' | 'agent' | 'command' | 'doc';

/** Attribution for a skill, agent, or command (from repo-root credits.json). */
export interface Credit {
	/** Credit / project name (e.g. "ECC", "Superpowers") */
	name: string;
	/** Upstream source or GitHub URL */
	source: string;
}

export interface CatalogEntry {
	kind: CatalogKind;
	slug: string;
	title: string;
	description: string;
	descriptionHtml: string;
	href: string;
	/** Markdown body without frontmatter */
	body: string;
}

export interface CatalogSummary {
	kind: CatalogKind;
	slug: string;
	title: string;
	description: string;
	descriptionHtml: string;
	href: string;
}

export interface SearchResult {
	kind: CatalogKind | 'boss';
	slug: string;
	title: string;
	description: string;
	href: string;
}

export interface ArmoryStats {
	skills: number;
	agents: number;
	commands: number;
	bosses: number;
	orchestrators: number;
}

export interface BossSummary {
	id: string;
	name: string;
	mission: string;
	href: string;
}
