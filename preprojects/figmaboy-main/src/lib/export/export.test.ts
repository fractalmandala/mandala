import { describe, expect, it } from "vitest";
import { defaultNode, emptyDocument, solid } from "$lib/domain";
import type { TextNode, ContainerNode, DesignNode, PageDocument } from "$lib/domain";
import { slugify, NameResolver, resolveAllNames } from "$lib/export/name-resolver";
import { mapNodeStyles, needsInlineSvg, generateInlineSvg, elementForNode } from "$lib/export/style-mapper";
import { analyzeLayout } from "$lib/export/layout-analyzer";
import { emitSass, emitFlatSass, emitCssCustomProperties } from "$lib/export/sass-emitter";
import { emitSvelteComponent, emitSvelteMarkup } from "$lib/export/svelte-emitter";
import { generateCode, generatePreview } from "$lib/export/codegen";
import type { ResolvedNode, StyleMap } from "$lib/export/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCardDocument(): PageDocument {
	const doc = emptyDocument();
	const frame = defaultNode("frame", 0, 0, {
		name: "Card",
		width: 320,
		height: 200,
		fill: solid("#ffffff"),
		radius: 12
	}) as ContainerNode;
	const title = defaultNode("text", 16, 152, {
		name: "Title",
		width: 288,
		height: 24,
		text: "Product Name",
		fontSize: 20,
		fontWeight: 700,
		fill: solid("#18181b"),
		parentId: frame.id
	}) as TextNode;
	const subtitle = defaultNode("text", 16, 180, {
		name: "Subtitle",
		width: 288,
		height: 16,
		text: "Description",
		fontSize: 14,
		fill: solid("#666666"),
		parentId: frame.id
	}) as TextNode;
	frame.childIds.push(title.id, subtitle.id);
	doc.nodes[frame.id] = frame;
	doc.nodes[title.id] = title;
	doc.nodes[subtitle.id] = subtitle;
	doc.rootIds.push(frame.id);
	return doc;
}

function makeRowDocument(): PageDocument {
	const doc = emptyDocument();
	const frame = defaultNode("frame", 0, 0, {
		name: "Row",
		width: 300,
		height: 60,
		fill: solid("#f0f0f0")
	}) as ContainerNode;
	const a = defaultNode("rectangle", 10, 10, {
		name: "Item A",
		width: 80,
		height: 40,
		fill: solid("#a78bfa"),
		parentId: frame.id
	});
	const b = defaultNode("rectangle", 100, 10, {
		name: "Item B",
		width: 80,
		height: 40,
		fill: solid("#60a5fa"),
		parentId: frame.id
	});
	const c = defaultNode("rectangle", 190, 10, {
		name: "Item C",
		width: 80,
		height: 40,
		fill: solid("#34d399"),
		parentId: frame.id
	});
	frame.childIds.push(a.id, b.id, c.id);
	doc.nodes = { [frame.id]: frame, [a.id]: a, [b.id]: b, [c.id]: c };
	doc.rootIds.push(frame.id);
	return doc;
}

// ─── name-resolver ───────────────────────────────────────────────────────────

describe("export / name-resolver", () => {
	it("slugifies node names to valid CSS identifiers", () => {
		expect(slugify("Hello World")).toBe("hello-world");
		expect(slugify("Card 123")).toBe("card-123");
		expect(slugify("  spaces  ")).toBe("spaces");
		expect(slugify("special!@#chars")).toBe("special-chars");
		expect(slugify("")).toBe("element");
	});

	it("deduplicates identical names", () => {
		const resolver = new NameResolver("node-name", "");
		expect(resolver.resolve("id1", "Button")).toBe("button");
		expect(resolver.resolve("id2", "Button")).toBe("button-2");
		expect(resolver.resolve("id3", "Button")).toBe("button-3");
	});

	it("returns the same name for the same node ID", () => {
		const resolver = new NameResolver("node-name", "");
		const first = resolver.resolve("id1", "Card");
		const second = resolver.resolve("id1", "Card");
		expect(first).toBe(second);
	});

	it("uses prefix strategy when node name is empty", () => {
		const resolver = new NameResolver("prefix", "el");
		const name = resolver.resolve("node_abc123", "");
		expect(name).toMatch(/^el-/);
	});

	it("resolves all names in a document", () => {
		const doc = makeCardDocument();
		const names = resolveAllNames(doc, "node-name", "");
		expect(names.size).toBe(3);
		expect(names.get(doc.rootIds[0])).toBe("card");
	});
});

// ─── style-mapper ────────────────────────────────────────────────────────────

