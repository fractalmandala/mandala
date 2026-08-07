import { isTauri, readFile, writeFile } from '../ipc';
import { ideState } from './ide.svelte';
import { UndoHistory } from './undoHistory.svelte';

export type TileKind =
	| 'fileTree' | 'editor' | 'terminal' | 'browser' | 'ai'
	| 'modelMarketplace' | 'skillsMarketplace';

export interface Tile {
	id: string;
	kind: TileKind;
	x: number;
	y: number;        // board coordinates at zoom 1
	w: number;
	h: number;
	z: number;        // stacking order
	props?: Record<string, unknown>;
	minimized?: boolean;
}

export interface Viewport {
	x: number;
	y: number;
	zoom: number;
}

export interface SpatialTemplate {
	id: string;
	name: string;
	summary: string;
	image: string;
	tiles: Omit<Tile, 'id' | 'z'>[];
}

function workspaceFilePath(fileName: string): string | null {
	const rootPath = ideState.rootPath;
	if (!rootPath || rootPath === '/') return null;
	return `${rootPath.replace(/\/$/, '')}/${fileName}`;
}

function canvasLayoutPath(): string | null {
	return workspaceFilePath('.fractal/canvas_layout.json');
}

function legacyCanvasLayoutPath(): string | null {
	return workspaceFilePath('canvas_layout.json');
}

class CanvasStore {
	tiles = $state<Tile[]>([]);
	viewport = $state<Viewport>({ x: 0, y: 0, zoom: 1 });
	activeId = $state<string | null>(null);
	focusedId = $state<string | null>(null);   // null = normal; set = Focus/Zen mode
	private saveLayoutTimer: ReturnType<typeof setTimeout> | null = null;
	private persistenceFailed = false;
	private history = new UndoHistory<CanvasSnapshot>({
		capture: () => this.snapshot(),
		restore: (snapshot) => this.restore(snapshot),
	});

	active = $derived(this.tiles.find(t => t.id === this.activeId) ?? null);

	private snapshot(): CanvasSnapshot {
		return {
			tiles: cloneTiles(this.tiles),
			viewport: { ...this.viewport },
			activeId: this.activeId,
			focusedId: this.focusedId,
		};
	}

	private restore(snapshot: CanvasSnapshot): void {
		this.tiles = cloneTiles(snapshot.tiles);
		this.viewport = { ...snapshot.viewport };
		this.activeId = snapshot.activeId;
		this.focusedId = snapshot.focusedId;
		this.saveLayout();
	}

	pushUndo(): void { this.history.push(); }
	beginGesture(): void { this.history.beginGesture(); }
	endGesture(): void { this.history.endGesture(); }
	undo(): void { this.history.undo(); }
	redo(): void { this.history.redo(); }

	addTile(kind: TileKind, at?: { x: number; y: number }) {
		this.history.transact(() => {
		const id = Math.random().toString(36).substring(2, 9);
		const defaultSizes: Record<TileKind, { w: number; h: number }> = {
			fileTree: { w: 220, h: 600 },
			editor: { w: 640, h: 460 },
			terminal: { w: 640, h: 200 },
			browser: { w: 480, h: 360 },
			ai: { w: 360, h: 520 },
			modelMarketplace: { w: 480, h: 400 },
			skillsMarketplace: { w: 480, h: 400 }
		};
		const size = defaultSizes[kind] || { w: 400, h: 300 };

		let x = at?.x;
		let y = at?.y;
		if (x === undefined || y === undefined) {
			const count = this.tiles.filter(t => t.kind === kind).length;
			const winW = typeof window !== 'undefined' ? window.innerWidth : 1024;
			const winH = typeof window !== 'undefined' ? window.innerHeight : 768;
			
			// Center of viewport in board coordinates
			const cx = (winW / 2 - this.viewport.x) / this.viewport.zoom - size.w / 2;
			const cy = (winH / 2 - this.viewport.y) / this.viewport.zoom - size.h / 2;
			
			x = cx + count * 20;
			y = cy + count * 20;
		}

		const z = this.tiles.length > 0 ? Math.max(...this.tiles.map(t => t.z)) + 1 : 1;

		const newTile: Tile = {
			id,
			kind,
			x,
			y,
			w: size.w,
			h: size.h,
			z,
			props: {}
		};
		
		this.tiles.push(newTile);
		this.activeId = id;
		this.saveLayout();
		});
	}

	removeTile(id: string) {
		if (!this.tiles.some(tile => tile.id === id)) return;
		this.history.transact(() => {
		this.tiles = this.tiles.filter(t => t.id !== id);
		if (this.activeId === id) {
			this.activeId = this.tiles.length > 0 ? this.tiles[this.tiles.length - 1].id : null;
		}
		if (this.focusedId === id) {
			this.focusedId = null;
		}
		this.saveLayout();
		});
	}

