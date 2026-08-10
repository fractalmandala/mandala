import type {
	DesignNode,
	Paint,
	StrokeStyle,
	ShadowStyle,
	LayerEffect,
	GradientStop,
	TextNode
} from "$lib/domain";
import type { StyleMap } from "./types";

// ─── colour helpers ──────────────────────────────────────────────────────────

function hexToRgba(hex: string, opacity: number): string {
	const m = /^#([0-9a-f]{6})$/i.exec(hex);
	if (!m) return hex;
	const v = Number.parseInt(m[1], 16);
	const r = (v >> 16) & 255;
	const g = (v >> 8) & 255;
	const b = v & 255;
	return opacity >= 1
		? `rgb(${r}, ${g}, ${b})`
		: `rgba(${r}, ${g}, ${b}, ${round2(opacity)})`;
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

function stopsCss(stops: GradientStop[]): string {
	return stops
		.map((s) => `${hexToRgba(s.color, s.opacity)} ${round2(s.offset * 100)}%`)
		.join(", ");
}

// ─── fill ────────────────────────────────────────────────────────────────────

function paintToBackground(paint: Paint | null): string | null {
	if (!paint) return null;
	if (paint.type === "solid") {
		return hexToRgba(paint.color, paint.opacity);
	}
	if (paint.type === "linear-gradient") {
		return `linear-gradient(${paint.angle}deg, ${stopsCss(paint.stops)})`;
	}
	if (paint.type === "radial-gradient") {
		return `radial-gradient(circle at ${round2(paint.centerX * 100)}% ${round2(paint.centerY * 100)}%, ${stopsCss(paint.stops)})`;
	}
	return null;
}

// ─── stroke ──────────────────────────────────────────────────────────────────

function strokeToBorder(stroke: StrokeStyle | null): Record<string, string> {
	if (!stroke || stroke.width <= 0) return {};
	const result: Record<string, string> = {
		border: `${stroke.width}px solid ${hexToRgba(stroke.color, stroke.opacity)}`
	};
	if (stroke.dash?.length) result["border-style"] = "dashed";
	return result;
}

// ─── effects ─────────────────────────────────────────────────────────────────

function effectToBoxShadow(shadow: ShadowStyle): string {
	const color = hexToRgba(shadow.color, shadow.opacity);
	return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${color}`;
}

function effectToFilter(effect: LayerEffect): string {
	if (effect.visible === false) return "";
	if (effect.type === "drop-shadow") {
		const color = hexToRgba(effect.color, effect.opacity);
		return `drop-shadow(${effect.x}px ${effect.y}px ${Math.max(0, effect.blur / 2)}px ${color})`;
	}
	if (effect.type === "layer-blur") {
		return `blur(${effect.radius}px)`;
	}
	return "";
}

// ─── corner radii ────────────────────────────────────────────────────────────

function cornerRadiiCss(node: DesignNode): string | null {
	if (node.cornerRadii) {
		const { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl } = node.cornerRadii;
		if (tl === tr && tr === br && br === bl) return `${tl}px`;
		return `${tl}px ${tr}px ${br}px ${bl}px`;
	}
	if (node.radius > 0) return `${node.radius}px`;
	return null;
}

// ─── text ────────────────────────────────────────────────────────────────────

function textStyles(node: TextNode): StyleMap {
	const s: StyleMap = {};
	s["font-family"] = node.fontFamily;
	s["font-size"] = `${node.fontSize}px`;
	if (node.fontWeight !== 400) s["font-weight"] = String(node.fontWeight);
	if (node.fontStyle !== "normal") s["font-style"] = node.fontStyle;
	if (node.lineHeight !== 1) s["line-height"] = String(node.lineHeight);
	if (node.letterSpacing !== 0) s["letter-spacing"] = `${node.letterSpacing}px`;
	if (node.textAlign !== "left") s["text-align"] = node.textAlign;
	if (node.textCase === "upper") s["text-transform"] = "uppercase";
	else if (node.textCase === "lower") s["text-transform"] = "lowercase";
	else if (node.textCase === "title") s["text-transform"] = "capitalize";
	if (node.textDecoration === "underline") s["text-decoration"] = "underline";
	else if (node.textDecoration === "strikethrough") s["text-decoration"] = "line-through";
	if (node.paragraphSpacing > 0) s["margin-bottom"] = `${node.paragraphSpacing}px`;
	if (node.paragraphIndent > 0) s["text-indent"] = `${node.paragraphIndent}px`;
	if (node.fill?.type === "solid") s["color"] = hexToRgba(node.fill.color, node.fill.opacity);
	return s;
}

// ─── vertical alignment helper ───────────────────────────────────────────────

function verticalAlignStyles(node: TextNode): StyleMap {
	const s: StyleMap = {};
	if (node.textAlignVertical === "center") {
		s["display"] = "flex";
		s["align-items"] = "center";
		s["justify-content"] = "center";
	} else if (node.textAlignVertical === "bottom") {
		s["display"] = "flex";
		s["align-items"] = "flex-end";
	}
	return s;
}

// ─── public API ──────────────────────────────────────────────────────────────

export function mapNodeStyles(node: DesignNode): StyleMap {
	const s: StyleMap = {};

	// Dimensions
	s["width"] = `${round2(node.width)}px`;
	s["height"] = `${round2(node.height)}px`;

	// Position (for absolute children)
	s["position"] = "absolute";
	s["left"] = `${round2(node.x)}px`;
	s["top"] = `${round2(node.y)}px`;

	// Rotation
	if (node.rotation !== 0) {
		s["transform"] = `rotate(${round2(node.rotation)}deg)`;
	}

	// Opacity
	if (node.opacity < 1) s["opacity"] = String(round2(node.opacity));

	// Blend mode
	if (node.blendMode && node.blendMode !== "normal") {
		s["mix-blend-mode"] = node.blendMode;
	}

	// Visibility
	if (!node.visible) s["display"] = "none";

	// Fill
	const bg = paintToBackground(node.fill);
	if (bg) s["background"] = bg;

	// Corner radii
	const radius = cornerRadiiCss(node);
	if (radius) s["border-radius"] = radius;

	// Stroke → border (only for rect-like nodes)
	if (node.type === "rectangle" || node.type === "frame" || node.type === "image") {
		Object.assign(s, strokeToBorder(node.stroke));
	}

	// Shadow
	if (node.shadow) s["box-shadow"] = effectToBoxShadow(node.shadow);

	// Layer effects (blur, drop-shadow)
	const filters = (node.effects ?? [])
		.map(effectToFilter)
		.filter(Boolean);
	if (filters.length) s["filter"] = filters.join(" ");

	// Overflow clip
	if (node.type === "frame" && (node as any).clipContent) {
		s["overflow"] = "hidden";
	}

	// Text-specific
	if (node.type === "text") {
		Object.assign(s, textStyles(node as TextNode));
		Object.assign(s, verticalAlignStyles(node as TextNode));
	}

	// Image-specific
	if (node.type === "image") {
		const img = node as any;
		if (img.fit === "contain") s["object-fit"] = "contain";
		else if (img.fit === "cover") s["object-fit"] = "cover";
		else s["object-fit"] = "fill";
	}

	// Ellipse → border-radius: 50%
	if (node.type === "ellipse") {
		s["border-radius"] = "50%";
	}

	return s;
}

export function needsInlineSvg(node: DesignNode): boolean {
	return (
		node.type === "line" ||
		node.type === "arrow" ||
		node.type === "polygon" ||
		node.type === "star" ||
		node.type === "icon"
	);
}

export function generateInlineSvg(node: DesignNode): string {
	const w = round2(node.width);
	const h = round2(node.height);
	const fill = node.fill?.type === "solid" ? hexToRgba(node.fill.color, node.fill.opacity) : "none";
	const strokeColor = node.stroke ? hexToRgba(node.stroke.color, node.stroke.opacity) : "none";
	const strokeW = node.stroke?.width ?? 0;

	if (node.type === "line" || node.type === "arrow") {
		const marker = node.type === "arrow"
			? `<defs><marker id="arrow-${node.id}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z" fill="${strokeColor}"/></marker></defs>`
			: "";
		const markerEnd = node.type === "arrow" ? ` marker-end="url(#arrow-${node.id})"` : "";
		return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${marker}<line x1="0" y1="0" x2="${w}" y2="${h}" stroke="${strokeColor}" stroke-width="${strokeW}" stroke-linecap="${node.stroke?.cap ?? "round"}"${markerEnd}/></svg>`;
	}

	if (node.type === "ellipse") {
		return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="${w / 2}" cy="${h / 2}" rx="${Math.abs(w / 2)}" ry="${Math.abs(h / 2)}" fill="${fill}" stroke="${strokeColor}" stroke-width="${strokeW}"/></svg>`;
	}

	if (node.type === "polygon" || node.type === "star") {
		const count = (node as any).points ?? (node.type === "star" ? 5 : 6);
		const innerRatio = node.type === "star" ? 0.44 : 1;
		const points = polygonPointsSvg(w, h, count, innerRatio);
		return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><polygon points="${points}" fill="${fill}" stroke="${strokeColor}" stroke-width="${strokeW}"/></svg>`;
	}

	if (node.type === "icon") {
		// Icons are rendered as inline SVG from the icon catalog; for export
		// we emit a placeholder comment since the icon body is complex.
		return `<!-- icon: ${(node as any).iconName ?? "unknown"} -->`;
	}

	return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="${fill}"/></svg>`;
}

function polygonPointsSvg(width: number, height: number, count: number, innerRatio = 1): string {
	const points: string[] = [];
	const steps = innerRatio < 1 ? count * 2 : count;
	for (let index = 0; index < steps; index += 1) {
		const angle = -Math.PI / 2 + (index * Math.PI * 2) / steps;
		const radius = innerRatio < 1 && index % 2 === 1 ? innerRatio : 1;
		points.push(`${round2(width / 2 + Math.cos(angle) * (width / 2) * radius)},${round2(height / 2 + Math.sin(angle) * (height / 2) * radius)}`);
	}
	return points.join(" ");
}

export function elementForNode(node: DesignNode): { element: string; selfClosing: boolean } {
	switch (node.type) {
		case "frame":
		case "group":
			return { element: "div", selfClosing: false };
		case "rectangle":
			return { element: "div", selfClosing: false };
		case "ellipse":
			return { element: "div", selfClosing: false };
		case "text":
			return { element: "p", selfClosing: false };
		case "image":
			return { element: "img", selfClosing: true };
		case "line":
		case "arrow":
		case "polygon":
		case "star":
		case "icon":
			return { element: "div", selfClosing: false };
		default:
			return { element: "div", selfClosing: false };
	}
}
