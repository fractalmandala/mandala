import {
	mediaCancelImport,
	mediaCreateFolder,
	mediaGetLibrary,
	mediaImport,
	mediaListAllTags,
	mediaListItems,
	mediaListTree,
	mediaMoveEntries,
	mediaPickImportSources,
	mediaRenameEntry,
	mediaSetPinned,
	mediaSetTags,
	mediaTrashEntries,
	onMediaFsEvent,
	onMediaImportProgress,
} from '$lib/ipc';
import type { MediaFolder, MediaImportMode, MediaImportProgress, MediaItem, MediaKind, MediaLibraryInfo, MediaQuery, MediaScope, MediaSort, MediaTag } from '../types';
import { UndoHistory, compositeUndoDomain } from '$lib/state/undoHistory.svelte';
import { registerUndoDomain } from '$lib/state/undo.svelte';
import { workspaceLayout } from '$lib/state/workspaceLayout.svelte';

const STORAGE_KEY = 'fractalengine:media-preferences';

interface MediaPreferences { scope: MediaScope; thumbSize: number; sort: MediaSort; descending: boolean; inspectorOpen: boolean; kinds: MediaKind[]; defaultImportMode: MediaImportMode }
type MediaOperation =
	| { type: 'create-folder'; parent: string; name: string }
	| { type: 'rename'; from: string; to: string }
	| { type: 'move'; entries: { from: string; to: string }[] }
	| { type: 'tags'; before: Record<string, string[]>; after: Record<string, string[]> }
	| { type: 'pins'; before: Record<string, boolean>; after: Record<string, boolean> };
interface MediaSnapshot { scope: MediaScope; thumbSize: number; sort: MediaSort; descending: boolean; inspectorOpen: boolean; kinds: MediaKind[]; defaultImportMode: MediaImportMode; selection: string[]; operations: MediaOperation[]; operationCursor: number }

function savedPreferences(): Partial<MediaPreferences> {
	if (typeof localStorage === 'undefined') return {};
	try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<MediaPreferences>; } catch { return {}; }
}

class MediaState {
	library = $state<MediaLibraryInfo | null>(null);
	tree = $state<MediaFolder>({ path: '', name: 'Library', children: [], mediaCount: 0 });
	activeScope = $state<MediaScope>({ type: 'section', section: 'all' });
	items = $state<MediaItem[]>([]);
	selection = $state<Set<string>>(new Set());
	anchorId = $state<string | null>(null);
	search = $state('');
	kindFilters = $state<MediaKind[]>([]);
	sort = $state<MediaSort>('added');
	descending = $state(true);
	thumbSize = $state(160);
	inspectorOpen = $state(false);
	defaultImportMode = $state<MediaImportMode>('copy');
	allTags = $state<MediaTag[]>([]);
	imports = $state<Map<string, MediaImportProgress>>(new Map());
	loading = $state(false);
	loaded = $state(false);
	error = $state<string | null>(null);
	private operations = $state<MediaOperation[]>([]);
	private operationCursor = $state(0);
	private unsubscribers: (() => void)[] = [];
	private history = new UndoHistory<MediaSnapshot>({ capture: () => this.snapshot(), restore: snapshot => this.restore(snapshot) });

	constructor() {
		const saved = savedPreferences();
		if (saved.scope) this.activeScope = saved.scope;
		if (typeof saved.thumbSize === 'number') this.thumbSize = saved.thumbSize;
		if (saved.sort) this.sort = saved.sort;
		if (typeof saved.descending === 'boolean') this.descending = saved.descending;
		if (typeof saved.inspectorOpen === 'boolean') this.inspectorOpen = saved.inspectorOpen;
		if (Array.isArray(saved.kinds)) this.kindFilters = saved.kinds;
		if (saved.defaultImportMode === 'copy' || saved.defaultImportMode === 'move') this.defaultImportMode = saved.defaultImportMode;
	}

	get query(): MediaQuery { return { scope: this.activeScope, sort: this.sort, descending: this.descending, kinds: this.kindFilters.length ? this.kindFilters : undefined }; }
	get visibleItems(): MediaItem[] {
		const needle = this.search.trim().toLowerCase();
		return needle ? this.items.filter(item => item.name.toLowerCase().includes(needle) || item.tags.some(tag => tag.toLowerCase().includes(needle))) : this.items;
	}
	get selectedItems(): MediaItem[] { return this.items.filter(item => this.selection.has(item.id)); }
	get activeImport(): MediaImportProgress | null { return [...this.imports.values()].find(progress => !progress.finished) ?? [...this.imports.values()].at(-1) ?? null; }

