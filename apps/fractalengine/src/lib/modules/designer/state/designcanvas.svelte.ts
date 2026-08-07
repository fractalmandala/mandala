// src/lib/states/canvasstate.svelte.ts
import { registerUndoDomain } from '$lib/state/undo.svelte';
import { UndoHistory, compositeUndoDomain } from '$lib/state/undoHistory.svelte';
import { design } from './design.svelte';
import { workspaceLayout } from '$lib/state/workspaceLayout.svelte';
import { isBlockType, isHtmlTag, type DesignBlock, type PathPoint, type ShapeType, type UIAnnotation, type VectorPath } from '$lib/modules/designer/engine/designtypes';
import { dToPaths, pathsToD } from '$lib/modules/designer/engine/svgpath';
import { htmlToBlocks } from '$lib/modules/designer/engine/codegen';
import { readCorners, readEffects, readStrokes, writeCorners, writeEffects, writeStrokes } from '$lib/modules/designer/engine/paint';

// Marker prefixed onto the OS clipboard when copying inside the tool, so a
// subsequent paste can tell "our blocks" apart from external HTML/CSS.
export const CLIPBOARD_MARKER = 'FRACTALDESIGN_BLOCKS::';

function finiteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function sanitizeDesignBlocks(value: unknown): DesignBlock[] | null {
	if (!Array.isArray(value) || value.length === 0 || value.length > 5000) return null;
	const blocks: DesignBlock[] = [];
	const ids = new Set<string>();
	for (const candidate of value) {
		if (!candidate || typeof candidate !== 'object') return null;
		const block = candidate as Partial<DesignBlock>;
		if (typeof block.id !== 'string' || !block.id || typeof block.name !== 'string'
			|| typeof block.type !== 'string' || !isBlockType(block.type)
			|| !finiteNumber(block.x) || !finiteNumber(block.y) || !finiteNumber(block.w)
			|| !finiteNumber(block.h) || !finiteNumber(block.rotation) || block.w <= 0 || block.h <= 0
			|| !block.props || typeof block.props !== 'object' || Array.isArray(block.props)
			|| !block.style || typeof block.style !== 'object' || Array.isArray(block.style)
			|| (block.parentId !== null && typeof block.parentId !== 'string')
			|| (block.htmlTag !== undefined && (typeof block.htmlTag !== 'string' || !isHtmlTag(block.htmlTag)))
			|| (block.locked !== undefined && typeof block.locked !== 'boolean')
			|| (block.hidden !== undefined && typeof block.hidden !== 'boolean')
			|| (block.annotations !== undefined && (!Array.isArray(block.annotations) || !block.annotations.every(annotation =>
				!!annotation && typeof annotation.id === 'string' && typeof annotation.prompt === 'string'
				&& ['draft', 'queued', 'applied', 'dismissed'].includes(annotation.status)
				&& finiteNumber(annotation.createdAt)
			)))
			|| !Array.isArray(block.children) || !block.children.every(id => typeof id === 'string')) return null;
		if (ids.has(block.id)) return null;
		ids.add(block.id);
		blocks.push({ ...block, props: { ...block.props }, style: { ...block.style }, children: [...block.children] } as DesignBlock);
	}
	for (const block of blocks) {
		if (block.parentId && !ids.has(block.parentId)) block.parentId = null;
		const ancestors = new Set([block.id]);
		let parentId = block.parentId;
		while (parentId) {
			if (ancestors.has(parentId)) {
				block.parentId = null;
				break;
			}
			ancestors.add(parentId);
			parentId = blocks.find(parent => parent.id === parentId)?.parentId ?? null;
		}
	}
	for (const block of blocks) block.children = [];
	for (const block of blocks) {
		if (block.parentId) blocks.find(parent => parent.id === block.parentId)?.children.push(block.id);
	}
	return blocks;
}

function sanitizeGuides(value: unknown): { id: string; type: 'h' | 'v'; value: number }[] {
	if (!Array.isArray(value)) return [];
	return value.filter((guide): guide is { id: string; type: 'h' | 'v'; value: number } =>
		!!guide && typeof guide === 'object' && typeof guide.id === 'string'
		&& (guide.type === 'h' || guide.type === 'v') && finiteNumber(guide.value)
	).slice(0, 1000);
}

function sanitizeViewport(value: unknown): { x: number; y: number; zoom: number } | null {
	if (!value || typeof value !== 'object') return null;
	const viewport = value as Record<string, unknown>;
	if (!finiteNumber(viewport.x) || !finiteNumber(viewport.y) || !finiteNumber(viewport.zoom)
		|| viewport.zoom < 0.15 || viewport.zoom > 4) return null;
	return { x: viewport.x, y: viewport.y, zoom: viewport.zoom };
}

/** Convert an SVG primitive shape element into a path `d` string. Used by
 *  `importSvg` so we only have one parser downstream. Returns '' for unknown
 *  shapes / missing geometry. */
function primitiveToPathD(el: Element): string {
	const tag = el.tagName.toLowerCase();
	const num = (name: string, fallback = 0): number => {
		const v = parseFloat(el.getAttribute(name) ?? '');
		return Number.isFinite(v) ? v : fallback;
	};
	switch (tag) {
		case 'rect': {
			const x = num('x');
			const y = num('y');
			const w = num('width');
			const h = num('height');
			if (w <= 0 || h <= 0) return '';
			const rx = Math.min(num('rx', 0), w / 2);
			const ry = Math.min(num('ry', 0), h / 2);
			if (rx <= 0 && ry <= 0) {
				return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
			}
			const r = rx || ry;
			return (
				`M ${x + r} ${y}` +
				` L ${x + w - r} ${y}` +
				` Q ${x + w} ${y} ${x + w} ${y + r}` +
				` L ${x + w} ${y + h - r}` +
				` Q ${x + w} ${y + h} ${x + w - r} ${y + h}` +
				` L ${x + r} ${y + h}` +
				` Q ${x} ${y + h} ${x} ${y + h - r}` +
				` L ${x} ${y + r}` +
				` Q ${x} ${y} ${x + r} ${y}` +
				` Z`
			);
		}
		case 'circle': {
			const cx = num('cx');
			const cy = num('cy');
			const r = num('r');
			if (r <= 0) return '';
			// Two arcs make a full circle; magic constant 0.5522847498 is the
			// bezier-circle approximation factor.
			const k = r * 0.5522847498;
			return (
				`M ${cx - r} ${cy}` +
				` C ${cx - r} ${cy - k}, ${cx - k} ${cy - r}, ${cx} ${cy - r}` +
				` C ${cx + k} ${cy - r}, ${cx + r} ${cy - k}, ${cx + r} ${cy}` +
				` C ${cx + r} ${cy + k}, ${cx + k} ${cy + r}, ${cx} ${cy + r}` +
				` C ${cx - k} ${cy + r}, ${cx - r} ${cy + k}, ${cx - r} ${cy}` +
				` Z`
			);
		}
		case 'ellipse': {
			const cx = num('cx');
			const cy = num('cy');
			const rx = num('rx');
			const ry = num('ry');
			if (rx <= 0 || ry <= 0) return '';
			const kx = rx * 0.5522847498;
			const ky = ry * 0.5522847498;
			return (
				`M ${cx - rx} ${cy}` +
				` C ${cx - rx} ${cy - ky}, ${cx - kx} ${cy - ry}, ${cx} ${cy - ry}` +
				` C ${cx + kx} ${cy - ry}, ${cx + rx} ${cy - ky}, ${cx + rx} ${cy}` +
				` C ${cx + rx} ${cy + ky}, ${cx + kx} ${cy + ry}, ${cx} ${cy + ry}` +
				` C ${cx - kx} ${cy + ry}, ${cx - rx} ${cy + ky}, ${cx - rx} ${cy}` +
				` Z`
			);
		}
		case 'line': {
			const x1 = num('x1');
			const y1 = num('y1');
			const x2 = num('x2');
			const y2 = num('y2');
			return `M ${x1} ${y1} L ${x2} ${y2}`;
		}
		case 'polyline': {
			const pts = (el.getAttribute('points') ?? '').trim();
			if (!pts) return '';
			const coords = pts.split(/[\s,]+/).filter(Boolean).map(Number);
			if (coords.length < 4) return '';
			let d = `M ${coords[0]} ${coords[1]}`;
			for (let i = 2; i < coords.length; i += 2) d += ` L ${coords[i]} ${coords[i + 1]}`;
			return d;
		}
		case 'polygon': {
			const pts = (el.getAttribute('points') ?? '').trim();
			if (!pts) return '';
			const coords = pts.split(/[\s,]+/).filter(Boolean).map(Number);
			if (coords.length < 6) return '';
			let d = `M ${coords[0]} ${coords[1]}`;
			for (let i = 2; i < coords.length; i += 2) d += ` L ${coords[i]} ${coords[i + 1]}`;
			return d + ' Z';
		}
		default:
			return '';
	}
}

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

/** A reusable component authored by the user. Persisted in localStorage;
 *  inserted into the canvas via `insertUserComponent` (which clones with
 *  fresh ids, preserving the author's intent). */
export interface UserComponent {
	id: string;
	name: string;
	/** Full subtree — roots have `parentId: null`. The same shape that
	 *  `insertTemplate` accepts, so insertion reuses one code path. */
	blocks: DesignBlock[];
	createdAt: number;
	updatedAt: number;
}

