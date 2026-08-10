import type { DesignNode, PageDocument } from "$lib/domain";
import type {
	ExportOptions,
	ExportResult,
	ExportFile,
	ResolvedNode,
	StyleMap,
	LayoutInfo
} from "./types";
import { defaultExportOptions } from "./types";
import { resolveAllNames } from "./name-resolver";
import { mapNodeStyles, needsInlineSvg, generateInlineSvg, elementForNode } from "./style-mapper";
import { analyzeLayout } from "./layout-analyzer";
import { emitSass, emitFlatSass, emitCssCustomProperties } from "./sass-emitter";
import { emitSvelteComponent, emitSvelteMarkup, emitHtmlOutput } from "./svelte-emitter";

// ─── Token extraction ────────────────────────────────────────────────────────

function extractTokens(document: PageDocument): Record<string, string> {
	const colors = new Map<string, number>();
	const sizes = new Map<number, number>();

	function walkNode(node: DesignNode) {
		// Collect fill colors
		if (node.fill?.type === "solid") {
			const key = node.fill.color;
			colors.set(key, (colors.get(key) ?? 0) + 1);
		}
		// Collect stroke colors
		if (node.stroke) {
			const key = node.stroke.color;
			colors.set(key, (colors.get(key) ?? 0) + 1);
		}
		// Collect font sizes
		if (node.type === "text") {
			const fs = node.fontSize;
			sizes.set(fs, (sizes.get(fs) ?? 0) + 1);
		}
		// Recurse
		if (node.type === "frame" || node.type === "group") {
			for (const childId of node.childIds) {
				const child = document.nodes[childId];
				if (child) walkNode(child);
			}
		}
	}

	for (const id of document.rootIds) {
		const node = document.nodes[id];
		if (node) walkNode(node);
	}

	const tokens: Record<string, string> = {};

	// Only extract colors used 2+ times
	let colorIndex = 0;
	for (const [color, count] of [...colors].sort((a, b) => b[1] - a[1])) {
		if (count < 2) break;
		tokens[`color-${colorIndex}`] = color;
		colorIndex++;
		if (colorIndex >= 12) break;
	}

	return tokens;
}

// ─── Resolve tree ────────────────────────────────────────────────────────────

function resolveTree(
	document: PageDocument,
	nodeIds: string[],
	classNames: Map<string, string>,
	forceAbsolute: boolean
): ResolvedNode[] {
	return nodeIds
		.map((id) => document.nodes[id])
		.filter((n): n is DesignNode => Boolean(n) && n.visible)
		.map((node) => resolveNode(document, node, classNames, forceAbsolute));
}

function resolveNode(
	document: PageDocument,
	node: DesignNode,
	classNames: Map<string, string>,
	forceAbsolute: boolean
): ResolvedNode {
	const className = classNames.get(node.id) ?? "element";
	const styles = mapNodeStyles(node);
	const { element, selfClosing } = elementForNode(node);

	// Layout analysis for containers
	let layout: LayoutInfo | null = null;
	if (!forceAbsolute && (node.type === "frame" || node.type === "group")) {
		layout = analyzeLayout(document, node);
	}

	// If this node uses inline SVG
	let inlineSvg: string | null = null;
	if (needsInlineSvg(node)) {
		inlineSvg = generateInlineSvg(node);
	}

	// Recurse into children
	const children =
		node.type === "frame" || node.type === "group"
			? resolveTree(document, node.childIds, classNames, forceAbsolute)
			: [];

	return {
		node,
		className,
		styles,
		layout,
		children,
		element,
		selfClosing,
		inlineSvg
	};
}

// ─── Root bounds helper ──────────────────────────────────────────────────────

function computeRootBounds(document: PageDocument, ids: string[]): {
	x: number;
	y: number;
	width: number;
	height: number;
} | null {
	const nodes = ids.map((id) => document.nodes[id]).filter(Boolean) as DesignNode[];
	if (!nodes.length) return null;

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const node of nodes) {
		minX = Math.min(minX, node.x);
		minY = Math.min(minY, node.y);
		maxX = Math.max(maxX, node.x + node.width);
		maxY = Math.max(maxY, node.y + node.height);
	}

	return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function generateCode(
	document: PageDocument,
	options: Partial<ExportOptions> = {}
): ExportResult {
	const opts = { ...defaultExportOptions, ...options };
	const classNames = resolveAllNames(document, opts.naming, opts.classPrefix);
	const forceAbsolute = opts.layout === "absolute";
	const tokens = opts.extractTokens ? extractTokens(document) : {};

	// Resolve the full tree
	const resolvedRoots = resolveTree(document, document.rootIds, classNames, forceAbsolute);

	// Generate output based on format
	const files: ExportFile[] = [];

	if (opts.format === "svelte") {
		const sassContent = emitSass(resolvedRoots, { nested: true });
		const componentContent = emitSvelteComponent(resolvedRoots, {
			componentName: "ExportedDesign",
			styleContent: sassContent
		});
		files.push({
			name: "ExportedDesign.svelte",
			content: componentContent,
			language: "svelte"
		});
	} else if (opts.format === "svelte-inline") {
		const sassContent = emitSass(resolvedRoots, { nested: true });
		const componentContent = emitSvelteComponent(resolvedRoots, {
			componentName: "ExportedDesign",
			styleContent: sassContent
		});
		files.push({
			name: "ExportedDesign.svelte",
			content: componentContent,
			language: "svelte"
		});
	} else if (opts.format === "sass") {
		const sassContent = emitFlatSass(resolvedRoots);
		files.push({
			name: "ExportedDesign.sass",
			content: sassContent,
			language: "sass"
		});
		if (Object.keys(tokens).length) {
			files.push({
				name: "tokens.css",
				content: emitCssCustomProperties(tokens),
				language: "css"
			});
		}
	} else if (opts.format === "html") {
		const cssContent = emitFlatSass(resolvedRoots);
		const { html, css } = emitHtmlOutput(resolvedRoots, cssContent);
		files.push({ name: "index.html", content: html, language: "html" });
		files.push({ name: "styles.css", content: css, language: "css" });
	}

	return { files, tokens };
}

export function generatePreview(
	document: PageDocument,
	options: Partial<ExportOptions> = {}
): string {
	const opts = { ...defaultExportOptions, ...options, format: "svelte" as const };
	const result = generateCode(document, opts);
	return result.files[0]?.content ?? "";
}