	async load(): Promise<void> {
		if (this.loading) return;
		this.loading = true; this.error = null;
		try {
			this.library = await mediaGetLibrary();
			if (this.library) await this.refresh();
			this.installListeners(); this.loaded = true;
		} catch (error) { this.error = error instanceof Error ? error.message : 'Unable to load media library'; }
		finally { this.loading = false; }
	}
	async initialize(): Promise<void> {
		this.loading = true; this.error = null;
		try { this.library = await (await import('$lib/ipc')).mediaInitLibrary(); if (this.library) await this.refresh(); }
		catch (error) { this.error = error instanceof Error ? error.message : 'Unable to create media library'; }
		finally { this.loading = false; }
	}
	async refresh(): Promise<void> {
		if (!this.library) return;
		const [tree, items, tags] = await Promise.all([mediaListTree(), mediaListItems(this.query), mediaListAllTags()]);
		this.tree = tree; this.items = items; this.allTags = tags;
		this.selection = new Set([...this.selection].filter(id => items.some(item => item.id === id)));
	}
	async selectScope(scope: MediaScope): Promise<void> { this.activeScope = scope; this.selection = new Set(); this.anchorId = null; this.persist(); await this.refresh(); }
	selectItem(id: string, modifiers: Pick<MouseEvent, 'metaKey' | 'ctrlKey' | 'shiftKey'>): void {
		const ids = this.visibleItems.map(item => item.id); const index = ids.indexOf(id);
		if (modifiers.shiftKey && this.anchorId && ids.includes(this.anchorId)) {
			const start = Math.min(ids.indexOf(this.anchorId), index); const end = Math.max(ids.indexOf(this.anchorId), index); this.selection = new Set(ids.slice(start, end + 1)); return;
		}
		if (modifiers.metaKey || modifiers.ctrlKey) { const next = new Set(this.selection); next.has(id) ? next.delete(id) : next.add(id); this.selection = next; this.anchorId = id; return; }
		this.selection = new Set([id]); this.anchorId = id;
	}
	selectAll(): void { this.selection = new Set(this.visibleItems.map(item => item.id)); }
	clearSelection(): void { this.selection = new Set(); this.anchorId = null; }
	setSearch(value: string): void { this.search = value; }
	setKinds(kinds: MediaKind[]): void { this.history.transact(() => { this.kindFilters = kinds; this.persist(); }); void this.refresh(); }
	setSort(sort: MediaSort): void { this.history.transact(() => { this.sort = sort; this.persist(); }); void this.refresh(); }
	setThumbSize(size: number): void { this.history.transact(() => { this.thumbSize = Math.max(96, Math.min(320, size)); this.persist(); }); }
	setInspectorOpen(open: boolean): void { this.history.transact(() => { this.inspectorOpen = open; this.persist(); }); }
	setDefaultImportMode(mode: MediaImportMode): void { this.history.transact(() => { this.defaultImportMode = mode; this.persist(); }); }
	async pickImportSources(kind: 'files' | 'folder'): Promise<void> {
		const paths = await mediaPickImportSources(kind);
		if (paths?.length) await this.importPaths(paths, this.activeScope.type === 'folder' ? this.activeScope.path : '', this.defaultImportMode);
	}
	async importPaths(paths: string[], destination = this.activeScope.type === 'folder' ? this.activeScope.path : '', mode: MediaImportMode = this.defaultImportMode): Promise<void> { const id = await mediaImport(paths, destination, mode); this.imports = new Map(this.imports).set(id, { importId: id, done: 0, total: 0, skipped: 0, currentName: '', finished: false }); }
	async cancelImport(id: string): Promise<void> { await mediaCancelImport(id); }
	setDescending(descending: boolean): void { this.history.transact(() => { this.descending = descending; this.persist(); }); void this.refresh(); }
	async createFolder(parentPath: string, name: string): Promise<void> {
		await mediaCreateFolder(parentPath, name);
		this.recordOperation({ type: 'create-folder', parent: parentPath, name });
		await this.refresh();
	}
	async rename(relPath: string, name: string): Promise<string> {
		const next = await mediaRenameEntry(relPath, name);
		if (next !== relPath) this.recordOperation({ type: 'rename', from: relPath, to: next });
		await this.refresh(); return next;
	}
	async move(relPaths: string[], destination: string): Promise<void> {
		const entries = relPaths.map(from => ({ from, to: destination ? `${destination}/${from.split('/').at(-1)}` : from.split('/').at(-1)! })).filter(entry => entry.from !== entry.to);
		if (!entries.length) return;
		await mediaMoveEntries(relPaths, destination);
		this.recordOperation({ type: 'move', entries });
		await this.refresh();
	}
	async trash(relPaths: string[]): Promise<void> { await mediaTrashEntries(relPaths); await this.refresh(); }
	async setTags(ids: string[], add: string[], remove: string[]): Promise<void> {
		const before = Object.fromEntries(this.items.filter(item => ids.includes(item.id)).map(item => [item.id, [...item.tags]]));
		await mediaSetTags(ids, add, remove); await this.refresh();
		const after = Object.fromEntries(this.items.filter(item => ids.includes(item.id)).map(item => [item.id, [...item.tags]]));
		this.recordOperation({ type: 'tags', before, after });
	}
	async setPinned(ids: string[], pinned: boolean): Promise<void> {
		const before = Object.fromEntries(this.items.filter(item => ids.includes(item.id)).map(item => [item.id, item.pinned]));
		await mediaSetPinned(ids, pinned); await this.refresh();
		const after = Object.fromEntries(this.items.filter(item => ids.includes(item.id)).map(item => [item.id, item.pinned]));
		this.recordOperation({ type: 'pins', before, after });
	}
	undo(): void { this.history.undo(); }
	redo(): void { this.history.redo(); }
	pushUndo(): void { this.history.push(); }
	get canUndo(): boolean { return this.history.canUndo; }
	get canRedo(): boolean { return this.history.canRedo; }
	destroy(): void { this.unsubscribers.splice(0).forEach(unsubscribe => unsubscribe()); }
	private installListeners(): void {
		if (this.unsubscribers.length) return;
		this.unsubscribers.push(onMediaImportProgress(progress => { this.imports = new Map(this.imports).set(progress.importId, progress); if (progress.finished) void this.refresh(); }));
		this.unsubscribers.push(onMediaFsEvent(() => void this.refresh()));
	}
	private recordOperation(operation: MediaOperation): void {
		this.history.transact(() => { this.operations = [...this.operations.slice(0, this.operationCursor), operation]; this.operationCursor += 1; });
	}
	private snapshot(): MediaSnapshot { return { scope: this.activeScope, thumbSize: this.thumbSize, sort: this.sort, descending: this.descending, inspectorOpen: this.inspectorOpen, kinds: [...this.kindFilters], defaultImportMode: this.defaultImportMode, selection: [...this.selection], operations: this.operations, operationCursor: this.operationCursor }; }
	private restore(snapshot: MediaSnapshot): void {
		const currentOperations = this.operations; const currentCursor = this.operationCursor;
		this.activeScope = snapshot.scope; this.thumbSize = snapshot.thumbSize; this.sort = snapshot.sort; this.descending = snapshot.descending; this.inspectorOpen = snapshot.inspectorOpen; this.kindFilters = snapshot.kinds; this.defaultImportMode = snapshot.defaultImportMode; this.selection = new Set(snapshot.selection); this.operations = snapshot.operations; this.operationCursor = snapshot.operationCursor; this.persist();
		void this.replayOperations(currentOperations, currentCursor, snapshot.operations, snapshot.operationCursor);
	}
	private async replayOperations(current: MediaOperation[], currentCursor: number, target: MediaOperation[], targetCursor: number): Promise<void> {
		try {
			if (targetCursor < currentCursor) for (let index = currentCursor - 1; index >= targetCursor; index--) await this.applyOperation(current[index], false);
			if (targetCursor > currentCursor) for (let index = currentCursor; index < targetCursor; index++) await this.applyOperation(target[index], true);
			await this.refresh();
		} catch (error) { this.error = error instanceof Error ? error.message : 'Unable to restore media change'; }
	}
	private async applyOperation(operation: MediaOperation, forward: boolean): Promise<void> {
		if (operation.type === 'create-folder') {
			if (forward) return mediaCreateFolder(operation.parent, operation.name);
			return mediaTrashEntries([operation.parent ? `${operation.parent}/${operation.name}` : operation.name]);
		}
		if (operation.type === 'rename') return mediaRenameEntry(forward ? operation.from : operation.to, (forward ? operation.to : operation.from).split('/').at(-1)! ).then(() => undefined);
		if (operation.type === 'move') {
			const entries = forward ? operation.entries : operation.entries.map(entry => ({ from: entry.to, to: entry.from }));
			for (const entry of entries) await mediaMoveEntries([entry.from], entry.to.includes('/') ? entry.to.slice(0, entry.to.lastIndexOf('/')) : '');
			return;
		}
		if (operation.type === 'tags') {
			const desired = forward ? operation.after : operation.before;
			for (const [id, tags] of Object.entries(desired)) {
				const currentTags = this.items.find(item => item.id === id)?.tags ?? [];
				await mediaSetTags([id], tags.filter(tag => !currentTags.includes(tag)), currentTags.filter(tag => !tags.includes(tag)));
			}
			return;
		}
		const desired = forward ? operation.after : operation.before;
		for (const [id, pinned] of Object.entries(desired)) await mediaSetPinned([id], pinned);
	}
	private persist(): void { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify({ scope: this.activeScope, thumbSize: this.thumbSize, sort: this.sort, descending: this.descending, inspectorOpen: this.inspectorOpen, kinds: this.kindFilters, defaultImportMode: this.defaultImportMode })); }

	get historyForUndo(): UndoHistory<MediaSnapshot> { return this.history; }
}

export const media = new MediaState();
registerUndoDomain(compositeUndoDomain('media', [media.historyForUndo, workspaceLayout.historyForUndo('media')], media.historyForUndo));
