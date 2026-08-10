import { describe, expect, it } from "vitest";
import { cloneDocument, defaultNode, emptyDocument, solid, uid } from "$lib/domain";
import type { ContainerNode, IconNode, ImageNode, ShapeNode, TextNode } from "$lib/domain";

describe("domain factories", () => {
  it("generates unique ids with a prefix", () => {
    const first = uid("node");
    const second = uid("node");
    expect(first).toMatch(/^node_/);
    expect(first).not.toBe(second);
  });

  it("creates an empty document with default viewport", () => {
    const doc = emptyDocument();
    expect(doc.schemaVersion).toBe(2);
    expect(doc.rootIds).toEqual([]);
    expect(doc.nodes).toEqual({});
    expect(doc.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
    expect(doc.prototypeStartFrameId).toBeNull();
  });

  it("creates a solid paint with default opacity", () => {
    expect(solid("#ff0000")).toEqual({ type: "solid", color: "#ff0000", opacity: 1 });
    expect(solid("#00ff00", 0.5)).toEqual({ type: "solid", color: "#00ff00", opacity: 0.5 });
  });

  it("creates all 11 node types with correct defaults", () => {
    const types = ["frame", "group", "rectangle", "ellipse", "line", "arrow", "polygon", "star", "text", "image", "icon"] as const;
    for (const type of types) {
      const node = defaultNode(type, 10, 20);
      expect(node.type).toBe(type);
      expect(node.x).toBe(10);
      expect(node.y).toBe(20);
      expect(node.opacity).toBe(1);
      expect(node.visible).toBe(true);
      expect(node.locked).toBe(false);
      expect(node.parentId).toBeNull();
    }
  });

  it("gives container nodes childIds and clipContent", () => {
    const frame = defaultNode("frame", 0, 0) as ContainerNode;
    expect(frame.childIds).toEqual([]);
    expect(frame.clipContent).toBe(true);
    const group = defaultNode("group", 0, 0) as ContainerNode;
    expect(group.childIds).toEqual([]);
    expect(group.clipContent).toBe(false);
  });

  it("creates text nodes with typography defaults", () => {
    const text = defaultNode("text", 0, 0) as TextNode;
    expect(text.text).toBe("Text");
    expect(text.fontFamily).toBe("Inter, sans-serif");
    expect(text.fontSize).toBe(20);
    expect(text.fontWeight).toBe(400);
    expect(text.autoWidth).toBe(true);
    expect(text.textAutoResize).toBe("width-and-height");
    expect(text.fill).toEqual({ type: "solid", color: "#18181b", opacity: 1 });
  });

  it("syncs autoWidth override to textAutoResize", () => {
    const text = defaultNode("text", 0, 0, { autoWidth: false }) as TextNode;
    expect(text.textAutoResize).toBe("height");
    expect(text.autoWidth).toBe(false);
  });

  it("creates image nodes with crop and asset defaults", () => {
    const image = defaultNode("image", 0, 0) as ImageNode;
    expect(image.assetId).toBe("");
    expect(image.mime).toBe("image/png");
    expect(image.fit).toBe("cover");
    expect(image.crop).toEqual({ x: 0, y: 0, width: 1, height: 1 });
    expect(image.fill).toBeNull();
  });

  it("creates icon nodes with a default name", () => {
    const icon = defaultNode("icon", 0, 0) as IconNode;
    expect(icon.iconName).toBe("sparkles");
    expect(icon.fill).toEqual({ type: "solid", color: "#ffffff", opacity: 1 });
  });

  it("creates shape nodes with correct default points", () => {
    const polygon = defaultNode("polygon", 0, 0) as ShapeNode;
    expect(polygon.points).toBe(6);
    const star = defaultNode("star", 0, 0) as ShapeNode;
    expect(star.points).toBe(5);
    const rect = defaultNode("rectangle", 0, 0) as ShapeNode;
    expect(rect.points).toBeUndefined();
  });

  it("gives line and arrow nodes a stroke but no fill", () => {
    const line = defaultNode("line", 0, 0);
    expect(line.fill).toBeNull();
    expect(line.stroke).toBeTruthy();
    expect(line.height).toBe(0);
    const arrow = defaultNode("arrow", 0, 0);
    expect(arrow.fill).toBeNull();
    expect(arrow.stroke).toBeTruthy();
  });

  it("clones a document deeply so mutations do not leak", () => {
    const doc = emptyDocument();
    const node = defaultNode("rectangle", 10, 20, { width: 80, height: 60 });
    doc.nodes[node.id] = node;
    doc.rootIds = [node.id];
    const clone = cloneDocument(doc);
    expect(clone).toEqual(doc);
    clone.nodes[node.id].x = 999;
    expect(doc.nodes[node.id].x).toBe(10);
    clone.rootIds.push("extra");
    expect(doc.rootIds).toHaveLength(1);
  });
});
