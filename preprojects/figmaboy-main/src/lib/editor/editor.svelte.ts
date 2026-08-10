import type { ColorStyle, ComponentDefinition, ContainerNode, DesignFile, DesignNode, EffectStyle, LayoutMode, OpenedFile, PageDocument, PageMeta, Rect, TextStyle, Tool, Variable, VariableCollection, VariableMode } from "$lib/domain";
import { cloneDocument, defaultNode, uid } from "$lib/domain";
import { sanitizeDocument } from "$lib/document-validation";
import { identity, invert, multiply, selectionBounds, transformPoint, worldBounds, worldMatrix, worldToNodeLocal } from "$lib/geometry";
import { syncTextSize } from "$lib/text-layout";
import type { Matrix } from "$lib/geometry";
import { applyAutoLayout } from "$lib/editor/auto-layout";

interface HistoryEntry {
  before: PageDocument;
  after: PageDocument;
}

interface ClipboardPayload {
  nodes: DesignNode[];
  rootIds: string[];
}

function childIds(node: DesignNode): string[] {
  return node.type === "frame" || node.type === "group" ? node.childIds : [];
}

/** Read a property value from a node, supporting dotted paths (e.g. "fill.color", "fill.stops.0.color"). */
function getNodePropertyValue(node: DesignNode, property: string): string | number | boolean | undefined {
  const parts = property.split(".");
  let current: unknown = node;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  if (typeof current === "string" || typeof current === "number" || typeof current === "boolean") return current;
  return undefined;
}

/** Write a property value on a node, supporting dotted paths. Creates intermediate objects as needed. */
function setNodePropertyValue(node: DesignNode, property: string, value: string | number | boolean): void {
  const parts = property.split(".");
  let current: unknown = node;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current == null || typeof current !== "object") return;
    const next = (current as Record<string, unknown>)[parts[i]];
    if (next == null || typeof next !== "object") return;
    current = next;
  }
  if (current == null || typeof current !== "object") return;
  (current as Record<string, unknown>)[parts[parts.length - 1]] = value;
}

function gatherSubtree(document: PageDocument, ids: string[]): DesignNode[] {
  const result: DesignNode[] = [];
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id)) return;
    const node = document.nodes[id];
    if (!node) return;
    seen.add(id);
    result.push(JSON.parse(JSON.stringify(node)) as DesignNode);
    childIds(node).forEach(visit);
  };
  ids.forEach(visit);
  return result;
}

function parseClipboardPayload(value: unknown): ClipboardPayload | null {
  if (!value || typeof value !== "object") return null;
  const source = value as { nodes?: unknown; rootIds?: unknown };
  if (!Array.isArray(source.nodes) || !Array.isArray(source.rootIds) || source.nodes.length > 10_000) return null;
  const rootIds = source.rootIds.filter((id): id is string => typeof id === "string");
  if (!rootIds.length) return null;
  const nodes = Object.fromEntries(source.nodes.flatMap((node) => {
    if (!node || typeof node !== "object" || typeof (node as { id?: unknown }).id !== "string") return [];
    return [[(node as { id: string }).id, node]];
  }));
  if (!rootIds.some((id) => Boolean(nodes[id]))) return null;
  const { document } = sanitizeDocument({ schemaVersion: 2, rootIds, nodes, viewport: { x: 0, y: 0, zoom: 1 }, prototypeStartFrameId: null });
  const roots = document.rootIds.filter((id) => rootIds.includes(id));
  if (!roots.length) return null;
  return { nodes: gatherSubtree(document, roots), rootIds: roots };
}

function removeFromParent(document: PageDocument, node: DesignNode): void {
  if (!node.parentId) {
    document.rootIds = document.rootIds.filter((id) => id !== node.id);
    return;
  }
  const parent = document.nodes[node.parentId];
  if (parent?.type === "frame" || parent?.type === "group") parent.childIds = parent.childIds.filter((id) => id !== node.id);
}

function applyLocalMatrix(node: DesignNode, matrix: Matrix): void {
  const rotation = Math.atan2(matrix.b, matrix.a);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const centerX = node.width / 2;
  const centerY = node.height / 2;
  node.rotation = (rotation * 180) / Math.PI;
  node.x = matrix.e - centerX + cos * centerX - sin * centerY;
  node.y = matrix.f - centerY + sin * centerX + cos * centerY;
}

function normalizeTextSizes(document: PageDocument): void {
  for (const node of Object.values(document.nodes)) if (node.type === "text") syncTextSize(node);
}

export class EditorSession {
  file = $state<DesignFile>({} as DesignFile);
  pages = $state<PageMeta[]>([]);
  page = $state<PageMeta>({} as PageMeta);
  document = $state<PageDocument>({} as PageDocument);
  selectedIds = $state<string[]>([]);
  activeTool = $state<Tool>("select");
  toolChangeToken = $state(0);
  gestureVersion = $state(0);
  persistencePaused = $state(false);
  cancelInteractionToken = $state(0);
  leftTab = $state<"file" | "assets">("file");
  inspectorTab = $state<"design" | "prototype">("design");
  saveStatus = $state<"saved" | "dirty" | "saving" | "error" | "conflict">("saved");
  errorMessage = $state("");
  changeToken = $state(0);
  thumbnailChangeToken = $state(0);
  thumbnailDirty = $state(false);
  editingTextId = $state<string | null>(null);
  imageSources = $state<Record<string, string>>({});
  clipboard = $state<ClipboardPayload | null>(null);
  guides = $state<{ x: number | null; y: number | null }>({ x: null, y: null });
  userGuides = $state<{ id: string; type: "h" | "v"; value: number }[]>([]);
  rulerDrag = $state<{ id: string; type: "h" | "v"; isNew: boolean } | null>(null);
  activeModes = $state<Map<string, string>>(new Map());