	moveTile(id: string, x: number, y: number) {
		const tile = this.tiles.find(t => t.id === id);
		if (tile) {
			tile.x = x;
			tile.y = y;
			this.saveLayout();
		}
	}

	resizeTile(id: string, w: number, h: number) {
		const tile = this.tiles.find(t => t.id === id);
		if (tile) {
			tile.w = Math.max(150, w);
			tile.h = Math.max(100, h);
			this.saveLayout();
		}
	}

	raise(id: string) {
		this.activeId = id;
		const tile = this.tiles.find(t => t.id === id);
		if (!tile) return;
		const maxZ = this.tiles.length > 0 ? Math.max(...this.tiles.map(t => t.z)) : 0;
		if (tile.z < maxZ) {
			tile.z = maxZ + 1;
			this.saveLayout();
		}
	}

	focusTile(id: string | null) {
		this.focusedId = id;
		if (id) {
			this.raise(id);
		}
	}

	applySpatialTemplate(tpl: SpatialTemplate) {
		this.history.transact(() => {
		const newTiles: Tile[] = [];
		let z = 1;
		for (const t of tpl.tiles) {
			newTiles.push({
				id: Math.random().toString(36).substring(2, 9),
				kind: t.kind as TileKind,
				x: t.x,
				y: t.y,
				w: t.w,
				h: t.h,
				z: z++,
				props: t.props ? { ...t.props } : {}
			});
		}
		this.tiles = newTiles;
		this.activeId = newTiles.length > 0 ? newTiles[newTiles.length - 1].id : null;
		this.focusedId = null;
		this.fit();
		this.saveLayout();
		});
	}

	saveAsTemplate(name: string): SpatialTemplate {
		const tilesSnap = this.tiles.map(t => ({
			kind: t.kind,
			x: t.x,
			y: t.y,
			w: t.w,
			h: t.h,
			props: t.props ? { ...t.props } : undefined
		}));
		const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
		return {
			id,
			name,
			summary: 'User saved template',
			image: 'fractaluser.png',
			tiles: tilesSnap
		};
	}

	fit() {
		if (this.tiles.length === 0) {
			this.viewport = { x: 0, y: 0, zoom: 1 };
			return;
		}

		let minX = Infinity, minY = Infinity;
		let maxX = -Infinity, maxY = -Infinity;

		for (const t of this.tiles) {
			minX = Math.min(minX, t.x);
			minY = Math.min(minY, t.y);
			maxX = Math.max(maxX, t.x + t.w);
			maxY = Math.max(maxY, t.y + t.h);
		}

		const padding = 60;
		const width = (maxX - minX) + padding * 2;
		const height = (maxY - minY) + padding * 2;

		const winW = typeof window !== 'undefined' ? window.innerWidth : 1024;
		const winH = typeof window !== 'undefined' ? window.innerHeight : 768;

		const zoomX = winW / width;
		const zoomY = winH / height;
		const zoom = Math.max(0.4, Math.min(2.0, Math.min(zoomX, zoomY)));

		const x = winW / 2 - (minX + maxX) / 2 * zoom;
		const y = winH / 2 - (minY + maxY) / 2 * zoom;

		this.viewport = { x, y, zoom };
		this.saveLayout();
	}

	// Debounced: moveTile()/resizeTile() call this on every pointermove during a drag, which
	// used to serialize the whole tile list and write it to disk/localStorage on every single
	// pixel of movement. Nothing awaits saveLayout()'s promise, so coalescing bursts into one
	// write ~200ms after they settle is safe everywhere it's called.
	saveLayout() {
		this.persistenceFailed = false;
		if (this.saveLayoutTimer) clearTimeout(this.saveLayoutTimer);
		this.saveLayoutTimer = setTimeout(() => {
			this.saveLayoutTimer = null;
			void this.writeLayout().catch(error => {
				this.persistenceFailed = true;
				console.error('Could not persist canvas layout:', error);
			});
		}, 200);
	}

	get hasPendingSave(): boolean {
		return this.saveLayoutTimer !== null || this.persistenceFailed;
	}

	async flushPendingChanges(): Promise<boolean> {
		if (!this.saveLayoutTimer && !this.persistenceFailed) return true;
		if (this.saveLayoutTimer) clearTimeout(this.saveLayoutTimer);
		this.saveLayoutTimer = null;
		try {
			await this.writeLayout();
			this.persistenceFailed = false;
			return true;
		} catch (error) {
			this.persistenceFailed = true;
			console.error('Could not persist canvas layout:', error);
			return false;
		}
	}

