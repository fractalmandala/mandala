import type { IconName } from './types';

export function fileTypeIconName(path: string, kind?: string): IconName {
	if (kind === 'folder') return 'folder';
	const lower = path.toLowerCase();
	if (lower.endsWith('.mdx')) return 'code';
	if (lower.endsWith('.md') || lower.endsWith('skill.md')) return 'markdown';
	if (lower.endsWith('.json')) return 'json';
	if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
	if (lower.endsWith('.mjs') || lower.endsWith('.js') || lower.endsWith('.ts')) return 'code';
	if (/\.(png|jpe?g|gif|webp|svg|avif)$/i.test(lower)) return 'image';
	if (lower.includes('mermaid')) return 'mermaid';
	if (kind === 'asset') return 'image';
	if (kind === 'migration') return 'activity';
	return 'file';
}