  allVariableValues = $derived.by(() => {
    const map = new Map<string, string | number | boolean>();
    for (const variable of this.document.variables) {
      const collection = this.document.variableCollections.find((c) => c.id === variable.collectionId);
      if (!collection) continue;
      const modeId = this.activeModes.get(collection.id) ?? collection.defaultModeId;
      const mode = collection.modes.find((m) => m.id === modeId);
      if (!mode) continue;
      const val = mode.values[variable.id];
      if (val !== undefined) map.set(variable.id, val.value);
    }
    return map;
  });

  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private gestureBefore: PageDocument | null = null;
  private pasteCount = 0;

  constructor(opened: OpenedFile) {
    this.file = opened.file;
    this.pages = opened.pages;
    this.page = opened.page;
    const sanitized = sanitizeDocument(opened.document);
    this.document = sanitized.document;
    normalizeTextSizes(this.document);
    if (sanitized.recovered) {
      this.changeToken = 1;
      this.thumbnailChangeToken = 1;
      this.thumbnailDirty = true;
      this.saveStatus = "dirty";
    }
  }

  get selectedNodes(): DesignNode[] {
    return this.selectedIds.map((id) => this.document.nodes[id]).filter(Boolean);
  }

  get bounds(): Rect | null {
    return selectionBounds(this.document, this.selectedIds);
  }

  snapshot(): PageDocument { return cloneDocument(this.document); }

  private selectionRoots(ids = this.selectedIds): DesignNode[] {
    const selected = new Set(ids.filter((id) => Boolean(this.document.nodes[id])));
    return [...selected].flatMap((id) => {
      const node = this.document.nodes[id];
      if (!node) return [];
      let parentId = node.parentId;
      while (parentId) {
        if (selected.has(parentId)) return [];
        parentId = this.document.nodes[parentId]?.parentId ?? null;
      }
      return [node];
    });
  }

  private restoreHistorySnapshot(snapshot: PageDocument): void {
    const viewport = { ...this.document.viewport };
    this.document = cloneDocument(snapshot);
    this.document.viewport = viewport;
  }

  private changed(refreshThumbnail = true): void {
    this.changeToken += 1;
    if (refreshThumbnail) {
      this.thumbnailChangeToken += 1;
      this.thumbnailDirty = true;
    }
    this.saveStatus = "dirty";
  }

  replaceDocumentFromExternal(next: PageDocument): void {
    this.cancelGesture();
    const before = this.snapshot();
    this.document = sanitizeDocument(next).document;
    normalizeTextSizes(this.document);
    this.undoStack.push({ before, after: this.snapshot() });
    if (this.undoStack.length > 100) this.undoStack.shift();
    this.redoStack = [];
    this.selectedIds = this.selectedIds.filter((id) => Boolean(this.document.nodes[id]));
    this.changed();
  }

  mutate(mutator: (document: PageDocument) => void, record = true): void {
    if (record && this.gestureBefore) this.cancelGesture();
    const before = record ? this.snapshot() : null;
    mutator(this.document);
    if (!record) return;
    if (record && before) {
      const after = this.snapshot();
      if (JSON.stringify(before) === JSON.stringify(after)) return;
      this.undoStack.push({ before, after });
      if (this.undoStack.length > 100) this.undoStack.shift();
      this.redoStack = [];
    }
    this.changed();
  }

  beginGesture(): void {
    if (!this.gestureBefore) {
      this.gestureBefore = this.snapshot();
      this.gestureVersion += 1;
    }
  }

  gestureChanged(): void { this.changed(); }

  viewportChanged(): void { this.changed(false); }

  /** Notify Svelte of a temporary preview without making it eligible for autosave. */
  previewGesture(): void { /* deep $state mutations are already reactive */ }

  commitGesture(): void {
    if (!this.gestureBefore) return;
    const after = this.snapshot();
    if (JSON.stringify(this.gestureBefore) !== JSON.stringify(after)) {
      this.undoStack.push({ before: this.gestureBefore, after });
      if (this.undoStack.length > 100) this.undoStack.shift();
      this.redoStack = [];
      this.changed();
    }
    this.gestureBefore = null;
    this.gestureVersion += 1;
  }

  cancelGesture(): void {
    if (!this.gestureBefore) return;
    this.document = this.gestureBefore;
    this.gestureBefore = null;
    this.gestureVersion += 1;
  }

  discardGesture(): void {
    if (this.gestureBefore) this.gestureVersion += 1;
    this.gestureBefore = null;
  }

  get hasActiveGesture(): boolean { return this.gestureBefore !== null; }

  undo(): void {
    this.cancelGesture();
    const entry = this.undoStack.pop();
    if (!entry) return;
    this.restoreHistorySnapshot(entry.before);
    this.redoStack.push(entry);
    this.selectedIds = this.selectedIds.filter((id) => Boolean(this.document.nodes[id]));
    this.changed();
  }

  redo(): void {
    this.cancelGesture();
    const entry = this.redoStack.pop();
    if (!entry) return;
    this.restoreHistorySnapshot(entry.after);
    this.undoStack.push(entry);
    this.selectedIds = this.selectedIds.filter((id) => Boolean(this.document.nodes[id]));
    this.changed();
  }

  select(id: string | null, additive = false, includeLocked = false): void {
    if (!id) { this.selectedIds = []; return; }
    const node = this.document.nodes[id];
    if (!node || (node.locked && !includeLocked)) return;
    if (additive) {
      if (this.selectedIds.includes(id)) {
        this.selectedIds = this.selectedIds.filter((item) => item !== id);
        return;
      }
      const isAncestor = (ancestorId: string, childId: string) => {
        let parentId = this.document.nodes[childId]?.parentId ?? null;
        while (parentId) {
          if (parentId === ancestorId) return true;
          parentId = this.document.nodes[parentId]?.parentId ?? null;
        }
        return false;
      };
      this.selectedIds = [...this.selectedIds.filter((selectedId) => !isAncestor(id, selectedId) && !isAncestor(selectedId, id)), id];
    }
    else this.selectedIds = [id];
  }

