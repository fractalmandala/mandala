/**
 * ResizeEngine.ts
 *
 * A self-contained resize engine:
 * 8-handle hit-testing, aspect-ratio lock (Shift), min-size constraints,
 * and symmetric resize (Alt/Option).
 *
 * Plain TypeScript — no framework dependency.
 *
 * Usage:
 *   const resize = new ResizeEngine({ minSize: 20 });
 *   // In your resize-handle pointerdown:
 *   resize.onPointerDown(event, block, 'se');
 *   // Wire to pointermove / pointerup:
 *   canvas.addEventListener('pointermove', (e) => resize.onPointerMove(e));
 *   canvas.addEventListener('pointerup', (e) => resize.onPointerUp(e));
 *
 *   // Check if resize is active:
 *   resize.active  // boolean
 *   resize.handle  // current handle being dragged, or null
 */

import { CanvasViewport } from './CanvasViewport.svelte.js';

/** The 8 cardinal resize handles. */
export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

/** A resizable item. The engine mutates x/y/w/h in place. */
export type ResizeItem = {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
};

export type ResizeEngineOptions = {
	/** Minimum width/height in canvas pixels (default 20). */
	minSize?: number;
	/** Persisted proportion-lock preference. Shift remains a temporary override. */
	constrainProportions?: boolean;
};

export class ResizeEngine {
	// ── Configuration ───────────────────────────────────────────────────────
	minSize: number;
	constrainProportions: boolean;

	// ── Public state ────────────────────────────────────────────────────────
	/** The id of the item being resized, or null. */
	id: string | null = null;
	/** The active resize handle, or null. */
	handle: ResizeHandle | null = null;

	// ── Internal resize state ───────────────────────────────────────────────
	private _item: ResizeItem | null = null;
	private _startPointerX = 0;
	private _startPointerY = 0;
	private _startX = 0;
	private _startY = 0;
	private _startW = 0;
	private _startH = 0;
	private _viewport: CanvasViewport | null = null;
	private _captureEl: EventTarget | null = null;

	constructor(options: ResizeEngineOptions = {}) {
		this.minSize = options.minSize ?? 20;
		this.constrainProportions = options.constrainProportions ?? false;
	}

	/** Connect a CanvasViewport for coordinate transforms. */
	set viewport(vp: CanvasViewport | null) {
		this._viewport = vp;
	}

	get viewport(): CanvasViewport | null {
		return this._viewport;
	}

	/** Whether a resize gesture is in progress. */
	get active(): boolean {
		return this.id !== null;
	}

	private toCanvas(clientX: number, clientY: number): { x: number; y: number } {
		if (this._viewport) {
			return this._viewport.screenToCanvas(clientX, clientY);
		}
		return { x: clientX, y: clientY };
	}

	// ── Resize lifecycle ────────────────────────────────────────────────────

	/** Begin a resize. Call from a resize handle's pointerdown handler.
	 *  @param event The PointerEvent.
	 *  @param item The item being resized (mutated in place during move).
	 *  @param handle The handle being dragged (e.g. 'se', 'nw'). */
	onPointerDown(event: PointerEvent, item: ResizeItem, handle: ResizeHandle) {
		this.id = item.id;
		this.handle = handle;
		this._item = item;
		this._captureEl = event.currentTarget ?? null;

		try {
			(event.currentTarget as HTMLElement)?.setPointerCapture(event.pointerId);
		} catch {
			/* pointer not capturable */
		}

		const point = this.toCanvas(event.clientX, event.clientY);
		this._startPointerX = point.x;
		this._startPointerY = point.y;
		this._startX = item.x;
		this._startY = item.y;
		this._startW = item.w;
		this._startH = item.h;
	}

