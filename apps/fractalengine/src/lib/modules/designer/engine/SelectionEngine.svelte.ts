/**
 * SelectionEngine.ts
 *
 * A self-contained selection engine:
 * click-to-select, Shift multi-select, marquee rectangle selection,
 * and deselect on empty canvas click.
 *
 * Plain TypeScript — no framework dependency.
 *
 * Usage:
 *   const sel = new SelectionEngine();
 *   // Wire canvas pointer events:
 *   canvas.onpointerdown = (e) => sel.onCanvasPointerDown(e, items, getAbsPos);
 *   canvas.onpointermove = (e) => sel.onPointerMove(e, items, getAbsPos);
 *   canvas.onpointerup = (e) => sel.onPointerUp(e);
 *   canvas.onpointerdown = (e) => sel.onItemPointerDown(e, item);
 *
 *   // Read selection state:
 *   sel.selectedIds       // string[]
 *   sel.marquee           // { x0,y0,x1,y1,base } or null
 *   sel.lastSelectedId    // last clicked item id
 */

import { CanvasViewport } from './CanvasViewport.svelte.js';

/** A selectable item. */
export type SelectableItem = {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	/** If true, the item cannot be selected. */
	locked?: boolean;
	/** If true, the item is hidden and should be skipped. */
	hidden?: boolean;
	/** Parent reference for hierarchy filtering. */
	parentId: string | null;
};

export type MarqueeState = {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
	/** Existing selection before the marquee started (for additive mode). */
	base: string[];
};

export type SelectionEngineOptions = {
	/** If true, clicking an already-selected item does not deselect it.
	 *  Default false (clicking selected deselects others). */
	preserveOnReselect?: boolean;
};

export class SelectionEngine {
	// ── Configuration ───────────────────────────────────────────────────────
	preserveOnReselect: boolean;

	// ── Public state ────────────────────────────────────────────────────────
	// $state — this class is instantiated as a plain `new SelectionEngine()`
	// (not itself wrapped in $state), and the marquee box / selection are
	// rendered directly from these fields, so they must be reactive here.
	/** Currently selected item ids (ordered, most-recent first). */
	selectedIds: string[] = $state([]);
	/** Active marquee rectangle, or null. */
	marquee: MarqueeState | null = $state(null);

	/** The id of the most recently clicked / selected item. */
	get lastSelectedId(): string | null {
		return this.selectedIds.length > 0 ? this.selectedIds[0] : null;
	}
	set lastSelectedId(val: string | null) {
		if (val) {
			// Insert at front; remove any duplicate
			const idx = this.selectedIds.indexOf(val);
			if (idx === 0) return; // already first
			const ids = this.selectedIds.filter((id) => id !== val);
			ids.unshift(val);
			this.selectedIds = ids;
		} else {
			this.selectedIds = [];
		}
	}

	// ── Internal state ──────────────────────────────────────────────────────
	private _marqueePointer = { x: 0, y: 0 };
	private _viewport: CanvasViewport | null = null;
	private _captureEl: EventTarget | null = null;

	constructor(options: SelectionEngineOptions = {}) {
		this.preserveOnReselect = options.preserveOnReselect ?? false;
	}

	/** Connect a CanvasViewport for coordinate transforms. */
	set viewport(vp: CanvasViewport | null) {
		this._viewport = vp;
	}

	get viewport(): CanvasViewport | null {
		return this._viewport;
	}

	/** Whether a marquee gesture is in progress. */
	get hasMarquee(): boolean {
		return this.marquee !== null;
	}

	/** Clear the entire selection. */
	clear() {
		this.selectedIds = [];
	}

	/** Select a single item by id, replacing the current selection. */
	select(id: string) {
		this.selectedIds = [id];
	}

	/** Add an id to the selection. */
	add(id: string) {
		if (!this.selectedIds.includes(id)) {
			this.selectedIds = [...this.selectedIds, id];
		}
	}

	/** Remove an id from the selection. */
	remove(id: string) {
		this.selectedIds = this.selectedIds.filter((sid) => sid !== id);
	}

	/** Check if an id is selected. */
	isSelected(id: string): boolean {
		return this.selectedIds.includes(id);
	}