  setSelection(ids: string[], mode: "replace" | "add" | "subtract" = "replace"): void {
    const valid = [...new Set(ids)].filter((id) => {
      const node = this.document.nodes[id];
      return Boolean(node?.visible && !node.locked);
    });
    const combined = mode === "add" ? [...this.selectedIds, ...valid]
      : mode === "subtract" ? this.selectedIds.filter((id) => !valid.includes(id))
      : valid;
    const selected = new Set(combined.filter((id) => Boolean(this.document.nodes[id])));
    this.selectedIds = [...selected].filter((id) => {
      let parentId = this.document.nodes[id]?.parentId ?? null;
      while (parentId) {
        if (selected.has(parentId)) return false;
        parentId = this.document.nodes[parentId]?.parentId ?? null;
      }
      return true;
    });
  }

  setActiveTool(tool: Tool, interrupt = true): void {
    if (this.activeTool === tool) return;
    this.activeTool = tool;
    if (interrupt) this.toolChangeToken += 1;
  }

  requestInteractionCancel(): void { this.cancelInteractionToken += 1; }

  addNode(node: DesignNode, parentId: string | null = null): void {
    node.parentId = parentId;
    this.mutate((document) => {
      document.nodes[node.id] = node;
      if (parentId) {
        const parent = document.nodes[parentId];
        if (parent?.type === "frame" || parent?.type === "group") parent.childIds.push(node.id);
        else document.rootIds.push(node.id);
      } else document.rootIds.push(node.id);
    });
    this.selectedIds = [node.id];
    this.setActiveTool("select", false);
  }

  updateSelected(patch: Partial<DesignNode>): void {
    if (!this.selectedIds.length) return;
    this.mutate((document) => {
      this.selectedIds.forEach((id) => {
        const node = document.nodes[id];
        if (node && (!node.locked || "locked" in patch || "visible" in patch)) {
          Object.assign(node, patch);
          if (node.type === "text") {
            if ("autoWidth" in patch && !("textAutoResize" in patch)) node.textAutoResize = node.autoWidth ? "width-and-height" : "height";
            if ("textAutoResize" in patch) node.autoWidth = node.textAutoResize === "width-and-height";
            syncTextSize(node);
          }
        }
      });
    });
  }

  deleteSelection(): void {
    if (!this.selectedIds.length) return;
    this.mutate((document) => {
      const remove = (id: string, descendant = false) => {
        const node = document.nodes[id];
        if (!node || (node.locked && !descendant)) return;
        childIds(node).forEach((childId) => remove(childId, true));
        removeFromParent(document, node);
        delete document.nodes[id];
      };
      this.selectionRoots().forEach((node) => remove(node.id));
    });
    this.selectedIds = [];
  }

  copy(): void {
    const roots = this.selectionRoots();
    if (!roots.length) return;
    this.clipboard = { nodes: gatherSubtree(this.document, roots.map((node) => node.id)), rootIds: roots.map((node) => node.id) };
    this.pasteCount = 0;
    navigator.clipboard?.writeText(`FIGMABOY:${JSON.stringify(this.clipboard)}`).catch(() => undefined);
  }

  cut(): void { this.copy(); this.deleteSelection(); }

  async paste(at?: { x: number; y: number }): Promise<void> {
    let payload = parseClipboardPayload(this.clipboard);
    if (!payload) {
      try {
        const text = await navigator.clipboard?.readText();
        if (text?.startsWith("FIGMABOY:")) payload = parseClipboardPayload(JSON.parse(text.slice(10)));
      } catch { /* clipboard permission is optional */ }
    }
    if (!payload) return;
    const map = new Map<string, string>();
    payload.nodes.forEach((node) => map.set(node.id, uid("node")));
    const rootSet = new Set(payload.rootIds);
    const roots = payload.nodes.filter((node) => rootSet.has(node.id));
    const bounds = roots.length ? {
      x: Math.min(...roots.map((node) => node.x)), y: Math.min(...roots.map((node) => node.y)),
      width: 0, height: 0,
    } : { x: 0, y: 0, width: 0, height: 0 };
    const cascade = 24 * (this.pasteCount + 1);
    const offset = at ? { x: at.x - bounds.x, y: at.y - bounds.y } : { x: cascade, y: cascade };
    const pastedRoots: string[] = [];
    this.mutate((document) => {
      payload!.nodes.forEach((source) => {
        const copy = JSON.parse(JSON.stringify(source)) as DesignNode;
        copy.id = map.get(source.id)!;
        copy.name = `${source.name} copy`;
        copy.parentId = source.parentId && map.has(source.parentId) ? map.get(source.parentId)! : null;
        if (rootSet.has(source.id)) { copy.x += offset.x; copy.y += offset.y; pastedRoots.push(copy.id); }
        if (copy.type === "frame" || copy.type === "group") copy.childIds = copy.childIds.map((id) => map.get(id)!).filter(Boolean);
        document.nodes[copy.id] = copy;
      });
      document.rootIds.push(...pastedRoots);
    });
    this.selectedIds = pastedRoots;
    this.pasteCount += 1;
  }

  duplicateSelection(offset = { x: 24, y: 24 }, record = true): void {
    if (!this.selectedIds.length) return;
    const roots = this.selectionRoots();
    if (!roots.length) return;

    const sources = gatherSubtree(this.document, roots.map((node) => node.id));
    const idMap = new Map(sources.map((node) => [node.id, uid("node")]));
    const nextSelection: string[] = [];
    this.mutate((document) => {
      for (const source of sources) {
        const copy = JSON.parse(JSON.stringify(source)) as DesignNode;
        copy.id = idMap.get(source.id)!;
        copy.name = `${source.name} copy`;
        copy.parentId = source.parentId && idMap.has(source.parentId) ? idMap.get(source.parentId)! : source.parentId;
        if (roots.some((root) => root.id === source.id)) {
          copy.x += offset.x;
          copy.y += offset.y;
          nextSelection.push(copy.id);
        }
        if (copy.type === "frame" || copy.type === "group") {
          copy.childIds = copy.childIds.map((id) => idMap.get(id) ?? id);
        }
        document.nodes[copy.id] = copy;
      }

      for (const root of roots) {
        const copyId = idMap.get(root.id)!;
        const siblings = root.parentId
          ? (document.nodes[root.parentId] as Extract<DesignNode, { type: "frame" | "group" }> | undefined)?.childIds
          : document.rootIds;
        if (!siblings) continue;
        const sourceIndex = siblings.indexOf(root.id);
        siblings.splice(sourceIndex < 0 ? siblings.length : sourceIndex + 1, 0, copyId);
      }
    }, record);
    this.selectedIds = nextSelection;
  }

