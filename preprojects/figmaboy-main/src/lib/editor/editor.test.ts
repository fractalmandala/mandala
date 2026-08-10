import { describe, expect, it } from "vitest";
import { defaultNode, emptyDocument } from "$lib/domain";
import type { OpenedFile } from "$lib/domain";
import { EditorSession } from "$lib/editor/editor.svelte";
import { worldBounds } from "$lib/geometry";

function opened(): OpenedFile {
  const timestamp = new Date(0).toISOString();
  const file = { id: "file", projectId: null, name: "Untitled", starred: false, createdAt: timestamp, updatedAt: timestamp, lastOpenedAt: timestamp, trashedAt: null, thumbnail: null };
  const page = { id: "page", fileId: file.id, name: "Page 1", position: 0, revision: 0 };
  return { file, pages: [page], page, document: emptyDocument() };
}

describe("editor commands", () => {
  it("starts a production file with no design nodes", () => {
    const session = new EditorSession(opened());
    expect(session.document.rootIds).toEqual([]);
    expect(session.document.nodes).toEqual({});
  });

  it("adds, deletes, undoes, and redoes nodes", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 20);
    session.addNode(node);
    expect(session.document.rootIds).toEqual([node.id]);
    session.deleteSelection();
    expect(session.document.rootIds).toEqual([]);
    session.undo();
    expect(session.document.nodes[node.id]).toBeTruthy();
    session.redo();
    expect(session.document.nodes[node.id]).toBeUndefined();
  });

  it("groups and ungroups while preserving visual positions", () => {
    const session = new EditorSession(opened());
    const first = defaultNode("rectangle", 10, 20, { width: 20, height: 30 });
    const second = defaultNode("ellipse", 50, 60, { width: 40, height: 20 });
    session.addNode(first);
    session.addNode(second);
    session.selectedIds = [first.id, second.id];
    session.groupSelection();
    const group = session.selectedNodes[0];
    expect(group.type).toBe("group");
    expect(group.x).toBe(10);
    expect(session.document.nodes[first.id].x).toBe(0);
    session.ungroupSelection();
    expect(session.document.nodes[first.id].x).toBe(10);
    expect(session.document.nodes[second.id].y).toBe(60);
  });

  it("preserves rotated child geometry through grouping and ungrouping", () => {
    const session = new EditorSession(opened());
    const first = defaultNode("rectangle", 20, 30, { width: 80, height: 40, rotation: 25 });
    const second = defaultNode("ellipse", 140, 70, { width: 50, height: 90, rotation: -15 });
    session.document.nodes = { [first.id]: first, [second.id]: second };
    session.document.rootIds = [first.id, second.id];
    session.selectedIds = [first.id, second.id];
    const before = [worldBounds(session.document, first), worldBounds(session.document, second)];
    session.groupSelection();
    session.ungroupSelection();
    [first.id, second.id].forEach((id, index) => {
      const after = worldBounds(session.document, session.document.nodes[id]);
      expect(after.x).toBeCloseTo(before[index].x);
      expect(after.y).toBeCloseTo(before[index].y);
      expect(after.width).toBeCloseTo(before[index].width);
      expect(after.height).toBeCloseTo(before[index].height);
    });
  });

  it("coalesces pointer gestures into a single undo step", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 10);
    session.addNode(node);
    session.beginGesture();
    session.document.nodes[node.id].x = 90;
    session.gestureChanged();
    session.document.nodes[node.id].x = 140;
    session.commitGesture();
    session.undo();
    expect(session.document.nodes[node.id].x).toBe(10);
  });

  it("does not expose transform previews to autosave before commit", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 10);
    session.addNode(node);
    const token = session.changeToken;
    session.beginGesture();
    session.document.nodes[node.id].x = 90;
    session.previewGesture();
    expect(session.changeToken).toBe(token);
    session.commitGesture();
    expect(session.changeToken).toBe(token + 1);
  });

  it("persists viewport changes without regenerating the canvas thumbnail", () => {
    const session = new EditorSession(opened());
    session.document.viewport = { x: 120, y: -40, zoom: 1.75 };
    session.viewportChanged();

    expect(session.changeToken).toBe(1);
    expect(session.saveStatus).toBe("dirty");
    expect(session.thumbnailChangeToken).toBe(0);
    expect(session.thumbnailDirty).toBe(false);

    session.addNode(defaultNode("rectangle", 10, 20));
    expect(session.thumbnailChangeToken).toBe(1);
    expect(session.thumbnailDirty).toBe(true);
  });

  it("restores the gesture snapshot when cancellation is requested", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 10);
    session.addNode(node);
    session.beginGesture();
    session.document.nodes[node.id].x = 200;
    session.previewGesture();
    session.cancelGesture();
    expect(session.document.nodes[node.id].x).toBe(10);
    expect(session.hasActiveGesture).toBe(false);
  });

  it("cancels an interrupted gesture before an external deletion", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 10);
    session.addNode(node);
    session.beginGesture();
    session.document.nodes[node.id].x = 200;
    session.previewGesture();
    session.deleteSelection();
    expect(session.document.nodes[node.id]).toBeUndefined();
    session.undo();
    expect(session.document.nodes[node.id].x).toBe(10);
  });

  it("keeps the current viewport when undoing document edits", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 10);
    session.addNode(node);
    session.updateSelected({ x: 80 });
    session.document.viewport = { x: 333, y: -120, zoom: 2.5 };
    session.undo();
    expect(session.document.nodes[node.id].x).toBe(10);
    expect(session.document.viewport).toEqual({ x: 333, y: -120, zoom: 2.5 });
  });

  it("stores an undoable corner radius on box-like nodes", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 0, 0, { width: 160, height: 100 });
    session.addNode(node);
    session.updateSelected({ radius: 24 });
    expect(session.document.nodes[node.id].radius).toBe(24);
    session.undo();
    expect(session.document.nodes[node.id].radius).toBe(0);
  });

  it("duplicates a nested layer beside the source inside the same frame", () => {
    const session = new EditorSession(opened());
    const frame = defaultNode("frame", 100, 100, { width: 300, height: 200 });
    const card = defaultNode("rectangle", 20, 30, { width: 80, height: 60, parentId: frame.id });
    if (frame.type !== "frame") throw new Error("expected a frame");
    frame.childIds.push(card.id);
    session.document.nodes = { [frame.id]: frame, [card.id]: card };
    session.document.rootIds = [frame.id];
    session.selectedIds = [card.id];

    session.duplicateSelection({ x: 12, y: 8 });
    const copy = session.selectedNodes[0];
    expect(copy.parentId).toBe(frame.id);
    expect(copy.x).toBe(32);
    expect(copy.y).toBe(38);
    expect((session.document.nodes[frame.id] as typeof frame).childIds).toEqual([card.id, copy.id]);
  });

  it("copies and repeatedly pastes editable objects with a cascading offset", async () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 20);
    session.addNode(node);
    session.copy();
    await session.paste();
    expect(session.selectedNodes[0]).toMatchObject({ x: 34, y: 44, type: "rectangle" });
    await session.paste();
    expect(session.selectedNodes[0]).toMatchObject({ x: 58, y: 68, type: "rectangle" });
    expect(session.document.rootIds).toHaveLength(3);
  });

  it("ignores malformed clipboard payloads without changing the document", async () => {
    const session = new EditorSession(opened());
    session.clipboard = { nodes: [{ id: "bad", type: "unknown" }], rootIds: ["bad"] } as never;
    await expect(session.paste()).resolves.toBeUndefined();
    expect(session.document.rootIds).toEqual([]);
  });

  it("canonicalizes parent and child multi-selections", () => {
    const session = new EditorSession(opened());
    const frame = defaultNode("frame", 0, 0);
    const child = defaultNode("rectangle", 10, 10, { parentId: frame.id });
    if (frame.type !== "frame") throw new Error("expected a frame");
    frame.childIds = [child.id];
    session.document.nodes = { [frame.id]: frame, [child.id]: child };
    session.document.rootIds = [frame.id];
    session.setSelection([frame.id, child.id]);
    expect(session.selectedIds).toEqual([frame.id]);
  });

  it("aligns rotated objects in world space as one command", () => {
    const session = new EditorSession(opened());
    const first = defaultNode("rectangle", 20, 30, { width: 80, height: 40, rotation: 25 });
    const second = defaultNode("ellipse", 170, 90, { width: 50, height: 90, rotation: -15 });
    session.document.nodes = { [first.id]: first, [second.id]: second };
    session.document.rootIds = [first.id, second.id];
    session.selectedIds = [first.id, second.id];
    session.alignSelection("left");
    expect(worldBounds(session.document, session.document.nodes[first.id]).x).toBeCloseTo(worldBounds(session.document, session.document.nodes[second.id]).x);
    session.undo();
    expect(worldBounds(session.document, session.document.nodes[second.id]).x).not.toBeCloseTo(worldBounds(session.document, session.document.nodes[first.id]).x);
  });

  it("coalesces an Alt-drag duplicate and movement into one undo entry", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 20);
    session.addNode(node);
    session.beginGesture();
    session.duplicateSelection({ x: 0, y: 0 }, false);
    session.selectedNodes[0].x += 50;
    session.gestureChanged();
    session.commitGesture();

    expect(session.document.rootIds).toHaveLength(2);
    session.undo();
    expect(session.document.rootIds).toEqual([node.id]);
    expect(session.document.nodes[node.id].x).toBe(10);
  });

  it("reparents a layer out of a frame without changing its world position", () => {
    const session = new EditorSession(opened());
    const frame = defaultNode("frame", 100, 200, { width: 400, height: 300 });
    const card = defaultNode("rectangle", 30, 40, { width: 120, height: 80, parentId: frame.id });
    if (frame.type !== "frame") throw new Error("expected a frame");
    frame.childIds.push(card.id);
    session.document.nodes = { [frame.id]: frame, [card.id]: card };
    session.document.rootIds = [frame.id];
    session.selectedIds = [card.id];
    const before = session.bounds;

    session.reparentSelection(null);

    expect(session.document.nodes[card.id].parentId).toBeNull();
    expect((session.document.nodes[frame.id] as typeof frame).childIds).toEqual([]);
    expect(session.document.rootIds).toEqual([frame.id, card.id]);
    expect(session.bounds).toEqual(before);
    expect(session.document.nodes[card.id]).toMatchObject({ x: 130, y: 240 });
  });

  it("moves a layer through the hierarchy without changing world geometry or creating cycles", () => {
    const session = new EditorSession(opened());
    const frame = defaultNode("frame", 100, 200, { width: 300, height: 200, rotation: 15 });
    const card = defaultNode("rectangle", 350, 260, { width: 60, height: 40 });
    if (frame.type !== "frame") throw new Error("expected a frame");
    session.document.nodes = { [frame.id]: frame, [card.id]: card };
    session.document.rootIds = [frame.id, card.id];
    const before = worldBounds(session.document, card);
    session.moveNode(card.id, frame.id, 0);
    const after = worldBounds(session.document, session.document.nodes[card.id]);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
    expect(after.width).toBeCloseTo(before.width);
    expect(after.height).toBeCloseTo(before.height);
    session.moveNode(frame.id, card.id, 0);
    expect(session.document.nodes[frame.id].parentId).toBeNull();
  });

  it("does nothing when undo or redo stacks are empty", () => {
    const session = new EditorSession(opened());
    session.redo();
    expect(session.document.rootIds).toEqual([]);
    session.undo();
    expect(session.document.rootIds).toEqual([]);
  });

  it("selects a single node and toggles it off in additive mode", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 20);
    session.addNode(node);
    session.select(node.id);
    expect(session.selectedIds).toEqual([node.id]);
    session.select(node.id, true);
    expect(session.selectedIds).toEqual([]);
    session.select(null);
    expect(session.selectedIds).toEqual([]);
  });

  it("ignores locked nodes unless includeLocked is set", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 20);
    node.locked = true;
    session.document.nodes[node.id] = node;
    session.document.rootIds = [node.id];
    session.select(node.id);
    expect(session.selectedIds).toEqual([]);
    session.select(node.id, false, true);
    expect(session.selectedIds).toEqual([node.id]);
  });

  it("supports setSelection add and subtract modes", () => {
    const session = new EditorSession(opened());
    const first = defaultNode("rectangle", 0, 0);
    const second = defaultNode("ellipse", 50, 50);
    session.addNode(first);
    session.addNode(second);
    session.setSelection([first.id], "replace");
    session.setSelection([second.id], "add");
    expect(session.selectedIds).toContain(first.id);
    expect(session.selectedIds).toContain(second.id);
    session.setSelection([first.id], "subtract");
    expect(session.selectedIds).toEqual([second.id]);
  });

  it("selects all visible unlocked root nodes", () => {
    const session = new EditorSession(opened());
    const first = defaultNode("rectangle", 0, 0);
    const second = defaultNode("ellipse", 50, 50);
    const locked = defaultNode("rectangle", 100, 100);
    locked.locked = true;
    session.document.nodes = { [first.id]: first, [second.id]: second, [locked.id]: locked };
    session.document.rootIds = [first.id, second.id, locked.id];
    session.selectAll();
    expect(session.selectedIds).toEqual([first.id, second.id]);
  });

  it("navigates to parent and first child", () => {
    const session = new EditorSession(opened());
    const frame = defaultNode("frame", 0, 0, { width: 200, height: 200 });
    const child = defaultNode("rectangle", 10, 10, { parentId: frame.id });
    if (frame.type !== "frame") throw new Error("expected a frame");
    frame.childIds = [child.id];
    session.document.nodes = { [frame.id]: frame, [child.id]: child };
    session.document.rootIds = [frame.id];
    session.select(child.id);
    session.selectParent();
    expect(session.selectedIds).toEqual([frame.id]);
    session.selectFirstChild();
    expect(session.selectedIds).toEqual([child.id]);
  });

  it("arranges layers front, back, forward, and backward", () => {
    const session = new EditorSession(opened());
    const first = defaultNode("rectangle", 0, 0);
    const second = defaultNode("rectangle", 10, 10);
    const third = defaultNode("rectangle", 20, 20);
    session.document.nodes = { [first.id]: first, [second.id]: second, [third.id]: third };
    session.document.rootIds = [first.id, second.id, third.id];

    session.selectedIds = [first.id];
    session.arrange("front");
    expect(session.document.rootIds[2]).toBe(first.id);

    session.selectedIds = [first.id];
    session.arrange("back");
    expect(session.document.rootIds[0]).toBe(first.id);

    session.selectedIds = [first.id];
    session.arrange("forward");
    expect(session.document.rootIds.indexOf(first.id)).toBe(1);

    session.selectedIds = [third.id];
    session.arrange("backward");
    expect(session.document.rootIds.indexOf(third.id)).toBe(1);
  });

  it("nudges selected nodes by the given delta", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 20);
    session.addNode(node);
    session.nudge(5, -3);
    expect(session.document.nodes[node.id].x).toBe(15);
    expect(session.document.nodes[node.id].y).toBe(17);
    session.undo();
    expect(session.document.nodes[node.id].x).toBe(10);
  });

  it("cuts the selection to the clipboard and deletes it", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 20);
    session.addNode(node);
    session.cut();
    expect(session.clipboard).toBeTruthy();
    expect(session.clipboard!.rootIds).toContain(node.id);
    expect(session.document.nodes[node.id]).toBeUndefined();
  });

  it("discards a gesture without rolling back or recording history", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 10);
    session.addNode(node);
    session.beginGesture();
    session.document.nodes[node.id].x = 999;
    session.discardGesture();
    expect(session.hasActiveGesture).toBe(false);
    expect(session.document.nodes[node.id].x).toBe(999);
  });

  it("switches the active tool and bumps the interrupt token", () => {
    const session = new EditorSession(opened());
    expect(session.activeTool).toBe("select");
    session.setActiveTool("frame");
    expect(session.activeTool).toBe("frame");
    expect(session.toolChangeToken).toBe(1);
    session.setActiveTool("frame");
    expect(session.toolChangeToken).toBe(1);
  });

  it("syncs autoWidth when updating text node properties", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("text", 0, 0, { text: "Hello", autoWidth: true });
    session.addNode(node);
    session.updateSelected({ autoWidth: false });
    expect(session.document.nodes[node.id].textAutoResize).toBe("height");
    session.updateSelected({ textAutoResize: "width-and-height" });
    expect(session.document.nodes[node.id].autoWidth).toBe(true);
  });

  it("groups selection as a frame instead of a group", () => {
    const session = new EditorSession(opened());
    const first = defaultNode("rectangle", 10, 20, { width: 40, height: 30 });
    const second = defaultNode("rectangle", 60, 70, { width: 40, height: 30 });
    session.addNode(first);
    session.addNode(second);
    session.selectedIds = [first.id, second.id];
    session.groupSelection(true);
    const container = session.selectedNodes[0];
    expect(container.type).toBe("frame");
    expect(container.clipContent).toBe(true);
  });

  it("reparents a layer into another frame while preserving world position", () => {
    const session = new EditorSession(opened());
    const frameA = defaultNode("frame", 0, 0, { width: 300, height: 300 });
    const frameB = defaultNode("frame", 500, 500, { width: 300, height: 300 });
    const card = defaultNode("rectangle", 50, 60, { width: 80, height: 40, parentId: frameA.id });
    if (frameA.type !== "frame" || frameB.type !== "frame") throw new Error("expected frames");
    frameA.childIds = [card.id];
    session.document.nodes = { [frameA.id]: frameA, [frameB.id]: frameB, [card.id]: card };
    session.document.rootIds = [frameA.id, frameB.id];
    const before = worldBounds(session.document, card);
    session.selectedIds = [card.id];
    session.reparentSelection(frameB.id);
    const after = worldBounds(session.document, session.document.nodes[card.id]);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
    expect(session.document.nodes[card.id].parentId).toBe(frameB.id);
  });

  it("prevents reparenting into a descendant cycle", () => {
    const session = new EditorSession(opened());
    const frame = defaultNode("frame", 0, 0, { width: 200, height: 200 });
    const child = defaultNode("rectangle", 10, 10, { parentId: frame.id });
    if (frame.type !== "frame") throw new Error("expected a frame");
    frame.childIds = [child.id];
    session.document.nodes = { [frame.id]: frame, [child.id]: child };
    session.document.rootIds = [frame.id];
    session.selectedIds = [frame.id];
    session.reparentSelection(child.id);
    expect(session.document.nodes[frame.id].parentId).toBeNull();
  });

  it("resets state when switching pages", () => {
    const session = new EditorSession(opened());
    const node = defaultNode("rectangle", 10, 20);
    session.addNode(node);
    const newPage = { id: "page2", fileId: "file", name: "Page 2", position: 1, revision: 0 };
    const newDoc = emptyDocument();
    session.setPage(newPage, newDoc);
    expect(session.page.id).toBe("page2");
    expect(session.document.rootIds).toEqual([]);
    expect(session.selectedIds).toEqual([]);
    expect(session.undoStack).toBeUndefined;
  });

  it("skips locked nodes in deleteSelection but removes unlocked descendants", () => {
    const session = new EditorSession(opened());
    const frame = defaultNode("frame", 0, 0, { width: 200, height: 200 });
    const locked = defaultNode("rectangle", 10, 10, { parentId: frame.id, locked: true });
    if (frame.type !== "frame") throw new Error("expected a frame");
    frame.childIds = [locked.id];
    session.document.nodes = { [frame.id]: frame, [locked.id]: locked };
    session.document.rootIds = [frame.id];
    session.selectedIds = [frame.id];
    session.deleteSelection();
    expect(session.document.nodes[frame.id]).toBeUndefined();
    expect(session.document.nodes[locked.id]).toBeUndefined();
  });
});

