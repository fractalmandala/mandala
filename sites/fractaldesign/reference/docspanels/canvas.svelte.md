---
title: Canvas State Manager
description: A Svelte 5 reactive class store (`$state`, `$derived`) managing active workspace nodes, HTML wrappers, template imports, and keyboard-bindable Undo/Redo stacks.
---

# Canvas State Manager

* **File Location**: `src/lib/stores/canvas.svelte.ts`
* **Purpose**: Orchestrates element hierarchy node trees, tags updates, selection tracking, and collapses sidebars. Implements a complete undo boundary snapshot stack matching macOS and Windows keyboard shortcut rules (Rule 8).

---

## Implementation

```typescript
import { getContext, setContext } from "svelte";

export interface UIAnnotation {
	id: string;
	prompt: string;
	status: "draft" | "processing" | "resolved";
	createdAt: number;
}

export interface CanvasNode {
	id: string;
	tag: string;
	class?: string;
	content?: string;
	children?: string[]; // IDs of child nodes
	annotations?: UIAnnotation[]; // List of active AI annotations
}

export class CanvasStore {
	// Active workspace node tree map
	nodes = $state<Record<string, CanvasNode>>({
		root: { id: "root", tag: "div", children: [] }
	});

	// UI Layout States
	selectedNodeId = $state<string | null>(null);
	activeLeftTab = $state<"layers" | "components">("layers");
	isLeftSidebarCollapsed = $state(false);
	themeName = $state("neutral");

	// Total active annotations count
	totalAnnotations = $derived(
		Object.values(this.nodes).reduce((acc, node) => acc + (node.annotations?.length || 0), 0)
	);

	// Undo / Redo Stacks (Mandatory Rule 8)
	#undoStack: string[] = [];
	#redoStack: string[] = [];

	constructor() {
		// Listen for keyboard Cmd+Z / Ctrl+Z (Undo) and Cmd+Y / Ctrl+Y (Redo)
		if (typeof window !== "undefined") {
			window.addEventListener("keydown", (e) => {
				const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
				const modifier = isMac ? e.metaKey : e.ctrlKey;

				if (modifier && e.key.toLowerCase() === "z") {
					e.preventDefault();
					if (e.shiftKey) {
						this.redo();
					} else {
						this.undo();
					}
				} else if (modifier && e.key.toLowerCase() === "y") {
					e.preventDefault();
					this.redo();
				}
			});
		}
	}

	// 1. Snapshot Boundary
	saveSnapshot() {
		const snapshot = JSON.stringify({
			nodes: this.nodes,
			selectedNodeId: this.selectedNodeId,
			themeName: this.themeName
		});
		this.#undoStack.push(snapshot);
		this.#redoStack = []; // Clear redo stack on new action
	}

	// 2. Perform Undo
	undo() {
		if (this.#undoStack.length === 0) return;

		// Push current state into redo history
		const currentState = JSON.stringify({
			nodes: this.nodes,
			selectedNodeId: this.selectedNodeId,
			themeName: this.themeName
		});
		this.#redoStack.push(currentState);

		// Restore previous state
		const previousState = JSON.parse(this.#undoStack.pop()!);
		this.nodes = previousState.nodes;
		this.selectedNodeId = previousState.selectedNodeId;
		this.themeName = previousState.themeName;
	}

	// 3. Perform Redo
	redo() {
		if (this.#redoStack.length === 0) return;

		// Push current state into undo history
		const currentState = JSON.stringify({
			nodes: this.nodes,
			selectedNodeId: this.selectedNodeId,
			themeName: this.themeName
		});
		this.#undoStack.push(currentState);

		// Restore next state
		const nextState = JSON.parse(this.#redoStack.pop()!);
		this.nodes = nextState.nodes;
		this.selectedNodeId = nextState.selectedNodeId;
		this.themeName = nextState.themeName;
	}

	// 4. Override Wrapper Tag
	updateNodeTag(nodeId: string, newTag: string) {
		const node = this.nodes[nodeId];
		if (!node) return;
		this.saveSnapshot();
		node.tag = newTag;
	}

	// 5. Load and Inject Layout Template
	insertLayoutTemplate(templateNodes: CanvasNode[]) {
		this.saveSnapshot();

		// Safe crypto helper fallback for older TS environments
		const generateUUID = () => {
			if (typeof crypto !== "undefined" && crypto.randomUUID) {
				return crypto.randomUUID();
			}
			return Math.random().toString(36).substring(2, 15) + 
			       Math.random().toString(36).substring(2, 15);
		};

		// Generate fresh unique IDs to avoid collisions
		const uuidMap = new Map<string, string>();
		
		templateNodes.forEach(node => {
			uuidMap.set(node.id, generateUUID());
		});

		// Deep clone and replace IDs
		templateNodes.forEach(node => {
			const newId = uuidMap.get(node.id);
			if (!newId) return;

			const updatedChildren = node.children?.map(childId => uuidMap.get(childId) || childId) || [];

			this.nodes[newId] = {
				...node,
				id: newId,
				children: updatedChildren
			};
		});

		// Mount top-level template elements to root node
		const topLevelNode = templateNodes[0];
		if (!topLevelNode) return;

		const mappedTopId = uuidMap.get(topLevelNode.id);
		if (!mappedTopId) return;

		const rootNode = this.nodes["root"];
		if (rootNode) {
			if (!rootNode.children) {
				rootNode.children = [];
			}
			rootNode.children.push(mappedTopId);
		}
	}

	// 6. Annotations state mutators
	addNodeAnnotation(nodeId: string, prompt: string) {
		const node = this.nodes[nodeId];
		if (!node) return;

		this.saveSnapshot();
		if (!node.annotations) {
			node.annotations = [];
		}

		const noteId = Math.random().toString(36).substring(2, 9);
		node.annotations.push({
			id: noteId,
			prompt,
			status: "draft",
			createdAt: Date.now()
		});
	}

	removeNodeAnnotation(nodeId: string, annotationId: string) {
		const node = this.nodes[nodeId];
		if (!node || !node.annotations) return;

		this.saveSnapshot();
		node.annotations = node.annotations.filter(note => note.id !== annotationId);

		if (node.annotations.length === 0) {
			delete node.annotations;
		}
	}

	solveAllAnnotations() {
		this.saveSnapshot();
		Object.values(this.nodes).forEach(node => {
			if (node.annotations) {
				node.annotations.forEach(note => {
					note.status = "resolved";
				});
			}
		});
	}
}

// Global context instantiator
const CANVAS_KEY = Symbol("canvas-store");

export function initCanvasStore() {
	const store = new CanvasStore();
	setContext(CANVAS_KEY, store);
	return store;
}

export function useCanvasStore(): CanvasStore {
	return getContext<CanvasStore>(CANVAS_KEY);
}

// Fallback singleton for out-of-context mock files
export const canvasState = new CanvasStore();
```
