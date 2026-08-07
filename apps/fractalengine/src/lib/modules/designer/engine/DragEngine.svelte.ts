/**
 * DragEngine.ts
 *
 * A self-contained drag engine:
 * pointer capture, delta calculation, snap-to-grid, and edge snapping
 * against sibling items.
 *
 * Plain TypeScript — no framework dependency.
 *
 * Usage:
 *   const drag = new DragEngine({ gridSize: 24 });
 *   // In your pointerdown handler:
 *   drag.onPointerDown(event, item);
 *   // Wire to pointermove / pointerup:
 *   canvas.addEventListener('pointermove', (e) => drag.onPointerMove(e));
 *   canvas.addEventListener('pointerup', (e) => drag.onPointerUp(e));
 *
 *   // Read drag state:
 *   drag.active         // boolean
 *   drag.deltaX / drag.deltaY
 *   drag.currentGuides  // SnapGuide[] for rendering guide lines
 */

import { CanvasViewport } from './CanvasViewport.svelte.js';

export type DragItem = {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	parentId: string | null;
};

export type SnapGuide = {
	position: number; // canvas-space coordinate of the guide line
	orientation: 'horizontal' | 'vertical';
};

export type DragEngineOptions = {
	/** Grid size in canvas pixels (default 24). Set to 0 to disable grid snapping. */
	gridSize?: number;
	/** Proximity threshold for edge snapping in screen pixels (default 5). */
	snapThreshold?: number;
	/** Whether object/edge snapping (align to sibling edges) is enabled (default true). */
	snapping?: boolean;
	/** Whether free-drag positions quantize to the grid (default false, Figma-style).
	 *  Kept independent of `snapping` so object-snap can stay on while drag stays
	 *  pixel-fluid. */
	snapToGrid?: boolean;
};

export class DragEngine {
	// ── Configuration ───────────────────────────────────────────────────────
	gridSize: number;
	snapThreshold: number;
	/** Object/edge snapping (align to sibling edges). */
	isSnapping: boolean;
	/** Grid quantization of free-drag positions. Independent of `isSnapping`. */
	snapToGrid: boolean;

	// ── Public state ────────────────────────────────────────────────────────
	/** The currently dragged item's id, or null if no drag is active. */
	id: string | null = null;

	/** The delta (in canvas units) from the start position to the current
	 *  pointer position. Only valid while a drag is active. */
	deltaX = 0;
	deltaY = 0;

	/** When edge snapping is active, the current snap guide lines to render.
	 *  The consumer should render visual guide lines at these positions. */
	currentGuides: SnapGuide[] = [];

	// ── Internal drag state (pointer tracking) ─────────────────────────────
	private _startPointerX = 0;
	private _startPointerY = 0;
	private _startItemX = 0;
	private _startItemY = 0;
	private _item: DragItem | null = null;
	/** Sibling items to snap against. The consumer should update these on
	 *  each pointer move if the items array changes. */
	private _siblings: DragItem[] = [];
	/** The viewport reference for converting screen↔canvas coordinates. */
	private _viewport: CanvasViewport | null = null;
	/** Pointer capture element (set during onPointerDown). */
	private _captureEl: EventTarget | null = null;

	constructor(options: DragEngineOptions = {}) {
		this.gridSize = options.gridSize ?? 24;
		this.snapThreshold = options.snapThreshold ?? 5;
		this.isSnapping = options.snapping ?? true;
		this.snapToGrid = options.snapToGrid ?? false;
	}

	/** Connect a CanvasViewport so coordinate transforms work. If not set,
	 *  the engine assumes screen and canvas coordinates are identical. */
	set viewport(vp: CanvasViewport | null) {
		this._viewport = vp;
	}

	get viewport(): CanvasViewport | null {
		return this._viewport;
	}

	/** Set the sibling items used for edge snapping. */
	set siblings(items: DragItem[]) {
		this._siblings = items;
	}

	get siblings(): DragItem[] {
		return this._siblings;
	}

	/** Whether a drag gesture is currently in progress. */
	get active(): boolean {
		return this.id !== null;
	}

	// ── Coordinate helpers ──────────────────────────────────────────────────

	/** Convert clientX/clientY to canvas-space. Uses the connected viewport
	 *  if available, otherwise identity transform. */
	toCanvas(clientX: number, clientY: number): { x: number; y: number } {
		if (this._viewport) {
			return this._viewport.screenToCanvas(clientX, clientY);
		}
		return { x: clientX, y: clientY };
	}

	/** Snap a value to the grid. Returns integer pixels when grid snapping is off. */
	snap(value: number): number {
		if (!this.snapToGrid || this.gridSize <= 0) return Math.round(value);
		return Math.round(value / this.gridSize) * this.gridSize;
	}

	// ── Drag lifecycle ──────────────────────────────────────────────────────

