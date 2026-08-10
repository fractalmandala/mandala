import { describe, expect, it } from "vitest";
import { defaultNode, emptyDocument } from "$lib/domain";
import { containsRect, drawingParentFrame, frameAtPoint, identity, intersects, invert, multiply, nodeMatrix, normalizeRect, polygonPoints, rectContainsPoint, screenToWorld, selectionBounds, snap, transformPoint, unionRects, worldBounds, worldMatrix, worldToNodeLocal } from "$lib/geometry";

describe("editor geometry", () => {
  it("normalizes reverse drag rectangles", () => {
    expect(normalizeRect({ x: 80, y: 60 }, { x: 20, y: 10 })).toEqual({ x: 20, y: 10, width: 60, height: 50 });
  });

  it("calculates nested world bounds", () => {
    const document = emptyDocument();
    const frame = defaultNode("frame", 100, 200, { width: 300, height: 200 });
    const rectangle = defaultNode("rectangle", 20, 30, { width: 50, height: 40, parentId: frame.id });
    if (frame.type !== "frame") throw new Error("expected a frame");
    frame.childIds.push(rectangle.id);
    document.nodes[frame.id] = frame;
    document.nodes[rectangle.id] = rectangle;
    document.rootIds.push(frame.id);
    expect(worldBounds(document, rectangle)).toMatchObject({ x: 120, y: 230, width: 50, height: 40 });
  });

  it("finds the nearest drawing frame and converts world coordinates to its local space", () => {
    const document = emptyDocument();
    const outer = defaultNode("frame", 100, 200, { width: 400, height: 300 });
    const inner = defaultNode("frame", 30, 40, { width: 200, height: 140, parentId: outer.id });
    const card = defaultNode("rectangle", 10, 15, { width: 80, height: 50, parentId: inner.id });
    if (outer.type !== "frame" || inner.type !== "frame") throw new Error("expected frames");
    outer.childIds.push(inner.id);
    inner.childIds.push(card.id);
    document.nodes = { [outer.id]: outer, [inner.id]: inner, [card.id]: card };
    document.rootIds = [outer.id];

    expect(drawingParentFrame(document, card.id)).toBe(inner.id);
    expect(worldToNodeLocal(document, inner.id, { x: 170, y: 275 })).toEqual({ x: 40, y: 35 });
    expect(frameAtPoint(document, { x: 170, y: 275 })).toBe(inner.id);
    expect(frameAtPoint(document, { x: 110, y: 210 })).toBe(outer.id);
    expect(frameAtPoint(document, { x: 10, y: 10 })).toBeNull();
  });

  it("unions selection bounds and tests intersections", () => {
    const document = emptyDocument();
    const first = defaultNode("rectangle", 0, 0, { width: 20, height: 20 });
    const second = defaultNode("ellipse", 40, 10, { width: 10, height: 30 });
    document.nodes[first.id] = first;
    document.nodes[second.id] = second;
    document.rootIds.push(first.id, second.id);
    expect(selectionBounds(document, [first.id, second.id])).toMatchObject({ x: 0, y: 0, width: 50, height: 40 });
    expect(intersects({ x: 39, y: 9, width: 2, height: 2 }, worldBounds(document, second))).toBe(true);
    expect(containsRect({ x: -1, y: -1, width: 22, height: 22 }, worldBounds(document, first))).toBe(true);
    expect(containsRect({ x: 1, y: 1, width: 18, height: 18 }, worldBounds(document, first))).toBe(false);
  });

  it("keeps the world coordinate under the pointer stable while zooming", () => {
    const point = { x: 420, y: 315 };
    const viewport = { x: 123, y: -45, zoom: 2 };
    const world = screenToWorld(point, viewport);
    const zoom = 3.5;
    const next = { x: point.x - world.x * zoom, y: point.y - world.y * zoom, zoom };
    expect(screenToWorld(point, next)).toEqual(world);
  });

  it("generates the requested polygon and star vertices", () => {
    expect(polygonPoints(100, 100, 6).split(" ")).toHaveLength(6);
    expect(polygonPoints(100, 100, 5, 0.44).split(" ")).toHaveLength(10);
  });

  it("multiplies matrices and returns identity for no-op transforms", () => {
    const node = defaultNode("rectangle", 50, 60, { width: 100, height: 80 });
    const m = nodeMatrix(node);
    const result = multiply(identity, m);
    expect(result.a).toBeCloseTo(m.a);
    expect(result.e).toBeCloseTo(m.e);
    expect(result.f).toBeCloseTo(m.f);
  });

  it("inverts a matrix so that multiply(M, invert(M)) ≈ identity", () => {
    const node = defaultNode("rectangle", 30, 40, { width: 120, height: 80, rotation: 35 });
    const m = nodeMatrix(node);
    const inv = invert(m);
    const product = multiply(m, inv);
    expect(product.a).toBeCloseTo(1);
    expect(product.b).toBeCloseTo(0);
    expect(product.c).toBeCloseTo(0);
    expect(product.d).toBeCloseTo(1);
    expect(product.e).toBeCloseTo(0);
    expect(product.f).toBeCloseTo(0);
  });

  it("returns identity when inverting a degenerate (zero-determinant) matrix", () => {
    expect(invert({ a: 0, b: 0, c: 0, d: 0, e: 10, f: 20 })).toEqual(identity);
  });

  it("computes world bounds for a rotated node", () => {
    const document = emptyDocument();
    const node = defaultNode("rectangle", 0, 0, { width: 100, height: 0, rotation: 90 });
    document.nodes[node.id] = node;
    document.rootIds = [node.id];
    const bounds = worldBounds(document, node);
    expect(bounds.x).toBeCloseTo(50);
    expect(bounds.y).toBeCloseTo(-50);
    expect(bounds.width).toBeCloseTo(0, 0);
    expect(bounds.height).toBeCloseTo(100);
  });

  it("transforms a point through a node matrix and its inverse", () => {
    const document = emptyDocument();
    const node = defaultNode("rectangle", 100, 200, { width: 80, height: 60, rotation: 45 });
    document.nodes[node.id] = node;
    document.rootIds = [node.id];
    const m = worldMatrix(document, node);
    const origin = transformPoint(m, { x: 0, y: 0 });
    const local = worldToNodeLocal(document, node.id, origin);
    expect(local.x).toBeCloseTo(0);
    expect(local.y).toBeCloseTo(0);
  });

  it("unions multiple rects and returns null for an empty list", () => {
    expect(unionRects([])).toBeNull();
    expect(unionRects([{ x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: 20, width: 10, height: 10 }])).toEqual({ x: 0, y: 0, width: 30, height: 30 });
  });

  it("tests rectContainsPoint inside and outside a rectangle", () => {
    expect(rectContainsPoint({ x: 10, y: 10, width: 50, height: 40 }, { x: 30, y: 25 })).toBe(true);
    expect(rectContainsPoint({ x: 10, y: 10, width: 50, height: 40 }, { x: 100, y: 100 })).toBe(false);
    expect(rectContainsPoint({ x: 10, y: 10, width: 50, height: 40 }, { x: 65, y: 55 }, 6)).toBe(true);
  });

  it("snaps a value to the nearest candidate within threshold", () => {
    expect(snap(102, [100, 200], 5)).toEqual({ value: 100, guide: 100 });
    expect(snap(150, [100, 200], 5)).toEqual({ value: 150, guide: null });
    expect(snap(198, [100, 200], 5)).toEqual({ value: 200, guide: 200 });
  });

  it("excludes frames by id when searching for the frame at a point", () => {
    const document = emptyDocument();
    const frame = defaultNode("frame", 0, 0, { width: 400, height: 300 });
    document.nodes[frame.id] = frame;
    document.rootIds = [frame.id];
    expect(frameAtPoint(document, { x: 50, y: 50 })).toBe(frame.id);
    expect(frameAtPoint(document, { x: 50, y: 50 }, [frame.id])).toBeNull();
  });
});
