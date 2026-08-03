export interface UIAnnotation {
  id: string;
  prompt: string;
  status: 'draft' | 'processing' | 'resolved';
  createdAt: number;
}

export interface CanvasNode {
  id: string;
  tag: string;
  class?: string;
  content?: string;
  children?: string[];
  annotations?: UIAnnotation[];
}

class CanvasStoreManager {
  nodes = $state<Record<string, CanvasNode>>({
    root: { id: 'root', tag: 'div', children: [] }
  });

  selectedNodeId = $state<string | null>(null);
  activeLeftTab = $state<'layers' | 'components'>('layers');
  isLeftSidebarCollapsed = $state(false);
  themeName = $state('neutral');

  totalAnnotations = $derived(
    Object.values(this.nodes).reduce((acc, node) => acc + (node.annotations?.length || 0), 0)
  );

  #undoStack: string[] = [];
  #redoStack: string[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;

        if (modifier && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }
        } else if (modifier && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          this.redo();
        }
      });
    }
  }

  saveSnapshot() {
    const snapshot = JSON.stringify({
      nodes: this.nodes,
      selectedNodeId: this.selectedNodeId,
    });
    this.#undoStack.push(snapshot);
    this.#redoStack = [];
  }

  undo() {
    const snapshot = this.#undoStack.pop();
    if (snapshot) {
      this.#redoStack.push(JSON.stringify({
        nodes: this.nodes,
        selectedNodeId: this.selectedNodeId,
      }));
      const state = JSON.parse(snapshot);
      this.nodes = state.nodes;
      this.selectedNodeId = state.selectedNodeId;
      this.nodes = $state.snapshot(this.nodes);
    }
  }

  redo() {
    const snapshot = this.#redoStack.pop();
    if (snapshot) {
      this.#undoStack.push(JSON.stringify({
        nodes: this.nodes,
        selectedNodeId: this.selectedNodeId,
      }));
      const state = JSON.parse(snapshot);
      this.nodes = state.nodes;
      this.selectedNodeId = state.selectedNodeId;
      this.nodes = $state.snapshot(this.nodes);
    }
  }

  toggleLeftSidebar() {
    this.isLeftSidebarCollapsed = !this.isLeftSidebarCollapsed;
  }

  selectNode(nodeId: string | null) {
    this.selectedNodeId = nodeId;
  }

  addNodeAnnotation(nodeId: string, prompt: string) {
    this.saveSnapshot();
    const node = this.nodes[nodeId];
    if (node) {
      if (!node.annotations) node.annotations = [];
      node.annotations.push({
        id: `ann-${Date.now()}`,
        prompt,
        status: 'draft',
        createdAt: Date.now(),
      });
      this.nodes = { ...this.nodes };
    }
  }

  removeNodeAnnotation(nodeId: string, annotationId: string) {
    this.saveSnapshot();
    const node = this.nodes[nodeId];
    if (node?.annotations) {
      node.annotations = node.annotations.filter(a => a.id !== annotationId);
      this.nodes = { ...this.nodes };
    }
  }

  solveAllAnnotations() {
    for (const node of Object.values(this.nodes)) {
      if (node.annotations) {
        for (const ann of node.annotations) {
          if (ann.status === 'draft' || ann.status === 'processing') {
            ann.status = 'resolved';
          }
        }
      }
    }
    this.nodes = { ...this.nodes };
  }

  getNode(nodeId: string): CanvasNode | undefined {
    return this.nodes[nodeId];
  }

  updateNodeTag(nodeId: string, tag: string) {
    this.saveSnapshot();
    const node = this.nodes[nodeId];
    if (node) {
      node.tag = tag;
      this.nodes = { ...this.nodes };
    }
  }

  insertLayoutTemplate(templateNodes: CanvasNode[]) {
    this.saveSnapshot();
    for (const node of templateNodes) {
      this.nodes[node.id] = node;
    }
    this.nodes = { ...this.nodes };
  }
}

export const canvasState = new CanvasStoreManager();
