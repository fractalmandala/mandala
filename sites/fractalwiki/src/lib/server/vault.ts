import fs from 'node:fs';
import path from 'node:path';
import { getSiteConfig, type GroupConfig, type SectionConfig } from './config';

export interface DocFrontmatter {
	title: string;
	description?: string;
	knowledgeBank?: string[];
	tags?: string[];
	sources?: string[];
	related?: string[];
	timestamp?: string;
	source?: string;
	[key: string]: unknown;
}

export interface HeadingItem {
	id: string;
	text: string;
	level: number;
}

export interface VaultDoc {
	slug: string; // primary site route slug, e.g. "wiki-ai/sources/agentic-full-framework"
	filename: string; // e.g. "agentic-full-framework.md"
	groupId: string;
	groupTitle: string;
	sectionId: string;
	sectionTitle: string;
	sectionSourcePath: string; // e.g. "fractal-wiki/wiki/sources"
	relativeDocPath: string; // e.g. "agentic-full-framework" or "subfolder/topic"
	frontmatter: DocFrontmatter;
	content: string;
	headings: HeadingItem[];
}

export interface VaultNavItem {
	title: string;
	slug: string;
	description?: string;
	tags?: string[];
	isIndex?: boolean;
}

export interface VaultNavSection {
	id: string;
	title: string;
	icon: string;
	description: string;
	items: VaultNavItem[];
}

export interface VaultNavGroup {
	id: string;
	title: string;
	icon: string;
	description: string;
	order: number;
	sections: VaultNavSection[];
}