  duplicate(): void { this.duplicateSelection(); }

  selectAll(): void {
    this.selectedIds = this.document.rootIds.filter((id) => {
      const node = this.document.nodes[id];
      return node?.visible && !node.locked;
    });
  }

  selectParent(): void {
    const parentId = this.selectedNodes[0]?.parentId;
    if (parentId) this.select(parentId);
  }

  selectFirstChild(): void {
    const node = this.selectedNodes[0];
    if (node && (node.type === "frame" || node.type === "group") && node.childIds[0]) this.select(node.childIds[0]);
  }

  reparentSelection(parentId: string | null, record = true): void {
    const selected = new Set(this.selectedIds);
    const roots = this.selectedNodes.filter((node) => {
      let ancestorId = node.parentId;
      while (ancestorId) {
        if (selected.has(ancestorId)) return false;
        ancestorId = this.document.nodes[ancestorId]?.parentId ?? null;
      }
      return true;
    });
    if (!roots.length || roots.every((node) => node.parentId === parentId)) return;

    let ancestorId = parentId;
    while (ancestorId) {
      if (roots.some((node) => node.id === ancestorId)) return;
      ancestorId = this.document.nodes[ancestorId]?.parentId ?? null;
    }

    const worldMatrices = new Map(roots.map((node) => [node.id, worldMatrix(this.document, node)]));
    const parentWorld = parentId && this.document.nodes[parentId]
      ? worldMatrix(this.document, this.document.nodes[parentId])
      : identity;

    this.mutate((document) => {
      for (const node of roots) {
        const matrix = worldMatrices.get(node.id);
        if (!matrix) continue;
        removeFromParent(document, node);
        node.parentId = parentId;
        applyLocalMatrix(node, multiply(invert(parentWorld), matrix));
        if (parentId) {
          const parent = document.nodes[parentId];
          if (parent?.type === "frame" || parent?.type === "group") parent.childIds.push(node.id);
          else document.rootIds.push(node.id);
        } else document.rootIds.push(node.id);
      }
    }, record);
  }

  moveNode(id: string, parentId: string | null, index: number): void {
    const node = this.document.nodes[id];
    const parent = parentId ? this.document.nodes[parentId] : null;
    if (!node || node.locked || (parentId && parent?.type !== "frame" && parent?.type !== "group")) return;
    let ancestorId = parentId;
    while (ancestorId) {
      if (ancestorId === id) return;
      ancestorId = this.document.nodes[ancestorId]?.parentId ?? null;
    }
    const matrix = worldMatrix(this.document, node);
    const parentWorld = parent ? worldMatrix(this.document, parent) : identity;
    const sourceSiblings = node.parentId
      ? (this.document.nodes[node.parentId] as Extract<DesignNode, { type: "frame" | "group" }> | undefined)?.childIds
      : this.document.rootIds;
    const sourceIndex = sourceSiblings?.indexOf(id) ?? -1;
    const adjustedIndex = node.parentId === parentId && sourceIndex >= 0 && sourceIndex < index ? index - 1 : index;
    this.mutate((document) => {
      removeFromParent(document, node);
      node.parentId = parentId;
      applyLocalMatrix(node, multiply(invert(parentWorld), matrix));
      const siblings = parentId
        ? (document.nodes[parentId] as Extract<DesignNode, { type: "frame" | "group" }>).childIds
        : document.rootIds;
      siblings.splice(Math.max(0, Math.min(adjustedIndex, siblings.length)), 0, id);
    });
  }

  groupSelection(asFrame = false): void {
    const roots = this.selectionRoots().filter((node) => !node.locked);
    const parentIds = new Set(roots.map((node) => node.parentId));
    if (parentIds.size !== 1) return;
    const parentId = roots[0]?.parentId ?? null;
    const siblings = parentId
      ? (this.document.nodes[parentId] as Extract<DesignNode, { type: "frame" | "group" }> | undefined)?.childIds
      : this.document.rootIds;
    if (!siblings) return;
    const selected = new Set(roots.map((node) => node.id));
    const nodes = siblings.map((id) => this.document.nodes[id]).filter((node): node is DesignNode => Boolean(node) && selected.has(node.id));
    if (nodes.length < 1) return;
    const parentWorld = parentId && this.document.nodes[parentId] ? worldMatrix(this.document, this.document.nodes[parentId]) : identity;
    const toParent = invert(parentWorld);
    const corners = nodes.flatMap((node) => {
      const matrix = worldMatrix(this.document, node);
      return [
        transformPoint(toParent, transformPoint(matrix, { x: 0, y: 0 })),
        transformPoint(toParent, transformPoint(matrix, { x: node.width, y: 0 })),
        transformPoint(toParent, transformPoint(matrix, { x: node.width, y: node.height })),
        transformPoint(toParent, transformPoint(matrix, { x: 0, y: node.height })),
      ];
    });
    const left = Math.min(...corners.map((point) => point.x));
    const top = Math.min(...corners.map((point) => point.y));
    const right = Math.max(...corners.map((point) => point.x));
    const bottom = Math.max(...corners.map((point) => point.y));
    const insertionIndex = Math.min(...nodes.map((node) => siblings.indexOf(node.id)).filter((index) => index >= 0));
    const worldMatrices = new Map(nodes.map((node) => [node.id, worldMatrix(this.document, node)]));
    const container = defaultNode(asFrame ? "frame" : "group", left, top, {
      width: Math.max(1, right - left), height: Math.max(1, bottom - top), parentId,
      fill: asFrame ? { type: "solid", color: "#ffffff", opacity: 1 } : null,
      childIds: nodes.map((node) => node.id), clipContent: asFrame,
    } as Partial<DesignNode>);
    this.mutate((document) => {
      nodes.forEach((node) => {
        removeFromParent(document, node);
        node.parentId = container.id;
      });
      document.nodes[container.id] = container;
      const containerWorld = worldMatrix(document, container);
      for (const node of nodes) {
        const matrix = worldMatrices.get(node.id);
        if (matrix) applyLocalMatrix(node, multiply(invert(containerWorld), matrix));
      }
      if (parentId) {
        const parent = document.nodes[parentId];
        if (parent?.type === "frame" || parent?.type === "group") parent.childIds.splice(Math.min(insertionIndex, parent.childIds.length), 0, container.id);
      } else document.rootIds.splice(Math.min(insertionIndex, document.rootIds.length), 0, container.id);
    });
    this.selectedIds = [container.id];
  }