	/** Toggle an id in/out of the selection. */
	toggle(id: string) {
		if (this.selectedIds.includes(id)) {
			this.remove(id);
		} else {
			this.add(id);
		}
	}

	// ── Coordinate helpers ──────────────────────────────────────────────────

	private toCanvas(clientX: number, clientY: number): { x: number; y: number } {
		if (this._viewport) {
			return this._viewport.screenToCanvas(clientX, clientY);
		}
		return { x: clientX, y: clientY };
	}

	// ── Pointer handlers ────────────────────────────────────────────────────

	/** Call from your item's pointerdown handler to select it.
	 *  Handles click-to-select and Shift multi-select.
	 *  @returns true if the event was handled (selection changed). */
	onItemPointerDown(event: PointerEvent, item: SelectableItem): boolean {
		if (item.locked || item.hidden) return false;
		if (event.button !== 0) return false;

		event.stopPropagation();

		if (event.shiftKey) {
			// Shift-click: toggle the item in/out of the selection.
			this.toggle(item.id);
		} else {
			if (this.selectedIds.includes(item.id) && this.preserveOnReselect) {
				// Already selected; keep selection as-is.
			} else {
				this.selectedIds = [item.id];
			}
		}

		return true;
	}

	/** Call from your canvas/viewport pointerdown handler to start a marquee
	 *  or deselect on empty area click.
	 *  @param event The PointerEvent.
	 *  @param additive Whether the marquee is additive (Shift-held). */
	onCanvasPointerDown(event: PointerEvent, additive = false) {
		if (event.button !== 0) return;

		this._captureEl = event.currentTarget ?? null;
		try {
			(event.currentTarget as HTMLElement)?.setPointerCapture(event.pointerId);
		} catch {
			/* pointer not capturable */
		}

		if (!additive) {
			this.selectedIds = [];
		}

		const point = this.toCanvas(event.clientX, event.clientY);
		this._marqueePointer = { x: point.x, y: point.y };
		this.marquee = {
			x0: point.x,
			y0: point.y,
			x1: point.x,
			y1: point.y,
			base: additive ? [...this.selectedIds] : []
		};
	}

	/** Call from your pointermove handler. Updates the marquee rect and
	 *  selects items whose axis-aligned bounding boxes intersect the rect.
	 *  @param items The full list of selectable items (used for hit-testing).
	 *  @param getAbsPos A function that returns the absolute canvas-space
	 *         position of an item (important for nested/hierarchical layouts). */
	onPointerMove(
		event: PointerEvent,
		items: SelectableItem[],
		getAbsPos?: (item: SelectableItem) => { x: number; y: number }
	) {
		if (!this.marquee) return;

		const point = this.toCanvas(event.clientX, event.clientY);
		this.marquee.x1 = point.x;
		this.marquee.y1 = point.y;

		const rx0 = Math.min(this.marquee.x0, this.marquee.x1);
		const ry0 = Math.min(this.marquee.y0, this.marquee.y1);
		const rx1 = Math.max(this.marquee.x0, this.marquee.x1);
		const ry1 = Math.max(this.marquee.y0, this.marquee.y1);

		const hits: string[] = [];
		for (const b of items) {
			if (b.hidden || b.locked) continue;
			if (b.parentId !== null) continue; // top-level only for marquee
			const a = getAbsPos ? getAbsPos(b) : b;
			if (a.x < rx1 && a.x + b.w > rx0 && a.y < ry1 && a.y + b.h > ry0) {
				hits.push(b.id);
			}
		}

		this.selectedIds = [...new Set([...this.marquee.base, ...hits])];
	}

	/** Call from your pointerup handler. Ends the marquee. */
	onPointerUp(_event?: PointerEvent) {
		if (this._captureEl && _event) {
			try {
				(this._captureEl as HTMLElement).releasePointerCapture(
					(_event as PointerEvent).pointerId
				);
			} catch {
				/* ignore */
			}
		}
		this.marquee = null;
		this._captureEl = null;
	}

	/** Cancel any in-progress marquee without changing the selection. */
	cancelMarquee() {
		this.marquee = null;
	}
}