	/** Begin a drag. Call from your item's pointerdown handler.
	 *  Automatically captures the pointer on the event target.
	 *  @param event The PointerEvent.
	 *  @param item The item being dragged (its x/y will be mutated). */
	onPointerDown(event: PointerEvent, item: DragItem) {
		this.id = item.id;
		this._item = item;
		this._captureEl = event.currentTarget ?? null;
		// Snapshot the viewport offset so per-move screenToCanvas doesn't force a
		// layout flush every frame (getBoundingClientRect reflows the page).
		this._viewport?.beginGestureRectCache();

		try {
			(event.currentTarget as HTMLElement)?.setPointerCapture(event.pointerId);
		} catch {
			/* pointer not capturable */
		}

		const point = this.toCanvas(event.clientX, event.clientY);
		this._startPointerX = point.x;
		this._startPointerY = point.y;
		this._startItemX = item.x;
		this._startItemY = item.y;
		this.deltaX = 0;
		this.deltaY = 0;
		this.currentGuides = [];
	}

	/** Continue a drag. Call from your pointermove handler. */
	onPointerMove(event: PointerEvent) {
		if (!this._item) return;

		const point = this.toCanvas(event.clientX, event.clientY);
		const dx = point.x - this._startPointerX;
		const dy = point.y - this._startPointerY;
		this.deltaX = dx;
		this.deltaY = dy;

		const item = this._item;
		let targetX = this._startItemX + dx;
		let targetY = this._startItemY + dy;

		// ── Edge snapping ── (object/edge snap, independent of grid snap)
		if (this.isSnapping) {
			const T = Math.min(this.snapThreshold, this.snapThreshold / (this._viewport?.zoom ?? 1));

			let snapX: number | null = null;
			let snapY: number | null = null;
			let bestDiffX = T;
			let bestDiffY = T;

			const itemLeft = targetX;
			const itemCenter = targetX + item.w / 2;
			const itemRight = targetX + item.w;
			const itemTop = targetY;
			const itemMiddle = targetY + item.h / 2;
			const itemBottom = targetY + item.h;

			const guides: SnapGuide[] = [];

			for (const other of this._siblings) {
				if (other.id === item.id) continue;

				const oL = other.x;
				const oC = other.x + other.w / 2;
				const oR = other.x + other.w;

				// Horizontal alignment candidates
				const hCandidates = [
					{ itemVal: itemLeft, otherVal: oL },
					{ itemVal: itemLeft, otherVal: oC },
					{ itemVal: itemLeft, otherVal: oR },
					{ itemVal: itemCenter, otherVal: oL },
					{ itemVal: itemCenter, otherVal: oC },
					{ itemVal: itemCenter, otherVal: oR },
					{ itemVal: itemRight, otherVal: oL },
					{ itemVal: itemRight, otherVal: oC },
					{ itemVal: itemRight, otherVal: oR },
				];

				for (const c of hCandidates) {
					const diff = Math.abs(c.itemVal - c.otherVal);
					if (diff < bestDiffX) {
						bestDiffX = diff;
						snapX = c.otherVal;
					}
				}

				const oT = other.y;
				const oM = other.y + other.h / 2;
				const oB = other.y + other.h;

				const vCandidates = [
					{ itemVal: itemTop, otherVal: oT },
					{ itemVal: itemTop, otherVal: oM },
					{ itemVal: itemTop, otherVal: oB },
					{ itemVal: itemMiddle, otherVal: oT },
					{ itemVal: itemMiddle, otherVal: oM },
					{ itemVal: itemMiddle, otherVal: oB },
					{ itemVal: itemBottom, otherVal: oT },
					{ itemVal: itemBottom, otherVal: oM },
					{ itemVal: itemBottom, otherVal: oB },
				];

				for (const c of vCandidates) {
					const diff = Math.abs(c.itemVal - c.otherVal);
					if (diff < bestDiffY) {
						bestDiffY = diff;
						snapY = c.otherVal;
					}
				}
			}

			if (snapX !== null) {
				item.x = snapX;
				guides.push({
					position: snapX,
					orientation: 'vertical'
				});
			} else {
				item.x = this.snap(targetX);
			}

			if (snapY !== null) {
				item.y = snapY;
				guides.push({
					position: snapY,
					orientation: 'horizontal'
				});
			} else {
				item.y = this.snap(targetY);
			}

			this.currentGuides = guides;

			// Update deltas to reflect snapping (so multi-drag sibling
			// offsets stay consistent).
			this.deltaX = item.x - this._startItemX;
			this.deltaY = item.y - this._startItemY;
		} else {
			item.x = this.snap(targetX);
			item.y = this.snap(targetY);
			this.currentGuides = [];
		}
	}

	/** End a drag. Call from your pointerup handler. */
	onPointerUp(_event: PointerEvent) {
		this._viewport?.endGestureRectCache();
		if (this._captureEl) {
			try {
				(this._captureEl as HTMLElement).releasePointerCapture(
					(_event as PointerEvent).pointerId
				);
			} catch {
				/* ignore */
			}
		}
		this.id = null;
		this._item = null;
		this._captureEl = null;
		this.currentGuides = [];
	}

	/** Cancel the current drag without committing (snap back). */
	cancel() {
		this._viewport?.endGestureRectCache();
		if (this._item) {
			this._item.x = this._startItemX;
			this._item.y = this._startItemY;
		}
		this.id = null;
		this._item = null;
		this._captureEl = null;
		this.deltaX = 0;
		this.deltaY = 0;
		this.currentGuides = [];
	}
}