  ungroupSelection(): void {
    const containers = this.selectionRoots().filter((node): node is Extract<DesignNode, { type: "group" | "frame" }> => !node.locked && (node.type === "group" || node.type === "frame"));
    if (!containers.length) return;
    const nextSelection: string[] = [];
    const worldMatrices = new Map(containers.flatMap((container) => container.childIds.flatMap((id) => {
      const child = this.document.nodes[id];
      return child ? [[id, worldMatrix(this.document, child)] as const] : [];
    })));
    this.mutate((document) => {
      containers.forEach((container) => {
        const parentId = container.parentId;
        const siblings = parentId
          ? (document.nodes[parentId] as Extract<DesignNode, { type: "frame" | "group" }> | undefined)?.childIds
          : document.rootIds;
        const insertionIndex = Math.max(0, siblings?.indexOf(container.id) ?? 0);
        removeFromParent(document, container);
        const parentWorld = parentId && document.nodes[parentId] ? worldMatrix(document, document.nodes[parentId]) : identity;
        for (const [offset, id] of container.childIds.entries()) {
          const child = document.nodes[id];
          if (!child) continue;
          child.parentId = parentId;
          const matrix = worldMatrices.get(id);
          if (matrix) applyLocalMatrix(child, multiply(invert(parentWorld), matrix));
          nextSelection.push(id);
          if (parentId) {
            const parent = document.nodes[parentId];
            if (parent?.type === "frame" || parent?.type === "group") parent.childIds.splice(insertionIndex + offset, 0, id);
          } else document.rootIds.splice(insertionIndex + offset, 0, id);
        }
        delete document.nodes[container.id];
      });
    });
    this.selectedIds = nextSelection;
  }

  arrange(direction: "front" | "back" | "forward" | "backward"): void {
    const roots = this.selectionRoots();
    if (!roots.length) return;
    this.mutate((document) => {
      const byParent = new Map<string | null, Set<string>>();
      for (const node of roots) {
        const ids = byParent.get(node.parentId) ?? new Set<string>();
        ids.add(node.id);
        byParent.set(node.parentId, ids);
      }
      for (const [parentId, selectedIds] of byParent) {
        const list = parentId && (document.nodes[parentId]?.type === "frame" || document.nodes[parentId]?.type === "group")
          ? (document.nodes[parentId] as Extract<DesignNode, { type: "frame" | "group" }>).childIds : document.rootIds;
        if (direction === "front" || direction === "back") {
          const moving = list.filter((id) => selectedIds.has(id));
          const remaining = list.filter((id) => !selectedIds.has(id));
          list.splice(0, list.length, ...(direction === "front" ? [...remaining, ...moving] : [...moving, ...remaining]));
          continue;
        }
        if (direction === "forward") {
          for (let index = list.length - 2; index >= 0; index -= 1) {
            if (selectedIds.has(list[index]) && !selectedIds.has(list[index + 1])) [list[index], list[index + 1]] = [list[index + 1], list[index]];
          }
        } else {
          for (let index = 1; index < list.length; index += 1) {
            if (selectedIds.has(list[index]) && !selectedIds.has(list[index - 1])) [list[index], list[index - 1]] = [list[index - 1], list[index]];
          }
        }
      }
    });
  }

  alignSelection(kind: "left" | "center" | "right" | "top" | "middle" | "bottom"): void {
    const nodes = this.selectionRoots().filter((node) => !node.locked);
    const bounds = selectionBounds(this.document, nodes.map((node) => node.id));
    if (nodes.length < 2 || !bounds) return;
    this.mutate((document) => {
      for (const node of nodes) {
        const nodeBounds = worldBounds(document, node);
        let dx = 0;
        let dy = 0;
        if (kind === "left") dx = bounds.x - nodeBounds.x;
        if (kind === "center") dx = bounds.x + bounds.width / 2 - (nodeBounds.x + nodeBounds.width / 2);
        if (kind === "right") dx = bounds.x + bounds.width - (nodeBounds.x + nodeBounds.width);
        if (kind === "top") dy = bounds.y - nodeBounds.y;
        if (kind === "middle") dy = bounds.y + bounds.height / 2 - (nodeBounds.y + nodeBounds.height / 2);
        if (kind === "bottom") dy = bounds.y + bounds.height - (nodeBounds.y + nodeBounds.height);
        const localStart = worldToNodeLocal(document, node.parentId, { x: 0, y: 0 });
        const localEnd = worldToNodeLocal(document, node.parentId, { x: dx, y: dy });
        node.x += localEnd.x - localStart.x;
        node.y += localEnd.y - localStart.y;
      }
    });
  }

  nudge(dx: number, dy: number, record = true): void {
    if (!this.selectedIds.length) return;
    const apply = (document: PageDocument) => {
      this.selectedIds.forEach((id) => {
        const node = document.nodes[id];
        if (node && !node.locked) { node.x += dx; node.y += dy; }
      });
    };
    if (record) this.mutate(apply);
    else { apply(this.document); this.previewGesture(); }
  }

  // ── User guide management (ruler guides) ────────────────────────────────
  addGuide(type: "h" | "v", value: number): string {
    const id = uid();
    this.userGuides = [...this.userGuides, { id, type, value }];
    return id;
  }

