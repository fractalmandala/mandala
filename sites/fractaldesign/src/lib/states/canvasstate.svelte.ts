// src/lib/states/canvasstate.svelte.ts
import type { DesignBlock, ShapeType } from '$lib/utils/canvastypes';
import { htmlToBlocks } from '$lib/utils/codegen';

// Marker prefixed onto the OS clipboard when copying inside the tool, so a
// subsequent paste can tell "our blocks" apart from external HTML/CSS.
export const CLIPBOARD_MARKER = 'FRACTALDESIGN_BLOCKS::';

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

class CanvasState {
	// 1. Reactive state properties
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
			style: { background: '#ffffff', border: '1px solid #cbd5e1', 'border-radius': '12px', overflow: 'hidden' },
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
			style: { background: '#ffffff', border: '1px solid #e2e8f0', 'border-radius': '8px', padding: '16px' },
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
			props: { text: 'Welcome Back!', color: '#0066ff' },
			style: { 'font-size': '20px', 'font-weight': 'bold', padding: '4px' },
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
			style: { overflow: 'hidden', border: '2px dashed #cbd5e1', 'border-radius': '6px' },
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
			props: { src: '/images/logomotif.png' },
			style: { border: '1px solid #e2e8f0', 'border-radius': '4px' },
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
	} | null>(null);

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
	
	viewport = $state({
		x: 0,
		y: 0,
		zoom: 1
	});

	// --- Scene persistence (localStorage) ---
	private static STORAGE_KEY = 'fractaldesign:canvas-scene';
	private saveTimer: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		this.loadScene();
		this.setupPersistence();
	}

	private loadScene() {
		if (typeof localStorage === 'undefined') return;
		try {
			const raw = localStorage.getItem(CanvasState.STORAGE_KEY);
			if (!raw) return;
			const data = JSON.parse(raw);
			if (data && Array.isArray(data.items) && data.items.length > 0) {
				this.items = data.items;
				this.userGuides = Array.isArray(data.userGuides) ? data.userGuides : [];
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
				if (this.saveTimer) clearTimeout(this.saveTimer);
				this.saveTimer = setTimeout(() => {
					try {
						localStorage.setItem(CanvasState.STORAGE_KEY, snapshot);
					} catch {
						/* ignore quota / availability errors */
					}
				}, 300);
			});
		});
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
	}

	// 3. Helper: Coordinate Translation (Accounts for Sidebar & Header offsets)
	screenToCanvas(clientX: number, clientY: number) {
		const el = typeof document !== 'undefined' ? document.querySelector('.canvas-viewport') : null;
		const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0 };

		return {
			x: (clientX - rect.left - this.viewport.x) / this.viewport.zoom,
			y: (clientY - rect.top - this.viewport.y) / this.viewport.zoom
		};
	}

	snap(value: number) {
		return this.isSnapping ? Math.round(value / this.GRID_SIZE) * this.GRID_SIZE : value;
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

				for (const other of siblings) {
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

				for (const guide of this.userGuides) {
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

				for (const other of siblings) {
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

				for (const guide of this.userGuides) {
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

				this.activeGuides = guides;

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
			const viewport = typeof document !== 'undefined' ? document.querySelector('.canvas-viewport') : null;
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
			const rendered = this.getRenderedBlockIds();
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
			this.selectedIds = [item.id];
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

			const el = typeof document !== 'undefined' ? document.querySelector('.canvas-viewport') : null;
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
		const el = typeof document !== 'undefined' ? document.querySelector('.canvas-viewport') : null;
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

		const el = typeof document !== 'undefined' ? document.querySelector('.canvas-viewport') : null;
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

	getRenderedBlockIds(): string[] {
		const list: string[] = [];
		const addNode = (block: DesignBlock) => {
			list.push(block.id);
			if (block.children && block.children.length > 0 && !this.isCollapsed(block.id)) {
				for (const childId of block.children) {
					const child = this.items.find(b => b.id === childId);
					if (child && !child.hidden) {
						addNode(child);
					}
				}
			}
		};
		
		// Rendered order matches active layout root order
		const roots = this.items.filter(b => b.parentId === null);
		for (const root of roots) {
			if (!root.hidden) {
				addNode(root);
			}
		}
		return list;
	}

	groupSelected() {
		if (this.selectedIds.length === 0) return;

		this.recordGestureStart();

		// Calculate bounding box of all selected blocks in absolute canvas coordinates
		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;

		const selectedBlocks = this.items.filter(b => this.selectedIds.includes(b.id));

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
			name: 'Group',
			x: this.snap(groupX),
			y: this.snap(groupY),
			w: this.snap(groupW),
			h: this.snap(groupH),
			props: {},
			style: { background: 'transparent', border: '1px dashed var(--border-secondary)', overflow: 'visible' },
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
		
		const viewport = typeof document !== 'undefined' ? document.querySelector('.canvas-viewport') : null;
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
		
		const viewport = typeof document !== 'undefined' ? document.querySelector('.canvas-viewport') : null;
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
		this.recordGestureStart();
		const point = this.screenToCanvas(screenX, screenY);
		
		let defaultStyle: Record<string, string> = {};
		let defaultW = 200;
		let defaultH = 120;
		let defaultProps: Record<string, unknown> = {};

		if (type === 'frame') {
			defaultStyle = { background: '#ffffff', border: '1px solid #cbd5e1', 'border-radius': '12px', overflow: 'hidden' };
			defaultW = 300; defaultH = 300;
		} else if (type === 'container') {
			defaultStyle = { overflow: 'hidden', border: '2px dashed #cbd5e1', 'border-radius': '6px' };
			defaultW = 300; defaultH = 300;
		} else if (type === 'card') {
			defaultStyle = { background: '#ffffff', border: '1px solid #e2e8f0', 'border-radius': '8px', padding: '16px' };
		} else if (type === 'image') {
			defaultStyle = { border: '1px solid #e2e8f0', 'border-radius': '4px' };
		} else if (type === 'text') {
			defaultStyle = { padding: '4px' };
			defaultProps = { text: 'New Text Block' };
		} else if (type === 'rectangle') {
			defaultStyle = { background: '#e0e7ff', border: '2px solid #6366f1', 'border-radius': '4px' };
			defaultW = 120; defaultH = 80;
		} else if (type === 'ellipse') {
			defaultStyle = { background: '#e0e7ff', border: '2px solid #6366f1', 'border-radius': '50%' };
			defaultW = 120; defaultH = 80;
		} else if (type === 'line') {
			defaultStyle = { color: '#6366f1', stroke: '#6366f1' };
			defaultW = 120; defaultH = 4;
		} else if (type === 'arrow') {
			defaultStyle = { color: '#6366f1', stroke: '#6366f1' };
			defaultW = 120; defaultH = 4;
		} else if (type === 'polygon') {
			defaultStyle = { color: '#6366f1', stroke: '#6366f1' };
			defaultW = 100; defaultH = 100;
			defaultProps = { sides: 6 };
		} else if (type === 'star') {
			defaultStyle = { color: '#6366f1', stroke: '#6366f1' };
			defaultW = 100; defaultH = 100;
			defaultProps = { points: 5 };
		}

		const newBlock: DesignBlock = {
			id: this.generateId(),
			type,
			name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
			x: this.snap(point.x),
			y: this.snap(point.y),
			w: defaultW,
			h: defaultH,
			props: defaultProps,
			style: defaultStyle,
			parentId: null,
			rotation: 0,
			children: []
		};
		
		this.items = [...this.items, newBlock];
		this.selectedId = newBlock.id;
		this.commitGesture();
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
			defaultStyle['border-radius'] = '12px';
			defaultStyle.overflow = 'hidden';
		} else if (type === 'text') {
			defaultStyle.padding = '4px';
			defaultProps.text = '';
		} else if (type === 'rectangle') {
			defaultStyle.background = '#e0e7ff';
			defaultStyle.border = '2px solid #6366f1';
			defaultStyle['border-radius'] = '4px';
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

	pasteBlock(targetParentId: string | null) {
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

			// Remap parentId and children references, and update absolute positions for pasted root
			for (const block of subtree) {
				const oldId = block.id;
				const newId = idMap.get(oldId)!;
				
				block.id = newId;
				block.children = block.children.map(cid => idMap.get(cid)!);

				const isRootOfPaste = !block.parentId || !idMap.has(block.parentId);
				
				if (isRootOfPaste) {
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
					} else {
						// Offset position slightly to distinguish copy from paste
						block.x += 24;
						block.y += 24;
					}
				} else {
					block.parentId = idMap.get(block.parentId!)!;
				}

				pastedBlocks.push(block);
			}

			this.recordGestureStart();

			// Append new blocks to items
			this.items = [...this.items, ...pastedBlocks];

			// Wire new root block ID into target parent's children array
			const rootBlock = pastedBlocks.find(b => b.parentId === targetParentId);
			if (rootBlock && targetParentId) {
				const parent = this.items.find(p => p.id === targetParentId);
				if (parent) {
					parent.children = [...parent.children, rootBlock.id];
				}
			}

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

	// --- Import / clipboard-driven creation ---
	private viewportCenterCanvas() {
		const el = typeof document !== 'undefined' ? document.querySelector('.canvas-viewport') : null;
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
			style: { 'border-radius': '4px' },
			parentId: null,
			children: []
		};
		this.recordGestureStart();
		this.items = [...this.items, block];
		this.selectedId = block.id;
		this.commitGesture();
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

	private undoStack = $state<string[]>([]);
	private redoStack = $state<string[]>([]);
	private gestureStartSnapshot: string | null = null;

	private getSnapshot(): string {
		return JSON.stringify({
			items: this.items,
			userGuides: this.userGuides
		});
	}

	private restoreSnapshot(snapshot: string) {
		try {
			const data = JSON.parse(snapshot);
			if (data && typeof data === 'object' && 'items' in data) {
				this.items = data.items;
				this.userGuides = data.userGuides || [];
			} else {
				this.items = data;
				this.userGuides = [];
			}
		} catch (e) {
			console.error('Failed to restore snapshot:', e);
		}
	}

	recordGestureStart() {
		this.gestureStartSnapshot = this.getSnapshot();
	}

	commitGesture() {
		if (!this.gestureStartSnapshot) return;
		const currentSnapshot = this.getSnapshot();
		
		// Only push to undo stack if something actually changed!
		if (currentSnapshot !== this.gestureStartSnapshot) {
			this.undoStack.push(this.gestureStartSnapshot);
			
			// Cap the history stack size at 100 steps
			if (this.undoStack.length > 100) {
				this.undoStack.shift();
			}
			
			// Any new action clears the redo history
			this.redoStack = [];
		}
		
		this.gestureStartSnapshot = null;
	}

	undo() {
		const previous = this.undoStack.pop();
		if (!previous) return; // nothing to undo
		// Save current state to redo stack
		this.redoStack.push(this.getSnapshot());
		
		// Restore previous state
		this.restoreSnapshot(previous);
		this.selectedId = null; // Clear selection to avoid offset mismatches
	}

	redo() {
		const next = this.redoStack.pop();
		if (!next) return; // nothing to redo
		// Save current state to undo stack
		this.undoStack.push(this.getSnapshot());
		
		// Restore next state
		this.restoreSnapshot(next);
		this.selectedId = null;
	}

	get canUndo(): boolean {
		return this.undoStack.length > 0;
	}
	get canRedo(): boolean {
		return this.redoStack.length > 0;
	}
}

// 5. Export a single instance of the class
export const canvas = new CanvasState();