	private async writeLayout() {
		const data = JSON.stringify({
			viewport: this.viewport,
			tiles: this.tiles
		}, null, 2);

		const filePath = canvasLayoutPath();
		if (isTauri() && filePath) {
			try {
				await writeFile(filePath, data);
				this.persistenceFailed = false;
				return;
			} catch (e) {
				console.error('Tauri saveLayout error, falling back to localStorage:', e);
			}
		}

		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('canvas:layout', data);
			this.persistenceFailed = false;
		}
	}

	async loadLayout() {
		let dataStr: string | null = null;
		let migratedLegacyLayout = false;
		const filePath = canvasLayoutPath();

		if (isTauri() && filePath) {
			try {
				dataStr = await loadFileSilently(filePath);
			} catch (e) {
				// File probably does not exist yet, normal behavior.
			}

			if (!dataStr) {
				const legacyPath = legacyCanvasLayoutPath();
				if (legacyPath) {
					try {
						dataStr = await loadFileSilently(legacyPath);
						migratedLegacyLayout = !!dataStr;
					} catch (e) {
						// No legacy root layout exists, which is the normal path for new workspaces.
					}
				}
			}
		}

		if (!dataStr && typeof localStorage !== 'undefined') {
			dataStr = localStorage.getItem('canvas:layout');
		}

		if (dataStr) {
			try {
				const parsed: unknown = JSON.parse(dataStr);
				if (!this.restorePersistedLayout(parsed, false)) throw new Error('Canvas layout has an invalid shape.');
				if (migratedLegacyLayout && isTauri() && filePath) {
					try {
						await writeFile(filePath, dataStr);
					} catch (error) {
						console.warn('Could not migrate legacy canvas layout:', error);
					}
				}
				if (typeof parsed.activeTemplateId === 'string' && typeof localStorage !== 'undefined') {
					localStorage.setItem('fractalengine:app-template', parsed.activeTemplateId);
				}
			} catch (e) {
				console.error('Failed to parse loaded canvas layout', e);
			}
		}
	}

	restorePersistedLayout(value: unknown, persist = true): value is PersistedCanvas {
		if (!isPersistedCanvas(value)) return false;
		this.viewport = { ...value.viewport };
		this.tiles = cloneTiles(value.tiles);
		this.activeId = null;
		this.focusedId = null;
		if (persist) this.saveLayout();
		return true;
	}

	isPersistedLayout(value: unknown): value is PersistedCanvas {
		return isPersistedCanvas(value);
	}
}

interface CanvasSnapshot {
	tiles: Tile[];
	viewport: Viewport;
	activeId: string | null;
	focusedId: string | null;
}

interface PersistedCanvas {
	viewport: Viewport;
	tiles: Tile[];
	activeTemplateId?: string;
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function cloneTiles(tiles: Tile[]): Tile[] {
	return JSON.parse(JSON.stringify(tiles)) as Tile[];
}

function isTileKind(value: unknown): value is TileKind {
	return value === 'fileTree' || value === 'editor' || value === 'terminal' || value === 'browser'
		|| value === 'ai' || value === 'modelMarketplace' || value === 'skillsMarketplace';
}

function isPersistedCanvas(value: unknown): value is PersistedCanvas {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Record<string, unknown>;
	const viewport = candidate.viewport as Record<string, unknown> | undefined;
	if (!viewport || !isFiniteNumber(viewport.x) || !isFiniteNumber(viewport.y)
		|| !isFiniteNumber(viewport.zoom) || viewport.zoom < 0.4 || viewport.zoom > 2) return false;
	if (!Array.isArray(candidate.tiles) || candidate.tiles.length > 200) return false;
	const ids = new Set<string>();
	for (const item of candidate.tiles) {
		if (!item || typeof item !== 'object') return false;
		const tile = item as Record<string, unknown>;
		if (typeof tile.id !== 'string' || !tile.id || ids.has(tile.id) || !isTileKind(tile.kind)) return false;
		if (!isFiniteNumber(tile.x) || !isFiniteNumber(tile.y) || !isFiniteNumber(tile.w)
			|| !isFiniteNumber(tile.h) || !isFiniteNumber(tile.z) || tile.w < 150 || tile.h < 100) return false;
		if (tile.props !== undefined && (!tile.props || typeof tile.props !== 'object' || Array.isArray(tile.props))) return false;
		if (tile.minimized !== undefined && typeof tile.minimized !== 'boolean') return false;
		ids.add(tile.id);
	}
	return candidate.activeTemplateId === undefined || candidate.activeTemplateId === 'home'
		|| candidate.activeTemplateId === 'code' || candidate.activeTemplateId === 'notes'
		|| candidate.activeTemplateId === 'design' || candidate.activeTemplateId === 'blank'
		|| candidate.activeTemplateId === 'ai' || candidate.activeTemplateId === 'bookmarks'
		|| candidate.activeTemplateId === 'media' || candidate.activeTemplateId === 'docs'
		|| candidate.activeTemplateId === 'dev';
}

async function loadFileSilently(path: string): Promise<string> {
	return readFile(path);
}

export const canvas = new CanvasStore();