	/** Continue a resize. Call from pointermove.
	 *  @param shiftKey Whether Shift is held (aspect-ratio lock).
	 *  @param altKey Whether Alt/Option is held (symmetric resize). */
	onPointerMove(event: PointerEvent) {
		if (!this._item) return;

		const point = this.toCanvas(event.clientX, event.clientY);
		const dx = point.x - this._startPointerX;
		const dy = point.y - this._startPointerY;
		const h = this.handle!;
		const onLeft = h.includes('w');
		const onRight = h.includes('e');
		const onTop = h.includes('n');
		const onBottom = h.includes('s');
		const MIN = this.minSize;

		const item = this._item;
		let newW = this._startW;
		let newH = this._startH;

		if (onLeft) newW = this._startW - dx;
		if (onRight) newW = this._startW + dx;
		if (onTop) newH = this._startH - dy;
		if (onBottom) newH = this._startH + dy;

		// Shift = keep aspect ratio
		if (event.shiftKey || this.constrainProportions) {
			const ratio = this._startW / this._startH;
			if ((onLeft || onRight) && (onTop || onBottom)) {
				// Corner handle: whichever axis changed more determines the
				// scale factor.
				if (Math.abs(newW - this._startW) > Math.abs(newH - this._startH) * ratio) {
					newH = newW / ratio;
				} else {
					newW = newH * ratio;
				}
			} else if (onLeft || onRight) {
				newH = newW / ratio;
			} else if (onTop || onBottom) {
				newW = newH * ratio;
			}
		}

		newW = Math.max(MIN, newW);
		newH = Math.max(MIN, newH);

		let newX = this._startX;
		let newY = this._startY;

		if (event.altKey) {
			// Symmetric resize about the original center
			newX = this._startX + this._startW / 2 - newW / 2;
			newY = this._startY + this._startH / 2 - newH / 2;
		} else {
			if (onLeft) newX = this._startX + (this._startW - newW);
			if (onTop) newY = this._startY + (this._startH - newH);
		}

		item.x = newX;
		item.y = newY;
		item.w = newW;
		item.h = newH;
	}

	/** End a resize. Call from pointerup. */
	onPointerUp(_event: PointerEvent) {
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
		this.handle = null;
		this._item = null;
		this._captureEl = null;
	}

	/** Cancel the current resize, reverting the item to its start dimensions. */
	cancel() {
		if (this._item) {
			this._item.x = this._startX;
			this._item.y = this._startY;
			this._item.w = this._startW;
			this._item.h = this._startH;
		}
		this.id = null;
		this.handle = null;
		this._item = null;
		this._captureEl = null;
	}

	// ── Hit-testing (static helpers) ────────────────────────────────────────

	/** Given an item's bounding rect in screen space and a screen point,
	 *  return which resize handle (if any) the point is over.
	 *  Handles are rendered as 8px squares at the corners and midpoints
	 *  (with edge handles being thinner). Returns null if the point is
	 *  outside all handle hit areas.
	 *
	 *  @param rect The item's screen-space bounding box { x, y, w, h }.
	 *  @param px Screen x-coordinate (clientX).
	 *  @param py Screen y-coordinate (clientY).
	 *  @param handleSize Corner handle size in px (default 10).
	 *  @param edgeHandleSize Edge handle size in px (default 10). */
	static hitTest(
		rect: { x: number; y: number; w: number; h: number },
		px: number,
		py: number,
		handleSize = 10,
		edgeHandleSize = 10
	): ResizeHandle | null {
		const halfCorner = handleSize / 2;
		const halfEdge = edgeHandleSize / 2;

		const corners: Record<string, { cx: number; cy: number }> = {
			nw: { cx: rect.x, cy: rect.y },
			ne: { cx: rect.x + rect.w, cy: rect.y },
			se: { cx: rect.x + rect.w, cy: rect.y + rect.h },
			sw: { cx: rect.x, cy: rect.y + rect.h }
		};

		// Check corners first (smaller hit area, higher priority)
		for (const [name, c] of Object.entries(corners)) {
			if (
				px >= c.cx - halfCorner &&
				px <= c.cx + halfCorner &&
				py >= c.cy - halfCorner &&
				py <= c.cy + halfCorner
			) {
				return name as ResizeHandle;
			}
		}

		// Check edges
		const edges: { name: ResizeHandle; x: number; y: number }[] = [
			{ name: 'n', x: rect.x + rect.w / 2, y: rect.y },
			{ name: 's', x: rect.x + rect.w / 2, y: rect.y + rect.h },
			{ name: 'e', x: rect.x + rect.w, y: rect.y + rect.h / 2 },
			{ name: 'w', x: rect.x, y: rect.y + rect.h / 2 }
		];

		for (const e of edges) {
			if (
				px >= e.x - halfEdge &&
				px <= e.x + halfEdge &&
				py >= e.y - halfEdge &&
				py <= e.y + halfEdge
			) {
				return e.name;
			}
		}

		return null;
	}

	/** Return the CSS cursor name for a given resize handle. */
	static cursorForHandle(handle: ResizeHandle): string {
		switch (handle) {
			case 'nw': return 'nw-resize';
			case 'n': return 'n-resize';
			case 'ne': return 'ne-resize';
			case 'e': return 'e-resize';
			case 'se': return 'se-resize';
			case 's': return 's-resize';
			case 'sw': return 'sw-resize';
			case 'w': return 'w-resize';
		}
	}
}
