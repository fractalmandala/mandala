import type { DesignNode, PageDocument } from "$lib/domain";

export type ExportFormat = "svelte" | "svelte-inline" | "sass" | "html";
export type LayoutMode = "auto" | "absolute";
export type NamingStrategy = "node-name" | "prefix";

export interface ExportOptions {
	format: ExportFormat;
	layout: LayoutMode;
	naming: NamingStrategy;
	classPrefix: string;
	extractTokens: boolean;
	includeImages: "inline" | "reference";
}

export interface ExportFile {
	name: string;
	content: string;
	language: "svelte" | "sass" | "css" | "html";
}

export interface ExportResult {
	files: ExportFile[];
	tokens: Record<string, string>;
}

export const defaultExportOptions: ExportOptions = {
	format: "svelte",
	layout: "auto",
	naming: "node-name",
	classPrefix: "",
	extractTokens: false,
	includeImages: "reference"
};

export interface StyleMap {
	[key: string]: string;
}

export interface LayoutInfo {
	type: "flex-row" | "flex-column" | "absolute";
	gap: number;
	padding: { top: number; right: number; bottom: number; left: number };
	alignItems: "start" | "center" | "end" | "stretch";
	justifyContent: "start" | "center" | "end" | "space-between";
}

export interface ResolvedNode {
	node: DesignNode;
	className: string;
	styles: StyleMap;
	layout: LayoutInfo | null;
	children: ResolvedNode[];
	element: string;
	selfClosing: boolean;
	inlineSvg: string | null;
}

export function resolveBounds(
	_document: PageDocument,
	node: DesignNode
): { x: number; y: number; width: number; height: number } {
	return { x: node.x, y: node.y, width: node.width, height: node.height };
}
