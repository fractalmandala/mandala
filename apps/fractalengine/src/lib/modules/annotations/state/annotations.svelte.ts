import type { AgentationAnnotationSnapshot } from 'fractal-agentation';
import { deleteAnnotation, listAnnotations, upsertAnnotation } from '$lib/ipc';
import { UndoHistory } from '$lib/state/undoHistory.svelte';
import { registerUndoDomain } from '$lib/state/undo.svelte';
import { ideState } from '$lib/state/ide.svelte';
import type { SharedAnnotation, SharedAnnotationInput } from '../types';

const AUTHOR_KEY = 'fractalengine:annotation-author';

interface StoredAgentationNote {
	id: string;
	kind: AgentationAnnotationSnapshot['kind'];
	note: string;
	targetSummary: string;
	targetLabel: string;
	createdAt: string;
	updatedAt: string;
	componentName?: string | null;
	tagName: string;
	filePath: string;
	shortFileName: string;
	lineNumber?: number | null;
	columnNumber?: number | null;
	anchor?: { domPath?: string; commonAncestorPath?: string; anchorDomPath?: string };
	capture?: AgentationAnnotationSnapshot['page'] extends never ? never : {
		page: AgentationAnnotationSnapshot['page'];
		element: AgentationAnnotationSnapshot['element'];
	};
}

class AnnotationsState {
	items = $state<SharedAnnotation[]>([]);
	selectedId = $state<string | null>(null);
	loaded = $state(false);
	error = $state<string | null>(null);
	private pollTimer: ReturnType<typeof setInterval> | null = null;
	private history = new UndoHistory<SharedAnnotation[]>({
		capture: () => structuredClone(this.items),
		restore: snapshot => { this.items = snapshot; }
	});

	get selected(): SharedAnnotation | null {
		return this.items.find(item => item.id === this.selectedId) ?? null;
	}

	get author(): string {
		if (typeof localStorage === 'undefined') return 'Collaborator';
		return localStorage.getItem(AUTHOR_KEY)?.trim() || 'Collaborator';
	}

	async load(): Promise<void> {
		if (!ideState.rootPath) return;
		try {
			let items = await listAnnotations(ideState.rootPath);
			const restored = this.readStoredAgentationNotes().filter(snapshot => !items.some(item => item.id === snapshot.id));
			if (restored.length) {
				await Promise.all(restored.map(snapshot => upsertAnnotation(ideState.rootPath, { id: snapshot.id, author: this.author, snapshot })));
				items = await listAnnotations(ideState.rootPath);
			}
			this.items = items;
			this.loaded = true;
			this.error = null;
		} catch (error) {
			this.error = error instanceof Error ? error.message : 'Unable to load annotations';
		}
	}

	start(): () => void {
		void this.load();
		if (!this.pollTimer) this.pollTimer = setInterval(() => void this.load(), 1000);
		return () => this.stop();
	}

	stop(): void {
		if (!this.pollTimer) return;
		clearInterval(this.pollTimer);
		this.pollTimer = null;
	}

	async saveSnapshot(snapshot: AgentationAnnotationSnapshot): Promise<void> {
		if (!ideState.rootPath) return;
		const existing = this.items.find(item => item.id === snapshot.id);
		const input: SharedAnnotationInput = { id: snapshot.id, author: existing?.author ?? this.author, snapshot };
		const saved = await upsertAnnotation(ideState.rootPath, input);
		this.history.transact(() => this.replace(saved));
	}

	async remove(id: string): Promise<void> {
		if (!ideState.rootPath) return;
		const existing = this.items.find(item => item.id === id);
		if (!existing) return;
		await deleteAnnotation(ideState.rootPath, id);
		this.history.transact(() => {
			this.items = this.items.filter(item => item.id !== id);
			if (this.selectedId === id) this.selectedId = null;
		});
	}

	select(id: string | null): void { this.selectedId = id; }
	undo(): void { this.history.undo(); }
	redo(): void { this.history.redo(); }
	pushUndo(): void { this.history.push(); }

	private replace(saved: SharedAnnotation): void {
		const index = this.items.findIndex(item => item.id === saved.id);
		this.items = index < 0 ? [...this.items, saved] : this.items.map(item => item.id === saved.id ? saved : item);
	}

	private readStoredAgentationNotes(): AgentationAnnotationSnapshot[] {
		if (typeof localStorage === 'undefined' || typeof window === 'undefined') return [];
		try {
			const key = `sv-agentation:notes:v1:${encodeURIComponent(window.location.pathname || '/')}`;
			const notes = JSON.parse(localStorage.getItem(key) ?? '[]') as StoredAgentationNote[];
			if (!Array.isArray(notes)) return [];
			return notes
				.filter(note => note && typeof note.id === 'string' && typeof note.note === 'string')
				.map(note => ({
					id: note.id,
					kind: note.kind,
					comment: note.note,
					targetSummary: note.targetSummary,
					targetLabel: note.targetLabel,
					elementPath: note.anchor?.domPath ?? note.anchor?.commonAncestorPath ?? note.anchor?.anchorDomPath ?? null,
					timestamp: note.updatedAt ?? note.createdAt,
					page: note.capture?.page ?? {
						title: document.title,
						pathname: window.location.pathname,
						url: window.location.href,
						viewport: { width: window.innerWidth, height: window.innerHeight },
						userAgent: navigator.userAgent,
						devicePixelRatio: window.devicePixelRatio,
						timestamp: note.updatedAt ?? note.createdAt
					},
					element: note.capture?.element ?? {
						selector: null,
						fullDomPath: null,
						cssClasses: [],
						components: { filtered: [], smart: [], all: [] },
						boundingBox: null,
						position: null,
						selectedText: null,
						nearbyText: null,
						accessibility: null,
						computedStyles: null
					},
					source: {
						componentName: note.componentName ?? null,
						tagName: note.tagName,
						filePath: note.filePath,
						shortFileName: note.shortFileName,
						lineNumber: note.lineNumber ?? null,
						columnNumber: note.columnNumber ?? null
					}
				}));
		} catch {
			return [];
		}
	}
}

export const annotations = new AnnotationsState();
registerUndoDomain({ id: 'annotations', undo: () => annotations.undo(), redo: () => annotations.redo(), pushUndo: () => annotations.pushUndo() });
