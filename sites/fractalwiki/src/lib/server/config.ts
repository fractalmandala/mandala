import fs from 'node:fs';
import path from 'node:path';

export interface SiteInfo {
	title: string;
	subtitle: string;
	description: string;
	vaultRootPath: string;
	defaultTheme: 'light' | 'dark';
	githubUrl?: string;
}

export interface FeaturesConfig {
	enableSearch: boolean;
	enableTableOfContents: boolean;
	enableFrontmatterInspector: boolean;
	enableWikiLinks: boolean;
	showTimestamp: boolean;
	showSources: boolean;
}

export interface SectionConfig {
	id: string;
	title: string;
	icon: string;
	description: string;
	sourcePath: string;
	indexFile?: string;
	showInSidebar: boolean;
	order: number;
}

export interface GroupConfig {
	id: string;
	title: string;
	icon: string;
	description: string;
	order: number;
	sections: SectionConfig[];
}

export interface SiteConfig {
	site: SiteInfo;
	features: FeaturesConfig;
	groups: GroupConfig[];
}

const CONFIG_PATH = path.resolve(process.cwd(), 'site-config.json');

let cachedConfig: SiteConfig | null = null;

export function getSiteConfig(): SiteConfig {
	if (cachedConfig && process.env.NODE_ENV === 'production') {
		return cachedConfig;
	}

	try {
		const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
		const parsed = JSON.parse(raw) as SiteConfig;
		cachedConfig = parsed;
		return parsed;
	} catch (err) {
		console.error('Failed to load site-config.json:', err);
		// Return sensible fallback
		return {
			site: {
				title: 'Fractalwiki',
				subtitle: 'Knowledge Base',
				description: 'Documentation vault',
				vaultRootPath: '/Users/amrit/100cabinet/10wiki',
				defaultTheme: 'dark'
			},
			features: {
				enableSearch: true,
				enableTableOfContents: true,
				enableFrontmatterInspector: true,
				enableWikiLinks: true,
				showTimestamp: true,
				showSources: true
			},
			groups: []
		};
	}
}