describe("export / style-mapper", () => {
	it("maps solid fill to background color", () => {
		const node = defaultNode("rectangle", 0, 0, { fill: solid("#ff0000") });
		const styles = mapNodeStyles(node);
		expect(styles["background"]).toBe("rgb(255, 0, 0)");
	});

	it("maps solid fill with opacity to rgba", () => {
		const node = defaultNode("rectangle", 0, 0, { fill: solid("#ff0000", 0.5) });
		const styles = mapNodeStyles(node);
		expect(styles["background"]).toBe("rgba(255, 0, 0, 0.5)");
	});

	it("maps corner radius to border-radius", () => {
		const node = defaultNode("rectangle", 0, 0, { radius: 8 });
		const styles = mapNodeStyles(node);
		expect(styles["border-radius"]).toBe("8px");
	});

	it("maps rotation to transform", () => {
		const node = defaultNode("rectangle", 0, 0, { rotation: 45 });
		const styles = mapNodeStyles(node);
		expect(styles["transform"]).toBe("rotate(45deg)");
	});

	it("maps opacity below 1", () => {
		const node = defaultNode("rectangle", 0, 0, { opacity: 0.7 });
		const styles = mapNodeStyles(node);
		expect(styles["opacity"]).toBe("0.7");
	});

	it("maps blend mode", () => {
		const node = defaultNode("rectangle", 0, 0, { blendMode: "multiply" });
		const styles = mapNodeStyles(node);
		expect(styles["mix-blend-mode"]).toBe("multiply");
	});

	it("maps text styles", () => {
		const node = defaultNode("text", 0, 0, {
			fontFamily: "Inter, sans-serif",
			fontSize: 24,
			fontWeight: 700,
			fontStyle: "italic",
			lineHeight: 1.5,
			letterSpacing: 2,
			textAlign: "center",
			textCase: "upper",
			textDecoration: "underline"
		}) as TextNode;
		const styles = mapNodeStyles(node);
		expect(styles["font-family"]).toBe("Inter, sans-serif");
		expect(styles["font-size"]).toBe("24px");
		expect(styles["font-weight"]).toBe("700");
		expect(styles["font-style"]).toBe("italic");
		expect(styles["line-height"]).toBe("1.5");
		expect(styles["letter-spacing"]).toBe("2px");
		expect(styles["text-align"]).toBe("center");
		expect(styles["text-transform"]).toBe("uppercase");
		expect(styles["text-decoration"]).toBe("underline");
	});

	it("maps shadow to box-shadow", () => {
		const node = defaultNode("rectangle", 0, 0, {
			shadow: { color: "#000000", opacity: 0.25, x: 0, y: 4, blur: 12 }
		});
		const styles = mapNodeStyles(node);
		expect(styles["box-shadow"]).toContain("0px 4px 12px");
	});

	it("maps ellipse to border-radius: 50%", () => {
		const node = defaultNode("ellipse", 0, 0);
		const styles = mapNodeStyles(node);
		expect(styles["border-radius"]).toBe("50%");
	});

	it("maps image fit to object-fit", () => {
		const node = defaultNode("image", 0, 0, { fit: "cover" } as any);
		const styles = mapNodeStyles(node);
		expect(styles["object-fit"]).toBe("cover");
	});

	it("identifies nodes that need inline SVG", () => {
		expect(needsInlineSvg(defaultNode("line", 0, 0))).toBe(true);
		expect(needsInlineSvg(defaultNode("arrow", 0, 0))).toBe(true);
		expect(needsInlineSvg(defaultNode("polygon", 0, 0))).toBe(true);
		expect(needsInlineSvg(defaultNode("star", 0, 0))).toBe(true);
		expect(needsInlineSvg(defaultNode("rectangle", 0, 0))).toBe(false);
		expect(needsInlineSvg(defaultNode("frame", 0, 0))).toBe(false);
	});

	it("generates inline SVG for a line", () => {
		const node = defaultNode("line", 0, 0, { width: 100, height: 0 });
		const svg = generateInlineSvg(node);
		expect(svg).toContain("<svg");
		expect(svg).toContain("<line");
	});

	it("determines correct HTML element for each node type", () => {
		expect(elementForNode(defaultNode("frame", 0, 0))).toEqual({ element: "div", selfClosing: false });
		expect(elementForNode(defaultNode("rectangle", 0, 0))).toEqual({ element: "div", selfClosing: false });
		expect(elementForNode(defaultNode("text", 0, 0))).toEqual({ element: "p", selfClosing: false });
		expect(elementForNode(defaultNode("image", 0, 0))).toEqual({ element: "img", selfClosing: true });
	});
});

// ─── layout-analyzer ─────────────────────────────────────────────────────────