  updateGuide(id: string, value: number): void {
    const guide = this.userGuides.find((g) => g.id === id);
    if (guide) guide.value = value;
  }

  deleteGuide(id: string): void {
    this.userGuides = this.userGuides.filter((g) => g.id !== id);
  }

  clearRulerDrag(): void {
    this.rulerDrag = null;
  }

  // ── Style management ──────────────────────────────────────────────────

  createColorStyle(name: string, paint: ColorStyle["paint"]): ColorStyle {
    const style: ColorStyle = { id: uid("color"), name, paint };
    this.mutate((doc) => { doc.colorStyles = [...doc.colorStyles, style]; });
    return style;
  }

  createTextStyle(name: string, overrides: Partial<Pick<TextStyle, "fontFamily" | "fontSize" | "fontWeight" | "fontStyle" | "lineHeight" | "letterSpacing" | "textCase" | "textDecoration" | "paragraphSpacing">> = {}): TextStyle {
    const style: TextStyle = {
      id: uid("text"), name, fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 400,
      fontStyle: "normal", lineHeight: 1.5, letterSpacing: 0, textCase: "original",
      textDecoration: "none", paragraphSpacing: 0, ...overrides,
    };
    this.mutate((doc) => { doc.textStyles = [...doc.textStyles, style]; });
    return style;
  }

  createEffectStyle(name: string, effects: EffectStyle["effects"]): EffectStyle {
    const style: EffectStyle = { id: uid("effect"), name, effects };
    this.mutate((doc) => { doc.effectStyles = [...doc.effectStyles, style]; });
    return style;
  }

  deleteStyle(kind: "color" | "text" | "effect", id: string): void {
    this.mutate((doc) => {
      if (kind === "color") doc.colorStyles = doc.colorStyles.filter((s) => s.id !== id);
      if (kind === "text") doc.textStyles = doc.textStyles.filter((s) => s.id !== id);
      if (kind === "effect") doc.effectStyles = doc.effectStyles.filter((s) => s.id !== id);
      for (const node of Object.values(doc.nodes)) {
        if (kind === "color" && node.colorStyleId === id) node.colorStyleId = undefined;
        if (kind === "text" && node.textStyleId === id) node.textStyleId = undefined;
        if (kind === "effect" && node.effectStyleId === id) node.effectStyleId = undefined;
      }
    });
  }

  applyStyle(kind: "color" | "text" | "effect", styleId: string, nodeIds: string[] = this.selectedIds): void {
    this.mutate((doc) => {
      let style: ColorStyle | TextStyle | EffectStyle | undefined;
      if (kind === "color") style = doc.colorStyles.find((s) => s.id === styleId);
      if (kind === "text") style = doc.textStyles.find((s) => s.id === styleId);
      if (kind === "effect") style = doc.effectStyles.find((s) => s.id === styleId);
      if (!style) return;
      for (const id of nodeIds) {
        const node = doc.nodes[id];
        if (!node) continue;
        if (kind === "color") {
          node.colorStyleId = styleId;
          node.fill = JSON.parse(JSON.stringify((style as ColorStyle).paint));
        }
        if (kind === "text" && node.type === "text") {
          node.textStyleId = styleId;
          const ts = style as TextStyle;
          Object.assign(node, { fontFamily: ts.fontFamily, fontSize: ts.fontSize, fontWeight: ts.fontWeight, fontStyle: ts.fontStyle, lineHeight: ts.lineHeight, letterSpacing: ts.letterSpacing, textCase: ts.textCase, textDecoration: ts.textDecoration, paragraphSpacing: ts.paragraphSpacing });
        }
        if (kind === "effect") {
          node.effectStyleId = styleId;
          node.effects = JSON.parse(JSON.stringify((style as EffectStyle).effects));
        }
      }
    });
  }

  detachStyle(kind: "color" | "text" | "effect", nodeIds: string[] = this.selectedIds): void {
    this.mutate((doc) => {
      for (const id of nodeIds) {
        const node = doc.nodes[id];
        if (!node) continue;
        if (kind === "color") node.colorStyleId = undefined;
        if (kind === "text" && node.type === "text") node.textStyleId = undefined;
        if (kind === "effect") node.effectStyleId = undefined;
      }
    });
  }

  // ── Variable management ───────────────────────────────────────────────

  createVariableCollection(name: string): VariableCollection {
    const defaultMode: VariableMode = { id: uid("mode"), name: "Default", values: {} };
    const collection: VariableCollection = { id: uid("collection"), name, modes: [defaultMode], defaultModeId: defaultMode.id };
    this.mutate((doc) => { doc.variableCollections = [...doc.variableCollections, collection]; });
    return collection;
  }

  addMode(collectionId: string, name: string): VariableMode | null {
    let mode: VariableMode | null = null;
    this.mutate((doc) => {
      const collection = doc.variableCollections.find((c) => c.id === collectionId);
      if (!collection) return;
      mode = { id: uid("mode"), name, values: {} };
      collection.modes = [...collection.modes, mode];
    });
    return mode;
  }

  createVariable(collectionId: string, name: string, type: Variable["type"]): Variable | null {
    let variable: Variable | null = null;
    this.mutate((doc) => {
      const collection = doc.variableCollections.find((c) => c.id === collectionId);
      if (!collection) return;
      variable = { id: uid("variable"), name, collectionId, type };
      doc.variables = [...doc.variables, variable];
      const defaultValue: string | number | boolean = type === "color" ? "#6366f1" : type === "number" ? 0 : type === "string" ? "" : false;
      for (const mode of collection.modes) {
        mode.values[variable.id] = { value: defaultValue };
      }
    });
    return variable;
  }

  deleteVariable(id: string): void {
    this.mutate((doc) => {
      doc.variables = doc.variables.filter((v) => v.id !== id);
      for (const collection of doc.variableCollections) {
        for (const mode of collection.modes) {
          delete mode.values[id];
        }
      }
    });
  }