class CanvasState {
	// 1. Reactive state properties
	sceneRevision = $state(0);
	items = $state<DesignBlock[]>([
		{
			id: 'frame_1',
			type: 'frame',
			name: 'Auth Frame',
			x: 80,
			y: 80,
			w: 360,
			h: 560,
			props: {},
			style: { background: '#ffffff', border: '1px solid #cbd5e1', overflow: 'hidden' },
			parentId: null,
			rotation: 0,
			children: ['card_1', 'text_1']
		},
		// Nested Card (x, y are relative to frame_1)
		{
			id: 'card_1',
			type: 'card',
			name: 'Form Card',
			x: 30,
			y: 100,
			w: 300,
			h: 200,
			props: { description: 'Please log in to continue' },
			style: { background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px' },
			parentId: 'frame_1',
			rotation: 0,
			children: []
		},
		// Nested Text (x, y are relative to frame_1)
		{
			id: 'text_1',
			type: 'text',
			name: 'Welcome Text',
			x: 30,
			y: 45,
			w: 300,
			h: 40,
			props: { text: 'Welcome Back!' },
			style: { color: '#0066ff', 'font-size': '20px', 'font-weight': 'bold', padding: '4px' },
			parentId: 'frame_1',
			rotation: 0,
			children: []
		},
		// Standalone Container (outside frame)
		{
			id: 'container_1',
			type: 'container',
			name: 'Assets',
			x: 500,
			y: 80,
			w: 300,
			h: 300,
			props: {},
			style: { overflow: 'hidden', border: '2px dashed #cbd5e1' },
			parentId: null,
			rotation: 0,
			children: ['img_1']
		},
		// Nested Image (x, y are relative to container_1)
		{
			id: 'img_1',
			type: 'image',
			name: 'Logo Image',
			x: 20,
			y: 50,
			w: 260,
			h: 180,
			props: { src: '/logomotif.png' },
			style: { border: '1px solid #e2e8f0' },
			parentId: 'container_1',
			rotation: 0,
			children: []
		}
	]);
	selectedIds = $state<string[]>([]);
	
	get selectedId(): string | null {
		return this.selectedIds.length > 0 ? this.selectedIds[0] : null;
	}
	
	set selectedId(val: string | null) {
		this.selectedIds = val ? [val] : [];
	}
	
	isSnapping = $state(true);
	snapToGrid = $state(false);
	snapToObjects = $state(true);
	snapToGuides = $state(true);
	pixelGridVisible = $state(true);
	canvasBackground = $state('var(--canvas-sheet-bg)');
	readonly nudgeAmount = 1;
	readonly bigNudgeAmount = 10;
	
	// Context Menu and Clipboard States
	contextMenu = $state<{ x: number; y: number; blockId: string | null } | null>(null);
	clipboard = $state<string | null>(null);
	styleClipboard = $state<Record<string, string | number> | null>(null);
	hoveredParentId = $state<string | null>(null);
	
	collapsedIds = $state<Record<string, boolean>>({});

	activeGuides = $state<{
		x?: number;
		y?: number;
		boundsX?: { min: number; max: number };
		boundsY?: { min: number; max: number };
		spacing?: { axis: 'x' | 'y'; value: number; x: number; y: number };
	} | null>(null);

	dropTargetId = $state<string | null>(null);
	/** The current isolation root for drill-in selection. Null means the page root. */
	deepSelectParentId = $state<string | null>(null);
	constrainProportions = $state(false);
	/** Reused by Cmd+D so each repeat duplicates by the previous visual offset. */
	lastDuplicateOffset = $state({ x: 24, y: 24 });

	userGuides = $state<{ id: string; type: 'h' | 'v'; value: number }[]>([]);
	rulerDrag = $state<{
		id: string;
		type: 'h' | 'v';
		isNew: boolean;
		startVal: number;
	} | null>(null);
	selectedGuideId = $state<string | null>(null);

	// Measurement HUD (hold Alt + hover): distances from the selection to the
	// hovered block, in absolute canvas coordinates.
	altKey = $state(false);
	measure = $state<{
		segments: { x1: number; y1: number; x2: number; y2: number; label: string }[];
	} | null>(null);

	private _activePopoverId = $state<string | null>(null);

	get activePopoverId(): string | null {
		return this._activePopoverId;
	}

	set activePopoverId(val: string | null) {
		if (this._activePopoverId !== val) {
			if (this._activePopoverId !== null) {
				this.commitGesture();
			}
			if (val !== null) {
				this.recordGestureStart();
			}
			this._activePopoverId = val;
		}
	}

	toggleCollapse(blockId: string) {
		this.collapsedIds[blockId] = !this.collapsedIds[blockId];
	}

	isCollapsed(blockId: string): boolean {
		return !!this.collapsedIds[blockId];
	}
	
	sidebarDrag = $state<{
		id: string;
		pointerId: number;
		startY: number;
		hasMoved: boolean;
		targetId: string | null;
		dropPosition: 'before' | 'inside' | 'after' | null;
	} | null>(null);

	// ── User-saved Component Library ────────────────────────────────────────
	// Persisted list of reusable component subtrees the user has authored.
	// Distinct from `items` (the live canvas scene) and from the
	// static TEMPLATES catalog in `designtemplates.ts`. Stored under its own
	// localStorage key so a corrupted canvas state can't take the library
	// down with it.
	private static USER_COMPONENTS_KEY = 'fractaldesign:user-components';
	userComponents = $state<UserComponent[]>([]);
	// Debounce timer for the persistence effect. Lives for the lifetime of
	// the singleton (canvas state is never disposed in this app — matching
	// the pre-existing `saveTimer` pattern). Cleared at the start of each
	// effect re-run so a new edit always supersedes a pending flush.
	private userComponentsSaveTimer: ReturnType<typeof setTimeout> | null = null;
	private pendingUserComponentsSnapshot: string | null = null;

	viewport = $state({
		x: 0,
		y: 0,
		zoom: 1
	});

	// --- Scene persistence (localStorage) ---
	private static STORAGE_KEY = 'fractaldesign:canvas-scene';
	// Bumped whenever the persisted scene shape changes in a way that needs a migration on
	// load. No migrations exist yet (this is the first version), but the field is written
	// now so a future format change has something to branch on.
	private static SCHEMA_VERSION = 2;
	private saveTimer: ReturnType<typeof setTimeout> | null = null;
	private pendingSceneSnapshot: string | null = null;
	// Held by reference so `$effect.root` doesn't get garbage-collected
	// before the singleton is disposed (Svelte 5 cleans up only when the
	// returned cleanup function is invoked).
	private userComponentsRootCleanup: (() => void) | null = null;

	constructor() {
		this.loadScene();
		this.loadUserComponents();
		this.setupPersistence();
		this.setupUserComponentsPersistence();
	}

	private loadUserComponents() {
		if (typeof localStorage === 'undefined') return;
		try {
			const raw = localStorage.getItem(CanvasState.USER_COMPONENTS_KEY);
			if (!raw) return;
			const data: unknown = JSON.parse(raw);
			if (!Array.isArray(data)) return;
			const ids = new Set<string>();
			this.userComponents = data.flatMap((candidate): UserComponent[] => {
				if (!candidate || typeof candidate !== 'object') return [];
				const component = candidate as Partial<UserComponent>;
				const blocks = sanitizeDesignBlocks(component.blocks);
				if (typeof component.id !== 'string' || !component.id || ids.has(component.id)
					|| typeof component.name !== 'string' || !component.name.trim() || !blocks
					|| !finiteNumber(component.createdAt) || !finiteNumber(component.updatedAt)) return [];
				ids.add(component.id);
				return [{ id: component.id, name: component.name, blocks, createdAt: component.createdAt, updatedAt: component.updatedAt }];
			});
		} catch {
			/* corrupt or unavailable storage — leave userComponents empty */
		}
	}

	private setupUserComponentsPersistence() {
		if (typeof localStorage === 'undefined') return;
		// Capture the cleanup fn so the root + its effects can be torn
		// down if the singleton is ever disposed (e.g. in a test).
		this.userComponentsRootCleanup = $effect.root(() => {
			$effect(() => {
				// Re-run whenever the library mutates. Snapshot reads the
				// array + every block, so any nested edit re-persists.
				const snapshot = JSON.stringify(this.userComponents);
				this.pendingUserComponentsSnapshot = snapshot;
				if (this.userComponentsSaveTimer) clearTimeout(this.userComponentsSaveTimer);
				this.userComponentsSaveTimer = setTimeout(() => {
					this.userComponentsSaveTimer = null;
					try {
						localStorage.setItem(CanvasState.USER_COMPONENTS_KEY, snapshot);
						if (this.pendingUserComponentsSnapshot === snapshot) this.pendingUserComponentsSnapshot = null;
					} catch {
						/* ignore quota errors */
					}
				}, 300);
			});
		});
	}

	// Loaded scene data (from localStorage, or a hand-edited/foreign project file passed to
	// replaceScene) isn't guaranteed to have unique block ids — Layers.svelte keys its
	// `{#each}` on `block.id`, so a duplicate corrupts that panel's rendering. Regenerates
	// an id on any collision and fixes up every parentId/children reference that pointed at
	// the old id, so the tree stays consistent.
	private dedupeBlockIds(items: DesignBlock[]): DesignBlock[] {
		const seen = new Set<string>();
		const remap = new Map<string, string>();
		for (const block of items) {
			if (seen.has(block.id)) {
				const newId = this.generateId();
				remap.set(block.id, newId);
				block.id = newId;
			}
			seen.add(block.id);
		}
		if (remap.size === 0) return items;
		for (const block of items) {
			if (block.parentId && remap.has(block.parentId)) {
				block.parentId = remap.get(block.parentId)!;
			}
			block.children = block.children.map(cid => remap.get(cid) ?? cid);
		}
		return items;
	}

	private loadScene() {
		if (typeof localStorage === 'undefined') return;
		try {
			const raw = localStorage.getItem(CanvasState.STORAGE_KEY);
			if (!raw) return;
			const data = JSON.parse(raw);
			const items = sanitizeDesignBlocks(data?.items);
			if (items) {
				for (const block of items) {
					if (block.type === 'image' && block.props?.src === '/images/logomotif.png') {
						block.props = { ...block.props, src: '/logomotif.png' };
					}
				}
				this.items = this.dedupeBlockIds(items);
				this.userGuides = sanitizeGuides(data.userGuides);
				this.viewport = sanitizeViewport(data.viewport) ?? { x: 0, y: 0, zoom: 1 };
				this.snapToGrid = data.snapToGrid === true;
				this.snapToObjects = data.snapToObjects !== false;
				this.snapToGuides = data.snapToGuides !== false;
				this.pixelGridVisible = data.pixelGridVisible !== false;
				if (typeof data.canvasBackground === 'string') this.canvasBackground = data.canvasBackground;
				this.constrainProportions = data.constrainProportions === true;
			}
		} catch {
			/* corrupt or unavailable storage — fall back to the seed scene */
		}
	}

	private setupPersistence() {
		if (typeof localStorage === 'undefined') return;
		// Deep-reads items + userGuides (via getSnapshot), so any nested edit
		// re-runs this. Debounced so drags don't hammer localStorage.
		$effect.root(() => {
			$effect(() => {
				const snapshot = this.getSnapshot();
				this.pendingSceneSnapshot = snapshot;
				if (this.saveTimer) clearTimeout(this.saveTimer);
				this.saveTimer = setTimeout(() => {
					this.saveTimer = null;
					try {
						localStorage.setItem(CanvasState.STORAGE_KEY, snapshot);
						if (this.pendingSceneSnapshot === snapshot) this.pendingSceneSnapshot = null;
					} catch {
						/* ignore quota / availability errors */
					}
				}, 300);
			});
		});
	}

	get hasPendingPersistence(): boolean {
		return this.saveTimer !== null || this.userComponentsSaveTimer !== null
			|| this.pendingSceneSnapshot !== null || this.pendingUserComponentsSnapshot !== null;
	}

	flushPendingChanges(): boolean {
		if (typeof localStorage === 'undefined') return true;
		if (this.saveTimer) clearTimeout(this.saveTimer);
		if (this.userComponentsSaveTimer) clearTimeout(this.userComponentsSaveTimer);
		this.saveTimer = null;
		this.userComponentsSaveTimer = null;
		try {
			localStorage.setItem(CanvasState.STORAGE_KEY, this.getSnapshot());
			localStorage.setItem(CanvasState.USER_COMPONENTS_KEY, JSON.stringify(this.userComponents));
			this.pendingSceneSnapshot = null;
			this.pendingUserComponentsSnapshot = null;
			return true;
		} catch {
			return false;
		}
	}

	/** Wipe persisted scene and reload the page to get the seed back. */
	resetScene() {
		if (typeof localStorage !== 'undefined') {
			try {
				localStorage.removeItem(CanvasState.STORAGE_KEY);
			} catch {
				/* ignore */
			}
		}
		if (typeof window !== 'undefined') window.location.reload();
	}

	/** Replace the whole scene graph (used when loading a project file). */
	replaceScene(
		items: DesignBlock[],
		userGuides: { id: string; type: 'h' | 'v'; value: number }[] = [],
		options: { resetHistory?: boolean } = {}
	) {
		const sanitized = sanitizeDesignBlocks(items);
		if (!sanitized) throw new Error('Design scene contains invalid blocks.');
		this.items = this.dedupeBlockIds(sanitized);
		this.userGuides = sanitizeGuides(userGuides);
		this.selectedIds = [];
		this.sceneRevision += 1;
		if (options.resetHistory ?? true) {
			this.history.clear();
		}
	}

	private animationFrameId: number | null = null;

	cancelAnimation() {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	animateViewport(targetX: number, targetY: number, targetZoom: number, duration = 350) {
		this.cancelAnimation();

		const startX = this.viewport.x;
		const startY = this.viewport.y;
		const startZoom = this.viewport.zoom;
		const startTime = performance.now();

		// Easing function: cubic ease-out
		const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

		const step = (now: number) => {
			const elapsed = now - startTime;
			const progress = Math.min(1, elapsed / duration);
			const eased = easeOutCubic(progress);

			this.viewport.x = startX + (targetX - startX) * eased;
			this.viewport.y = startY + (targetY - startY) * eased;
			this.viewport.zoom = startZoom + (targetZoom - startZoom) * eased;

			if (progress < 1) {
				this.animationFrameId = requestAnimationFrame(step);
			} else {
				this.animationFrameId = null;
			}
		};

		this.animationFrameId = requestAnimationFrame(step);
	}

	// Constants
	readonly GRID_SIZE = 24;

	// 2. Gesture trackers
	drag = $state<{
		id: string;
		startPointerX: number;
		startPointerY: number;
		startItemX: number;
		startItemY: number;
		selectedBlocks?: { id: string; startX: number; startY: number }[];
	} | null>(null);
	resize = $state<{
		id: string;
		handle: ResizeHandle;
		startPointerX: number;
		startPointerY: number;
		startX: number;
		startY: number;
		startW: number;
		startH: number;
	} | null>(null);
	rotate = $state<{ id: string; cx: number; cy: number; startAngle: number; startRotation: number } | null>(null);
	marquee = $state<{ x0: number; y0: number; x1: number; y1: number; base: string[] } | null>(null);
	pan = $state<{
		startPointerX: number;
		startPointerY: number;
		startViewportX: number;
		startViewportY: number;
	} | null>(null);

	// Space bar held → empty-canvas drag pans instead of marquee-selecting.
	spaceHeld = $state(false);

	// Active tool mode: arrow (select/resize) or hand (pan).
	toolMode = $state<'arrow' | 'hand'>('arrow');

	// Draw tool: when non-null, clicking on canvas starts drag-to-draw.
	drawTool = $state<ShapeType | 'text' | 'frame' | null>(null);

	// Drag-to-draw interaction state.
	isDrawing = $state(false);
	drawStartPos = $state<{ x: number; y: number } | null>(null);
	drawCurrentPos = $state<{ x: number; y: number } | null>(null);

	// Pen-tool transient state. Mirrors `marquee` — purely UI-side, never
	// committed to `items` until the user closes the path or cancels.
	penState = $state<{
		blockId: string;
		path: VectorPath;
		// Pointer-down location used to distinguish a click from a click-drag.
		// Until the pointer moves more than a few px from here, we don't
		// create handles on the just-placed anchor (matches the spec: "click
		// = straight segment, click-drag = bezier handles").
		downLocal: { x: number; y: number };
		draggingHandleOf: { pointId: string } | null;
		pointerLocal: { x: number; y: number };
	} | null>(null);

	// Text editing: when non-null, the text block is contenteditable.
	editingTextId = $state<string | null>(null);

	/** Activate a draw tool (shape/text/frame) and switch to arrow mode. */
	activateDrawTool(tool: ShapeType | 'text' | 'frame') {
		this.drawTool = tool;
		this.toolMode = 'arrow';
		this.isDrawing = false;
		this.drawStartPos = null;
		this.drawCurrentPos = null;
		this.selectedId = null;
		// Pen tool is a special case (multi-click), not drag-to-draw.
		if (tool !== 'vector') {
			this.penState = null;
		}
	}

	// -------------------------------------------------------------------------
	// Pen tool (vector drawTool) — click/drag/double-click to draw paths.
	// -------------------------------------------------------------------------

	private penBlockId(): string {
		return `pt_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
	}

	private penPointId(): string {
		return `pp_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
	}

	private penPathId(): string {
		return `vp_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
	}

	/** Initialize the pen tool with a fresh block + in-progress path at the
	 *  given canvas-space coordinate. Returns the new block id. */
	startPenBlock(canvasX: number, canvasY: number): string {
		const id = this.penBlockId();
		const startX = canvasX - 10;
		const startY = canvasY - 10;
		const block: DesignBlock = {
			id,
			type: 'vector',
			name: 'New Vector',
			x: this.snap(startX),
			y: this.snap(startY),
			w: 200,
			h: 200,
			rotation: 0,
			props: { paths: [] as VectorPath[] },
			style: { background: 'none', stroke: '#000000', strokeWidth: '1' },
			parentId: null,
			children: []
		};
		this.items = [...this.items, block];
		this.selectedId = id;
		const firstPt: PathPoint = { id: this.penPointId(), x: 10, y: 10 };
		this.penState = {
			blockId: id,
			path: { id: this.penPathId(), points: [firstPt], closed: false },
			downLocal: { x: 10, y: 10 },
			draggingHandleOf: null,
			pointerLocal: { x: 10, y: 10 }
		};
		return id;
	}

	/** Drop the in-progress pen path onto its block and exit pen tool. If
	 *  `close` is true, mark the path closed before committing. */
	finishPenPath(close: boolean) {
		const s = this.penState;
		if (!s) return;
		if (s.path.points.length < 2) {
			// A single anchor is just a dot — drop the empty block and reset.
			this.items = this.items.filter((b) => b.id !== s.blockId);
			this.penState = null;
			return;
		}
		this.recordGestureStart();
		s.path.closed = close;
		this.commitPenPath(s.blockId, s.path);
		// Re-fit the block to its actual path extent.
		this.fitVectorToPaths(s.blockId);
		this.commitGesture();
		this.penState = null;
	}

	/** Discard the in-progress pen path (Escape). Drops the empty block — but
	 *  if the user placed at least two anchors, keep the path as an open path
	 *  on the block, just not closed. (Matches the spec: "Escape = cancel
	 *  without closing".) */
	cancelPen() {
		const s = this.penState;
		if (!s) return;
		if (s.path.points.length < 2) {
			this.items = this.items.filter((b) => b.id !== s.blockId);
		} else {
			this.recordGestureStart();
			s.path.closed = false;
			this.commitPenPath(s.blockId, s.path);
			this.fitVectorToPaths(s.blockId);
			this.commitGesture();
		}
		this.penState = null;
	}

	// Distance in canvas-world units that distinguishes "click" from
	// "click-drag" for the pen tool. Below this, no handles are created.
	private readonly PEN_DRAG_THRESHOLD = 4;

	/** Click on canvas while pen tool is active: either add a new anchor to
	 *  the current path, or — if pointer is on the first anchor — close it.
	 *  `localX`/`localY` are block-local coordinates. */
	penPointerDown(localX: number, localY: number) {
		const s = this.penState;
		if (!s) return;
		const block = this.items.find((b) => b.id === s.blockId);
		if (!block) return;
		const path = s.path;
		// Click on the first point closes the path (3+ points required for a
		// meaningful closed shape).
		if (path.points.length >= 3) {
			const first = path.points[0];
			const dx = localX - first.x;
			const dy = localY - first.y;
			if (Math.hypot(dx, dy) <= 8 / this.viewport.zoom) {
				this.finishPenPath(true);
				this.drawTool = null;
				return;
			}
		}
		// Grow the block to include the new point if it falls outside.
		this.growVectorForPoint(block.id, localX, localY);
		const newPoint: PathPoint = { id: this.penPointId(), x: localX, y: localY };
		path.points.push(newPoint);
		s.downLocal = { x: localX, y: localY };
		s.pointerLocal = { x: localX, y: localY };
		// The next move is a click-drag handle on the new point — but only
		// once the pointer moves past the threshold; until then this stays
		// null and the anchor remains a straight-line point.
		s.draggingHandleOf = null;
	}

	/** Move during a click-drag on the freshly-placed anchor: drags the out-
	 *  handle on the just-added point and mirrors it into the in-handle.
	 *  Until the pointer moves past PEN_DRAG_THRESHOLD from the down
	 *  position, no handles are touched. */
	penPointerMove(localX: number, localY: number) {
		const s = this.penState;
		if (!s) return;
		const block = this.items.find((b) => b.id === s.blockId);
		if (!block) return;
		s.pointerLocal = { x: localX, y: localY };
		const last = s.path.points[s.path.points.length - 1];
		if (!last) return;
		const dist = Math.hypot(localX - s.downLocal.x, localY - s.downLocal.y);
		if (s.draggingHandleOf) {
			// Already dragging — keep updating the handle positions.
			this.applyHandleDragFromPointer(last, localX, localY);
			this.growVectorForPoint(block.id, localX, localY);
		} else if (dist > this.PEN_DRAG_THRESHOLD && s.draggingHandleOf === null && s.path.points.length > 1) {
			// Promote this move into a click-drag — start creating handles.
			s.draggingHandleOf = { pointId: last.id };
			this.applyHandleDragFromPointer(last, localX, localY);
			this.growVectorForPoint(block.id, localX, localY);
		}
	}

	private applyHandleDragFromPointer(anchor: PathPoint, localX: number, localY: number) {
		// Compute handle offsets from the anchor. The user pointer IS the
		// out-handle; the in-handle is the mirrored negative (symmetric
		// handles, Figma parity).
		anchor.handleOutX = localX - anchor.x;
		anchor.handleOutY = localY - anchor.y;
		anchor.handleInX = -(localX - anchor.x);
		anchor.handleInY = -(localY - anchor.y);
	}

	/** Drop the just-dragged handle (mirror stays). */
	penPointerUp() {
		const s = this.penState;
		if (!s) return;
		s.draggingHandleOf = null;
	}

	/** Ensure the block's bounding box contains the given local point. If
	 *  not, expand the block (preserving existing points) so the editor can
	 *  keep drawing past the original 200×200 size. */
	private growVectorForPoint(blockId: string, localX: number, localY: number) {
		const block = this.items.find((b) => b.id === blockId);
		if (!block) return;
		const pad = 12;
		const minX = 0;
		const minY = 0;
		const maxX = block.w;
		const maxY = block.h;
		if (localX < minX || localY < minY || localX > maxX || localY > maxY) {
			const nx = Math.min(minX, localX - pad);
			const ny = Math.min(minY, localY - pad);
			const nMaxX = Math.max(maxX, localX + pad);
			const nMaxY = Math.max(maxY, localY + pad);
			const newW = nMaxX - nx;
			const newH = nMaxY - ny;
			const paths = (block.props.paths as VectorPath[] | undefined) ?? [];
			const dx = -nx;
			const dy = -ny;
			for (const p of paths) {
				for (const pt of p.points) {
					pt.x += dx;
					pt.y += dy;
				}
			}
			// Also translate the in-progress pen path.
			if (this.penState && this.penState.blockId === blockId) {
				for (const pt of this.penState.path.points) {
					pt.x += dx;
					pt.y += dy;
				}
				this.penState.pointerLocal.x += dx;
				this.penState.pointerLocal.y += dy;
			}
			block.x = this.snap(block.x + nx);
			block.y = this.snap(block.y + ny);
			block.w = this.snap(newW);
			block.h = this.snap(newH);
			if (paths.length > 0) {
				block.props = {
					...block.props,
					paths: paths.map((p) => ({ ...p, points: p.points.slice() }))
				};
			}
		}
	}

	// 3. Helper: Coordinate Translation (Accounts for Sidebar & Header offsets)
	screenToCanvas(clientX: number, clientY: number) {
		const el = typeof document !== 'undefined' ? document.querySelector('.design-viewport') : null;
		const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0 };

		return {
			x: (clientX - rect.left - this.viewport.x) / this.viewport.zoom,
			y: (clientY - rect.top - this.viewport.y) / this.viewport.zoom
		};
	}

	snap(value: number) {
	return this.isSnapping && this.snapToGrid ? Math.round(value / this.GRID_SIZE) * this.GRID_SIZE : value;
	}

	getAbsolutePosition(block: DesignBlock): { x: number; y: number } {
		let absX = block.x;
		let absY = block.y;
		let currentParentId = block.parentId;
		while (currentParentId) {
			const parent = this.items.find(b => b.id === currentParentId);
			if (!parent) break;
			absX += parent.x;
			absY += parent.y;
			currentParentId = parent.parentId;
		}
		return { x: absX, y: absY };
	}

	// 4. Interaction Handlers
	onItemPointerDown(event: PointerEvent, item: DesignBlock) {
		if (item.locked) return;
		if (event.button !== 0) return;
		// Let the event bubble for panning when space is held or hand tool is active.
		if (this.spaceHeld || this.toolMode === 'hand') return;
		// Pen tool owns canvas clicks — let pointerdown bubble up to
		// onCanvasPointerDown so the multi-click pen flow handles it.
		// Otherwise selecting the block would steal every click.
		if (this.drawTool === 'vector') return;
		this.cancelAnimation();
		event.stopPropagation();
		
		if (!this.selectedIds.includes(item.id)) {
			this.selectedIds = [item.id];
		}
		this.selectedGuideId = null;
		this.activePopoverId = null;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		// Record snapshot BEFORE drag starts
		this.recordGestureStart();
		const point = this.screenToCanvas(event.clientX, event.clientY);
		
		const selectedBlocks = this.items
			.filter(b => this.selectedIds.includes(b.id) && !b.locked)
			.map(b => ({ id: b.id, startX: b.x, startY: b.y }));

		this.drag = {
			id: item.id,
			startPointerX: point.x,
			startPointerY: point.y,
			startItemX: item.x,
			startItemY: item.y,
			selectedBlocks
		};
	}

	onResizePointerDown(event: PointerEvent, item: DesignBlock, handle: ResizeHandle = 'se') {
		if (event.button !== 0) return;
		this.cancelAnimation();
		event.stopPropagation();
		try {
			(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		} catch {
			/* pointer not capturable (e.g. synthetic event) */
		}
		// Record snapshot BEFORE resize starts
		this.recordGestureStart();
		const point = this.screenToCanvas(event.clientX, event.clientY);
		this.resize = {
			id: item.id,
			handle,
			startPointerX: point.x,
			startPointerY: point.y,
			startX: item.x,
			startY: item.y,
			startW: item.w,
			startH: item.h
		};
	}

	onRotatePointerDown(event: PointerEvent, item: DesignBlock) {
		if (event.button !== 0) return;
		this.cancelAnimation();
		event.stopPropagation();
		try {
			(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		} catch {
			/* pointer not capturable (e.g. synthetic event) */
		}
		this.recordGestureStart();
		const abs = this.getAbsolutePosition(item);
		const cx = abs.x + item.w / 2;
		const cy = abs.y + item.h / 2;
		const point = this.screenToCanvas(event.clientX, event.clientY);
		this.rotate = {
			id: item.id,
			cx,
			cy,
			startAngle: Math.atan2(point.y - cy, point.x - cx),
			startRotation: item.rotation || 0
		};
	}

	onCanvasPointerDown(event: PointerEvent) {
		// Pen tool handled via the multi-click flow (not drag-to-draw).
		if (this.drawTool === 'vector' && event.button === 0 && !this.spaceHeld) {
			event.stopPropagation();
			event.preventDefault();
			this.cancelAnimation();
			this.closeContextMenu();
			try {
				(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
			} catch {
				/* pointer not capturable */
			}
			const point = this.screenToCanvas(event.clientX, event.clientY);
			if (!this.penState) {
				this.startPenBlock(point.x, point.y);
			} else {
				const block = this.items.find((b) => b.id === this.penState!.blockId);
				if (!block) {
					// Block got removed (defensive) — start fresh.
					this.penState = null;
					this.startPenBlock(point.x, point.y);
				} else {
					const abs = this.getAbsolutePosition(block);
					this.penPointerDown(point.x - abs.x, point.y - abs.y);
				}
			}
			return;
		}

		// If a draw tool is active, start drag-to-draw.
		if (this.drawTool && event.button === 0 && !this.spaceHeld) {
			this.cancelAnimation();
			this.closeContextMenu();
			this.selectedId = null;
			try {
				(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
			} catch {
				/* pointer not capturable */
			}
			this.recordGestureStart();
			const point = this.screenToCanvas(event.clientX, event.clientY);
			this.drawStartPos = { x: point.x, y: point.y };
			this.drawCurrentPos = { x: point.x, y: point.y };
			this.isDrawing = true;
			return;
		}

		// Pan with space-held, hand tool, or middle mouse; otherwise left-drag marquee-selects.
		const wantPan = this.spaceHeld || this.toolMode === 'hand' || event.button === 1;
		if (event.button !== 0 && !wantPan) return;
		this.cancelAnimation();
		this.selectedGuideId = null;
		this.activePopoverId = null;
		this.closeContextMenu();
		try {
			(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		} catch {
			/* pointer not capturable (e.g. synthetic event) */
		}

		if (wantPan) {
			this.pan = {
				startPointerX: event.clientX,
				startPointerY: event.clientY,
				startViewportX: this.viewport.x,
				startViewportY: this.viewport.y
			};
			return;
		}

		// Marquee selection. Shift adds to the existing selection.
		const additive = event.shiftKey;
		if (!additive) this.selectedId = null;
		const point = this.screenToCanvas(event.clientX, event.clientY);
		this.marquee = {
			x0: point.x,
			y0: point.y,
			x1: point.x,
			y1: point.y,
			base: additive ? [...this.selectedIds] : []
		};
	}

	onPointerMove(event: PointerEvent) {
		// Pen tool: route to handle-drag logic.
		if (this.drawTool === 'vector' && this.penState) {
			const block = this.items.find((b) => b.id === this.penState!.blockId);
			if (block) {
				const abs = this.getAbsolutePosition(block);
				const point = this.screenToCanvas(event.clientX, event.clientY);
				this.penPointerMove(point.x - abs.x, point.y - abs.y);
			}
			return;
		}

		// Handle drawing preview (drag-to-draw).
		if (this.isDrawing) {
			const point = this.screenToCanvas(event.clientX, event.clientY);
			this.drawCurrentPos = { x: point.x, y: point.y };
			return;
		}

		const point = this.screenToCanvas(event.clientX, event.clientY);

		if (this.rulerDrag) {
			const drag = this.rulerDrag;
			const val = drag.type === 'h' ? point.y : point.x;
			// Fine-grained: round to the nearest SCREEN pixel rather than the 24px
			// grid. Granularity is 1px at 100% zoom and gets finer (sub-pixel) the
			// more you zoom in. Block-edge snapping below can still override this.
			const z = this.viewport.zoom;
			let snappedVal = Math.round(val * z) / z;

			const threshold = 5 / this.viewport.zoom;
			const candidates = this.items.filter(b => !b.hidden);
			let bestDiff = threshold;

			if (drag.type === 'v') {
				for (const b of candidates) {
					const absPos = this.getAbsolutePosition(b);
					const edges = [absPos.x, absPos.x + b.w / 2, absPos.x + b.w];
					for (const edge of edges) {
						const diff = Math.abs(val - edge);
						if (diff < bestDiff) {
							bestDiff = diff;
							snappedVal = edge;
						}
					}
				}
			} else {
				for (const b of candidates) {
					const absPos = this.getAbsolutePosition(b);
					const edges = [absPos.y, absPos.y + b.h / 2, absPos.y + b.h];
					for (const edge of edges) {
						const diff = Math.abs(val - edge);
						if (diff < bestDiff) {
							bestDiff = diff;
							snappedVal = edge;
						}
					}
				}
			}

			const guide = this.userGuides.find(g => g.id === drag.id);
			if (guide) {
				guide.value = snappedVal;
			}
			return;
		}

		if (this.drag) {
			const dx = point.x - this.drag.startPointerX;
			const dy = point.y - this.drag.startPointerY;
			const item = this.items.find((i) => i.id === this.drag?.id);
			if (item) {
				let targetX = this.drag.startItemX + dx;
				let targetY = this.drag.startItemY + dy;

				let guides: typeof this.activeGuides = null;

				// Snap Proximity Snap against siblings (exclude selected items to avoid self-snapping)
				const siblings = this.items.filter(b => 
					b.parentId === item.parentId && 
					!this.selectedIds.includes(b.id) && 
					!b.hidden
				);
				
				const screenThreshold = 5;
				const T = screenThreshold / this.viewport.zoom;

				let snapX: number | null = null;
				let snapY: number | null = null;
				let guideX: number | null = null;
				let guideY: number | null = null;
				let minGuideY = Infinity;
				let maxGuideY = -Infinity;
				let minGuideX = Infinity;
				let maxGuideX = -Infinity;

				const itemLeft = targetX;
				const itemCenter = targetX + item.w / 2;
				const itemRight = targetX + item.w;
				const itemTop = targetY;
				const itemMiddle = targetY + item.h / 2;
				const itemBottom = targetY + item.h;

				let bestDiffX = T;
				let bestDiffY = T;

				if (this.snapToObjects) for (const other of siblings) {
					const oL = other.x;
					const oC = other.x + other.w / 2;
					const oR = other.x + other.w;

					const diffsX = [
						{ itemVal: itemLeft, otherVal: oL, snapOffset: 0 },
						{ itemVal: itemLeft, otherVal: oC, snapOffset: 0 },
						{ itemVal: itemLeft, otherVal: oR, snapOffset: 0 },
						{ itemVal: itemCenter, otherVal: oL, snapOffset: -item.w / 2 },
						{ itemVal: itemCenter, otherVal: oC, snapOffset: -item.w / 2 },
						{ itemVal: itemCenter, otherVal: oR, snapOffset: -item.w / 2 },
						{ itemVal: itemRight, otherVal: oL, snapOffset: -item.w },
						{ itemVal: itemRight, otherVal: oC, snapOffset: -item.w },
						{ itemVal: itemRight, otherVal: oR, snapOffset: -item.w },
					];

					for (const d of diffsX) {
						const diff = Math.abs(d.itemVal - d.otherVal);
						if (diff < bestDiffX) {
							bestDiffX = diff;
							snapX = d.otherVal + d.snapOffset;
							guideX = d.otherVal;
							minGuideY = Math.min(itemTop, other.y);
							maxGuideY = Math.max(itemTop + item.h, other.y + other.h);
						}
					}
				}

				if (this.snapToGuides) for (const guide of this.userGuides) {
					if (guide.type === 'v') {
						const oX = guide.value;
						const diffsX = [
							{ itemVal: itemLeft, otherVal: oX, snapOffset: 0 },
							{ itemVal: itemCenter, otherVal: oX, snapOffset: -item.w / 2 },
							{ itemVal: itemRight, otherVal: oX, snapOffset: -item.w },
						];
						for (const d of diffsX) {
							const diff = Math.abs(d.itemVal - d.otherVal);
							if (diff < bestDiffX) {
								bestDiffX = diff;
								snapX = d.otherVal + d.snapOffset;
								guideX = d.otherVal;
								minGuideY = -50000;
								maxGuideY = 50000;
							}
						}
					}
				}

				if (this.snapToObjects) for (const other of siblings) {
					const oT = other.y;
					const oM = other.y + other.h / 2;
					const oB = other.y + other.h;

					const diffsY = [
						{ itemVal: itemTop, otherVal: oT, snapOffset: 0 },
						{ itemVal: itemTop, otherVal: oM, snapOffset: 0 },
						{ itemVal: itemTop, otherVal: oB, snapOffset: 0 },
						{ itemVal: itemMiddle, otherVal: oT, snapOffset: -item.h / 2 },
						{ itemVal: itemMiddle, otherVal: oM, snapOffset: -item.h / 2 },
						{ itemVal: itemMiddle, otherVal: oB, snapOffset: -item.h / 2 },
						{ itemVal: itemBottom, otherVal: oT, snapOffset: -item.h },
						{ itemVal: itemBottom, otherVal: oM, snapOffset: -item.h },
						{ itemVal: itemBottom, otherVal: oB, snapOffset: -item.h },
					];

					for (const d of diffsY) {
						const diff = Math.abs(d.itemVal - d.otherVal);
						if (diff < bestDiffY) {
							bestDiffY = diff;
							snapY = d.otherVal + d.snapOffset;
							guideY = d.otherVal;
							minGuideX = Math.min(itemLeft, other.x);
							maxGuideX = Math.max(itemLeft + item.w, other.x + other.w);
						}
					}
				}

				if (this.snapToGuides) for (const guide of this.userGuides) {
					if (guide.type === 'h') {
						const oY = guide.value;
						const diffsY = [
							{ itemVal: itemTop, otherVal: oY, snapOffset: 0 },
							{ itemVal: itemMiddle, otherVal: oY, snapOffset: -item.h / 2 },
							{ itemVal: itemBottom, otherVal: oY, snapOffset: -item.h },
						];
						for (const d of diffsY) {
							const diff = Math.abs(d.itemVal - d.otherVal);
							if (diff < bestDiffY) {
								bestDiffY = diff;
								snapY = d.otherVal + d.snapOffset;
								guideY = d.otherVal;
								minGuideX = -50000;
								maxGuideX = 50000;
							}
						}
					}
				}

				const parent = item.parentId ? this.items.find(p => p.id === item.parentId) : null;
				const parentAbs = parent ? this.getAbsolutePosition(parent) : { x: 0, y: 0 };

				let finalDx = dx;
				let finalDy = dy;

				if (snapX !== null) {
					item.x = snapX;
					finalDx = snapX - this.drag.startItemX;
					if (!guides) guides = {};
					guides.x = parentAbs.x + guideX!;
					guides.boundsX = { min: parentAbs.y + minGuideY, max: parentAbs.y + maxGuideY };
				} else {
					item.x = this.snap(targetX);
					finalDx = item.x - this.drag.startItemX;
				}

				if (snapY !== null) {
					item.y = snapY;
					finalDy = snapY - this.drag.startItemY;
					if (!guides) guides = {};
					guides.y = parentAbs.y + guideY!;
					guides.boundsY = { min: parentAbs.x + minGuideX, max: parentAbs.x + maxGuideX };
				} else {
					item.y = this.snap(targetY);
					finalDy = item.y - this.drag.startItemY;
				}

				// Smart-alignment guide lines disabled per user request — the
				// snap-to-position behavior above (item.x/y = snapX/snapY) is
				// independent of this and still applies; only the visual
				// guide line overlay is suppressed.
				this.activeGuides = null;

				// Apply finalDx and finalDy to all other selected blocks
				if (this.drag.selectedBlocks) {
					for (const sb of this.drag.selectedBlocks) {
						if (sb.id === item.id) continue;
						const otherItem = this.items.find(b => b.id === sb.id);
						if (otherItem) {
							otherItem.x = this.snap(sb.startX + finalDx);
							otherItem.y = this.snap(sb.startY + finalDy);
						}
					}
				}
			}

			// Update hovered drop zone
			const targetParent = this.findTargetParentAt(event.clientX, event.clientY, this.drag.id);
			this.hoveredParentId = targetParent ? targetParent.id : null;
		}

		if (this.resize) {
			const r = this.resize;
			const item = this.items.find((i) => i.id === r.id);
			if (item) {
				const dx = point.x - r.startPointerX;
				const dy = point.y - r.startPointerY;
				const h = r.handle;
				const onLeft = h.includes('w');
				const onRight = h.includes('e');
				const onTop = h.includes('n');
				const onBottom = h.includes('s');
				const MIN = 20;

				let newW = r.startW;
				let newH = r.startH;
				if (onLeft) newW = r.startW - dx;
				if (onRight) newW = r.startW + dx;
				if (onTop) newH = r.startH - dy;
				if (onBottom) newH = r.startH + dy;

				// Shift = keep aspect ratio.
				if (event.shiftKey) {
					const ratio = r.startW / r.startH;
					if ((onLeft || onRight) && (onTop || onBottom)) {
						if (Math.abs(newW - r.startW) > Math.abs(newH - r.startH) * ratio) newH = newW / ratio;
						else newW = newH * ratio;
					} else if (onLeft || onRight) newH = newW / ratio;
					else if (onTop || onBottom) newW = newH * ratio;
				}

				newW = Math.max(MIN, newW);
				newH = Math.max(MIN, newH);

				let newX = r.startX;
				let newY = r.startY;
				if (event.altKey) {
					// Resize symmetrically about the original center.
					newX = r.startX + r.startW / 2 - newW / 2;
					newY = r.startY + r.startH / 2 - newH / 2;
				} else {
					if (onLeft) newX = r.startX + (r.startW - newW);
					if (onTop) newY = r.startY + (r.startH - newH);
				}

				item.x = this.snap(newX);
				item.y = this.snap(newY);
				item.w = this.snap(newW);
				item.h = this.snap(newH);
			}
		}

		if (this.rotate) {
			const item = this.items.find((i) => i.id === this.rotate?.id);
			if (item) {
				const angle = Math.atan2(point.y - this.rotate.cy, point.x - this.rotate.cx);
				let deg = this.rotate.startRotation + ((angle - this.rotate.startAngle) * 180) / Math.PI;
				if (event.shiftKey) deg = Math.round(deg / 15) * 15; // snap to 15°
				item.rotation = Math.round(deg);
			}
		}

		if (this.marquee) {
			this.marquee.x1 = point.x;
			this.marquee.y1 = point.y;
			const rx0 = Math.min(this.marquee.x0, this.marquee.x1);
			const ry0 = Math.min(this.marquee.y0, this.marquee.y1);
			const rx1 = Math.max(this.marquee.x0, this.marquee.x1);
			const ry1 = Math.max(this.marquee.y0, this.marquee.y1);
			const hits: string[] = [];
			for (const b of this.items) {
				if (b.hidden || b.locked || b.parentId !== null) continue; // top-level only
				const a = this.getAbsolutePosition(b);
				if (a.x < rx1 && a.x + b.w > rx0 && a.y < ry1 && a.y + b.h > ry0) hits.push(b.id);
			}
			this.selectedIds = [...new Set([...this.marquee.base, ...hits])];
		}

		if (this.pan) {
			const dx = event.clientX - this.pan.startPointerX;
			const dy = event.clientY - this.pan.startPointerY;
			this.viewport.x = this.pan.startViewportX + dx;
			this.viewport.y = this.pan.startViewportY + dy;
		}
	}

	onPointerUp(event: PointerEvent) {
		// Pen tool: drop the just-dragged handle (mirror stays), but stay in pen
		// mode until the user closes or cancels.
		if (this.drawTool === 'vector' && this.penState) {
			this.penPointerUp();
			return;
		}

		// Finish drag-to-draw and create the block.
		if (this.isDrawing && this.drawStartPos && this.drawCurrentPos && this.drawTool) {
			this.commitDrawBlock(event.shiftKey);
			this.isDrawing = false;
			this.drawStartPos = null;
			this.drawCurrentPos = null;
			return;
		}

		this.activeGuides = null;
		
		if (this.rulerDrag) {
			const drag = this.rulerDrag;
			const viewport = typeof document !== 'undefined' ? document.querySelector('.design-viewport') : null;
			if (viewport) {
				const rect = viewport.getBoundingClientRect();
				const rulerSize = 24;
				const isOverRulerH = event.clientY - rect.top < rulerSize;
				const isOverRulerV = event.clientX - rect.left < rulerSize;
				if ((drag.type === 'h' && isOverRulerH) || (drag.type === 'v' && isOverRulerV) || event.clientY < rect.top || event.clientX < rect.left) {
					this.userGuides = this.userGuides.filter(g => g.id !== drag.id);
				}
			}
			this.commitGesture();
			this.rulerDrag = null;
			return;
		}

		if (this.drag) {
			// Find drop target parent container and reparent the block
			const targetParent = this.findTargetParentAt(event.clientX, event.clientY, this.drag.id);
			const targetParentId = targetParent ? targetParent.id : null;

			if (this.drag.selectedBlocks) {
				for (const sb of this.drag.selectedBlocks) {
					if (targetParentId && (targetParentId === sb.id || this.isDescendantOf(targetParentId, sb.id))) {
						continue; // Prevent circular hierarchy reference
					}
					this.reparentBlock(sb.id, targetParentId);
				}
			} else {
				this.reparentBlock(this.drag.id, targetParentId);
			}
			
			this.commitGesture();
		} else if (this.resize || this.rotate) {
			this.commitGesture();
		}

		this.drag = null;
		this.resize = null;
		this.rotate = null;
		this.marquee = null;
		this.pan = null;
		this.hoveredParentId = null;
	}

	onLayerPointerDown(event: PointerEvent, item: DesignBlock) {
		if (item.locked) return;
		if (event.button !== 0) return; // Only process left click selection/drag
		this.cancelAnimation();
		event.stopPropagation();
		this.selectedGuideId = null;
		this.activePopoverId = null;
		
		if (event.shiftKey) {
			const rendered = this.getLayerTreeBlockIds();
			const pivotId = this.selectedIds[this.selectedIds.length - 1];
			
			if (pivotId) {
				const idx1 = rendered.indexOf(pivotId);
				const idx2 = rendered.indexOf(item.id);
				if (idx1 !== -1 && idx2 !== -1) {
					const start = Math.min(idx1, idx2);
					const end = Math.max(idx1, idx2);
					this.selectedIds = rendered.slice(start, end + 1);
				} else {
					this.selectedIds = [item.id];
				}
			} else {
				this.selectedIds = [item.id];
			}
		} else {
			if (event.metaKey || event.ctrlKey) {
				this.selectedIds = this.selectedIds.includes(item.id)
					? this.selectedIds.filter(id => id !== item.id)
					: [...this.selectedIds, item.id];
			} else {
				this.selectedIds = [item.id];
			}
		}
		
		const el = event.currentTarget as HTMLElement;
		el.setPointerCapture(event.pointerId);

		this.sidebarDrag = {
			id: item.id,
			pointerId: event.pointerId,
			startY: event.clientY,
			hasMoved: false,
			targetId: null,
			dropPosition: null
		};
	}

	onLayerPointerMove(event: PointerEvent) {
		if (!this.sidebarDrag || this.sidebarDrag.pointerId !== event.pointerId) return;
		event.stopPropagation();

		// Threshold to start drag
		if (!this.sidebarDrag.hasMoved) {
			if (Math.abs(event.clientY - this.sidebarDrag.startY) > 4) {
				this.sidebarDrag.hasMoved = true;
			} else {
				return;
			}
		}

		// Find target row under pointer using hit-testing
		const el = document.elementFromPoint(event.clientX, event.clientY);
		const rowEl = el ? el.closest('.layer-row') : null;
		
		if (!rowEl) {
			// Check if we are hovering within the layer tree container general area
			const container = document.querySelector('.layer-tree-container');
			if (container) {
				const rect = container.getBoundingClientRect();
				const inside = event.clientX >= rect.left && event.clientX <= rect.right &&
							   event.clientY >= rect.top && event.clientY <= rect.bottom;
				if (inside) {
					this.sidebarDrag.targetId = null;
					this.sidebarDrag.dropPosition = 'after'; // default drop to root level end
					return;
				}
			}
			this.sidebarDrag.targetId = null;
			this.sidebarDrag.dropPosition = null;
			return;
		}

		const targetId = rowEl.getAttribute('data-block-id');
		if (!targetId || targetId === this.sidebarDrag.id || this.isDescendantOf(targetId, this.sidebarDrag.id)) {
			// Invalid drop targets (descendants, or self)
			this.sidebarDrag.targetId = null;
			this.sidebarDrag.dropPosition = null;
			return;
		}

		// Determine relative position
		const rect = rowEl.getBoundingClientRect();
		const relY = event.clientY - rect.top;
		const height = rect.height;

		const targetBlock = this.items.find(b => b.id === targetId);
		const canDropInside = targetBlock && (targetBlock.type === 'frame' || targetBlock.type === 'container');

		let dropPosition: 'before' | 'inside' | 'after' = 'inside';
		if (canDropInside) {
			if (relY < height * 0.25) {
				dropPosition = 'before';
			} else if (relY > height * 0.75) {
				dropPosition = 'after';
			} else {
				dropPosition = 'inside';
			}
		} else {
			if (relY < height * 0.5) {
				dropPosition = 'before';
			} else {
				dropPosition = 'after';
			}
		}

		this.sidebarDrag.targetId = targetId;
		this.sidebarDrag.dropPosition = dropPosition;
	}

	onLayerPointerUp(event: PointerEvent) {
		if (!this.sidebarDrag || this.sidebarDrag.pointerId !== event.pointerId) return;
		event.stopPropagation();

		const drag = this.sidebarDrag;
		const el = event.currentTarget as HTMLElement;
		try {
			el.releasePointerCapture(event.pointerId);
		} catch (err) {
			// Ignore capture release
		}

		this.sidebarDrag = null;

		if (drag.hasMoved && drag.dropPosition) {
			this.moveBlockInTree(drag.id, drag.targetId, drag.dropPosition);
		}
	}

	moveBlockInTree(blockId: string, targetId: string | null, position: 'before' | 'inside' | 'after') {
		if (blockId === targetId) return;
		if (targetId && this.isDescendantOf(targetId, blockId)) return;

		const block = this.items.find(b => b.id === blockId);
		if (!block) return;

		this.recordGestureStart();

		// Get absolute coordinates before reparenting
		const origAbs = this.getAbsolutePosition(block);

		// 1. Remove block from its old parent's children list
		if (block.parentId) {
			const oldParent = this.items.find(p => p.id === block.parentId);
			if (oldParent) {
				oldParent.children = oldParent.children.filter(cid => cid !== blockId);
			}
		}

		// 2. Insert into the tree based on drop position and target
		if (targetId === null) {
			// Drop at root level (append to end)
			block.parentId = null;
			this.items = [...this.items.filter(item => item.id !== blockId), block];
		} else {
			const target = this.items.find(b => b.id === targetId)!;
			
			if (position === 'inside') {
				if (target.type === 'frame' || target.type === 'container') {
					block.parentId = targetId;
					target.children = [...target.children.filter(cid => cid !== blockId), blockId];
				}
			} else {
				// Sibling reordering
				block.parentId = target.parentId;
				
				if (block.parentId) {
					const parent = this.items.find(p => p.id === block.parentId)!;
					const newChildren = parent.children.filter(cid => cid !== blockId);
					const targetIndex = newChildren.indexOf(targetId);
					
					if (position === 'before') {
						newChildren.splice(targetIndex, 0, blockId);
					} else {
						newChildren.splice(targetIndex + 1, 0, blockId);
					}
					parent.children = newChildren;
				} else {
					// Root list reordering
					const rootItems = this.items.filter(item => item.parentId === null && item.id !== blockId);
					const targetIndex = rootItems.findIndex(item => item.id === targetId);
					
					if (position === 'before') {
						rootItems.splice(targetIndex, 0, block);
					} else {
						rootItems.splice(targetIndex + 1, 0, block);
					}
					
					const childItems = this.items.filter(item => item.parentId !== null);
					this.items = [...rootItems, ...childItems];
				}
			}
		}

		// 3. Adjust block local coordinates to maintain identical visual screen position
		if (block.parentId) {
			const newParent = this.items.find(p => p.id === block.parentId);
			if (newParent) {
				const newParentAbs = this.getAbsolutePosition(newParent);
				block.x = this.snap(origAbs.x - newParentAbs.x);
				block.y = this.snap(origAbs.y - newParentAbs.y);
			}
		} else {
			block.x = this.snap(origAbs.x);
			block.y = this.snap(origAbs.y);
		}

		this.commitGesture();
	}

	onWheel(event: WheelEvent) {
		event.preventDefault();
		this.cancelAnimation();

		// Ctrl/Meta + scroll = zoom (also covers pinch-zoom on trackpad).
		// Plain scroll = trackpad pan.
		if (event.ctrlKey || event.metaKey) {
			const direction = event.deltaY < 0 ? 1 : -1;
			const oldZoom = this.viewport.zoom;
			
			// Multiplicative zoom for smoother and less sensitive scaling
			const zoomFactor = 1.05;
			const newZoom = Math.min(4.0, Math.max(0.15, direction > 0 ? oldZoom * zoomFactor : oldZoom / zoomFactor));
			
			const canvasPoint = this.screenToCanvas(event.clientX, event.clientY);

			const el = typeof document !== 'undefined' ? document.querySelector('.design-viewport') : null;
			const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0 };
			
			const localX = event.clientX - rect.left;
			const localY = event.clientY - rect.top;

			this.viewport.x = localX - canvasPoint.x * newZoom;
			this.viewport.y = localY - canvasPoint.y * newZoom;
			this.viewport.zoom = newZoom;
		} else {
			// Trackpad pan: deltaX/deltaY are physical pixel deltas.
			this.viewport.x -= event.deltaX;
			this.viewport.y -= event.deltaY;
		}
	}

	zoomIn() {
		const oldZoom = this.viewport.zoom;
		const newZoom = Math.min(4.0, oldZoom * 1.15);
		this.setZoomCentered(newZoom);
	}

	zoomOut() {
		const oldZoom = this.viewport.zoom;
		const newZoom = Math.max(0.15, oldZoom / 1.15);
		this.setZoomCentered(newZoom);
	}

	resetZoom() {
		this.setZoomCentered(1.0);
	}

	private setZoomCentered(newZoom: number) {
		const el = typeof document !== 'undefined' ? document.querySelector('.design-viewport') : null;
		const rect = el ? el.getBoundingClientRect() : { width: 800, height: 600 };
		const cx = rect.width / 2;
		const cy = rect.height / 2;

		const canvasPoint = {
			x: (cx - this.viewport.x) / this.viewport.zoom,
			y: (cy - this.viewport.y) / this.viewport.zoom
		};

		const targetX = cx - canvasPoint.x * newZoom;
		const targetY = cy - canvasPoint.y * newZoom;

		this.animateViewport(targetX, targetY, newZoom, 250);
	}

	centerView() {
		const rootBlocks = this.items.filter(b => b.parentId === null);
		
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;

		if (rootBlocks.length === 0) {
			minX = 0;
			maxX = 800;
			minY = 0;
			maxY = 600;
		} else {
			for (const block of rootBlocks) {
				minX = Math.min(minX, block.x);
				maxX = Math.max(maxX, block.x + block.w);
				minY = Math.min(minY, block.y);
				maxY = Math.max(maxY, block.y + block.h);
			}
		}

		const contentW = maxX - minX;
		const contentH = maxY - minY;

		const el = typeof document !== 'undefined' ? document.querySelector('.design-viewport') : null;
		const rect = el ? el.getBoundingClientRect() : { width: 800, height: 600 };
		const viewportW = rect.width;
		const viewportH = rect.height;

		const padding = 60;
		const rulerOffset = 24;

		// Calculate available dimensions (excluding rulers and padding)
		const availW = Math.max(100, viewportW - rulerOffset - 2 * padding);
		const availH = Math.max(100, viewportH - rulerOffset - 2 * padding);

		// Zoom to fit content
		let targetZoom = Math.min(availW / contentW, availH / contentH);
		targetZoom = Math.min(1.0, Math.max(0.15, targetZoom));

		// Center content in viewport (taking into account ruler offset)
		const cx = minX + contentW / 2;
		const cy = minY + contentH / 2;

		const viewportCx = rulerOffset + (viewportW - rulerOffset) / 2;
		const viewportCy = rulerOffset + (viewportH - rulerOffset) / 2;

		const targetX = viewportCx - cx * targetZoom;
		const targetY = viewportCy - cy * targetZoom;

		this.animateViewport(targetX, targetY, targetZoom, 400);
	}

	zoomToSelection() {
		const items = this.items.filter((block) => this.selectedIds.includes(block.id)).map((block) => ({ ...this.getAbsolutePosition(block), w: block.w, h: block.h }));
		if (items.length === 0) return this.centerView();
		const minX = Math.min(...items.map((item) => item.x));
		const minY = Math.min(...items.map((item) => item.y));
		const maxX = Math.max(...items.map((item) => item.x + item.w));
		const maxY = Math.max(...items.map((item) => item.y + item.h));
		const rect = typeof document !== 'undefined' ? document.querySelector('.design-viewport')?.getBoundingClientRect() : null;
		const width = rect?.width ?? 800;
		const height = rect?.height ?? 600;
		const zoom = Math.min(4, Math.max(0.15, Math.min((width - 120) / Math.max(1, maxX - minX), (height - 120) / Math.max(1, maxY - minY))));
		this.animateViewport(width / 2 - (minX + maxX) / 2 * zoom, height / 2 - (minY + maxY) / 2 * zoom, zoom, 400);
	}

	setCanvasBackground(value: string) {
		if (value === this.canvasBackground) return;
		this.recordGestureStart();
		this.canvasBackground = value;
		this.commitGesture();
	}

	setViewOption(option: 'snapToGrid' | 'snapToObjects' | 'snapToGuides' | 'pixelGridVisible', value: boolean) {
		if (this[option] === value) return;
		this.recordGestureStart();
		this[option] = value;
		this.commitGesture();
	}

	setConstrainProportions(value: boolean) {
		if (value === this.constrainProportions) return;
		this.recordGestureStart();
		this.constrainProportions = value;
		this.commitGesture();
	}

	selectAll() {
		const parentId = this.selectedIds.length === 1 ? this.items.find((item) => item.id === this.selectedIds[0])?.parentId : undefined;
		this.selectedIds = this.items.filter((item) => !item.hidden && !item.locked && (parentId === undefined || item.parentId === parentId)).map((item) => item.id);
	}

	selectInverse() {
		const selected = new Set(this.selectedIds);
		this.selectedIds = this.items.filter((item) => !item.hidden && !item.locked && !selected.has(item.id)).map((item) => item.id);
	}

	selectSame(kind: 'fill' | 'stroke' | 'type') {
		const source = this.items.find((item) => item.id === this.selectedIds[0]);
		if (!source) return;
		const key = kind === 'fill' ? 'background' : kind === 'stroke' ? 'border' : 'font-family';
		this.selectedIds = this.items.filter((item) => kind === 'type' ? item.type === source.type : item.style[key] === source.style[key]).map((item) => item.id);
	}

	escapeSelection() {
		const current = this.items.find((item) => item.id === this.selectedIds[0]);
		this.selectedIds = current?.parentId ? [current.parentId] : [];
	}

	toggleClip(blockId: string) {
		const block = this.items.find(b => b.id === blockId);
		if (!block) return;
		this.recordGestureStart();
		const currentOverflow = block.style.overflow;
		const nextOverflow = currentOverflow === 'visible' ? 'hidden' : 'visible';
		block.style = {
			...block.style,
			overflow: nextOverflow
		};
		this.commitGesture();
	}

	// --- 5. Context Menu & Clipboard Actions ---
	generateId(): string {
		return Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
	}

	// Mirror the internal clipboard onto the OS clipboard (best-effort) so that
	// a native paste can distinguish our blocks from external markup.
	private writeOsClipboard(json: string) {
		try {
			navigator.clipboard?.writeText(CLIPBOARD_MARKER + json).catch(() => {});
		} catch {
			/* clipboard unavailable; internal clipboard still works */
		}
	}

	onBlockContextMenu(event: MouseEvent, block: DesignBlock) {
		event.preventDefault();
		event.stopPropagation();
		
		// If the block is not in the selection, make it the sole selection
		if (!this.selectedIds.includes(block.id)) {
			this.selectedIds = [block.id];
		}
		
		this.contextMenu = {
			x: event.clientX,
			y: event.clientY,
			blockId: block.id
		};
	}

	getLayerTreeBlockIds(): string[] {
		const list: string[] = [];
		const addNode = (block: DesignBlock) => {
			list.push(block.id);
			if (block.children && block.children.length > 0 && !this.isCollapsed(block.id)) {
				for (const childId of block.children) {
					const child = this.items.find(b => b.id === childId);
					if (child) {
						addNode(child);
					}
				}
			}
		};
		
		// Layer order includes hidden nodes so they can be selected and shown again.
		const roots = this.items.filter(b => b.parentId === null);
		for (const root of roots) {
			addNode(root);
		}
		return list;
	}

	groupSelected(kind: 'group' | 'frame' = 'group') {
		if (this.selectedIds.length === 0) return;

		this.recordGestureStart();

		// Calculate bounding box of all selected blocks in absolute canvas coordinates
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;

		const selectedBlocks = this.items.filter(b => this.selectedIds.includes(b.id));
		if (selectedBlocks.length === 0) {
			this.commitGesture();
			this.closeContextMenu();
			return;
		}

		for (const block of selectedBlocks) {
			const absPos = this.getAbsolutePosition(block);
			minX = Math.min(minX, absPos.x);
			maxX = Math.max(maxX, absPos.x + block.w);
			minY = Math.min(minY, absPos.y);
			maxY = Math.max(maxY, absPos.y + block.h);
		}

		const groupW = maxX - minX;
		const groupH = maxY - minY;

		const groupId = this.generateId();
		
		// Check target parent hierarchy
		const firstParentId = selectedBlocks[0].parentId;
		const allShareParent = selectedBlocks.every(b => b.parentId === firstParentId);
		const targetParentId = allShareParent ? firstParentId : null;

		let groupX = minX;
		let groupY = minY;

		if (targetParentId) {
			const parent = this.items.find(p => p.id === targetParentId);
			if (parent) {
				const parentAbs = this.getAbsolutePosition(parent);
				groupX = minX - parentAbs.x;
				groupY = minY - parentAbs.y;
			}
		}

		const groupBlock: DesignBlock = {
			id: groupId,
			type: 'frame',
			name: kind === 'frame' ? 'Frame' : 'Group',
			x: this.snap(groupX),
			y: this.snap(groupY),
			w: this.snap(groupW),
			h: this.snap(groupH),
			props: {},
			style:
				kind === 'frame'
					? { background: '#ffffff', border: '1px solid #cbd5e1', overflow: 'hidden' }
					: { background: 'transparent', border: '1px dashed var(--border-secondary)', overflow: 'visible' },
			parentId: targetParentId,
			rotation: 0,
			children: []
		};

		this.items = [...this.items, groupBlock];

		if (targetParentId) {
			const parent = this.items.find(p => p.id === targetParentId);
			if (parent) {
				parent.children = [...parent.children, groupId];
			}
		}

		for (const block of selectedBlocks) {
			if (block.parentId) {
				const oldParent = this.items.find(p => p.id === block.parentId);
				if (oldParent) {
					oldParent.children = oldParent.children.filter(cid => cid !== block.id);
				}
			}

			block.parentId = groupId;
			groupBlock.children.push(block.id);

			const blockAbs = this.getAbsolutePosition(block);
			const groupAbs = this.getAbsolutePosition(groupBlock);
			block.x = this.snap(blockAbs.x - groupAbs.x);
			block.y = this.snap(blockAbs.y - groupAbs.y);
		}

		this.selectedIds = [groupId];
		this.commitGesture();
		this.closeContextMenu();
	}

	frameSelected() {
		this.groupSelected('frame');
	}

	copySelected() {
		if (this.selectedIds.length === 0) return;
		
		const allCopied: DesignBlock[] = [];
		for (const blockId of this.selectedIds) {
			allCopied.push(...this.getSubtree(blockId));
		}
		this.clipboard = JSON.stringify(allCopied);
		this.writeOsClipboard(this.clipboard);
		this.closeContextMenu();
	}

	cutSelected() {
		this.copySelected();
		this.deleteSelected();
	}

	deleteSelected() {
		if (this.selectedIds.length === 0) return;
		this.recordGestureStart();
		const idsToDelete = [...this.selectedIds];
		this.selectedIds = [];
		
		for (const blockId of idsToDelete) {
			const getSubtreeIds = (id: string): string[] => {
				const b = this.items.find(x => x.id === id);
				if (!b) return [];
				let ids = [b.id];
				for (const childId of b.children) {
					ids = ids.concat(getSubtreeIds(childId));
				}
				return ids;
			};
			
			const blockToDelete = this.items.find(b => b.id === blockId);
			if (!blockToDelete) continue;
			
			const subIds = getSubtreeIds(blockId);
			
			if (blockToDelete.parentId) {
				const parent = this.items.find(p => p.id === blockToDelete.parentId);
				if (parent) {
					parent.children = parent.children.filter(cid => cid !== blockId);
				}
			}
			
			this.items = this.items.filter(item => !subIds.includes(item.id));
		}
		this.commitGesture();
		this.closeContextMenu();
	}

	copyStyle(blockId: string) {
		const block = this.items.find(b => b.id === blockId);
		if (!block) return;
		this.styleClipboard = { ...block.style };
		this.closeContextMenu();
	}

	pasteStyle(blockId: string) {
		this.closeContextMenu();
		if (!this.styleClipboard) return;
		
		this.recordGestureStart();
		const targetIds = this.selectedIds.includes(blockId) ? this.selectedIds : [blockId];
		for (const id of targetIds) {
			const block = this.items.find(b => b.id === id);
			if (block && !block.locked) {
				block.style = {
					...block.style,
					...this.styleClipboard
				};
			}
		}
		this.commitGesture();
	}

	ungroupSelected() {
		if (this.selectedIds.length === 0) return;
		this.recordGestureStart();
		const groupsToUngroup = this.items.filter(b => this.selectedIds.includes(b.id) && b.children && b.children.length > 0);
		
		if (groupsToUngroup.length === 0) {
			this.commitGesture();
			this.closeContextMenu();
			return;
		}

		const allNewSelectedIds: string[] = [];

		for (const block of groupsToUngroup) {
			const parentId = block.parentId;
			const childrenIds = [...block.children];
			const groupAbs = this.getAbsolutePosition(block);

			let parentAbs = { x: 0, y: 0 };
			if (parentId) {
				const parent = this.items.find(p => p.id === parentId);
				if (parent) {
					parentAbs = this.getAbsolutePosition(parent);
				}
			}

			for (const childId of childrenIds) {
				const child = this.items.find(c => c.id === childId);
				if (child) {
					child.parentId = parentId;
					const childAbsX = groupAbs.x + child.x;
					const childAbsY = groupAbs.y + child.y;
					child.x = this.snap(childAbsX - parentAbs.x);
					child.y = this.snap(childAbsY - parentAbs.y);
					allNewSelectedIds.push(childId);
				}
			}

			if (parentId) {
				const parent = this.items.find(p => p.id === parentId);
				if (parent) {
					parent.children = parent.children.filter(cid => cid !== block.id);
					parent.children = [...parent.children, ...childrenIds];
				}
			}

			this.items = this.items.filter(b => b.id !== block.id);
		}

		this.selectedIds = allNewSelectedIds;
		this.commitGesture();
		this.closeContextMenu();
	}

	alignLeft() {
		if (this.selectedIds.length === 0) return;
		this.recordGestureStart();
		const blocks = this.items.filter(b => this.selectedIds.includes(b.id));

		if (blocks.length === 1) {
			const block = blocks[0];
			block.x = 0;
		} else {
			let minX = Infinity;
			for (const b of blocks) {
				const abs = this.getAbsolutePosition(b);
				minX = Math.min(minX, abs.x);
			}
			for (const b of blocks) {
				const parentAbs = b.parentId ? this.getAbsolutePosition(this.items.find(p => p.id === b.parentId)!) : { x: 0, y: 0 };
				b.x = this.snap(minX - parentAbs.x);
			}
		}
		this.commitGesture();
	}

	alignRight() {
		if (this.selectedIds.length === 0) return;
		this.recordGestureStart();
		const blocks = this.items.filter(b => this.selectedIds.includes(b.id));

		if (blocks.length === 1) {
			const block = blocks[0];
			const parent = block.parentId ? this.items.find(p => p.id === block.parentId) : null;
			block.x = parent ? this.snap(parent.w - block.w) : 0;
		} else {
			let maxX = -Infinity;
			for (const b of blocks) {
				const abs = this.getAbsolutePosition(b);
				maxX = Math.max(maxX, abs.x + b.w);
			}
			for (const b of blocks) {
				const parentAbs = b.parentId ? this.getAbsolutePosition(this.items.find(p => p.id === b.parentId)!) : { x: 0, y: 0 };
				b.x = this.snap(maxX - b.w - parentAbs.x);
			}
		}
		this.commitGesture();
	}

	alignHorizontalCenter() {
		if (this.selectedIds.length === 0) return;
		this.recordGestureStart();
		const blocks = this.items.filter(b => this.selectedIds.includes(b.id));

		if (blocks.length === 1) {
			const block = blocks[0];
			const parent = block.parentId ? this.items.find(p => p.id === block.parentId) : null;
			block.x = parent ? this.snap((parent.w - block.w) / 2) : 0;
		} else {
			let minX = Infinity;
			let maxX = -Infinity;
			for (const b of blocks) {
				const abs = this.getAbsolutePosition(b);
				minX = Math.min(minX, abs.x);
				maxX = Math.max(maxX, abs.x + b.w);
			}
			const centerX = minX + (maxX - minX) / 2;
			for (const b of blocks) {
				const parentAbs = b.parentId ? this.getAbsolutePosition(this.items.find(p => p.id === b.parentId)!) : { x: 0, y: 0 };
				b.x = this.snap(centerX - b.w / 2 - parentAbs.x);
			}
		}
		this.commitGesture();
	}

	alignTop() {
		if (this.selectedIds.length === 0) return;
		this.recordGestureStart();
		const blocks = this.items.filter(b => this.selectedIds.includes(b.id));

		if (blocks.length === 1) {
			const block = blocks[0];
			block.y = 0;
		} else {
			let minY = Infinity;
			for (const b of blocks) {
				const abs = this.getAbsolutePosition(b);
				minY = Math.min(minY, abs.y);
			}
			for (const b of blocks) {
				const parentAbs = b.parentId ? this.getAbsolutePosition(this.items.find(p => p.id === b.parentId)!) : { x: 0, y: 0 };
				b.y = this.snap(minY - parentAbs.y);
			}
		}
		this.commitGesture();
	}

	alignBottom() {
		if (this.selectedIds.length === 0) return;
		this.recordGestureStart();
		const blocks = this.items.filter(b => this.selectedIds.includes(b.id));

		if (blocks.length === 1) {
			const block = blocks[0];
			const parent = block.parentId ? this.items.find(p => p.id === block.parentId) : null;
			block.y = parent ? this.snap(parent.h - block.h) : 0;
		} else {
			let maxY = -Infinity;
			for (const b of blocks) {
				const abs = this.getAbsolutePosition(b);
				maxY = Math.max(maxY, abs.y + b.h);
			}
			for (const b of blocks) {
				const parentAbs = b.parentId ? this.getAbsolutePosition(this.items.find(p => p.id === b.parentId)!) : { x: 0, y: 0 };
				b.y = this.snap(maxY - b.h - parentAbs.y);
			}
		}
		this.commitGesture();
	}

	alignVerticalCenter() {
		if (this.selectedIds.length === 0) return;
		this.recordGestureStart();
		const blocks = this.items.filter(b => this.selectedIds.includes(b.id));

		if (blocks.length === 1) {
			const block = blocks[0];
			const parent = block.parentId ? this.items.find(p => p.id === block.parentId) : null;
			block.y = parent ? this.snap((parent.h - block.h) / 2) : 0;
		} else {
			let minY = Infinity;
			let maxY = -Infinity;
			for (const b of blocks) {
				const abs = this.getAbsolutePosition(b);
				minY = Math.min(minY, abs.y);
				maxY = Math.max(maxY, abs.y + b.h);
			}
			const centerY = minY + (maxY - minY) / 2;
			for (const b of blocks) {
				const parentAbs = b.parentId ? this.getAbsolutePosition(this.items.find(p => p.id === b.parentId)!) : { x: 0, y: 0 };
				b.y = this.snap(centerY - b.h / 2 - parentAbs.y);
			}
		}
		this.commitGesture();
	}

	distributeHorizontally() {
		if (this.selectedIds.length < 3) return;
		this.recordGestureStart();
		const blocks = this.items.filter(b => this.selectedIds.includes(b.id));

		const sorted = blocks.map(b => ({ block: b, absX: this.getAbsolutePosition(b).x }))
							 .sort((a, b) => a.absX - b.absX);

		const totalWidths = sorted.reduce((sum, item) => sum + item.block.w, 0);
		const minX = sorted[0].absX;
		const maxX = sorted[sorted.length - 1].absX + sorted[sorted.length - 1].block.w;

		const totalSpacing = (maxX - minX) - totalWidths;
		const spacing = totalSpacing / (sorted.length - 1);

		let currentX = minX;
		for (let i = 0; i < sorted.length; i++) {
			const item = sorted[i];
			const parentAbs = item.block.parentId ? this.getAbsolutePosition(this.items.find(p => p.id === item.block.parentId)!) : { x: 0, y: 0 };
			item.block.x = this.snap(currentX - parentAbs.x);
			currentX += item.block.w + spacing;
		}
		this.commitGesture();
	}

	distributeVertically() {
		if (this.selectedIds.length < 3) return;
		this.recordGestureStart();
		const blocks = this.items.filter(b => this.selectedIds.includes(b.id));

		const sorted = blocks.map(b => ({ block: b, absY: this.getAbsolutePosition(b).y }))
							 .sort((a, b) => a.absY - b.absY);

		const totalHeights = sorted.reduce((sum, item) => sum + item.block.h, 0);
		const minY = sorted[0].absY;
		const maxY = sorted[sorted.length - 1].absY + sorted[sorted.length - 1].block.h;

		const totalSpacing = (maxY - minY) - totalHeights;
		const spacing = totalSpacing / (sorted.length - 1);

		let currentY = minY;
		for (let i = 0; i < sorted.length; i++) {
			const item = sorted[i];
			const parentAbs = item.block.parentId ? this.getAbsolutePosition(this.items.find(p => p.id === item.block.parentId)!) : { x: 0, y: 0 };
			item.block.y = this.snap(currentY - parentAbs.y);
			currentY += item.block.h + spacing;
		}
		this.commitGesture();
	}

	onRulerPointerDown(event: PointerEvent, type: 'h' | 'v') {
		event.stopPropagation();
		this.cancelAnimation();
		
		const viewport = typeof document !== 'undefined' ? document.querySelector('.design-viewport') : null;
		if (viewport) {
			(viewport as HTMLElement).setPointerCapture(event.pointerId);
		}
		
		this.recordGestureStart();
		const canvasPos = this.screenToCanvas(event.clientX, event.clientY);
		const val = type === 'h' ? canvasPos.y : canvasPos.x;
		const id = this.generateId();
		
		this.userGuides.push({ id, type, value: val });
		this.rulerDrag = {
			id,
			type,
			isNew: true,
			startVal: val
		};
	}

	onGuidePointerDown(event: PointerEvent, guide: { id: string; type: 'h' | 'v'; value: number }) {
		event.stopPropagation();
		this.cancelAnimation();
		
		const viewport = typeof document !== 'undefined' ? document.querySelector('.design-viewport') : null;
		if (viewport) {
			(viewport as HTMLElement).setPointerCapture(event.pointerId);
		}
		
		this.recordGestureStart();
		this.selectedGuideId = guide.id;
		this.selectedIds = [];
		
		this.rulerDrag = {
			id: guide.id,
			type: guide.type,
			isNew: false,
			startVal: guide.value
		};
	}

	deleteGuide(id: string) {
		this.recordGestureStart();
		this.userGuides = this.userGuides.filter(g => g.id !== id);
		if (this.selectedGuideId === id) {
			this.selectedGuideId = null;
		}
		this.commitGesture();
	}

	private camelToDash(str: string): string {
		return str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
	}

	private dashToCamel(str: string): string {
		return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
	}

	updateBlockStyle(blockId: string, property: string, value: string | number) {
		const block = this.items.find(b => b.id === blockId);
		if (!block) return;
		if (property === 'w') {
			block.w = Number(value);
		} else if (property === 'h') {
			block.h = Number(value);
		} else if (property === 'x') {
			block.x = Number(value);
		} else if (property === 'y') {
			block.y = Number(value);
		} else if (property === 'rotation') {
			block.rotation = Number(value);
		} else if (property === 'name') {
			block.name = String(value);
		} else if (property === 'type') {
			const typeStr = String(value);
			if (isBlockType(typeStr)) block.type = typeStr;
		} else if (property === 'text') {
			// Text content lives in `props`, not `style` — write there so the
			// DesignBlock renderer can pick it up.
			block.props = { ...block.props, text: String(value) };
		} else {
			const newStyle = { ...block.style, [property]: value };
			// Remove the alternate key format to avoid duplicate entries
			const alt = property.includes('-') ? this.dashToCamel(property) : this.camelToDash(property);
			if (alt !== property && alt in newStyle) {
				delete newStyle[alt];
			}
			// Clean up empty string values
			for (const k of Object.keys(newStyle)) {
				if (newStyle[k] === '') delete newStyle[k];
			}
			block.style = newStyle;
		}
	}

	updateBlockStyleWithUndo(blockId: string, property: string, value: string | number) {
		this.recordGestureStart();
		this.updateBlockStyle(blockId, property, value);
		this.commitGesture();
	}

	/** Arrow-key nudge: move every (unlocked) selected block by dx/dy px. */
	nudgeSelected(dx: number, dy: number) {
		if (this.selectedIds.length === 0) return;
		this.recordGestureStart();
		for (const id of this.selectedIds) {
			const b = this.items.find((x) => x.id === id);
			if (b && !b.locked) {
				b.x += dx;
				b.y += dy;
			}
		}
		this.commitGesture();
	}

	/** Move a block one step up (forward) or down (backward) among its siblings. */
	private reorderSibling(blockId: string, dir: 1 | -1) {
		const block = this.items.find((b) => b.id === blockId);
		if (!block) return;
		this.recordGestureStart();
		if (block.parentId) {
			const parent = this.items.find((p) => p.id === block.parentId);
			if (parent) {
				const arr = [...parent.children];
				const i = arr.indexOf(blockId);
				const j = i + dir;
				if (i !== -1 && j >= 0 && j < arr.length) {
					[arr[i], arr[j]] = [arr[j], arr[i]];
					parent.children = arr;
				}
			}
		} else {
			const roots = this.items.filter((b) => b.parentId === null);
			const ri = roots.findIndex((b) => b.id === blockId);
			const rj = ri + dir;
			if (ri !== -1 && rj >= 0 && rj < roots.length) {
				const otherId = roots[rj].id;
				const arr = [...this.items];
				const ai = arr.findIndex((b) => b.id === blockId);
				const bi = arr.findIndex((b) => b.id === otherId);
				[arr[ai], arr[bi]] = [arr[bi], arr[ai]];
				this.items = arr;
			}
		}
		this.commitGesture();
	}

	moveForward(blockId: string) {
		this.closeContextMenu();
		this.reorderSibling(blockId, 1);
	}

	moveBackward(blockId: string) {
		this.closeContextMenu();
		this.reorderSibling(blockId, -1);
	}

	onCanvasContextMenu(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.contextMenu = {
			x: event.clientX,
			y: event.clientY,
			blockId: null
		};
	}

	insertBlock(type: 'text' | 'card' | 'frame' | 'container' | 'image' | ShapeType, screenX: number, screenY: number) {
		const point = this.screenToCanvas(screenX, screenY);
		this.createBlockAt(type, point.x, point.y, {
			enterTextEdit: type === 'text'
		});
		this.closeContextMenu();
	}

	/**
	 * Finish a drag-to-draw gesture and create a block from the dragged dimensions.
	 * @param shiftKey Whether Shift is held (constrains to square/circle/straight).
	 */
	commitDrawBlock(shiftKey: boolean) {
		if (!this.drawStartPos || !this.drawCurrentPos || !this.drawTool) return;

		const sx = this.drawStartPos.x;
		const sy = this.drawStartPos.y;
		const ex = this.drawCurrentPos.x;
		const ey = this.drawCurrentPos.y;

		let x0 = Math.min(sx, ex);
		let y0 = Math.min(sy, ey);
		let w = Math.abs(ex - sx);
		let h = Math.abs(ey - sy);

		// Very small drag (< 10px) = click-to-place with default size
		const MIN_DRAG = 10;
		if (w < MIN_DRAG && h < MIN_DRAG) {
			const defaults: Record<string, { w: number; h: number }> = {
				rectangle: { w: 120, h: 80 },
				ellipse: { w: 120, h: 80 },
				line: { w: 120, h: 4 },
				arrow: { w: 120, h: 4 },
				polygon: { w: 100, h: 100 },
				star: { w: 100, h: 100 },
				text: { w: 160, h: 28 },
				frame: { w: 300, h: 300 }
			};
			const def = defaults[this.drawTool] || defaults.rectangle;
			x0 = this.snap(sx);
			y0 = this.snap(sy);
			w = def.w;
			h = def.h;
		}

		// Shift-constrain: rectangle → square, ellipse → circle
		if (shiftKey && (this.drawTool === 'rectangle' || this.drawTool === 'ellipse')) {
			const size = Math.max(w, h);
			w = size;
			h = size;
			// Re-centre the rect so the drawing point stays as anchor
			if (sx < ex) x0 = sx;
			else x0 = sx - size;
			if (sy < ey) y0 = sy;
			else y0 = sy - size;
			if (w < 2) w = 2;
			if (h < 2) h = 2;
		}

		// Shift-constrain: line snaps to 45° increments
		if (shiftKey && this.drawTool === 'line') {
			const dx = ex - sx;
			const dy = ey - sy;
			if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
				w = 2; h = 2;
			} else {
				const len = Math.sqrt(dx * dx + dy * dy);
				const angle = Math.atan2(dy, dx);
				const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
				const ex2 = sx + Math.cos(snapped) * len;
				const ey2 = sy + Math.sin(snapped) * len;
				x0 = Math.min(sx, ex2);
				y0 = Math.min(sy, ey2);
				w = Math.max(Math.abs(ex2 - sx), 2);
				h = Math.max(Math.abs(ey2 - sy), 2);
				// Adjust x0/y0 for the snapped end
				x0 = Math.min(sx, ex2);
				y0 = Math.min(sy, ey2);
			}
		}

		// Minimum size
		if (w < 2) w = 2;
		if (h < 2) h = 2;

		// Style/props by type
		const type = this.drawTool;
		const defaultStyle: Record<string, string> = {};
		const defaultProps: Record<string, unknown> = {};

		if (type === 'frame') {
			defaultStyle.background = '#ffffff';
			defaultStyle.border = '1px solid #cbd5e1';
			defaultStyle.overflow = 'hidden';
		} else if (type === 'text') {
			defaultStyle.padding = '4px';
			defaultProps.text = '';
		} else if (type === 'rectangle') {
			defaultStyle.background = '#e0e7ff';
			defaultStyle.border = '2px solid #6366f1';
		} else if (type === 'ellipse') {
			defaultStyle.background = '#e0e7ff';
			defaultStyle.border = '2px solid #6366f1';
			defaultStyle['border-radius'] = '50%';
		} else if (type === 'line') {
			defaultStyle.color = '#6366f1';
			defaultStyle.stroke = '#6366f1';
		} else if (type === 'arrow') {
			defaultStyle.color = '#6366f1';
			defaultStyle.stroke = '#6366f1';
		} else if (type === 'polygon') {
			defaultStyle.color = '#6366f1';
			defaultStyle.stroke = '#6366f1';
			defaultProps.sides = 6;
		} else if (type === 'star') {
			defaultStyle.color = '#6366f1';
			defaultStyle.stroke = '#6366f1';
			defaultProps.points = 5;
		} else if (type === 'vector') {
			defaultStyle.background = 'none';
			defaultStyle.stroke = '#000000';
			defaultStyle.strokeWidth = '1';
			defaultProps.paths = [];
		}

		const newBlock: DesignBlock = {
			id: this.generateId(),
			type,
			name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
			x: this.snap(x0),
			y: this.snap(y0),
			w: this.snap(w),
			h: this.snap(h),
			props: defaultProps,
			style: defaultStyle,
			parentId: null,
			rotation: 0,
			children: []
		};

		this.items = [...this.items, newBlock];
		this.selectedId = newBlock.id;
		this.selectedIds = [newBlock.id];
		this.commitGesture();

		// For text blocks, auto-enter editing mode.
		if (type === 'text') {
			this.editingTextId = newBlock.id;
		}
	}

	// --- Text editing ---

	startEditingText(blockId: string) {
		this.editingTextId = blockId;
	}

	finishEditingText(blockId: string, newText: string) {
		if (this.editingTextId !== blockId) return;
		this.recordGestureStart();
		const block = this.items.find(b => b.id === blockId);
		if (block) {
			block.props = { ...block.props, text: newText };
		}
		this.editingTextId = null;
		this.commitGesture();
	}

	closeContextMenu() {
		this.contextMenu = null;
	}

	setBlockName(blockId: string, name: string) {
		const block = this.items.find(b => b.id === blockId);
		const trimmed = name.trim();
		if (!block || trimmed === '' || block.name === trimmed) return;
		this.recordGestureStart();
		block.name = trimmed;
		this.commitGesture();
	}

	renameBlock(blockId: string) {
		this.closeContextMenu();
		const block = this.items.find(b => b.id === blockId);
		if (!block) return;

		const newName = prompt('Rename block:', block.name);
		if (newName !== null && newName.trim() !== '') {
			this.recordGestureStart();
			block.name = newName.trim();
			this.commitGesture();
		}
	}

	toggleLock(blockId: string) {
		this.closeContextMenu();
		const block = this.items.find(b => b.id === blockId);
		if (!block) return;

		this.recordGestureStart();
		block.locked = !block.locked;
		this.commitGesture();
	}

	toggleHide(blockId: string) {
		const block = this.items.find(b => b.id === blockId);
		if (!block) return;

		this.recordGestureStart();
		block.hidden = !block.hidden;
		this.commitGesture();
	}

	deleteBlock(blockId: string) {
		this.closeContextMenu();
		this.recordGestureStart();

		// Recursively gather all children IDs in the subtree to delete
		const getSubtreeIds = (id: string): string[] => {
			const b = this.items.find(x => x.id === id);
			if (!b) return [];
			let ids = [b.id];
			for (const childId of b.children) {
				ids = ids.concat(getSubtreeIds(childId));
			}
			return ids;
		};

		const blockToDelete = this.items.find(b => b.id === blockId);
		if (!blockToDelete) return;

		const idsToDelete = getSubtreeIds(blockId);

		// Remove reference from parent's children list
		if (blockToDelete.parentId) {
			const parent = this.items.find(p => p.id === blockToDelete.parentId);
			if (parent) {
				parent.children = parent.children.filter(cid => cid !== blockId);
			}
		}

		// Filter out deleted items
		this.items = this.items.filter(item => !idsToDelete.includes(item.id));
		
		if (idsToDelete.includes(this.selectedId || '')) {
			this.selectedId = null;
		}
		this.selectedIds = this.selectedIds.filter((id) => !idsToDelete.includes(id));

		this.commitGesture();
	}

	private getSubtree(blockId: string): DesignBlock[] {
		const block = this.items.find(b => b.id === blockId);
		if (!block) return [];
		// Deep clone to separate original object references
		const clone = JSON.parse(JSON.stringify(block)) as DesignBlock;
		let result = [clone];
		for (const childId of block.children) {
			result = result.concat(this.getSubtree(childId));
		}
		return result;
	}

	copyBlock(blockId: string) {
		this.closeContextMenu();
		const subtree = this.getSubtree(blockId);
		if (subtree.length === 0) return;
		this.clipboard = JSON.stringify(subtree);
		this.writeOsClipboard(this.clipboard);
	}

	cutBlock(blockId: string) {
		this.copyBlock(blockId);
		this.deleteBlock(blockId);
	}

	pasteBlock(targetParentId: string | null, inPlace = false, duplicateOffset = { x: 24, y: 24 }) {
		const pasteAtMenu = this.contextMenu;
		this.closeContextMenu();
		if (!this.clipboard) return;

		try {
			const subtree = JSON.parse(this.clipboard) as DesignBlock[];
			if (subtree.length === 0) return;

			// Map old IDs to new unique IDs
			const idMap = new Map<string, string>();
			for (const block of subtree) {
				idMap.set(block.id, this.generateId());
			}

			const pastedBlocks: DesignBlock[] = [];
			const pastedRootIds: string[] = [];

			// Remap parentId and children references, and update absolute positions for pasted root
			for (const block of subtree) {
				const oldId = block.id;
				const newId = idMap.get(oldId)!;
				
				block.id = newId;
				block.children = block.children.map(cid => idMap.get(cid)!);

				const isRootOfPaste = !block.parentId || !idMap.has(block.parentId);
				
				if (isRootOfPaste) {
					pastedRootIds.push(newId);
					// Attach to target parent
					block.parentId = targetParentId;
					
					if (pasteAtMenu) {
						const point = this.screenToCanvas(pasteAtMenu.x, pasteAtMenu.y);
						if (targetParentId) {
							const parent = this.items.find(p => p.id === targetParentId);
							if (parent) {
								const parentAbs = this.getAbsolutePosition(parent);
								block.x = this.snap(point.x - parentAbs.x);
								block.y = this.snap(point.y - parentAbs.y);
							}
						} else {
							block.x = this.snap(point.x);
							block.y = this.snap(point.y);
						}
					} else if (!inPlace) {
						// Offset position slightly to distinguish copy from paste
						block.x += duplicateOffset.x;
						block.y += duplicateOffset.y;
					}
				} else {
					block.parentId = idMap.get(block.parentId!)!;
				}

				pastedBlocks.push(block);
			}

			this.recordGestureStart();

			// Append new blocks to items
			this.items = [...this.items, ...pastedBlocks];

			// Wire new root block IDs into target parent's children array
			if (pastedRootIds.length > 0 && targetParentId) {
				const parent = this.items.find(p => p.id === targetParentId);
				if (parent) {
					parent.children = [...parent.children, ...pastedRootIds];
				}
			}
			this.selectedIds = [...pastedRootIds];

			this.commitGesture();
		} catch (e) {
			console.error('Failed to paste block:', e);
		}
	}

	duplicateBlock(blockId: string) {
		const block = this.items.find(b => b.id === blockId);
		if (!block) return;

		const tempClipboard = this.clipboard;
		this.copyBlock(blockId);
		this.pasteBlock(block.parentId);
		this.clipboard = tempClipboard;
	}

	duplicateSelected(offset = this.lastDuplicateOffset) {
		if (this.selectedIds.length === 0) return;
		const selectedRoots = this.selectedIds.filter((id) => {
			const block = this.items.find((b) => b.id === id);
			return !!block && (!block.parentId || !this.selectedIds.includes(block.parentId));
		});
		if (selectedRoots.length === 0) return;
		const rootBlocks = selectedRoots
			.map((id) => this.items.find((b) => b.id === id))
			.filter(Boolean) as DesignBlock[];
		const commonParentId =
			rootBlocks.length > 0 && rootBlocks.every((b) => b.parentId === rootBlocks[0].parentId)
				? rootBlocks[0].parentId
				: null;

		const copied: DesignBlock[] = [];
		for (const id of selectedRoots) {
			copied.push(...this.getSubtree(id));
		}
		const tempClipboard = this.clipboard;
		this.clipboard = JSON.stringify(copied);
		this.contextMenu = null;
		this.pasteBlock(commonParentId, false, offset);
		this.clipboard = tempClipboard;
	}

	pasteInPlace() { this.pasteBlock(null, true); }
	pasteOverSelection() { this.pasteBlock(this.items.find((item) => item.id === this.selectedIds[0])?.parentId ?? null, true); }

	/** Repeats the last duplicate displacement, rather than relying on paste state. */
	repeatDuplicate() {
		this.duplicateSelected(this.lastDuplicateOffset);
	}

	flipSelected(axis: 'horizontal' | 'vertical') {
		if (this.selectedIds.length === 0) return;
		this.recordGestureStart();
		for (const block of this.items) {
			if (!this.selectedIds.includes(block.id) || block.locked) continue;
			const key = axis === 'horizontal' ? '_scaleX' : '_scaleY';
			const current = Number(block.style[key] ?? 1);
			block.style = { ...block.style, [key]: Number.isFinite(current) ? current * -1 : -1 };
		}
		this.commitGesture();
	}

	/** Scale the selection around its collective origin, including visual style metrics. */
	scaleSelected(factor: number, withinGesture = false) {
		if (!Number.isFinite(factor) || factor <= 0 || this.selectedIds.length === 0) return;
		const selected = this.items.filter((block) => this.selectedIds.includes(block.id) && !block.locked);
		if (selected.length === 0) return;
		const originX = Math.min(...selected.map((block) => this.getAbsolutePosition(block).x));
		const originY = Math.min(...selected.map((block) => this.getAbsolutePosition(block).y));
		if (!withinGesture) this.recordGestureStart();
		for (const block of selected) {
			const absolute = this.getAbsolutePosition(block);
			const parent = block.parentId ? this.items.find((item) => item.id === block.parentId) : null;
			const parentAbsolute = parent ? this.getAbsolutePosition(parent) : { x: 0, y: 0 };
			block.x = Math.round(originX + (absolute.x - originX) * factor - parentAbsolute.x);
			block.y = Math.round(originY + (absolute.y - originY) * factor - parentAbsolute.y);
			block.w = Math.max(1, Math.round(block.w * factor));
			block.h = Math.max(1, Math.round(block.h * factor));
			const style = { ...block.style };
			for (const key of ['font-size', 'border-width', 'border-radius', 'padding', 'letter-spacing', 'line-height']) {
				const value = style[key];
				if (typeof value === 'number') style[key] = value * factor;
				else if (typeof value === 'string') {
					const match = value.match(/^(-?[\d.]+)(px)?$/);
					if (match) style[key] = `${Number(match[1]) * factor}${match[2] ?? ''}`;
				}
			}
			const strokes = readStrokes(style).map((stroke) => ({ ...stroke, weight: stroke.weight * factor, dashPattern: stroke.dashPattern.map((value) => value * factor) }));
			writeStrokes(style, strokes);
			const corners = readCorners(style);
			writeCorners(style, { ...corners, topLeft: corners.topLeft * factor, topRight: corners.topRight * factor, bottomRight: corners.bottomRight * factor, bottomLeft: corners.bottomLeft * factor });
			const effects = readEffects(style).map((effect) => effect.type === 'drop-shadow' || effect.type === 'inner-shadow'
				? { ...effect, offsetX: effect.offsetX * factor, offsetY: effect.offsetY * factor, radius: effect.radius * factor, spread: effect.spread * factor }
				: { ...effect, blur: effect.blur * factor });
			writeEffects(style, effects);
			block.style = style;
		}
		if (!withinGesture) this.commitGesture();
	}

	/** Equalize selected siblings while retaining the first and last positions. */
	tidyUp(axis: 'horizontal' | 'vertical') {
		const selected = this.items.filter((block) => this.selectedIds.includes(block.id) && !block.locked);
		if (selected.length < 3) return;
		const sorted = [...selected].sort((a, b) => axis === 'horizontal' ? this.getAbsolutePosition(a).x - this.getAbsolutePosition(b).x : this.getAbsolutePosition(a).y - this.getAbsolutePosition(b).y);
		const first = sorted[0];
		const last = sorted[sorted.length - 1];
		const start = axis === 'horizontal' ? this.getAbsolutePosition(first).x : this.getAbsolutePosition(first).y;
		const end = axis === 'horizontal' ? this.getAbsolutePosition(last).x + last.w : this.getAbsolutePosition(last).y + last.h;
		const size = sorted.reduce((total, block) => total + (axis === 'horizontal' ? block.w : block.h), 0);
		const gap = (end - start - size) / (sorted.length - 1);
		let cursor = start;
		this.recordGestureStart();
		for (const block of sorted) {
			const parent = block.parentId ? this.items.find((item) => item.id === block.parentId) : null;
			const parentAbsolute = parent ? this.getAbsolutePosition(parent) : { x: 0, y: 0 };
			if (axis === 'horizontal') block.x = Math.round(cursor - parentAbsolute.x);
			else block.y = Math.round(cursor - parentAbsolute.y);
			cursor += (axis === 'horizontal' ? block.w : block.h) + gap;
		}
		this.commitGesture();
	}

	enterDeepSelect(containerId: string) {
		const container = this.items.find((block) => block.id === containerId);
		if (!container || container.children.length === 0) return;
		this.deepSelectParentId = container.id;
		this.selectedIds = [container.id];
	}

	exitDeepSelect() {
		const current = this.deepSelectParentId ? this.items.find((block) => block.id === this.deepSelectParentId) : null;
		this.deepSelectParentId = current?.parentId ?? null;
		this.selectedIds = current ? [current.id] : [];
	}

	get deepSelectBreadcrumb(): DesignBlock[] {
		const result: DesignBlock[] = [];
		let current = this.deepSelectParentId ? this.items.find((block) => block.id === this.deepSelectParentId) : null;
		while (current) {
			result.unshift(current);
			current = current.parentId ? this.items.find((block) => block.id === current?.parentId) ?? null : null;
		}
		return result;
	}

	// --- Import / clipboard-driven creation ---
	private viewportCenterCanvas() {
		const el = typeof document !== 'undefined' ? document.querySelector('.design-viewport') : null;
		const rect = el ? el.getBoundingClientRect() : ({ left: 0, top: 0, width: 800, height: 600 } as DOMRect);
		return this.screenToCanvas(rect.left + rect.width / 2, rect.top + rect.height / 2);
	}

	/** Parse a chunk of HTML/CSS into blocks and drop them onto the canvas. */
	importFromHtml(html: string, screenX?: number, screenY?: number) {
		const { blocks, rootIds } = htmlToBlocks(html, () => this.generateId());
		if (blocks.length === 0) return;

		const target = screenX != null && screenY != null ? this.screenToCanvas(screenX, screenY) : this.viewportCenterCanvas();
		const roots = blocks.filter((b) => rootIds.includes(b.id));
		let minX = Infinity;
		let minY = Infinity;
		for (const r of roots) {
			minX = Math.min(minX, r.x);
			minY = Math.min(minY, r.y);
		}
		const offX = target.x - (Number.isFinite(minX) ? minX : 0);
		const offY = target.y - (Number.isFinite(minY) ? minY : 0);
		for (const r of roots) {
			r.x = this.snap(r.x + offX);
			r.y = this.snap(r.y + offY);
		}

		this.recordGestureStart();
		this.items = [...this.items, ...blocks];
		this.selectedIds = [...rootIds];
		this.commitGesture();
	}

	/** Insert an image block from a data URL (used by clipboard image paste). */
	insertImageFromDataUrl(dataUrl: string, naturalW: number, naturalH: number, screenX?: number, screenY?: number) {
		let w = naturalW || 240;
		let h = naturalH || 160;
		const cap = 600;
		if (w > cap) {
			h = Math.round((h * cap) / w);
			w = cap;
		}
		const target = screenX != null && screenY != null ? this.screenToCanvas(screenX, screenY) : this.viewportCenterCanvas();
		const block: DesignBlock = {
			id: this.generateId(),
			type: 'image',
			name: 'Pasted Image',
			x: this.snap(target.x - w / 2),
			y: this.snap(target.y - h / 2),
			w: this.snap(w),
			h: this.snap(h),
			rotation: 0,
			props: { src: dataUrl },
			style: {},
			parentId: null,
			children: []
		};
		this.recordGestureStart();
		this.items = [...this.items, block];
		this.selectedId = block.id;
		this.commitGesture();
	}

	// --- Vector (SVG) editing ----------------------------------------------------
	//
	// Phase 5: when a vector block is being edited, anchors + bezier handles are
	// rendered as overlays. The pen tool's transient in-progress path lives in
	// +page.svelte as component state, but committed mutations go through these
	// methods so undo/redo keeps working.

	/** Block id currently being edited in the anchor/handle mode, if any. */
	vectorEditBlockId = $state<string | null>(null);

	/** Enter or exit anchor/handle edit mode for a vector block. */
	setVectorEditTarget(blockId: string | null) {
		this.vectorEditBlockId = blockId;
	}

	/** Drop the path the pen tool was drawing and commit it onto a block. */
	commitPenPath(blockId: string, path: VectorPath) {
		const block = this.items.find((b) => b.id === blockId);
		if (!block) return;
		const paths = (block.props.paths as VectorPath[] | undefined) ?? [];
		block.props = { ...block.props, paths: [...paths, path] };
	}

	/** Parse an SVG string and create one or more vector blocks at the given
	 *  viewport position. Supports <path d>, <rect>, <circle>, <ellipse>,
	 *  <polygon>, <polyline>, <line>. Other elements are ignored. Accepts
	 *  both full <svg> documents and bare fragment markup (the parser may
	 *  receive plain `<path d="..."/>` from a clipboard, for example). */
	importSvg(svgString: string, screenX?: number, screenY?: number) {
		if (typeof window === 'undefined') return;
		const parser = new DOMParser();
		// Try SVG first; fall back to HTML for cases where the clipboard
		// wraps the SVG in `<html><body>...<svg>...</svg></body></html>`.
		let doc: Document = parser.parseFromString(svgString, 'image/svg+xml');
		const parserError = doc.querySelector('parsererror');
		if (parserError || !doc.querySelector('svg, path, rect, circle, ellipse, polygon, polyline, line')) {
			doc = parser.parseFromString(svgString, 'text/html');
		}

		// Walk every shape element and turn it into a VectorPath. We accept
		// shapes even outside a top-level <svg> wrapper because pasted markup
		// sometimes arrives as a fragment.
		const shapeEls = Array.from(doc.querySelectorAll('path, rect, circle, ellipse, polygon, polyline, line'));
		if (shapeEls.length === 0) return;

		// Resolve fill/stroke by walking up from each element so we honour
		// inheritance (a common case is `<svg fill="red"><path .../></svg>`).
		const resolveAttr = (el: Element, name: string): string => {
			let cur: Element | null = el;
			while (cur) {
				const v = cur.getAttribute(name);
				if (v != null) return v;
				cur = cur.parentElement;
			}
			return '';
		};

		const paths: VectorPath[] = [];
		let firstFill = '';
		let firstStroke = '';
		let firstStrokeWidth = 1;
		for (const el of shapeEls) {
			const tag = el.tagName.toLowerCase();
			const fill = resolveAttr(el, 'fill');
			const stroke = resolveAttr(el, 'stroke');
			const strokeWidthAttr = resolveAttr(el, 'stroke-width');
			const strokeWidth = parseFloat(strokeWidthAttr) || 1;
			if (!firstFill && fill && fill !== 'none') firstFill = fill;
			if (!firstStroke && stroke && stroke !== 'none') firstStroke = stroke;
			if (firstStrokeWidth === 1 && strokeWidth) firstStrokeWidth = strokeWidth;

			let d = '';
			if (tag === 'path') {
				d = el.getAttribute('d') ?? '';
			} else {
				d = primitiveToPathD(el);
			}
			const subPaths = dToPaths(d);
			paths.push(...subPaths);
		}
		if (paths.length === 0) return;

		// Compute the bbox of all points so the block fits the imported shape.
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const p of paths) {
			for (const pt of p.points) {
				if (pt.x < minX) minX = pt.x;
				if (pt.y < minY) minY = pt.y;
				if (pt.x > maxX) maxX = pt.x;
				if (pt.y > maxY) maxY = pt.y;
			}
		}
		const padding = 4;
		const w = Math.max(20, Math.round(maxX - minX + padding * 2));
		const h = Math.max(20, Math.round(maxY - minY + padding * 2));
		// Translate points so minX/minY is at (padding, padding).
		const offsetX = padding - minX;
		const offsetY = padding - minY;
		for (const p of paths) {
			for (const pt of p.points) {
				pt.x = Math.round(pt.x + offsetX);
				pt.y = Math.round(pt.y + offsetY);
				if (pt.handleInX !== undefined) pt.handleInX = Math.round(pt.handleInX);
				if (pt.handleInY !== undefined) pt.handleInY = Math.round(pt.handleInY);
				if (pt.handleOutX !== undefined) pt.handleOutX = Math.round(pt.handleOutX);
				if (pt.handleOutY !== undefined) pt.handleOutY = Math.round(pt.handleOutY);
			}
		}

		const target = screenX != null && screenY != null ? this.screenToCanvas(screenX, screenY) : this.viewportCenterCanvas();
		const block: DesignBlock = {
			id: this.generateId(),
			type: 'vector',
			name: 'Imported SVG',
			x: this.snap(target.x - w / 2),
			y: this.snap(target.y - h / 2),
			w: this.snap(w),
			h: this.snap(h),
			rotation: 0,
			props: { paths },
			style: {
				background: firstFill && firstFill !== 'none' ? firstFill : 'none',
				stroke: firstStroke || '#000000',
				strokeWidth: String(firstStrokeWidth)
			},
			parentId: null,
			children: []
		};
		this.recordGestureStart();
		this.items = [...this.items, block];
		this.selectedId = block.id;
		this.commitGesture();
	}

	/** Used by the inspector to recompute the block's w/h to fit the current
	 *  path extents — runs whenever an anchor/handle drag could push points
	 *  outside the original bounding box. */
	fitVectorToPaths(blockId: string) {
		const block = this.items.find((b) => b.id === blockId);
		if (!block || block.type !== 'vector') return;
		const paths = (block.props.paths as VectorPath[] | undefined) ?? [];
		if (paths.length === 0) return;
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const p of paths) {
			for (const pt of p.points) {
				if (pt.x < minX) minX = pt.x;
				if (pt.y < minY) minY = pt.y;
				if (pt.x > maxX) maxX = pt.x;
				if (pt.y > maxY) maxY = pt.y;
			}
		}
		const padding = 4;
		const w = Math.max(20, Math.round(maxX - minX + padding * 2));
		const h = Math.max(20, Math.round(maxY - minY + padding * 2));
		const offsetX = padding - minX;
		const offsetY = padding - minY;
		for (const p of paths) {
			for (const pt of p.points) {
				pt.x = Math.round(pt.x + offsetX);
				pt.y = Math.round(pt.y + offsetY);
				if (pt.handleInX !== undefined) pt.handleInX = Math.round(pt.handleInX);
				if (pt.handleInY !== undefined) pt.handleInY = Math.round(pt.handleInY);
				if (pt.handleOutX !== undefined) pt.handleOutX = Math.round(pt.handleOutX);
				if (pt.handleOutY !== undefined) pt.handleOutY = Math.round(pt.handleOutY);
			}
		}
		block.x = this.snap(block.x + minX - padding);
		block.y = this.snap(block.y + minY - padding);
		block.w = this.snap(w);
		block.h = this.snap(h);
		block.props = { ...block.props, paths: paths.map((p) => ({ ...p, points: p.points.slice() })) };
	}

	/** Helper for the inspector — read the current stroke width as a number
	 *  (defaults to 1 when missing). */
	getVectorStrokeWidth(block: DesignBlock): number {
		const v = Number(block.style.strokeWidth ?? 1);
		return Number.isFinite(v) && v > 0 ? v : 1;
	}

	// --- Measurement HUD ---
	updateMeasurement(clientX: number, clientY: number) {
		if (!this.selectedId || this.drag || this.resize || this.pan) {
			this.measure = null;
			return;
		}
		const point = this.screenToCanvas(clientX, clientY);
		const sel = this.items.filter((b) => this.selectedIds.includes(b.id));
		if (sel.length === 0) {
			this.measure = null;
			return;
		}

		let sL = Infinity, sT = Infinity, sR = -Infinity, sB = -Infinity;
		for (const b of sel) {
			const a = this.getAbsolutePosition(b);
			sL = Math.min(sL, a.x);
			sT = Math.min(sT, a.y);
			sR = Math.max(sR, a.x + b.w);
			sB = Math.max(sB, a.y + b.h);
		}

		const hover = [...this.items].reverse().find((b) => {
			if (b.hidden || this.selectedIds.includes(b.id)) return false;
			const a = this.getAbsolutePosition(b);
			return point.x >= a.x && point.x <= a.x + b.w && point.y >= a.y && point.y <= a.y + b.h;
		});
		if (!hover) {
			this.measure = null;
			return;
		}

		const a = this.getAbsolutePosition(hover);
		const O = { left: a.x, top: a.y, right: a.x + hover.w, bottom: a.y + hover.h };
		const segments: { x1: number; y1: number; x2: number; y2: number; label: string }[] = [];

		// Horizontal gap, drawn at the vertical overlap midpoint.
		const yOT = Math.max(sT, O.top);
		const yOB = Math.min(sB, O.bottom);
		const y = yOT <= yOB ? (yOT + yOB) / 2 : (sT + sB) / 2;
		if (O.left >= sR) segments.push({ x1: sR, y1: y, x2: O.left, y2: y, label: String(Math.round(O.left - sR)) });
		else if (O.right <= sL) segments.push({ x1: O.right, y1: y, x2: sL, y2: y, label: String(Math.round(sL - O.right)) });

		// Vertical gap, drawn at the horizontal overlap midpoint.
		const xOL = Math.max(sL, O.left);
		const xOR = Math.min(sR, O.right);
		const x = xOL <= xOR ? (xOL + xOR) / 2 : (sL + sR) / 2;
		if (O.top >= sB) segments.push({ x1: x, y1: sB, x2: x, y2: O.top, label: String(Math.round(O.top - sB)) });
		else if (O.bottom <= sT) segments.push({ x1: x, y1: O.bottom, x2: x, y2: sT, label: String(Math.round(sT - O.bottom)) });

		this.measure = segments.length > 0 ? { segments } : null;
	}

	clearMeasurement() {
		this.measure = null;
	}

	// --- Reparenting Helpers ---
	isDescendantOf(blockId: string, potentialAncestorId: string): boolean {
		const block = this.items.find(b => b.id === blockId);
		if (!block || !block.parentId) return false;
		if (block.parentId === potentialAncestorId) return true;
		return this.isDescendantOf(block.parentId, potentialAncestorId);
	}

	findTargetParentAt(clientX: number, clientY: number, dragId: string): DesignBlock | null {
		const point = this.screenToCanvas(clientX, clientY);
		
		const candidates = this.items.filter(block => {
			if (block.id === dragId) return false;
			if (block.type !== 'frame' && block.type !== 'container') return false;
			if (this.isDescendantOf(block.id, dragId)) return false;
			return true;
		});

		let bestTarget: DesignBlock | null = null;
		let bestDepth = -1;

		for (const candidate of candidates) {
			const absPos = this.getAbsolutePosition(candidate);
			const inside = point.x >= absPos.x && 
						   point.x <= absPos.x + candidate.w && 
						   point.y >= absPos.y && 
						   point.y <= absPos.y + candidate.h;
						   
			if (inside) {
				let depth = 0;
				let current = candidate;
				while (current.parentId) {
					const parent = this.items.find(p => p.id === current.parentId);
					if (!parent) break;
					depth++;
					current = parent;
				}
				if (depth > bestDepth) {
					bestDepth = depth;
					bestTarget = candidate;
				}
			}
		}

		return bestTarget;
	}

	reparentBlock(blockId: string, targetParentId: string | null) {
		const block = this.items.find(b => b.id === blockId);
		if (!block || block.parentId === targetParentId) return;

		// 1. Get original absolute coordinates before changing tree links
		const origAbs = this.getAbsolutePosition(block);

		// 2. Remove block ID from previous parent's children list
		if (block.parentId) {
			const oldParent = this.items.find(p => p.id === block.parentId);
			if (oldParent) {
				oldParent.children = oldParent.children.filter(cid => cid !== blockId);
			}
		}

		// 3. Update the block's parentId
		block.parentId = targetParentId;

		// 4. Calculate new local coordinates to keep screen position identical
		if (targetParentId) {
			const newParent = this.items.find(p => p.id === targetParentId);
			if (newParent) {
				const newParentAbs = this.getAbsolutePosition(newParent);
				block.x = this.snap(origAbs.x - newParentAbs.x);
				block.y = this.snap(origAbs.y - newParentAbs.y);
				// Add to new parent's children list
				newParent.children = [...newParent.children, blockId];
			}
		} else {
			// Paste back to root level (absolute matches local)
			block.x = this.snap(origAbs.x);
			block.y = this.snap(origAbs.y);
		}
	}

	// --- 6. Layer Arrangement ---
	bringToFront(blockId: string) {
		this.closeContextMenu();
		const index = this.items.findIndex(b => b.id === blockId);
		if (index === -1) return;

		this.recordGestureStart();
		const block = this.items[index];
		const updated = this.items.filter(b => b.id !== blockId);
		updated.push(block); // Move to the end of the array (render last/top)
		this.items = updated;
		this.commitGesture();
	}

	sendToBack(blockId: string) {
		this.closeContextMenu();
		const index = this.items.findIndex(b => b.id === blockId);
		if (index === -1) return;

		this.recordGestureStart();
		const block = this.items[index];
		const updated = this.items.filter(b => b.id !== blockId);
		updated.unshift(block); // Move to index 0 (render first/bottom)
		this.items = updated;
		this.commitGesture();
	}

	history = new UndoHistory<string>({
		capture: () => this.getSnapshot(),
		restore: (s) => this.restoreSnapshot(s),
		capacity: 100,
		equals: (a, b) => a === b,
	});

	// --- AI annotations (designer notes pinned to a block, queued for the AI agent) ---

	addNodeAnnotation(blockId: string, prompt: string): string | null {
		const block = this.items.find((b) => b.id === blockId);
		if (!block || !prompt.trim()) return null;
		this.recordGestureStart();
		const annotation: UIAnnotation = {
			id: this.generateId(),
			prompt: prompt.trim(),
			status: 'draft',
			createdAt: Date.now()
		};
		block.annotations = [...(block.annotations ?? []), annotation];
		this.commitGesture();
		return annotation.id;
	}

	setAnnotationStatus(blockId: string, annotationId: string, status: UIAnnotation['status']) {
		const block = this.items.find((b) => b.id === blockId);
		const annotation = block?.annotations?.find((a) => a.id === annotationId);
		if (!annotation || annotation.status === status) return;
		this.recordGestureStart();
		annotation.status = status;
		this.commitGesture();
	}

	removeAnnotation(blockId: string, annotationId: string) {
		const block = this.items.find((b) => b.id === blockId);
		if (!block?.annotations) return;
		this.recordGestureStart();
		block.annotations = block.annotations.filter((a) => a.id !== annotationId);
		this.commitGesture();
	}

	/** All unresolved annotations across the scene, in the shape the AI agent
	 *  prompt expects (see docs/tinykit-integration-spec.md). */
	getPendingAnnotations(): { nodeId: string; tag: string; class?: string; prompt: string }[] {
		const out: { nodeId: string; tag: string; class?: string; prompt: string }[] = [];
		for (const block of this.items) {
			for (const annotation of block.annotations ?? []) {
				if (annotation.status === 'draft') {
					out.push({
						nodeId: block.id,
						tag: block.type,
						class: block.name,
						prompt: annotation.prompt
					});
				}
			}
		}
		return out;
	}

	private getSnapshot(): string {
		return JSON.stringify({
			schemaVersion: CanvasState.SCHEMA_VERSION,
			items: this.items,
			userGuides: this.userGuides,
			userComponents: this.userComponents,
			viewport: this.viewport,
			snapToGrid: this.snapToGrid,
			snapToObjects: this.snapToObjects,
			snapToGuides: this.snapToGuides,
			pixelGridVisible: this.pixelGridVisible,
			canvasBackground: this.canvasBackground,
			constrainProportions: this.constrainProportions
		});
	}

	private restoreSnapshot(snapshot: string) {
		try {
			const data = JSON.parse(snapshot);
			if (data && typeof data === 'object' && 'items' in data) {
				this.items = data.items;
				this.userGuides = data.userGuides || [];
				if (Array.isArray(data.userComponents)) this.userComponents = data.userComponents;
				this.viewport = sanitizeViewport(data.viewport) ?? this.viewport;
				this.snapToGrid = data.snapToGrid === true;
				this.snapToObjects = data.snapToObjects !== false;
				this.snapToGuides = data.snapToGuides !== false;
				this.pixelGridVisible = data.pixelGridVisible !== false;
				if (typeof data.canvasBackground === 'string') this.canvasBackground = data.canvasBackground;
				this.constrainProportions = data.constrainProportions === true;
			} else {
				this.items = data;
				this.userGuides = [];
			}
			this.sceneRevision += 1;
		} catch (e) {
			console.error('Failed to restore snapshot:', e);
		}
	}

	recordGestureStart() {
		this.history.beginGesture();
	}

	commitGesture() {
		this.history.endGesture();
		this.sceneRevision += 1;
	}

	undo() {
		this.history.undo();
		this.selectedId = null; // Clear selection to avoid offset mismatches
	}

	redo() {
		this.history.redo();
		this.selectedId = null;
	}

	get canUndo(): boolean {
		return this.history.canUndo;
	}
	get canRedo(): boolean {
		return this.history.canRedo;
	}
	get nextUndoOrder(): number { return this.history.nextUndoOrder; }
	get nextRedoOrder(): number { return this.history.nextRedoOrder; }

	// -------------------------------------------------------------------------
	// Lane A additions (Phase 2 + Phase 3).
	// Conflict Register rule: append new methods below this marker, never
	// edit existing ones. Lane C will bind its tool executors to
	// `createBlockAt` and `insertTemplate` in T6.2/T6.3.
	// -------------------------------------------------------------------------

	/** Drop-to-create entry point used by the canvas viewport's drop handler
	 *  (T2.2). Coordinates are in canvas space (post-zoom/pan) — the
	 *  viewport drop handler converts from screen coordinates via
	 *  `screenToCanvas` first, so this method can stay zoom/pan-agnostic.
	 *
	 *  The block is snapped to the grid when snapping is on, reparented into
	 *  any frame/container under the drop point via `findTargetParentAt`,
	 *  and the whole insert is one undo step (single gesture). */
	createBlockAt(
		type: 'text' | 'card' | 'frame' | 'container' | 'image' | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'polygon' | 'star' | 'vector',
		canvasX: number,
		canvasY: number,
		options: {
			parentId?: string | null;
			noSelect?: boolean;
			w?: number;
			h?: number;
			name?: string;
			props?: Record<string, unknown>;
			style?: Record<string, string | number>;
			enterTextEdit?: boolean;
		} = {}
	): DesignBlock | null {
		const def = blockDefaultsFor(type);
		if (!def) return null;

		// Pick a reasonable size if the type defaults are too small to be
		// useful as a freshly-dropped primitive.
		const w = options.w ?? def.w;
		const h = options.h ?? def.h;

		// If a parent container is given, store coordinates relative to the
		// parent's origin; otherwise store absolute canvas coordinates.
		let parentId: string | null = options.parentId ?? null;
		let localX = this.snap(canvasX);
		let localY = this.snap(canvasY);

		// Auto-parent: if the drop point falls inside a frame/container AND
		// no parent was explicitly passed, nest into the deepest one. This
		// matches Figma's "drop into a frame" behavior and keeps templates
		// composed cleanly.
		if (parentId == null) {
			const auto = this.findTargetParentAtCanvas(canvasX, canvasY);
			if (auto) parentId = auto.id;
		}

		if (parentId) {
			const parent = this.items.find((b) => b.id === parentId);
			if (parent) {
				const abs = this.getAbsolutePosition(parent);
				localX = this.snap(canvasX - abs.x);
				localY = this.snap(canvasY - abs.y);
				// Clamp the block to live inside the parent (with a small
				// margin) so dropping near an edge doesn't push it out of
				// bounds.
				localX = Math.max(0, Math.min(parent.w - w, localX));
				localY = Math.max(0, Math.min(parent.h - h, localY));
			}
		}

		const newBlock: DesignBlock = {
			id: this.generateId(),
			type,
			name: options.name ?? def.name,
			x: localX,
			y: localY,
			w,
			h,
			props: { ...def.props, ...(options.props ?? {}) },
			style: { ...def.style, ...(options.style ?? {}) },
			parentId,
			rotation: 0,
			children: []
		};

		this.recordGestureStart();
		this.items = [...this.items, newBlock];
		if (parentId) {
			const parent = this.items.find((b) => b.id === parentId);
			if (parent) parent.children = [...parent.children, newBlock.id];
		}
		if (!options.noSelect) {
			this.selectedId = newBlock.id;
			this.selectedIds = [newBlock.id];
		}
		if (type === 'text' && options.enterTextEdit) {
			this.editingTextId = newBlock.id;
		}
		this.commitGesture();
		return newBlock;
	}

	/** Screen-space variant of `createBlockAt`. Translates screen → canvas
	 *  using the live viewport transform and forwards to the canonical
	 *  canvas-space method. */
	createBlockAtScreen(
		type: 'text' | 'card' | 'frame' | 'container' | 'image' | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'polygon' | 'star' | 'vector',
		screenX: number,
		screenY: number
	): DesignBlock | null {
		const p = this.screenToCanvas(screenX, screenY);
		return this.createBlockAt(type, p.x, p.y);
	}

	/** Insert a pre-built template subtree (T3.2). Clones `blocks` with fresh
	 *  ids, offsets the whole subtree so its visual centre lands at the
	 *  current viewport centre, reparents the roots to null (i.e. attaches
	 *  to the canvas root), and selects the new root. Auto-nesting into an
	 *  existing frame/container at the drop point is supported via the
	 *  `parentId` option. Wrapped in a single gesture → single undo step. */
	insertTemplate(
		blocks: DesignBlock[],
		options: { parentId?: string | null; target?: { x: number; y: number } } = {}
	): DesignBlock[] {
		if (blocks.length === 0) return [];

		// 1. Map old ids → fresh ids (collision-free across re-inserts).
		const idMap = new Map<string, string>();
		for (const b of blocks) idMap.set(b.id, this.generateId());

		// 2. Compute the centroid of the roots so we can offset the whole
		//    subtree to land near the viewport centre.
		const roots = blocks.filter((b) => !b.parentId || !idMap.has(b.parentId));
		const cloned: DesignBlock[] = blocks.map((b) => {
			const newId = idMap.get(b.id)!;
			const newParentId =
				b.parentId && idMap.has(b.parentId) ? idMap.get(b.parentId)! : null;
			const newChildren = b.children.map((cid) => idMap.get(cid) ?? cid);
			return {
				...b,
				id: newId,
				parentId: newParentId,
				children: newChildren
			};
		});

		// 3. Compute bbox of roots in absolute coords (parents are kept
		//    relative, but for offsetting we treat the root positions as
		//    absolute since templates are authored at the root level).
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const r of roots) {
			minX = Math.min(minX, r.x);
			minY = Math.min(minY, r.y);
			maxX = Math.max(maxX, r.x + r.w);
			maxY = Math.max(maxY, r.y + r.h);
		}
		if (!Number.isFinite(minX)) {
			minX = minY = 0;
			maxX = 200; maxY = 200;
		}

		// 4. Resolve target location. Explicit parentId wins; otherwise
		//    viewport centre; otherwise (0,0).
		let targetParentId: string | null = options.parentId ?? null;
		let targetAbs: { x: number; y: number };
		const el = typeof document !== 'undefined' ? document.querySelector('.design-viewport') : null;
		if (options.target) {
			targetAbs = options.target;
		} else if (el) {
			const r = el.getBoundingClientRect();
			targetAbs = this.screenToCanvas(r.left + r.width / 2, r.top + r.height / 2);
		} else {
			targetAbs = { x: 0, y: 0 };
		}

		const subCentreX = minX + (maxX - minX) / 2;
		const subCentreY = minY + (maxY - minY) / 2;
		const dx = this.snap(targetAbs.x - subCentreX);
		const dy = this.snap(targetAbs.y - subCentreY);

		// 5. If a parent was specified, translate the whole subtree into the
		//    parent's coordinate space.
		let parentAbs = { x: 0, y: 0 };
		if (targetParentId) {
			const p = this.items.find((b) => b.id === targetParentId);
			if (p) parentAbs = this.getAbsolutePosition(p);
		}

		for (const b of cloned) {
			b.x = this.snap(b.x + dx - parentAbs.x);
			b.y = this.snap(b.y + dy - parentAbs.y);
			// Roots adopt the target parent; nested children keep their
			// template-relative parent links (already remapped above).
			if (!b.parentId) b.parentId = targetParentId;
		}

		// 6. Wire roots into the target parent's children list (if any).
		this.recordGestureStart();
		this.items = [...this.items, ...cloned];
		if (targetParentId) {
			const parent = this.items.find((b) => b.id === targetParentId);
			if (parent) {
				const rootIds = cloned.filter((b) => b.parentId === targetParentId).map((b) => b.id);
				parent.children = [...parent.children, ...rootIds];
			}
		}

		// 7. Select the topmost roots so the user sees what was inserted.
		const topRoots = cloned.filter((b) => !b.parentId || b.parentId === targetParentId);
		if (topRoots.length > 0) this.selectedIds = topRoots.map((b) => b.id);
		this.commitGesture();
		return cloned;
	}

	/** Canvas-space variant of `findTargetParentAt` (used by `createBlockAt`).
	 *  The original `findTargetParentAt` lives in screen space because the
	 *  drag handler operates on `clientX/clientY`. Drop-to-create already
	 *  has canvas-space coordinates, so this avoids a redundant
	 *  screen→canvas roundtrip. */
	private findTargetParentAtCanvas(canvasX: number, canvasY: number): DesignBlock | null {
		const candidates = this.items.filter((b) => {
			if (b.type !== 'frame' && b.type !== 'container') return false;
			const abs = this.getAbsolutePosition(b);
			return (
				canvasX >= abs.x &&
				canvasX <= abs.x + b.w &&
				canvasY >= abs.y &&
				canvasY <= abs.y + b.h
			);
		});
		let best: DesignBlock | null = null;
		let bestDepth = -1;
		for (const c of candidates) {
			let depth = 0;
			let cur: DesignBlock | undefined = c;
			while (cur && cur.parentId) {
				const p = this.items.find((b) => b.id === cur!.parentId);
				if (!p) break;
				depth++;
				cur = p;
			}
			if (depth > bestDepth) {
				bestDepth = depth;
				best = c;
			}
		}
		return best;
	}

	// ── User-saved Component Library ────────────────────────────────────────
	// CRUD over the user's reusable component subtrees. Stored on
	// `this.userComponents`, persisted via the `setupUserComponentsPersistence`
	// $effect. Insertion reuses `insertTemplate` so behaviour matches the
	// built-in templates exactly (id remap, viewport-centre offset, etc.).

	/** Save a snapshot of the given blocks as a named user component.
	 *  Deep-clones the blocks so subsequent canvas edits don't mutate the
	 *  saved entry. Returns the created component. */
	saveUserComponent(name: string, blocks: DesignBlock[]): UserComponent {
		this.recordGestureStart();
		const trimmed = name.trim() || 'Untitled Component';
		const cloned: DesignBlock[] = JSON.parse(JSON.stringify(blocks));
		const now = Date.now();
		const entry: UserComponent = {
			id: `usrcomp_${Math.random().toString(36).slice(2, 9)}_${now.toString(36)}`,
			name: trimmed,
			blocks: cloned,
			createdAt: now,
			updatedAt: now
		};
		this.userComponents = [...this.userComponents, entry];
		this.commitGesture();
		return entry;
	}

	deleteUserComponent(id: string): void {
		if (!this.userComponents.some((c: UserComponent) => c.id === id)) return;
		this.recordGestureStart();
		this.userComponents = this.userComponents.filter((c: UserComponent) => c.id !== id);
		this.commitGesture();
	}

	renameUserComponent(id: string, name: string): void {
		const trimmed = name.trim();
		const current = this.userComponents.find((c: UserComponent) => c.id === id);
		if (!trimmed || !current || current.name === trimmed) return;
		this.recordGestureStart();
		this.userComponents = this.userComponents.map((c: UserComponent) =>
			c.id === id ? { ...c, name: trimmed, updatedAt: Date.now() } : c
		);
		this.commitGesture();
	}

	duplicateUserComponent(id: string): UserComponent | undefined {
		const src = this.userComponents.find((c: UserComponent) => c.id === id);
		if (!src) return undefined;
		this.recordGestureStart();
		const now = Date.now();
		const copy: UserComponent = {
			id: `usrcomp_${Math.random().toString(36).slice(2, 9)}_${now.toString(36)}`,
			name: `${src.name} (copy)`,
			blocks: JSON.parse(JSON.stringify(src.blocks)),
			createdAt: now,
			updatedAt: now
		};
		this.userComponents = [...this.userComponents, copy];
		this.commitGesture();
		return copy;
	}

	/** Insert a saved user component into the canvas. Reuses
	 *  `insertTemplate`'s id-remap + offset logic so behaviour matches the
	 *  built-in templates. */
	insertUserComponent(
		id: string,
		options: { parentId?: string | null; target?: { x: number; y: number } } = {}
	): DesignBlock[] {
		const src = this.userComponents.find((c: UserComponent) => c.id === id);
		if (!src || src.blocks.length === 0) return [];
		const blocks = JSON.parse(JSON.stringify(src.blocks)) as DesignBlock[];
		return this.insertTemplate(blocks, options);
	}

	/** Create a single new block pre-styled with a layout primitive class
	 *  (e.g. `design-flexbox-column`, `design-grid design-grid-two`). The
	 *  block is appended to the scene at the viewport centre so the user can
	 *  immediately drag/inspect it. The class lives in
	 *  `_designblock.sass`; we stash it on `props.layoutClass` so the
	 *  canvas renderer can apply it via a `class={...}` binding, and so the
	 *  codegen round-trip can include it in the exported markup. */
	createBlockFromPrimitive(opts: {
		className: string;
		w?: number;
		h?: number;
		name?: string;
		x?: number;
		y?: number;
	}): DesignBlock {
		const w = opts.w ?? 240;
		const h = opts.h ?? 160;
		let targetAbs = { x: opts.x ?? 0, y: opts.y ?? 0 };
		const el =
			typeof document !== 'undefined'
				? document.querySelector('.design-viewport')
				: null;
		if (opts.x == null && opts.y == null && el) {
			const r = el.getBoundingClientRect();
			targetAbs = this.screenToCanvas(r.left + r.width / 2, r.top + r.height / 2);
		}
		const block: DesignBlock = {
			id: this.generateId(),
			type: 'frame',
			name: opts.name ?? 'Primitive',
			x: Math.round(targetAbs.x - w / 2),
			y: Math.round(targetAbs.y - h / 2),
			w,
			h,
			rotation: 0,
			props: { layoutClass: opts.className },
			// Layout primitives (flex/grid) are empty containers — without a
			// visible outline they render invisibly on the canvas. Give them a
			// dashed frame outline so they can be seen and selected.
			style: { border: '1px dashed #94a3b8' },
			parentId: null,
			children: []
		};
		this.recordGestureStart();
		this.items = [...this.items, block];
		this.selectedIds = [block.id];
		this.commitGesture();
		return block;
	}
}

// Per-type defaults for `createBlockAt`. Kept here (not in blockfactory.ts)
// because the canvas state owns the runtime and keeps the signature free of
// imports from a separate module. Mirrors BLOCK_DEFAULTS in blockfactory.ts —
// if you change one, change both.
function blockDefaultsFor(
	type: 'text' | 'card' | 'frame' | 'container' | 'image' | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'polygon' | 'star' | 'vector'
): {
	w: number;
	h: number;
	name: string;
	props: Record<string, unknown>;
	style: Record<string, string | number>;
} | null {
	switch (type) {
		case 'text':
			return { w: 200, h: 32, name: 'Text', props: { text: 'New Text Block' }, style: { padding: '4px' } };
		case 'card':
			return { w: 240, h: 140, name: 'Card', props: { description: '' }, style: { background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px' } };
		case 'frame':
			return { w: 360, h: 280, name: 'Frame', props: {}, style: { background: '#ffffff', border: '1px solid #cbd5e1', overflow: 'hidden' } };
		case 'container':
			return { w: 300, h: 300, name: 'Container', props: {}, style: { overflow: 'hidden', border: '2px dashed #cbd5e1' } };
		case 'image':
			return { w: 240, h: 160, name: 'Image', props: { src: '' }, style: { border: '1px solid #e2e8f0' } };
		case 'rectangle':
			return { w: 120, h: 80, name: 'Rectangle', props: {}, style: { background: '#e0e7ff', border: '2px solid #6366f1' } };
		case 'ellipse':
			return { w: 120, h: 80, name: 'Ellipse', props: {}, style: { background: '#e0e7ff', border: '2px solid #6366f1', 'border-radius': '50%' } };
		case 'line':
			return { w: 120, h: 4, name: 'Line', props: {}, style: { color: '#6366f1', stroke: '#6366f1' } };
		case 'arrow':
			return { w: 120, h: 4, name: 'Arrow', props: {}, style: { color: '#6366f1', stroke: '#6366f1' } };
		case 'polygon':
			return { w: 100, h: 100, name: 'Polygon', props: { sides: 6 }, style: { color: '#6366f1', stroke: '#6366f1' } };
		case 'star':
			return { w: 100, h: 100, name: 'Star', props: { points: 5 }, style: { color: '#6366f1', stroke: '#6366f1' } };
		case 'vector':
			return { w: 200, h: 200, name: 'Vector', props: { paths: [] }, style: { background: 'none', stroke: '#000000', strokeWidth: '1' } };
		default:
			return null;
	}
}

// 5. Export a single instance of the class
export const designcanvas = new CanvasState();

registerUndoDomain(compositeUndoDomain('design', [design.history, designcanvas.history, workspaceLayout.historyForUndo('design')], design.history));