// Simple YAML frontmatter parser for vault .md files
export function parseFrontmatter(rawContent: string): { frontmatter: DocFrontmatter; content: string } {
	const frontmatterMatch = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!frontmatterMatch) {
		return { frontmatter: { title: 'Untitled' }, content: rawContent };
	}

	const yamlBlock = frontmatterMatch[1];
	const content = rawContent.slice(frontmatterMatch[0].length);
	const frontmatter: DocFrontmatter = { title: 'Untitled' };

	let currentKey: string | null = null;

	const lines = yamlBlock.split(/\r?\n/);
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		// Key: value line
		const keyValMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
		if (keyValMatch) {
			const key = keyValMatch[1];
			const val = keyValMatch[2].trim();

			if (val === '' || val === '~') {
				currentKey = key;
				frontmatter[key] = [];
			} else if (val.startsWith('[') && val.endsWith(']')) {
				currentKey = null;
				frontmatter[key] = val
					.slice(1, -1)
					.split(',')
					.map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
					.filter(Boolean);
			} else {
				currentKey = null;
				frontmatter[key] = val.replace(/^['"]|['"]$/g, '');
			}
		} else if (trimmed.startsWith('- ') && currentKey) {
			// Array item line under currentKey
			const itemVal = trimmed.slice(2).trim().replace(/^['"]|['"]$/g, '');
			if (!Array.isArray(frontmatter[currentKey])) {
				frontmatter[currentKey] = [];
			}
			(frontmatter[currentKey] as string[]).push(itemVal);
		}
	}

	if (!frontmatter.title) {
		frontmatter.title = 'Untitled';
	}

	return { frontmatter, content };
}

// Extract H1, H2, H3 headings for Table of Contents
export function extractHeadings(content: string): HeadingItem[] {
	const headings: HeadingItem[] = [];
	const headingRegex = /^(#{1,3})\s+(.+)$/gm;
	let match: RegExpExecArray | null;

	while ((match = headingRegex.exec(content)) !== null) {
		const level = match[1].length;
		const text = match[2].replace(/\*|_|`/g, '').trim();
		const id = text
			.toLowerCase()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-');
		headings.push({ id, text, level });
	}

	return headings;
}

// Cache all documents in memory for fast lookup
let cachedDocs: Map<string, VaultDoc> | null = null;
let cachedNav: VaultNavGroup[] | null = null;

export function getAllDocs(): Map<string, VaultDoc> {
	if (cachedDocs && process.env.NODE_ENV === 'production') {
		return cachedDocs;
	}

	const config = getSiteConfig();
	const vaultRoot = config.site.vaultRootPath;
	const docsMap = new Map<string, VaultDoc>();

	for (const group of config.groups) {
		for (const section of group.sections) {
			const sectionPath = path.join(vaultRoot, section.sourcePath);
			if (!fs.existsSync(sectionPath)) continue;

			scanDirectory(sectionPath, sectionPath, group, section, docsMap);
		}
	}

	cachedDocs = docsMap;
	return docsMap;
}

function scanDirectory(
	basePath: string,
	currentDir: string,
	group: GroupConfig,
	section: SectionConfig,
	docsMap: Map<string, VaultDoc>
) {
	const entries = fs.readdirSync(currentDir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(currentDir, entry.name);

		if (entry.isDirectory()) {
			// Skip hidden or build directories
			if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
			scanDirectory(basePath, fullPath, group, section, docsMap);
		} else if (entry.isFile() && entry.name.endsWith('.md')) {
			const relativeFilePath = path.relative(basePath, fullPath);
			let docSlugWithoutExt = relativeFilePath.replace(/\.md$/, '');
			
			// Handle index files
			let relativeDocPath = docSlugWithoutExt;
			if (entry.name === 'INDEX.md' || entry.name === 'CONTENTS.md') {
				const parentDir = path.dirname(relativeFilePath);
				docSlugWithoutExt = parentDir === '.' ? '' : parentDir;
				relativeDocPath = docSlugWithoutExt || 'index';
			}

			// Clean group ID for URL routing (e.g. "fractal-wiki/wiki" -> "fractal-wiki-wiki" or "wiki-ai")
			const cleanGroupId = group.id.replace(/\//g, '-');

			// Primary route slug: cleanGroupId/section.id/docPath
			const fullSlugParts = [cleanGroupId, section.id];
			if (docSlugWithoutExt) {
				fullSlugParts.push(docSlugWithoutExt);
			}
			const fullSlug = fullSlugParts.join('/');

			const rawContent = fs.readFileSync(fullPath, 'utf-8');
			const { frontmatter, content } = parseFrontmatter(rawContent);
			const headings = extractHeadings(content);

			const doc: VaultDoc = {
				slug: fullSlug,
				filename: entry.name,
				groupId: group.id,
				groupTitle: group.title,
				sectionId: section.id,
				sectionTitle: section.title,
				sectionSourcePath: section.sourcePath,
				relativeDocPath,
				frontmatter,
				content,
				headings
			};

			docsMap.set(fullSlug, doc);
		}
	}
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-');
}

/**
 * Smart Vault Resolver:
 * Finds a document without recursive calls.
 * Matches URL-encoded paths, spaces, case-insensitive filenames, titles, and path variations.
 */
export function getDocBySlug(rawSlug: string): VaultDoc | null {
	const docsMap = getAllDocs();
	if (!rawSlug) return null;

	let decoded = rawSlug;
	try {
		decoded = decodeURIComponent(rawSlug);
	} catch {
		// Ignore decode error
	}

	const clean = decoded.replace(/^\/|\/$/g, '').replace(/\.md$/, '').trim();
	if (!clean) return null;

	// 1. Direct match in docsMap
	if (docsMap.has(clean)) {
		return docsMap.get(clean)!;
	}

	// 2. Candidate strings to test
	const candidates = [clean];
	if (!clean.endsWith('/index')) {
		candidates.push(`${clean}/index`);
	} else {
		candidates.push(clean.replace(/\/index$/, ''));
	}

	// 3. Single-pass non-recursive search across all indexed docs
	for (const doc of docsMap.values()) {
		for (const cand of candidates) {
			const candLower = cand.toLowerCase();
			const candSlugified = slugify(cand);

			// Match primary slug
			if (
				cand === doc.slug ||
				candLower === doc.slug.toLowerCase() ||
				(candSlugified && candSlugified === slugify(doc.slug))
			) {
				return doc;
			}

			// Match raw group.id / section.id / relativeDocPath
			const rawGroupSlug = [doc.groupId, doc.sectionId, doc.relativeDocPath].filter(Boolean).join('/');
			if (
				cand === rawGroupSlug ||
				candLower === rawGroupSlug.toLowerCase() ||
				(candSlugified && candSlugified === slugify(rawGroupSlug))
			) {
				return doc;
			}

			// Match sectionId / relativeDocPath
			const sectionDocSlug = [doc.sectionId, doc.relativeDocPath].filter(Boolean).join('/');
			if (
				cand === sectionDocSlug ||
				candLower === sectionDocSlug.toLowerCase() ||
				(candSlugified && candSlugified === slugify(sectionDocSlug))
			) {
				return doc;
			}

			// Match sectionSourcePath / relativeDocPath
			const sourcePathDocSlug = [doc.sectionSourcePath, doc.relativeDocPath].filter(Boolean).join('/');
			if (
				cand === sourcePathDocSlug ||
				candLower === sourcePathDocSlug.toLowerCase() ||
				(candSlugified && candSlugified === slugify(sourcePathDocSlug))
			) {
				return doc;
			}

			// Match relativeDocPath alone or filename without extension
			const docFilenameNoExt = doc.filename.replace(/\.md$/, '');
			if (
				cand === doc.relativeDocPath ||
				candLower === doc.relativeDocPath.toLowerCase() ||
				(candSlugified && candSlugified === slugify(doc.relativeDocPath)) ||
				cand === docFilenameNoExt ||
				candLower === docFilenameNoExt.toLowerCase() ||
				(candSlugified && candSlugified === slugify(docFilenameNoExt))
			) {
				return doc;
			}

			// Match frontmatter title
			if (
				doc.frontmatter.title &&
				(cand === doc.frontmatter.title ||
					candLower === doc.frontmatter.title.toLowerCase() ||
					(candSlugified && candSlugified === slugify(doc.frontmatter.title)))
			) {
				return doc;
			}
		}
	}

	return null;
}

export function getNavGroups(): VaultNavGroup[] {
	if (cachedNav && process.env.NODE_ENV === 'production') {
		return cachedNav;
	}

	const config = getSiteConfig();
	const docsMap = getAllDocs();

	const navGroups: VaultNavGroup[] = config.groups.map((group) => {
		const navSections: VaultNavSection[] = group.sections
			.filter((s) => s.showInSidebar)
			.map((section) => {
				const sectionItems: VaultNavItem[] = [];

				for (const [slug, doc] of docsMap.entries()) {
					if (doc.groupId === group.id && doc.sectionId === section.id) {
						sectionItems.push({
							title: doc.frontmatter.title || doc.relativeDocPath,
							slug,
							description: doc.frontmatter.description,
							tags: doc.frontmatter.tags,
							isIndex: doc.filename === 'INDEX.md' || doc.filename === 'CONTENTS.md'
						});
					}
				}

				// Sort items: Index file first, then alphabetical by title
				sectionItems.sort((a, b) => {
					if (a.isIndex) return -1;
					if (b.isIndex) return 1;
					return a.title.localeCompare(b.title);
				});

				return {
					id: section.id,
					title: section.title,
					icon: section.icon,
					description: section.description,
					items: sectionItems
				};
			});

		return {
			id: group.id,
			title: group.title,
			icon: group.icon,
			description: group.description,
			order: group.order,
			sections: navSections
		};
	});

	cachedNav = navGroups;
	return navGroups;
}

/**
 * Smart Link Resolver:
 * Resolves markdown links [Text](target) and wiki links [[target]]
 * to their real canonical site routes using getDocBySlug().
 */
export function resolveWikiLinks(content: string, currentGroupId: string, currentSectionId: string): string {
	// 1. Resolve markdown links like [Title](target)
	let resolved = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, target) => {
		if (target.startsWith('http://') || target.startsWith('https://') || target.startsWith('#')) {
			return match;
		}

		const cleanTarget = target.trim();
		const doc = getDocBySlug(cleanTarget);
		if (doc) {
			return `[${linkText}](/${doc.slug})`;
		}

		// Fallback: strip leading slash and .md
		const cleanFallback = cleanTarget.replace(/^\/|\/$/g, '').replace(/\.md$/, '');
		return `[${linkText}](/${cleanFallback})`;
	});

	// 2. Resolve wiki links [[target|alias]] or [[target]]
	resolved = resolved.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (match, target, alias) => {
		const label = alias || target;
		const cleanTarget = target.trim();
		const doc = getDocBySlug(cleanTarget);
		if (doc) {
			return `[${label}](/${doc.slug})`;
		}

		const cleanFallback = cleanTarget.replace(/^\/|\/$/g, '').replace(/\.md$/, '');
		return `[${label}](/${cleanFallback})`;
	});

	return resolved;
}