  setVariableModeValue(variableId: string, modeId: string, value: string | number | boolean): void {
    this.mutate((doc) => {
      const variable = doc.variables.find((v) => v.id === variableId);
      if (!variable) return;
      const collection = doc.variableCollections.find((c) => c.id === variable.collectionId);
      if (!collection) return;
      const mode = collection.modes.find((m) => m.id === modeId);
      if (!mode) return;
      mode.values[variableId] = { value };
    });
  }

  renameCollection(collectionId: string, name: string): void {
    this.mutate((doc) => {
      const collection = doc.variableCollections.find((c) => c.id === collectionId);
      if (collection) collection.name = name;
    });
  }

  renameMode(collectionId: string, modeId: string, name: string): void {
    this.mutate((doc) => {
      const collection = doc.variableCollections.find((c) => c.id === collectionId);
      if (!collection) return;
      const mode = collection.modes.find((m) => m.id === modeId);
      if (mode) mode.name = name;
    });
  }

  deleteCollection(collectionId: string): void {
    this.mutate((doc) => {
      const collection = doc.variableCollections.find((c) => c.id === collectionId);
      if (!collection) return;
      const variableIds = new Set(doc.variables.filter((v) => v.collectionId === collectionId).map((v) => v.id));
      // Unbind any nodes using variables from this collection
      for (const node of Object.values(doc.nodes)) {
        if (!node.boundVariables) continue;
        for (const [prop, varId] of Object.entries(node.boundVariables)) {
          if (variableIds.has(varId)) delete node.boundVariables[prop];
        }
        if (Object.keys(node.boundVariables).length === 0) node.boundVariables = undefined;
      }
      // Remove variables belonging to this collection
      doc.variables = doc.variables.filter((v) => v.collectionId !== collectionId);
      // Remove the collection
      doc.variableCollections = doc.variableCollections.filter((c) => c.id !== collectionId);
    });
    this.activeModes.delete(collectionId);
  }

  deleteMode(collectionId: string, modeId: string): boolean {
    let deleted = false;
    this.mutate((doc) => {
      const collection = doc.variableCollections.find((c) => c.id === collectionId);
      if (!collection || collection.modes.length <= 1) return;
      collection.modes = collection.modes.filter((m) => m.id !== modeId);
      // Remove mode values for deleted mode
      for (const mode of collection.modes) {
        // Values are keyed by variableId, no cleanup needed per-mode since
        // the mode object itself is removed.
      }
      deleted = true;
    });
    // If the deleted mode was the active one, reset to collection default
    if (deleted && this.activeModes.get(collectionId) === modeId) {
      this.activeModes.delete(collectionId);
    }
    return deleted;
  }

  setActiveMode(collectionId: string, modeId: string): void {
    const next = new Map(this.activeModes);
    next.set(collectionId, modeId);
    this.activeModes = next;
    // Trigger re-render for variable-bound properties
    this.changed();
  }

  getActiveModeId(collectionId: string): string | null {
    const explicit = this.activeModes.get(collectionId);
    if (explicit) return explicit;
    const collection = this.document.variableCollections.find((c) => c.id === collectionId);
    return collection?.defaultModeId ?? null;
  }

  bindVariable(nodeId: string, property: string, variableId: string): void {
    this.mutate((doc) => {
      const node = doc.nodes[nodeId];
      if (!node) return;
      node.boundVariables = { ...node.boundVariables, [property]: variableId };
      // Initialize the variable with the node's current property value so the
      // visual appearance is preserved after binding.
      const variable = doc.variables.find((v) => v.id === variableId);
      if (variable) {
        const collection = doc.variableCollections.find((c) => c.id === variable.collectionId);
        if (collection) {
          for (const mode of collection.modes) {
            if (mode.values[variableId] === undefined) {
              // Map shorthand binding keys to the nested read path.
              let readPath = property;
              if (property === "fill" && node.fill?.type === "solid") readPath = "fill.color";
              if (property === "shadow") readPath = "shadow.color";
              const currentValue = getNodePropertyValue(node, readPath);
              if (currentValue !== undefined) {
                mode.values[variableId] = { value: currentValue };
              }
            }
          }
        }
      }
    });
  }

  unbindVariable(nodeId: string, property: string): void {
    this.mutate((doc) => {
      const node = doc.nodes[nodeId];
      if (!node?.boundVariables) return;
      delete node.boundVariables[property];
      if (Object.keys(node.boundVariables).length === 0) node.boundVariables = undefined;
    });
  }

  resolveVariableValue(variableId: string): string | number | boolean | undefined {
    const variable = this.document.variables.find((v) => v.id === variableId);
    if (!variable) return undefined;
    const collection = this.document.variableCollections.find((c) => c.id === variable.collectionId);
    if (!collection) return undefined;
    const modeId = this.getActiveModeId(collection.id);
    if (!modeId) return undefined;
    const mode = collection.modes.find((m) => m.id === modeId);
    if (!mode) return undefined;
    const val = mode.values[variableId];
    return val?.value;
  }

  /**
   * Materialize all bound variable values into their node properties.
   * After this call, every node property that has a variable binding will
   * hold the resolved value from the active mode, making the document
   * self-contained (no variable resolution needed to render correctly).
   */
  syncBoundVariables(): void {
    this.mutate((doc) => {
      for (const node of Object.values(doc.nodes)) {
        if (!node.boundVariables) continue;
        for (const [property, variableId] of Object.entries(node.boundVariables)) {
          const variable = doc.variables.find((v) => v.id === variableId);
          if (!variable) continue;
          const collection = doc.variableCollections.find((c) => c.id === variable.collectionId);
          if (!collection) continue;
          const modeId = this.activeModes.get(collection.id) ?? collection.defaultModeId;
          const mode = collection.modes.find((m) => m.id === modeId);
          if (!mode) continue;
          const val = mode.values[variableId];
          if (val === undefined) continue;
          // Map shorthand binding keys to the nested write path.
          let writePath = property;
          if (property === "fill" && node.fill?.type === "solid") writePath = "fill.color";
          if (property === "shadow") writePath = "shadow.color";
          setNodePropertyValue(node, writePath, val.value);
        }
      }
    });
  }