describe("variable management", () => {
  it("creates a variable collection with a default mode", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    expect(collection.name).toBe("Theme");
    expect(collection.modes).toHaveLength(1);
    expect(collection.modes[0].name).toBe("Default");
    expect(session.document.variableCollections).toHaveLength(1);
  });

  it("adds modes to a collection", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const mode = session.addMode(collection.id, "Dark");
    expect(mode).not.toBeNull();
    expect(mode!.name).toBe("Dark");
    expect(session.document.variableCollections[0].modes).toHaveLength(2);
  });

  it("creates variables with default values across all modes", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    session.addMode(collection.id, "Dark");
    const variable = session.createVariable(collection.id, "Primary", "color");
    expect(variable).not.toBeNull();
    expect(variable!.name).toBe("Primary");
    expect(variable!.type).toBe("color");
    const updated = session.document.variableCollections[0];
    for (const mode of updated.modes) {
      expect(mode.values[variable!.id]).toEqual({ value: "#6366f1" });
    }
  });

  it("renames a collection", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Old Name");
    session.renameCollection(collection.id, "New Name");
    expect(session.document.variableCollections[0].name).toBe("New Name");
  });

  it("renames a mode", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const mode = session.addMode(collection.id, "Mode 1");
    session.renameMode(collection.id, mode!.id, "Dark Mode");
    expect(session.document.variableCollections[0].modes[1].name).toBe("Dark Mode");
  });

  it("deletes a collection and unbinds nodes", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const variable = session.createVariable(collection.id, "Primary", "color");
    const rect = defaultNode("rectangle", 0, 0);
    session.addNode(rect);
    session.bindVariable(rect.id, "fill", variable!.id);
    expect(session.document.nodes[rect.id].boundVariables).toEqual({ fill: variable!.id });
    session.deleteCollection(collection.id);
    expect(session.document.variableCollections).toHaveLength(0);
    expect(session.document.variables).toHaveLength(0);
    expect(session.document.nodes[rect.id].boundVariables).toBeUndefined();
  });

  it("deletes a mode but not the last one", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const mode = session.addMode(collection.id, "Dark");
    const deleted = session.deleteMode(collection.id, mode!.id);
    expect(deleted).toBe(true);
    expect(session.document.variableCollections[0].modes).toHaveLength(1);
    const notDeleted = session.deleteMode(collection.id, collection.defaultModeId);
    expect(notDeleted).toBe(false);
    expect(session.document.variableCollections[0].modes).toHaveLength(1);
  });

  it("tracks active mode per collection", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const dark = session.addMode(collection.id, "Dark");
    expect(session.getActiveModeId(collection.id)).toBe(collection.defaultModeId);
    session.setActiveMode(collection.id, dark!.id);
    expect(session.getActiveModeId(collection.id)).toBe(dark!.id);
  });

  it("resolves variable values for the active mode", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const variable = session.createVariable(collection.id, "Primary", "color");
    expect(session.resolveVariableValue(variable!.id)).toBe("#6366f1");
    const dark = session.addMode(collection.id, "Dark");
    session.setVariableModeValue(variable!.id, dark!.id, "#1a1a2e");
    session.setActiveMode(collection.id, dark!.id);
    expect(session.resolveVariableValue(variable!.id)).toBe("#1a1a2e");
  });

  it("binds and unbinds variables to node properties", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const variable = session.createVariable(collection.id, "Primary", "color");
    const rect = defaultNode("rectangle", 0, 0);
    session.addNode(rect);
    session.bindVariable(rect.id, "fill", variable!.id);
    expect(session.document.nodes[rect.id].boundVariables).toEqual({ fill: variable!.id });
    session.unbindVariable(rect.id, "fill");
    expect(session.document.nodes[rect.id].boundVariables).toBeUndefined();
  });

  it("sets a variable mode value", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const variable = session.createVariable(collection.id, "Spacing", "number");
    session.setVariableModeValue(variable!.id, collection.defaultModeId, 16);
    const mode = session.document.variableCollections[0].modes[0];
    expect(mode.values[variable!.id]).toEqual({ value: 16 });
  });

  it("deletes a variable and cleans up mode values", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const variable = session.createVariable(collection.id, "Primary", "color");
    session.deleteVariable(variable!.id);
    expect(session.document.variables).toHaveLength(0);
    expect(session.document.variableCollections[0].modes[0].values[variable!.id]).toBeUndefined();
  });

  it("computes allVariableValues reactively across modes", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const variable = session.createVariable(collection.id, "Primary", "color");
    expect(session.allVariableValues.get(variable!.id)).toBe("#6366f1");
    const dark = session.addMode(collection.id, "Dark");
    session.setVariableModeValue(variable!.id, dark!.id, "#1a1a2e");
    session.setActiveMode(collection.id, dark!.id);
    expect(session.allVariableValues.get(variable!.id)).toBe("#1a1a2e");
    session.setActiveMode(collection.id, collection.defaultModeId);
    expect(session.allVariableValues.get(variable!.id)).toBe("#6366f1");
  });

  it("does not overwrite existing variable value on bind", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const variable = session.createVariable(collection.id, "Primary", "color");
    // The createVariable sets a default value of "#6366f1"
    const rect = defaultNode("rectangle", 0, 0);
    rect.fill = { type: "solid", color: "#00ff00", opacity: 1 };
    session.addNode(rect);
    session.bindVariable(rect.id, "fill", variable!.id);
    // Variable keeps its original value since it was already set by createVariable
    expect(session.resolveVariableValue(variable!.id)).toBe("#6366f1");
  });

  it("syncs bound variable values into node properties", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const colorVar = session.createVariable(collection.id, "Primary", "color");
    const opacityVar = session.createVariable(collection.id, "Alpha", "number");
    session.setVariableModeValue(colorVar!.id, collection.defaultModeId, "#ff0000");
    session.setVariableModeValue(opacityVar!.id, collection.defaultModeId, 0.5);
    const rect = defaultNode("rectangle", 0, 0);
    rect.fill = { type: "solid", color: "#00ff00", opacity: 1 };
    rect.opacity = 1;
    session.addNode(rect);
    session.bindVariable(rect.id, "fill", colorVar!.id);
    session.bindVariable(rect.id, "opacity", opacityVar!.id);
    // Before sync, node still has original values
    expect((session.document.nodes[rect.id].fill as { color: string }).color).toBe("#00ff00");
    expect(session.document.nodes[rect.id].opacity).toBe(1);
    // After sync, node properties should reflect resolved variable values
    session.syncBoundVariables();
    expect((session.document.nodes[rect.id].fill as { color: string }).color).toBe("#ff0000");
    expect(session.document.nodes[rect.id].opacity).toBe(0.5);
  });

  it("syncs nested property paths like stroke.color", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const strokeVar = session.createVariable(collection.id, "Border", "color");
    session.setVariableModeValue(strokeVar!.id, collection.defaultModeId, "#aabbcc");
    const rect = defaultNode("rectangle", 0, 0);
    rect.stroke = { color: "#112233", opacity: 1, width: 2 };
    session.addNode(rect);
    session.bindVariable(rect.id, "stroke.color", strokeVar!.id);
    session.syncBoundVariables();
    expect(session.document.nodes[rect.id].stroke!.color).toBe("#aabbcc");
  });

  it("syncs gradient stop colors via dotted path", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const stopVar = session.createVariable(collection.id, "StartColor", "color");
    session.setVariableModeValue(stopVar!.id, collection.defaultModeId, "#abcdef");
    const rect = defaultNode("rectangle", 0, 0);
    rect.fill = {
      type: "linear-gradient",
      angle: 90,
      stops: [
        { offset: 0, color: "#000000", opacity: 1 },
        { offset: 1, color: "#ffffff", opacity: 1 },
      ],
    };
    session.addNode(rect);
    session.bindVariable(rect.id, "fill.stops.0.color", stopVar!.id);
    session.syncBoundVariables();
    const fill = session.document.nodes[rect.id].fill as { stops: { color: string }[] };
    expect(fill.stops[0].color).toBe("#abcdef");
    expect(fill.stops[1].color).toBe("#ffffff"); // unchanged
  });

  it("sync respects active mode when syncing", () => {
    const session = new EditorSession(opened());
    const collection = session.createVariableCollection("Theme");
    const variable = session.createVariable(collection.id, "Primary", "color");
    const dark = session.addMode(collection.id, "Dark");
    session.setVariableModeValue(variable!.id, collection.defaultModeId, "#ffffff");
    session.setVariableModeValue(variable!.id, dark!.id, "#000000");
    const rect = defaultNode("rectangle", 0, 0);
    rect.fill = { type: "solid", color: "#cccccc", opacity: 1 };
    session.addNode(rect);
    session.bindVariable(rect.id, "fill", variable!.id);
    // Default mode → white
    session.syncBoundVariables();
    expect((session.document.nodes[rect.id].fill as { color: string }).color).toBe("#ffffff");
    // Switch to dark mode → black
    session.setActiveMode(collection.id, dark!.id);
    session.syncBoundVariables();
    expect((session.document.nodes[rect.id].fill as { color: string }).color).toBe("#000000");
  });
});
