import { describe, expect, it } from "vitest";
import { sanitizeDocument } from "$lib/document-validation";

describe("document recovery", () => {
  it("repairs malformed geometry, references, cycles, paints and viewport values", () => {
    const { document, recovered } = sanitizeDocument({
      schemaVersion: 99,
      rootIds: ["frame", "missing"],
      nodes: {
        frame: { id: "wrong", type: "frame", name: "Frame", parentId: null, x: 50, y: 40, width: -100, height: -80, childIds: ["rect", "missing", "rect"], fill: { type: "wat" }, customFutureField: "kept" },
        rect: { id: "rect", type: "rectangle", name: "Card", parentId: "frame", x: Number.NaN, y: 10, width: 30, height: 20, opacity: 4 },
        first: { id: "first", type: "group", parentId: "second", childIds: ["second"] },
        second: { id: "second", type: "group", parentId: "first", childIds: ["first"] },
        unsupported: { id: "unsupported", type: "video" },
      },
      viewport: { x: Number.POSITIVE_INFINITY, y: 20, zoom: 100 },
      prototypeStartFrameId: "rect",
    });

    expect(recovered).toBe(true);
    expect(document.schemaVersion).toBe(2);
    expect(document.nodes.unsupported).toBeUndefined();
    expect(document.nodes.frame).toMatchObject({ id: "frame", x: -50, y: -40, width: 100, height: 80, customFutureField: "kept" });
    expect(document.nodes.rect).toMatchObject({ parentId: "frame", x: 0, opacity: 1 });
    expect((document.nodes.frame as { childIds: string[] }).childIds).toEqual(["rect"]);
    expect(document.viewport).toMatchObject({ x: 0, y: 20, zoom: 8 });
    expect(document.prototypeStartFrameId).toBeNull();

    const cycleStillExists = document.nodes.first.parentId === "second" && document.nodes.second.parentId === "first";
    expect(cycleStillExists).toBe(false);
  });
});

describe("variable sanitization", () => {
  it("preserves valid variables and collections through round-trip", () => {
    const { document } = sanitizeDocument({
      schemaVersion: 2,
      rootIds: [],
      nodes: {},
      viewport: { x: 0, y: 0, zoom: 1 },
      prototypeStartFrameId: null,
      variableCollections: [
        { id: "col1", name: "Theme", modes: [{ id: "m1", name: "Default", values: { "v1": { value: "#ff0000" } } }], defaultModeId: "m1" },
      ],
      variables: [
        { id: "v1", name: "Primary", collectionId: "col1", type: "color" },
      ],
    });
    expect(document.variableCollections).toHaveLength(1);
    expect(document.variableCollections[0].name).toBe("Theme");
    expect(document.variableCollections[0].modes[0].values["v1"]).toEqual({ value: "#ff0000" });
    expect(document.variables).toHaveLength(1);
    expect(document.variables[0].name).toBe("Primary");
    expect(document.variables[0].type).toBe("color");
  });

  it("rejects invalid variables", () => {
    const { document } = sanitizeDocument({
      schemaVersion: 2,
      rootIds: [],
      nodes: {},
      viewport: { x: 0, y: 0, zoom: 1 },
      prototypeStartFrameId: null,
      variables: [
        { id: "v1", name: "Valid", collectionId: "col1", type: "color" },
        { id: "v2", name: "Bad type", collectionId: "col1", type: "gradient" },
        { name: "No id", collectionId: "col1", type: "number" },
        { id: "v4", collectionId: "col1", type: "number" },
      ],
      variableCollections: [],
    });
    expect(document.variables).toHaveLength(1);
    expect(document.variables[0].id).toBe("v1");
  });

  it("provides a default mode when collection has none", () => {
    const { document } = sanitizeDocument({
      schemaVersion: 2,
      rootIds: [],
      nodes: {},
      viewport: { x: 0, y: 0, zoom: 1 },
      prototypeStartFrameId: null,
      variableCollections: [
        { id: "col1", name: "Empty", modes: [], defaultModeId: "missing" },
      ],
      variables: [],
    });
    expect(document.variableCollections[0].modes).toHaveLength(1);
    expect(document.variableCollections[0].modes[0].name).toBe("Default");
  });

  it("prunes mode values referencing non-existent variables", () => {
    const { document } = sanitizeDocument({
      schemaVersion: 2,
      rootIds: [],
      nodes: {},
      viewport: { x: 0, y: 0, zoom: 1 },
      prototypeStartFrameId: null,
      variableCollections: [
        { id: "col1", name: "Theme", modes: [{ id: "m1", name: "Default", values: { "v1": { value: "#ff0000" }, "v_ghost": { value: "ghost" } } }], defaultModeId: "m1" },
      ],
      variables: [
        { id: "v1", name: "Primary", collectionId: "col1", type: "color" },
      ],
    });
    expect(document.variableCollections[0].modes[0].values["v1"]).toEqual({ value: "#ff0000" });
    expect(document.variableCollections[0].modes[0].values["v_ghost"]).toBeUndefined();
  });

  it("preserves boundVariables on nodes", () => {
    const { document } = sanitizeDocument({
      schemaVersion: 2,
      rootIds: ["rect"],
      nodes: {
        rect: { id: "rect", type: "rectangle", name: "Card", parentId: null, x: 0, y: 0, width: 100, height: 100, boundVariables: { fill: "v1", opacity: "v2" } },
      },
      viewport: { x: 0, y: 0, zoom: 1 },
      prototypeStartFrameId: null,
    });
    expect(document.nodes.rect.boundVariables).toEqual({ fill: "v1", opacity: "v2" });
  });
});