  // ── Auto layout ───────────────────────────────────────────────────────

  setLayoutMode(frameId: string, mode: LayoutMode): void {
    this.mutate((doc) => {
      const node = doc.nodes[frameId];
      if (!node || (node.type !== "frame" && node.type !== "group")) return;
      node.layoutMode = mode;
    });
  }

  setLayoutProperty(frameId: string, property: "primaryAxisAlignItems" | "counterAxisAlignItems" | "primaryAxisSizing" | "counterAxisSizing" | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft" | "itemSpacing" | "layoutWrap", value: unknown): void {
    this.mutate((doc) => {
      const node = doc.nodes[frameId];
      if (!node || (node.type !== "frame" && node.type !== "group")) return;
      (node as unknown as Record<string, unknown>)[property] = value;
      if (node.layoutMode && node.layoutMode !== "none") {
        applyAutoLayout(node as never, doc);
      }
    });
  }

  // ── Component management ──────────────────────────────────────────────

  createComponent(name: string, nodeIds: string[] = this.selectedIds): ComponentDefinition | null {
    if (!nodeIds.length) return null;
    let component: ComponentDefinition | null = null;
    this.mutate((doc) => {
      // If multiple nodes selected, group them first
      if (nodeIds.length > 1) {
        const groupId = uid("node");
        const group: ContainerNode = {
          id: groupId, type: "group", name, parentId: null,
          x: 0, y: 0, width: 0, height: 0, rotation: 0, opacity: 1,
          visible: true, locked: false, fill: null, stroke: null,
          radius: 0, shadow: null, childIds: [...nodeIds],
          clipContent: false, layoutMode: "none", primaryAxisAlignItems: "min",
          counterAxisAlignItems: "min", primaryAxisSizing: "fixed",
          counterAxisSizing: "fixed", paddingTop: 0, paddingRight: 0,
          paddingBottom: 0, paddingLeft: 0, itemSpacing: 0, layoutWrap: "no-wrap",
        };
        // Reparent all selected nodes to the group
        for (const childId of nodeIds) {
          const child = doc.nodes[childId];
          if (!child) continue;
          removeFromParent(doc, child);
          child.parentId = groupId;
        }
        doc.nodes[groupId] = group;
        doc.rootIds.push(groupId);
        component = { id: uid("component"), name, sourceNodeId: groupId, properties: [], description: undefined };
        doc.components[component.id] = component;
        group.componentId = component.id;
        group.isInstance = false;
        this.selectedIds = [groupId];
      } else {
        const sourceId = nodeIds[0];
        const source = doc.nodes[sourceId];
        if (!source) return;
        component = { id: uid("component"), name, sourceNodeId: sourceId, properties: [], description: undefined };
        doc.components[component.id] = component;
        source.componentId = component.id;
        source.isInstance = false;
      }
    });
    return component;
  }

  createInstance(componentId: string, x: number, y: number): DesignNode | null {
    let instanceNode: DesignNode | null = null;
    this.mutate((doc) => {
      const component = doc.components[componentId];
      if (!component) return;
      const source = doc.nodes[component.sourceNodeId];
      if (!source) return;
      const cloneTree = (node: DesignNode, parentId: string | null): DesignNode => {
        const copy = JSON.parse(JSON.stringify(node)) as DesignNode;
        copy.id = uid("node");
        copy.parentId = parentId;
        copy.componentId = componentId;
        copy.isInstance = true;
        copy.overrides = {};
        if ((copy.type === "frame" || copy.type === "group") && (node as never as { childIds: string[] }).childIds) {
          const newChildIds: string[] = [];
          for (const childId of (node as never as { childIds: string[] }).childIds) {
            const child = doc.nodes[childId];
            if (child) {
              const clonedChild = cloneTree(child, copy.id);
              doc.nodes[clonedChild.id] = clonedChild;
              newChildIds.push(clonedChild.id);
            }
          }
          copy.childIds = newChildIds;
        }
        return copy;
      };
      const copy = cloneTree(source, null);
      copy.name = `${component.name}`;
      copy.x = x;
      copy.y = y;
      doc.nodes[copy.id] = copy;
      doc.rootIds.push(copy.id);
      instanceNode = copy;
    });
    return instanceNode;
  }

  detachInstance(nodeId: string): void {
    this.mutate((doc) => {
      const node = doc.nodes[nodeId];
      if (!node?.isInstance) return;
      node.isInstance = false;
      node.componentId = undefined;
      node.overrides = undefined;
    });
  }

  addComponentProperty(componentId: string, name: string, type: "boolean" | "text" | "instance-swap"): void {
    this.mutate((doc) => {
      const component = doc.components[componentId];
      if (!component) return;
      const prop = { id: uid("prop"), name, type, defaultValue: type === "boolean" ? false : "" };
      component.properties = [...component.properties, prop];
    });
  }

  setInstanceOverride(instanceId: string, propertyId: string, value: unknown): void {
    this.mutate((doc) => {
      const node = doc.nodes[instanceId];
      if (!node?.isInstance || !node.componentId) return;
      const component = doc.components[node.componentId];
      if (!component) return;
      const prop = component.properties.find((p) => p.id === propertyId);
      if (!prop) return;
      node.overrides = { ...node.overrides, [propertyId]: value };
    });
  }

  setPage(page: PageMeta, document: PageDocument): void {
    if (this.gestureBefore) this.gestureVersion += 1;
    this.gestureBefore = null;
    this.editingTextId = null;
    this.persistencePaused = false;
    this.guides = { x: null, y: null };
    this.userGuides = [];
    this.rulerDrag = null;
    this.page = page;
    const sanitized = sanitizeDocument(document);
    this.document = sanitized.document;
    normalizeTextSizes(this.document);
    this.selectedIds = [];
    this.undoStack = [];
    this.redoStack = [];
    this.saveStatus = sanitized.recovered ? "dirty" : "saved";
    this.thumbnailDirty = sanitized.recovered;
    if (sanitized.recovered) {
      this.changeToken += 1;
      this.thumbnailChangeToken += 1;
    }
  }
}