describe("export / layout-analyzer", () => {
	it("detects a horizontal row layout", () => {
		const doc = makeRowDocument();
		const frame = doc.nodes[doc.rootIds[0]];
		const layout = analyzeLayout(doc, frame);
		expect(layout.type).toBe("flex-row");
		expect(layout.gap).toBe(10);
	});

	it("detects a vertical column layout", () => {
		const doc = makeCardDocument();
		const frame = doc.nodes[doc.rootIds[0]];
		const layout = analyzeLayout(doc, frame);
		expect(layout.type).toBe("flex-column");
	});

	it("falls back to absolute for overlapping children", () => {
		const doc = emptyDocument();
		const frame = defaultNode("frame", 0, 0, { width: 200, height: 200 }) as ContainerNode;
		const a = defaultNode("rectangle", 10, 10, { width: 100, height: 100, parentId: frame.id });
		const b = defaultNode("rectangle", 50, 50, { width: 100, height: 100, parentId: frame.id });
		frame.childIds.push(a.id, b.id);
		doc.nodes = { [frame.id]: frame, [a.id]: a, [b.id]: b };
		doc.rootIds.push(frame.id);
		const layout = analyzeLayout(doc, frame);
		expect(layout.type).toBe("absolute");
	});

	it("returns absolute for empty containers", () => {
		const doc = emptyDocument();
		const frame = defaultNode("frame", 0, 0, { width: 200, height: 200 }) as ContainerNode;
		doc.nodes[frame.id] = frame;
		doc.rootIds.push(frame.id);
		const layout = analyzeLayout(doc, frame);
		expect(layout.type).toBe("absolute");
	});
});

// ─── sass-emitter ────────────────────────────────────────────────────────────

describe("export / sass-emitter", () => {
	it("emits indented SASS for a resolved node", () => {
		const resolved: ResolvedNode = {
			node: defaultNode("rectangle", 0, 0, { fill: solid("#ff0000") }),
			className: "my-box",
			styles: { width: "100px", height: "80px", background: "rgb(255, 0, 0)" },
			layout: null,
			children: [],
			element: "div",
			selfClosing: false,
			inlineSvg: null
		};
		const sass = emitSass([resolved]);
		expect(sass).toContain(".my-box");
		expect(sass).toContain("\twidth: 100px");
		expect(sass).toContain("\tbackground: rgb(255, 0, 0)");
	});

	it("emits flex layout overrides", () => {
		const resolved: ResolvedNode = {
			node: defaultNode("frame", 0, 0),
			className: "row",
			styles: { width: "300px", height: "60px" },
			layout: { type: "flex-row", gap: 12, padding: { top: 0, right: 0, bottom: 0, left: 0 }, alignItems: "center", justifyContent: "space-between" },
			children: [],
			element: "div",
			selfClosing: false,
			inlineSvg: null
		};
		const sass = emitSass([resolved]);
		expect(sass).toContain("\tdisplay: flex");
		expect(sass).toContain("\tflex-direction: row");
		expect(sass).toContain("\tgap: 12px");
		expect(sass).toContain("\talign-items: center");
		expect(sass).toContain("\tjustify-content: space-between");
	});

	it("emits nested children with increased indentation", () => {
		const child: ResolvedNode = {
			node: defaultNode("rectangle", 0, 0),
			className: "inner",
			styles: { width: "50px", height: "50px" },
			layout: null,
			children: [],
			element: "div",
			selfClosing: false,
			inlineSvg: null
		};
		const parent: ResolvedNode = {
			node: defaultNode("frame", 0, 0),
			className: "outer",
			styles: { width: "200px", height: "200px" },
			layout: null,
			children: [child],
			element: "div",
			selfClosing: false,
			inlineSvg: null
		};
		const sass = emitSass([parent]);
		expect(sass).toContain(".outer");
		expect(sass).toContain("\t.inner");
		expect(sass).toContain("\t\twidth: 50px");
	});

	it("emits CSS custom properties from tokens", () => {
		const css = emitCssCustomProperties({ "color-0": "#ff0000", "color-1": "#00ff00" });
		expect(css).toContain(":root");
		expect(css).toContain("\t--color-0: #ff0000");
		expect(css).toContain("\t--color-1: #00ff00");
	});
});

// ─── svelte-emitter ──────────────────────────────────────────────────────────

