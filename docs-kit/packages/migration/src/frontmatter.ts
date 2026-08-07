import {
	parseDocsFrontmatter,
	serializeDocsFrontmatter,
	type DocsFrontmatterValue,
	type ParsedDocsFrontmatter
} from '@docs-kit/core';

export type FrontmatterValue = DocsFrontmatterValue;
export type ParsedFrontmatter = ParsedDocsFrontmatter;

/** Re-exported from core so migration and the compiler read frontmatter identically. */
export const parseFrontmatter = parseDocsFrontmatter;
export const serializeFrontmatter = serializeDocsFrontmatter;
