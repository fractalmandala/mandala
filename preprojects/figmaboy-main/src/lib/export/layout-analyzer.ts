import type { DesignNode, PageDocument } from "$lib/domain";
import type { LayoutInfo } from "./types";

interface ChildBounds {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

function getChildrenBounds(document: PageDocument, container: DesignNode): ChildBounds[] {
	if (container.type !== "frame" && container.type !== "group") return [];
	return container.childIds
		.map((id) => document.nodes[id])
		.filter((n): n is DesignNode => Boolean(n) && n.visible)
		.map((n) => ({
			id: n.id,
			x: n.x,
			y: n.y,
			width: n.width,
			height: n.height
		}));
}

function overlaps(a: ChildBounds, b: ChildBounds, axis: "x" | "y"): boolean {
	if (axis === "x") {
		return a.x < b.x + b.width && a.x + a.width > b.x;
	}
	return a.y < b.y + b.height && a.y + a.height > b.y;
}

function hasAnyOverlap(children: ChildBounds[]): boolean {
	for (let i = 0; i < children.length; i++) {
		for (let j = i + 1; j < children.length; j++) {
			if (overlaps(children[i], children[j], "x") && overlaps(children[i], children[j], "y")) {
				return true;
			}
		}
	}
	return false;
}

function sortedByX(children: ChildBounds[]): ChildBounds[] {
	return [...children].sort((a, b) => a.x - b.x);
}

function sortedByY(children: ChildBounds[]): ChildBounds[] {
	return [...children].sort((a, b) => a.y - b.y);
}

function computeGaps(sorted: ChildBounds[], axis: "x" | "y"): number[] {
	const gaps: number[] = [];
	for (let i = 1; i < sorted.length; i++) {
		const prev = sorted[i - 1];
		const curr = sorted[i];
		if (axis === "x") {
			gaps.push(curr.x - (prev.x + prev.width));
		} else {
			gaps.push(curr.y - (prev.y + prev.height));
		}
	}
	return gaps;
}

function isUniformGaps(gaps: number[], tolerance: number): boolean {
	if (!gaps.length) return true;
	const min = Math.min(...gaps);
	const max = Math.max(...gaps);
	return max - min <= tolerance;
}

function detectAlignment(
	children: ChildBounds[],
	crossAxis: "x" | "y",
	containerSize: number
): "start" | "center" | "end" | "stretch" {
	if (!children.length) return "stretch";

	const positions = children.map((c) => (crossAxis === "x" ? c.x : c.y));
	const sizes = children.map((c) => (crossAxis === "x" ? c.width : c.height));

	const minPos = Math.min(...positions);
	const maxEnd = Math.max(...positions.map((p, i) => p + sizes[i]));

	// Check stretch: all children span the full cross-axis
	const allSpan = children.every((c) => {
		const size = crossAxis === "x" ? c.width : c.height;
		return Math.abs(size - containerSize) < 2;
	});
	if (allSpan) return "stretch";

	// Check start alignment
	const allStart = positions.every((p) => Math.abs(p - minPos) < 2);
	if (allStart && minPos < 2) return "start";

	// Check end alignment
	const allEnd = positions.every((p, i) => Math.abs(p + sizes[i] - maxEnd) < 2);
	if (allEnd && Math.abs(maxEnd - containerSize) < 2) return "end";

	// Check center alignment
	const centers = positions.map((p, i) => p + sizes[i] / 2);
	const containerCenter = containerSize / 2;
	const allCenter = centers.every((c) => Math.abs(c - containerCenter) < 4);
	if (allCenter) return "center";

	return "start";
}

function detectJustify(
	sorted: ChildBounds[],
	axis: "x" | "y",
	containerSize: number
): "start" | "center" | "end" | "space-between" {
	if (!sorted.length) return "start";

	const positions = sorted.map((c) => (axis === "x" ? c.x : c.y));
	const sizes = sorted.map((c) => (axis === "x" ? c.width : c.height));

	const firstPos = positions[0];
	const lastEnd = positions[positions.length - 1] + sizes[positions.length - 1];

	// Check space-between: first child at start, last at end, even gaps
	if (firstPos < 2 && Math.abs(lastEnd - containerSize) < 2) {
		const gaps = computeGaps(sorted, axis);
		if (isUniformGaps(gaps, 4)) return "space-between";
	}

	// Check center
	const totalContent = sorted.reduce((sum, c) => sum + (axis === "x" ? c.width : c.height), 0);
	const contentStart = firstPos;
	const contentEnd = lastEnd;
	const margin = (containerSize - (contentEnd - contentStart)) / 2;
	if (Math.abs(contentStart - margin) < 4) return "center";

	// Check end
	if (Math.abs(firstPos - (containerSize - totalContent)) < 4 && firstPos > 4) return "end";

	return "start";
}

function detectPadding(
	children: ChildBounds[],
	containerWidth: number,
	containerHeight: number
): { top: number; right: number; bottom: number; left: number } {
	if (!children.length) return { top: 0, right: 0, bottom: 0, left: 0 };

	const minX = Math.min(...children.map((c) => c.x));
	const minY = Math.min(...children.map((c) => c.y));
	const maxX = Math.max(...children.map((c) => c.x + c.width));
	const maxY = Math.max(...children.map((c) => c.y + c.height));

	return {
		top: Math.max(0, Math.round(minY)),
		right: Math.max(0, Math.round(containerWidth - maxX)),
		bottom: Math.max(0, Math.round(containerHeight - maxY)),
		left: Math.max(0, Math.round(minX))
	};
}

export function analyzeLayout(
	document: PageDocument,
	container: DesignNode
): LayoutInfo {
	const children = getChildrenBounds(document, container);
	const containerW = container.width;
	const containerH = container.height;

	// No children or single child: default to absolute
	if (children.length === 0) {
		return {
			type: "absolute",
			gap: 0,
			padding: { top: 0, right: 0, bottom: 0, left: 0 },
			alignItems: "stretch",
			justifyContent: "start"
		};
	}

	// If any children overlap, use absolute positioning
	if (hasAnyOverlap(children)) {
		return {
			type: "absolute",
			gap: 0,
			padding: detectPadding(children, containerW, containerH),
			alignItems: "start",
			justifyContent: "start"
		};
	}

	// Try horizontal (row) layout
	const byX = sortedByX(children);
	const xGaps = computeGaps(byX, "x");
	const noXOverlap = xGaps.every((g) => g >= -1);

	if (noXOverlap && isUniformGaps(xGaps, 4)) {
		const avgGap = xGaps.length ? Math.round(xGaps.reduce((a, b) => a + b, 0) / xGaps.length) : 0;
		return {
			type: "flex-row",
			gap: Math.max(0, avgGap),
			padding: detectPadding(children, containerW, containerH),
			alignItems: detectAlignment(children, "y", containerH),
			justifyContent: detectJustify(byX, "x", containerW)
		};
	}

	// Try vertical (column) layout
	const byY = sortedByY(children);
	const yGaps = computeGaps(byY, "y");
	const noYOverlap = yGaps.every((g) => g >= -1);

	if (noYOverlap && isUniformGaps(yGaps, 4)) {
		const avgGap = yGaps.length ? Math.round(yGaps.reduce((a, b) => a + b, 0) / yGaps.length) : 0;
		return {
			type: "flex-column",
			gap: Math.max(0, avgGap),
			padding: detectPadding(children, containerW, containerH),
			alignItems: detectAlignment(children, "x", containerW),
			justifyContent: detectJustify(byY, "y", containerH)
		};
	}

	// Fallback: absolute positioning
	return {
		type: "absolute",
		gap: 0,
		padding: detectPadding(children, containerW, containerH),
		alignItems: "start",
		justifyContent: "start"
	};
}
