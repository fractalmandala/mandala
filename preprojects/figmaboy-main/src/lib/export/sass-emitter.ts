import type { StyleMap, LayoutInfo, ResolvedNode } from "./types";

function indent(depth: number): string {
	return "\t".repeat(depth);
}

function emitStyleBlock(className: string, styles: StyleMap, depth: number): string {
	const entries = Object.entries(styles).filter(([, v]) => v !== "" && v !== undefined);
	if (!entries.length) return `${indent(depth)}.${className}`;
	const lines = [`${indent(depth)}.${className}`];
	for (const [prop, value] of entries) {
		lines.push(`${indent(depth + 1)}${prop}: ${value}`);
	}
	return lines.join("\n");
}

function emitLayoutOverrides(layout: LayoutInfo, depth: number): string[] {
	const lines: string[] = [];
	const tab = indent(depth);

	if (layout.type === "flex-row") {
		lines.push(`${tab}display: flex`);
		lines.push(`${tab}flex-direction: row`);
		if (layout.gap > 0) lines.push(`${tab}gap: ${layout.gap}px`);
		if (layout.alignItems !== "stretch") {
			lines.push(`${tab}align-items: ${flexAlignValue(layout.alignItems)}`);
		}
		if (layout.justifyContent !== "start") {
			lines.push(`${tab}justify-content: ${flexJustifyValue(layout.justifyContent)}`);
		}
	} else if (layout.type === "flex-column") {
		lines.push(`${tab}display: flex`);
		lines.push(`${tab}flex-direction: column`);
		if (layout.gap > 0) lines.push(`${tab}gap: ${layout.gap}px`);
		if (layout.alignItems !== "stretch") {
			lines.push(`${tab}align-items: ${flexAlignValue(layout.alignItems)}`);
		}
		if (layout.justifyContent !== "start") {
			lines.push(`${tab}justify-content: ${flexJustifyValue(layout.justifyContent)}`);
		}
	}

	return lines;
}

function flexAlignValue(align: string): string {
	switch (align) {
		case "start": return "flex-start";
		case "end": return "flex-end";
		case "center": return "center";
		case "stretch": return "stretch";
		default: return align;
	}
}

function flexJustifyValue(justify: string): string {
	switch (justify) {
		case "start": return "flex-start";
		case "end": return "flex-end";
		case "center": return "center";
		case "space-between": return "space-between";
		default: return justify;
	}
}

function stripPositionProps(styles: StyleMap, isFlexChild: boolean): StyleMap {
	if (isFlexChild) {
		const { position, left, top, ...rest } = styles;
		return rest;
	}
	return { ...styles };
}

export function emitSass(
	resolvedRoots: ResolvedNode[],
	options: { nested?: boolean } = {}
): string {
	const nested = options.nested ?? true;
	const parts: string[] = [];

	for (const root of resolvedRoots) {
		parts.push(emitResolvedNode(root, 0, nested, false));
	}

	return parts.join("\n\n");
}

function emitResolvedNode(
	resolved: ResolvedNode,
	depth: number,
	nested: boolean,
	parentIsFlex: boolean
): string {
	const { className, styles, layout, children } = resolved;
	const isFlexChild = parentIsFlex && resolved.node.type !== "line" && resolved.node.type !== "arrow";
	const cleanStyles = stripPositionProps(styles, isFlexChild);

	const lines: string[] = [];
	const tab = indent(depth);

	// Class declaration
	lines.push(`${tab}.${className}`);

	// Layout overrides for flex containers
	if (layout && (layout.type === "flex-row" || layout.type === "flex-column")) {
		const overrides = emitLayoutOverrides(layout, depth + 1);
		lines.push(...overrides);
	}

	// Style properties
	const entries = Object.entries(cleanStyles).filter(([, v]) => v !== "" && v !== undefined);
	for (const [prop, value] of entries) {
		// Skip position-related props for flex children
		if (isFlexChild && (prop === "position" || prop === "left" || prop === "top")) continue;
		lines.push(`${indent(depth + 1)}${prop}: ${value}`);
	}

	// Children
	if (nested && children.length) {
		const childIsFlex = layout?.type === "flex-row" || layout?.type === "flex-column";
		for (const child of children) {
			lines.push("");
			lines.push(emitResolvedNode(child, depth + 1, nested, childIsFlex));
		}
	}

	return lines.join("\n");
}

export function emitFlatSass(resolvedRoots: ResolvedNode[]): string {
	const parts: string[] = [];

	for (const root of resolvedRoots) {
		collectFlat(root, parts, false);
	}

	return parts.join("\n\n");
}

function collectFlat(resolved: ResolvedNode, parts: string[], parentIsFlex: boolean): void {
	const { className, styles, layout } = resolved;
	const isFlexChild = parentIsFlex;
	const cleanStyles = stripPositionProps(styles, isFlexChild);

	const lines: string[] = [];
	lines.push(`.${className}`);

	if (layout && (layout.type === "flex-row" || layout.type === "flex-column")) {
		const overrides = emitLayoutOverrides(layout, 1);
		lines.push(...overrides);
	}

	const entries = Object.entries(cleanStyles).filter(([, v]) => v !== "" && v !== undefined);
	for (const [prop, value] of entries) {
		if (isFlexChild && (prop === "position" || prop === "left" || prop === "top")) continue;
		lines.push(`\t${prop}: ${value}`);
	}

	parts.push(lines.join("\n"));

	const childIsFlex = layout?.type === "flex-row" || layout?.type === "flex-column";
	for (const child of resolved.children) {
		collectFlat(child, parts, childIsFlex);
	}
}

export function emitCssCustomProperties(tokens: Record<string, string>): string {
	const lines = [":root"];
	for (const [name, value] of Object.entries(tokens)) {
		lines.push(`\t--${name}: ${value}`);
	}
	return lines.join("\n");
}