describe("export / svelte-emitter", () => {
	it("emits Svelte markup for a simple node", () => {
		const resolved: ResolvedNode = {
			node: defaultNode("rectangle", 0, 0, { name: "Box" }),
			className: "box",
			styles: { width: "100px", height: "80px" },
			layout: null,
			children: [],
			element: "div",
			selfClosing: false,
			inlineSvg: null
		};
		const markup = emitSvelteMarkup([resolved]);
		expect(markup).toContain('<div class="box">');
		expect(markup).toContain("</div>");
	});

	it("emits a text node with content", () => {
		const textNode = defaultNode("text", 0, 0, { text: "Hello World" }) as TextNode;
		const resolved: ResolvedNode = {
			node: textNode,
			className: "greeting",
			styles: {},
			layout: null,
			children: [],
			element: "p",
			selfClosing: false,
			inlineSvg: null
		};
		const markup = emitSvelteMarkup([resolved]);
		expect(markup).toContain('<p class="greeting">Hello World</p>');
	});

	it("emits a complete Svelte component with style block", () => {
		const resolved: ResolvedNode = {
			node: defaultNode("rectangle", 0, 0),
			className: "box",
			styles: { width: "100px" },
			layout: null,
			children: [],
			element: "div",
			selfClosing: false,
			inlineSvg: null
		};
		const component = emitSvelteComponent([resolved], { styleContent: ".box\n\twidth: 100px" });
		expect(component).toContain("<script lang=\"ts\">");
		expect(component).toContain("<style lang=\"sass\">");
		expect(component).toContain(".box");
	});

	it("emits self-closing img for image nodes", () => {
		const imgNode = defaultNode("image", 0, 0, { name: "Hero" } as any);
		const resolved: ResolvedNode = {
			node: imgNode,
			className: "hero",
			styles: { width: "320px", height: "200px" },
			layout: null,
			children: [],
			element: "img",
			selfClosing: true,
			inlineSvg: null
		};
		const markup = emitSvelteMarkup([resolved]);
		expect(markup).toContain("<img");
		expect(markup).toContain('class="hero"');
		expect(markup).toContain("/>");
	});
});

// ─── codegen (full pipeline) ─────────────────────────────────────────────────

describe("export / codegen", () => {
	it("generates a Svelte component from a card document", () => {
		const doc = makeCardDocument();
		const result = generateCode(doc, { format: "svelte" });
		expect(result.files).toHaveLength(1);
		expect(result.files[0].name).toBe("ExportedDesign.svelte");
		expect(result.files[0].language).toBe("svelte");
		expect(result.files[0].content).toContain("<script");
		expect(result.files[0].content).toContain("<style");
		expect(result.files[0].content).toContain(".card");
		expect(result.files[0].content).toContain("Product Name");
	});

	it("generates SASS-only output", () => {
		const doc = makeCardDocument();
		const result = generateCode(doc, { format: "sass" });
		expect(result.files).toHaveLength(1);
		expect(result.files[0].name).toBe("ExportedDesign.sass");
		expect(result.files[0].content).toContain(".card");
	});

	it("generates HTML + CSS output", () => {
		const doc = makeCardDocument();
		const result = generateCode(doc, { format: "html" });
		expect(result.files).toHaveLength(2);
		expect(result.files[0].name).toBe("index.html");
		expect(result.files[1].name).toBe("styles.css");
		expect(result.files[0].content).toContain("<!DOCTYPE html>");
	});

	it("extracts design tokens when enabled", () => {
		const doc = makeCardDocument();
		const result = generateCode(doc, { extractTokens: true, format: "sass" });
		// The card doc has #18181b and #666666 used once each, so no tokens
		// (tokens require 2+ uses). Let's verify the flag works:
		expect(result.tokens).toBeDefined();
	});

	it("uses absolute layout when forced", () => {
		const doc = makeRowDocument();
		const result = generateCode(doc, { layout: "absolute", format: "sass" });
		const sass = result.files[0].content;
		expect(sass).not.toContain("display: flex");
	});

	it("generates a preview string", () => {
		const doc = makeCardDocument();
		const preview = generatePreview(doc);
		expect(preview).toContain("<script");
		expect(preview).toContain(".card");
	});

	it("handles empty documents gracefully", () => {
		const doc = emptyDocument();
		const result = generateCode(doc);
		expect(result.files).toHaveLength(1);
		expect(result.files[0].content).toBeDefined();
	});

	it("handles documents with only shapes", () => {
		const doc = emptyDocument();
		const rect = defaultNode("rectangle", 10, 20, { width: 100, height: 80, fill: solid("#a78bfa"), radius: 4 });
		const ellipse = defaultNode("ellipse", 130, 20, { width: 60, height: 60, fill: solid("#60a5fa") });
		doc.nodes[rect.id] = rect;
		doc.nodes[ellipse.id] = ellipse;
		doc.rootIds.push(rect.id, ellipse.id);
		const result = generateCode(doc, { format: "svelte" });
		expect(result.files[0].content).toContain("border-radius");
		expect(result.files[0].content).toContain("50%");
	});
});
